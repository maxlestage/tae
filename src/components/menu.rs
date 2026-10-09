use crate::content::{API_LINKS, MENU, MENU_TAGLINE, NAV};
use crate::dom::{document, root};
use crate::i18n::Lang;
use gloo_events::EventListener;
use wasm_bindgen::JsCast;
use web_sys::{HtmlElement, KeyboardEvent};
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct MenuProps {
    pub lang: Lang,
    pub open: bool,
    /// Fermer le menu ; `true` = rendre le focus au bouton (Échap), `false` =
    /// un lien a été choisi (le navigateur suit l'ancre).
    pub on_close: Callback<bool>,
}

/// Menu plein écran : grands liens numérotés vers chaque section, liens API.
/// Toujours présent dans le DOM (pour l'animation), mais inerte une fois fermé.
#[function_component]
pub fn Menu(props: &MenuProps) -> Html {
    let lang = props.lang;
    let list_ref = use_node_ref();

    // Ouvert : page figée, focus sur le premier lien, Échap pour fermer.
    {
        let (on_close, list_ref) = (props.on_close.clone(), list_ref.clone());
        use_effect_with(props.open, move |&open| {
            let listener = open.then(|| {
                let _ = root().class_list().add_1("menu-open");
                if let Some(first) = list_ref
                    .cast::<HtmlElement>()
                    .and_then(|l| l.query_selector("a").ok().flatten())
                    .and_then(|a| a.dyn_into::<HtmlElement>().ok())
                {
                    let _ = first.focus();
                }
                EventListener::new(&document(), "keydown", move |e| {
                    if e.dyn_ref::<KeyboardEvent>()
                        .is_some_and(|k| k.key() == "Escape")
                    {
                        on_close.emit(true);
                    }
                })
            });
            move || {
                drop(listener);
                let _ = root().class_list().remove_1("menu-open");
            }
        });
    }

    let close = {
        let on_close = props.on_close.clone();
        Callback::from(move |_: MouseEvent| on_close.emit(false))
    };

    html! {
        <div
            id="menu"
            class="menu"
            data-open={props.open.to_string()}
            role="dialog"
            aria-modal="true"
            aria-label={MENU.get(lang)}
            inert={!props.open}
        >
            <nav class="menu__nav">
                <ol class="menu__list" ref={list_ref}>
                    { for NAV.iter().enumerate().map(|(i, (id, label))| html! {
                        <li class="menu__item" style={format!("--i: {i}")}>
                            <a class="menu__link" href={format!("#{id}")} onclick={close.clone()}>
                                <span class="menu__num">{ format!("{:02}", i + 1) }</span>
                                <span class="menu__label">{ label.get(lang) }</span>
                            </a>
                        </li>
                    }) }
                </ol>
            </nav>
            <aside class="menu__aside">
                <p class="menu__tagline">{ MENU_TAGLINE.get(lang) }</p>
                <p class="menu__api">
                    <span class="menu__api-title">{ "API" }</span>
                    { for API_LINKS.iter().map(|(href, label)| html! {
                        <a href={*href}>{ super::roll(label.get(lang)) }</a>
                    }) }
                </p>
            </aside>
        </div>
    }
}
