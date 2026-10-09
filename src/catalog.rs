//! Catalogue des sachets : types + données générées par `build.rs` depuis
//! `data/teas.json` (source unique partagée avec l'API et l'app iOS).

use crate::i18n::Lang;

/// Famille de couleur dominante de la boîte.
#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum Family {
    Jaune,
    Ambre,
    Rouge,
    Rose,
    Violet,
    Bleu,
    Vert,
    Coffret,
}

impl Family {
    pub const ORDER: [Family; 8] = [
        Family::Jaune,
        Family::Ambre,
        Family::Rouge,
        Family::Rose,
        Family::Violet,
        Family::Bleu,
        Family::Vert,
        Family::Coffret,
    ];

    /// Pastille de couleur de la famille.
    pub fn swatch(self) -> &'static str {
        match self {
            Family::Jaune => "#ffe105",
            Family::Ambre => "#d98032",
            Family::Rouge => "#d81b3f",
            Family::Rose => "#e06b97",
            Family::Violet => "#7b2d8e",
            Family::Bleu => "#3a6ea5",
            Family::Vert => "#2e9e4f",
            Family::Coffret => "#888f9c",
        }
    }

    /// Clé stable (stockage local, identifiants DOM).
    pub fn key(self) -> &'static str {
        match self {
            Family::Jaune => "Jaune",
            Family::Ambre => "Ambre",
            Family::Rouge => "Rouge",
            Family::Rose => "Rose",
            Family::Violet => "Violet",
            Family::Bleu => "Bleu",
            Family::Vert => "Vert",
            Family::Coffret => "Coffret",
        }
    }

    pub fn from_key(key: &str) -> Option<Family> {
        Family::ORDER.into_iter().find(|f| f.key() == key)
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum TypeKey {
    BlackTea,
    BlackTeaFlavored,
    BlackTeaSpiced,
    GreenTea,
    GreenTeaFlavored,
    WhiteTea,
    Rooibos,
    Infusion,
    InfusionFruity,
    Coffret,
}

impl TypeKey {
    /// Ordre d'affichage (du thé noir aux coffrets).
    pub const ALL: [TypeKey; 10] = [
        TypeKey::BlackTea,
        TypeKey::BlackTeaFlavored,
        TypeKey::BlackTeaSpiced,
        TypeKey::GreenTea,
        TypeKey::GreenTeaFlavored,
        TypeKey::WhiteTea,
        TypeKey::Rooibos,
        TypeKey::Infusion,
        TypeKey::InfusionFruity,
        TypeKey::Coffret,
    ];

    /// Naturellement sans théine (rooibos et infusions).
    pub fn caffeine_free(self) -> bool {
        matches!(
            self,
            TypeKey::Rooibos | TypeKey::Infusion | TypeKey::InfusionFruity
        )
    }
}

/// Types présents parmi des sachets, dans l'ordre d'affichage.
pub fn types_of<'a>(teas: impl IntoIterator<Item = &'a Tea> + Clone) -> Vec<TypeKey> {
    TypeKey::ALL
        .into_iter()
        .filter(|k| teas.clone().into_iter().any(|t| t.type_key == *k))
        .collect()
}

/// Chaîne traduite dans les trois langues.
#[derive(Clone, Copy, PartialEq, Debug)]
pub struct Localized {
    pub fr: &'static str,
    pub en: &'static str,
    pub es: &'static str,
}

impl Localized {
    pub fn get(&self, lang: Lang) -> &'static str {
        match lang {
            Lang::Fr => self.fr,
            Lang::En => self.en,
            Lang::Es => self.es,
        }
    }
}

#[derive(PartialEq, Debug)]
pub struct Tea {
    pub id: &'static str,
    pub name: Localized,
    pub description: Localized,
    pub type_key: TypeKey,
    pub family: Family,
    /// Dégradé aux vraies couleurs de la boîte : [teinte dominante, accent].
    pub colors: [&'static str; 2],
    /// Couleur du texte lisible sur le dégradé.
    pub ink: &'static str,
    pub caffeine_free: bool,
    /// Gamme premium « Exclusive Selection » (sachets pyramides).
    pub pyramid: bool,
    /// Gamme « Infuse à froid ».
    pub cold_brew: bool,
    /// Coffret / assortiment de plusieurs parfums.
    pub coffret: bool,
    /// Édition limitée / saisonnière.
    pub limited: bool,
    /// Intensité 1–5 ; 0 pour un coffret.
    pub intensity: u8,
    /// `None` pour un coffret.
    pub ingredients: Option<Localized>,
}

include!(concat!(env!("OUT_DIR"), "/teas.rs"));

/// Familles réellement présentes dans le catalogue, dans l'ordre d'affichage.
pub fn present_families() -> Vec<Family> {
    Family::ORDER
        .into_iter()
        .filter(|f| TEAS.iter().any(|t| t.family == *f))
        .collect()
}
