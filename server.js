import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { join, normalize, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = join(fileURLToPath(new URL(".", import.meta.url)), "dist");
const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

const server = createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, "http://x").pathname);
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
