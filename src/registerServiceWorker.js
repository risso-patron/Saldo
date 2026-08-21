// Registro del Service Worker — movido desde public/register-sw.js (script
// clásico, fuera del pipeline de Vite) a un módulo ES para poder usar
// import.meta.env.PROD (DOG-006/DOG-007): el Service Worker solo debe
// registrarse en producción. En `vite dev` interceptaba requests con
// cache-first y podía servir código viejo del working tree, dando falsos
// negativos durante Dogfooding sobre localhost. Lógica funcional idéntica a
// la original: comprobación de soporte, registro en window 'load', mismos
// logs, misma ruta. Externo a index.html (no inline) por la misma razón que
// el archivo original: cumplir CSP estricta sin 'unsafe-inline'.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => console.log('PWA Service Worker registrado con exito.', reg.scope))
      .catch((err) => console.log('PWA SW fallido:', err));
  });
}
