import { renderHook, act } from '@testing-library/react';
import { useTransactions } from './useTransactions';

// Checkpoint III-B (Saldo Design Constitution v1.2) — infraestructura de
// Toast + Deshacer para "Nuevo Movimiento". Cubre SOLO lo tocado en este
// checkpoint: el nuevo parámetro `options` de addIncome/addExpense (control
// de notificación legacy vs. suprimida), el nuevo contrato de retorno
// { success, movement } y el nuevo helper undoAddMovement. No pretende dar
// cobertura exhaustiva al resto del hook (ya probado indirectamente por los
// tests de los componentes que lo consumen).

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
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

describe('useTransactions — options.notification y contrato de retorno (Checkpoint III-B)', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
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

    it('con notification "none" NO llama showAlert en éxito', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD', { notification: 'none' });
      });

      expect(result.current.alert).toBeNull();
    });

    it('con notification "none" NO llama showAlert en error', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addIncome('', 0, '2026-07-01', 'USD', { notification: 'none' });
      });

      expect(result.current.alert).toBeNull();
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

    it('con notification "none" NO llama showAlert en éxito', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD', { notification: 'none' });
      });

      expect(result.current.alert).toBeNull();
    });

    it('con notification "none" NO llama showAlert en error', () => {
      const { result } = renderHook(() => useTransactions());

      act(() => {
        result.current.addExpense('', 'CategoríaInexistente', 0, '2026-07-01', 'USD', { notification: 'none' });
      });

      expect(result.current.alert).toBeNull();
    });
  });

  describe('undoAddMovement', () => {
    it('con movement.type "income" elimina el ingreso y no toca los gastos', () => {
      const { result } = renderHook(() => useTransactions());

      let income, expense;
      act(() => {
        income = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD').movement;
      });
      act(() => {
        expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
      });

      act(() => {
        result.current.undoAddMovement(income);
      });

      expect(result.current.incomes.some((i) => i.id === income.id)).toBe(false);
      expect(result.current.expenses.some((e) => e.id === expense.id)).toBe(true);
    });

    it('con movement.type "expense" elimina el gasto y no toca los ingresos', () => {
      const { result } = renderHook(() => useTransactions());

      let income, expense;
      act(() => {
        income = result.current.addIncome('Sueldo', 1000, '2026-07-01', 'USD').movement;
      });
      act(() => {
        expense = result.current.addExpense('Super', 'Alimentación', 50, '2026-07-01', 'USD').movement;
      });

      act(() => {
        result.current.undoAddMovement(expense);
      });

      expect(result.current.expenses.some((e) => e.id === expense.id)).toBe(false);
      expect(result.current.incomes.some((i) => i.id === income.id)).toBe(true);
    });
  });
});
