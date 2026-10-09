//! Effets complémentaires, branchés sur la boucle de `motion.rs` :
//! défilement fluide (molette + ancres), progression au scroll (`--p` sur les
//! éléments `[data-scrub]`), couleur d'ambiance par section, ondes au clic,
//! textes brouillés qui se révèlent, transition de page (changement de langue).

use crate::dom::{document, now, root, window};
use gloo_events::{EventListener, EventListenerOptions};
use gloo_timers::callback::Interval;
use js_sys::{Function, Promise, Reflect};
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::JsCast;
use wasm_bindgen::prelude::*;
use web_sys::{Element, HtmlElement, MouseEvent, ScrollBehavior, ScrollToOptions, WheelEvent};

/// Éléments qui réagissent au clic par une onde.
const RIPPLE: &str = ".chip, .seg, .tool-btn, .timer__btn, .similar, .colour-row, \
                      .group__head, .theme-toggle, .menu-btn, .card, .faq__question";

#[derive(Default)]
struct Smooth {
    /// Défilement lissé (molette) en cours.
    active: bool,
    target: f64,
    current: f64,
    /// Trajet vers une ancre : (départ, arrivée, début en ms, durée en ms).
    tween: Option<(f64, f64, f64, f64)>,
    last_t: f64,
}

thread_local! {
    static SMOOTH: RefCell<Smooth> = RefCell::new(Smooth::default());
    static SMOOTH_ON: RefCell<bool> = const { RefCell::new(false) };
    static SCRUBS: RefCell<Vec<HtmlElement>> = const { RefCell::new(Vec::new()) };
    static AMBIENT: RefCell<String> = const { RefCell::new(String::new()) };
}

/// Installe les écouteurs (appelé par `motion::install`).
pub fn install(fine_pointer: bool) {
    // Défilement fluide : seulement à la molette (le tactile garde son inertie native).
    if fine_pointer {
        SMOOTH_ON.with_borrow_mut(|on| *on = true);
        let _ = root().class_list().add_1("has-smooth");
        let active = EventListenerOptions::enable_prevent_default();
        EventListener::new_with_options(&window(), "wheel", active, on_wheel).forget();
        EventListener::new_with_options(&document(), "click", active, on_anchor_click).forget();
        // Clavier ou barre de défilement : on rend la main immédiatement.
        EventListener::new(&window(), "keydown", |_| stop()).forget();
    }
    EventListener::new(&document(), "pointerdown", on_ripple).forget();
}

// --- Défilement fluide ------------------------------------------------------------

fn view_h() -> f64 {
    window()
        .inner_height()
        .ok()
        .and_then(|v| v.as_f64())
        .unwrap_or(800.0)
}

fn max_scroll() -> f64 {
    (f64::from(root().scroll_height()) - view_h()).max(0.0)
}

fn stop() {
    SMOOTH.with_borrow_mut(|s| {
        s.active = false;
        s.tween = None;
    });
}

fn on_wheel(event: &web_sys::Event) {
    let Some(e) = event.dyn_ref::<WheelEvent>() else {
        return;
    };
    if e.ctrl_key() || e.default_prevented() {
        return;
    }
    // Fiche ou menu ouverts : leur propre défilement, natif.
    let doc = document();
    if root().class_list().contains("menu-open")
        || doc.query_selector(".modal").ok().flatten().is_some()
    {
        return;
    }
    let unit = match e.delta_mode() {
        1 => 40.0,
        2 => view_h(),
        _ => 1.0,
    };
    let dy = e.delta_y() * unit;
    if dy == 0.0 {
        return;
    }
    e.prevent_default();
    let y = window().scroll_y().unwrap_or(0.0);
    let max = max_scroll();
    SMOOTH.with_borrow_mut(|s| {
        if !s.active || s.tween.is_some() {
            s.current = y;
            s.target = y;
        }
        s.tween = None;
        s.target = (s.target + dy).clamp(0.0, max);
        s.active = true;
    });
}

/// Liens d'ancre (#section) cliqués à la souris : trajet animé et amorti.
/// Au clavier, le comportement natif (et le déplacement du focus) est conservé.
fn on_anchor_click(event: &web_sys::Event) {
    let Some(e) = event.dyn_ref::<MouseEvent>() else {
        return;
    };
    if e.default_prevented()
        || e.button() != 0
        || e.detail() == 0
        || e.meta_key()
        || e.ctrl_key()
        || e.shift_key()
        || e.alt_key()
    {
        return;
    }
    let Some(link) = e
        .target()
        .and_then(|t| t.dyn_into::<Element>().ok())
        .and_then(|t| t.closest("a[href^='#']").ok().flatten())
    else {
        return;
    };
    let id = link.get_attribute("href").unwrap_or_default();
    let id = id.trim_start_matches('#');
    let y = if id.is_empty() || id == "top" {
        0.0
    } else {
        match document().get_element_by_id(id) {
            Some(el) => el.get_bounding_client_rect().top() + window().scroll_y().unwrap_or(0.0),
            None => return,
        }
    };
    e.prevent_default();
    scroll_to_y(y);
}

/// Défile en douceur jusqu'à `y` (durée selon la distance).
fn scroll_to_y(y: f64) {
    let from = window().scroll_y().unwrap_or(0.0);
    let to = y.clamp(0.0, max_scroll());
    let duration = (450.0 + (to - from).abs() * 0.18).clamp(650.0, 1600.0);
    SMOOTH.with_borrow_mut(|s| {
        s.tween = Some((from, to, now(), duration));
        s.active = true;
    });
}

/// Fait défiler jusqu'à un élément : animé si le défilement fluide est actif.
pub fn scroll_to(el: &Element) {
    if SMOOTH_ON.with_borrow(|on| *on) {
        scroll_to_y(el.get_bounding_client_rect().top() + window().scroll_y().unwrap_or(0.0));
    } else {
        el.scroll_into_view();
    }
}

fn ease_in_out(t: f64) -> f64 {
    if t < 0.5 {
        8.0 * t.powi(4)
    } else {
        1.0 - (-2.0 * t + 2.0).powi(4) / 2.0
    }
}

/// Un pas du défilement fluide (début de chaque image).
pub fn step(t: f64) {
    let y = SMOOTH.with_borrow_mut(|s| {
        let dt = if s.last_t == 0.0 {
            16.7
        } else {
            (t - s.last_t).min(64.0)
        };
        s.last_t = t;
        if let Some((from, to, start, duration)) = s.tween {
            let p = ((now() - start) / duration).clamp(0.0, 1.0);
            let y = from + (to - from) * ease_in_out(p);
            if p >= 1.0 {
                s.tween = None;
                s.active = false;
            }
            s.current = y;
            s.target = y;
            return Some(y);
        }
        if !s.active {
            return None;
        }
        let k = 1.0 - (1.0 - 0.09_f64).powf(dt / 16.7);
        s.current += (s.target - s.current) * k;
        if (s.target - s.current).abs() < 0.5 {
            s.current = s.target;
            s.active = false;
        }
        Some(s.current)
    });
    if let Some(y) = y {
        let options = ScrollToOptions::new();
        options.set_top(y);
        options.set_behavior(ScrollBehavior::Instant);
        window().scroll_to_with_scroll_to_options(&options);
    }
}

// --- Progression au scroll -------------------------------------------------------

/// Relit la liste des éléments `[data-scrub]` (après chaque rendu).
pub fn refresh() {
    let Ok(nodes) = document().query_selector_all("[data-scrub]") else {
        return;
    };
    SCRUBS.with_borrow_mut(|list| {
        list.clear();
        for i in 0..nodes.length() {
            if let Some(el) = nodes.item(i).and_then(|n| n.dyn_into::<HtmlElement>().ok()) {
                list.push(el);
            }
        }
    });
}

/// Pose `--p` (0 → 1) sur chaque élément visible : 0 quand il entre par le bas
/// de l'écran, 1 quand il sort par le haut. Le CSS en tire parallaxe,
/// défilements horizontaux, textes qui s'allument mot à mot…
pub fn scrub(view_h: f64) {
    SCRUBS.with_borrow(|list| {
        // Toutes les lectures d'abord, puis toutes les écritures : pas de
        // recalcul de style forcé entre deux éléments.
        let updates: Vec<(&HtmlElement, f64)> = list
            .iter()
            .filter_map(|el| {
                let r = el.get_bounding_client_rect();
                let visible = r.bottom() > -80.0 && r.top() < view_h + 80.0;
                visible.then(|| {
                    let p = ((view_h - r.top()) / (view_h + r.height())).clamp(0.0, 1.0);
                    (el, p)
                })
            })
            .collect();
        for (el, p) in updates {
            let _ = el.style().set_property("--p", &format!("{p:.4}"));
        }
    });
}

/// Couleur d'ambiance : celle de la section qui occupe le milieu de l'écran.
pub fn ambient(view_h: f64) {
    let Ok(nodes) = document().query_selector_all("[data-ambient]") else {
        return;
    };
    let mid = view_h * 0.45;
    let mut color = String::new();
    for i in 0..nodes.length() {
        let Some(el) = nodes.item(i).and_then(|n| n.dyn_into::<Element>().ok()) else {
            continue;
        };
        let r = el.get_bounding_client_rect();
        if r.top() <= mid && r.bottom() >= mid {
            color = el.get_attribute("data-ambient").unwrap_or_default();
        }
    }
    let changed = AMBIENT.with_borrow_mut(|last| {
        let changed = *last != color;
        last.clone_from(&color);
        changed
    });
    if !changed {
        return;
    }
    if let Some(layer) = document()
        .query_selector(".ambient")
        .ok()
        .flatten()
        .and_then(|e| e.dyn_into::<HtmlElement>().ok())
    {
        let style = layer.style();
        let _ = if color.is_empty() {
            style.remove_property("--ambient").map(|_| ())
        } else {
            style.set_property("--ambient", &color)
        };
    }
}

// --- Onde au clic -------------------------------------------------------------------

fn on_ripple(event: &web_sys::Event) {
    let Some(e) = event.dyn_ref::<MouseEvent>() else {
        return;
    };
    let Some(el) = e
        .target()
        .and_then(|t| t.dyn_into::<Element>().ok())
        .and_then(|t| t.closest(RIPPLE).ok().flatten())
        .and_then(|t| t.dyn_into::<HtmlElement>().ok())
    else {
        return;
    };
    let r = el.get_bounding_client_rect();
    let size = r.width().max(r.height()) * 2.4;
    let style = el.style();
    let _ = style.set_property(
        "--rip-x",
        &format!("{:.0}px", f64::from(e.client_x()) - r.left()),
    );
    let _ = style.set_property(
        "--rip-y",
        &format!("{:.0}px", f64::from(e.client_y()) - r.top()),
    );
    let _ = style.set_property("--rip-s", &format!("{size:.0}px"));
    // Relance l'animation même sur des clics rapprochés.
    let _ = el.remove_attribute("data-ripple");
    let _ = el.offset_width();
    let _ = el.set_attribute("data-ripple", "");
}

// --- Texte brouillé -----------------------------------------------------------------

const GLYPHS: &[char] = &[
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'K', 'M', 'N', 'R', 'S', 'T', 'X', '#', '%', '&', '*',
    '+', '=', '?', '/', '0', '1', '7',
];

/// Fait défiler des caractères aléatoires avant de révéler le vrai texte, pour
/// chaque `.scramble` contenu dans `el`. Le texte vient de `data-text` (affiché
/// en CSS) : Yew peut changer la langue à tout moment sans conflit.
pub fn scramble(el: &Element) {
    let Ok(nodes) = el.query_selector_all(".scramble") else {
        return;
    };
    for i in 0..nodes.length() {
        let Some(target) = nodes.item(i).and_then(|n| n.dyn_into::<Element>().ok()) else {
            continue;
        };
        let text: Vec<char> = target
            .get_attribute("data-text")
            .unwrap_or_default()
            .chars()
            .collect();
        const STEPS: usize = 18;
        let step = Rc::new(RefCell::new(0usize));
        let handle: Rc<RefCell<Option<Interval>>> = Rc::default();
        let keep = handle.clone();
        *handle.borrow_mut() = Some(Interval::new(45, move || {
            let n = {
                let mut s = step.borrow_mut();
                *s += 1;
                *s
            };
            if n >= STEPS {
                let _ = target.remove_attribute("data-scrambling");
                keep.borrow_mut().take();
                return;
            }
            let shown = text.len() * n / STEPS;
            let frame: String = text
                .iter()
                .enumerate()
                .map(|(j, c)| {
                    if j < shown || c.is_whitespace() {
                        *c
                    } else {
                        GLYPHS
                            [(js_sys::Math::random() * GLYPHS.len() as f64) as usize % GLYPHS.len()]
                    }
                })
                .collect();
            let _ = target.set_attribute("data-scrambling", &frame);
        }));
    }
}

// --- Transition de page --------------------------------------------------------------

fn start_view_transition() -> Option<Function> {
    Reflect::get(&document(), &JsValue::from_str("startViewTransition"))
        .ok()
        .and_then(|f| f.dyn_into::<Function>().ok())
}

/// Change de langue dans une View Transition : l'ancienne page s'efface vers
/// le haut, la nouvelle monte. Yew rend la nouvelle langue de façon
/// asynchrone : la transition attend un court instant avant la capture.
pub fn page_transition(update: impl FnOnce() + 'static) {
    match start_view_transition() {
        Some(start) if crate::motion::enabled() => {
            let _ = root().set_attribute("data-vt", "page");
            let callback = Closure::once_into_js(move || -> JsValue {
                update();
                Promise::new(&mut |resolve, _| {
                    let _ = window()
                        .set_timeout_with_callback_and_timeout_and_arguments_0(&resolve, 40);
                })
                .into()
            });
            let _ = start.call1(&document(), &callback);
        }
        _ => update(),
    }
}

/// Variante circulaire (changement de thème), depuis (x, y). `update` doit
/// modifier le DOM de façon synchrone.
pub fn circle_transition(x: f64, y: f64, update: impl FnOnce() + 'static) {
    match start_view_transition() {
        Some(start) if crate::motion::enabled() => {
            let html = root();
            let _ = html.set_attribute("data-vt", "circle");
            let style = html.style();
            let _ = style.set_property("--vt-x", &format!("{x:.0}px"));
            let _ = style.set_property("--vt-y", &format!("{y:.0}px"));
            // En cas d'échec, l'état Yew (mis à jour par l'appelant) suffit.
            let _ = start.call1(&document(), &Closure::once_into_js(update));
        }
        _ => update(),
    }
}
