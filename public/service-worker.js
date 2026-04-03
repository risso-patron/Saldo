const CACHE_NAME = 'budget-rp-cache-v2';

// Recursos esenciales iniciales (App Shell)
// NOTA: index.html se excluye deliberadamente — usa Network-First para siempre
// servir la versión más reciente y evitar cargar bundles JS desactualizados.
const INITIAL_CACHED_RESOURCES = [
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🤖 Service Worker: Instalado y en cachando recursos básicos');
      return cache.addAll(INITIAL_CACHED_RESOURCES);
    })
  );
  // Fuerza la activación inmediata (sin esperar a que cierren pestañas antiguas)
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('🧹 Service Worker: Limpiando caché antigua', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  // Ignorar llamadas a API externas (Supabase, Groq, etc.)
  const url = new URL(event.request.url);
  if (!url.origin.includes(self.location.origin)) return;

  // ── Network-First para HTML ──────────────────────────────────────────────
  // index.html y rutas SPA (/) siempre van a la red para garantizar que el
  // navegador cargue los bundles JS del deploy actual. Si la red falla,
  // se sirve la versión en caché como último recurso.
  const isHTML = event.request.headers.get('accept')?.includes('text/html')
    || url.pathname === '/'
    || url.pathname === '/index.html';

  if (isHTML) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ── Cache-First para assets estáticos (JS, CSS, imágenes, fuentes) ───────
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        return new Response("No hay conexión a internet.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain" })
        });
      });
    })
  );
});
