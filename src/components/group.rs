use super::{Opened, TeaCard};
use crate::catalog::{Family, Tea, types_of};
use crate::i18n::{Lang, family_label, type_label, ui};
use yew::prelude::*;

#[derive(Clone, Copy, PartialEq)]
pub enum SectionKind {
    Family(Family),
    Intensity(u8),
    /// `true` = le soir (sans théine).
    Moment(bool),
}

/// Une section du catalogue : par couleur, par intensité ou par moment.
#[derive(Clone, PartialEq)]
pub struct Section {
    pub key: String,
    pub kind: SectionKind,
    pub teas: Vec<&'static Tea>,
}

#[derive(Properties, PartialEq)]
pub struct GroupProps {
    pub section: Section,
    pub lang: Lang,
    pub open: bool,
    pub on_toggle: Callback<String>,
    pub on_open: Callback<Opened>,
}

#[function_component]
pub fn Group(props: &GroupProps) -> Html {
    let lang = props.lang;
    let t = ui(lang);
    let section = &props.section;
    let body_id = format!("group-{}", section.key);

    let (icon, title) = match section.kind {
        SectionKind::Intensity(level) => (
            html! {
                <span class="intensity" aria-hidden="true">
                    { for (1..=5).map(|i| html! {
                        <span class={classes!("intensity__dot", (i <= level).then_some("is-on"))}></span>
                    }) }
                </span>
            },
            t.intensity_name(level),
        ),
        SectionKind::Moment(evening) => (
            html! {
                <span class="group__moment" aria-hidden="true">
                    { if evening { "🌙" } else { "☀️" } }
                </span>
            },
            (if evening {
                t.moment_evening
            } else {
                t.moment_day
            })
            .to_owned(),
        ),
        SectionKind::Family(family) => (
            html! {
                <span
                    class={classes!("group__dot", (family == Family::Coffret).then_some("dot--rainbow"))}
                    style={(family != Family::Coffret).then(|| format!("background: {}", family.swatch()))}
                ></span>
            },
            family_label(lang, family).to_owned(),
        ),
    };

    // Types de thé réunis dans la section (« Thé noir · Thé noir aromatisé »).
    let types = types_of(section.teas.iter().copied())
        .into_iter()
        .map(|k| type_label(lang, k))
        .collect::<Vec<_>>()
        .join(" · ");

    let on_toggle = {
        let (cb, key) = (props.on_toggle.clone(), section.key.clone());
        Callback::from(move |_: MouseEvent| cb.emit(key.clone()))
    };

    html! {
        <section class="group" data-open={props.open.to_string()}>
            <button
                type="button"
                class="group__head"
                data-reveal=""
                onclick={on_toggle}
                aria-expanded={props.open.to_string()}
                aria-controls={body_id.clone()}
            >
                { icon }
                <span class="group__text">
                    <span class="group__title">{ title }</span>
                    <span class="group__types">{ types }</span>
                </span>
                <span class="group__count">{ section.teas.len() }</span>
                <span class="group__chevron" aria-hidden="true"></span>
            </button>
            if props.open {
                <div class="grid" id={body_id}>
                    { for section.teas.iter().map(|tea| html! {
                        <TeaCard key={tea.id} {tea} {lang} on_open={props.on_open.clone()} />
                    }) }
                </div>
            }
        </section>
    }
}
