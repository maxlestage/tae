use crate::catalog::TEAS;
use crate::i18n::{Lang, ui};
use yew::prelude::*;

#[derive(Properties, PartialEq)]
pub struct FooterProps {
    pub lang: Lang,
}

#[function_component]
pub fn Footer(props: &FooterProps) -> Html {
    let t = ui(props.lang);
    html! {
        <footer class="footer">
            <p class="footer__tagline">
                { for t.tagline.iter().map(|line| html! {
                    <span class="mask" data-reveal="mask"><span>{ *line }</span></span>
                }) }
            </p>
            <a class="footer__top" href="#top" aria-label={t.back_to_top} data-magnetic="0.5">
                <span aria-hidden="true">{ "↑" }</span>
            </a>
            <p class="footer__credits">
                { t.footer(TEAS.len(), crate::dom::year()) }
                { " · " }
                <a class="footer__link" href="/api/docs" title={t.api_title}>{ t.api_link }</a>
            </p>
        </footer>
    }
}
