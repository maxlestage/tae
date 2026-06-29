/* Service worker — Lipton · Sachets de thé (PWA) */
const CACHE = "lipton-v7";
const ASSETS = [
  "/",
  "/index.html",
  "/main.js",
  "/main.css",
  "/paper-emboss.png",
  "/paper-emboss-90.png",
  "/lipton-logo.png",
  "/favicon.svg",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

function networkFirst(req, fallbackPath) {
  return fetch(req)
    .then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(fallbackPath || req, copy));
      }
      return res;
    })
    .catch(() => caches.match(fallbackPath || req).then((c) => c || caches.match("/index.html")));
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const pathname = new URL(req.url).pathname;
  if (new URL(req.url).origin !== self.location.origin) return;

  // API publique : toujours le réseau, jamais de cache (données à jour).
  if (pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
    return;
  }

  // Pages et code de l'app : réseau d'abord (toujours à jour en ligne),
  // repli sur le cache hors-ligne. Évite de servir une vieille version.
  if (
    req.mode === "navigate" ||
    /\.(?:js|css|webmanifest)$/.test(pathname)
  ) {
    event.respondWith(
      networkFirst(req, req.mode === "navigate" ? "/index.html" : undefined),
    );
    return;
  }

  // Images / icônes : cache d'abord puis réseau (mise à jour en arrière-plan).
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
