import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Fase 4 (tasks.md 4.1-4.5) — onboarding-flow, integración completa sobre
// <App/> real (mismo patrón de mocks de infraestructura que
// App.metasView.test.jsx: se aísla Auth/AI/Currency/useTransactions de
// Supabase/fetch para probar solo el wiring de onboarding-flow, que es lo
// que cubre esta suite). NewMovementSheet, Sheet, OnboardingStepA y
// useOnboardingFlow corren SIN mockear — es la única forma de probar el
// contrato real "única instancia de overlay" (design.md V3/Decisión 2).

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

// Nombres con prefijo "mock" — requisito de Vitest para referenciar
// variables de módulo dentro de un factory de vi.mock (hoisting).
const mockAddIncome = vi.fn();
const mockAddExpense = vi.fn();
let mockTransactionsState;

function makeTransactionsState(overrides = {}) {
  return {
    incomes: [], expenses: [], alert: null,
    addIncome: mockAddIncome, addExpense: mockAddExpense, addBulkTransactions: vi.fn(),
    updateIncome: vi.fn(), updateExpense: vi.fn(),
    pendingOperation: null, pendingOperationMessage: '', deleteMovement: vi.fn(),
    confirmPendingOperation: vi.fn(), undoPendingOperation: vi.fn(),
    showAlert: vi.fn(),
    balance: 0, categoryAnalysis: [], clearAll: vi.fn(), refreshTransactions: vi.fn(),
    loading: false, allTransactions: [],
    syncError: null, lastSyncedAt: null,
    ...overrides,
  };
}

vi.mock('../hooks/useTransactions', () => ({
  useTransactions: () => mockTransactionsState,
}));

const STORAGE_PREFIX = '@budgetRP_v1:';
const ONBOARDING_KEY = `${STORAGE_PREFIX}budgetrp_onboarding_user-1`;

// Precarga el estado de onboarding persistido — mismo patrón que seedActiveTab
// en App.metasView.test.jsx.
function seedOnboardingState(state) {
  window.localStorage.getItem.mockImplementation((key) =>
    key === ONBOARDING_KEY
      ? JSON.stringify({ v: 1, startedAt: 1, completedAt: null, ...state })
      : null
  );
}

describe('App — onboarding-flow (tasks.md Fase 4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAddIncome.mockReturnValue({ success: true, movement: { id: 'm-income', type: 'income' } });
    mockAddExpense.mockReturnValue({ success: true, movement: { id: 'm-expense', type: 'expense' } });
    mockTransactionsState = makeTransactionsState();
    window.localStorage.getItem.mockReset();
    window.localStorage.getItem.mockReturnValue(null);
    // jsdom no implementa Element.scrollTo — App.jsx lo llama al montar.
    window.HTMLElement.prototype.scrollTo = vi.fn();
  });

  // Task 4.1
  it('sin movimientos ve el Paso A al montar; "Saltear" abre la única instancia de NewMovementSheet', async () => {
    render(<App />);

    expect(await screen.findByRole('button', { name: 'Saltear' })).toBeInTheDocument();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Saltear' }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Saltear' })).not.toBeInTheDocument();
    });
    // Única instancia de overlay (V3/Decisión 2): el Paso A cerró, se abrió
    // el NewMovementSheet ya existente — nunca dos diálogos a la vez.
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Añadir' })).toBeInTheDocument();
  });

  // Task 4.2
  it('guardar un movimiento en Paso B completa el onboarding y muestra el Dashboard, sin pantalla intermedia', async () => {
    seedOnboardingState({ status: 'pending', step: 'B' });
    render(<App />);
    const user = userEvent.setup();

    const amountInput = await screen.findByRole('textbox', { name: 'Importe' });
    await user.type(amountInput, '100');
    await user.type(screen.getByLabelText('Concepto'), 'Compra de prueba');
    await user.click(screen.getByRole('button', { name: 'Añadir' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mockAddExpense).toHaveBeenCalledTimes(1);
    // Paso C = Dashboard tal cual, sin pantalla de "listo" intermedia
    // (spec, Requirement Finalización).
    expect(screen.getByText('Saldo disponible')).toBeInTheDocument();
    expect(screen.queryByText(/felicitaciones|listo|¡bien hecho!/i)).not.toBeInTheDocument();

    // Estado persistido queda 'completed' (Idempotencia).
    const onboardingCalls = window.localStorage.setItem.mock.calls.filter(([key]) => key === ONBOARDING_KEY);
    const lastPersisted = JSON.parse(onboardingCalls[onboardingCalls.length - 1][1]);
    expect(lastPersisted.status).toBe('completed');
  });

  // Task 4.3
  it('cerrar el sheet en Paso B (Escape) no completa el flujo; remontar reabre directo en B', async () => {
    seedOnboardingState({ status: 'pending', step: 'B' });
    const { unmount } = render(<App />);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // El Escape lo maneja Sheet.jsx con un listener en `document` (no en
    // `window`) — dispatchar en `document` bubblea también hasta `window`,
    // así que sirve para los 3 casos de este archivo (Escape, ⌘K, "N").
    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(mockAddExpense).not.toHaveBeenCalled();
    expect(mockAddIncome).not.toHaveBeenCalled();

    unmount();
    render(<App />);

    // El estado persistido sigue en pending/B (cerrar no lo mutó) — el
    // remontaje reabre directo el sheet, sin volver a mostrar el Paso A.
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Saltear' })).not.toBeInTheDocument();
  });

  // Task 4.4
  it('con onboarding activo (Paso A), ⌘K y "N" no abren otros overlays (isAnyOverlayOpen)', async () => {
    render(<App />);
    await screen.findByRole('button', { name: 'Saltear' });
    expect(screen.getAllByRole('dialog')).toHaveLength(1);

    fireEvent.keyDown(document, { key: 'k', metaKey: true });
    expect(screen.queryByPlaceholderText('Busca transacciones o navega...')).not.toBeInTheDocument();
    expect(screen.getAllByRole('dialog')).toHaveLength(1);

    fireEvent.keyDown(document, { key: 'n' });
    // Sigue habiendo un único diálogo (el del Paso A) — "N" no abrió un
    // segundo NewMovementSheet por encima.
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Saltear' })).toBeInTheDocument();
  });

  // Task 4.5
  it('mobile: el Paso A se ancla abajo por defecto (Sheet sin desktopBreakpoint forzado)', async () => {
    render(<App />);

    const dialog = await screen.findByRole('dialog');
    expect(dialog.className).toMatch(/\bbottom-0\b/);
    expect(dialog.className).toMatch(/rounded-t-ds-modal\b/);
  });
});
