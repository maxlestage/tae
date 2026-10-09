use super::split_letters;
use crate::catalog::{Family, TEAS, Tea, present_families};
use crate::i18n::{Lang, ui};
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct HeroProps {
    pub lang: Lang,
}

/// Sachets flottants : (gauche %, haut %, profondeur, rotation °, durée s, échelle).
const BAGS: [(f64, f64, f64, f64, f64, f64); 7] = [
    (7.0, 24.0, 0.6, -14.0, 7.0, 1.0),
    (86.0, 18.0, 1.3, 11.0, 9.0, 0.8),
    (13.0, 72.0, 0.9, 9.0, 8.0, 1.15),
    (80.0, 66.0, 1.6, -9.0, 10.0, 0.95),
    (44.0, 9.0, 0.4, 5.0, 6.5, 0.7),
    (93.0, 86.0, 1.1, -16.0, 11.0, 1.05),
    (31.0, 88.0, 0.8, 13.0, 9.5, 0.85),
];

/// Un thé par couleur (à tour de rôle) pour habiller les sachets flottants.
fn bag_teas() -> Vec<&'static Tea> {
    let families: Vec<Family> = present_families()
        .into_iter()
        .filter(|f| *f != Family::Coffret)
        .collect();
    (0..BAGS.len())
        .filter_map(|i| {
            let family = families.get(i % families.len().max(1))?;
            TEAS.iter()
                .filter(|t| t.family == *family)
                .nth(i / families.len().max(1))
        })
        .collect()
}

/// Grand titre en lettres qui montent une à une, halos colorés et sachets
/// flottants en parallaxe, chiffres clés qui défilent ; au scroll, le contenu
/// recule et s'efface.
#[function_component]
pub fn Hero(props: &HeroProps) -> Html {
    let t = ui(props.lang);
    let colours = present_families()
        .into_iter()
        .filter(|f| *f != Family::Coffret)
        .count();
    let stats = [
        (TEAS.len(), t.stat_teas),
        (colours, t.stat_colours),
        (crate::i18n::Lang::ALL.len(), t.stat_langs),
    ];

    html! {
        <header class="hero" id="top" data-ambient="#ffe105">
            <div class="hero__orbs" aria-hidden="true">
                <span class="orb orb--yellow"></span>
                <span class="orb orb--red"></span>
                <span class="orb orb--green"></span>
                <span class="orb orb--violet"></span>
                { for bag_teas().into_iter().zip(BAGS).enumerate().map(|(i, (tea, (x, y, depth, rot, dur, scale)))| {
                    let style = format!(
                        "left: {x}%; top: {y}%; --depth: {depth}; --rot: {rot}deg; --dur: {dur}s; \
                         --delay: -{i}.{i}s; --s: {scale}; --c1: {}; --c2: {}; --ink: {};",
                        tea.colors[0], tea.colors[1], tea.ink
                    );
                    html! {
                        <span class={classes!("float-bag", (depth < 0.7).then_some("is-far"))} {style}>
                            <span class="float-bag__tag"></span>
                            <span class="float-bag__string"></span>
                            <span class="float-bag__bag"></span>
                        </span>
                    }
                }) }
            </div>

            <div class="hero__inner" data-scrub="">

            <p class="hero__kicker intro" style="--delay: 0">
                <span>{ t.kicker }</span>
                <span class="hero__kicker-sep" aria-hidden="true"></span>
                <span><span aria-hidden="true">{ "🇫🇷 " }</span>{ t.country }</span>
            </p>

            // La clé relance l'animation des lettres à chaque changement de langue.
            <h1 class="hero__title" key={props.lang.code()} aria-label={format!("{} Lipton", t.title)}>
                { split_letters(t.title) }
                <span class="hero__logo-wrap">
                    <img class="hero__logo" src="/lipton-logo.png" alt="" width="501" height="200" />
                </span>
            </h1>

            <p class="hero__subtitle intro" style="--delay: 3">{ t.subtitle }</p>

            <dl class="stats intro" style="--delay: 4">
                { for stats.into_iter().map(|(n, label)| html! {
                    <div class="stat">
                        <dt class="stat__label">{ label }</dt>
                        <dd class="stat__num" style={format!("--to: {n}")}>
                            <span class="sr-only">{ n }</span>
                        </dd>
                    </div>
                }) }
            </dl>

            </div>

            <a class="hero__scroll intro" style="--delay: 6" href="#catalogue" data-magnetic="0.4">
                <span class="hero__scroll-line" aria-hidden="true"></span>
                { t.scroll }
            </a>
        </header>
    }
}
