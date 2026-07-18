import { readDraft, writeDraft, clearDraft } from './newMovementDraft';

// Checkpoint III-C.2 — persistencia y restauración del borrador de "Nuevo
// Movimiento" a través de localStorage (sobrevive recarga de página / cierre
// de pestaña, TTL de 60s). Clave: 'budgetrp_new_movement_draft' (mismo
// prefijo 'budgetrp_' que el resto de la app — ver PeriodContext.jsx).
//
// setupTests.js reemplaza global.localStorage por un mock de vi.fn() puros
// (getItem/setItem/removeItem/clear sin implementación real) para que otros
// tests puedan stubear valores puntuales. Acá necesitamos comportamiento de
// storage real (round-trip, corrupción, limpieza) para probar las funciones
// puras de newMovementDraft.js, así que respaldamos esos mocks con un store
// en memoria por test — mismo patrón que
// GlobalBudgetTracker.test.jsx (localStorage.getItem.mockImplementation),
// extendido a los cuatro métodos.

const STORAGE_KEY = 'budgetrp_new_movement_draft';

const useFakeLocalStorage = () => {
  let store = {};
  localStorage.getItem.mockImplementation((key) => (key in store ? store[key] : null));
  localStorage.setItem.mockImplementation((key, value) => {
    store[key] = String(value);
  });
  localStorage.removeItem.mockImplementation((key) => {
    delete store[key];
  });
  localStorage.clear.mockImplementation(() => {
    store = {};
  });
};

describe('newMovementDraft (Checkpoint III-C.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFakeLocalStorage();
  });

  it('round-trip: escribir y luego leer devuelve los mismos datos', () => {
    const draft = { activeType: 'expense', description: 'Café', amount: 42.5, category: 'food' };
    const now = Date.now();

    writeDraft(draft, now);
    const result = readDraft(now);

    expect(result).toEqual({ ...draft, savedAt: now });
  });

  it('readDraft con "now" dentro de la ventana de 60s devuelve el borrador', () => {
    const draft = { activeType: 'income', description: 'Salario', amount: 100, category: 'other' };
    const savedAt = Date.now();

    writeDraft(draft, savedAt);
    const result = readDraft(savedAt + 59000);

    expect(result).toEqual({ ...draft, savedAt });
  });

  it('readDraft con "now" más de 60s después de savedAt devuelve null y deja el storage vacío', () => {
    const draft = { activeType: 'expense', description: 'Viejo', amount: 10, category: 'food' };
    const savedAt = Date.now();

    writeDraft(draft, savedAt);
    const result = readDraft(savedAt + 60001);

    expect(result).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('readDraft con JSON corrupto en storage devuelve null, no tira excepción, y limpia la entrada', () => {
    localStorage.setItem(STORAGE_KEY, 'esto no es json {');

    let result;
    expect(() => {
      result = readDraft();
    }).not.toThrow();

    expect(result).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('readDraft con JSON válido pero sin savedAt numérico se trata como corrupto (null + limpieza)', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeType: 'expense', description: 'X' }));

    const result = readDraft();

    expect(result).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('readDraft con savedAt no numérico (string) se trata como corrupto (null + limpieza)', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ activeType: 'expense', description: 'X', savedAt: 'no-es-numero' })
    );

    const result = readDraft();

    expect(result).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('readDraft con valor parseado que no es un objeto (array/string/número) se trata como corrupto', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));

    const result = readDraft();

    expect(result).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('readDraft sin nada guardado devuelve null', () => {
    expect(readDraft()).toBeNull();
  });

  it('clearDraft deja localStorage.getItem(clave) en null', () => {
    writeDraft({ activeType: 'expense', description: 'Algo', amount: 5, category: 'food' });
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

    clearDraft();

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('writeDraft sobrescribe un borrador anterior con datos nuevos', () => {
    const now = Date.now();
    writeDraft({ activeType: 'expense', description: 'Primero', amount: 1, category: 'food' }, now);
    writeDraft({ activeType: 'income', description: 'Segundo', amount: 2, category: 'other' }, now);

    const result = readDraft(now);

    expect(result).toEqual({ activeType: 'income', description: 'Segundo', amount: 2, category: 'other', savedAt: now });
  });

  it('readDraft: si localStorage.getItem tira (modo privado/inaccesible), devuelve null sin romper', () => {
    localStorage.getItem.mockImplementation(() => {
      throw new Error('storage inaccesible');
    });

    let result;
    expect(() => {
      result = readDraft();
    }).not.toThrow();
    expect(result).toBeNull();
  });

  it('writeDraft: si localStorage.setItem tira (storage lleno/modo privado), no rompe', () => {
    localStorage.setItem.mockImplementation(() => {
      throw new Error('storage lleno');
    });

    expect(() => {
      writeDraft({ activeType: 'expense', description: 'X', amount: 1, category: 'food' });
    }).not.toThrow();
  });

  it('clearDraft: si localStorage.removeItem tira, no rompe', () => {
    localStorage.removeItem.mockImplementation(() => {
      throw new Error('storage inaccesible');
    });

    expect(() => {
      clearDraft();
    }).not.toThrow();
  });
});
