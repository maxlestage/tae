//! Petits accès au navigateur : stockage local, préférences système, horloge.

use web_sys::{Document, HtmlElement, Window};

pub fn window() -> Window {
    web_sys::window().expect("pas de fenêtre")
}

pub fn document() -> Document {
    window().document().expect("pas de document")
}

pub fn root() -> HtmlElement {
    document()
        .document_element()
        .and_then(|e| wasm_bindgen::JsCast::dyn_into::<HtmlElement>(e).ok())
        .expect("pas d'élément racine")
}

/// Lecture localStorage sûre (certains contextes le bloquent).
pub fn load(key: &str) -> Option<String> {
    window()
        .local_storage()
        .ok()
        .flatten()?
        .get_item(key)
        .ok()
        .flatten()
}

pub fn save(key: &str, value: &str) {
    if let Ok(Some(storage)) = window().local_storage() {
        let _ = storage.set_item(key, value);
    }
}

pub fn media_matches(query: &str) -> bool {
    window()
        .match_media(query)
        .ok()
        .flatten()
        .is_some_and(|m| m.matches())
}

/// L'utilisateur demande moins d'animations.
pub fn reduced_motion() -> bool {
    media_matches("(prefers-reduced-motion: reduce)")
}

/// Millisecondes écoulées depuis le début du chargement de la page.
pub fn now() -> f64 {
    window().performance().map(|p| p.now()).unwrap_or(0.0)
}

pub fn year() -> u32 {
    js_sys::Date::new_0().get_full_year()
}
