// Test OBJETIVO (Fase 3, task 3.4 — debe quedar en ROJO hasta 3.5).
// BudgetManager MUST calcular el gasto acumulado por categoría usando el
// `dateRange` del período global (PeriodContext), no `new Date()` real
// (spec "BudgetManager respeta el período global" — escenario "Presupuesto
// de categoría en mes no actual").
import { render, screen } from '@testing-library/react';
import { PeriodProvider } from '../../contexts/PeriodContext';
import { BudgetManager } from './BudgetManager';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'es' } }),
}));

const selectPeriod = (year, month) => {
  localStorage.getItem.mockImplementation((key) => {
    if (key === '@budgetRP_v1:budgetrp_ui_selectedYear') return JSON.stringify(year);
    if (key === '@budgetRP_v1:budgetrp_ui_selectedMonth') return JSON.stringify(month);
    return null;
  });
};

const renderWithPeriod = (expenses, { year, month }) => {
  selectPeriod(year, month);
  return render(
    <PeriodProvider>
      <BudgetManager expenses={expenses} />
    </PeriodProvider>
  );
};

describe('BudgetManager — respeta el período global elegido, no el mes calendario real', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el gasto acumulado de Marzo 2026 (período elegido) e ignora el gasto de Julio 2026 (mes calendario real)', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-08T12:00:00')); // "hoy" real es Julio

    const expenses = [
      { description: 'Renta Marzo', amount: 500, date: '2026-03-05', category: 'Vivienda' },
      { description: 'Super Julio', amount: 999, date: '2026-07-05', category: 'Alimentación' },
    ];

    renderWithPeriod(expenses, { year: 2026, month: 2 }); // Marzo elegido por el usuario

    expect(screen.getByText('Vivienda')).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
    // "Alimentación" existe como botón para FIJAR un límite nuevo (categoría sin
    // gasto en el período), no como categoría activa con gasto acumulado — por
    // eso el chequeo real es que NUNCA aparece asociada a su monto (999).
    expect(screen.queryByText(/999/)).not.toBeInTheDocument();
    // Confirma que "Alimentación" solo aparece en el selector "Fijar límite para
    // otra categoría" (un botón), no como card de categoría activa con gasto.
    const alimentacionButton = screen.getByText('Alimentación').closest('button');
    expect(alimentacionButton).toHaveTextContent('Alimentación');
    expect(alimentacionButton).not.toHaveTextContent(/999|gastado/);

    vi.useRealTimers();
  });

  it('con type="all" (sin período elegido) muestra el gasto acumulado de TODAS las transacciones, sin filtrar por mes', () => {
    const expenses = [
      { description: 'Renta Marzo', amount: 500, date: '2026-03-05', category: 'Vivienda' },
      { description: 'Super Julio', amount: 999, date: '2026-07-05', category: 'Alimentación' },
    ];

    renderWithPeriod(expenses, { year: null, month: null }); // sin período elegido -> type='all'

    expect(screen.getByText('Vivienda')).toBeInTheDocument();
    expect(screen.getByText('Alimentación')).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
    expect(screen.getByText(/999/)).toBeInTheDocument();
  });

  it('el encabezado muestra el nombre del período elegido (Marzo), no el mes calendario real (Julio) — consistente con los montos', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-08T12:00:00')); // "hoy" real es Julio

    const expenses = [
      { description: 'Renta Marzo', amount: 500, date: '2026-03-05', category: 'Vivienda' },
    ];

    renderWithPeriod(expenses, { year: 2026, month: 2 }); // Marzo elegido por el usuario

    expect(screen.getByText(/marzo/i)).toBeInTheDocument();
    expect(screen.queryByText(/julio/i)).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
