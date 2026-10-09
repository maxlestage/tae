use super::Sachet;
use super::timer::BrewTimer;
use crate::catalog::Tea;
use crate::i18n::{Lang, family_label, type_label, ui};
use crate::tea::{brew_info, caffeine_value, card_style, format_value, lines, moment_value};
use gloo_events::EventListener;
use wasm_bindgen::JsCast;
use web_sys::{HtmlElement, KeyboardEvent};
use yew::prelude::*;

/// Fiche ouverte : le thé, le point d'origine du clic (la fiche se dévoile en
/// cercle depuis ce point) et la carte qui l'a ouverte (pour y rendre le focus).
#[derive(Clone, PartialEq)]
pub struct Opened {
    pub tea: &'static Tea,
    pub x: f64,
    pub y: f64,
    pub opener: Option<HtmlElement>,
    /// Animation de fermeture en cours.
    pub closing: bool,
}

#[derive(Properties, PartialEq)]
pub struct ModalProps {
    pub opened: Opened,
    pub lang: Lang,
    pub on_close: Callback<()>,
}

#[function_component]
pub fn TeaModal(props: &ModalProps) -> Html {
    let Opened {
        tea, x, y, closing, ..
    } = props.opened;
    let lang = props.lang;
    let t = ui(lang);
    let close_ref = use_node_ref();

    // La page derrière ne défile plus ; focus sur ✕.
    {
        let close_ref = close_ref.clone();
        use_effect_with((), move |_| {
            let body = crate::dom::document().body();
            if let Some(b) = &body {
                let _ = b.style().set_property("overflow", "hidden");
            }
            if let Some(btn) = close_ref.cast::<HtmlElement>() {
                let _ = btn.focus();
            }
            move || {
                if let Some(b) = body {
                    let _ = b.style().remove_property("overflow");
                }
            }
        });
    }
    // Échap ferme la fiche (réabonné quand le callback change, pour ne jamais
    // fermer avec un état périmé).
    use_effect_with(props.on_close.clone(), |on_close| {
        let on_close = on_close.clone();
        let listener = EventListener::new(&crate::dom::document(), "keydown", move |e| {
            if e.dyn_ref::<KeyboardEvent>()
                .is_some_and(|k| k.key() == "Escape")
            {
                on_close.emit(());
            }
        });
        move || drop(listener)
    });

    let close = {
        let on_close = props.on_close.clone();
        Callback::from(move |_: MouseEvent| on_close.emit(()))
    };
    let stop = Callback::from(|e: MouseEvent| e.stop_propagation());

    // Rayon juste suffisant pour couvrir l'écran depuis le point du clic : le
    // cercle grandit (et se referme) sur toute la durée de l'animation.
    let win = crate::dom::window();
    let size = |v: Result<wasm_bindgen::JsValue, _>| v.ok().and_then(|v| v.as_f64()).unwrap_or(0.0);
    let (w, h) = (size(win.inner_width()), size(win.inner_height()));
    let radius = x.max(w - x).hypot(y.max(h - y)) + 8.0;
    let stage_style = format!(
        "--ox: {x:.0}px; --oy: {y:.0}px; --or: {radius:.0}px; --tea: {}; --tea-2: {};",
        tea.colors[0], tea.colors[1]
    );

    let fact = |label: &'static str, value: Html| {
        html! {
            <div class="fact">
                <dt>{ label }</dt>
                <dd>{ value }</dd>
            </div>
        }
    };

    html! {
        <div
            class="modal"
            data-state={if closing { "closing" } else { "open" }}
            style={stage_style}
            role="dialog"
            aria-modal="true"
            aria-label={tea.name.get(lang)}
            onclick={close.clone()}
        >
            <button
                type="button"
                class="modal__close"
                onclick={close}
                aria-label={t.close}
                ref={close_ref}
                data-magnetic="0.4"
            >
                <span aria-hidden="true">{ "✕" }</span>
            </button>
            <div class="modal__card" style={card_style(tea)} onclick={stop}>
                <div class="modal__scroll">
                    <div class="modal__head">
                        <Sachet swing=true />
                        <span class="card__type">{ type_label(lang, tea.type_key) }</span>
                        { for lines(tea, t).into_iter().map(|l| html! { <span class="modal__line">{ l }</span> }) }
                        <h2 class="modal__name">{ tea.name.get(lang) }</h2>
                    </div>

                    <p class="modal__desc">{ tea.description.get(lang) }</p>

                    <dl class="modal__facts">
                        { fact(t.type_label, html! { type_label(lang, tea.type_key) }) }
                        { fact(t.colour, html! { family_label(lang, tea.family) }) }
                        { fact(t.caffeine_label, html! { caffeine_value(tea, t) }) }
                        { fact(t.format_label, html! { format_value(tea, t) }) }
                        { fact(t.moment_label, html! { moment_value(tea, t) }) }
                        if let Some(info) = brew_info(tea, t) {
                            { fact(t.brew_label, html! { info }) }
                        }
                        if tea.intensity > 0 {
                            { fact(t.intensity_label, html! {
                                <span class="intensity" role="img" aria-label={format!("{}/5", tea.intensity)}>
                                    { for (1..=5).map(|i| html! {
                                        <span class={classes!("intensity__dot", (i <= tea.intensity).then_some("is-on"))}></span>
                                    }) }
                                </span>
                            }) }
                        }
                    </dl>

                    <BrewTimer {tea} {lang} />

                    if let Some(ingredients) = tea.ingredients {
                        <p class="modal__ingredients">
                            <span class="modal__ing-label">{ t.ingredients_label }</span>
                            { ingredients.get(lang) }
                        </p>
                    }

                    <p class="modal__cert">
                        <span class="modal__cert-leaf" aria-hidden="true">{ "🌿" }</span>
                        { format!("{} · {}", t.certification_label, t.certification_value) }
                    </p>

                    <div class="modal__palette">
                        <span class="modal__palette-label">{ t.gradient }</span>
                        <div class="modal__swatches">
                            { for tea.colors.iter().map(|c| html! {
                                <div class="modal__swatch">
                                    <span class="modal__chip" style={format!("background: {c}")}></span>
                                    <code>{ *c }</code>
                                </div>
                            }) }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
}
