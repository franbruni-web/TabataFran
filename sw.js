
const CACHE_NAME = 'tabata-fran-v9';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './index.tsx',
  './App.tsx',
  './types.ts',
  './constants.tsx',
  './services/audioService.ts',
  './components/WorkoutEditor.tsx',
  './components/TimerView.tsx',
  './components/WorkoutCard.tsx',
  './components/Icons.tsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // MANEJO CRÍTICO DE NAVEGACIÓN: Si es una página, siempre intentar red pero caer a CACHE si hay error o 404
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Si el servidor devuelve 404, servimos el index.html del cache
          if (response.status === 404) {
            return caches.match('./index.html') || caches.match('./');
          }
          return response;
        })
        .catch(() => {
          // Si no hay red (offline), servimos el index.html
          return caches.match('./index.html') || caches.match('./');
        })
    );
    return;
  }

  // Para el resto de archivos (JS, SVG, CSS)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cacheCopy));
        }
        return networkResponse;
      }).catch(() => null);
    })
  );
});
