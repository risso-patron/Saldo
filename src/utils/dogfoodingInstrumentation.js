import { loadFromStorage, saveToStorage } from '../core/storageEngine';

// Instrumentación local mínima para Dogfooding (DOG-010/DOG-011). NO es
// analytics de producción: no hay transmisión de red, no hay proveedor
// externo, no hay dependencia nueva — usa storageEngine.js (mismo motor de
// localStorage ya usado por toda la app, prefijo @budgetRP_v1:) y vive
// exclusivamente en el navegador del usuario. Existe únicamente para que
// Luis pueda observar, durante la ventana de Dogfooding, si determinadas
// funciones se usan — no reemplaza ni constituye analytics de usuarios
// reales, y no debe usarse como tal sin una decisión de producto separada
// (que además requeriría revisar public/privacy.html, hoy declara "no
// usamos cookies de rastreo").
//
// Allowlist explícita de eventos y parámetros — cualquier evento o
// parámetro no listado acá se descarta en silencio. Esto es intencional:
// evita que un error de programación futuro empiece a guardar datos no
// autorizados (texto de búsqueda, descripciones de movimientos, montos,
// etc.) sin que nadie lo decida explícitamente acá primero.
const ALLOWED_EVENTS = {
  omnibar_open: [],
  omnibar_navigate: ['destination'],
  omnibar_search_used: ['matched'],
  dashboard_metas_click: [],
  currency_change: ['to'],
  import_start: [],
  export_start: ['format'],
};

const STORAGE_KEY = 'dogfooding_events_v1';
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días — ventana de Dogfooding (DOG-001)

export function logDogfoodingEvent(name, params = {}) {
  const allowedParamKeys = ALLOWED_EVENTS[name];
  if (allowedParamKeys === undefined) return; // evento no autorizado — no se guarda nada

  const cleanParams = {};
  for (const key of allowedParamKeys) {
    if (key in params) cleanParams[key] = params[key];
  }

  const now = Date.now();
  const existing = loadFromStorage(STORAGE_KEY, []);
  const events = Array.isArray(existing) ? existing : [];
  const pruned = events.filter((e) => e && typeof e.timestamp === 'number' && now - e.timestamp < RETENTION_MS);

  pruned.push({ event: name, params: cleanParams, timestamp: now });
  saveToStorage(STORAGE_KEY, pruned);
}
