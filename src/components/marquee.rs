use crate::catalog::{Family, TEAS, Tea, present_families};
use crate::i18n::{Lang, family_label};
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct MarqueeProps {
    pub lang: Lang,
}

/// Une sélection variée : on pioche à tour de rôle dans chaque famille.
fn selection(max: usize) -> Vec<&'static Tea> {
    let families: Vec<Vec<&Tea>> = present_families()
        .into_iter()
        .filter(|f| *f != Family::Coffret)
        .map(|f| TEAS.iter().filter(|t| t.family == f).collect())
        .collect();
    let longest = families.iter().map(Vec::len).max().unwrap_or(0);
    (0..longest)
        .flat_map(|i| families.iter().filter_map(move |f| f.get(i).copied()))
        .take(max)
        .collect()
}

/// Deux bandeaux décoratifs en sens inverse : des noms de thés pleins, puis les
/// couleurs en contour. Le défilement (vitesse, inclinaison) est piloté par
/// `motion.rs` selon la vitesse de scroll.
#[function_component]
pub fn Marquee(props: &MarqueeProps) -> Html {
    let lang = props.lang;
    let names = selection(24);
    let families: Vec<Family> = present_families()
        .into_iter()
        .filter(|f| *f != Family::Coffret)
        .collect();

    // Deux copies identiques : le bandeau boucle sans couture à mi-largeur.
    let copies = |content: &dyn Fn() -> Html| {
        html! {
            <>
                <span class="marquee__group">{ content() }</span>
                <span class="marquee__group">{ content() }</span>
            </>
        }
    };
    let tea_items = || {
        names
            .iter()
            .map(|tea| {
                html! {
                    <span class="marquee__item">
                        <i class="marquee__dot" style={format!(
                            "background: linear-gradient(135deg, {} 50%, {} 50%)",
                            tea.colors[0], tea.colors[1]
                        )}></i>
                        { tea.name.get(lang) }
                    </span>
                }
            })
            .collect::<Html>()
    };
    let family_items = || {
        families
            .iter()
            .map(|f| {
                html! {
                    <span class="marquee__item">
                        { family_label(lang, *f) }
                        <i class="marquee__star" style={format!("color: {}", f.swatch())}>{ "✦" }</i>
                    </span>
                }
            })
            .collect::<Html>()
    };

    html! {
        <section class="marquees" aria-hidden="true">
            <div class="marquee marquee--fill">
                <div class="marquee__track" data-speed="70">{ copies(&tea_items) }</div>
            </div>
            <div class="marquee marquee--outline">
                <div class="marquee__track" data-speed="-55">{ copies(&family_items) }</div>
            </div>
        </section>
    }
}
