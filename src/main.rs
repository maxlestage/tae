//! Lipton · Sachets de thé par couleurs — front Yew (Rust → WebAssembly).

mod app;
mod catalog;
mod components;
mod dom;
mod i18n;
mod motion;
mod tea;

/// PWA : enregistre le service worker (hors-ligne + installable).
pub fn register_service_worker() {
    let navigator = dom::window().navigator();
    let has_sw = js_sys::Reflect::has(&navigator, &"serviceWorker".into()).unwrap_or(false);
    if has_sw {
        let _ = navigator.service_worker().register("/sw.js");
    }
}

fn main() {
    let root = dom::document()
        .get_element_by_id("app")
        .expect("élément #app introuvable");
    yew::Renderer::<app::App>::with_root(root).render();
}
