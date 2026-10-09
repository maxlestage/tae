use super::menu::Menu;
use crate::app::Theme;
use crate::content::{MENU, MENU_CLOSE, MENU_CLOSE_SHORT};
use crate::i18n::{Lang, ui};
use web_sys::HtmlElement;
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct ToolbarProps {
    pub lang: Lang,
    pub theme: Theme,
    pub on_lang: Callback<Lang>,
    /// Nouveau thème + point du clic (origine de la transition circulaire).
    pub on_theme: Callback<(Theme, f64, f64)>,
}

/// Barre fixe : marque, choix de langue (pastille glissante), thème, menu.
#[function_component]
pub fn Toolbar(props: &ToolbarProps) -> Html {
    let t = ui(props.lang);
    let menu_open = use_state(|| false);
    let menu_btn = use_node_ref();
    let toggle_menu = {
        let menu_open = menu_open.clone();
        Callback::from(move |_: MouseEvent| menu_open.set(!*menu_open))
    };
    // Fermeture : après Échap, le focus revient au bouton Menu.
    let close_menu = {
        let (menu_open, menu_btn) = (menu_open.clone(), menu_btn.clone());
        Callback::from(move |refocus: bool| {
            menu_open.set(false);
            if let Some(btn) = menu_btn.cast::<HtmlElement>().filter(|_| refocus) {
                let _ = btn.focus();
            }
        })
    };
    let menu_label = if *menu_open { MENU_CLOSE } else { MENU };
    let next = props.theme.toggled();
    let on_theme = {
        let cb = props.on_theme.clone();
        Callback::from(move |e: MouseEvent| {
            cb.emit((next, f64::from(e.client_x()), f64::from(e.client_y())))
        })
    };
    let theme_label = match props.theme {
        Theme::Dark => t.theme_light,
        Theme::Light => t.theme_dark,
    };

    html! {
        <>
        <div class="toolbar">
            <a class="brand" href="#top" data-magnetic="0.25">
                <img class="brand__logo" src="/lipton-logo.png" alt="Lipton" width="501" height="200" />
                <span class="brand__name">{ "Thés" }</span>
            </a>
            <div class="toolbar__right">
                <div
                    class="seg-group seg-group--compact"
                    role="group"
                    aria-label={t.lang_aria}
                    style={format!("--count: 3; --idx: {}", props.lang.index())}
                >
                    { for Lang::ALL.into_iter().map(|l| {
                        let on_lang = props.on_lang.clone();
                        html! {
                            <button
                                type="button"
                                class={classes!("seg", (l == props.lang).then_some("seg--on"))}
                                aria-pressed={(l == props.lang).to_string()}
                                lang={l.code()}
                                onclick={move |_| on_lang.emit(l)}
                            >
                                { l.label() }
                            </button>
                        }
                    }) }
                </div>
                <button
                    type="button"
                    class="theme-toggle"
                    onclick={on_theme}
                    aria-label={theme_label}
                    title={theme_label}
                    data-magnetic="0.35"
                    data-theme-icon={props.theme.key()}
                >
                    <span class="theme-toggle__icon" aria-hidden="true"></span>
                </button>
                <button
                    type="button"
                    class={classes!("menu-btn", menu_open.then_some("is-open"))}
                    ref={menu_btn}
                    onclick={toggle_menu}
                    aria-expanded={menu_open.to_string()}
                    aria-controls="menu"
                    aria-label={menu_label.get(props.lang)}
                    data-magnetic="0.3"
                >
                    <span class="menu-btn__text" aria-hidden="true">
                        { if *menu_open { MENU_CLOSE_SHORT } else { MENU }.get(props.lang) }
                    </span>
                    <span class="menu-btn__icon" aria-hidden="true"></span>
                </button>
            </div>
        </div>
        <Menu lang={props.lang} open={*menu_open} on_close={close_menu} />
        </>
    }
}
