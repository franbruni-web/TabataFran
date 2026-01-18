
const CACHE_NAME = 'tabata-fran-v4';
const ASSETS = [
  './',
  'index.html',
  'icon.svg',
  'manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Si es una navegación (abrir la app), siempre servir index.html
  // Esto previene el 404 cuando la PWA intenta cargar rutas virtuales
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('index.html'))
    );
    return;
  }

  // Estrategia Cache First para activos estáticos
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Si falla todo y es una imagen/svg, podríamos devolver un placeholder si quisiéramos
        return null;
      });
    })
  );
});
