use super::{circle_text, roll};
use crate::catalog::TEAS;
use crate::content::{API_LINKS, NAV, NAV_TITLE, TRADEMARK};
use crate::i18n::{Lang, ui};
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct FooterProps {
    pub lang: Lang,
}

#[function_component]
pub fn Footer(props: &FooterProps) -> Html {
    let lang = props.lang;
    let t = ui(lang);
    html! {
        <footer class="footer">
            <p class="footer__tagline" data-scrub="">
                { for t.tagline.iter().map(|line| html! {
                    <span class="mask" data-reveal="mask"><span>{ *line }</span></span>
                }) }
            </p>
            <a class="footer__top" href="#top" aria-label={t.back_to_top} data-magnetic="0.5">
                { circle_text("top", &format!("{0} · {0} · ", t.back_to_top)) }
                <span class="footer__arrow" aria-hidden="true">{ "↑" }</span>
            </a>

            <div class="footer__cols">
                <nav class="footer__col" aria-label={NAV_TITLE.get(lang)}>
                    <span class="footer__col-title">{ NAV_TITLE.get(lang) }</span>
                    { for NAV.iter().map(|(id, label)| html! {
                        <a href={format!("#{id}")}>{ roll(label.get(lang)) }</a>
                    }) }
                </nav>
                <nav class="footer__col" aria-label="API">
                    <span class="footer__col-title">{ "API" }</span>
                    { for API_LINKS.iter().map(|(href, label)| html! {
                        <a href={*href}>{ roll(label.get(lang)) }</a>
                    }) }
                </nav>
            </div>

            <p class="footer__credits">
                { t.footer(TEAS.len(), crate::dom::year()) }
                { " · " }
                <a class="footer__link" href="/api/docs" title={t.api_title}>{ t.api_link }</a>
            </p>
            <p class="footer__legal">{ TRADEMARK.get(lang) }</p>
        </footer>
    }
}
