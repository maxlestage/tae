use super::{LangProps, section_head};
use crate::content::{ABOUT, API_LINKS, CREDITS, PILLARS, TRADEMARK};
use yew::prelude::*;

/// « À propos » : le projet, ses trois déclinaisons, l'API, les crédits.
#[function_component]
pub fn About(props: &LangProps) -> Html {
    let lang = props.lang;
    html! {
        <section class="section about" id="a-propos">
            { section_head("a-propos", &ABOUT, lang) }
            <div class="pillars">
                { for PILLARS.iter().enumerate().map(|(i, p)| html! {
                    <article class="pillar" data-reveal="">
                        <span class="pillar__num" aria-hidden="true">{ format!("{:02}", i + 1) }</span>
                        <h3 class="pillar__title">{ p.title.get(lang) }</h3>
                        <p class="pillar__text">{ p.text.get(lang) }</p>
                    </article>
                }) }
            </div>
            <p class="about__links" data-reveal="">
                { for API_LINKS.iter().map(|(href, label)| html! {
                    <a class="link-pill" href={*href} data-magnetic="0.25">{ label.get(lang) }</a>
                }) }
            </p>
            <p class="about__credits" data-reveal="">{ CREDITS.get(lang) }</p>
            <p class="about__legal" data-reveal="">{ TRADEMARK.get(lang) }</p>
        </section>
    }
}
