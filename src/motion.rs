//! Moteur d'animation global, piloté hors du DOM virtuel de Yew :
//! curseur personnalisé, boutons magnétiques, inclinaison 3D des cartes,
//! bandeaux défilants sensibles à la vitesse de scroll, parallaxe, barre de
//! progression, apparitions au scroll (IntersectionObserver) et intro.
//!
//! Tout passe par des propriétés CSS posées directement sur les éléments, sans
//! re-rendu Yew : l'animation tourne à 60 fps quel que soit l'état de l'app.
//! Si l'utilisateur préfère réduire les animations, rien de tout cela n'est
//! installé (le CSS affiche alors le contenu immédiatement).

use crate::dom::{document, now, reduced_motion, root, window};
use gloo_events::EventListener;
use gloo_timers::callback::Timeout;
use js_sys::{Array, Function, Reflect};
use std::cell::RefCell;
use std::rc::Rc;
use wasm_bindgen::JsCast;
use wasm_bindgen::prelude::*;
use web_sys::{
    Element, HtmlElement, IntersectionObserver, IntersectionObserverEntry,
    IntersectionObserverInit, PointerEvent,
};

/// Durée minimale de l'écran d'intro (ms depuis le début du chargement).
const INTRO_MIN_MS: f64 = 1600.0;

#[derive(Default)]
struct State {
    /// Position du pointeur (souris uniquement).
    mouse: (f64, f64),
    /// Anneau du curseur, qui suit le pointeur avec inertie.
    ring: (f64, f64),
    /// Parallaxe souris lissée (-1…1).
    parallax: (f64, f64),
    pointer_seen: bool,
    frame: u32,
    last_t: f64,
    last_scroll: f64,
    /// Vitesse de défilement lissée (px / image).
    velocity: f64,
    scrolled: bool,
    marquee_offsets: Vec<f64>,
    /// Élément magnétique survolé + décalage appliqué.
    magnet: Option<(HtmlElement, f64, f64)>,
    tilt: Option<HtmlElement>,
    cursor: Option<Cursor>,
}

struct Cursor {
    dot: HtmlElement,
    ring: HtmlElement,
    label: HtmlElement,
    mode: &'static str,
}

thread_local! {
    static STATE: RefCell<State> = RefCell::new(State::default());
    static OBSERVER: RefCell<Option<IntersectionObserver>> = const { RefCell::new(None) };
}

/// Les animations sont-elles actives (classe `motion` sur <html>) ?
pub fn enabled() -> bool {
    root().class_list().contains("motion")
}

/// Installe le moteur une fois pour toutes, au montage de l'app.
pub fn install() {
    if reduced_motion() {
        return;
    }
    let _ = root().class_list().add_1("motion");

    let fine_pointer = crate::dom::media_matches("(hover: hover) and (pointer: fine)");
    if fine_pointer {
        create_cursor();
    }

    // Écouteurs passifs (comportement par défaut de gloo-events).
    EventListener::new(&window(), "pointermove", on_pointer_move).forget();
    EventListener::new(&document(), "pointerdown", |_| {
        cursor_class("is-down", true)
    })
    .forget();
    EventListener::new(&document(), "pointerup", |_| cursor_class("is-down", false)).forget();
    // Le pointeur quitte la fenêtre : on masque le curseur et on relâche tout.
    EventListener::new(&document(), "pointerout", |e| {
        let left_window = e
            .dyn_ref::<PointerEvent>()
            .is_some_and(|p| p.related_target().is_none());
        if left_window {
            cursor_class("is-visible", false);
            release_magnet();
            release_tilt();
        }
    })
    .forget();

    start_loop();
}

// --- Curseur ---------------------------------------------------------------

fn create_cursor() {
    let doc = document();
    let make = |class: &str| -> HtmlElement {
        let el: HtmlElement = doc.create_element("div").unwrap().unchecked_into();
        el.set_class_name(class);
        el
    };
    let wrap = make("cursor");
    let _ = wrap.set_attribute("aria-hidden", "true");
    let dot = make("cursor__dot");
    let ring = make("cursor__ring");
    let label = make("cursor__label");
    let _ = ring.append_child(&label);
    let _ = wrap.append_child(&ring);
    let _ = wrap.append_child(&dot);
    if let Some(body) = doc.body() {
        let _ = body.append_child(&wrap);
    }
    let _ = root().class_list().add_1("has-cursor");
    STATE.with_borrow_mut(|s| {
        s.cursor = Some(Cursor {
            dot,
            ring,
            label,
            mode: "",
        });
    });
}

fn cursor_class(class: &str, on: bool) {
    STATE.with_borrow(|s| {
        if let Some(c) = &s.cursor {
            let _ = c.ring.class_list().toggle_with_force(class, on);
            let _ = c.dot.class_list().toggle_with_force(class, on);
        }
    });
}

/// Mode du curseur selon l'élément survolé : libellé (carte), survol, normal.
fn update_cursor_mode(target: &Element) {
    let labelled = target.closest("[data-cursor]").ok().flatten();
    let interactive = target
        .closest("a, button, [role=button], label")
        .ok()
        .flatten();
    STATE.with_borrow_mut(|s| {
        let Some(c) = s.cursor.as_mut() else { return };
        let (mode, text) = match (&labelled, &interactive) {
            (Some(el), _) => (
                "is-label",
                el.get_attribute("data-cursor").unwrap_or_default(),
            ),
            (None, Some(_)) => ("is-hover", String::new()),
            _ => ("", String::new()),
        };
        if c.label.text_content().unwrap_or_default() != text {
            c.label.set_text_content(Some(&text));
        }
        if c.mode != mode {
            for m in ["is-label", "is-hover"] {
                let _ = c.ring.class_list().toggle_with_force(m, m == mode);
                let _ = c.dot.class_list().toggle_with_force(m, m == mode);
            }
            c.mode = mode;
        }
    });
}

// --- Pointeur : aimant + inclinaison -----------------------------------------

fn on_pointer_move(event: &web_sys::Event) {
    let Some(e) = event.dyn_ref::<PointerEvent>() else {
        return;
    };
    if e.pointer_type() != "mouse" {
        return;
    }
    let (x, y) = (f64::from(e.client_x()), f64::from(e.client_y()));
    STATE.with_borrow_mut(|s| {
        s.mouse = (x, y);
        if !s.pointer_seen {
            // Premier mouvement : l'anneau part directement du pointeur.
            s.ring = (x, y);
            s.pointer_seen = true;
        }
    });
    cursor_class("is-visible", true);

    if let Some(target) = e.target().and_then(|t| t.dyn_into::<Element>().ok()) {
        hover(&target, x, y);
    }
}

/// Effets liés à l'élément sous le pointeur : mode du curseur, aimant, inclinaison.
fn hover(target: &Element, x: f64, y: f64) {
    update_cursor_mode(target);
    magnet(target, x, y);
    tilt(target, x, y);
}

fn closest_html(target: &Element, selector: &str) -> Option<HtmlElement> {
    target
        .closest(selector)
        .ok()
        .flatten()
        .and_then(|el| el.dyn_into::<HtmlElement>().ok())
}

/// Attire doucement l'élément `[data-magnetic]` survolé vers le pointeur.
/// La valeur de l'attribut règle la force (0.3 par défaut).
fn magnet(target: &Element, x: f64, y: f64) {
    let Some(el) = closest_html(target, "[data-magnetic]") else {
        release_magnet();
        return;
    };
    let (tx, ty) = STATE.with_borrow(|s| match &s.magnet {
        Some((prev, tx, ty)) if *prev == el => (*tx, *ty),
        _ => (0.0, 0.0),
    });
    if tx == 0.0 && ty == 0.0 {
        release_magnet();
    }
    let strength = el
        .get_attribute("data-magnetic")
        .and_then(|v| v.parse::<f64>().ok())
        .unwrap_or(0.3);
    let r = el.get_bounding_client_rect();
    // Centre « au repos » : on retire le décalage déjà appliqué.
    let cx = r.left() + r.width() / 2.0 - tx;
    let cy = r.top() + r.height() / 2.0 - ty;
    let (nx, ny) = ((x - cx) * strength, (y - cy) * strength);
    let _ = el
        .style()
        .set_property("translate", &format!("{nx:.1}px {ny:.1}px"));
    STATE.with_borrow_mut(|s| s.magnet = Some((el, nx, ny)));
}

fn release_magnet() {
    if let Some((el, _, _)) = STATE.with_borrow_mut(|s| s.magnet.take()) {
        let _ = el.style().remove_property("translate");
    }
}

/// Incline la carte survolée en 3D et place le reflet sous le pointeur.
fn tilt(target: &Element, x: f64, y: f64) {
    let Some(card) = closest_html(target, ".card") else {
        release_tilt();
        return;
    };
    let same = STATE.with_borrow(|s| s.tilt.as_ref() == Some(&card));
    if !same {
        release_tilt();
    }
    let r = card.get_bounding_client_rect();
    let px = ((x - r.left()) / r.width()).clamp(0.0, 1.0);
    let py = ((y - r.top()) / r.height()).clamp(0.0, 1.0);
    let style = card.style();
    let _ = style.set_property("--rx", &format!("{:.2}deg", (0.5 - py) * 10.0));
    let _ = style.set_property("--ry", &format!("{:.2}deg", (px - 0.5) * 12.0));
    let _ = style.set_property("--mx", &format!("{:.1}%", px * 100.0));
    let _ = style.set_property("--my", &format!("{:.1}%", py * 100.0));
    STATE.with_borrow_mut(|s| s.tilt = Some(card));
}

fn release_tilt() {
    if let Some(card) = STATE.with_borrow_mut(|s| s.tilt.take()) {
        let style = card.style();
        for p in ["--rx", "--ry", "--mx", "--my"] {
            let _ = style.remove_property(p);
        }
    }
}

// --- Boucle d'animation --------------------------------------------------------

/// Rappel requestAnimationFrame qui se re-programme lui-même.
type FrameLoop = Rc<RefCell<Option<Closure<dyn FnMut(f64)>>>>;

fn start_loop() {
    let handle: FrameLoop = Rc::new(RefCell::new(None));
    let next = handle.clone();
    *handle.borrow_mut() = Some(Closure::new(move |t: f64| {
        frame(t);
        if let Some(cb) = next.borrow().as_ref() {
            let _ = window().request_animation_frame(cb.as_ref().unchecked_ref());
        }
    }));
    if let Some(cb) = handle.borrow().as_ref() {
        let _ = window().request_animation_frame(cb.as_ref().unchecked_ref());
    }
    // La boucle vit aussi longtemps que la page.
    std::mem::forget(handle);
}

fn frame(t: f64) {
    let win = window();
    let doc = document();
    let scroll = win.scroll_y().unwrap_or(0.0);
    let view_h = win
        .inner_height()
        .ok()
        .and_then(|v| v.as_f64())
        .unwrap_or(1.0);
    let view_w = win
        .inner_width()
        .ok()
        .and_then(|v| v.as_f64())
        .unwrap_or(1.0);

    let (dt, velocity, scrolled_changed, mouse, ring, parallax) = STATE.with_borrow_mut(|s| {
        let dt = if s.last_t == 0.0 {
            16.7
        } else {
            (t - s.last_t).min(64.0)
        };
        s.last_t = t;
        // Lissage indépendant de la fréquence d'affichage.
        let k = |base: f64| 1.0 - (1.0 - base).powf(dt / 16.7);

        let raw = scroll - s.last_scroll;
        s.last_scroll = scroll;
        s.velocity += (raw - s.velocity) * k(0.12);

        let scrolled = scroll > 24.0;
        let changed = scrolled != s.scrolled;
        s.scrolled = scrolled;

        s.ring.0 += (s.mouse.0 - s.ring.0) * k(0.2);
        s.ring.1 += (s.mouse.1 - s.ring.1) * k(0.2);

        let target = if s.pointer_seen {
            (
                s.mouse.0 / view_w * 2.0 - 1.0,
                s.mouse.1 / view_h * 2.0 - 1.0,
            )
        } else {
            (0.0, 0.0)
        };
        s.parallax.0 += (target.0 - s.parallax.0) * k(0.06);
        s.parallax.1 += (target.1 - s.parallax.1) * k(0.06);

        (
            dt,
            s.velocity,
            changed.then_some(scrolled),
            s.mouse,
            s.ring,
            s.parallax,
        )
    });

    let html = root();
    if let Some(scrolled) = scrolled_changed {
        let _ = html.class_list().toggle_with_force("is-scrolled", scrolled);
    }

    // Barre de progression de lecture.
    if let Some(bar) = query(".progress") {
        let max = (f64::from(html.scroll_height()) - view_h).max(1.0);
        let p = (scroll / max).clamp(0.0, 1.0);
        let _ = bar
            .style()
            .set_property("transform", &format!("scaleX({p:.4})"));
    }

    // Parallaxe des halos du hero (scroll + souris).
    if let Some(orbs) = query(".hero__orbs") {
        if scroll < view_h * 1.5 {
            let style = orbs.style();
            let _ = style.set_property("--sy", &format!("{scroll:.1}"));
            let _ = style.set_property("--px", &format!("{:.3}", parallax.0));
            let _ = style.set_property("--py", &format!("{:.3}", parallax.1));
        }
    }

    // Bandeaux défilants : vitesse de base + coup d'accélérateur au scroll.
    if let Ok(tracks) = doc.query_selector_all(".marquee__track") {
        let boost = velocity.abs().min(60.0) * 14.0;
        let skew = (velocity * -0.35).clamp(-12.0, 12.0);
        for i in 0..tracks.length() {
            let Some(track) = tracks
                .item(i)
                .and_then(|n| n.dyn_into::<HtmlElement>().ok())
            else {
                continue;
            };
            let speed: f64 = track
                .get_attribute("data-speed")
                .and_then(|v| v.parse().ok())
                .unwrap_or(60.0);
            let half = f64::from(track.scroll_width()) / 2.0;
            if half <= 0.0 {
                continue;
            }
            let offset = STATE.with_borrow_mut(|s| {
                let i = i as usize;
                if s.marquee_offsets.len() <= i {
                    s.marquee_offsets.resize(i + 1, 0.0);
                }
                let v = speed.signum() * (speed.abs() + boost);
                let o = (s.marquee_offsets[i] + v * dt / 1000.0).rem_euclid(half);
                s.marquee_offsets[i] = o;
                o
            });
            let _ = track.style().set_property(
                "transform",
                &format!("translate3d({:.2}px,0,0) skewX({skew:.2}deg)", -offset),
            );
        }
    }

    // Le DOM peut changer sous un pointeur immobile (fiche ouverte, scroll) :
    // on réévalue régulièrement l'élément survolé.
    let (recheck, pointer_seen) = STATE.with_borrow_mut(|s| {
        s.frame = s.frame.wrapping_add(1);
        (s.frame % 6 == 0, s.pointer_seen)
    });
    if recheck && pointer_seen {
        if let Some(el) = doc.element_from_point(mouse.0 as f32, mouse.1 as f32) {
            hover(&el, mouse.0, mouse.1);
        }
    }

    // Curseur : le point colle au pointeur, l'anneau suit avec inertie.
    STATE.with_borrow(|s| {
        if let Some(c) = &s.cursor {
            let _ = c.dot.style().set_property(
                "transform",
                &format!("translate3d({:.1}px,{:.1}px,0)", mouse.0, mouse.1),
            );
            let _ = c.ring.style().set_property(
                "transform",
                &format!("translate3d({:.1}px,{:.1}px,0)", ring.0, ring.1),
            );
        }
    });
}

fn query(selector: &str) -> Option<HtmlElement> {
    document()
        .query_selector(selector)
        .ok()
        .flatten()
        .and_then(|e| e.dyn_into::<HtmlElement>().ok())
}

// --- Apparitions au scroll ------------------------------------------------------

/// Observe les nouveaux éléments `[data-reveal]` (à appeler après chaque rendu).
/// À l'entrée dans l'écran, ils reçoivent `data-shown` avec un léger décalage
/// en cascade entre éléments apparus ensemble.
pub fn observe_reveals() {
    if !enabled() {
        return;
    }
    let Ok(nodes) = document().query_selector_all("[data-reveal]:not([data-observed])") else {
        return;
    };
    OBSERVER.with_borrow_mut(|slot| {
        let observer = slot.get_or_insert_with(create_observer);
        for i in 0..nodes.length() {
            if let Some(el) = nodes.item(i).and_then(|n| n.dyn_into::<Element>().ok()) {
                let _ = el.set_attribute("data-observed", "");
                observer.observe(&el);
            }
        }
    });
}

fn create_observer() -> IntersectionObserver {
    let callback = Closure::<dyn FnMut(Array, IntersectionObserver)>::new(
        |entries: Array, observer: IntersectionObserver| {
            let mut k = 0u32;
            for entry in entries.iter() {
                let entry: IntersectionObserverEntry = entry.unchecked_into();
                if !entry.is_intersecting() {
                    continue;
                }
                let target = entry.target();
                if let Some(el) = target.dyn_ref::<HtmlElement>() {
                    let _ = el
                        .style()
                        .set_property("--d", &format!("{}ms", k.min(10) * 70));
                }
                let _ = target.set_attribute("data-shown", "");
                observer.unobserve(&target);
                k += 1;
            }
        },
    );
    let options = IntersectionObserverInit::new();
    options.set_root_margin("0px 0px -8% 0px");
    options.set_threshold(&JsValue::from_f64(0.12));
    let observer =
        IntersectionObserver::new_with_options(callback.as_ref().unchecked_ref(), &options)
            .expect("IntersectionObserver indisponible");
    callback.forget();
    observer
}

// --- Intro ------------------------------------------------------------------------

/// Termine l'écran d'intro (rendu en HTML statique pendant le chargement du
/// WASM) : le compteur finit sa course, le rideau se lève, le hero entre.
pub fn finish_intro() {
    let html = root();
    let preloader = document().get_element_by_id("preloader");
    let Some(preloader) = preloader.filter(|_| enabled()) else {
        if let Some(p) = document().get_element_by_id("preloader") {
            p.remove();
        }
        let _ = html.class_list().add_1("is-loaded");
        return;
    };
    let wait = (INTRO_MIN_MS - now()).max(0.0) as u32;
    Timeout::new(wait, move || {
        let _ = preloader.class_list().add_1("is-done");
        Timeout::new(650, move || {
            let _ = html.class_list().add_1("is-loaded");
        })
        .forget();
        Timeout::new(1700, move || preloader.remove()).forget();
    })
    .forget();
}

// --- Transitions de vue --------------------------------------------------------

/// Applique `update` (qui doit modifier le DOM de façon synchrone) dans une
/// View Transition qui se dévoile en cercle depuis (x, y). Sans support du
/// navigateur, ou en mouvement réduit, la mise à jour est immédiate.
pub fn circle_transition(x: f64, y: f64, update: impl FnOnce() + 'static) {
    let doc = document();
    let start = Reflect::get(&doc, &JsValue::from_str("startViewTransition"))
        .ok()
        .and_then(|f| f.dyn_into::<Function>().ok());
    match start {
        Some(start) if enabled() => {
            let style = root().style();
            let _ = style.set_property("--vt-x", &format!("{x:.0}px"));
            let _ = style.set_property("--vt-y", &format!("{y:.0}px"));
            // En cas d'échec, l'état Yew (mis à jour par l'appelant) suffit.
            let _ = start.call1(&doc, &Closure::once_into_js(update));
        }
        _ => update(),
    }
}
