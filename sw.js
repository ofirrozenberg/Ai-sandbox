// Lets the app open like a normal app. Network first, so updates always arrive; cache is the fallback.
// "no-store" skips the browser's own cache too, so a new index.html shows up right away instead of after ~10 minutes.
const CACHE = "ai-sandbox-v2";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;  // never touch Google calls
  e.respondWith(
    fetch(req, { cache: "no-store" }).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./")))
  );
});
