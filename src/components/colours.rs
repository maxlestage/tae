use super::{ambient, section_head};
use crate::catalog::{Family, TEAS, types_of};
use crate::content::{
    COLOURS, COLOURS_HINT, FIG_CAFFEINE_FREE, FIG_COFFRETS, FIG_COLD, FIG_EXCLUSIVE, FIG_LANGS,
    FIG_LIMITED, FIG_TEAS, FIG_TYPES, FIGURES_TITLE,
};
use crate::i18n::{Lang, family_label, type_label};
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct ColoursProps {
    pub lang: Lang,
    /// Une famille choisie : filtrer le catalogue dessus.
    pub on_pick: Callback<Family>,
}

/// « Pourquoi par couleurs ? » : le principe, la répartition des sachets par
/// couleur (barres cliquables qui filtrent le catalogue) et les chiffres clés.
#[function_component]
pub fn Colours(props: &ColoursProps) -> Html {
    let lang = props.lang;

    let families: Vec<(Family, usize)> = Family::ORDER
        .into_iter()
        .map(|f| (f, TEAS.iter().filter(|t| t.family == f).count()))
        .filter(|(_, n)| *n > 0)
        .collect();
    let max = families.iter().map(|(_, n)| *n).max().unwrap_or(1) as f64;

    let bars = families.into_iter().map(|(family, count)| {
        let types = types_of(TEAS.iter().filter(|t| t.family == family))
            .into_iter()
            .map(|k| type_label(lang, k))
            .collect::<Vec<_>>()
            .join(" · ");
        let rainbow = family == Family::Coffret;
        let fill = if rainbow {
            String::new()
        } else {
            format!("background: {};", family.swatch())
        };
        let onclick = {
            let on_pick = props.on_pick.clone();
            move |_| on_pick.emit(family)
        };
        html! {
            <li data-reveal="">
                <button type="button" class="colour-row" {onclick} title={types.clone()}>
                    <span class={classes!("colour-row__dot", rainbow.then_some("dot--rainbow"))}
                        style={(!rainbow).then(|| format!("background: {}", family.swatch()))}></span>
                    <span class="colour-row__name">
                        { family_label(lang, family) }
                        <span class="colour-row__types">{ types }</span>
                    </span>
                    <span class="colour-row__bar" aria-hidden="true">
                        <span class={classes!("colour-row__fill", rainbow.then_some("dot--rainbow"))}
                            style={format!("{fill} --w: {:.1}%", count as f64 / max * 100.0)}></span>
                    </span>
                    <span class="colour-row__count">{ count }</span>
                </button>
            </li>
        }
    });

    let count = |pred: fn(&crate::catalog::Tea) -> bool| TEAS.iter().filter(|t| pred(t)).count();
    let figures = [
        (TEAS.len(), FIG_TEAS),
        (count(|t| t.caffeine_free), FIG_CAFFEINE_FREE),
        (types_of(TEAS.iter()).len(), FIG_TYPES),
        (count(|t| t.pyramid), FIG_EXCLUSIVE),
        (count(|t| t.cold_brew), FIG_COLD),
        (count(|t| t.limited), FIG_LIMITED),
        (count(|t| t.coffret), FIG_COFFRETS),
        (Lang::ALL.len(), FIG_LANGS),
    ];

    html! {
        <section class="section colours" id="couleurs" data-ambient={ambient("couleurs")}>
            { section_head("couleurs", &COLOURS, lang) }
            <ul class="colour-rows">{ for bars }</ul>
            <p class="colours__hint" data-reveal="">{ COLOURS_HINT.get(lang) }</p>

            <h3 class="subhead" data-reveal="">{ FIGURES_TITLE.get(lang) }</h3>
            <dl class="figures">
                { for figures.into_iter().map(|(n, label)| html! {
                    <div class="figure" data-reveal="">
                        <dt class="figure__label">{ label.get(lang) }</dt>
                        <dd class="figure__num" style={format!("--to: {n}")}>
                            <span class="sr-only">{ n }</span>
                        </dd>
                    </div>
                }) }
            </dl>
        </section>
    }
}
