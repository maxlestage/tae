import { useMemo, useState } from "react";
import {
  TEAS,
  FAMILY_ORDER,
  FAMILY_SWATCH,
  type ColorFamily,
  type TeaSachet,
} from "./data.ts";

function TeaCard({ tea }: { tea: TeaSachet }) {
  const [from, to] = tea.colors;
  return (
    <article
      className="card"
      style={{
        background: `linear-gradient(145deg, ${from}, ${to})`,
        color: tea.ink,
      }}
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

      <div className="card__sachet" aria-hidden="true">
        <span className="card__string" style={{ background: tea.ink }} />
        <span className="card__bag" style={{ borderColor: tea.ink }}>
          <span className="card__tag" style={{ background: tea.ink, color: from }}>
            Lipton
          </span>
        </span>
      </div>

      <h3 className="card__name">{tea.name}</h3>
      <p className="card__desc">{tea.description}</p>

      <div className="card__swatches">
        {tea.colors.map((c) => (
          <span key={c} className="card__swatch" style={{ background: c }}>
            <code style={{ color: tea.ink }}>{c}</code>
          </span>
        ))}
      </div>
    </article>
  );
}

export function App() {
  const [active, setActive] = useState<ColorFamily | "Toutes">("Toutes");

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
      <header className="hero">
        <p className="hero__kicker">Collection</p>
        <h1 className="hero__title">
          Sachets de thé <span className="hero__brand">Lipton</span>
        </h1>
        <p className="hero__subtitle">
          Triés par couleurs — chaque fiche prend les teintes du thé ou de sa
          boîte.
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
                <TeaCard key={tea.id} tea={tea} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="footer">
        Fiches couleurs · {TEAS.length} sachets · React + Bun
      </footer>
    </div>
  );
}
