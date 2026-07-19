import { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { useTransactions } from '../hooks/useTransactions';
import { DashboardHome } from '../components/Dashboard/DashboardHome';
import { Historial } from '../components/Historial/Historial';
import { NewMovementSheet } from '../components/NewMovement/NewMovementSheet';

// Checkpoint IV-B (Saldo Design Constitution v1.2) — prueba de unificación
// REAL del dominio "Movimiento" (pedido explícito del PO, no opcional).
//
// Monta DashboardHome e Historial compartiendo la MISMA instancia de
// useTransactions() (una sola fuente de verdad, sin estado duplicado) y
// edita un movimiento a través del flujo real de Historial (clic en fila →
// Editar → cambiar un campo → Guardar, sobre la ÚNICA instancia de
// NewMovementSheet — nunca una segunda hoja). Verifica que DashboardHome
// refleja el cambio de inmediato, sin refresh manual ni remount forzado.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'es' } }),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    convertCurrency: (amount) => amount,
    selectedCurrency: 'USD',
    getSmartDefaultCurrency: () => 'USD',
    currencies: [
      { code: 'USD', symbol: '$', name: 'Dólar Americano' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
    ],
  }),
}));

vi.mock('../contexts/AIContext', () => ({
  useAI: () => ({ canUseAI: false, hasConsent: false, suggestCategory: vi.fn() }),
}));

vi.mock('../lib/supabase', () => ({
  supabase: { from: vi.fn() },
}));

// Arnés mínimo: UNA sola llamada a useTransactions(), compartida por
// DashboardHome e Historial (mismo patrón que Dashboard*.test.jsx/
// Historial.test.jsx montan sus datos, pero acá con la fuente de verdad real
// del hook en vez de props fijas). El botón "Sembrar" es infraestructura de
// test (equivalente a lo que haría NewMovementSheet en modo creación) — el
// flujo bajo prueba es la EDICIÓN, no la creación.
function DomainHarness() {
  const {
    incomes, expenses, allTransactions, loading,
    addIncome, addExpense, updateIncome, updateExpense,
  } = useTransactions();
  const [editingMovement, setEditingMovement] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  return (
    <div>
      <button type="button" onClick={() => addExpense('Supermercado', 'Alimentación', 50, '2026-07-10', 'USD')}>
        Sembrar
      </button>

      <div data-testid="dashboard-section">
        <DashboardHome
          incomes={incomes}
          expenses={expenses}
          allTransactions={allTransactions}
          loading={loading}
          onRegisterExpense={() => {}}
          onViewAllTransactions={() => {}}
        />
      </div>

      <div data-testid="historial-section">
        <Historial
          incomes={incomes}
          expenses={expenses}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          setSelectedYear={setSelectedYear}
          setSelectedMonth={setSelectedMonth}
          onEditMovement={setEditingMovement}
        />
      </div>

      {/* Única instancia de NewMovementSheet, igual que App.jsx — reusada
          para editar (nunca una segunda hoja montada en Historial). `key`
          fuerza un remontaje real al entrar a edición (mismo mecanismo que
          App.jsx): el componente queda SIEMPRE montado y su semilla de
          estado (useState initializers) solo se ejecuta una vez por
          montaje, así que sin este `key` no reflejaría el `movement` de una
          edición posterior a la primera. */}
      <NewMovementSheet
        key={editingMovement != null ? `edit-${editingMovement.id}` : 'create'}
        isOpen={editingMovement != null}
        onClose={() => setEditingMovement(null)}
        onAddIncome={addIncome}
        onAddExpense={addExpense}
        onUpdateIncome={updateIncome}
        onUpdateExpense={updateExpense}
        movement={editingMovement}
      />
    </div>
  );
}

describe('Checkpoint IV-B — unificación real del dominio Movimiento (Dashboard + Historial, un solo useTransactions())', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 17)); // 17 jul 2026
  });
  afterEach(() => vi.useRealTimers());

  it('editar un movimiento desde el flujo de Historial (fila → Editar → cambiar campo → Guardar) se refleja de inmediato en DashboardHome, sin remount ni refresh manual', () => {
    render(<DomainHarness />);

    // Sembrado del movimiento vía la MISMA instancia del hook.
    fireEvent.click(screen.getByRole('button', { name: 'Sembrar' }));

    const dashboardSection = screen.getByTestId('dashboard-section');
    const historialSection = screen.getByTestId('historial-section');

    // Aparece en ambas pantallas, ya con la fuente de verdad compartida.
    expect(within(dashboardSection).getByText('Supermercado')).toBeInTheDocument();
    expect(within(historialSection).getByText('Supermercado')).toBeInTheDocument();

    // Flujo real de edición: clic en la fila -> expande -> Editar.
    fireEvent.click(within(historialSection).getByRole('button', { name: /Supermercado/ }));
    fireEvent.click(within(historialSection).getByRole('button', { name: /editar/i }));

    // La ÚNICA hoja (fuera de ambas secciones) se abre en modo edición.
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/concepto/i), { target: { value: 'Supermercado actualizado' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    // Sin refresh manual, sin remount forzado: misma instancia de
    // DashboardHome ya montada refleja el cambio inmediatamente.
    expect(within(dashboardSection).getByText('Supermercado actualizado')).toBeInTheDocument();
    expect(within(dashboardSection).queryByText('Supermercado')).not.toBeInTheDocument();

    // Historial (la misma fuente de datos) también lo refleja — prueba de
    // que no hay estado duplicado entre las dos pantallas.
    expect(within(historialSection).getByText('Supermercado actualizado')).toBeInTheDocument();

    // La hoja se cerró tras Guardar (autoridad única de overlay).
    expect(screen.queryByRole('button', { name: 'Guardar' })).not.toBeInTheDocument();
  });
});
