/**
 * src/lib/aiConfidence.js — FUENTE ÚNICA del mapeo número→etiqueta de confianza
 * (design.md §4, spec.md Área 10, Principio 2).
 *
 * Toda sugerencia de IA que llega con una confianza numérica cruda (0..1) pasa
 * por esta función antes de mostrarse. Fuera de rango o inválida → `null`:
 * el consumidor debe tratarla como "no disponible", nunca mostrarla rota
 * (sin color/etiqueta) — spec.md Área 10.
 *
 * @param {number} n - confianza cruda devuelta por el proveedor de IA (0..1)
 * @returns {'alta'|'media'|'baja'|null} `null` = no mostrar
 */
export function toConfidenceLabel(n) {
  if (typeof n !== 'number' || Number.isNaN(n) || n <= 0 || n > 1) return null;
  if (n >= 0.8) return 'alta';
  if (n >= 0.5) return 'media';
  return 'baja';
}
