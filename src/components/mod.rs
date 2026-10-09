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

/// En-tête de section : numéro (ordre du menu), sur-titre, titre en masque, chapeau.
pub fn section_head(id: &str, h: &Heading, lang: Lang) -> Html {
    let index = NAV.iter().position(|(a, _)| *a == id).map_or(0, |i| i + 1);
    html! {
        <header class="section__head">
            <p class="section__kicker" data-reveal="">
                <span class="section__index">{ format!("{index:02}") }</span>
                { h.kicker.get(lang) }
            </p>
            <h2 class="section__title">
                <span class="mask" data-reveal="mask"><span>{ h.title.get(lang) }</span></span>
            </h2>
            <p class="section__intro" data-reveal="">{ h.intro.get(lang) }</p>
        </header>
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
