import {
  calculateTotal,
  calculateBalance,
  calculateCategoryAnalysis,
  filterByYear,
  filterByMonth,
  filterByDateRange,
  calculateMonthlyComparison,
  getCategoryDominance,
} from '../utils/calculations';

describe('Cálculos de Presupuesto', () => {
  const mockTransactions = [
    { description: 'Sueldo', amount: 1000, date: '2025-01-01', type: 'income' },
    { description: 'Freelance', amount: 500, date: '2025-02-01', type: 'income' },
    { description: 'Renta', amount: 600, date: '2025-01-05', category: 'Vivienda', type: 'expense' },
    { description: 'Comida', amount: 200, date: '2025-02-10', category: 'Alimentación', type: 'expense' },
  ];

  it('debe calcular el total correctamente', () => {
    const incomes = mockTransactions.filter(t => t.type === 'income');
    expect(calculateTotal(incomes)).toBe(1500);
  });

  it('debe calcular el balance correctamente', () => {
    expect(calculateBalance(1500, 800)).toBe(700);
  });

  it('debe calcular el análisis por categoría correctamente', () => {
    const expenses = mockTransactions.filter(t => t.type === 'expense');
    const analysis = calculateCategoryAnalysis(expenses, 800);
    
    expect(analysis).toHaveLength(2);
    expect(analysis[0].category).toBe('Vivienda');
    expect(analysis[0].amount).toBe(600);
    expect(analysis[0].percentage).toBe(75);
  });

  it('debe filtrar por año correctamente', () => {
    const filtered = filterByYear(mockTransactions, 2025);
    expect(filtered).toHaveLength(4);

    const none = filterByYear(mockTransactions, 2024);
    expect(none).toHaveLength(0);
  });
});

// Red de seguridad (tasks 2.1/2.2): documentan el comportamiento ACTUAL de
// filterByMonth y calculateMonthlyComparison ANTES de migrarlas a recibir el
// período global (Fase 3). Deben pasar YA, sin tocar producción — approval tests.
describe('filterByMonth (comportamiento actual — red de seguridad pre-refactor)', () => {
  const items = [
    { description: 'Sueldo', amount: 1000, date: '2026-03-01' },
    { description: 'Freelance', amount: 300, date: '2026-03-15T10:00:00Z' },
    { description: 'Renta', amount: 600, date: '2026-04-01' },
    { description: 'Fecha inválida', amount: 50, date: 'no-es-una-fecha' },
    { description: 'Sin fecha', amount: 20, date: null },
  ];

  it('incluye únicamente las transacciones del mes exacto (0-indexed: Marzo=2)', () => {
    const result = filterByMonth(items, 2026, 2);
    expect(result).toHaveLength(2);
    expect(result.map(i => i.description)).toEqual(['Sueldo', 'Freelance']);
  });

  it('excluye transacciones fuera del año/mes solicitado', () => {
    const result = filterByMonth(items, 2026, 3); // Abril
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe('Renta');

    const otroAnio = filterByMonth(items, 2025, 2);
    expect(otroAnio).toHaveLength(0);
  });

  it('descarta transacciones con fecha inválida o ausente sin lanzar error', () => {
    const result = filterByMonth(items, 2026, 2);
    expect(result.find(i => i.description === 'Fecha inválida')).toBeUndefined();
    expect(result.find(i => i.description === 'Sin fecha')).toBeUndefined();
  });
});

describe('calculateMonthlyComparison (comportamiento actual — red de seguridad pre-refactor)', () => {
  beforeEach(() => {
    // Fija "hoy" en Marzo 2026 para que el mes anterior (Febrero) sea determinístico.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('usa el mes calendario real anterior a "hoy" (new Date()), ignorando cualquier período elegido por el usuario', () => {
    const incomes = [
      { description: 'Sueldo Feb', amount: 1000, date: '2026-02-10' },
      { description: 'Sueldo Marzo', amount: 1200, date: '2026-03-10' }, // no debe contarse
    ];
    const expenses = [
      { description: 'Renta Feb', amount: 400, date: '2026-02-05', category: 'Vivienda' },
      { description: 'Renta Marzo', amount: 450, date: '2026-03-05', category: 'Vivienda' }, // no debe contarse
    ];

    const result = calculateMonthlyComparison(incomes, expenses);

    expect(result.prevTotalIncome).toBe(1000);
    expect(result.prevTotalExpenses).toBe(400);
    expect(result.prevBalance).toBe(600);
  });

  it('calcula Enero como mes anterior cuando "hoy" cae en Enero (cruce de año)', () => {
    vi.setSystemTime(new Date('2027-01-10T12:00:00'));

    const incomes = [{ description: 'Sueldo Dic', amount: 800, date: '2026-12-20' }];
    const expenses = [{ description: 'Renta Dic', amount: 300, date: '2026-12-05', category: 'Vivienda' }];

    const result = calculateMonthlyComparison(incomes, expenses);

    expect(result.prevTotalIncome).toBe(800);
    expect(result.prevTotalExpenses).toBe(300);
    expect(result.prevBalance).toBe(500);
  });
});

// Tests OBJETIVO (Fase 3 — deben quedar en ROJO en este lote a propósito).
// Documentan la firma/comportamiento que calculateMonthlyComparison DEBE tener
// tras 3.2: recibir el período activo como parámetro en vez de leer new Date().
describe('calculateMonthlyComparison — firma objetivo con período global (RED hasta 3.2)', () => {
  beforeEach(() => {
    // "Hoy" real es Julio 2026 — a propósito distinto del período elegido,
    // para probar que la función usa `period`, no new Date().
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-07T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('con type="month" usa el mes ANTERIOR AL PERÍODO ELEGIDO (Febrero), no al mes calendario real (Junio)', () => {
    const incomes = [
      { description: 'Sueldo Feb', amount: 1000, date: '2026-02-10' },
      { description: 'Sueldo Junio', amount: 999, date: '2026-06-10' }, // mes calendario real anterior — NO debe usarse
    ];
    const expenses = [
      { description: 'Renta Feb', amount: 400, date: '2026-02-05', category: 'Vivienda' },
    ];

    const period = { type: 'month', year: 2026, month: 2 }; // Marzo 2026 elegido por el usuario
    const result = calculateMonthlyComparison(incomes, expenses, period);

    expect(result.prevTotalIncome).toBe(1000);
    expect(result.prevTotalExpenses).toBe(400);
    expect(result.hasComparison).toBe(true);
  });

  it('con type="year" usa el AÑO anterior completo', () => {
    const incomes = [{ description: 'Ingreso 2025', amount: 5000, date: '2025-06-01' }];
    const expenses = [{ description: 'Gasto 2025', amount: 2000, date: '2025-06-01', category: 'Varios' }];

    const period = { type: 'year', year: 2026 };
    const result = calculateMonthlyComparison(incomes, expenses, period);

    expect(result.prevTotalIncome).toBe(5000);
    expect(result.prevTotalExpenses).toBe(2000);
    expect(result.hasComparison).toBe(true);
  });

  it('con type="all" no hay período anterior natural: hasComparison=false, sin fallback numérico', () => {
    const incomes = [{ description: 'Sueldo', amount: 1000, date: '2026-01-10' }];
    const expenses = [{ description: 'Renta', amount: 400, date: '2026-01-05', category: 'Vivienda' }];

    const period = { type: 'all' };
    const result = calculateMonthlyComparison(incomes, expenses, period);

    expect(result.hasComparison).toBe(false);
  });

  it('con type="custom" usa el rango anterior de igual duración (mismo mes, sin cruce)', () => {
    const incomes = [
      { description: 'Adelanto', amount: 700, date: '2026-03-05' }, // dentro del rango previo
      { description: 'Fuera de rango previo', amount: 111, date: '2026-03-01' }, // antes del rango previo
    ];
    const expenses = [
      { description: 'Gasto previo', amount: 250, date: '2026-03-07', category: 'Varios' },
    ];

    // Período elegido: 10-16 Marzo (7 días) -> anterior de igual duración: 3-9 Marzo
    const period = { type: 'custom', from: '2026-03-10', to: '2026-03-16' };
    const result = calculateMonthlyComparison(incomes, expenses, period);

    expect(result.prevTotalIncome).toBe(700);
    expect(result.prevTotalExpenses).toBe(250);
    expect(result.hasComparison).toBe(true);
  });

  it('con type="custom" cruzando fin de mes, el rango anterior de igual duración cae en el mes previo', () => {
    const incomes = [
      { description: 'Ingreso Febrero', amount: 300, date: '2026-02-20' }, // dentro del rango previo (19 Feb - 28 Feb)
      { description: 'Ingreso Marzo elegido', amount: 999, date: '2026-03-05' }, // dentro del período elegido, no del previo
    ];
    const expenses = [];

    // Período elegido: 1-10 Marzo (10 días) -> anterior de igual duración: 19-28 Febrero
    const period = { type: 'custom', from: '2026-03-01', to: '2026-03-10' };
    const result = calculateMonthlyComparison(incomes, expenses, period);

    expect(result.prevTotalIncome).toBe(300);
    expect(result.hasComparison).toBe(true);
  });
});

// Test OBJETIVO adicional (Fase 3, task 3.1/3.2 — transversal): `filterByDateRange`
// es la base compartida para BudgetManager, ExportManager y el cálculo de
// comparativos con type='custom'. RED hasta implementarse.
describe('filterByDateRange — filtrado por rango inclusive con normalización de timezone', () => {
  const items = [
    { description: 'Antes del rango', amount: 10, date: '2026-02-28' },
    { description: 'Límite inicio', amount: 20, date: '2026-03-01' },
    { description: 'Dentro del rango', amount: 30, date: '2026-03-15' },
    { description: 'Límite fin', amount: 40, date: '2026-03-31' },
    { description: 'Después del rango', amount: 50, date: '2026-04-01' },
    { description: 'Fecha inválida', amount: 60, date: 'no-es-una-fecha' },
  ];

  it('incluye únicamente transacciones dentro del rango, incluyendo ambos límites', () => {
    const result = filterByDateRange(items, '2026-03-01', '2026-03-31');
    expect(result.map(i => i.description)).toEqual(['Límite inicio', 'Dentro del rango', 'Límite fin']);
  });

  it('devuelve la lista sin filtrar si falta from o to', () => {
    expect(filterByDateRange(items, null, '2026-03-31')).toHaveLength(items.length);
    expect(filterByDateRange(items, '2026-03-01', undefined)).toHaveLength(items.length);
  });
});

// HAL-001 parte 1: aviso de dominancia de "Otros". Un "Otros" alto no es un
// patrón de gasto real (a diferencia de, ej., "Vivienda" siendo la categoría
// más grande) — es señal de mala categorización. Por eso el chequeo es
// específico a "Otros", no genérico a "la categoría más grande".
describe('getCategoryDominance — aviso cuando "Otros" supera el umbral (HAL-001)', () => {
  it('marca isDominant=true cuando "Otros" supera el umbral por defecto (20%)', () => {
    const analysis = [
      { category: 'Vivienda', amount: 600, percentage: 55 },
      { category: 'Otros', amount: 280, percentage: 25 },
    ];
    const result = getCategoryDominance(analysis);
    expect(result.isDominant).toBe(true);
    expect(result.percentage).toBe(25);
  });

  it('NO marca dominancia cuando "Otros" está exactamente en el umbral (20% no es "superar")', () => {
    const analysis = [{ category: 'Otros', amount: 200, percentage: 20 }];
    const result = getCategoryDominance(analysis);
    expect(result.isDominant).toBe(false);
    expect(result.percentage).toBe(20);
  });

  it('NO marca dominancia cuando "Otros" está por debajo del umbral', () => {
    const analysis = [{ category: 'Otros', amount: 50, percentage: 10 }];
    const result = getCategoryDominance(analysis);
    expect(result.isDominant).toBe(false);
    expect(result.percentage).toBe(10);
  });

  it('devuelve isDominant=false y percentage=0 cuando no existe la categoría "Otros"', () => {
    const analysis = [
      { category: 'Vivienda', amount: 600, percentage: 60 },
      { category: 'Transporte', amount: 400, percentage: 40 },
    ];
    const result = getCategoryDominance(analysis);
    expect(result.isDominant).toBe(false);
    expect(result.percentage).toBe(0);
  });

  it('devuelve isDominant=false y percentage=0 con un análisis vacío', () => {
    const result = getCategoryDominance([]);
    expect(result.isDominant).toBe(false);
    expect(result.percentage).toBe(0);
  });

  it('respeta un umbral personalizado', () => {
    const analysis = [{ category: 'Otros', amount: 150, percentage: 15 }];
    expect(getCategoryDominance(analysis, 20).isDominant).toBe(false);
    expect(getCategoryDominance(analysis, 10).isDominant).toBe(true);
  });
});
