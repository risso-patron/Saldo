// Test OBJETIVO (Fase 3, task 3.4 — debe quedar en ROJO hasta 3.5).
// BudgetManager MUST calcular el gasto acumulado por categoría usando el
// `dateRange` del período global (PeriodContext), no `new Date()` real
// (spec "BudgetManager respeta el período global" — escenario "Presupuesto
// de categoría en mes no actual").
import { render, screen, fireEvent } from '@testing-library/react';
import { PeriodProvider } from '../../contexts/PeriodContext';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import { BudgetManager } from './BudgetManager';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'es' } }),
}));

// CurrencyProvider hace fetch de tasas al montar — sin red en tests, cae a
// FALLBACK_RATES (EUR: 0.92), que es lo que estos tests asumen como tasa.
beforeEach(() => {
  global.fetch = vi.fn(() => Promise.reject(new Error('sin red en tests')));
});

const selectPeriod = (year, month, currency = 'USD') => {
  localStorage.getItem.mockImplementation((key) => {
    if (key === '@budgetRP_v1:budgetrp_ui_selectedYear') return JSON.stringify(year);
    if (key === '@budgetRP_v1:budgetrp_ui_selectedMonth') return JSON.stringify(month);
    if (key === '@budgetRP_v1:budget_display_currency') return JSON.stringify(currency);
    return null;
  });
};

const renderWithPeriod = (expenses, { year, month, currency }) => {
  selectPeriod(year, month, currency);
  return render(
    <CurrencyProvider>
      <PeriodProvider>
        <BudgetManager expenses={expenses} />
      </PeriodProvider>
    </CurrencyProvider>
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

// Tests OBJETIVO (P0 #3 — deben quedar en ROJO hasta aplicar el fix).
// BudgetManager MUST usar la moneda elegida (CurrencyContext), no USD
// hardcodeado: display convertido, suma normalizada por moneda de cada
// transacción, y límites guardados en USD base (ida y vuelta coherente).
describe('BudgetManager — respeta la moneda elegida por el usuario, no USD hardcodeado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra los gastos convertidos a la moneda elegida (EUR), no etiquetados como USD', () => {
    const expenses = [
      { description: 'Renta', amount: 100, date: '2026-03-05', category: 'Vivienda' }, // USD base
    ];

    renderWithPeriod(expenses, { year: 2026, month: 2, currency: 'EUR' });

    // 100 USD × tasa fallback EUR (0.92) = 92 — monto convertido y símbolo correcto
    expect(screen.getByText(/92/)).toBeInTheDocument();
    expect(screen.getByText(/€|EUR/)).toBeInTheDocument();
    // Nunca el monto sin convertir presentado como si fuera la moneda elegida
    expect(screen.queryByText(/US\$|100[.,]00/)).not.toBeInTheDocument();
  });

  it('normaliza transacciones guardadas en otra moneda antes de sumar (gasto en EUR, display USD)', () => {
    const expenses = [
      { description: 'Hotel', amount: 100, currency: 'EUR', date: '2026-03-05', category: 'Vivienda' },
    ];

    renderWithPeriod(expenses, { year: 2026, month: 2, currency: 'USD' });

    // 100 EUR = 100 / 0.92 ≈ 108.70 USD — no "100" crudo como si ya fuera USD
    expect(screen.getByText(/108[.,]7/)).toBeInTheDocument();
    expect(screen.queryByText(/100[.,]00/)).not.toBeInTheDocument();
  });

  it('al guardar un límite con EUR elegido lo almacena en USD base, y al editarlo lo muestra de vuelta en EUR', () => {
    const expenses = [
      { description: 'Renta', amount: 100, date: '2026-03-05', category: 'Vivienda' },
    ];

    renderWithPeriod(expenses, { year: 2026, month: 2, currency: 'EUR' });

    fireEvent.click(screen.getByText('Fijar límite'));
    fireEvent.change(screen.getByPlaceholderText(/Límite mensual/), { target: { value: '100' } });
    fireEvent.click(screen.getByText('Guardar'));

    // Guardado: 100 EUR → USD base = 100 / 0.92 ≈ 108.70
    const savedCall = localStorage.setItem.mock.calls.find(
      ([key]) => key === '@budgetRP_v1:budget_calculator_budgets'
    );
    expect(savedCall).toBeDefined();
    const saved = JSON.parse(savedCall[1]);
    expect(saved.Vivienda.limit).toBeCloseTo(108.7, 1);

    // Ida y vuelta: al reabrir la edición, el input muestra lo que el usuario escribió (100, en SU moneda)
    fireEvent.click(screen.getByText('Editar'));
    expect(screen.getByPlaceholderText(/Límite mensual/)).toHaveValue(100);
  });
});
