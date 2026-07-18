// Checkpoint III-C.3 — parser determinista de texto libre → borrador de
// movimiento, integrado con el Command Palette (⌘K). Alcance CERRADO: dos
// patrones fijos ("descripción monto" / "monto descripción"), ninguna
// heurística, sin IA, sin fechas, sin categorías automáticas, sin múltiples
// monedas/cuentas/movimientos, sin lenguaje natural. Función pura — NUNCA
// tira excepciones, siempre devuelve { success, movementDraft, error }.

// Regex de monto válido: entero o hasta 2 decimales, sin signo, sin coma.
const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

// Regla "sin fechas" — bloqueo explícito de palabras relativas a fecha
// (case-insensitive) para nunca inventar una interpretación silenciosa de
// algo que el parser no soporta.
const DATE_WORDS = ['hoy', 'ayer', 'mañana', 'anteayer'];

const STRUCTURE_ERROR =
  "No pudimos interpretar el texto como un movimiento — probá 'concepto monto', ej. café 3.20.";
const DATE_ERROR = 'No se admiten fechas en el texto — solo concepto y monto.';

const fail = (error) => ({ success: false, movementDraft: null, error });

/**
 * Parsea texto libre a un borrador de movimiento determinista.
 * @param {string} text
 * @returns {{ success: boolean, movementDraft: object|null, error: string|null }}
 */
export const parseMovementText = (text) => {
  if (typeof text !== 'string') return fail(STRUCTURE_ERROR);

  const normalized = text.trim().replace(/\s+/g, ' ');
  if (normalized === '') return fail(STRUCTURE_ERROR);

  const tokens = normalized.split(' ');

  let description = null;
  let amount = null;

  // Patrón A: descripción + monto (el último token es el monto).
  const lastToken = tokens[tokens.length - 1];
  if (tokens.length >= 2 && AMOUNT_REGEX.test(lastToken)) {
    description = tokens.slice(0, -1).join(' ');
    amount = Number(lastToken);
  } else {
    // Patrón B: monto + descripción (el primer token es el monto).
    const firstToken = tokens[0];
    if (tokens.length >= 2 && AMOUNT_REGEX.test(firstToken)) {
      description = tokens.slice(1).join(' ');
      amount = Number(firstToken);
    }
  }

  if (description === null) return fail(STRUCTURE_ERROR);

  description = description.trim();
  if (description === '') return fail(STRUCTURE_ERROR);

  const descriptionTokens = description.toLowerCase().split(/\s+/);
  const hasDateWord = descriptionTokens.some((token) => DATE_WORDS.includes(token));
  if (hasDateWord) return fail(DATE_ERROR);

  return {
    success: true,
    movementDraft: { activeType: 'expense', description, amount },
    error: null,
  };
};
