use crate::catalog::{Family, TEAS, Tea, present_families};
use crate::components::{
    Footer, Group, Hero, Marquee, Opened, Section, SectionKind, TeaModal, Toolbar,
};
use crate::dom::{self, load, save};
use crate::i18n::{Lang, family_label, ui};
use crate::motion;
use gloo_timers::callback::Timeout;
use std::collections::BTreeSet;
use yew::prelude::*;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Theme {
    Dark,
    Light,
}

impl Theme {
    pub fn key(self) -> &'static str {
        match self {
            Theme::Dark => "dark",
            Theme::Light => "light",
        }
    }

    pub fn toggled(self) -> Theme {
        match self {
            Theme::Dark => Theme::Light,
            Theme::Light => Theme::Dark,
        }
    }
}

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum SortMode {
    Color,
    Intensity,
    Moment,
}

impl SortMode {
    const ALL: [SortMode; 3] = [SortMode::Color, SortMode::Intensity, SortMode::Moment];

    fn key(self) -> &'static str {
        match self {
            SortMode::Color => "color",
            SortMode::Intensity => "intensity",
            SortMode::Moment => "moment",
        }
    }
}

// --- État initial (stockage local, puis préférences du navigateur) --------------

fn initial_theme() -> Theme {
    match load("tea-theme").as_deref() {
        Some("light") => Theme::Light,
        Some("dark") => Theme::Dark,
        _ if dom::media_matches("(prefers-color-scheme: light)") => Theme::Light,
        _ => Theme::Dark,
    }
}

fn initial_lang() -> Lang {
    load("tea-lang")
        .as_deref()
        .and_then(Lang::from_code)
        .or_else(|| {
            let nav = dom::window().navigator().language()?;
            Lang::from_code(nav.get(..2)?)
        })
        .unwrap_or(Lang::Fr)
}

/// `None` = toutes les familles.
fn initial_active() -> Option<Family> {
    load("tea-active").as_deref().and_then(Family::from_key)
}

fn initial_sort() -> SortMode {
    match load("tea-sort").as_deref() {
        Some("intensity") => SortMode::Intensity,
        Some("moment") => SortMode::Moment,
        _ => SortMode::Color,
    }
}

/// Sections repliées, stockées en JSON (`["Jaune","i4"]`) comme la version précédente.
fn initial_collapsed() -> BTreeSet<String> {
    let Some(raw) = load("tea-collapsed") else {
        return BTreeSet::new();
    };
    js_sys::JSON::parse(&raw)
        .ok()
        .filter(js_sys::Array::is_array)
        .map(|v| {
            js_sys::Array::from(&v)
                .iter()
                .filter_map(|x| x.as_string())
                .collect()
        })
        .unwrap_or_default()
}

fn collapsed_json(set: &BTreeSet<String>) -> String {
    let arr: js_sys::Array = set
        .iter()
        .map(|s| wasm_bindgen::JsValue::from_str(s))
        .collect();
    js_sys::JSON::stringify(&arr)
        .ok()
        .and_then(|s| s.as_string())
        .unwrap_or_else(|| "[]".into())
}

/// Sections affichées : par couleur, par intensité (5 → 1) ou par moment.
fn sections(active: Option<Family>, sort: SortMode) -> Vec<Section> {
    let filtered: Vec<&'static Tea> = TEAS
        .iter()
        .filter(|t| active.is_none_or(|f| t.family == f))
        .collect();
    let pick = |pred: &dyn Fn(&Tea) -> bool| -> Vec<&'static Tea> {
        filtered.iter().copied().filter(|t| pred(t)).collect()
    };

    let mut out: Vec<Section> = match sort {
        SortMode::Color => {
            return Family::ORDER
                .into_iter()
                .map(|f| Section {
                    key: f.key().to_owned(),
                    kind: SectionKind::Family(f),
                    teas: pick(&|t| t.family == f),
                })
                .filter(|s| !s.teas.is_empty())
                .collect();
        }
        SortMode::Moment => [false, true]
            .into_iter()
            .map(|evening| Section {
                key: if evening { "m-evening" } else { "m-day" }.to_owned(),
                kind: SectionKind::Moment(evening),
                teas: pick(&|t| !t.coffret && t.caffeine_free == evening),
            })
            .collect(),
        SortMode::Intensity => (1..=5u8)
            .rev()
            .map(|level| Section {
                key: format!("i{level}"),
                kind: SectionKind::Intensity(level),
                teas: pick(&|t| !t.coffret && t.intensity == level),
            })
            .collect(),
    };
    out.retain(|s| !s.teas.is_empty());
    let coffrets = pick(&|t| t.coffret);
    if !coffrets.is_empty() {
        out.push(Section {
            key: "coffret".to_owned(),
            kind: SectionKind::Family(Family::Coffret),
            teas: coffrets,
        });
    }
    out
}

#[function_component]
pub fn App() -> Html {
    let lang = use_state(initial_lang);
    let theme = use_state(initial_theme);
    let active = use_state(initial_active);
    let sort = use_state(initial_sort);
    let collapsed = use_state(initial_collapsed);
    let opened = use_state(|| None::<Opened>);
    let t = ui(*lang);

    // Une seule fois : moteur d'animation, fin de l'intro, mode hors-ligne.
    use_effect_with((), |_| {
        motion::install();
        motion::finish_intro();
        crate::register_service_worker();
    });
    // Après chaque rendu : les nouveaux éléments à faire apparaître au scroll.
    use_effect(motion::observe_reveals);

    use_effect_with(*theme, |theme| {
        let _ = dom::root().set_attribute("data-theme", theme.key());
        save("tea-theme", theme.key());
    });
    use_effect_with(*lang, |lang| {
        let _ = dom::root().set_attribute("lang", lang.code());
        save("tea-lang", lang.code());
    });
    use_effect_with(*active, |active| {
        save("tea-active", active.map_or("all", Family::key));
    });
    use_effect_with(*sort, |sort| save("tea-sort", sort.key()));
    use_effect_with((*collapsed).clone(), |c| {
        save("tea-collapsed", &collapsed_json(c))
    });

    let sections = sections(*active, *sort);
    let shown: usize = sections.iter().map(|s| s.teas.len()).sum();
    let all_collapsed = !sections.is_empty() && sections.iter().all(|s| collapsed.contains(&s.key));

    // --- Callbacks ---------------------------------------------------------------

    let on_lang = {
        let lang = lang.clone();
        Callback::from(move |l| lang.set(l))
    };
    let on_theme = {
        let theme = theme.clone();
        Callback::from(move |(next, x, y): (Theme, f64, f64)| {
            let theme = theme.clone();
            // Le DOM change dans la transition (capture avant/après), puis l'état suit.
            motion::circle_transition(x, y, move || {
                let _ = dom::root().set_attribute("data-theme", next.key());
                theme.set(next);
            });
        })
    };
    let on_toggle = {
        let collapsed = collapsed.clone();
        Callback::from(move |key: String| {
            let mut next = (*collapsed).clone();
            if !next.remove(&key) {
                next.insert(key);
            }
            collapsed.set(next);
        })
    };
    let toggle_all = {
        let collapsed = collapsed.clone();
        let keys: Vec<String> = sections.iter().map(|s| s.key.clone()).collect();
        Callback::from(move |_: MouseEvent| {
            let mut next = (*collapsed).clone();
            for k in &keys {
                if all_collapsed {
                    next.remove(k);
                } else {
                    next.insert(k.clone());
                }
            }
            collapsed.set(next);
        })
    };
    let on_open = {
        let opened = opened.clone();
        Callback::from(move |o: Opened| opened.set(Some(o)))
    };
    let on_close = {
        let opened = opened.clone();
        Callback::from(move |_| {
            let Some(current) = (*opened).clone() else {
                return;
            };
            if current.closing {
                return;
            }
            let finish = {
                let (opened, opener) = (opened.clone(), current.opener.clone());
                move || {
                    if let Some(el) = opener {
                        let _ = el.focus();
                    }
                    opened.set(None);
                }
            };
            if motion::enabled() {
                opened.set(Some(Opened {
                    closing: true,
                    ..current
                }));
                Timeout::new(560, finish).forget();
            } else {
                finish();
            }
        })
    };

    let chip = |family: Option<Family>| {
        let on = *active == family;
        let label = match family {
            None => format!("{} ({})", t.all, TEAS.len()),
            Some(f) => family_label(*lang, f).to_owned(),
        };
        let rainbow = family.is_none_or(|f| f == Family::Coffret);
        let dot_style = family
            .filter(|f| *f != Family::Coffret)
            .map(|f| format!("background: {}", f.swatch()));
        let onclick = {
            let active = active.clone();
            move |_| active.set(family)
        };
        html! {
            <button
                type="button"
                class={classes!("chip", on.then_some("chip--on"))}
                aria-pressed={on.to_string()}
                {onclick}
                data-magnetic="0.2"
            >
                <span class={classes!("chip__dot", rainbow.then_some("dot--rainbow"))} style={dot_style}></span>
                { label }
            </button>
        }
    };

    let sort_index = SortMode::ALL.iter().position(|s| *s == *sort).unwrap_or(0);

    html! {
        <>
            <a class="skip" href="#catalogue">{ t.skip }</a>
            <div class="progress" aria-hidden="true"></div>
            <Toolbar lang={*lang} theme={*theme} {on_lang} {on_theme} />

            <Hero lang={*lang} />
            <Marquee lang={*lang} />

            <main class="catalogue" id="catalogue">
                <div class="catalogue__head">
                    <h2 class="catalogue__title">
                        <span class="mask" data-reveal="mask"><span>{ t.catalogue }</span></span>
                    </h2>
                    <span class="catalogue__count" data-reveal="">
                        { format!("{shown:02}") }
                    </span>
                </div>

                <nav class="filters" data-reveal="" aria-label={t.colour}>
                    { chip(None) }
                    { for present_families().into_iter().map(|f| chip(Some(f))) }
                </nav>

                <div class="controls" data-reveal="">
                    <div class="sort">
                        <span class="sort__label">{ t.sort_label }</span>
                        <div
                            class="seg-group"
                            role="group"
                            aria-label={t.sort_label}
                            style={format!("--count: 3; --idx: {sort_index}")}
                        >
                            { for SortMode::ALL.into_iter().map(|mode| {
                                let label = match mode {
                                    SortMode::Color => t.sort_colour,
                                    SortMode::Intensity => t.sort_intensity,
                                    SortMode::Moment => t.sort_moment,
                                };
                                let sort = sort.clone();
                                html! {
                                    <button
                                        type="button"
                                        class={classes!("seg", (*sort == mode).then_some("seg--on"))}
                                        aria-pressed={(*sort == mode).to_string()}
                                        onclick={move |_| sort.set(mode)}
                                    >
                                        { label }
                                    </button>
                                }
                            }) }
                        </div>
                    </div>
                    if !sections.is_empty() {
                        <button type="button" class="tool-btn" onclick={toggle_all} data-magnetic="0.25">
                            <span class={classes!("tool-btn__icon", all_collapsed.then_some("is-collapsed"))} aria-hidden="true"></span>
                            { if all_collapsed { t.expand_all } else { t.collapse_all } }
                        </button>
                    }
                </div>

                // Clé = filtre + tri : changer l'un remonte la grille, et les
                // cartes rejouent leur entrée en cascade.
                <div class="groups" key={format!("{:?}-{:?}", *active, *sort)}>
                    { for sections.into_iter().map(|section| {
                        let open = !collapsed.contains(&section.key);
                        let key = section.key.clone();
                        html! {
                            <Group
                                {key}
                                {section}
                                lang={*lang}
                                {open}
                                on_toggle={on_toggle.clone()}
                                on_open={on_open.clone()}
                            />
                        }
                    }) }
                </div>
            </main>

            <Footer lang={*lang} />

            if let Some(o) = (*opened).clone() {
                <TeaModal opened={o} lang={*lang} {on_close} />
            }
        </>
    }
}
