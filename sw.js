// Muista service worker: keeps the app usable offline.
// Serves the cached copy first and refreshes it in the background, so an update appears on the next start.
const CACHE = 'muista-0.4';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'atkinson-400.woff2', 'atkinson-700.woff2', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  const refresh = caches.open(CACHE).then(c => fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }));
  e.waitUntil(refresh.catch(() => {}));
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => hit || refresh));
});
