const CACHE_VERSION = "1";
const CACHE_NAME = `pwa-cache-${CACHE_VERSION}`;

const CORE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/sw.js",
  "/icon-mdpi.png",
  "/icon-hdpi.png",
  "/icon-xhdpi.png",
  "/icon-xxhdpi.png",
  "/icon-xxxhdpi.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {
        // Ignore caching failures during install.
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))));
      await self.clients.claim();
    })()
  );
});

function isGetRequest(request) {
  return request && request.method === "GET";
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (!isGetRequest(request)) return;
  if (!request.url || !request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (e) {
        const cached = await caches.match(request);
        if (cached) return cached;
        // For navigations, fall back to the app shell.
        if (request.mode === "navigate") {
          return caches.match("/");
        }
        return cached;
      }
    })()
  );
});

