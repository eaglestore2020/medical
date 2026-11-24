const CACHE_NAME = "eagle-medical-v2";
const FILES_TO_CACHE = [
  "/medical/",
  "/medical/index.html",
  "/medical/Images/eagle-logo.png",
  "/medical/Images/favicon-64.png",
  "/medical/Images/apple-touch-icon.png",
  "/medical/Images/icon-192.png",
  "/medical/Images/icon-512.png",
  "/medical/Images/manifest.json"
];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    for (const file of FILES_TO_CACHE) {
      try { await cache.add(file); } catch (error) { console.warn("Cache skipped:", file, error); }
    }
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response && response.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === "navigate") return caches.match("/medical/");
      throw error;
    }
  })());
});
