use super::split_letters;
use crate::catalog::{Family, TEAS, present_families};
use crate::i18n::{Lang, ui};
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct HeroProps {
    pub lang: Lang,
}

/// Grand titre en lettres qui montent une à une, halos colorés en parallaxe
/// et chiffres clés qui défilent jusqu'à leur valeur.
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
        <header class="hero" id="top">
            <div class="hero__orbs" aria-hidden="true">
                <span class="orb orb--yellow"></span>
                <span class="orb orb--red"></span>
                <span class="orb orb--green"></span>
                <span class="orb orb--violet"></span>
            </div>

            <p class="hero__kicker intro" style="--delay: 0">
                <span>{ t.kicker }</span>
                <span class="hero__kicker-sep" aria-hidden="true"></span>
                <span><span aria-hidden="true">{ "🇫🇷 " }</span>{ t.country }</span>
            </p>

            // La clé relance l'animation des lettres à chaque changement de langue.
            <h1 class="hero__title" key={props.lang.code()} aria-label={format!("{} Lipton", t.title)}>
                { split_letters(t.title) }
                <img class="hero__logo" src="/lipton-logo.png" alt="" width="501" height="200" />
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

            <a class="hero__scroll intro" style="--delay: 6" href="#catalogue" data-magnetic="0.4">
                <span class="hero__scroll-line" aria-hidden="true"></span>
                { t.scroll }
            </a>
        </header>
    }
}
