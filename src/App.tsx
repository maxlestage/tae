import { useEffect, useMemo, useState } from "react";
import {
  TEAS,
  FAMILY_ORDER,
  FAMILY_SWATCH,
  type ColorFamily,
  type TeaSachet,
} from "./data.ts";

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
  onOpen,
}: {
  tea: TeaSachet;
  onOpen: (tea: TeaSachet) => void;
}) {
  return (
    <button
      type="button"
      className="card"
      style={{ background: teaGradient(tea.colors), color: tea.ink }}
      onClick={() => onOpen(tea)}
      aria-label={`Ouvrir la fiche ${tea.name}`}
    >
      <div className="card__top">
        <span className="card__type">{tea.type}</span>
        <span
          className="card__caffeine"
          style={{ borderColor: tea.ink, color: tea.ink }}
        >
          {tea.caffeine}
        </span>
      </div>

      <Sachet tea={tea} />

      <h3 className="card__name">{tea.name}</h3>
      <p className="card__desc">{tea.description}</p>

      <span className="card__open" style={{ borderColor: tea.ink }}>
        Ouvrir la fiche →
      </span>
    </button>
  );
}

function TeaModal({
  tea,
  onClose,
}: {
  tea: TeaSachet;
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
        style={{ background: teaGradient(tea.colors), color: tea.ink }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="modal__close"
          style={{ color: tea.ink, borderColor: tea.ink }}
          onClick={onClose}
          aria-label="Fermer"
        >
          ✕
        </button>

        <div className="modal__head">
          <Sachet tea={tea} />
          <div>
            <span className="card__type">{tea.type}</span>
            <h2 className="modal__name">{tea.name}</h2>
          </div>
        </div>

        <p className="modal__desc">{tea.description}</p>

        <dl className="modal__facts">
          <div className="fact">
            <dt>Couleur</dt>
            <dd>{tea.family}</dd>
          </div>
          <div className="fact">
            <dt>Théine</dt>
            <dd>{tea.caffeine}</dd>
          </div>
          <div className="fact">
            <dt>Type</dt>
            <dd>{tea.type}</dd>
          </div>
        </dl>

        <div className="modal__palette">
          <span className="modal__palette-label">Dégradé du thé</span>
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

export function App() {
  const [active, setActive] = useState<ColorFamily | "Toutes">("Toutes");
  const [selected, setSelected] = useState<TeaSachet | null>(null);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("tea-theme", theme);
  }, [theme]);

  const groups = useMemo(() => {
    return FAMILY_ORDER.map((family) => ({
      family,
      teas: TEAS.filter((t) => t.family === family),
    })).filter((g) => g.teas.length > 0);
  }, []);

  const visibleGroups =
    active === "Toutes" ? groups : groups.filter((g) => g.family === active);

  return (
    <div className="page">
      <button
        type="button"
        className="theme-toggle"
        onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        aria-label={
          theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"
        }
      >
        {theme === "dark" ? "☀️ Clair" : "🌙 Sombre"}
      </button>

      <header className="hero">
        <p className="hero__kicker">Collection</p>
        <h1 className="hero__title">
          Sachets de thé <LiptonLogo className="lipton-logo--hero" />
        </h1>
        <p className="hero__subtitle">
          Triés par couleurs — clique sur un thé pour ouvrir sa fiche colorée.
        </p>

        <nav className="filters">
          <button
            className={`chip ${active === "Toutes" ? "chip--on" : ""}`}
            onClick={() => setActive("Toutes")}
          >
            <span className="chip__dot chip__dot--all" />
            Toutes ({TEAS.length})
          </button>
          {FAMILY_ORDER.map((family) => (
            <button
              key={family}
              className={`chip ${active === family ? "chip--on" : ""}`}
              onClick={() => setActive(family)}
            >
              <span
                className="chip__dot"
                style={{ background: FAMILY_SWATCH[family] }}
              />
              {family}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {visibleGroups.map((group) => (
          <section key={group.family} className="group">
            <div className="group__head">
              <span
                className="group__dot"
                style={{ background: FAMILY_SWATCH[group.family] }}
              />
              <h2 className="group__title">{group.family}</h2>
              <span className="group__count">{group.teas.length}</span>
            </div>
            <div className="grid">
              {group.teas.map((tea) => (
                <TeaCard key={tea.id} tea={tea} onOpen={setSelected} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="footer">
        Fiches couleurs · {TEAS.length} sachets · React + Node
      </footer>

      {selected && (
        <TeaModal tea={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
