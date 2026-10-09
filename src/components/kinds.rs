use super::{LangProps, ambient, section_head};
use crate::catalog::{TEAS, TypeKey, types_of};
use crate::content::{RANGES_TITLE, Range, TYPES, type_blurb};
use crate::i18n::{type_label, ui};
use yew::prelude::*;

/// « Du thé noir au rooibos » : chaque type de thé expliqué, avec son nombre
/// de références et un aperçu de leurs couleurs, puis les gammes spéciales.
#[function_component]
pub fn Kinds(props: &LangProps) -> Html {
    let lang = props.lang;
    let t = ui(lang);

    let kinds = types_of(TEAS.iter()).into_iter().map(|k| {
        let teas: Vec<_> = TEAS.iter().filter(|x| x.type_key == k).collect();
        let caffeine = if k == TypeKey::Coffret {
            t.varied
        } else if k.caffeine_free() {
            t.caffeine_free
        } else {
            t.caffeinated
        };
        html! {
            <article class="kind" data-reveal="">
                <header class="kind__head">
                    <h3 class="kind__title">{ type_label(lang, k) }</h3>
                    <span class="kind__count">{ teas.len() }</span>
                </header>
                <span class={classes!("pill", k.caffeine_free().then_some("pill--soft"))}>{ caffeine }</span>
                <p class="kind__text">{ type_blurb(k).get(lang) }</p>
                <span class="kind__swatches" aria-hidden="true">
                    { for teas.iter().take(12).enumerate().map(|(i, x)| html! {
                        <i style={format!(
                            "--si: {i}; background: linear-gradient(135deg, {} 50%, {} 50%)",
                            x.colors[0], x.colors[1]
                        )}></i>
                    }) }
                </span>
            </article>
        }
    });

    let ranges = Range::ALL.into_iter().map(|r| {
        let count = TEAS.iter().filter(|x| r.of(x)).count();
        html! {
            <article class="range" data-reveal="">
                <span class="range__icon" aria-hidden="true">{ r.icon() }</span>
                <h4 class="range__title">
                    { r.name().get(lang) }
                    <span class="range__count">{ count }</span>
                </h4>
                <p class="range__text">{ r.text().get(lang) }</p>
            </article>
        }
    });

    html! {
        <section class="section kinds" id="types" data-ambient={ambient("types")}>
            { section_head("types", &TYPES, lang) }
            <div class="kinds__grid">{ for kinds }</div>
            <h3 class="subhead" data-reveal="">{ RANGES_TITLE.get(lang) }</h3>
            <div class="ranges">{ for ranges }</div>
        </section>
    }
}
