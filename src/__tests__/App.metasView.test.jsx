import { render, screen } from '@testing-library/react';
import App from '../App';
import { DSBottomNav } from '../components/ds/DSBottomNav';

// Fase 2 (tasks.md) — vista `metas` dedicada, fuera de DS_NAV_ITEMS.
// design.md Decisión 1/2: `activeTab === 'metas'` monta GoalManager SOLO,
// sin apilar CreditCardManager/BudgetManager/RecurringManager (H4).
//
// Mocks de infraestructura (Auth/AI/Currency + hooks de red) — mismo patrón
// que src/__tests__/domainUnification.test.jsx y ProfilePage.test.jsx: se
// aísla App.jsx de Supabase/fetch para probar solo la composición JSX por
// `activeTab`, que es lo que cubre esta suite.
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ user: { id: 'user-1' }, loading: false }),
}));

vi.mock('../contexts/AIContext', () => ({
  AIProvider: ({ children }) => children,
  useAI: () => ({ canUseAI: false, hasConsent: false, suggestCategory: vi.fn() }),
}));

vi.mock('../contexts/CurrencyContext', () => ({
  CurrencyProvider: ({ children }) => children,
  useCurrency: () => ({
    convertCurrency: (amount) => amount,
    selectedCurrency: 'USD',
    getSmartDefaultCurrency: () => 'USD',
    currencies: [{ code: 'USD', symbol: '$', name: 'Dólar Americano' }],
  }),
}));

vi.mock('../hooks/useTransactions', () => ({
  useTransactions: () => ({
    incomes: [], expenses: [], alert: null,
    addIncome: vi.fn(), addExpense: vi.fn(), addBulkTransactions: vi.fn(),
    updateIncome: vi.fn(), updateExpense: vi.fn(),
    pendingOperation: null, pendingOperationMessage: '', deleteMovement: vi.fn(),
    confirmPendingOperation: vi.fn(), undoPendingOperation: vi.fn(),
    showAlert: vi.fn(),
    balance: 0, categoryAnalysis: [], clearAll: vi.fn(), refreshTransactions: vi.fn(),
    loading: false, allTransactions: [],
    syncError: null, lastSyncedAt: null,
  }),
}));

// Los 3 managers restantes de `planificacion` se stubean para aislar la
// prueba de su propia carga lazy (import() real, sin dependencias externas).
vi.mock('../components/CreditCard/CreditCardManager', () => ({
  CreditCardManager: () => <div data-testid="credit-card-manager" />,
}));
vi.mock('../features/budgets/BudgetManager', () => ({
  BudgetManager: () => <div data-testid="budget-manager" />,
}));
vi.mock('../features/recurring/RecurringManager', () => ({
  RecurringManager: () => <div data-testid="recurring-manager" />,
}));
vi.mock('../features/goals/GoalManager', () => ({
  GoalManager: () => <div data-testid="goal-manager" />,
}));

const ACTIVE_TAB_KEY = '@budgetRP_v1:budgetrp_ui_activeTab';

// setupTests.js reemplaza `global.localStorage` por un mock (getItem/setItem
// como vi.fn() sin backing real) — setItem no persiste nada, así que sembrar
// el tab activo requiere darle una implementación a getItem directamente
// (mismo objeto que window.localStorage, jsdom === globalThis en este env).
function seedActiveTab(tabId) {
  window.localStorage.getItem.mockImplementation((key) =>
    key === ACTIVE_TAB_KEY ? JSON.stringify(tabId) : null
  );
}

describe('App — vista `metas` dedicada (metas-exposicion, tasks.md Fase 2)', () => {
  beforeEach(() => {
    window.localStorage.getItem.mockReset();
    window.localStorage.getItem.mockReturnValue(null);
    // jsdom no implementa Element.scrollTo — App.jsx lo llama al montar
    // (scroll-to-top por cambio de tab); sin este stub, cualquier render de
    // <App/> lanza y lo atrapa el ErrorBoundary, enmascarando la prueba real.
    window.HTMLElement.prototype.scrollTo = vi.fn();
  });

  it('activeTab="metas" monta GoalManager solo, sin CreditCardManager/BudgetManager/RecurringManager', async () => {
    seedActiveTab('metas');
    render(<App />);

    expect(await screen.findByTestId('goal-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('credit-card-manager')).not.toBeInTheDocument();
    expect(screen.queryByTestId('budget-manager')).not.toBeInTheDocument();
    expect(screen.queryByTestId('recurring-manager')).not.toBeInTheDocument();
  });

  it('activeTab="planificacion" renderiza CreditCardManager/BudgetManager/RecurringManager y NO GoalManager', async () => {
    seedActiveTab('planificacion');
    render(<App />);

    expect(await screen.findByTestId('credit-card-manager')).toBeInTheDocument();
    expect(screen.getByTestId('budget-manager')).toBeInTheDocument();
    expect(screen.getByTestId('recurring-manager')).toBeInTheDocument();
    expect(screen.queryByTestId('goal-manager')).not.toBeInTheDocument();
  });
});

// Fase 5 (tasks.md) — guardia mobile: `metas` NO obtiene una 5.ª columna en
// DSBottomNav (<768px). Guarda de comportamiento ya existente (DSBottomNav
// ya reusa DS_NAV_ITEMS, guardado a su vez por dsNavItems.test.js) — pasa en
// verde sin código nuevo, mismo espíritu que la tarea 1.1.
describe('DSBottomNav — guardia mobile (metas-exposicion, R-08)', () => {
  it('viewport <768px: exactamente 4 columnas, ninguna id="metas"', () => {
    render(<DSBottomNav activeTab="resumen" onTabSelect={vi.fn()} />);

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' });
    const buttons = nav.querySelectorAll('button');

    expect(buttons).toHaveLength(4);
    expect(screen.queryByText('Metas')).not.toBeInTheDocument();
  });
});
