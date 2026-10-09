use super::Opened;
use crate::catalog::Tea;
use crate::i18n::{Lang, type_label, ui};
use crate::tea::{brew_spec, card_style, lines};
use web_sys::HtmlElement;
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct SachetProps {
    #[prop_or_default]
    pub swing: bool,
}

/// Sachet illustré, suspendu à sa ficelle (couleur d'encre héritée via `--ink`).
#[function_component]
pub fn Sachet(props: &SachetProps) -> Html {
    let class = classes!("sachet", props.swing.then_some("sachet--swing"));
    html! {
        <span {class} aria-hidden="true">
            <span class="sachet__string"></span>
            <span class="sachet__bag">
                <img class="sachet__logo" src="/lipton-logo.png" alt="" loading="lazy" decoding="async" />
            </span>
        </span>
    }
}

#[derive(Properties, PartialEq)]
pub struct CardProps {
    pub tea: &'static Tea,
    pub lang: Lang,
    pub on_open: Callback<Opened>,
}

#[function_component]
pub fn TeaCard(props: &CardProps) -> Html {
    let tea = props.tea;
    let t = ui(props.lang);

    let node = use_node_ref();
    let onclick = {
        let (on_open, node) = (props.on_open.clone(), node.clone());
        Callback::from(move |e: MouseEvent| {
            // (Yew délègue les événements : current_target n'est pas la carte.)
            let opener = node.cast::<HtmlElement>();
            // Clavier : pas de coordonnées → on part du centre de la carte.
            let (mut x, mut y) = (f64::from(e.client_x()), f64::from(e.client_y()));
            if x == 0.0 && y == 0.0 {
                if let Some(el) = &opener {
                    let r = el.get_bounding_client_rect();
                    x = r.left() + r.width() / 2.0;
                    y = r.top() + r.height() / 2.0;
                }
            }
            on_open.emit(Opened {
                tea,
                x,
                y,
                opener,
                closing: false,
            });
        })
    };

    html! {
        <div class="card-wrap" data-reveal="">
            <button
                ref={node}
                type="button"
                class={classes!("card", tea.coffret.then_some("card--coffret"))}
                style={card_style(tea)}
                {onclick}
                aria-label={t.open_aria(tea.name.get(props.lang))}
                data-cursor={t.cursor_open}
            >
                <span class="card__glare" aria-hidden="true"></span>
                <span class="card__top">
                    <span class="card__type">{ type_label(props.lang, tea.type_key) }</span>
                    if !tea.coffret {
                        <span class="card__caffeine">
                            { if tea.caffeine_free { t.caffeine_free } else { t.caffeinated } }
                        </span>
                    }
                </span>
                <Sachet />
                { for lines(tea, t).into_iter().map(|l| html! { <span class="card__line">{ l }</span> }) }
                <span class="card__name">{ tea.name.get(props.lang) }</span>
                <span class="card__desc">{ tea.description.get(props.lang) }</span>
                if let Some(spec) = brew_spec(tea) {
                    <span class="card__meta">
                        <span class="intensity" title={t.intensity_name(tea.intensity)}>
                            { for (1..=5).map(|i| html! {
                                <span class={classes!("intensity__dot", (i <= tea.intensity).then_some("is-on"))}></span>
                            }) }
                        </span>
                        <span class="card__time">{ format!("⏱ {}", spec.time_label()) }</span>
                    </span>
                }
                <span class="card__open">{ super::roll(t.open_card) }</span>
            </button>
        </div>
    }
}
