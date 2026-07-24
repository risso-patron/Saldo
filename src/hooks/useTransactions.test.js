import { createElement, StrictMode } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTransactions } from './useTransactions';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Checkpoint III-B (Saldo Design Constitution v1.2) — infraestructura de
// Toast + Deshacer para "Nuevo Movimiento". Cubre el nuevo parámetro
// `options` de addIncome/addExpense (control de notificación legacy vs.
// operación reversible) y el nuevo contrato de retorno { success, movement }.
//
// Checkpoint IV-C — converge la eliminación en una única API de dominio:
// deleteMovement/confirmPendingOperation/undoPendingOperation reemplazan a
// removeIncome/removeExpense/undoAddMovement (retirados del hook, sin
// consumidor externo). pendingOperation es la única fuente de verdad de
// "cuál operación reversible está viva ahora mismo" — antes esa decisión
// vivía repartida entre este hook y App.jsx (undoToast).
//
// No pretende dar cobertura exhaustiva al resto del hook (ya probado
// indirectamente por los tests de los componentes que lo consumen).

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null })),
}));

vi.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    convertCurrency: (amount) => amount,
    selectedCurrency: 'USD',
  }),
}));

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}));

// Chain mínima de supabase-js: cada método devuelve la misma instancia
// (permite encadenar .delete().eq().eq() como hace syncDelete) y es
// "thenable" para que `await supabase.from(...).delete()...` resuelva sin
// necesitar un Promise real. `data: []` por defecto para que la carga
// inicial (`load()`, useEffect de montaje) no rompa contra `data.filter`.
function makeSupabaseChain(result = { data: [], error: null }) {
  const chain = {};
  ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'in', 'order'].forEach((method) => {
    chain[method] = vi.fn(() => chain);
  });
  chain.then = (resolve) => resolve(result);
  return chain;
}

// Deja resolver el efecto de carga inicial desde Supabase (solo se dispara
// cuando `user` es verdadero) antes de que el test actúe sobre el hook —
// evita warnings de "not wrapped in act(...)" por el `setIncomes`/
// `setLoading` que ese efecto dispara de forma asíncrona.
async function flushInitialLoad() {
  await act(async () => {
    await Promise.resolve();
  });
}

// Drena microtasks Y el macrotask queue (setTimeout(0)) — necesario para las
// cadenas .then() encadenadas tras un fire-and-forget (syncInsert/syncUpdate/
// etc. son async y su .then() en el call site agrega otro salto más sobre lo
// que ya cubre flushInitialLoad).
async function flushAsync() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

// RC-1.7/C1: en updateIncome/updateExpense/removeMultiple/categorizeMultiple
// el valor previo a revertir se captura asignando una variable del closure
// externo DENTRO del callback funcional de setState — StrictMode invoca ese
// callback dos veces por render para detectar impurezas. Envolver con
// StrictMode fuerza esa doble invocación real en el test, en vez de confiar
// solo en el razonamiento de que "buscar por id es determinístico".
const strictWrapper = ({ children }) => createElement(StrictMode, null, children);

describe('useTransactions — options.notification y contrato de retorno (Checkpoint III-B)', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
    vi.mocked(useAuth).mockReturnValue({ user: null });
  });

  describe('addIncome', () => {
    it('con datos válidos devuelve { success: true, movement } con el ingreso recién creado', () => {
      const { result } = renderHook(() => useTransactions());

      let returned;
      act(() => {
        returned = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD');
      });

      expect(returned.success).toBe(true);
      expect(returned.movement).toMatchObject({
        description: 'Sueldo',
        amount: 1000,
        currency: 'USD',
        type: 'income',
        date: '2026-07-01',
      });
      expect(returned.movement.id).toBeTruthy();
    });

    it('con datos inválidos devuelve { success: false, movement: null }', () => {
      const { result } = renderHook(() => useTransactions());

      let returned;
      act(() => {
        returned = result.current.addIncome('', 0, '2026-07-01', 'USD');
      });

      expect(returned).toEqual({ success: false, movement: null });
    });

    it('con notification "legacy" (default, sin pasar options) llama showAlert en éxito', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD');
      });

      expect(result.current.alert).toEqual({ type: 'success', message: 'Ingreso agregado exitosamente' });
    });

    it('con notification "legacy" llama showAlert en error', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addIncome('', 0, '2026-07-01', 'USD', { notification: 'legacy' });
      });

      expect(result.current.alert?.type).toBe('error');
    });

    it('con notification "toast" NO llama showAlert y arranca una operación reversible de tipo "create"', () => {
      const { result } = renderHook(() => useTransactions());

      let returned;
      act(() => {
        returned = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD', { notification: 'toast' });
      });

      expect(result.current.alert).toBeNull();
      expect(result.current.pendingOperation).toEqual({ kind: 'create', movement: returned.movement });
    });

    it('con notification "toast" y datos inválidos NO llama showAlert ni arranca operación reversible', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addIncome('', 0, '2026-07-01', 'USD', { notification: 'toast' });
      });

      expect(result.current.alert).toBeNull();
      expect(result.current.pendingOperation).toBeNull();
    });
  });

  describe('addExpense', () => {
    it('con datos válidos devuelve { success: true, movement } con el gasto recién creado', () => {
      const { result } = renderHook(() => useTransactions());

      let returned;
      act(() => {
        returned = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD');
      });

      expect(returned.success).toBe(true);
      expect(returned.movement).toMatchObject({
        description: 'Super',
        category: 'Alimentación',
        amount: 50,
        currency: 'USD',
        type: 'expense',
        date: '2026-07-01',
      });
      expect(returned.movement.id).toBeTruthy();
    });

    it('con datos inválidos devuelve { success: false, movement: null }', () => {
      const { result } = renderHook(() => useTransactions());

      let returned;
      act(() => {
        returned = result.current.addExpense('', 'CategoríaInexistente', 0, '2026-07-01', 'USD');
      });

      expect(returned).toEqual({ success: false, movement: null });
    });

    it('con notification "legacy" (default) llama showAlert en éxito', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD');
      });

      expect(result.current.alert).toEqual({ type: 'success', message: 'Gasto agregado exitosamente' });
    });

    it('con notification "toast" NO llama showAlert y arranca una operación reversible de tipo "create"', () => {
      const { result } = renderHook(() => useTransactions());

      let returned;
      act(() => {
        returned = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD', { notification: 'toast' });
      });

      expect(result.current.alert).toBeNull();
      expect(result.current.pendingOperation).toEqual({ kind: 'create', movement: returned.movement });
    });

    it('con notification "toast" y datos inválidos NO llama showAlert ni arranca operación reversible', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addExpense('', 'CategoríaInexistente', 0, '2026-07-01', 'USD', { notification: 'toast' });
      });

      expect(result.current.alert).toBeNull();
      expect(result.current.pendingOperation).toBeNull();
    });
  });
});

describe('useTransactions — operación reversible única (pendingOperation, Checkpoint IV-C)', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'user-1' } });
  });

  it('deleteMovement remueve el movimiento del estado local al instante y NO sincroniza con Supabase todavía', async () => {
    const chain = makeSupabaseChain();
    supabase.from.mockReturnValue(chain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    let expense;
    act(() => {
      expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
    });
    chain.delete.mockClear();

    act(() => {
      result.current.deleteMovement(expense);
    });

    expect(result.current.expenses.some((e) => e.id === expense.id)).toBe(false);
    expect(result.current.pendingOperation).toEqual({ kind: 'delete', movement: expense, index: 0 });
    expect(chain.delete).not.toHaveBeenCalled();
  });

  it('confirmPendingOperation (expiró el Toast) recién ahí sincroniza la baja con Supabase', async () => {
    const chain = makeSupabaseChain();
    supabase.from.mockReturnValue(chain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    let expense;
    act(() => {
      expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
    });
    act(() => {
      result.current.deleteMovement(expense);
    });
    chain.delete.mockClear();
    chain.eq.mockClear();

    act(() => {
      result.current.confirmPendingOperation();
    });

    expect(result.current.pendingOperation).toBeNull();
    expect(chain.delete).toHaveBeenCalledTimes(1);
    expect(chain.eq).toHaveBeenCalledWith('id', expense.id);
  });

  it('undoPendingOperation en una baja restaura el movimiento en su posición exacta y Supabase nunca se entera', async () => {
    const chain = makeSupabaseChain();
    supabase.from.mockReturnValue(chain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    let first, second, third;
    act(() => { first = result.current.addExpense('Uno', 'Alimentación', 10, '2026-07-01', 'USD').movement; });
    act(() => { second = result.current.addExpense('Dos', 'Alimentación', 20, '2026-07-01', 'USD').movement; });
    act(() => { third = result.current.addExpense('Tres', 'Alimentación', 30, '2026-07-01', 'USD').movement; });
    chain.delete.mockClear();

    act(() => {
      result.current.deleteMovement(second); // índice 1
    });
    expect(result.current.expenses.map((e) => e.id)).toEqual([first.id, third.id]);

    act(() => {
      result.current.undoPendingOperation();
    });

    expect(result.current.pendingOperation).toBeNull();
    expect(result.current.expenses.map((e) => e.id)).toEqual([first.id, second.id, third.id]);
    expect(chain.delete).not.toHaveBeenCalled();
  });

  it('undoPendingOperation en una creación remueve el movimiento y SÍ compensa con Supabase (ya estaba insertado)', async () => {
    const chain = makeSupabaseChain();
    supabase.from.mockReturnValue(chain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    let income;
    act(() => {
      income = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD', { notification: 'toast' }).movement;
    });
    chain.delete.mockClear();
    chain.eq.mockClear();

    act(() => {
      result.current.undoPendingOperation();
    });

    expect(result.current.incomes.some((i) => i.id === income.id)).toBe(false);
    expect(result.current.pendingOperation).toBeNull();
    expect(chain.delete).toHaveBeenCalledTimes(1);
    expect(chain.eq).toHaveBeenCalledWith('id', income.id);
  });

  it('slot único: una baja iniciada mientras hay un alta pendiente la reemplaza, sin sincronizar el alta descartada (ya estaba sincronizada)', async () => {
    const chain = makeSupabaseChain();
    supabase.from.mockReturnValue(chain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    let income, expense;
    act(() => {
      income = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD', { notification: 'toast' }).movement;
    });
    expect(result.current.pendingOperation).toEqual({ kind: 'create', movement: income });

    act(() => {
      expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
    });
    chain.delete.mockClear();

    act(() => {
      result.current.deleteMovement(expense);
    });

    expect(result.current.pendingOperation).toEqual({ kind: 'delete', movement: expense, index: 0 });
    expect(chain.delete).not.toHaveBeenCalled();
  });

  it('slot único: un alta iniciada mientras hay una baja pendiente la confirma de inmediato (Supabase la recibe ahora, no después)', async () => {
    const chain = makeSupabaseChain();
    supabase.from.mockReturnValue(chain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    let expense;
    act(() => {
      expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
    });
    act(() => {
      result.current.deleteMovement(expense);
    });
    chain.delete.mockClear();
    chain.eq.mockClear();

    let income;
    act(() => {
      income = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD', { notification: 'toast' }).movement;
    });

    expect(chain.delete).toHaveBeenCalledTimes(1);
    expect(chain.eq).toHaveBeenCalledWith('id', expense.id);
    expect(result.current.pendingOperation).toEqual({ kind: 'create', movement: income });
  });
});

describe('useTransactions — syncError/lastSyncedAt (Checkpoint IV-F.2)', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'user-1' } });
  });
  afterEach(() => {
    vi.mocked(useAuth).mockReturnValue({ user: null });
  });

  it('si la carga inicial falla, syncError se activa y lastSyncedAt permanece null', async () => {
    const chain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
    supabase.from.mockReturnValue(chain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    expect(result.current.syncError).toBe(true);
    expect(result.current.lastSyncedAt).toBeNull();
  });

  it('un fetch exitoso limpia syncError y fija lastSyncedAt; un fallo posterior CONSERVA ese lastSyncedAt', async () => {
    const successChain = makeSupabaseChain({ data: [], error: null });
    supabase.from.mockReturnValue(successChain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    expect(result.current.syncError).toBe(false);
    const firstSyncedAt = result.current.lastSyncedAt;
    expect(firstSyncedAt).not.toBeNull();

    const failChain = makeSupabaseChain({ data: null, error: { message: 'timeout' } });
    supabase.from.mockReturnValue(failChain);
    await act(async () => {
      await result.current.refreshTransactions();
    });

    expect(result.current.syncError).toBe(true);
    expect(result.current.lastSyncedAt).toBe(firstSyncedAt);
  });

  it('tras un fallo, un refreshTransactions posterior exitoso limpia syncError y actualiza lastSyncedAt', async () => {
    const failChain = makeSupabaseChain({ data: null, error: { message: 'timeout' } });
    supabase.from.mockReturnValue(failChain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();
    expect(result.current.syncError).toBe(true);

    const successChain = makeSupabaseChain({ data: [], error: null });
    supabase.from.mockReturnValue(successChain);
    await act(async () => {
      await result.current.refreshTransactions();
    });

    expect(result.current.syncError).toBe(false);
    expect(result.current.lastSyncedAt).not.toBeNull();
  });

  it('refreshTransactions nunca activa loading — el historial debe seguir visible durante un reintento', async () => {
    const chain = makeSupabaseChain();
    supabase.from.mockReturnValue(chain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.refreshTransactions();
    });

    expect(result.current.loading).toBe(false);
  });

  it('llamadas superpuestas a refreshTransactions no disparan más de un fetch concurrente (guardia de concurrencia)', async () => {
    const chain = makeSupabaseChain();
    supabase.from.mockReturnValue(chain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();
    chain.select.mockClear();

    await act(async () => {
      const first = result.current.refreshTransactions();
      const second = result.current.refreshTransactions(); // debe ignorarse: guardia activa
      await Promise.all([first, second]);
    });

    expect(chain.select).toHaveBeenCalledTimes(1);
  });
});

describe('useTransactions — reversión ante fallo de sync (RC-1.7/C1)', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'user-1' } });
  });

  it('addIncome: si syncInsert falla, revierte el alta optimista y muestra el error', async () => {
    const okChain = makeSupabaseChain();
    supabase.from.mockReturnValue(okChain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
    supabase.from.mockReturnValue(failChain);

    let returned;
    act(() => {
      returned = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD');
    });
    expect(result.current.incomes.some((i) => i.id === returned.movement.id)).toBe(true);

    await flushAsync();

    expect(result.current.incomes.some((i) => i.id === returned.movement.id)).toBe(false);
    expect(result.current.alert).toEqual({ type: 'error', message: 'No se pudo guardar el ingreso. Se deshizo el cambio.' });
  });

  it('addExpense: si syncInsert falla, revierte el alta optimista y muestra el error', async () => {
    const okChain = makeSupabaseChain();
    supabase.from.mockReturnValue(okChain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
    supabase.from.mockReturnValue(failChain);

    let returned;
    act(() => {
      returned = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD');
    });
    await flushAsync();

    expect(result.current.expenses.some((e) => e.id === returned.movement.id)).toBe(false);
    expect(result.current.alert).toEqual({ type: 'error', message: 'No se pudo guardar el gasto. Se deshizo el cambio.' });
  });

  it('addIncome (notification "toast"): si syncInsert falla mientras el Toast de "Deshacer" sigue activo, limpia pendingOperation', async () => {
    const okChain = makeSupabaseChain();
    supabase.from.mockReturnValue(okChain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
    supabase.from.mockReturnValue(failChain);

    let returned;
    act(() => {
      returned = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD', { notification: 'toast' });
    });
    expect(result.current.pendingOperation).toEqual({ kind: 'create', movement: returned.movement });

    await flushAsync();

    expect(result.current.pendingOperation).toBeNull();
    expect(result.current.incomes.some((i) => i.id === returned.movement.id)).toBe(false);
  });

  it('addIncome (notification "toast"): si el pendingOperation ya cambió a otra operación antes de que syncInsert falle, no lo toca', async () => {
    const okChain = makeSupabaseChain();
    supabase.from.mockReturnValue(okChain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
    supabase.from.mockReturnValue(failChain);
    let first;
    act(() => {
      first = result.current.addIncome('Uno', 100, '2026-07-01', 'USD', { notification: 'toast' });
    });

    supabase.from.mockReturnValue(okChain);
    let second;
    act(() => {
      second = result.current.addIncome('Dos', 200, '2026-07-01', 'USD', { notification: 'toast' });
    });
    expect(result.current.pendingOperation).toEqual({ kind: 'create', movement: second.movement });

    await flushAsync();

    expect(result.current.pendingOperation).toEqual({ kind: 'create', movement: second.movement });
    expect(result.current.incomes.some((i) => i.id === first.movement.id)).toBe(false);
  });

  it('updateIncome: si syncUpdate falla, restaura exactamente el valor previo (verificado con StrictMode — doble invocación del updater de setState)', async () => {
    const okChain = makeSupabaseChain();
    supabase.from.mockReturnValue(okChain);
    const { result } = renderHook(() => useTransactions(), { wrapper: strictWrapper });
    await flushInitialLoad();

    let income;
    act(() => {
      income = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD').movement;
    });
    const originalSnapshot = { ...income };

    const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
    supabase.from.mockReturnValue(failChain);
    act(() => {
      result.current.updateIncome(income.id, { description: 'Sueldo editado', amount: 2000, date: income.date });
    });
    expect(result.current.incomes.find((i) => i.id === income.id).description).toBe('Sueldo editado');

    await flushAsync();

    expect(result.current.incomes.find((i) => i.id === income.id)).toEqual(originalSnapshot);
    expect(result.current.alert).toEqual({ type: 'error', message: 'No se pudo actualizar el ingreso. Se restauró el valor anterior.' });
  });

  it('updateExpense: si syncUpdate falla, restaura exactamente el valor previo', async () => {
    const okChain = makeSupabaseChain();
    supabase.from.mockReturnValue(okChain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    let expense;
    act(() => {
      expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
    });
    const originalSnapshot = { ...expense };

    const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
    supabase.from.mockReturnValue(failChain);
    act(() => {
      result.current.updateExpense(expense.id, { description: 'Super editado', category: 'Alimentación', amount: 80, date: expense.date });
    });
    await flushAsync();

    expect(result.current.expenses.find((e) => e.id === expense.id)).toEqual(originalSnapshot);
    expect(result.current.alert).toEqual({ type: 'error', message: 'No se pudo actualizar el gasto. Se restauró el valor anterior.' });
  });

  it('confirmPendingOperation (venció el Toast de baja): si syncDelete falla, restaura el movimiento en su posición original', async () => {
    const okChain = makeSupabaseChain();
    supabase.from.mockReturnValue(okChain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    let first, second, third;
    act(() => { first = result.current.addExpense('Uno', 'Alimentación', 10, '2026-07-01', 'USD').movement; });
    act(() => { second = result.current.addExpense('Dos', 'Alimentación', 20, '2026-07-01', 'USD').movement; });
    act(() => { third = result.current.addExpense('Tres', 'Alimentación', 30, '2026-07-01', 'USD').movement; });

    act(() => {
      result.current.deleteMovement(second); // índice 1
    });
    expect(result.current.expenses.map((e) => e.id)).toEqual([first.id, third.id]);

    const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
    supabase.from.mockReturnValue(failChain);
    act(() => {
      result.current.confirmPendingOperation();
    });
    await flushAsync();

    expect(result.current.expenses.map((e) => e.id)).toEqual([first.id, second.id, third.id]);
    expect(result.current.alert).toEqual({ type: 'error', message: 'No se pudo eliminar el movimiento. Se restauró.' });
  });

  it('undoPendingOperation (compensando un alta): si syncDelete falla, el movimiento vuelve a aparecer y se avisa que sigue existiendo', async () => {
    const okChain = makeSupabaseChain();
    supabase.from.mockReturnValue(okChain);
    const { result } = renderHook(() => useTransactions());
    await flushInitialLoad();

    let income;
    act(() => {
      income = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD', { notification: 'toast' }).movement;
    });

    const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
    supabase.from.mockReturnValue(failChain);
    act(() => {
      result.current.undoPendingOperation();
    });
    expect(result.current.incomes.some((i) => i.id === income.id)).toBe(false);

    await flushAsync();

    expect(result.current.incomes.some((i) => i.id === income.id)).toBe(true);
    expect(result.current.alert).toEqual({ type: 'error', message: 'No se pudo deshacer correctamente: el movimiento sigue existiendo.' });
  });

  it('removeMultiple: si syncDeleteMultiple falla, restaura los ingresos y gastos eliminados (verificado con StrictMode)', async () => {
    const okChain = makeSupabaseChain();
    supabase.from.mockReturnValue(okChain);
    const { result } = renderHook(() => useTransactions(), { wrapper: strictWrapper });
    await flushInitialLoad();

    let income, expense;
    act(() => { income = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD').movement; });
    act(() => { expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement; });

    const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
    supabase.from.mockReturnValue(failChain);
    act(() => {
      result.current.removeMultiple([income.id, expense.id]);
    });
    expect(result.current.incomes.some((i) => i.id === income.id)).toBe(false);
    expect(result.current.expenses.some((e) => e.id === expense.id)).toBe(false);

    await flushAsync();

    expect(result.current.incomes.some((i) => i.id === income.id)).toBe(true);
    expect(result.current.expenses.some((e) => e.id === expense.id)).toBe(true);
    expect(result.current.alert).toEqual({ type: 'error', message: 'No se pudieron eliminar 2 transacciones. Se restauraron.' });
  });

  it('categorizeMultiple: si syncUpdateMultiple falla, restaura la categoría original (verificado con StrictMode)', async () => {
    const okChain = makeSupabaseChain();
    supabase.from.mockReturnValue(okChain);
    const { result } = renderHook(() => useTransactions(), { wrapper: strictWrapper });
    await flushInitialLoad();

    let expense;
    act(() => {
      expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
    });

    const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
    supabase.from.mockReturnValue(failChain);
    act(() => {
      result.current.categorizeMultiple([expense.id], 'Transporte');
    });
    expect(result.current.expenses.find((e) => e.id === expense.id).category).toBe('Transporte');

    await flushAsync();

    expect(result.current.expenses.find((e) => e.id === expense.id).category).toBe('Alimentación');
    expect(result.current.alert).toEqual({ type: 'error', message: 'No se pudo recategorizar 1 gastos. Se restauraron.' });
  });
});

describe('useTransactions — Deshacer en editar/importar/categorizar (RC-1.7/A4)', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'user-1' } });
  });

  describe('updateIncome/updateExpense con notification: "toast"', () => {
    it('updateIncome: NO llama showAlert y arranca una operación reversible de tipo "update"', async () => {
      const chain = makeSupabaseChain();
      supabase.from.mockReturnValue(chain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();

      let income;
      act(() => {
        income = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD').movement;
      });
      act(() => {
        result.current.showAlert(null); // limpia el alert de la creación legacy
      });

      act(() => {
        result.current.updateIncome(income.id, { description: 'Sueldo editado', amount: 1200, date: income.date }, { notification: 'toast' });
      });

      expect(result.current.alert).toBeNull();
      expect(result.current.pendingOperation.kind).toBe('update');
      expect(result.current.pendingOperation.movement).toMatchObject({ id: income.id, description: 'Sueldo editado', amount: 1200 });
      expect(result.current.pendingOperation.previous).toMatchObject({ id: income.id, description: 'Sueldo', amount: 1000 });
      expect(result.current.pendingOperationMessage).toBe('Ingreso actualizado');
    });

    it('updateExpense: mismo comportamiento, mensaje "Gasto actualizado"', async () => {
      const chain = makeSupabaseChain();
      supabase.from.mockReturnValue(chain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();

      let expense;
      act(() => {
        expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
      });

      act(() => {
        result.current.updateExpense(expense.id, { description: 'Super editado', category: 'Alimentación', amount: 80, date: expense.date }, { notification: 'toast' });
      });

      expect(result.current.pendingOperation.kind).toBe('update');
      expect(result.current.pendingOperationMessage).toBe('Gasto actualizado');
    });

    it('undoPendingOperation en un "update": restaura el valor previo local y re-sincroniza contra Supabase', async () => {
      const chain = makeSupabaseChain();
      supabase.from.mockReturnValue(chain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();

      let income;
      act(() => {
        income = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD').movement;
      });
      act(() => {
        result.current.updateIncome(income.id, { description: 'Sueldo editado', amount: 1200, date: income.date }, { notification: 'toast' });
      });
      expect(result.current.incomes.find((i) => i.id === income.id).amount).toBe(1200);
      chain.update.mockClear();

      act(() => {
        result.current.undoPendingOperation();
      });

      expect(result.current.pendingOperation).toBeNull();
      expect(result.current.incomes.find((i) => i.id === income.id)).toMatchObject({ description: 'Sueldo', amount: 1000 });
      expect(chain.update).toHaveBeenCalledTimes(1);
    });

    it('si Supabase rechaza el update, limpia el pendingOperation si todavía apunta al mismo movimiento', async () => {
      const okChain = makeSupabaseChain();
      supabase.from.mockReturnValue(okChain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();

      let income;
      act(() => {
        income = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD').movement;
      });

      const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
      supabase.from.mockReturnValue(failChain);
      act(() => {
        result.current.updateIncome(income.id, { description: 'Sueldo editado', amount: 1200, date: income.date }, { notification: 'toast' });
      });
      expect(result.current.pendingOperation?.kind).toBe('update');

      await flushAsync();

      expect(result.current.pendingOperation).toBeNull();
      expect(result.current.incomes.find((i) => i.id === income.id).amount).toBe(1000);
      expect(result.current.alert).toEqual({ type: 'error', message: 'No se pudo actualizar el ingreso. Se restauró el valor anterior.' });
    });
  });

  describe('addBulkTransactions con notification: "toast"', () => {
    it('NO llama showAlert y arranca una operación reversible de tipo "bulkCreate"', async () => {
      const chain = makeSupabaseChain();
      supabase.from.mockReturnValue(chain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();

      act(() => {
        result.current.addBulkTransactions([
          { type: 'income', description: 'Uno', amount: 10, date: '2026-07-01' },
          { type: 'expense', description: 'Dos', category: 'Alimentación', amount: 20, date: '2026-07-01' },
        ], { notification: 'toast' });
      });

      expect(result.current.alert).toBeNull();
      expect(result.current.pendingOperation.kind).toBe('bulkCreate');
      expect(result.current.pendingOperation.movements).toHaveLength(2);
      expect(result.current.pendingOperationMessage).toBe('2 transacciones importadas');
    });

    it('undoPendingOperation en un "bulkCreate": remueve todos los movimientos importados y compensa contra Supabase', async () => {
      const chain = makeSupabaseChain();
      supabase.from.mockReturnValue(chain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();

      act(() => {
        result.current.addBulkTransactions([
          { type: 'income', description: 'Uno', amount: 10, date: '2026-07-01' },
          { type: 'expense', description: 'Dos', category: 'Alimentación', amount: 20, date: '2026-07-01' },
        ], { notification: 'toast' });
      });
      expect(result.current.incomes).toHaveLength(1);
      expect(result.current.expenses).toHaveLength(1);
      chain.delete.mockClear();

      act(() => {
        result.current.undoPendingOperation();
      });

      expect(result.current.pendingOperation).toBeNull();
      expect(result.current.incomes).toHaveLength(0);
      expect(result.current.expenses).toHaveLength(0);
      expect(chain.delete).toHaveBeenCalledTimes(1);
    });

    it('si Supabase rechaza el borrado compensatorio, restaura los movimientos importados', async () => {
      const chain = makeSupabaseChain();
      supabase.from.mockReturnValue(chain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();

      act(() => {
        result.current.addBulkTransactions([
          { type: 'income', description: 'Uno', amount: 10, date: '2026-07-01' },
        ], { notification: 'toast' });
      });

      const failChain = makeSupabaseChain({ data: null, error: { message: 'network down' } });
      supabase.from.mockReturnValue(failChain);
      act(() => {
        result.current.undoPendingOperation();
      });
      expect(result.current.incomes).toHaveLength(0);

      await flushAsync();

      expect(result.current.incomes).toHaveLength(1);
      expect(result.current.alert).toEqual({ type: 'error', message: 'No se pudo deshacer correctamente: algunas transacciones siguen existiendo.' });
    });
  });

  describe('categorizeMultiple con notification: "toast"', () => {
    it('NO llama showAlert y arranca una operación reversible de tipo "categorizeMultiple"', async () => {
      const chain = makeSupabaseChain();
      supabase.from.mockReturnValue(chain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();

      let expense;
      act(() => {
        expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
      });

      act(() => {
        result.current.categorizeMultiple([expense.id], 'Transporte', { notification: 'toast' });
      });

      expect(result.current.pendingOperation.kind).toBe('categorizeMultiple');
      expect(result.current.pendingOperation.updates).toHaveLength(1);
      expect(result.current.pendingOperation.previous[0]).toMatchObject({ id: expense.id, category: 'Alimentación' });
      expect(result.current.pendingOperationMessage).toBe('1 gastos recategorizados');
    });

    it('undoPendingOperation en un "categorizeMultiple": restaura la categoría previa y re-sincroniza', async () => {
      const chain = makeSupabaseChain();
      supabase.from.mockReturnValue(chain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();

      let expense;
      act(() => {
        expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
      });
      act(() => {
        result.current.categorizeMultiple([expense.id], 'Transporte', { notification: 'toast' });
      });
      expect(result.current.expenses.find((e) => e.id === expense.id).category).toBe('Transporte');
      chain.upsert.mockClear();

      act(() => {
        result.current.undoPendingOperation();
      });

      expect(result.current.pendingOperation).toBeNull();
      expect(result.current.expenses.find((e) => e.id === expense.id).category).toBe('Alimentación');
      expect(chain.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('pendingOperationMessage — cobertura de los 5 kinds', () => {
    it('sin pendingOperation, el mensaje es un string vacío', async () => {
      const chain = makeSupabaseChain();
      supabase.from.mockReturnValue(chain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();
      expect(result.current.pendingOperationMessage).toBe('');
    });

    it('kind "create" (vía notification toast de addIncome): "Movimiento añadido"', async () => {
      const chain = makeSupabaseChain();
      supabase.from.mockReturnValue(chain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();
      act(() => {
        result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD', { notification: 'toast' });
      });
      expect(result.current.pendingOperationMessage).toBe('Movimiento añadido');
    });

    it('kind "delete": "Movimiento eliminado"', async () => {
      const chain = makeSupabaseChain();
      supabase.from.mockReturnValue(chain);
      const { result } = renderHook(() => useTransactions());
      await flushInitialLoad();
      let expense;
      act(() => {
        expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
      });
      act(() => {
        result.current.deleteMovement(expense);
      });
      expect(result.current.pendingOperationMessage).toBe('Movimiento eliminado');
    });
  });
});
