import { serve } from "bun";
import { join, normalize } from "node:path";

const DIST = join(import.meta.dir, "dist");
const port = Number(process.env.PORT ?? 3000);

serve({
  port,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === "/") pathname = "/index.html";

    // Empêche les remontées de répertoire (path traversal).
    const filePath = normalize(join(DIST, pathname));
    if (filePath !== DIST && !filePath.startsWith(DIST + "/")) {
      return new Response("Forbidden", { status: 403 });
    }

    const file = Bun.file(filePath);
    if (await file.exists()) {
      return new Response(file);
    }

    // Fallback SPA : on renvoie index.html.
    return new Response(Bun.file(join(DIST, "index.html")), {
      headers: { "content-type": "text/html" },
    });
  },
});

console.log(`Lipton tea colors — serving ./dist on :${port}`);
