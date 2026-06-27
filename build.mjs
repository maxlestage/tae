import * as esbuild from "esbuild";
import { mkdirSync, writeFileSync, rmSync, cpSync, existsSync } from "node:fs";

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
    <link rel="apple-touch-icon" href="/favicon.svg" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Lipton · Sachets de thé" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESC}" />
    <meta property="og:url" content="__BASE_URL__/" />
    <meta property="og:image" content="__BASE_URL__/og-image.png?v=3" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${TITLE}" />
    <meta name="twitter:description" content="${DESC}" />
    <meta name="twitter:image" content="__BASE_URL__/og-image.png?v=3" />

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

if (process.argv.includes("--serve")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: "dist", port: 3000 });
  console.log(`dev  →  http://localhost:${port}`);
} else {
  await esbuild.build({ ...options, minify: true });
  console.log("build  →  ./dist");
}
