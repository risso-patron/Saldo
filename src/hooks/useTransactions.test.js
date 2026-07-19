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
