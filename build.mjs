import * as esbuild from "esbuild";
import { mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const TITLE = "Lipton · Sachets de thé par couleurs";
const DESC =
  "Gamme Lipton vendue en France 🇫🇷 — 78 sachets triés par couleurs, avec fiche colorée, intensité et ingrédients. FR / EN / ES.";

// __BASE_URL__ est remplacé par l'URL absolue du site au moment de servir
// (server.js), pour des aperçus de lien (Open Graph) corrects partout.
const HTML = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, viewport-fit=cover"
    />
    <title>${TITLE}</title>
    <meta name="description" content="${DESC}" />
    <meta name="theme-color" content="#ffe105" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="/icon-192.png" />

    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Lipton Thés" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Lipton · Sachets de thé" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESC}" />
    <meta property="og:url" content="__BASE_URL__/" />
    <meta property="og:image" content="__BASE_URL__/og-image.png?v=4" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${TITLE}" />
    <meta name="twitter:description" content="${DESC}" />
    <meta name="twitter:image" content="__BASE_URL__/og-image.png?v=4" />

    <link rel="stylesheet" href="/main.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
`;

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ["src/main.tsx"],
  bundle: true,
  format: "esm",
  jsx: "automatic",
  loader: { ".css": "css" },
  // Assets publics servis au runtime (pas résolus au build).
  external: ["/paper-emboss.png", "/paper-emboss-90.png", "/fonts/*"],
  outdir: "dist",
  entryNames: "[name]",
  logLevel: "info",
};

rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", HTML);

// Copie les assets statiques (favicon, image d'aperçu) dans dist
if (existsSync("public")) {
  cpSync("public", "dist", { recursive: true });
}

// Génère les données de l'API publique en JSON à partir de src/data.ts
// (source unique : aucune duplication du catalogue). On compile data.ts vers un
// module temporaire, on l'importe, puis on écrit dist/api/teas.json.
{
  // derive.ts réexporte TEAS et fournit l'intensité / les ingrédients dérivés,
  // partagés avec l'app (aucune duplication de logique).
  const compiled = await esbuild.build({
    entryPoints: ["src/derive.ts"],
    bundle: true,
    format: "esm",
    write: false,
  });
  const tmp = join(tmpdir(), `lipton-teas-${process.pid}.mjs`);
  writeFileSync(tmp, compiled.outputFiles[0].text);
  const { TEAS, intensityValue, ingredientsFor } = await import(
    pathToFileURL(tmp).href
  );
  rmSync(tmp, { force: true });

  // Chaque sachet est enrichi des champs dérivés affichés par l'app.
  const teas = TEAS.map((t) => ({
    ...t,
    intensity: intensityValue(t),
    ingredients: ingredientsFor(t),
  }));

  mkdirSync("dist/api", { recursive: true });
  writeFileSync(
    "dist/api/teas.json",
    JSON.stringify({ count: teas.length, teas }),
  );
  console.log(`api    →  ${teas.length} sachets`);
}

if (process.argv.includes("--serve")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: "dist", port: 3000 });
  console.log(`dev  →  http://localhost:${port}`);
} else {
  await esbuild.build({ ...options, minify: true });
  console.log("build  →  ./dist");
}
