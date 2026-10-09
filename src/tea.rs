//! Présentation d'un sachet : dégradés, conseils d'infusion, libellés dérivés.

use crate::catalog::{Tea, TypeKey};
use crate::i18n::Ui;

/// Éclaircit une couleur hex vers le blanc (0–1).
fn lighten(hex: &str, amount: f64) -> String {
    let n = u32::from_str_radix(hex.trim_start_matches('#'), 16).unwrap_or(0);
    let mix = |shift: u32| {
        let c = f64::from((n >> shift) & 255);
        (c + (255.0 - c) * amount).round()
    };
    format!("rgb({}, {}, {})", mix(16), mix(8), mix(0))
}

/// Dégradé à 3 couleurs fidèle aux boîtes : reflet clair (haut gauche) →
/// couleur dominante → accent du parfum (bas droite). Arc-en-ciel pour un coffret.
pub fn background(tea: &Tea) -> String {
    if tea.coffret {
        return "radial-gradient(120% 100% at 12% 8%, rgba(255,255,255,0.12) 0%, transparent 45%), \
                linear-gradient(160deg, #1b1f27 0%, #222733 52%, #ffe105 62%, #e08a2e 72%, \
                #d81b3f 80%, #7b2d8e 90%, #2e9e4f 100%)"
            .to_owned();
    }
    let [from, to] = tea.colors;
    let hi = lighten(from, 0.32);
    format!(
        "radial-gradient(130% 100% at 16% 8%, {hi} 0%, transparent 50%), \
         radial-gradient(115% 130% at 92% 108%, {to} 0%, {to} 28%, transparent 62%), \
         linear-gradient(150deg, {hi} 0%, {from} 32%, {from} 60%, {to} 100%)"
    )
}

/// Style inline d'une carte : dégradé, encre et couleurs exposées au CSS.
pub fn card_style(tea: &Tea) -> String {
    format!(
        "background: {}; color: {}; --ink: {}; --tea: {}; --tea-2: {};",
        background(tea),
        tea.ink,
        tea.ink,
        tea.colors[0],
        tea.colors[1]
    )
}

/// Conseil d'infusion : température en °C (None = à froid) + durée en minutes.
#[derive(Clone, Copy, PartialEq)]
pub struct BrewSpec {
    pub temp_c: Option<(u32, u32)>,
    pub min_min: u32,
    pub max_min: u32,
}

impl BrewSpec {
    /// « 90–95 °C », ou « Eau froide ».
    pub fn temp_label(&self, t: &Ui) -> String {
        match self.temp_c {
            Some((lo, hi)) => format!("{lo}–{hi} °C"),
            None => t.cold_water.to_owned(),
        }
    }

    /// « 3–4 min »
    pub fn time_label(&self) -> String {
        format!("{}–{} min", self.min_min, self.max_min)
    }
}

pub fn brew_spec(tea: &Tea) -> Option<BrewSpec> {
    if tea.coffret {
        return None;
    }
    Some(brew_for(tea.type_key, tea.cold_brew))
}

/// Repères d'infusion d'un type de thé (ou de la gamme à froid) — les mêmes
/// valeurs que l'app iOS.
pub fn brew_for(type_key: TypeKey, cold_brew: bool) -> BrewSpec {
    let (temp_c, min_min, max_min) = if cold_brew {
        (None, 5, 10)
    } else {
        match type_key {
            TypeKey::BlackTea | TypeKey::BlackTeaFlavored | TypeKey::BlackTeaSpiced => {
                (Some((90, 95)), 3, 4)
            }
            TypeKey::GreenTea | TypeKey::GreenTeaFlavored => (Some((75, 80)), 2, 3),
            TypeKey::WhiteTea => (Some((70, 75)), 2, 3),
            TypeKey::Rooibos => (Some((95, 100)), 5, 7),
            _ => (Some((95, 100)), 5, 6),
        }
    };
    BrewSpec {
        temp_c,
        min_min,
        max_min,
    }
}

/// « 90–95 °C · 3–4 min »
pub fn brew_info(tea: &Tea, t: &Ui) -> Option<String> {
    brew_spec(tea).map(|s| format!("{} · {}", s.temp_label(t), s.time_label()))
}

pub fn format_value(tea: &Tea, t: &Ui) -> &'static str {
    if tea.coffret {
        t.fmt_box
    } else if tea.cold_brew {
        t.fmt_cold
    } else if tea.pyramid {
        t.fmt_pyramid
    } else {
        t.fmt_bag
    }
}

pub fn moment_value(tea: &Tea, t: &Ui) -> &'static str {
    if tea.coffret {
        t.varied
    } else if tea.caffeine_free {
        t.moment_evening
    } else {
        t.moment_day
    }
}

pub fn caffeine_value(tea: &Tea, t: &Ui) -> &'static str {
    if tea.coffret {
        t.varied
    } else if tea.caffeine_free {
        t.caffeine_free
    } else {
        t.caffeinated
    }
}

/// Badges de gamme affichés sur la carte et la fiche.
pub fn lines(tea: &Tea, t: &Ui) -> Vec<&'static str> {
    let mut out = Vec::new();
    if tea.pyramid {
        out.push(t.line_exclusive);
    }
    if tea.cold_brew {
        out.push(t.line_cold);
    }
    if tea.limited {
        out.push(t.line_limited);
    }
    out
}
