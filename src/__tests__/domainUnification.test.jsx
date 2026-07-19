import { useState } from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { useTransactions } from '../hooks/useTransactions';
import { DashboardHome } from '../components/Dashboard/DashboardHome';
import { Historial } from '../components/Historial/Historial';
import { NewMovementSheet } from '../components/NewMovement/NewMovementSheet';
import { Toast } from '../components/ds/Toast';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Checkpoint IV-B (Saldo Design Constitution v1.2) — prueba de unificación
// REAL del dominio "Movimiento" (pedido explícito del PO, no opcional).
//
// Monta DashboardHome e Historial compartiendo la MISMA instancia de
// useTransactions() (una sola fuente de verdad, sin estado duplicado) y
// edita un movimiento a través del flujo real de Historial (clic en fila →
// Editar → cambiar un campo → Guardar, sobre la ÚNICA instancia de
// NewMovementSheet — nunca una segunda hoja). Verifica que DashboardHome
// refleja el cambio de inmediato, sin refresh manual ni remount forzado.
//
// Checkpoint IV-C — extiende el mismo arnés para probar la operación
// reversible única (pendingOperation, useTransactions.js): crear un
// movimiento deja una operación "Deshacer" viva; eliminar otro ANTES de que
// expire reemplaza esa operación por la baja (nunca dos viven a la vez);
// Supabase solo recibe la escritura definitiva de la baja cuando el Toast
// expira de verdad (fake timers, mismo mecanismo que Toast.jsx usa en
// producción) — nunca en el momento del clic.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'es' } }),
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({ user: null })),
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

// Chain mínima de supabase-js — ver la misma utilidad en
// useTransactions.test.js. Se duplica acá (archivo de integración distinto,
// ~10 líneas) en vez de extraerla a un helper compartido: dos consumidores
// no justifican una abstracción nueva.
function makeSupabaseChain(result = { data: [], error: null }) {
  const chain = {};
  ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'in', 'order'].forEach((method) => {
    chain[method] = vi.fn(() => chain);
  });
  chain.then = (resolve) => resolve(result);
  return chain;
}

// Arnés mínimo: UNA sola llamada a useTransactions(), compartida por
// DashboardHome e Historial (mismo patrón que Dashboard*.test.jsx/
// Historial.test.jsx montan sus datos, pero acá con la fuente de verdad real
// del hook en vez de props fijas). El botón "Sembrar" es infraestructura de
// test (equivalente a lo que haría NewMovementSheet en modo creación) — el
// flujo bajo prueba en IV-B es la EDICIÓN, no la creación.
//
// Checkpoint IV-C: "Sembrar" sigue creando SIN tocar pendingOperation
// (notification por defecto 'legacy', igual que antes — infraestructura de
// datos, no la operación bajo prueba). "Crear con Toast" replica el punto de
// entrada real de NewMovementSheet (handleCreateExpense en App.jsx:
// addExpense con notification:'toast') para poder probar la operación
// reversible de creación sin depender de manejar el formulario completo de
// NewMovementSheet (ya cubierto exhaustivamente en NewMovementSheet.test.jsx).
function DomainHarness() {
  const {
    incomes, expenses, allTransactions, loading,
    addIncome, addExpense, updateIncome, updateExpense,
    pendingOperation, deleteMovement, confirmPendingOperation, undoPendingOperation,
  } = useTransactions();
  const [editingMovement, setEditingMovement] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);

  return (
    <div>
      <button type="button" onClick={() => addExpense('Supermercado', 'Alimentación', 50, '2026-07-10', 'USD')}>
        Sembrar
      </button>
      <button
        type="button"
        onClick={() => addExpense('Cafetería', 'Alimentación', 15, '2026-07-12', 'USD', { notification: 'toast' })}
      >
        Crear con Toast
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
          onDeleteMovement={deleteMovement}
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

      {/* Checkpoint IV-C — mismo cableado que App.jsx: un único <Toast>
          dirigido enteramente por pendingOperation, sin lógica de negocio
          en este nivel. */}
      <Toast
        isOpen={pendingOperation !== null}
        message={pendingOperation?.kind === 'delete' ? 'Movimiento eliminado' : 'Movimiento añadido'}
        actionLabel="Deshacer"
        onAction={undoPendingOperation}
        onDismiss={confirmPendingOperation}
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

describe('Checkpoint IV-C — operación reversible única, en vivo sobre Dashboard + Historial', () => {
  let chain;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 17)); // 17 jul 2026
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'user-1' } });
    chain = makeSupabaseChain();
    supabase.from.mockReturnValue(chain);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(useAuth).mockReturnValue({ user: null });
    supabase.from.mockReset();
  });

  it('crear deja el Deshacer vivo; eliminar otro movimiento ANTES de que expire reemplaza esa operación por la baja — nunca dos a la vez, Dashboard e Historial permanecen sincronizados, y Supabase solo recibe la baja cuando el Toast expira de verdad', async () => {
    render(<DomainHarness />);
    // Deja resolver la carga inicial desde Supabase (user verdadero) antes
    // de sembrar — mismo motivo que useTransactions.test.js.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    const dashboardSection = screen.getByTestId('dashboard-section');
    const historialSection = screen.getByTestId('historial-section');

    // Movimiento B, preexistente (infraestructura, sin tocar pendingOperation).
    fireEvent.click(screen.getByRole('button', { name: 'Sembrar' }));
    chain.insert.mockClear();

    // 1) Crear movimiento A vía el mismo punto de entrada que
    //    handleCreateExpense en App.jsx (notification:'toast') — Deshacer
    //    disponible.
    fireEvent.click(screen.getByRole('button', { name: 'Crear con Toast' }));

    expect(screen.getByTestId('toast')).toHaveTextContent('Movimiento añadido');
    expect(within(dashboardSection).getByText('Cafetería')).toBeInTheDocument();
    expect(within(historialSection).getByText('Cafetería')).toBeInTheDocument();
    // La creación de A ya se sincronizó de inmediato (alta no diferida).
    expect(chain.insert).toHaveBeenCalledTimes(1);
    chain.delete.mockClear();

    // 2) Antes de que expire, eliminar el movimiento B desde el flujo real
    //    de Historial (fila -> expandir -> Eliminar).
    fireEvent.click(within(historialSection).getByRole('button', { name: /Supermercado/ }));
    fireEvent.click(within(historialSection).getByRole('button', { name: /eliminar/i }));

    // 3) Verificar cuál operación queda viva: la baja de B gana el único
    //    slot — el alta de A se descartó sin generar una segunda escritura.
    expect(screen.getByTestId('toast')).toHaveTextContent('Movimiento eliminado');
    expect(screen.queryAllByTestId('toast')).toHaveLength(1); // nunca dos Toasts simultáneos
    expect(chain.delete).not.toHaveBeenCalled(); // el alta descartada no sincroniza nada

    // 4) Dashboard e Historial siguen sincronizados: B desapareció de
    //    ambos al instante, A sigue presente en ambos.
    expect(within(dashboardSection).queryByText('Supermercado')).not.toBeInTheDocument();
    expect(within(historialSection).queryByText('Supermercado')).not.toBeInTheDocument();
    expect(within(dashboardSection).getByText('Cafetería')).toBeInTheDocument();
    expect(within(historialSection).getByText('Cafetería')).toBeInTheDocument();

    // 5) Supabase todavía NO recibió la baja de B — sigue diferida.
    expect(chain.delete).not.toHaveBeenCalled();

    // El Toast expira de verdad (mismo setTimeout que corre en producción,
    // Toast.jsx duration=8000 por defecto) -> recién ahí se confirma.
    await vi.advanceTimersByTimeAsync(8000);

    expect(chain.delete).toHaveBeenCalledTimes(1);
    expect(chain.eq).toHaveBeenCalledWith('id', expect.any(String));
    expect(screen.queryByTestId('toast')).not.toBeInTheDocument();

    // El estado post-confirmación sigue siendo el mismo: B ausente, A presente.
    expect(within(dashboardSection).queryByText('Supermercado')).not.toBeInTheDocument();
    expect(within(dashboardSection).getByText('Cafetería')).toBeInTheDocument();
  });
});
