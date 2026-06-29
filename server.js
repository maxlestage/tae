import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { BREWING, GLOSSARY, EXERCISES } from "./api-content.js";

const DIST = join(fileURLToPath(new URL(".", import.meta.url)), "dist");
const PORT = process.env.PORT || 3000;

// === API publique ========================================================
// Catalogue chargé en mémoire depuis dist/api/teas.json (généré au build).
let TEAS = [];
try {
  const raw = await readFile(join(DIST, "api", "teas.json"), "utf8");
  TEAS = JSON.parse(raw).teas ?? [];
} catch {
  console.warn("api: dist/api/teas.json introuvable (lancer `npm run build`).");
}

const LANGS = ["fr", "en", "es"];

// Envoi bas niveau : calcule un ETag fort sur le contenu et répond 304 si le
// client possède déjà la bonne version (If-None-Match).
function sendBody(req, res, status, headers, body) {
  if (status === 200) {
    const etag = `"${createHash("sha1").update(body).digest("base64")}"`;
    headers = { ...headers, etag };
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304, {
        etag,
        "access-control-allow-origin": "*",
        "cache-control": headers["cache-control"],
      });
      return res.end();
    }
  }
  res.writeHead(status, headers);
  res.end(body);
}

function jsonResponse(req, res, status, data) {
  sendBody(req, res, status, {
    "content-type": "application/json; charset=utf-8",
    // API publique : autorise la lecture depuis n'importe quel site.
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "cache-control": "public, max-age=300",
  }, JSON.stringify(data));
}

function htmlResponse(req, res, status, html) {
  sendBody(req, res, status, {
    "content-type": "text/html; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "public, max-age=300",
  }, html);
}

/** Aplati les champs traduits (name/description/ingredients) vers une langue. */
function localize(tea, lang) {
  if (!lang) return tea;
  const out = { ...tea, name: tea.name[lang], description: tea.description[lang] };
  if (tea.ingredients) out.ingredients = tea.ingredients[lang];
  return out;
}

const BOOL_FILTERS = ["caffeineFree", "pyramid", "coldBrew", "coffret", "limited"];
const SORT_FIELDS = ["id", "name", "family", "type"];

/** Clé de tri pour un sachet selon le champ demandé. */
function sortKey(tea, field, lang) {
  switch (field) {
    case "name":
      return tea.name[lang || "fr"].toLowerCase();
    case "family":
      return tea.family.toLowerCase();
    case "type":
      return tea.typeKey;
    default:
      return tea.id;
  }
}

/** Aplati un sachet en une ligne plate (pour l'export CSV). */
function flattenTea(tea, lang) {
  const flat = { id: tea.id };
  if (lang) {
    flat.name = tea.name[lang];
    flat.description = tea.description[lang];
  } else {
    for (const l of LANGS) flat[`name_${l}`] = tea.name[l];
    for (const l of LANGS) flat[`description_${l}`] = tea.description[l];
  }
  flat.type = tea.typeKey;
  flat.family = tea.family;
  flat.colorFrom = tea.colors[0];
  flat.colorTo = tea.colors[1];
  flat.ink = tea.ink;
  flat.caffeineFree = Boolean(tea.caffeineFree);
  flat.pyramid = Boolean(tea.pyramid);
  flat.coldBrew = Boolean(tea.coldBrew);
  flat.coffret = Boolean(tea.coffret);
  flat.limited = Boolean(tea.limited);
  flat.intensity = tea.intensity ?? "";
  if (lang) {
    flat.ingredients = tea.ingredients ? tea.ingredients[lang] : "";
  } else {
    for (const l of LANGS) flat[`ingredients_${l}`] = tea.ingredients ? tea.ingredients[l] : "";
  }
  return flat;
}

/** Sérialise des lignes plates en CSV (RFC 4180 : guillemets si besoin). */
function toCsv(rows) {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const r of rows) lines.push(cols.map((c) => esc(r[c])).join(","));
  return lines.join("\n");
}

function csvResponse(req, res, status, csv, filename) {
  sendBody(req, res, status, {
    "content-type": "text/csv; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "cache-control": "public, max-age=300",
    "content-disposition": `inline; filename="${filename}"`,
  }, csv);
}

/** Lit un entier ≥ 0 depuis la query ; renvoie undefined si absent, NaN si invalide. */
function parseIntParam(value) {
  if (value == null) return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
}

/** Champs exposés pour un sachet (sélection via ?fields=). */
const TEA_FIELDS = [
  "id", "name", "description", "typeKey", "family", "colors", "ink",
  "caffeineFree", "pyramid", "coldBrew", "coffret", "limited", "intensity",
  "ingredients",
];

/** Applique les filtres de query (family, type, booléens, search) au catalogue.
   La recherche porte sur le nom ET la description, dans les trois langues. */
function filterTeas(searchParams) {
  let result = TEAS;
  const family = searchParams.get("family");
  if (family) {
    result = result.filter(
      (t) => t.family.toLowerCase() === family.toLowerCase(),
    );
  }
  const type = searchParams.get("type");
  if (type) result = result.filter((t) => t.typeKey === type);
  for (const key of BOOL_FILTERS) {
    const v = searchParams.get(key);
    if (v === "true" || v === "false") {
      const want = v === "true";
      result = result.filter((t) => Boolean(t[key]) === want);
    }
  }
  const search = searchParams.get("search");
  if (search) {
    const q = search.toLowerCase();
    result = result.filter((t) =>
      LANGS.some(
        (l) =>
          t.name[l].toLowerCase().includes(q) ||
          t.description[l].toLowerCase().includes(q),
      ),
    );
  }
  return result;
}

/** Restreint un objet aux champs demandés (l'id est toujours conservé). */
function projectFields(obj, fields) {
  if (!fields) return obj;
  const out = {};
  if ("id" in obj) out.id = obj.id;
  for (const f of fields) if (f in obj) out[f] = obj[f];
  return out;
}

/** URL absolue du serveur, déduite des en-têtes (proxy Heroku inclus). */
function baseUrl(req) {
  const proto = req.headers["x-forwarded-proto"]?.split(",")[0] ?? "http";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "";
  return host ? `${proto}://${host}` : "";
}

/** Page de documentation écrite, autonome (sans CDN), décrivant tout l'API. */
function buildDocsHtml(base) {
  const families = [...new Set(TEAS.map((t) => t.family))];
  const types = [...new Set(TEAS.map((t) => t.typeKey))];
  const sample = TEAS[0]?.id ?? "yellow-label";
  const u = (p) => `${base}${p}`;

  const row = (name, values, desc) =>
    `<tr><td><code>${name}</code></td><td>${values}</td><td>${desc}</td></tr>`;

  const endpoint = (method, path, desc, body = "") => `
    <section class="ep">
      <h3><span class="method">${method}</span> <code>${path}</code></h3>
      <p>${desc}</p>
      ${body}
    </section>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Lipton — API publique · Documentation</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<style>
  :root { color-scheme: light dark; --bg:#fff; --fg:#1b1f27; --muted:#5d6675; --line:#e2e5ec; --card:#f7f8fa; --code:#f0eede; --accent:#e20025; --yellow:#ffe105; }
  @media (prefers-color-scheme: dark) { :root { --bg:#0f1115; --fg:#eef1f6; --muted:#9aa3b2; --line:#262c38; --card:#161a22; --code:#1d2230; } }
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; background:var(--bg); color:var(--fg); line-height:1.6; }
  .wrap { max-width: 880px; margin: 0 auto; padding: 2rem 1.25rem 4rem; }
  header { border-bottom: 4px solid var(--yellow); padding-bottom: 1rem; margin-bottom: 1.5rem; }
  h1 { margin:.2rem 0; font-size: clamp(1.6rem,4vw,2.4rem); }
  h1 .dot { color: var(--accent); }
  .lede { color: var(--muted); margin:.25rem 0 0; }
  a { color: var(--accent); }
  .badges { margin:.9rem 0 0; display:flex; gap:.4rem; flex-wrap:wrap; }
  .badge { font-size:.75rem; font-weight:700; border:1px solid var(--line); border-radius:999px; padding:.2rem .6rem; color:var(--muted); }
  h2 { margin-top:2.2rem; font-size:1.3rem; border-bottom:1px solid var(--line); padding-bottom:.3rem; }
  code { background:var(--code); padding:.1rem .35rem; border-radius:6px; font-size:.88em; }
  pre { background:var(--code); padding:.9rem 1rem; border-radius:12px; overflow:auto; }
  pre code { background:none; padding:0; }
  table { width:100%; border-collapse:collapse; margin:.6rem 0 0; font-size:.92rem; }
  th,td { text-align:left; padding:.45rem .5rem; border-bottom:1px solid var(--line); vertical-align:top; }
  th { color:var(--muted); font-size:.78rem; text-transform:uppercase; letter-spacing:.04em; }
  .ep { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:1rem 1.15rem; margin:1rem 0; }
  .ep h3 { margin:0 0 .35rem; font-size:1.05rem; }
  .method { display:inline-block; background:var(--accent); color:#fff; font-size:.72rem; font-weight:800; padding:.15rem .5rem; border-radius:6px; vertical-align:middle; }
  .links a { display:inline-block; margin-right:1rem; font-weight:700; }
  footer { margin-top:3rem; color:var(--muted); font-size:.82rem; text-align:center; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>API Lipton<span class="dot">.</span> <small style="font-weight:400;font-size:.5em;color:var(--muted)">Sachets de thé</small></h1>
    <p class="lede">API JSON <strong>publique</strong> et en lecture seule du catalogue Lipton vendu en France — ${TEAS.length} sachets.</p>
    <div class="badges">
      <span class="badge">Lecture seule</span>
      <span class="badge">CORS ouvert</span>
      <span class="badge">Sans clé / sans auth</span>
      <span class="badge">ETag · 304</span>
      <span class="badge">FR · EN · ES</span>
    </div>
    <p class="links" style="margin-top:1rem">
      <a href="${u("/api/playground")}">▶ Playground (tester en direct)</a>
      <a href="${u("/api/swagger")}">Swagger UI</a>
      <a href="${u("/api/openapi.json")}">openapi.json</a>
      <a href="/">← Retour à l'app</a>
    </p>
  </header>

  <h2>Bases</h2>
  <ul>
    <li>URL racine : <code>${base || "(même origine)"}/api</code> — versionnée : <code>${base || ""}/api/v1</code> (alias).</li>
    <li>Toutes les routes sont en <code>GET</code>. Réponses <code>application/json</code> (ou <code>text/csv</code>).</li>
    <li>CORS : <code>Access-Control-Allow-Origin: *</code> — utilisable depuis n'importe quel site.</li>
    <li>Cache : chaque réponse porte un <code>ETag</code> ; un <code>If-None-Match</code> renvoie <code>304 Not Modified</code>.</li>
    <li>Hypermedia : les listes incluent <code>meta</code> (page, pages, perPage) et <code>_links</code> (self, next, prev…) ; chaque sachet a <code>_links.self</code>.</li>
    <li>Erreurs : <code>400</code> (paramètre invalide, avec les valeurs permises), <code>404</code> (introuvable).</li>
  </ul>

  <h2>Endpoints</h2>
  ${endpoint("GET", "/api", "Index auto-documenté : liste des endpoints et nombre de sachets.")}
  ${endpoint("GET", "/api/teas", "Liste des sachets — filtrable, triable, paginée, en JSON ou CSV.",
    `<table><thead><tr><th>Paramètre</th><th>Valeurs</th><th>Rôle</th></tr></thead><tbody>
      ${row("family", families.join(" · "), "Filtre par famille de couleur")}
      ${row("type", types.join(" · "), "Filtre par type de thé")}
      ${row("search", "texte libre", "Cherche dans le nom ET la description (3 langues)")}
      ${row("caffeineFree, pyramid,<br>coldBrew, coffret, limited", "true · false", "Filtres booléens")}
      ${row("sort", "id · name · family · type", "Champ de tri")}
      ${row("order", "asc · desc", "Sens du tri (défaut asc)")}
      ${row("limit, offset", "entiers ≥ 0", "Pagination (réponse : total, count, offset, limit)")}
      ${row("lang", LANGS.join(" · "), "Aplatit name/description/ingredients dans cette langue")}
      ${row("fields", "ex. id,name,colors", "Ne renvoie que ces champs (id toujours inclus)")}
      ${row("format", "json · csv", "Format de sortie (CSV = export tableur)")}
    </tbody></table>`)}
  ${endpoint("GET", "/api/teas/random", "Un sachet au hasard. Respecte tous les filtres ci-dessus, plus lang et fields.")}
  ${endpoint("GET", "/api/teas/{id}", `Un sachet par identifiant (ex. <code>${sample}</code>). Accepte lang, fields et format=csv.`)}
  ${endpoint("GET", "/api/families", "Familles de couleur et nombre de sachets dans chacune.")}
  ${endpoint("GET", "/api/types", "Types de thé et nombre de sachets dans chacun.")}
  ${endpoint("GET", "/api/stats", "Statistiques : total, répartition par famille et par type, compteurs d'options.")}
  ${endpoint("GET", "/api/openapi.json", "Spécification OpenAPI 3.1 (génération de clients, import dans Postman/Insomnia).")}
  ${endpoint("GET", "/api/swagger", "Documentation interactive Swagger UI.")}

  <h2>Pour apprendre 🎓</h2>
  <p>Endpoints pédagogiques pour s'entraîner à consommer une API.</p>
  ${endpoint("GET", "/api/brewing", "Guide d'infusion par type : température (°C), durée (min) et conseils. Paramètres <code>type</code>, <code>lang</code>.")}
  ${endpoint("GET", "/api/glossary", "Glossaire des termes (théine, rooibos, pyramide, cold brew…). Paramètre <code>lang</code>.")}
  ${endpoint("GET", "/api/quiz", "Une question générée depuis le catalogue, avec <code>options</code> et <code>answer</code>. Paramètre <code>lang</code>.")}
  ${endpoint("GET", "/api/exercises", "Une série d'exercices guidés (but, endpoint à appeler, indice). Paramètre <code>lang</code>.")}

  <h2>Objet « sachet »</h2>
  <table><thead><tr><th>Champ</th><th>Type</th><th>Description</th></tr></thead><tbody>
    ${row("id", "string", "Identifiant unique (slug)")}
    ${row("name", "objet {fr,en,es} ou string", "Nom (aplati si ?lang=)")}
    ${row("description", "objet {fr,en,es} ou string", "Description (aplatie si ?lang=)")}
    ${row("typeKey", "string", "Type de thé")}
    ${row("family", "string", "Famille de couleur")}
    ${row("colors", "[string, string]", "Dégradé : [teinte, accent] en hex")}
    ${row("ink", "string", "Couleur de texte lisible sur le dégradé")}
    ${row("caffeineFree", "boolean", "Sans théine")}
    ${row("pyramid, coldBrew,<br>coffret, limited", "boolean", "Gammes / options")}
    ${row("intensity", "integer", "Intensité 1–5 (0 pour un coffret)")}
    ${row("ingredients", "objet {fr,en,es}, string ou null", "Ingrédients (null pour un coffret)")}
  </tbody></table>

  <h2>Exemples</h2>
  <pre><code># Tous les sachets, triés par nom (FR)
curl "${u("/api/teas?sort=name&lang=fr")}"

# Thés verts sans théine, 5 premiers, champs réduits
curl "${u("/api/teas?family=Vert&caffeineFree=true&limit=5&fields=id,name,intensity")}"

# Recherche « menthe » (nom + description, toutes langues)
curl "${u("/api/teas?search=menthe&lang=fr")}"

# Un sachet précis
curl "${u(`/api/teas/${sample}?lang=en`)}"

# Export CSV complet
curl "${u("/api/teas?format=csv")}" -o sachets.csv

# Un sachet au hasard, et les statistiques
curl "${u("/api/teas/random")}"
curl "${u("/api/stats")}"</code></pre>

  <footer>Catalogue généré depuis la source unique de l'app · ${TEAS.length} sachets · lecture seule.</footer>
</div>
</body>
</html>`;
}

/** Page « playground » : tester les requêtes en direct, et faire les exercices. */
function buildPlaygroundHtml(base) {
  const attr = (s) =>
    String(s).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");

  const card = (e, i) => `
    <div class="ex">
      <h3>${e.title.fr}</h3>
      <p class="goal">${e.goal.fr}</p>
      <p><code>GET ${attr(e.endpoint)}</code></p>
      <div class="ex__bar">
        <button class="run" data-path="${attr(e.endpoint)}" data-out="ex${i}">Exécuter ▶</button>
        <details><summary>Indice</summary><p>${e.hint.fr}</p></details>
      </div>
      <pre id="ex${i}" class="out" hidden></pre>
    </div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Lipton — API · Playground</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<style>
  :root { color-scheme: light dark; --bg:#fff; --fg:#1b1f27; --muted:#5d6675; --line:#e2e5ec; --card:#f7f8fa; --code:#f0eede; --accent:#e20025; --yellow:#ffe105; --ok:#2e9e4f; }
  @media (prefers-color-scheme: dark) { :root { --bg:#0f1115; --fg:#eef1f6; --muted:#9aa3b2; --line:#262c38; --card:#161a22; --code:#1d2230; } }
  * { box-sizing: border-box; }
  body { margin:0; font-family: system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; background:var(--bg); color:var(--fg); line-height:1.55; }
  .wrap { max-width: 880px; margin:0 auto; padding: 2rem 1.25rem 4rem; }
  header { border-bottom: 4px solid var(--yellow); padding-bottom:1rem; margin-bottom:1.5rem; }
  h1 { margin:.2rem 0; font-size: clamp(1.6rem,4vw,2.4rem); } h1 .dot{ color:var(--accent); }
  .lede { color:var(--muted); margin:.25rem 0 0; }
  a { color:var(--accent); font-weight:700; }
  .links a { margin-right:1rem; display:inline-block; margin-top:.6rem; }
  h2 { margin-top:2rem; font-size:1.25rem; border-bottom:1px solid var(--line); padding-bottom:.3rem; }
  code { background:var(--code); padding:.1rem .35rem; border-radius:6px; font-size:.88em; }
  button { font: inherit; font-weight:700; cursor:pointer; border:none; border-radius:10px; padding:.5rem .9rem; background:var(--accent); color:#fff; }
  button:hover { filter:brightness(1.08); }
  input { font: inherit; width:100%; padding:.6rem .7rem; border:1px solid var(--line); border-radius:10px; background:var(--bg); color:var(--fg); }
  .bar { display:flex; gap:.5rem; margin:.6rem 0; }
  .bar button { white-space:nowrap; }
  .quick { display:flex; flex-wrap:wrap; gap:.4rem; margin:.4rem 0 0; }
  .quick button { background:var(--card); color:var(--fg); border:1px solid var(--line); font-weight:600; font-size:.82rem; padding:.3rem .6rem; }
  pre.out { background:var(--code); padding:.85rem 1rem; border-radius:12px; overflow:auto; max-height:360px; margin:.6rem 0 0; font-size:.85rem; }
  .status { font-weight:800; } .status.ok{ color:var(--ok); } .status.err{ color:var(--accent); }
  .ex { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:1rem 1.15rem; margin:1rem 0; }
  .ex h3 { margin:0 0 .25rem; font-size:1.05rem; }
  .ex .goal { margin:.1rem 0 .5rem; }
  .ex__bar { display:flex; align-items:center; gap:1rem; flex-wrap:wrap; }
  details summary { cursor:pointer; color:var(--muted); }
  footer { margin-top:3rem; color:var(--muted); font-size:.82rem; text-align:center; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Playground API<span class="dot">.</span></h1>
    <p class="lede">Teste les requêtes en direct et fais les exercices — tout s'exécute dans ton navigateur, sur la vraie API.</p>
    <p class="links">
      <a href="/api/docs">← Documentation</a>
      <a href="/api/swagger">Swagger UI</a>
      <a href="/">App</a>
    </p>
  </header>

  <h2>Essai libre</h2>
  <p>Écris un chemin d'API puis envoie. Exemple : <code>/api/v1/teas?family=Vert&amp;lang=fr&amp;limit=5</code></p>
  <div class="bar">
    <input id="freeUrl" value="/api/v1/teas?lang=fr&amp;limit=5" spellcheck="false" />
    <button id="freeSend">Envoyer ▶</button>
  </div>
  <div class="quick">
    <button data-q="/api/v1/teas?limit=5&amp;lang=fr">teas (5)</button>
    <button data-q="/api/v1/teas/yellow-label?lang=fr">un sachet</button>
    <button data-q="/api/v1/teas/random?lang=fr">au hasard</button>
    <button data-q="/api/v1/stats">stats</button>
    <button data-q="/api/v1/brewing?type=greenTea&amp;lang=fr">infusion</button>
    <button data-q="/api/v1/glossary?lang=fr">glossaire</button>
    <button data-q="/api/v1/quiz?lang=fr">quiz</button>
  </div>
  <pre id="freeOut" class="out" hidden></pre>

  <h2>Exercices 🎓</h2>
  ${EXERCISES.map(card).join("")}

  <footer>API publique en lecture seule · ${TEAS.length} sachets · aucune clé requise.</footer>
</div>
<script>
  async function run(path, outId) {
    const out = document.getElementById(outId);
    out.hidden = false;
    out.textContent = "…";
    try {
      const t0 = performance.now();
      const r = await fetch(path, { headers: { accept: "application/json" } });
      const ms = Math.round(performance.now() - t0);
      const ct = r.headers.get("content-type") || "";
      let body = await r.text();
      if (ct.includes("json")) { try { body = JSON.stringify(JSON.parse(body), null, 2); } catch (_) {} }
      const cls = r.ok ? "ok" : "err";
      out.innerHTML = "<span class='status " + cls + "'>GET " + path + "\\n" + r.status + " " + r.statusText + " · " + ms + " ms</span>\\n\\n";
      out.appendChild(document.createTextNode(body));
    } catch (e) {
      out.textContent = "Erreur réseau : " + e.message;
    }
  }
  document.querySelectorAll(".run").forEach((b) => {
    b.addEventListener("click", () => run(b.dataset.path, b.dataset.out));
  });
  document.getElementById("freeSend").addEventListener("click", () => {
    run(document.getElementById("freeUrl").value.trim(), "freeOut");
  });
  document.getElementById("freeUrl").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("freeSend").click();
  });
  document.querySelectorAll(".quick button").forEach((b) => {
    b.addEventListener("click", () => {
      document.getElementById("freeUrl").value = b.dataset.q;
      document.getElementById("freeSend").click();
    });
  });
</script>
</body>
</html>`;
}

/** Spécification OpenAPI 3.1 décrivant l'API (pour Swagger / génération de clients). */
function buildOpenApi(base) {
  const langParam = {
    name: "lang", in: "query", required: false,
    schema: { type: "string", enum: LANGS },
    description: "Aplatit name/description dans cette langue.",
  };
  const fieldsParam = {
    name: "fields", in: "query", required: false,
    schema: { type: "string" },
    description: "Liste de champs séparés par des virgules à conserver.",
  };
  return {
    openapi: "3.1.0",
    info: {
      title: "Lipton France — Sachets de thé",
      version: "1.0.0",
      description: "API publique en lecture seule du catalogue Lipton vendu en France.",
    },
    servers: [{ url: base || "/" }],
    paths: {
      "/api/teas": {
        get: {
          summary: "Liste des sachets (filtrée, triée, paginée, JSON ou CSV)",
          parameters: [
            { name: "family", in: "query", schema: { type: "string" } },
            { name: "type", in: "query", schema: { type: "string" } },
            { name: "search", in: "query", schema: { type: "string" } },
            ...BOOL_FILTERS.map((b) => ({
              name: b, in: "query", schema: { type: "boolean" },
            })),
            { name: "sort", in: "query", schema: { type: "string", enum: SORT_FIELDS } },
            { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
            { name: "limit", in: "query", schema: { type: "integer", minimum: 0 } },
            { name: "offset", in: "query", schema: { type: "integer", minimum: 0 } },
            { name: "format", in: "query", schema: { type: "string", enum: ["json", "csv"] } },
            langParam, fieldsParam,
          ],
          responses: { 200: { description: "Liste paginée des sachets." } },
        },
      },
      "/api/teas/random": {
        get: {
          summary: "Un sachet au hasard (respecte les filtres)",
          parameters: [langParam, fieldsParam],
          responses: { 200: { description: "Un sachet." }, 404: { description: "Aucun sachet ne correspond." } },
        },
      },
      "/api/teas/{id}": {
        get: {
          summary: "Un sachet par identifiant",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string" } },
            { name: "format", in: "query", schema: { type: "string", enum: ["json", "csv"] } },
            langParam, fieldsParam,
          ],
          responses: {
            200: { description: "Le sachet.", content: { "application/json": { schema: { $ref: "#/components/schemas/Tea" } } } },
            404: { description: "Sachet introuvable." },
          },
        },
      },
      "/api/families": { get: { summary: "Familles de couleur et compteurs", responses: { 200: { description: "OK" } } } },
      "/api/types": { get: { summary: "Types de thé et compteurs", responses: { 200: { description: "OK" } } } },
      "/api/stats": { get: { summary: "Statistiques du catalogue", responses: { 200: { description: "OK" } } } },
      "/api/brewing": {
        get: {
          summary: "Guide d'infusion par type (température, durée, conseils)",
          parameters: [
            { name: "type", in: "query", schema: { type: "string", enum: Object.keys(BREWING) } },
            langParam,
          ],
          responses: { 200: { description: "OK" } },
        },
      },
      "/api/glossary": { get: { summary: "Glossaire des termes", parameters: [langParam], responses: { 200: { description: "OK" } } } },
      "/api/quiz": { get: { summary: "Une question de quiz générée depuis le catalogue", parameters: [langParam], responses: { 200: { description: "OK" } } } },
      "/api/exercises": { get: { summary: "Exercices pratiques", parameters: [langParam], responses: { 200: { description: "OK" } } } },
    },
    components: {
      schemas: {
        Localized: {
          type: "object",
          properties: Object.fromEntries(LANGS.map((l) => [l, { type: "string" }])),
        },
        Tea: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Localized" }] },
            description: { oneOf: [{ type: "string" }, { $ref: "#/components/schemas/Localized" }] },
            typeKey: { type: "string" },
            family: { type: "string" },
            colors: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 2 },
            ink: { type: "string" },
            caffeineFree: { type: "boolean" },
            pyramid: { type: "boolean" },
            coldBrew: { type: "boolean" },
            coffret: { type: "boolean" },
            limited: { type: "boolean" },
            intensity: { type: "integer", description: "Intensité 1–5 ; 0 pour un coffret." },
            ingredients: {
              description: "Ingrédients (objet par langue, chaîne si ?lang=, ou null pour un coffret).",
              oneOf: [
                { type: "string" },
                { $ref: "#/components/schemas/Localized" },
                { type: "null" },
              ],
            },
          },
          required: ["id", "name", "description", "typeKey", "family", "colors", "ink", "caffeineFree", "intensity"],
        },
      },
    },
  };
}

function handleApi(req, res, pathname, searchParams) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    });
    return res.end();
  }
  if (req.method !== "GET") {
    return jsonResponse(req, res, 405, { error: "Method not allowed" });
  }

  // Versionnage : /api/v1/... est un alias de /api/... On conserve le préfixe
  // utilisé par le client pour construire des liens hypermedia cohérents.
  const versioned = pathname === "/api/v1" || pathname.startsWith("/api/v1/");
  const apiPrefix = versioned ? "/api/v1" : "/api";
  if (versioned) pathname = "/api" + pathname.slice("/api/v1".length);
  const apiBase = `${baseUrl(req)}${apiPrefix}`;

  const lang = searchParams.get("lang");
  if (lang && !LANGS.includes(lang)) {
    return jsonResponse(req, res, 400, {
      error: `Unknown lang '${lang}'`,
      allowed: LANGS,
    });
  }

  // Sélection de champs (?fields=id,name,colors), validée pour aider aux typos.
  let fields = null;
  const fieldsRaw = searchParams.get("fields");
  if (fieldsRaw) {
    fields = fieldsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    const bad = fields.filter((f) => !TEA_FIELDS.includes(f));
    if (bad.length) {
      return jsonResponse(req, res, 400, {
        error: `Unknown field(s): ${bad.join(", ")}`,
        allowed: TEA_FIELDS,
      });
    }
  }

  // Index / documentation de l'API.
  if (pathname === "/api" || pathname === "/api/") {
    return jsonResponse(req, res, 200, {
      name: "Lipton France — Sachets de thé",
      description: "API publique en lecture seule du catalogue Lipton vendu en France.",
      count: TEAS.length,
      languages: LANGS,
      version: "v1",
      versionedBase: "/api/v1",
      endpoints: {
        "GET /api/teas": "Liste des sachets. Filtres: family, type, search, lang, caffeineFree, pyramid, coldBrew, coffret, limited. Tri: sort (id|name|family|type), order (asc|desc). Pagination: limit, offset (réponse avec meta + _links). Format: format (json|csv). Champs: fields.",
        "GET /api/teas/random": "Un sachet au hasard (respecte les filtres et lang/fields).",
        "GET /api/teas/:id": "Un sachet par identifiant (ex: /api/teas/yellow-label). Format: format (json|csv). Champs: fields.",
        "GET /api/families": "Familles de couleur et leur nombre de sachets.",
        "GET /api/types": "Types de thé et leur nombre de sachets.",
        "GET /api/stats": "Statistiques du catalogue (totaux par famille, type, options).",
        "GET /api/brewing": "Guide d'infusion par type (température, durée, conseils). ?type=, ?lang=.",
        "GET /api/glossary": "Glossaire des termes (théine, rooibos, pyramide…). ?lang=.",
        "GET /api/quiz": "Une question de quiz générée depuis le catalogue. ?lang=.",
        "GET /api/exercises": "Exercices pratiques pour apprendre à consommer l'API. ?lang=.",
        "GET /api/openapi.json": "Spécification OpenAPI 3.1 de l'API.",
        "GET /api/docs": "Documentation écrite et complète (page HTML).",
        "GET /api/swagger": "Documentation interactive (Swagger UI).",
        "GET /api/playground": "Bac à sable : tester les requêtes en direct et faire les exercices.",
      },
      note: "Toutes les routes existent aussi sous /api/v1/… (versionnage).",
    });
  }

  // Spécification OpenAPI (avant les autres routes : chemin fixe).
  if (pathname === "/api/openapi.json") {
    return jsonResponse(req, res, 200, buildOpenApi(baseUrl(req)));
  }

  // Documentation écrite (page autonome, sans dépendance externe).
  if (pathname === "/api/docs" || pathname === "/api/docs/") {
    return htmlResponse(req, res, 200, buildDocsHtml(baseUrl(req)));
  }

  // Playground : tester les requêtes en direct et faire les exercices.
  if (pathname === "/api/playground" || pathname === "/api/playground/") {
    return htmlResponse(req, res, 200, buildPlaygroundHtml(baseUrl(req)));
  }

  // Documentation interactive Swagger UI (consomme /api/openapi.json).
  if (pathname === "/api/swagger" || pathname === "/api/swagger/") {
    const specUrl = `${baseUrl(req)}/api/openapi.json`;
    const html = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Lipton — API · Documentation</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js" crossorigin></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: ${JSON.stringify(specUrl)},
        dom_id: "#swagger-ui",
        deepLinking: true,
      });
    </script>
  </body>
</html>`;
    return htmlResponse(req, res, 200, html);
  }

  // Statistiques du catalogue.
  if (pathname === "/api/stats") {
    const byFamily = {};
    const byType = {};
    const options = { caffeineFree: 0, pyramid: 0, coldBrew: 0, coffret: 0, limited: 0 };
    for (const t of TEAS) {
      byFamily[t.family] = (byFamily[t.family] ?? 0) + 1;
      byType[t.typeKey] = (byType[t.typeKey] ?? 0) + 1;
      for (const k of BOOL_FILTERS) if (t[k]) options[k] += 1;
    }
    return jsonResponse(req, res, 200, { total: TEAS.length, byFamily, byType, options });
  }

  // Liste filtrée, triée, paginée, en JSON ou CSV.
  if (pathname === "/api/teas" || pathname === "/api/teas/") {
    const format = searchParams.get("format") ?? "json";
    if (format !== "json" && format !== "csv") {
      return jsonResponse(req, res, 400, {
        error: `Unknown format '${format}'`,
        allowed: ["json", "csv"],
      });
    }

    let result = filterTeas(searchParams);

    // Tri.
    const sort = searchParams.get("sort");
    if (sort) {
      if (!SORT_FIELDS.includes(sort)) {
        return jsonResponse(req, res, 400, {
          error: `Unknown sort field '${sort}'`,
          allowed: SORT_FIELDS,
        });
      }
      const order = searchParams.get("order") ?? "asc";
      if (order !== "asc" && order !== "desc") {
        return jsonResponse(req, res, 400, {
          error: `Unknown order '${order}'`,
          allowed: ["asc", "desc"],
        });
      }
      const dir = order === "desc" ? -1 : 1;
      result = [...result].sort((a, b) => {
        const ka = sortKey(a, sort, lang);
        const kb = sortKey(b, sort, lang);
        return ka < kb ? -dir : ka > kb ? dir : 0;
      });
    }

    // Pagination.
    const total = result.length;
    const limit = parseIntParam(searchParams.get("limit"));
    const offset = parseIntParam(searchParams.get("offset"));
    if (Number.isNaN(limit) || Number.isNaN(offset)) {
      return jsonResponse(req, res, 400, {
        error: "limit and offset must be integers ≥ 0",
      });
    }
    const start = offset ?? 0;
    const page =
      limit === undefined ? result.slice(start) : result.slice(start, start + limit);

    if (format === "csv") {
      return csvResponse(
        req,
        res,
        200,
        toCsv(page.map((t) => flattenTea(t, lang))),
        "lipton-teas.csv",
      );
    }

    // Liens hypermedia (HATEOAS) : navigation entre pages et vers chaque sachet.
    const perPage = limit ?? total;
    const pages = perPage > 0 ? Math.max(1, Math.ceil(total / perPage)) : 1;
    const pageNo = perPage > 0 ? Math.floor(start / perPage) + 1 : 1;
    const pageUrl = (off) => {
      const sp = new URLSearchParams(searchParams);
      sp.set("offset", String(off));
      return `${apiBase}/teas?${sp.toString()}`;
    };
    const links = { self: pageUrl(start) };
    if (limit !== undefined) {
      links.first = pageUrl(0);
      links.last = pageUrl(Math.max(0, (pages - 1) * perPage));
      links.prev = start > 0 ? pageUrl(Math.max(0, start - limit)) : null;
      links.next = start + limit < total ? pageUrl(start + limit) : null;
    }

    return jsonResponse(req, res, 200, {
      total,
      count: page.length,
      offset: start,
      limit: limit ?? null,
      meta: { page: pageNo, pages, perPage: limit ?? total },
      _links: links,
      teas: page.map((t) => ({
        ...projectFields(localize(t, lang), fields),
        _links: { self: `${apiBase}/teas/${t.id}` },
      })),
    });
  }

  // Réponse d'un sachet unique, avec ses liens hypermedia.
  const teaResponse = (tea) => ({
    ...projectFields(localize(tea, lang), fields),
    _links: { self: `${apiBase}/teas/${tea.id}`, collection: `${apiBase}/teas` },
  });

  // Un sachet au hasard (respecte les filtres). Avant le matcher :id.
  if (pathname === "/api/teas/random") {
    const pool = filterTeas(searchParams);
    if (pool.length === 0) {
      return jsonResponse(req, res, 404, { error: "No tea matches the filters" });
    }
    const tea = pool[Math.floor(Math.random() * pool.length)];
    return jsonResponse(req, res, 200, teaResponse(tea));
  }

  // Un sachet par identifiant.
  const single = pathname.match(/^\/api\/teas\/([^/]+)\/?$/);
  if (single) {
    const id = decodeURIComponent(single[1]);
    const tea = TEAS.find((t) => t.id === id);
    if (!tea) return jsonResponse(req, res, 404, { error: `Tea '${id}' not found` });
    if (searchParams.get("format") === "csv") {
      return csvResponse(req, res, 200, toCsv([flattenTea(tea, lang)]), `${id}.csv`);
    }
    return jsonResponse(req, res, 200, teaResponse(tea));
  }

  // Agrégations.
  if (pathname === "/api/families") {
    const counts = {};
    for (const t of TEAS) counts[t.family] = (counts[t.family] ?? 0) + 1;
    return jsonResponse(req, res, 200, {
      families: Object.entries(counts).map(([family, count]) => ({ family, count })),
    });
  }
  if (pathname === "/api/types") {
    const counts = {};
    for (const t of TEAS) counts[t.typeKey] = (counts[t.typeKey] ?? 0) + 1;
    return jsonResponse(req, res, 200, {
      types: Object.entries(counts).map(([type, count]) => ({ type, count })),
    });
  }

  // === Contenu pédagogique (pour les étudiants) ===========================

  // Guide d'infusion par type (température, durée, conseils). ?type= et ?lang=.
  if (pathname === "/api/brewing") {
    const type = searchParams.get("type");
    if (type && !BREWING[type]) {
      return jsonResponse(req, res, 400, {
        error: `Unknown type '${type}'`,
        allowed: Object.keys(BREWING),
      });
    }
    const entries = (type ? [type] : Object.keys(BREWING)).map((k) => {
      const g = BREWING[k];
      return {
        type: k,
        tempC: g.tempC,
        minutes: g.minutes,
        tips: lang ? g.tips[lang] : g.tips,
      };
    });
    return jsonResponse(req, res, 200, { brewing: entries });
  }

  // Glossaire des termes. ?lang= aplatit les définitions.
  if (pathname === "/api/glossary") {
    return jsonResponse(req, res, 200, {
      glossary: GLOSSARY.map((g) => ({
        term: g.term,
        definition: lang ? g.definition[lang] : g.definition,
      })),
    });
  }

  // Exercices pratiques. ?lang= aplatit les textes.
  if (pathname === "/api/exercises") {
    const tr = (o) => (lang ? o[lang] : o);
    return jsonResponse(req, res, 200, {
      exercises: EXERCISES.map((e) => ({
        id: e.id,
        title: tr(e.title),
        goal: tr(e.goal),
        endpoint: `${apiBase}${e.endpoint.replace(/^\/api\/v1/, "")}`,
        hint: tr(e.hint),
      })),
    });
  }

  // Quiz : une question générée depuis le catalogue. ?lang= pour la langue.
  if (pathname === "/api/quiz") {
    const ql = lang ?? "fr";
    const tea = TEAS[Math.floor(Math.random() * TEAS.length)];
    const families = [...new Set(TEAS.map((t) => t.family))];
    // 4 options : la bonne + 3 autres familles au hasard.
    const others = families.filter((f) => f !== tea.family);
    for (let i = others.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [others[i], others[j]] = [others[j], others[i]];
    }
    const options = [tea.family, ...others.slice(0, 3)];
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    const prompt = {
      fr: `À quelle famille de couleur appartient « ${tea.name.fr} » ?`,
      en: `Which colour family does "${tea.name.en}" belong to?`,
      es: `¿A qué familia de color pertenece «${tea.name.es}»?`,
    };
    return jsonResponse(req, res, 200, {
      teaId: tea.id,
      question: lang ? prompt[ql] : prompt,
      options,
      answer: tea.family,
    });
  }

  return jsonResponse(req, res, 404, { error: "Unknown API endpoint" });
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://x");
    let pathname = decodeURIComponent(url.pathname);

    // API publique (JSON) avant le service de fichiers statiques.
    if (pathname === "/api" || pathname.startsWith("/api/")) {
      return handleApi(req, res, pathname, url.searchParams);
    }

    if (pathname === "/") pathname = "/index.html";

    // Empêche les remontées de répertoire (path traversal).
    let filePath = normalize(join(DIST, pathname));
    if (filePath !== DIST && !filePath.startsWith(DIST + sep)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    let body;
    try {
      body = await readFile(filePath);
    } catch {
      // Fallback SPA : on renvoie index.html.
      filePath = join(DIST, "index.html");
      body = await readFile(filePath);
    }

    // Pour le HTML, on remplace __BASE_URL__ par l'URL absolue du site,
    // afin que les aperçus de lien (Open Graph) pointent vers la bonne image.
    if (extname(filePath) === ".html") {
      const proto =
        req.headers["x-forwarded-proto"]?.split(",")[0] ?? "https";
      const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "";
      const base = host ? `${proto}://${host}` : "";
      body = Buffer.from(body.toString("utf8").replaceAll("__BASE_URL__", base));
    }

    res.writeHead(200, {
      "content-type": MIME[extname(filePath)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(500);
    res.end("Internal Server Error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Lipton tea colors — serving ./dist on :${PORT}`);
});
