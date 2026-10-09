//! Génère les données Rust à partir de `data/` (source unique, aussi lue par
//! l'API Node et l'app iOS) : le catalogue (`teas.json`), les conseils
//! d'infusion (`brewing.json`) et le glossaire (`glossary.json`) deviennent des
//! `static` — aucun parsing JSON dans le navigateur, et une donnée invalide
//! fait échouer la compilation au lieu de casser l'app en production.

use serde_json::Value;
use std::collections::HashSet;
use std::fmt::Write as _;
use std::{env, fs, path::Path};

const FAMILIES: [&str; 8] = [
    "Jaune", "Ambre", "Rouge", "Rose", "Violet", "Bleu", "Vert", "Coffret",
];
const TYPES: [&str; 10] = [
    "blackTea",
    "blackTeaFlavored",
    "blackTeaSpiced",
    "greenTea",
    "greenTeaFlavored",
    "whiteTea",
    "rooibos",
    "infusion",
    "infusionFruity",
    "coffret",
];

fn main() {
    println!("cargo:rerun-if-changed=data/teas.json");
    let raw = fs::read_to_string("data/teas.json").expect("data/teas.json introuvable");
    let root: Value = serde_json::from_str(&raw).expect("data/teas.json : JSON invalide");
    let teas = root["teas"]
        .as_array()
        .expect("data/teas.json : tableau `teas` manquant");

    let count = root["count"]
        .as_u64()
        .expect("data/teas.json : `count` manquant");
    assert_eq!(
        count as usize,
        teas.len(),
        "data/teas.json : `count` ({count}) ≠ nombre de sachets ({}) — mets-le à jour",
        teas.len()
    );

    let mut ids = HashSet::new();
    let mut out = String::from("pub static TEAS: &[Tea] = &[\n");
    for tea in teas {
        let id = str_field(tea, "id", "?");
        assert!(ids.insert(id.to_owned()), "identifiant en double : {id}");

        let family = str_field(tea, "family", id);
        assert!(
            FAMILIES.contains(&family),
            "{id} : famille inconnue « {family} »"
        );
        let type_key = str_field(tea, "typeKey", id);
        assert!(
            TYPES.contains(&type_key),
            "{id} : typeKey inconnu « {type_key} »"
        );

        let colors = tea["colors"].as_array().expect("colors");
        assert_eq!(colors.len(), 2, "{id} : `colors` doit contenir 2 couleurs");
        let colors: Vec<&str> = colors.iter().map(|c| hex(c.as_str(), id)).collect();
        let ink = hex(tea["ink"].as_str(), id);

        let coffret = flag(tea, "coffret");
        let intensity = tea["intensity"].as_u64().unwrap_or(0);
        assert!(intensity <= 5, "{id} : intensité hors de 0–5");
        assert!(
            coffret || intensity >= 1,
            "{id} : intensité 1–5 obligatoire (0 réservé aux coffrets)"
        );
        let ingredients = match &tea["ingredients"] {
            Value::Null => "None".to_owned(),
            v => format!("Some({})", localized(v, id)),
        };
        assert!(
            coffret || ingredients != "None",
            "{id} : ingrédients obligatoires (null réservé aux coffrets)"
        );

        writeln!(
            out,
            "    Tea {{ id: {id:?}, name: {name}, description: {desc}, type_key: TypeKey::{ty}, \
             family: Family::{family}, colors: [{c0:?}, {c1:?}], ink: {ink:?}, \
             caffeine_free: {cf}, pyramid: {py}, cold_brew: {cb}, coffret: {coffret}, \
             limited: {lim}, intensity: {intensity}, ingredients: {ingredients} }},",
            name = localized(&tea["name"], id),
            desc = localized(&tea["description"], id),
            ty = pascal(type_key),
            c0 = colors[0],
            c1 = colors[1],
            cf = flag(tea, "caffeineFree"),
            py = flag(tea, "pyramid"),
            cb = flag(tea, "coldBrew"),
            lim = flag(tea, "limited"),
        )
        .unwrap();
    }
    out.push_str("];\n");

    let out_dir = env::var("OUT_DIR").unwrap();
    fs::write(Path::new(&out_dir).join("teas.rs"), out).unwrap();
    fs::write(Path::new(&out_dir).join("content.rs"), content()).unwrap();
}

/// Conseils d'infusion par type + glossaire.
fn content() -> String {
    println!("cargo:rerun-if-changed=data/brewing.json");
    println!("cargo:rerun-if-changed=data/glossary.json");
    let read = |path: &str| -> Value {
        let raw = fs::read_to_string(path).unwrap_or_else(|_| panic!("{path} introuvable"));
        serde_json::from_str(&raw).unwrap_or_else(|e| panic!("{path} : JSON invalide ({e})"))
    };

    let brewing = read("data/brewing.json");
    let mut out = String::from("pub static TIPS: &[(TypeKey, Localized)] = &[\n");
    for ty in TYPES {
        let tips = &brewing[ty]["tips"];
        assert!(
            !tips.is_null(),
            "data/brewing.json : conseil manquant pour `{ty}`"
        );
        writeln!(
            out,
            "    (TypeKey::{}, {}),",
            pascal(ty),
            localized(tips, ty)
        )
        .unwrap();
    }
    out.push_str("];\n\n");

    let glossary = read("data/glossary.json");
    let entries = glossary
        .as_array()
        .expect("data/glossary.json : tableau attendu");
    out.push_str("pub static GLOSSARY: &[Term] = &[\n");
    for entry in entries {
        let term = entry["term"]
            .as_str()
            .expect("data/glossary.json : `term` manquant");
        writeln!(
            out,
            "    Term {{ label: {}, definition: {} }},",
            localized(&entry["label"], term),
            localized(&entry["definition"], term)
        )
        .unwrap();
    }
    out.push_str("];\n");
    out
}

fn str_field<'a>(tea: &'a Value, key: &str, id: &str) -> &'a str {
    tea[key]
        .as_str()
        .unwrap_or_else(|| panic!("{id} : champ `{key}` manquant"))
}

fn flag(tea: &Value, key: &str) -> bool {
    tea[key].as_bool().unwrap_or(false)
}

fn hex<'a>(v: Option<&'a str>, id: &str) -> &'a str {
    let v = v.unwrap_or_else(|| panic!("{id} : couleur manquante"));
    let ok = v.len() == 7 && v.starts_with('#') && v[1..].chars().all(|c| c.is_ascii_hexdigit());
    assert!(ok, "{id} : couleur invalide « {v} » (attendu #rrggbb)");
    v
}

fn localized(v: &Value, id: &str) -> String {
    let get = |l: &str| {
        v[l].as_str()
            .unwrap_or_else(|| panic!("{id} : traduction `{l}` manquante"))
    };
    format!(
        "Localized {{ fr: {:?}, en: {:?}, es: {:?} }}",
        get("fr"),
        get("en"),
        get("es")
    )
}

/// `blackTeaFlavored` → `BlackTeaFlavored` (nom de variante Rust).
fn pascal(s: &str) -> String {
    let mut c = s.chars();
    c.next()
        .map(|f| f.to_ascii_uppercase().to_string() + c.as_str())
        .unwrap_or_default()
}
