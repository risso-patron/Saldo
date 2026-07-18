import { parseLocalDate } from './calculations';

// Checkpoint IV-A (Saldo Design Constitution v1.2) — Historial de movimientos.
// Fuente: docs/design/screens/Saldo Historial.dc.html.
//
// Fecha relativa y agrupación por día — extraído de FilaMovimiento.jsx (antes
// función privada `formatRelativeDate`, línea ~27-36 antes del refactor).
// Vive en su propio archivo en vez de calculations.js: calculations.js es
// sobre matemática de dinero (sumas, balances, filtros por rango); esto es
// sobre clasificar/etiquetar fechas relativas y agrupar movimientos por día
// calendario — se sintió menos cohesivo mezclar ambas responsabilidades.
// Reusa `parseLocalDate` de calculations.js (normalización de timezone) en
// vez de duplicarla.
//
// Única fuente de verdad para "cuántos días de diferencia hay respecto a
// hoy": tanto `formatRelativeDate` (fecha por fila en FilaMovimiento) como
// `formatDayGroupLabel` (cabecera "Hoy · martes 14" en GrupoDía de Historial)
// derivan de la misma clasificación interna — evita que las dos pantallas
// puedan discrepar sobre qué cuenta como "hoy"/"ayer".

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/**
 * Clasifica una fecha respecto a una fecha de referencia.
 * @returns {'today'|'yesterday'|null}
 */
function classifyRelativeDay(date, referenceDate) {
  const dayDiff = Math.round((startOfDay(date) - startOfDay(referenceDate)) / DAY_MS);
  if (dayDiff === 0) return 'today';
  if (dayDiff === -1) return 'yesterday';
  return null;
}

/**
 * Fecha relativa por fila: "Hoy" / "Ayer" / "D mmm" (Intl.DateTimeFormat con
 * el locale de i18n, no un locale fijo a mano — mismo patrón que DSTopBar).
 * Consumida por FilaMovimiento.jsx.
 * @param {string} dateStr - Fecha 'YYYY-MM-DD' (o ISO completo).
 * @param {string} locale - i18n.language.
 * @param {Date} referenceDate - Fecha de referencia ("hoy").
 * @returns {string}
 */
export function formatRelativeDate(dateStr, locale, referenceDate) {
  const date = parseLocalDate(dateStr);
  if (!date) return '';

  const relative = classifyRelativeDay(date, referenceDate);
  if (relative === 'today') return 'Hoy';
  if (relative === 'yesterday') return 'Ayer';

  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
}

/**
 * Etiqueta de cabecera de GrupoDía en Historial: "Hoy · martes 14",
 * "Ayer · lunes 13", o para el resto solo "Domingo 12" (día de la semana +
 * número de día, primera letra en mayúscula, SIN "Hoy"/"Ayer" — spec:
 * docs/design/screens/Saldo Historial.dc.html, "Microcopys canónicos").
 * @param {string} dateStr - Fecha 'YYYY-MM-DD' (o ISO completo).
 * @param {string} locale - i18n.language.
 * @param {Date} referenceDate - Fecha de referencia ("hoy").
 * @returns {string}
 */
export function formatDayGroupLabel(dateStr, locale, referenceDate) {
  const date = parseLocalDate(dateStr);
  if (!date) return '';

  const relative = classifyRelativeDay(date, referenceDate);
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
  const dayNum = date.getDate();

  if (relative === 'today') return `Hoy · ${weekday} ${dayNum}`;
  if (relative === 'yesterday') return `Ayer · ${weekday} ${dayNum}`;

  const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalized} ${dayNum}`;
}

/**
 * Agrupa movimientos (ingresos/gastos ya unificados, cada uno con `.date`
 * 'YYYY-MM-DD') por día calendario, en orden descendente (más reciente
 * primero) — estructura de "diario" de Historial.
 * @param {Array<{date: string}>} movements
 * @param {string} locale - i18n.language.
 * @param {Date} referenceDate - Fecha de referencia ("hoy").
 * @returns {Array<{key: string, label: string, items: Array}>}
 */
export function groupMovementsByDay(movements, locale, referenceDate) {
  const sorted = [...movements].sort((a, b) => {
    const da = parseLocalDate(a.date);
    const db = parseLocalDate(b.date);
    if (!da || !db) return 0;
    return db - da;
  });

  const groups = [];
  const groupsByKey = new Map();

  sorted.forEach((item) => {
    const key = String(item.date).substring(0, 10);
    let group = groupsByKey.get(key);
    if (!group) {
      group = { key, label: formatDayGroupLabel(item.date, locale, referenceDate), items: [] };
      groupsByKey.set(key, group);
      groups.push(group);
    }
    group.items.push(item);
  });

  return groups;
}
