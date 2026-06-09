const CACHE_NAME = 'ghostfight3000-v1';
const ASSETS = [
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/js/game.js',
  '/js/arena.js',
  '/js/player.js',
  '/js/abilities.js',
  '/js/bombs.js',
  '/js/network.js',
  '/js/input.js',
  '/js/ui.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Don't cache Firebase or CDN requests
  if (event.request.url.includes('firebasejs') ||
      event.request.url.includes('gstatic.com') ||
      event.request.url.includes('cdnjs.cloudflare.com') ||
      event.request.url.includes('unpkg.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      });
    })
  );
});
