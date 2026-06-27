import { useEffect, useMemo, useState } from "react";
import {
  TEAS,
  FAMILY_ORDER,
  FAMILY_SWATCH,
  type ColorFamily,
  type Lang,
  type TeaSachet,
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

/** Logo Lipton aux vraies couleurs : bandeau rouge + texte blanc sur champ jaune. */
function LiptonLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`lipton-logo ${className}`}>
      <span className="lipton-logo__banner">Lipton</span>
    </span>
  );
}

function Sachet({ tea }: { tea: TeaSachet }) {
  return (
    <div className="sachet" aria-hidden="true">
      <span className="sachet__string" style={{ background: tea.ink }} />
      <span className="sachet__bag" style={{ borderColor: tea.ink }}>
        <LiptonLogo className="lipton-logo--mini" />
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
      <div
        className="modal__card"
        style={{
          background: tea.coffret ? coffretGradient() : teaGradient(tea.colors),
          color: tea.ink,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal__close"
          style={{ color: tea.ink, borderColor: tea.ink }}
          onClick={onClose}
          aria-label={t.close}
        >
          ✕
        </button>

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
            <dt>{t.colour}</dt>
            <dd>{FAMILY_LABEL[lang][tea.family]}</dd>
          </div>
          <div className="fact">
            <dt>{t.caffeineLabel}</dt>
            <dd>{tea.caffeineFree ? t.caffeineFree : t.caffeinated}</dd>
          </div>
          <div className="fact">
            <dt>{t.typeLabel}</dt>
            <dd>{TYPE_LABEL[lang][tea.typeKey]}</dd>
          </div>
        </dl>

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

function getInitialTheme(): Theme {
  const saved = localStorage.getItem("tea-theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function getInitialLang(): Lang {
  const saved = localStorage.getItem("tea-lang");
  if (saved === "fr" || saved === "en" || saved === "es") return saved;
  const nav = navigator.language.slice(0, 2);
  return nav === "en" || nav === "es" ? nav : "fr";
}

export function App() {
  const [active, setActive] = useState<ColorFamily | "all">("all");
  const [selected, setSelected] = useState<TeaSachet | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [lang, setLang] = useState<Lang>(getInitialLang);

  const t = UI[lang];

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("tea-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("tea-lang", lang);
  }, [lang]);

  const groups = useMemo(() => {
    return FAMILY_ORDER.map((family) => ({
      family,
      teas: TEAS.filter((t) => t.family === family),
    })).filter((g) => g.teas.length > 0);
  }, []);

  const presentFamilies = useMemo(
    () => FAMILY_ORDER.filter((f) => TEAS.some((t) => t.family === f)),
    [],
  );

  const visibleGroups =
    active === "all" ? groups : groups.filter((g) => g.family === active);

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
          {t.title} <LiptonLogo className="lipton-logo--hero" />
        </h1>
        <p className="hero__subtitle">{t.subtitle}</p>

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
      </header>

      <main className="content">
        {visibleGroups.map((group) => (
          <section key={group.family} className="group">
            <div className="group__head">
              <span
                className={`group__dot ${group.family === "Coffret" ? "chip__dot--all" : ""}`}
                style={
                  group.family === "Coffret"
                    ? undefined
                    : { background: FAMILY_SWATCH[group.family] }
                }
              />
              <h2 className="group__title">{FAMILY_LABEL[lang][group.family]}</h2>
              <span className="group__count">{group.teas.length}</span>
            </div>
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
          </section>
        ))}
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
