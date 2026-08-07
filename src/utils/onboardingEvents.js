// Fase 1, task 1.2 (tasks.md) — onboarding-flow, Decisión 5 (design.md):
// observabilidad de las 4 transiciones principales del flujo SIN
// infraestructura de analítica (fuera de alcance del spec, sección "Fuera de
// alcance" > Telemetría). Un CustomEvent en `window` es observable desde
// tests (window.addEventListener) y desde cualquier adaptador futuro, con
// cero acoplamiento y cero dependencias nuevas.

/**
 * Despacha un evento de dominio observable en `window`.
 * @param {string} name - Nombre del evento (ej. 'onboarding:started').
 * @param {object} [payload] - Datos asociados a la transición.
 */
export function emitOnboardingEvent(name, payload = {}) {
  window.dispatchEvent(new CustomEvent(name, { detail: payload }));
}
