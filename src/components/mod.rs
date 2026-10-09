mod about;
mod card;
mod colours;
mod faq;
mod footer;
mod glossary;
mod group;
mod guide;
mod hero;
mod kinds;
mod marquee;
mod menu;
mod modal;
mod timer;
mod toolbar;

pub use about::About;
pub use card::{Sachet, TeaCard};
pub use colours::Colours;
pub use faq::Faq;
pub use footer::Footer;
pub use glossary::Glossary;
pub use group::{Group, Section, SectionKind};
pub use guide::Guide;
pub use hero::Hero;
pub use kinds::Kinds;
pub use marquee::Marquee;
pub use modal::{Opened, TeaModal};
pub use toolbar::Toolbar;

use crate::content::{Heading, NAV};
use crate::i18n::Lang;
use yew::prelude::*;

/// Propriétés communes aux sections qui ne dépendent que de la langue.
#[derive(Properties, PartialEq)]
pub struct LangProps {
    pub lang: Lang,
}

/// Couleur d'ambiance d'une section (lueur de fond, voir `fx::ambient`).
pub fn ambient(id: &str) -> &'static str {
    match id {
        "infusion" => "#d98032",
        "types" => "#2e9e4f",
        "couleurs" => "#7b2d8e",
        "glossaire" => "#3a6ea5",
        "faq" => "#e06b97",
        "a-propos" => "#ffe105",
        _ => "",
    }
}

/// En-tête de section : numéro (ordre du menu), sur-titre brouillé à
/// l'apparition, titre en masque, chapeau qui s'allume mot à mot au scroll,
/// et un grand mot fantôme qui glisse en fond.
pub fn section_head(id: &str, h: &Heading, lang: Lang) -> Html {
    let index = NAV.iter().position(|(a, _)| *a == id).map_or(0, |i| i + 1);
    let ghost = NAV
        .iter()
        .find(|(a, _)| *a == id)
        .map(|(_, label)| label.get(lang))
        .unwrap_or_default();
    let kicker = h.kicker.get(lang);
    html! {
        <header class="section__head">
            <span class="section__ghost" aria-hidden="true" data-scrub="">{ ghost }</span>
            <p class="section__kicker" data-reveal="">
                <span class="section__index">{ format!("{index:02}") }</span>
                { scramble(kicker) }
            </p>
            <h2 class="section__title">
                <span class="mask" data-reveal="mask"><span>{ h.title.get(lang) }</span></span>
            </h2>
            { scrub_words("section__intro", h.intro.get(lang)) }
        </header>
    }
}

/// Texte brouillé puis révélé (`fx::scramble`) ; la vraie valeur reste lisible
/// par les lecteurs d'écran.
pub fn scramble(text: &str) -> Html {
    html! {
        <>
            <span class="scramble" data-text={text.to_owned()} aria-hidden="true"></span>
            <span class="sr-only">{ text.to_owned() }</span>
        </>
    }
}

/// Paragraphe dont les mots s'allument un à un au fil du scroll.
pub fn scrub_words(class: &'static str, text: &str) -> Html {
    let words: Vec<&str> = text.split_whitespace().collect();
    let count = words.len();
    html! {
        <p class={classes!(class, "scrub-words")} data-reveal="" data-scrub=""
            style={format!("--wn: {count}")}>
            { for words.into_iter().enumerate().map(|(i, w)| html! {
                <>
                    <span class="w" style={format!("--wi: {i}")}>{ w.to_owned() }</span>
                    { " " }
                </>
            }) }
        </p>
    }
}

/// Libellé qui « roule » au survol : le texte part vers le haut, sa copie
/// arrive par le bas (la copie est masquée aux lecteurs d'écran).
pub fn roll(text: &str) -> Html {
    html! {
        <span class="roll">
            <span class="roll__a">{ text.to_owned() }</span>
            <span class="roll__b" aria-hidden="true">{ text.to_owned() }</span>
        </span>
    }
}

/// Texte disposé en cercle, qui tourne lentement (badges).
pub fn circle_text(id: &str, text: &str) -> Html {
    let path_id = format!("circle-{id}");
    html! {
        <svg class="circle-text" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
                <path id={path_id.clone()} d="M50,50 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" />
            </defs>
            <text>
                <textPath href={format!("#{path_id}")} textLength="250">{ text.to_owned() }</textPath>
            </text>
        </svg>
    }
}

/// Découpe un texte en mots puis en lettres, chacune décalée (`--i`) pour une
/// entrée en cascade. Le texte lisible reste porté par un `aria-label` parent.
pub fn split_letters(text: &str) -> Html {
    let mut i = 0usize;
    let mut words = Vec::new();
    for (w, word) in text.split(' ').enumerate() {
        if w > 0 {
            words.push(html! { " " });
        }
        let letters: Vec<Html> = word
            .chars()
            .map(|c| {
                let style = format!("--i: {i}");
                i += 1;
                html! { <span class="split__char" {style}>{ c }</span> }
            })
            .collect();
        words.push(html! { <span class="split__word">{ for letters }</span> });
    }
    html! { <span class="split" aria-hidden="true">{ for words }</span> }
}
