use super::{LangProps, section_head};
use crate::catalog::{TEAS, TypeKey, types_of};
use crate::content::{
    COLD_BREW, COLD_TIP, COLUMN_TEMP, COLUMN_TIME, COLUMN_TIP, COLUMN_TYPE, GUIDE, RULES,
    teas_count, type_tip,
};
use crate::i18n::{type_label, ui};
use crate::tea::{BrewSpec, brew_for};
use yew::prelude::*;

/// Échelles des jauges : 60–100 °C et 0–10 min.
const TEMP_SCALE: (f64, f64) = (60.0, 100.0);
const TIME_SCALE: f64 = 10.0;

/// Segment d'une jauge (gauche + largeur, en %).
fn segment(lo: f64, hi: f64, (min, max): (f64, f64)) -> String {
    let span = max - min;
    let left = ((lo - min) / span * 100.0).clamp(0.0, 100.0);
    let width = ((hi - lo) / span * 100.0).max(4.0);
    format!("--l: {left:.1}%; --w: {width:.1}%")
}

/// « Bien infuser » : trois règles d'or puis les repères par type de thé,
/// avec des jauges de température et de durée.
#[function_component]
pub fn Guide(props: &LangProps) -> Html {
    let lang = props.lang;
    let t = ui(lang);

    // Une ligne par type présent (hors coffrets), plus la gamme à froid.
    let mut rows: Vec<(String, usize, BrewSpec, Option<&'static str>)> = types_of(TEAS.iter())
        .into_iter()
        .filter(|k| *k != TypeKey::Coffret)
        .map(|k| {
            let count = TEAS
                .iter()
                .filter(|x| x.type_key == k && !x.cold_brew)
                .count();
            (
                type_label(lang, k).to_owned(),
                count,
                brew_for(k, false),
                type_tip(k).map(|l| l.get(lang)),
            )
        })
        .filter(|(_, count, _, _)| *count > 0)
        .collect();
    let cold = TEAS.iter().filter(|x| x.cold_brew).count();
    if cold > 0 {
        rows.push((
            COLD_BREW.get(lang).to_owned(),
            cold,
            brew_for(TypeKey::Infusion, true),
            Some(COLD_TIP.get(lang)),
        ));
    }

    html! {
        <section class="section guide" id="infusion">
            { section_head("infusion", &GUIDE, lang) }

            <ol class="rules">
                { for RULES.iter().enumerate().map(|(i, rule)| html! {
                    <li class="rule" data-reveal="">
                        <span class="rule__num" aria-hidden="true">{ i + 1 }</span>
                        <h3 class="rule__title">{ rule.title.get(lang) }</h3>
                        <p class="rule__text">{ rule.text.get(lang) }</p>
                    </li>
                }) }
            </ol>

            <table class="brew-table">
                <thead>
                    <tr>
                        <th scope="col">{ COLUMN_TYPE.get(lang) }</th>
                        <th scope="col">{ COLUMN_TEMP.get(lang) }</th>
                        <th scope="col">{ COLUMN_TIME.get(lang) }</th>
                        <th scope="col">{ COLUMN_TIP.get(lang) }</th>
                    </tr>
                </thead>
                <tbody>
                    { for rows.into_iter().map(|(label, count, spec, tip)| {
                        let temp_gauge = match spec.temp_c {
                            Some((lo, hi)) => html! {
                                <span class="gauge" aria-hidden="true">
                                    <span class="gauge__fill gauge__fill--hot"
                                        style={segment(f64::from(lo), f64::from(hi), TEMP_SCALE)}></span>
                                </span>
                            },
                            None => html! {
                                <span class="gauge" aria-hidden="true">
                                    <span class="gauge__fill gauge__fill--cold" style="--l: 0%; --w: 12%"></span>
                                </span>
                            },
                        };
                        let time_gauge = html! {
                            <span class="gauge" aria-hidden="true">
                                <span class="gauge__fill"
                                    style={segment(f64::from(spec.min_min), f64::from(spec.max_min), (0.0, TIME_SCALE))}></span>
                            </span>
                        };
                        html! {
                            <tr data-reveal="">
                                <th scope="row" data-label={COLUMN_TYPE.get(lang)}>
                                    <span class="brew-table__type">{ label }</span>
                                    <span class="brew-table__count">{ teas_count(count, lang) }</span>
                                </th>
                                <td data-label={COLUMN_TEMP.get(lang)}>
                                    <span class="brew-table__value">{ spec.temp_label(t) }</span>
                                    { temp_gauge }
                                </td>
                                <td data-label={COLUMN_TIME.get(lang)}>
                                    <span class="brew-table__value">{ spec.time_label() }</span>
                                    { time_gauge }
                                </td>
                                <td class="brew-table__tip" data-label={COLUMN_TIP.get(lang)}>
                                    { tip.unwrap_or_default() }
                                </td>
                            </tr>
                        }
                    }) }
                </tbody>
            </table>
        </section>
    }
}
