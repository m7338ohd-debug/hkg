const CACHE_NAME = 'store-cashflow-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './app_logo_3d.png',
  './favicon.svg'
];

// Install event - Cache core static assets & force immediate activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use Promise.allSettled so a missing optional asset won't break installation
      await Promise.allSettled(
        ASSETS_TO_CACHE.map((asset) =>
          cache.add(asset).catch((err) => console.log('SW optional asset cache failed:', asset, err))
        )
      );
    })
  );
});

// Activate event - Clean old caches & claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network-first strategy for navigation/HTML, Cache-first / Stale-while-revalidate for assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip non-http/https schemes (like chrome-extension://, file://, data:)
  if (!url.protocol.startsWith('http')) return;

  // Network-first for navigation/HTML requests so new deploys appear instantly
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match(event.request).then((cached) => cached || caches.match('./index.html') || caches.match('/index.html'));
        })
    );
    return;
  }

  // Stale-while-revalidate for static JS/CSS/image assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone(); // CRITICAL: Always clone before putting in cache!
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {/* Silent catch offline errors */});

      return cachedResponse || fetchPromise;
    })
  );
});
