use super::{LangProps, section_head};
use crate::content::{GLOSSARY, GLOSSARY_HEADING};
use yew::prelude::*;

/// Clé de tri insensible aux accents (« Édition » se range avec les E).
fn sort_key(s: &str) -> String {
    s.chars()
        .map(|c| match c {
            'à' | 'á' | 'â' | 'ä' | 'À' | 'Á' | 'Â' => 'a',
            'é' | 'è' | 'ê' | 'ë' | 'É' | 'È' | 'Ê' => 'e',
            'í' | 'î' | 'ï' | 'Í' | 'Î' => 'i',
            'ó' | 'ô' | 'ö' | 'Ó' | 'Ô' => 'o',
            'ú' | 'ù' | 'û' | 'ü' | 'Ú' => 'u',
            'ç' | 'Ç' => 'c',
            'ñ' => 'n',
            c => c.to_ascii_lowercase(),
        })
        .collect()
}

/// « Les mots du thé » : le glossaire (partagé avec l'API), par ordre alphabétique.
#[function_component]
pub fn Glossary(props: &LangProps) -> Html {
    let lang = props.lang;
    let mut terms: Vec<_> = GLOSSARY.iter().collect();
    terms.sort_by_key(|t| sort_key(t.label.get(lang)));

    html! {
        <section class="section glossary" id="glossaire">
            { section_head("glossaire", &GLOSSARY_HEADING, lang) }
            <dl class="terms">
                { for terms.into_iter().map(|term| html! {
                    <div class="term" data-reveal="">
                        <dt class="term__label">{ term.label.get(lang) }</dt>
                        <dd class="term__text">{ term.definition.get(lang) }</dd>
                    </div>
                }) }
            </dl>
        </section>
    }
}
