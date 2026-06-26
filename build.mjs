import * as esbuild from "esbuild";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";

const HTML = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lipton · Sachets de thé par couleurs</title>
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

if (process.argv.includes("--serve")) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: "dist", port: 3000 });
  console.log(`dev  →  http://localhost:${port}`);
} else {
  await esbuild.build({ ...options, minify: true });
  console.log("build  →  ./dist");
}
