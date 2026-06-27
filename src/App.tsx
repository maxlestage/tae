import { useEffect, useMemo, useState } from "react";
import {
  TEAS,
  FAMILY_ORDER,
  FAMILY_SWATCH,
  type ColorFamily,
  type Lang,
  type Localized,
  type TeaSachet,
  type TypeKey,
} from "./data.ts";
import {
  UI,
  LANGS,
  LANG_LABEL,
  FAMILY_LABEL,
  TYPE_LABEL,
  type UiStrings,
} from "./i18n.ts";

/**
 * Dégradé fidèle aux boîtes : la couleur dominante (boîte) occupe l'essentiel
 * de la carte, l'accent (bandeau / logo) n'apparaît qu'en bas à droite.
 */
function teaGradient([from, to]: [string, string]): string {
  return [
    `radial-gradient(140% 110% at 18% 10%, ${from} 0%, ${from} 45%, transparent 75%)`,
    `radial-gradient(115% 130% at 92% 108%, ${to} 0%, ${to} 30%, transparent 62%)`,
    `linear-gradient(150deg, ${from} 0%, ${from} 58%, ${to} 100%)`,
  ].join(", ");
}

/** Dégradé arc-en-ciel pour un coffret (assortiment de plusieurs parfums). */
function coffretGradient(): string {
  return [
    "radial-gradient(120% 100% at 12% 8%, rgba(255,255,255,0.12) 0%, transparent 45%)",
    "linear-gradient(160deg, #1b1f27 0%, #222733 52%, #ffe105 62%, #e08a2e 72%, #d81b3f 80%, #7b2d8e 90%, #2e9e4f 100%)",
  ].join(", ");
}

/** Conseil d'infusion (température · temps) dérivé du type de thé. */
function brewInfo(tea: TeaSachet, t: UiStrings): string | null {
  if (tea.coffret) return null;
  if (tea.coldBrew) return `${t.coldWater} · 5–10 min`;
  switch (tea.typeKey) {
    case "blackTea":
    case "blackTeaFlavored":
    case "blackTeaSpiced":
      return "90–95 °C · 3–4 min";
    case "greenTea":
    case "greenTeaFlavored":
      return "75–80 °C · 2–3 min";
    case "whiteTea":
      return "70–75 °C · 2–3 min";
    case "rooibos":
      return "95–100 °C · 5–7 min";
    default:
      return "95–100 °C · 5–6 min";
  }
}

function formatValue(tea: TeaSachet, t: UiStrings): string {
  if (tea.coffret) return t.fmtBox;
  if (tea.coldBrew) return t.fmtCold;
  if (tea.pyramid) return t.fmtPyramid;
  return t.fmtBag;
}

function momentValue(tea: TeaSachet, t: UiStrings): string {
  if (tea.coffret) return t.variedValue;
  return tea.caffeineFree ? t.momentEvening : t.momentDay;
}

/** Ajustements d'intensité pour des références marquantes (sinon dérivé du type). */
const INTENSITY_OVERRIDE: Record<string, number> = {
  "yellow-label": 4,
  "extra-bold": 5,
  intense: 5,
  "english-breakfast": 4,
  darjeeling: 3,
  "decaf-black": 3,
  matcha: 4,
  "matcha-japan": 4,
  sencha: 2,
  "es-sencha": 2,
  "white-tea": 1,
  "green-mint-intense": 3,
  "es-mint-intense": 3,
  "moroccan-mint": 3,
  peppermint: 3,
  ginger: 3,
  "lemon-ginger": 3,
  chai: 4,
};

/** Ingrédients principaux dérivés du type (fallback). */
const BASE_INGREDIENTS: Record<TypeKey, Localized> = {
  blackTea: { fr: "Thé noir", en: "Black tea", es: "Té negro" },
  blackTeaFlavored: {
    fr: "Thé noir, arôme naturel",
    en: "Black tea, natural flavouring",
    es: "Té negro, aroma natural",
  },
  blackTeaSpiced: {
    fr: "Thé noir, épices, arôme naturel",
    en: "Black tea, spices, natural flavouring",
    es: "Té negro, especias, aroma natural",
  },
  greenTea: { fr: "Thé vert", en: "Green tea", es: "Té verde" },
  greenTeaFlavored: {
    fr: "Thé vert, arôme naturel",
    en: "Green tea, natural flavouring",
    es: "Té verde, aroma natural",
  },
  whiteTea: { fr: "Thé blanc", en: "White tea", es: "Té blanco" },
  rooibos: { fr: "Rooibos", en: "Rooibos", es: "Rooibos" },
  infusion: {
    fr: "Plantes et arômes naturels",
    en: "Herbs and natural flavourings",
    es: "Plantas y aromas naturales",
  },
  infusionFruity: {
    fr: "Hibiscus, morceaux de fruits, arôme naturel",
    en: "Hibiscus, fruit pieces, natural flavouring",
    es: "Hibisco, trozos de fruta, aroma natural",
  },
  coffret: { fr: "", en: "", es: "" },
};

/** Listes d'ingrédients documentées (réelles) pour certaines références. */
const INGREDIENTS_OVERRIDE: Record<string, Localized> = {
  chamomile: { fr: "Camomille", en: "Chamomile flowers", es: "Manzanilla" },
  peppermint: { fr: "Menthe poivrée", en: "Peppermint", es: "Menta piperita" },
  "spearmint-soft": { fr: "Menthe douce", en: "Spearmint", es: "Hierbabuena" },
  verbena: { fr: "Verveine", en: "Lemon verbena", es: "Verbena" },
  "verbena-mint": { fr: "Verveine, menthe", en: "Verbena, mint", es: "Verbena, menta" },
  linden: { fr: "Tilleul", en: "Linden", es: "Tilo" },
  "rooibos-vanilla": {
    fr: "Rooibos, arôme vanille",
    en: "Rooibos, vanilla flavouring",
    es: "Rooibos, aroma de vainilla",
  },
  "moroccan-mint": {
    fr: "Menthe, épices, réglisse",
    en: "Mint, spices, licorice",
    es: "Menta, especias, regaliz",
  },
  digestion: {
    fr: "Menthe verte, fenouil, camomille, rooibos, menthe poivrée, réglisse, gingembre",
    en: "Spearmint, fennel, chamomile, rooibos, peppermint, licorice, ginger",
    es: "Hierbabuena, hinojo, manzanilla, rooibos, menta piperita, regaliz, jengibre",
  },
  relax: {
    fr: "Camomille, feuilles d'oranger, tilleul, lavande, arôme vanille",
    en: "Chamomile, orange leaves, linden, lavender, vanilla flavouring",
    es: "Manzanilla, hojas de naranjo, tilo, lavanda, aroma de vainilla",
  },
  gingerbread: {
    fr: "Rooibos, cannelle, gingembre, écorces d'orange, réglisse, girofle",
    en: "Rooibos, cinnamon, ginger, orange peel, licorice, cloves",
    es: "Rooibos, canela, jengibre, cáscara de naranja, regaliz, clavo",
  },
  "organic-lemon-ginger": {
    fr: "Citronnelle, gingembre, menthe, écorces de citron et d'orange",
    en: "Lemongrass, ginger, mint, lemon and orange peel",
    es: "Hierba limón, jengibre, menta, cáscara de limón y naranja",
  },
  "lemon-ginger": {
    fr: "Gingembre, citron, écorces d'agrumes",
    en: "Ginger, lemon, citrus peel",
    es: "Jengibre, limón, cáscara de cítricos",
  },
  ginger: {
    fr: "Gingembre, citron, écorces d'agrumes",
    en: "Ginger, lemon, citrus peel",
    es: "Jengibre, limón, cáscara de cítricos",
  },
  "red-fruits-infusion": {
    fr: "Hibiscus, fruits rouges, arôme naturel",
    en: "Hibiscus, red fruits, natural flavouring",
    es: "Hibisco, frutos rojos, aroma natural",
  },
  "evening-mint-licorice": {
    fr: "Menthe, réglisse, plantes",
    en: "Mint, licorice, herbs",
    es: "Menta, regaliz, plantas",
  },
};

function ingredientsText(tea: TeaSachet, lang: Lang): string {
  if (tea.coffret) return "";
  const override = INGREDIENTS_OVERRIDE[tea.id];
  return (override ?? BASE_INGREDIENTS[tea.typeKey])[lang];
}

/** Intensité 1–5 ; 0 = non applicable (coffret). */
function intensityValue(tea: TeaSachet): number {
  if (tea.coffret) return 0;
  if (tea.intensity) return tea.intensity;
  if (INTENSITY_OVERRIDE[tea.id]) return INTENSITY_OVERRIDE[tea.id];
  switch (tea.typeKey) {
    case "blackTea":
    case "blackTeaSpiced":
      return 4;
    case "blackTeaFlavored":
      return 3;
    case "greenTea":
    case "greenTeaFlavored":
    case "rooibos":
    case "infusion":
    case "infusionFruity":
      return 2;
    case "whiteTea":
      return 1;
    default:
      return 2;
  }
}

function Sachet({ tea }: { tea: TeaSachet }) {
  return (
    <div className="sachet" aria-hidden="true">
      <span className="sachet__string" style={{ background: tea.ink }} />
      <span className="sachet__bag" style={{ borderColor: tea.ink }}>
        <img className="sachet__logo" src="/lipton-logo.png" alt="" />
      </span>
    </div>
  );
}

function TeaCard({
  tea,
  lang,
  t,
  onOpen,
}: {
  tea: TeaSachet;
  lang: Lang;
  t: UiStrings;
  onOpen: (tea: TeaSachet) => void;
}) {
  return (
    <button
      type="button"
      className="card"
      style={{
        background: tea.coffret ? coffretGradient() : teaGradient(tea.colors),
        color: tea.ink,
      }}
      onClick={() => onOpen(tea)}
      aria-label={t.openAria(tea.name[lang])}
    >
      <div className="card__top">
        <span className="card__type">{TYPE_LABEL[lang][tea.typeKey]}</span>
        {!tea.coffret && (
          <span
            className="card__caffeine"
            style={{ borderColor: tea.ink, color: tea.ink }}
          >
            {tea.caffeineFree ? t.caffeineFree : t.caffeinated}
          </span>
        )}
      </div>

      <Sachet tea={tea} />

      {tea.pyramid && (
        <span className="card__line" style={{ borderColor: tea.ink }}>
          ✦ Exclusive Selection
        </span>
      )}
      {tea.coldBrew && (
        <span className="card__line" style={{ borderColor: tea.ink }}>
          ❄ Infuse à froid
        </span>
      )}
      {tea.limited && (
        <span className="card__line" style={{ borderColor: tea.ink }}>
          ★ Édition limitée
        </span>
      )}
      <h3 className="card__name">{tea.name[lang]}</h3>
      <p className="card__desc">{tea.description[lang]}</p>

      <span className="card__open" style={{ borderColor: tea.ink }}>
        {t.openCard}
      </span>
    </button>
  );
}

function TeaModal({
  tea,
  lang,
  t,
  onClose,
}: {
  tea: TeaSachet;
  lang: Lang;
  t: UiStrings;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" onClick={onClose}>
      <button
        type="button"
        className="modal__close"
        onClick={onClose}
        aria-label={t.close}
      >
        ✕
      </button>
      <div
        className="modal__card"
        style={{
          background: tea.coffret ? coffretGradient() : teaGradient(tea.colors),
          color: tea.ink,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <Sachet tea={tea} />
          <div>
            <span className="card__type">{TYPE_LABEL[lang][tea.typeKey]}</span>
            {tea.pyramid && (
              <span className="modal__line">✦ Exclusive Selection</span>
            )}
            {tea.coldBrew && (
              <span className="modal__line">❄ Infuse à froid</span>
            )}
            {tea.limited && (
              <span className="modal__line">★ Édition limitée</span>
            )}
            <h2 className="modal__name">{tea.name[lang]}</h2>
          </div>
        </div>

        <p className="modal__desc">{tea.description[lang]}</p>

        <dl className="modal__facts">
          <div className="fact">
            <dt>{t.typeLabel}</dt>
            <dd>{TYPE_LABEL[lang][tea.typeKey]}</dd>
          </div>
          <div className="fact">
            <dt>{t.colour}</dt>
            <dd>{FAMILY_LABEL[lang][tea.family]}</dd>
          </div>
          <div className="fact">
            <dt>{t.caffeineLabel}</dt>
            <dd>
              {tea.coffret
                ? t.variedValue
                : tea.caffeineFree
                  ? t.caffeineFree
                  : t.caffeinated}
            </dd>
          </div>
          <div className="fact">
            <dt>{t.formatLabel}</dt>
            <dd>{formatValue(tea, t)}</dd>
          </div>
          <div className="fact">
            <dt>{t.momentLabel}</dt>
            <dd>{momentValue(tea, t)}</dd>
          </div>
          {brewInfo(tea, t) && (
            <div className="fact">
              <dt>{t.brewLabel}</dt>
              <dd>{brewInfo(tea, t)}</dd>
            </div>
          )}
          {intensityValue(tea) > 0 && (
            <div className="fact">
              <dt>{t.intensityLabel}</dt>
              <dd className="intensity" aria-label={`${intensityValue(tea)}/5`}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className="intensity__dot"
                    style={{
                      background: i <= intensityValue(tea) ? tea.ink : "transparent",
                      borderColor: tea.ink,
                    }}
                  />
                ))}
              </dd>
            </div>
          )}
        </dl>

        {!tea.coffret && (
          <p className="modal__ingredients">
            <span className="modal__ing-label">{t.ingredientsLabel}</span>
            {ingredientsText(tea, lang)}
          </p>
        )}

        <p className="modal__cert">
          <span className="modal__cert-leaf" aria-hidden="true">
            🌿
          </span>
          {t.certificationLabel} · {t.certificationValue}
        </p>

        <div className="modal__palette">
          <span className="modal__palette-label">{t.gradient}</span>
          <div className="modal__swatches">
            {tea.colors.map((c) => (
              <div key={c} className="modal__swatch">
                <span className="modal__chip" style={{ background: c }} />
                <code style={{ color: tea.ink }}>{c}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

type Theme = "dark" | "light";

/** Accès localStorage sûrs (certains contextes le bloquent). */
function loadStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function saveStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignoré */
  }
}

function getInitialTheme(): Theme {
  const saved = loadStored("tea-theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function getInitialLang(): Lang {
  const saved = loadStored("tea-lang");
  if (saved === "fr" || saved === "en" || saved === "es") return saved;
  const nav = navigator.language.slice(0, 2);
  return nav === "en" || nav === "es" ? nav : "fr";
}

function getInitialActive(): ColorFamily | "all" {
  const saved = loadStored("tea-active");
  if (saved === "all" || (saved && FAMILY_ORDER.includes(saved as ColorFamily))) {
    return saved as ColorFamily | "all";
  }
  return "all";
}

function getInitialSort(): SortMode {
  const v = loadStored("tea-sort");
  return v === "intensity" || v === "moment" ? v : "color";
}

function getInitialCollapsed(): Set<string> {
  try {
    const raw = loadStored("tea-collapsed");
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignoré */
  }
  return new Set();
}

type SortMode = "color" | "intensity" | "moment";

export function App() {
  const [active, setActive] = useState<ColorFamily | "all">(getInitialActive);
  const [selected, setSelected] = useState<TeaSachet | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [sortMode, setSortMode] = useState<SortMode>(getInitialSort);
  const [collapsed, setCollapsed] = useState<Set<string>>(getInitialCollapsed);

  const t = UI[lang];

  const toggleCollapsed = (key: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveStored("tea-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    saveStored("tea-lang", lang);
  }, [lang]);

  useEffect(() => {
    saveStored("tea-active", active);
  }, [active]);

  useEffect(() => {
    saveStored("tea-sort", sortMode);
  }, [sortMode]);

  useEffect(() => {
    saveStored("tea-collapsed", JSON.stringify([...collapsed]));
  }, [collapsed]);

  const presentFamilies = useMemo(
    () => FAMILY_ORDER.filter((f) => TEAS.some((t) => t.family === f)),
    [],
  );

  const filtered = useMemo(
    () => (active === "all" ? TEAS : TEAS.filter((x) => x.family === active)),
    [active],
  );

  /** Sections affichées : par couleur, par intensité (5→1) ou par moment. */
  const sections = useMemo<
    Array<{
      key: string;
      family?: ColorFamily;
      level?: number;
      moment?: "day" | "evening";
      teas: TeaSachet[];
    }>
  >(() => {
    if (sortMode === "color") {
      return FAMILY_ORDER.map((family) => ({
        key: family,
        family,
        teas: filtered.filter((x) => x.family === family),
      })).filter((g) => g.teas.length > 0);
    }

    type Section = {
      key: string;
      family?: ColorFamily;
      level?: number;
      moment?: "day" | "evening";
      teas: TeaSachet[];
    };
    let out: Section[];

    if (sortMode === "moment") {
      out = [
        {
          key: "m-day",
          moment: "day" as const,
          teas: filtered.filter((x) => !x.coffret && !x.caffeineFree),
        },
        {
          key: "m-evening",
          moment: "evening" as const,
          teas: filtered.filter((x) => !x.coffret && x.caffeineFree),
        },
      ].filter((g) => g.teas.length > 0);
    } else {
      out = [5, 4, 3, 2, 1]
        .map((level) => ({
          key: `i${level}`,
          level,
          teas: filtered.filter((x) => !x.coffret && intensityValue(x) === level),
        }))
        .filter((g) => g.teas.length > 0);
    }

    const coffrets = filtered.filter((x) => x.coffret);
    if (coffrets.length > 0) {
      out.push({ key: "coffret", family: "Coffret", teas: coffrets });
    }
    return out;
  }, [filtered, sortMode]);

  const allCollapsed =
    sections.length > 0 && sections.every((s) => collapsed.has(s.key));

  const toggleAll = () =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (allCollapsed) sections.forEach((s) => next.delete(s.key));
      else sections.forEach((s) => next.add(s.key));
      return next;
    });

  return (
    <div className="page">
      <div className="toolbar">
        <div className="lang-switch" role="group" aria-label={t.langAria}>
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              className={`lang ${lang === l ? "lang--on" : ""}`}
              onClick={() => setLang(l)}
              aria-pressed={lang === l}
            >
              {LANG_LABEL[l]}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={() => setTheme((x) => (x === "dark" ? "light" : "dark"))}
          aria-label={theme === "dark" ? t.themeLight : t.themeDark}
        >
          {theme === "dark" ? `☀️ ${t.themeLight}` : `🌙 ${t.themeDark}`}
        </button>
      </div>

      <header className="hero">
        <p className="hero__kicker">{t.kicker}</p>
        <h1 className="hero__title">
          {t.title}{" "}
          <img className="hero__logo" src="/lipton-logo.png" alt="Lipton" />
        </h1>
        <p className="hero__subtitle">{t.subtitle}</p>

        <p className="hero__country">
          <span aria-hidden="true">🇫🇷</span> {t.country}
        </p>

        <nav className="filters">
          <button
            className={`chip ${active === "all" ? "chip--on" : ""}`}
            onClick={() => setActive("all")}
          >
            <span className="chip__dot chip__dot--all" />
            {t.all} ({TEAS.length})
          </button>
          {presentFamilies.map((family) => (
            <button
              key={family}
              className={`chip ${active === family ? "chip--on" : ""}`}
              onClick={() => setActive(family)}
            >
              <span
                className={`chip__dot ${family === "Coffret" ? "chip__dot--all" : ""}`}
                style={family === "Coffret" ? undefined : { background: FAMILY_SWATCH[family] }}
              />
              {FAMILY_LABEL[lang][family]}
            </button>
          ))}
        </nav>

        <div className="sort">
          <span className="sort__label">{t.sortLabel}</span>
          <div className="sort__seg" role="group">
            <button
              type="button"
              className={`seg ${sortMode === "color" ? "seg--on" : ""}`}
              onClick={() => setSortMode("color")}
              aria-pressed={sortMode === "color"}
            >
              {t.sortColour}
            </button>
            <button
              type="button"
              className={`seg ${sortMode === "intensity" ? "seg--on" : ""}`}
              onClick={() => setSortMode("intensity")}
              aria-pressed={sortMode === "intensity"}
            >
              {t.sortIntensity}
            </button>
            <button
              type="button"
              className={`seg ${sortMode === "moment" ? "seg--on" : ""}`}
              onClick={() => setSortMode("moment")}
              aria-pressed={sortMode === "moment"}
            >
              {t.sortMoment}
            </button>
          </div>
        </div>
      </header>

      <main className="content">
        {sections.length > 0 && (
          <div className="content__tools">
            <button type="button" className="tool-btn" onClick={toggleAll}>
              {allCollapsed ? `⊞ ${t.expandAll}` : `⊟ ${t.collapseAll}`}
            </button>
          </div>
        )}
        {sections.map((group) => {
          const isOpen = !collapsed.has(group.key);
          return (
            <section key={group.key} className="group">
              <button
                type="button"
                className="group__head"
                onClick={() => toggleCollapsed(group.key)}
                aria-expanded={isOpen}
              >
                {group.level !== undefined ? (
                  <>
                    <span className="group__dots intensity" aria-hidden="true">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className="intensity__dot"
                          style={{
                            background:
                              i <= group.level! ? "currentColor" : "transparent",
                            borderColor: "currentColor",
                          }}
                        />
                      ))}
                    </span>
                    <span className="group__title">{t.intensityLabel}</span>
                  </>
                ) : group.moment !== undefined ? (
                  <>
                    <span className="group__moment" aria-hidden="true">
                      {group.moment === "day" ? "☀️" : "🌙"}
                    </span>
                    <span className="group__title">
                      {group.moment === "day" ? t.momentDay : t.momentEvening}
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={`group__dot ${group.family === "Coffret" ? "chip__dot--all" : ""}`}
                      style={
                        group.family === "Coffret"
                          ? undefined
                          : { background: FAMILY_SWATCH[group.family!] }
                      }
                    />
                    <span className="group__title">
                      {FAMILY_LABEL[lang][group.family!]}
                    </span>
                  </>
                )}
                <span className="group__count">{group.teas.length}</span>
                <span className="group__chevron" data-open={isOpen} aria-hidden="true">
                  ▾
                </span>
              </button>
              {isOpen && (
                <div className="grid">
                  {group.teas.map((tea) => (
                    <TeaCard
                      key={tea.id}
                      tea={tea}
                      lang={lang}
                      t={t}
                      onOpen={setSelected}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </main>

      <footer className="footer">{t.footer(TEAS.length)}</footer>

      {selected && (
        <TeaModal
          tea={selected}
          lang={lang}
          t={t}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
