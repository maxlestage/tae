//! Minuteur d'infusion, pré-réglé sur la durée conseillée du thé.
//! Le décompte s'appuie sur une échéance absolue (horloge murale) : il reste
//! juste même si l'onglet est mis en veille et que les timers sont ralentis.

use crate::catalog::Tea;
use crate::dom::window;
use crate::i18n::{Lang, ui};
use crate::tea::brew_spec;
use gloo_timers::callback::{Interval, Timeout};
use js_sys::{Date, Function, Promise, Reflect};
use std::cell::{Cell, RefCell};
use std::rc::Rc;
use wasm_bindgen::JsCast;
use wasm_bindgen::prelude::*;
use web_sys::{AudioContext, OscillatorType};
use yew::prelude::*;

const TIMER_MIN: f64 = 30.0;
const TIMER_MAX: f64 = 20.0 * 60.0;
/// Rayon du cadran SVG.
const R: f64 = 34.0;

fn format_clock(total_seconds: f64) -> String {
    let s = total_seconds.max(0.0).ceil() as u32;
    format!("{}:{:02}", s / 60, s % 60)
}

/// Signal de fin : trois bips descendants (Web Audio) + vibration.
fn ring_bell() {
    if let Ok(ctx) = AudioContext::new() {
        for (i, offset) in [0.0, 0.28, 0.56].into_iter().enumerate() {
            let (Ok(osc), Ok(gain)) = (ctx.create_oscillator(), ctx.create_gain()) else {
                continue;
            };
            osc.set_type(OscillatorType::Sine);
            osc.frequency().set_value(880.0 - i as f32 * 110.0);
            let start = ctx.current_time() + offset;
            let g = gain.gain();
            let _ = g.set_value_at_time(0.0001, start);
            let _ = g.exponential_ramp_to_value_at_time(0.25, start + 0.02);
            let _ = g.exponential_ramp_to_value_at_time(0.0001, start + 0.22);
            let _ = osc.connect_with_audio_node(&gain);
            let _ = gain.connect_with_audio_node(&ctx.destination());
            let _ = osc.start_with_when(start);
            let _ = osc.stop_with_when(start + 0.24);
        }
        Timeout::new(1200, move || {
            let _ = ctx.close();
        })
        .forget();
    }
    let pattern = js_sys::Array::of3(&200.into(), &100.into(), &200.into());
    let _ = window().navigator().vibrate_with_pattern(&pattern);
}

/// Garde l'écran allumé pendant l'infusion (Screen Wake Lock, si disponible).
/// Renvoie une fonction de libération.
fn hold_wake_lock() -> impl FnOnce() {
    let lock: Rc<RefCell<Option<JsValue>>> = Rc::default();
    let released = Rc::new(Cell::new(false));
    let navigator = window().navigator();
    let request = Reflect::get(&navigator, &"wakeLock".into())
        .ok()
        .filter(|w| !w.is_undefined())
        .and_then(|w| {
            let f = Reflect::get(&w, &"request".into())
                .ok()?
                .dyn_into::<Function>()
                .ok()?;
            f.call1(&w, &"screen".into())
                .ok()?
                .dyn_into::<Promise>()
                .ok()
        });
    if let Some(promise) = request {
        let (lock, released) = (lock.clone(), released.clone());
        let on_ok = Closure::once(move |l: JsValue| {
            if released.get() {
                release(&l);
            } else {
                *lock.borrow_mut() = Some(l);
            }
        });
        let on_err = Closure::once(|_: JsValue| {});
        let _ = promise.then2(&on_ok, &on_err);
        on_ok.forget();
        on_err.forget();
    }
    move || {
        released.set(true);
        if let Some(l) = lock.borrow_mut().take() {
            release(&l);
        }
    }
}

fn release(lock: &JsValue) {
    if let Some(f) = Reflect::get(lock, &"release".into())
        .ok()
        .and_then(|f| f.dyn_into::<Function>().ok())
    {
        let _ = f.call0(lock);
    }
}

#[derive(Properties, PartialEq)]
pub struct TimerProps {
    pub tea: &'static Tea,
    pub lang: Lang,
}

#[function_component]
pub fn BrewTimer(props: &TimerProps) -> Html {
    let t = ui(props.lang);
    let spec = brew_spec(props.tea);
    let preset = f64::from(spec.map_or(3, |s| s.min_min) * 60);

    let duration = use_state(|| preset);
    let remaining = use_state(|| preset);
    let running = use_state(|| false);
    let done = use_state(|| false);

    // Un thé différent → on repart de sa durée conseillée.
    {
        let (duration, remaining, running, done) = (
            duration.clone(),
            remaining.clone(),
            running.clone(),
            done.clone(),
        );
        use_effect_with(props.tea.id, move |_| {
            duration.set(preset);
            remaining.set(preset);
            running.set(false);
            done.set(false);
        });
    }

    // Décompte : lit `remaining` au démarrage pour fixer l'échéance.
    {
        let (remaining, running_h, done) = (remaining.clone(), running.clone(), done.clone());
        use_effect_with(*running, move |&is_running| {
            let ticker = is_running.then(|| {
                let deadline = Date::now() + *remaining * 1000.0;
                let rung = Cell::new(false);
                Interval::new(200, move || {
                    let left = (deadline - Date::now()) / 1000.0;
                    if left > 0.0 {
                        remaining.set(left);
                    } else if !rung.replace(true) {
                        remaining.set(0.0);
                        running_h.set(false);
                        done.set(true);
                        ring_bell();
                    }
                })
            });
            let unlock = is_running.then(hold_wake_lock);
            move || {
                drop(ticker);
                if let Some(unlock) = unlock {
                    unlock();
                }
            }
        });
    }

    if spec.is_none() {
        return html! {};
    }

    let adjust = |delta: f64| {
        let (duration, remaining, running, done) = (
            duration.clone(),
            remaining.clone(),
            running.clone(),
            done.clone(),
        );
        Callback::from(move |_: MouseEvent| {
            let next = (*duration + delta).clamp(TIMER_MIN, TIMER_MAX);
            duration.set(next);
            remaining.set(next);
            done.set(false);
            running.set(false);
        })
    };
    let reset = {
        let (duration, remaining, running, done) = (
            duration.clone(),
            remaining.clone(),
            running.clone(),
            done.clone(),
        );
        Callback::from(move |_: MouseEvent| {
            remaining.set(*duration);
            done.set(false);
            running.set(false);
        })
    };
    let primary = {
        let (running, done, reset) = (running.clone(), done.clone(), reset.clone());
        Callback::from(move |e: MouseEvent| {
            if *done {
                reset.emit(e);
            } else {
                running.set(!*running);
            }
        })
    };

    let progress = if *duration > 0.0 {
        1.0 - *remaining / *duration
    } else {
        0.0
    };
    let circumference = 2.0 * std::f64::consts::PI * R;
    let started = *remaining < *duration;
    let primary_label = if *done {
        t.timer_reset
    } else if *running {
        t.timer_pause
    } else if started {
        t.timer_resume
    } else {
        t.timer_start
    };

    html! {
        <section
            class={classes!("timer", done.then_some("timer--done"), running.then_some("timer--running"))}
            aria-label={t.timer_label}
        >
            <span class="timer__label">{ t.timer_label }</span>
            <div class="timer__main">
                <div class="timer__dial">
                    <svg viewBox="0 0 80 80" aria-hidden="true">
                        <circle class="timer__track" cx="40" cy="40" r={R.to_string()} />
                        <circle
                            class="timer__progress"
                            cx="40" cy="40" r={R.to_string()}
                            stroke-dasharray={format!("{circumference:.2}")}
                            stroke-dashoffset={format!("{:.2}", circumference * (1.0 - progress))}
                            transform="rotate(-90 40 40)"
                        />
                    </svg>
                    <span class="timer__clock" role="timer" aria-live="off">
                        { format_clock(*remaining) }
                    </span>
                </div>
                <div class="timer__controls">
                    <button type="button" class="timer__btn timer__btn--primary" onclick={primary}>
                        { primary_label }
                    </button>
                    <div class="timer__adjust">
                        <button type="button" class="timer__btn" onclick={adjust(-30.0)}
                            aria-label={t.timer_less} disabled={*duration <= TIMER_MIN}>
                            { "−30 s" }
                        </button>
                        <button type="button" class="timer__btn" onclick={adjust(30.0)}
                            aria-label={t.timer_more} disabled={*duration >= TIMER_MAX}>
                            { "+30 s" }
                        </button>
                        if !*done && started {
                            <button type="button" class="timer__btn" onclick={reset}>
                                { t.timer_reset }
                            </button>
                        }
                    </div>
                </div>
            </div>
            <p class="timer__status" aria-live="polite">
                { if *done { t.timer_done } else { "" } }
            </p>
        </section>
    }
}
