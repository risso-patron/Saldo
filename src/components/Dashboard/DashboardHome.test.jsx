import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardHome } from './DashboardHome';
import { CurrencyProvider } from '../../contexts/CurrencyContext';

// Fase II — Integración del Dashboard (Saldo Design Constitution v1.2).
// Fuente: docs/design/screens/Saldo Dashboard.dc.html.
// DashboardHome es una capa de composición (restricción del PO): obtiene
// datos por props, llama helpers de src/utils/dashboardCalculations.js y
// src/utils/calculations.js, renderiza componentes. Sin lógica de negocio
// propia — estos tests validan el ensamblado, no recalculan lógica que ya
// está cubierta en dashboardCalculations.test.js.

// RC-1.5: formatCurrency ahora importa src/i18n/index.js (getFormatLocale),
// que registra initReactI18next en el singleton real — debe conservarse al
// mockear este módulo, o la inicialización de i18n lanza en import.
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal()),
  useTranslation: () => ({ i18n: { language: 'es' } }),
}));

describe('DashboardHome — estado Cargando', () => {
  it('renderiza el skeleton y NO la cifra protagonista ni los movimientos', () => {
    render(
      <DashboardHome
        incomes={[]}
        expenses={[]}
        allTransactions={[]}
        loading
        onRegisterExpense={vi.fn()}
        onViewAllTransactions={vi.fn()}
      />
    );
    expect(screen.getByTestId('dashboard-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Saldo disponible')).not.toBeInTheDocument();
    expect(screen.queryByText('Movimientos recientes')).not.toBeInTheDocument();
  });

  it('el skeleton no usa animate-pulse (prohibido por la Constitución)', () => {
    const { container } = render(
      <DashboardHome
        incomes={[]}
        expenses={[]}
        allTransactions={[]}
        loading
        onRegisterExpense={vi.fn()}
        onViewAllTransactions={vi.fn()}
      />
    );
    expect(container.innerHTML).not.toMatch(/animate-pulse/);
  });
});

describe('DashboardHome — estado Vacío (sin transacciones)', () => {
  it('muestra overline, párrafo explicativo y los botones "Registrar un gasto" / "Registrar un ingreso"', () => {
    render(
      <DashboardHome
        incomes={[]}
        expenses={[]}
        allTransactions={[]}
        loading={false}
        onRegisterExpense={vi.fn()}
        onRegisterIncome={vi.fn()}
        onViewAllTransactions={vi.fn()}
      />
    );
    expect(screen.getByText('Saldo disponible')).toBeInTheDocument();
    expect(
      screen.getByText('Aquí verás tu saldo en cuanto conectes una cuenta o registres tu primer gasto.')
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Registrar un gasto' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar un ingreso' })).toBeInTheDocument();
    expect(screen.queryByText(/Conectar mi banco/i)).not.toBeInTheDocument();
  });

  // Task 3.1 (tasks.md) — D-2 del Discovery, corregido: ingreso y gasto con
  // el mismo peso, mismo Button variant="primary" (proposal, In Scope).
  it('el CTA de ingreso tiene el mismo className (mismo variant) que el de gasto', () => {
    render(
      <DashboardHome
        incomes={[]}
        expenses={[]}
        allTransactions={[]}
        loading={false}
        onRegisterExpense={vi.fn()}
        onRegisterIncome={vi.fn()}
        onViewAllTransactions={vi.fn()}
      />
    );
    const expenseButton = screen.getByRole('button', { name: 'Registrar un gasto' });
    const incomeButton = screen.getByRole('button', { name: 'Registrar un ingreso' });
    expect(incomeButton.className).toBe(expenseButton.className);
  });

  it('muestra la sección "Movimientos recientes" en gris con su caption', () => {
    render(
      <DashboardHome
        incomes={[]}
        expenses={[]}
        allTransactions={[]}
        loading={false}
        onRegisterExpense={vi.fn()}
        onRegisterIncome={vi.fn()}
        onViewAllTransactions={vi.fn()}
      />
    );
    expect(screen.getByText('Movimientos recientes').className).toMatch(/text-ds-text-disabled\b/);
    expect(screen.getByText('Aquí aparecerán tus movimientos.')).toBeInTheDocument();
  });

  it('"Registrar un gasto" dispara onRegisterExpense', async () => {
    const user = userEvent.setup();
    const onRegisterExpense = vi.fn();
    render(
      <DashboardHome
        incomes={[]}
        expenses={[]}
        allTransactions={[]}
        loading={false}
        onRegisterExpense={onRegisterExpense}
        onRegisterIncome={vi.fn()}
        onViewAllTransactions={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Registrar un gasto' }));
    expect(onRegisterExpense).toHaveBeenCalledTimes(1);
  });

  it('"Registrar un ingreso" dispara onRegisterIncome', async () => {
    const user = userEvent.setup();
    const onRegisterIncome = vi.fn();
    render(
      <DashboardHome
        incomes={[]}
        expenses={[]}
        allTransactions={[]}
        loading={false}
        onRegisterExpense={vi.fn()}
        onRegisterIncome={onRegisterIncome}
        onViewAllTransactions={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Registrar un ingreso' }));
    expect(onRegisterIncome).toHaveBeenCalledTimes(1);
  });
});

describe('DashboardHome — caso general (con datos)', () => {
  // WRITE-DISPLAY-CURRENCY-001: DashboardContent ahora usa useCurrency()
  // (solo para "Saldo disponible") — requiere CurrencyProvider en el árbol.
  // CurrencyProvider hace fetch de tasas al montar — sin red en tests, cae a
  // FALLBACK_RATES (mismo patrón que Omnibar.test.jsx/BudgetManager.test.jsx).
  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.reject(new Error('sin red en tests')));
  });

  // Fake timers SOLO en los tests que lo necesitan (no en beforeEach global):
  // userEvent v14 usa setTimeout real internamente y se cuelga con fake
  // timers activos sin avanzarlos — mismo hallazgo documentado en
  // DSTopBar.test.jsx.
  const withFixedToday = (fn) => async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 17)); // 17 jul 2026
    try {
      await fn();
    } finally {
      vi.useRealTimers();
    }
  };

  const incomes = [
    { id: 'i1', description: 'Sueldo', amount: 2000, date: '2026-07-01', type: 'income' },
  ];
  const expenses = [
    { id: 'e1', description: 'Renta', amount: 500, date: '2026-07-05', type: 'expense' },
    { id: 'e2', description: 'Super', amount: 200, date: '2026-06-10', type: 'expense' },
    { id: 'e3', description: 'Super2', amount: 100, date: '2026-05-10', type: 'expense' },
  ];
  const allTransactions = [
    ...incomes.map((t) => ({ ...t, type: 'income' })),
    ...expenses.map((t) => ({ ...t, type: 'expense' })),
  ];

  it('la cifra protagonista muestra el balance correcto (ingresos - gastos, todo el historial)', withFixedToday(() => {
    render(
      <CurrencyProvider>
        <DashboardHome
          incomes={incomes}
          expenses={expenses}
          balance={1200}
          allTransactions={allTransactions}
          loading={false}
          onRegisterExpense={vi.fn()}
          onViewAllTransactions={vi.fn()}
        />
      </CurrencyProvider>
    );
    // balance = 2000 - (500+200+100) = 1200 (ahora recibido normalizado por prop, no recalculado)
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('.00 USD')).toBeInTheDocument();
  }));

  it('la región de IA no renderiza ningún nodo (estado constitucional "Sin IA")', withFixedToday(() => {
    render(
      <CurrencyProvider>
        <DashboardHome
          incomes={incomes}
          expenses={expenses}
          balance={1200}
          allTransactions={allTransactions}
          loading={false}
          onRegisterExpense={vi.fn()}
          onViewAllTransactions={vi.fn()}
        />
      </CurrencyProvider>
    );
    expect(screen.queryByText(/insight/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/inteligencia artificial/i)).not.toBeInTheDocument();
    expect(document.querySelector('[data-ai-insight]')).not.toBeInTheDocument();
  }));

  it('"Ver todos los movimientos" dispara onViewAllTransactions', async () => {
    const user = userEvent.setup();
    const onViewAllTransactions = vi.fn();
    render(
      <CurrencyProvider>
        <DashboardHome
          incomes={incomes}
          expenses={expenses}
          balance={1200}
          allTransactions={allTransactions}
          loading={false}
          onRegisterExpense={vi.fn()}
          onViewAllTransactions={onViewAllTransactions}
        />
      </CurrencyProvider>
    );
    await user.click(screen.getByRole('button', { name: 'Ver todos los movimientos' }));
    expect(onViewAllTransactions).toHaveBeenCalledTimes(1);
  });

  it('renderiza las filas de "Movimientos recientes" (helper 1c, límite 5)', withFixedToday(() => {
    render(
      <CurrencyProvider>
        <DashboardHome
          incomes={incomes}
          expenses={expenses}
          balance={1200}
          allTransactions={allTransactions}
          loading={false}
          onRegisterExpense={vi.fn()}
          onViewAllTransactions={vi.fn()}
        />
      </CurrencyProvider>
    );
    expect(screen.getByText('Renta')).toBeInTheDocument();
    expect(screen.getByText('Super')).toBeInTheDocument();
    expect(screen.getByText('Sueldo')).toBeInTheDocument();
  }));

  it('con diff null del helper 1a (sin historial), NO muestra la caption de comparación', withFixedToday(() => {
    const onlyCurrentMonthExpenses = [
      { id: 'e1', description: 'Renta', amount: 500, date: '2026-07-05', type: 'expense' },
    ];
    render(
      <CurrencyProvider>
        <DashboardHome
          incomes={incomes}
          expenses={onlyCurrentMonthExpenses}
          balance={1500}
          allTransactions={[...incomes, ...onlyCurrentMonthExpenses]}
          loading={false}
          onRegisterExpense={vi.fn()}
          onViewAllTransactions={vi.fn()}
        />
      </CurrencyProvider>
    );
    expect(screen.queryByText(/más que tu media/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/menos que tu media/i)).not.toBeInTheDocument();
  }));

  it('con historial, muestra la caption de comparación con el signo adaptado', withFixedToday(() => {
    render(
      <CurrencyProvider>
        <DashboardHome
          incomes={incomes}
          expenses={expenses}
          balance={1200}
          allTransactions={allTransactions}
          loading={false}
          onRegisterExpense={vi.fn()}
          onViewAllTransactions={vi.fn()}
        />
      </CurrencyProvider>
    );
    // currentAmount (hasta día 17 de julio) = 500; histórico jun=200, may=100 -> media=150.
    // diff = 150 - 500 = -350 -> "más que tu media"
    expect(screen.getByText(/más que tu media a estas alturas del mes/)).toBeInTheDocument();
  }));

  it('el mini-gráfico renderiza 6 barras: 5 en gris (bg-ds-border) y 1 en acento (bg-ds-accent, el mes actual)', withFixedToday(() => {
    const { container } = render(
      <CurrencyProvider>
        <DashboardHome
          incomes={incomes}
          expenses={expenses}
          balance={1200}
          allTransactions={allTransactions}
          loading={false}
          onRegisterExpense={vi.fn()}
          onViewAllTransactions={vi.fn()}
        />
      </CurrencyProvider>
    );
    const accentBars = Array.from(container.querySelectorAll('div')).filter((el) => el.classList.contains('bg-ds-accent'));
    const grayBars = Array.from(container.querySelectorAll('div')).filter((el) => el.classList.contains('bg-ds-border'));
    expect(accentBars).toHaveLength(1);
    expect(grayBars).toHaveLength(5);
  }));
});
