const CACHE_NAME = 'budget-rp-cache-v1';

// Recursos esenciales iniciales (App Shell)
const INITIAL_CACHED_RESOURCES = [
  '/',
  '/index.html',
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
  
  // Ignorar llamadas a API externas (ej. Supabase, Gemini, Groq)
  const url = new URL(event.request.url);
  if (!url.origin.includes(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Si está en caché, retornarlo inmediato (Caché First)
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Si no está, buscarlo en red (Network fallback)
      return fetch(event.request).then((networkResponse) => {
        // No cachar si hay error
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cachar para el futuro
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback genérico sin conexión a internet si no hay respuesta red ni caché
        return new Response("No hay conexión a internet.", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain" })
        });
      });
    })
  );
});
