import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

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
      endpoints: {
        "GET /api/teas": "Liste des sachets. Filtres: family, type, search, lang, caffeineFree, pyramid, coldBrew, coffret, limited. Tri: sort (id|name|family|type), order (asc|desc). Pagination: limit, offset. Format: format (json|csv). Champs: fields.",
        "GET /api/teas/random": "Un sachet au hasard (respecte les filtres et lang/fields).",
        "GET /api/teas/:id": "Un sachet par identifiant (ex: /api/teas/yellow-label). Format: format (json|csv). Champs: fields.",
        "GET /api/families": "Familles de couleur et leur nombre de sachets.",
        "GET /api/types": "Types de thé et leur nombre de sachets.",
        "GET /api/stats": "Statistiques du catalogue (totaux par famille, type, options).",
        "GET /api/openapi.json": "Spécification OpenAPI 3.1 de l'API.",
        "GET /api/docs": "Documentation interactive (Swagger UI).",
      },
    });
  }

  // Spécification OpenAPI (avant les autres routes : chemin fixe).
  if (pathname === "/api/openapi.json") {
    return jsonResponse(req, res, 200, buildOpenApi(baseUrl(req)));
  }

  // Documentation interactive Swagger UI (consomme /api/openapi.json).
  if (pathname === "/api/docs" || pathname === "/api/docs/") {
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

    return jsonResponse(req, res, 200, {
      total,
      count: page.length,
      offset: start,
      limit: limit ?? null,
      teas: page.map((t) => projectFields(localize(t, lang), fields)),
    });
  }

  // Un sachet au hasard (respecte les filtres). Avant le matcher :id.
  if (pathname === "/api/teas/random") {
    const pool = filterTeas(searchParams);
    if (pool.length === 0) {
      return jsonResponse(req, res, 404, { error: "No tea matches the filters" });
    }
    const tea = pool[Math.floor(Math.random() * pool.length)];
    return jsonResponse(req, res, 200, projectFields(localize(tea, lang), fields));
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
    return jsonResponse(req, res, 200, projectFields(localize(tea, lang), fields));
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
