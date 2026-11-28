/* global describe, beforeEach, it, expect, vi */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

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

let mockTransactionsState;

function makeTransactionsState() {
  const incomes = [
    { id: 'income-batch', type: 'income', description: 'Ingreso importado', amount: 500, date: '2026-08-23', importBatchId: 'batch-1' },
    { id: 'income-manual', type: 'income', description: 'Ingreso manual', amount: 100, date: '2026-08-23' },
  ];
  const expenses = [
    { id: 'expense-batch', type: 'expense', description: 'Gasto importado', amount: 25, date: '2026-08-23', importBatchId: 'batch-1' },
    { id: 'expense-other', type: 'expense', description: 'Gasto otro batch', amount: 10, date: '2026-08-23', importBatchId: 'batch-2' },
  ];

  return {
    incomes,
    expenses,
    alert: null,
    addIncome: vi.fn(),
    addExpense: vi.fn(),
    addBulkTransactions: vi.fn(),
    updateIncome: vi.fn(),
    updateExpense: vi.fn(),
    pendingOperation: null,
    pendingOperationMessage: '',
    deleteMovement: vi.fn(),
    confirmPendingOperation: vi.fn(),
    undoPendingOperation: vi.fn(),
    showAlert: vi.fn(),
    balance: 565,
    categoryAnalysis: [],
    clearAll: vi.fn(),
    refreshTransactions: vi.fn(),
    loading: false,
    allTransactions: [...incomes, ...expenses],
    syncError: null,
    lastSyncedAt: null,
  };
}

vi.mock('../hooks/useTransactions', () => ({
  useTransactions: () => mockTransactionsState,
}));

vi.mock('../features/export/ExportManager', () => ({
  ExportManager: () => <div data-testid="export-manager" />,
}));

vi.mock('../features/import/ImportManager', () => ({
  default: ({ onViewImportBatch }) => (
    <button
      type="button"
      onClick={() => onViewImportBatch({ id: 'batch-1', originalFilename: 'extracto.csv', source: 'csv_import' })}
    >
      Ver movimientos
    </button>
  ),
}));

vi.mock('../components/Historial/Historial', () => ({
  Historial: ({ incomes, expenses }) => (
    <section data-testid="historial">
      {[...incomes, ...expenses].map((movement) => (
        <p key={movement.id}>{movement.description}</p>
      ))}
    </section>
  ),
}));

const ACTIVE_TAB_KEY = '@budgetRP_v1:budgetrp_ui_activeTab';

function seedActiveTab(tabId) {
  window.localStorage.getItem.mockImplementation((key) => (
    key === ACTIVE_TAB_KEY ? JSON.stringify(tabId) : null
  ));
}

describe('App — IMP-002B import batch visibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTransactionsState = makeTransactionsState();
    window.localStorage.getItem.mockReset();
    window.localStorage.getItem.mockReturnValue(null);
    window.HTMLElement.prototype.scrollTo = vi.fn();
  });

  it('applies and clears a local importBatchId filter from the import CTA without changing source data', async () => {
    seedActiveTab('herramientas');
    render(<App />);
    const user = userEvent.setup();

    await user.click(await screen.findByRole('button', { name: /ver movimientos/i }));

    expect(await screen.findByTestId('historial')).toBeInTheDocument();
    expect(screen.getByText('Importación: extracto.csv')).toBeInTheDocument();
    expect(screen.getByText('Ingreso importado')).toBeInTheDocument();
    expect(screen.getByText('Gasto importado')).toBeInTheDocument();
    expect(screen.queryByText('Ingreso manual')).not.toBeInTheDocument();
    expect(screen.queryByText('Gasto otro batch')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /quitar filtro de importación/i }));

    await waitFor(() => {
      expect(screen.queryByText('Importación: extracto.csv')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Ingreso manual')).toBeInTheDocument();
    expect(screen.getByText('Gasto otro batch')).toBeInTheDocument();
  });
});
