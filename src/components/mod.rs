mod card;
mod footer;
mod group;
mod hero;
mod marquee;
mod modal;
mod timer;
mod toolbar;

pub use card::{Sachet, TeaCard};
pub use footer::Footer;
pub use group::{Group, Section, SectionKind};
pub use hero::Hero;
pub use marquee::Marquee;
pub use modal::{Opened, TeaModal};
pub use toolbar::Toolbar;

use yew::prelude::*;

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
