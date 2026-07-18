// Checkpoint IV-A (Saldo Design Constitution v1.2) — Historial de movimientos.
// Fuente: docs/design/screens/Saldo Historial.dc.html.
//
// Reemplaza a ExpenseList.jsx + BudgetForm.jsx + LegacyPeriodFilters en la
// pestaña "Movimientos". Alcance CERRADO: sin selección múltiple, sin
// sugerencia heurística de categoría, sin editar/eliminar (filas de solo
// lectura, igual que Dashboard hoy), sin estados ilustrados completos.
import { render, screen, fireEvent } from '@testing-library/react';
import { Historial } from './Historial';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'es' } }),
}));

const noop = () => {};

const baseProps = {
  incomes: [],
  expenses: [],
  selectedYear: null,
  selectedMonth: null,
  setSelectedYear: noop,
  setSelectedMonth: noop,
};

describe('Historial — agrupación por día (GrupoDía)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14)); // martes 14 jul 2026
  });
  afterEach(() => vi.useRealTimers());

  const expenses = [
    { id: 'e1', description: 'Farmacia', date: '2026-07-12', category: 'Salud', amount: 38.2 },
    { id: 'e2', description: 'Supermercado', date: '2026-07-14', category: 'Alimentación', amount: 86.5 },
    { id: 'e3', description: 'Café con Marta', date: '2026-07-14', category: 'Entretenimiento', amount: 4.6 },
    { id: 'e4', description: 'Gasolina', date: '2026-07-13', category: 'Transporte', amount: 52.3 },
  ];
  const incomes = [
    { id: 'i1', description: 'Nómina', date: '2026-07-12', amount: 2400 },
  ];

  it('muestra una cabecera "Hoy · martes 14" para los movimientos de hoy', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    expect(screen.getByText('Hoy · martes 14')).toBeInTheDocument();
  });

  it('muestra una cabecera "Ayer · lunes 13" para los movimientos de ayer', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    expect(screen.getByText('Ayer · lunes 13')).toBeInTheDocument();
  });

  it('muestra una cabecera plana "Domingo 12" (sin "Hoy"/"Ayer") para días más viejos', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    expect(screen.getByText('Domingo 12')).toBeInTheDocument();
  });

  it('renderiza todos los movimientos, cada uno una sola vez', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    expect(screen.getByText('Farmacia')).toBeInTheDocument();
    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.getByText('Café con Marta')).toBeInTheDocument();
    expect(screen.getByText('Gasolina')).toBeInTheDocument();
    expect(screen.getByText('Nómina')).toBeInTheDocument();
  });
});

describe('Historial — resumen mensual pegajoso ("Gastado X · Ingresado Y", nunca saldo neto)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14));
  });
  afterEach(() => vi.useRealTimers());

  const expenses = [
    { id: 'e1', description: 'Farmacia', date: '2026-07-12', category: 'Salud', amount: 38.2 },
    { id: 'e2', description: 'Supermercado', date: '2026-07-14', category: 'Alimentación', amount: 86.5 },
  ];
  const incomes = [
    { id: 'i1', description: 'Nómina', date: '2026-07-12', amount: 2400 },
  ];

  it('el resumen coincide con la suma real de lo visible (calculateTotal)', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    // calculateTotal(expenses) = 124.70 · calculateTotal(incomes) = 2400.00
    const summary = screen.getByText(/Gastado/);
    expect(summary.textContent).toMatch(/124\.70/);
    expect(summary.textContent).toMatch(/Ingresado/);
    expect(summary.textContent).toMatch(/2,400\.00|2400\.00/);
  });

  it('el resumen se recalcula sobre lo filtrado (categoría) — Regla Inquebrantable: nunca un saldo neto', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Salud' } });
    const summary = screen.getByText(/Gastado/);
    expect(summary.textContent).toMatch(/38\.20/);
    expect(summary.textContent).not.toMatch(/124\.70/);
    // Nunca debe aparecer la palabra "Saldo" ni "Balance" en este componente.
    expect(screen.queryByText(/Saldo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Balance/i)).not.toBeInTheDocument();
  });
});

describe('Historial — filtros de categoría y tipo, aplican al instante y en combinación', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14));
  });
  afterEach(() => vi.useRealTimers());

  const expenses = [
    { id: 'e1', description: 'Farmacia', date: '2026-07-14', category: 'Salud', amount: 38.2 },
    { id: 'e2', description: 'Supermercado', date: '2026-07-14', category: 'Alimentación', amount: 86.5 },
  ];
  const incomes = [
    { id: 'i1', description: 'Nómina', date: '2026-07-14', amount: 2400 },
  ];

  it('filtro de categoría "Salud" solo muestra los gastos de esa categoría', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Salud' } });
    expect(screen.getByText('Farmacia')).toBeInTheDocument();
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
  });

  it('filtro de tipo "Ingreso" solo muestra ingresos', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    fireEvent.click(screen.getByRole('button', { name: /^ingreso$/i }));
    expect(screen.getByText('Nómina')).toBeInTheDocument();
    expect(screen.queryByText('Farmacia')).not.toBeInTheDocument();
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
  });

  it('filtro de tipo "Gasto" combinado con categoría "Alimentación" solo muestra ese gasto', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    fireEvent.click(screen.getByRole('button', { name: /^gasto$/i }));
    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Alimentación' } });
    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.queryByText('Farmacia')).not.toBeInTheDocument();
    expect(screen.queryByText('Nómina')).not.toBeInTheDocument();
  });
});

describe('Historial — búsqueda por descripción, tolerante y en vivo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14));
  });
  afterEach(() => vi.useRealTimers());

  const expenses = [
    { id: 'e1', description: 'Taxi al aeropuerto', date: '2026-07-14', category: 'Transporte', amount: 20 },
    { id: 'e2', description: 'Supermercado', date: '2026-07-14', category: 'Alimentación', amount: 86.5 },
  ];

  it('filtra por texto parcial, sin distinguir mayúsculas/minúsculas', () => {
    render(<Historial {...baseProps} expenses={expenses} />);
    fireEvent.change(screen.getByPlaceholderText(/buscar/i), { target: { value: 'TAXI' } });
    expect(screen.getByText('Taxi al aeropuerto')).toBeInTheDocument();
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
  });
});

describe('Historial — deep-link de categoría desde Gráficos (initialCategoryFilter)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14));
  });
  afterEach(() => vi.useRealTimers());

  const expenses = [
    { id: 'e1', description: 'Suscripción rara', date: '2026-07-14', category: 'Otros', amount: 15 },
    { id: 'e2', description: 'Renta', date: '2026-07-14', category: 'Vivienda', amount: 500 },
  ];

  it('con initialCategoryFilter="Otros", aterriza con esa categoría ya filtrada', () => {
    render(<Historial {...baseProps} expenses={expenses} initialCategoryFilter="Otros" />);
    expect(screen.getByText('Suscripción rara')).toBeInTheDocument();
    expect(screen.queryByText('Renta')).not.toBeInTheDocument();
  });

  it('consume el filtro inicial una sola vez y llama a onInitialFilterConsumed al montar', () => {
    const onInitialFilterConsumed = vi.fn();
    render(
      <Historial
        {...baseProps}
        expenses={expenses}
        initialCategoryFilter="Otros"
        onInitialFilterConsumed={onInitialFilterConsumed}
      />
    );
    expect(onInitialFilterConsumed).toHaveBeenCalledTimes(1);
  });

  it('sin initialCategoryFilter, NO llama a onInitialFilterConsumed', () => {
    const onInitialFilterConsumed = vi.fn();
    render(<Historial {...baseProps} expenses={expenses} onInitialFilterConsumed={onInitialFilterConsumed} />);
    expect(onInitialFilterConsumed).not.toHaveBeenCalled();
  });
});

describe('Historial — chip de mes (reusa selectedYear/selectedMonth de useFilters, NO estado paralelo)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14));
  });
  afterEach(() => vi.useRealTimers());

  it('sin período seleccionado, no muestra ningún chip de mes', () => {
    render(<Historial {...baseProps} />);
    expect(screen.queryByRole('button', { name: /quitar filtro de período/i })).not.toBeInTheDocument();
  });

  it('con año y mes seleccionados, muestra un chip con el nombre del mes y el año', () => {
    render(<Historial {...baseProps} selectedYear={2026} selectedMonth={6} />);
    expect(screen.getByText(/Julio 2026/i)).toBeInTheDocument();
  });

  it('al pulsar la "✕" del chip, limpia año y mes vía los setters recibidos (no un estado propio)', () => {
    const setSelectedYear = vi.fn();
    const setSelectedMonth = vi.fn();
    render(
      <Historial
        {...baseProps}
        selectedYear={2026}
        selectedMonth={6}
        setSelectedYear={setSelectedYear}
        setSelectedMonth={setSelectedMonth}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /quitar filtro de período/i }));
    expect(setSelectedYear).toHaveBeenCalledWith(null);
    expect(setSelectedMonth).toHaveBeenCalledWith(null);
  });
});

describe('Historial — estado vacío mínimo', () => {
  it('sin movimientos, muestra un placeholder simple de una línea', () => {
    render(<Historial {...baseProps} />);
    expect(screen.getByText(/sin movimientos/i)).toBeInTheDocument();
  });
});
