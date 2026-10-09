use super::{LangProps, section_head};
use crate::content::{API_LINKS, FAQ, FAQ_HEADING};
use yew::prelude::*;

/// Questions fréquentes, en accordéon (<details> natif : clavier et lecteurs
/// d'écran gérés par le navigateur).
#[function_component]
pub fn Faq(props: &LangProps) -> Html {
    let lang = props.lang;
    let last = FAQ.len() - 1;

    html! {
        <section class="section faq" id="faq">
            { section_head("faq", &FAQ_HEADING, lang) }
            <div class="faq__list">
                { for FAQ.iter().enumerate().map(|(i, qa)| html! {
                    <details class="faq__item" data-reveal="">
                        <summary class="faq__question">
                            <span>{ qa.question.get(lang) }</span>
                            <span class="faq__icon" aria-hidden="true"></span>
                        </summary>
                        <div class="faq__answer">
                            <p>{ qa.answer.get(lang) }</p>
                            // La dernière question (réutiliser les données) mène à l'API.
                            if i == last {
                                <p class="faq__links">
                                    { for API_LINKS.iter().map(|(href, label)| html! {
                                        <a class="link-pill" href={*href}>{ label.get(lang) }</a>
                                    }) }
                                </p>
                            }
                        </div>
                    </details>
                }) }
            </div>
        </section>
    }
}
