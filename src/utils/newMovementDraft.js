// Checkpoint III-C.2 — persistencia y restauración del borrador de "Nuevo
// Movimiento" a través de localStorage (sobrevive recarga de página / cierre
// de pestaña, ventana de 60s). Funciones puras, sin efectos colaterales más
// allá del propio storage — NewMovementSheet.jsx orquesta cuándo llamarlas.

const STORAGE_KEY = 'budgetrp_new_movement_draft';
const TTL_MS = 60000;

/**
 * Lee el borrador persistido si existe, no está corrupto y sigue fresco
 * (dentro de la ventana de TTL_MS desde que se guardó). Cualquier entrada
 * corrupta o vencida se borra antes de devolver null — nunca deja basura en
 * el storage, nunca tira una excepción hacia quien llama.
 * @param {number} now - Timestamp de referencia (inyectable para tests).
 * @returns {object|null}
 */
export const readDraft = (now = Date.now()) => {
  let raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }

  if (!raw) return null;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    clearDraft();
    return null;
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || typeof parsed.savedAt !== 'number') {
    clearDraft();
    return null;
  }

  if (now - parsed.savedAt > TTL_MS) {
    clearDraft();
    return null;
  }

  return parsed;
};

/**
 * Persiste el borrador con un timestamp de guardado. Comodidad, no algo
 * crítico — un fallo de storage (lleno, modo privado) no debe romper nada.
 * @param {object} draft
 * @param {number} now - Timestamp de referencia (inyectable para tests).
 */
export const writeDraft = (draft, now = Date.now()) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...draft, savedAt: now }));
  } catch {
    // Storage inaccesible o lleno — el borrador simplemente no persiste.
  }
};

/**
 * Borra el borrador persistido, si existe.
 */
export const clearDraft = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage inaccesible — nada que limpiar del lado de quien llama.
  }
};
