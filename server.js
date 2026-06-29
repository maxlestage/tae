import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

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

function jsonResponse(res, status, data) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    // API publique : autorise la lecture depuis n'importe quel site.
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "cache-control": "public, max-age=300",
  });
  res.end(JSON.stringify(data));
}

/** Aplati les champs traduits (name/description) vers une seule langue. */
function localize(tea, lang) {
  if (!lang) return tea;
  return { ...tea, name: tea.name[lang], description: tea.description[lang] };
}

const BOOL_FILTERS = ["caffeineFree", "pyramid", "coldBrew", "coffret", "limited"];

function handleApi(req, res, pathname, searchParams) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    });
    return res.end();
  }
  if (req.method !== "GET") {
    return jsonResponse(res, 405, { error: "Method not allowed" });
  }

  const lang = searchParams.get("lang");
  if (lang && !LANGS.includes(lang)) {
    return jsonResponse(res, 400, {
      error: `Unknown lang '${lang}'`,
      allowed: LANGS,
    });
  }

  // Index / documentation de l'API.
  if (pathname === "/api" || pathname === "/api/") {
    return jsonResponse(res, 200, {
      name: "Lipton France — Sachets de thé",
      description: "API publique en lecture seule du catalogue Lipton vendu en France.",
      count: TEAS.length,
      languages: LANGS,
      endpoints: {
        "GET /api/teas": "Liste des sachets. Filtres: family, type, search, lang, caffeineFree, pyramid, coldBrew, coffret, limited.",
        "GET /api/teas/:id": "Un sachet par identifiant (ex: /api/teas/yellow-label).",
        "GET /api/families": "Familles de couleur et leur nombre de sachets.",
        "GET /api/types": "Types de thé et leur nombre de sachets.",
      },
    });
  }

  // Liste filtrée.
  if (pathname === "/api/teas" || pathname === "/api/teas/") {
    let result = TEAS;

    const family = searchParams.get("family");
    if (family) {
      result = result.filter(
        (t) => t.family.toLowerCase() === family.toLowerCase(),
      );
    }
    const type = searchParams.get("type");
    if (type) {
      result = result.filter((t) => t.typeKey === type);
    }
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
        LANGS.some((l) => t.name[l].toLowerCase().includes(q)),
      );
    }

    return jsonResponse(res, 200, {
      count: result.length,
      teas: result.map((t) => localize(t, lang)),
    });
  }

  // Un sachet par identifiant.
  const single = pathname.match(/^\/api\/teas\/([^/]+)\/?$/);
  if (single) {
    const id = decodeURIComponent(single[1]);
    const tea = TEAS.find((t) => t.id === id);
    if (!tea) return jsonResponse(res, 404, { error: `Tea '${id}' not found` });
    return jsonResponse(res, 200, localize(tea, lang));
  }

  // Agrégations.
  if (pathname === "/api/families") {
    const counts = {};
    for (const t of TEAS) counts[t.family] = (counts[t.family] ?? 0) + 1;
    return jsonResponse(res, 200, {
      families: Object.entries(counts).map(([family, count]) => ({ family, count })),
    });
  }
  if (pathname === "/api/types") {
    const counts = {};
    for (const t of TEAS) counts[t.typeKey] = (counts[t.typeKey] ?? 0) + 1;
    return jsonResponse(res, 200, {
      types: Object.entries(counts).map(([type, count]) => ({ type, count })),
    });
  }

  return jsonResponse(res, 404, { error: "Unknown API endpoint" });
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
