import {
  calculateSpendingPaceComparison,
  getMonthlySeries,
  getRecentTransactions,
  splitAmountForDisplay,
} from '../utils/dashboardCalculations';

// Fase II — Integración del Dashboard (Saldo Design Constitution v1.2).
// Fuente: docs/design/screens/Saldo Dashboard.dc.html.
// Lógica pura nueva para: comparación de ritmo de gasto (1a), serie mensual
// para el mini-gráfico (1b), últimos N movimientos (1c) y separación entero/
// decimal para la tipografía Numeric XL (1d). Ver src/utils/calculations.js
// para las utilidades reusadas (parseLocalDate, filterByMonth, calculateTotal).

describe('calculateSpendingPaceComparison — 1a', () => {
  it('calcula currentAmount, historicalAverage y diff exactos con mes actual parcial + histórico', () => {
    const referenceDate = new Date(2026, 6, 17); // 17 jul 2026
    const expenses = [
      // Mes de referencia (julio 2026) — solo cuenta hasta el día 17.
      { date: '2026-07-05', amount: 100 },
      { date: '2026-07-17', amount: 50 },
      { date: '2026-07-25', amount: 999 }, // excluido: día > 17
      // Junio 2026 (histórico) — hasta el día 17: 80.
      { date: '2026-06-10', amount: 80 },
      { date: '2026-06-20', amount: 40 }, // excluido: día > 17
      // Mayo 2026 (histórico) — hasta el día 17: 120.
      { date: '2026-05-01', amount: 60 },
      { date: '2026-05-17', amount: 60 },
    ];

    const result = calculateSpendingPaceComparison(expenses, referenceDate);

    expect(result.currentAmount).toBe(150);
    expect(result.historicalAverage).toBe(100); // (80 + 120) / 2
    expect(result.diff).toBe(-50); // gastando MÁS que la media (diff negativo)
  });

  it('diff positivo cuando el gasto actual es menor que la media histórica', () => {
    const referenceDate = new Date(2026, 6, 17);
    const expenses = [
      { date: '2026-07-10', amount: 40 }, // currentAmount = 40
      { date: '2026-06-10', amount: 100 }, // histórico junio = 100
      { date: '2026-05-10', amount: 140 }, // histórico mayo = 140
    ];

    const result = calculateSpendingPaceComparison(expenses, referenceDate);

    expect(result.currentAmount).toBe(40);
    expect(result.historicalAverage).toBe(120);
    expect(result.diff).toBe(80);
  });

  it('sin ningún mes histórico con datos → null (nunca fabricar una comparación sin base)', () => {
    const referenceDate = new Date(2026, 6, 17);
    const expenses = [
      { date: '2026-07-01', amount: 100 },
      { date: '2026-07-15', amount: 50 },
    ];
    expect(calculateSpendingPaceComparison(expenses, referenceDate)).toBeNull();
  });

  it('sin datos en absoluto → null', () => {
    expect(calculateSpendingPaceComparison([], new Date(2026, 6, 17))).toBeNull();
  });

  it('mes histórico más corto que el día N de referencia no rompe — suma lo que hay', () => {
    // Referencia: 31 de enero. Histórico: febrero tiene 28 días — no existe
    // febrero 31, así que caen todos los gastos de febrero sin lógica especial.
    const referenceDate = new Date(2026, 0, 31); // 31 ene 2026
    const expenses = [
      { date: '2026-01-15', amount: 200 }, // mes actual, día <= 31
      { date: '2025-02-05', amount: 30 },
      { date: '2025-02-28', amount: 70 }, // histórico corto: todo cuenta (100 total)
    ];

    const result = calculateSpendingPaceComparison(expenses, referenceDate);

    expect(result.currentAmount).toBe(200);
    expect(result.historicalAverage).toBe(100);
  });
});

describe('getMonthlySeries — 1b', () => {
  it('devuelve exactamente `months` entradas en orden cronológico ascendente, mes de referencia al final', () => {
    const referenceDate = new Date(2026, 6, 17); // jul 2026
    const expenses = [
      { date: '2026-02-01', amount: 10 },
      { date: '2026-03-01', amount: 20 },
      { date: '2026-03-15', amount: 5 },
      { date: '2026-05-01', amount: 40 },
      { date: '2026-07-01', amount: 60 },
      { date: '2026-07-10', amount: 15 },
    ];

    const series = getMonthlySeries(expenses, referenceDate, 6);

    expect(series).toHaveLength(6);
    expect(series).toEqual([
      { year: 2026, month: 1, total: 10 }, // feb
      { year: 2026, month: 2, total: 25 }, // mar
      { year: 2026, month: 3, total: 0 },  // abr — sin gasto, total real 0
      { year: 2026, month: 4, total: 40 }, // may
      { year: 2026, month: 5, total: 0 },  // jun
      { year: 2026, month: 6, total: 75 }, // jul (referencia, al final)
    ]);
  });

  it('sin historial → `months` entradas todas en 0, con año/mes correctos', () => {
    const referenceDate = new Date(2026, 0, 10); // ene 2026
    const series = getMonthlySeries([], referenceDate, 6);
    expect(series).toHaveLength(6);
    expect(series.every((entry) => entry.total === 0)).toBe(true);
    expect(series[5]).toEqual({ year: 2026, month: 0, total: 0 });
    expect(series[0]).toEqual({ year: 2025, month: 7, total: 0 }); // ago 2025
  });

  it('respeta un `months` distinto de 6', () => {
    const referenceDate = new Date(2026, 6, 17);
    const series = getMonthlySeries([], referenceDate, 3);
    expect(series).toHaveLength(3);
    expect(series[2]).toEqual({ year: 2026, month: 6, total: 0 });
  });
});

describe('getRecentTransactions — 1c', () => {
  it('devuelve los `limit` movimientos más recientes por fecha descendente', () => {
    const transactions = [
      { id: 'a', date: '2026-01-01', type: 'income' },
      { id: 'b', date: '2026-03-15', type: 'expense' },
      { id: 'c', date: '2026-02-10', type: 'expense' },
      { id: 'd', date: '2026-05-01', type: 'income' },
      { id: 'e', date: '2026-04-20', type: 'expense' },
      { id: 'f', date: '2026-04-25', type: 'expense' },
    ];

    const result = getRecentTransactions(transactions, 5);

    expect(result.map((t) => t.id)).toEqual(['d', 'f', 'e', 'b', 'c']);
  });

  it('respeta el límite (default 5)', () => {
    const transactions = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      date: `2026-01-${String(i + 1).padStart(2, '0')}`,
      type: 'expense',
    }));
    expect(getRecentTransactions(transactions)).toHaveLength(5);
  });

  it('un empate de fecha no rompe nada (no lanza, devuelve la cantidad correcta)', () => {
    const transactions = [
      { id: 'a', date: '2026-01-01', type: 'income' },
      { id: 'b', date: '2026-01-01', type: 'expense' },
      { id: 'c', date: '2026-01-01', type: 'expense' },
    ];
    expect(() => getRecentTransactions(transactions, 2)).not.toThrow();
    expect(getRecentTransactions(transactions, 2)).toHaveLength(2);
  });
});

describe('splitAmountForDisplay — 1d', () => {
  it('monto positivo: separa parte entera y parte decimal+moneda, consistente con formatCurrency (locale es-419)', () => {
    const result = splitAmountForDisplay(24860.32, 'EUR');
    expect(result).toEqual({ integerPart: '24,860', decimalPart: '.32 EUR' });
  });

  it('monto negativo: usa el signo "−" tipográfico (U+2212), NUNCA el guion ASCII', () => {
    const result = splitAmountForDisplay(-1234.5, 'USD');
    expect(result.integerPart).toBe('−1,234');
    expect(result.integerPart).not.toMatch(/^-/); // no ASCII hyphen al inicio
    expect(result.decimalPart).toBe('.50 USD');
  });

  it('entero sin decimales explícitos: igual muestra 2 decimales (00)', () => {
    const result = splitAmountForDisplay(1000, 'USD');
    expect(result).toEqual({ integerPart: '1,000', decimalPart: '.00 USD' });
  });

  it('monto cero', () => {
    const result = splitAmountForDisplay(0, 'USD');
    expect(result).toEqual({ integerPart: '0', decimalPart: '.00 USD' });
  });

  it('otra moneda soportada por CurrencyContext (MXN)', () => {
    const result = splitAmountForDisplay(1234.5, 'MXN');
    expect(result).toEqual({ integerPart: '1,234', decimalPart: '.50 MXN' });
  });
});
