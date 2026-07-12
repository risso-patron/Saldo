// Test de aprobación + objetivo (Fase 3, task 3.3): documenta el comportamiento
// PÚBLICO de useFilters ANTES/DESPUÉS de migrarlo a consumir usePeriod()
// internamente. La API pública (selectedYear, setSelectedYear, selectedMonth,
// setSelectedMonth, filteredIncomes, filteredExpenses, filteredTotalIncome,
// filteredTotalExpenses, filteredBalance, availableYears, availableMonths,
// monthlyComparison) MUST mantenerse exactamente igual — spec "Consumidor
// existente sin cambios" (App.jsx/AppHeader.jsx no se tocan).
import { renderHook, act } from '@testing-library/react';
import { useFilters } from './useFilters';
import { PeriodProvider } from '../contexts/PeriodContext';

const wrapper = ({ children }) => <PeriodProvider>{children}</PeriodProvider>;

const incomes = [
  { description: 'Sueldo Feb', amount: 1000, date: '2026-02-10' },
  { description: 'Sueldo Marzo', amount: 1200, date: '2026-03-10' },
];
const expenses = [
  { description: 'Renta Feb', amount: 400, date: '2026-02-05', category: 'Vivienda' },
  { description: 'Renta Marzo', amount: 450, date: '2026-03-05', category: 'Vivienda' },
];

describe('useFilters — API pública compatible tras migrar a PeriodContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  it('sin período elegido: selectedYear/selectedMonth null y filteredIncomes/Expenses sin filtrar (comportamiento actual preservado)', () => {
    const { result } = renderHook(() => useFilters(incomes, expenses), { wrapper });

    expect(result.current.selectedYear).toBeNull();
    expect(result.current.selectedMonth).toBeNull();
    expect(result.current.filteredIncomes).toHaveLength(2);
    expect(result.current.filteredExpenses).toHaveLength(2);
    expect(result.current.filteredTotalIncome).toBe(2200);
    expect(result.current.filteredTotalExpenses).toBe(850);
    expect(result.current.filteredBalance).toBe(1350);
    expect(result.current.availableYears).toEqual([2026]);
  });

  it('con setSelectedYear/setSelectedMonth filtra igual que antes (comportamiento actual preservado)', () => {
    const { result } = renderHook(() => useFilters(incomes, expenses), { wrapper });

    act(() => {
      result.current.setSelectedYear(2026);
      result.current.setSelectedMonth(2); // Marzo, 0-indexed
    });

    expect(result.current.filteredIncomes).toHaveLength(1);
    expect(result.current.filteredIncomes[0].description).toBe('Sueldo Marzo');
    expect(result.current.filteredTotalIncome).toBe(1200);
    expect(result.current.availableMonths).toEqual([1, 2]); // Feb=1, Marzo=2
  });

  it('pasa el período activo a calculateMonthlyComparison: sin período elegido (type="all") no hay comparación (comportamiento NUEVO del cambio)', () => {
    const { result } = renderHook(() => useFilters(incomes, expenses), { wrapper });

    expect(result.current.monthlyComparison.hasComparison).toBe(false);
  });

  it('con un mes elegido, monthlyComparison compara contra el mes anterior AL PERÍODO ELEGIDO, no al mes calendario real (comportamiento NUEVO del cambio)', () => {
    const { result } = renderHook(() => useFilters(incomes, expenses), { wrapper });

    act(() => {
      result.current.setSelectedYear(2026);
      result.current.setSelectedMonth(2); // Marzo elegido -> anterior es Febrero
    });

    expect(result.current.monthlyComparison.hasComparison).toBe(true);
    expect(result.current.monthlyComparison.prevTotalIncome).toBe(1000); // Sueldo Feb
    expect(result.current.monthlyComparison.prevTotalExpenses).toBe(400); // Renta Feb
  });
});
