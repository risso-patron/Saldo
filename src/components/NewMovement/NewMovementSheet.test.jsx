import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewMovementSheet } from './NewMovementSheet';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

// Checkpoint III-A (Saldo Design Constitution v1.2) — orquestación del flujo
// mínimo de "Nuevo Movimiento". Fuente: docs/design/screens/Saldo Nuevo
// Movimiento.dc.html + docs/design/flows/Saldo Flow 01 - Registrar
// Movimiento.dc.html. Mismas firmas que BudgetForm.jsx:
// onAddIncome(description, amount, date, currency),
// onAddExpense(description, category, amount, date, currency).

const { useAIMock, useCurrencyMock } = vi.hoisted(() => ({
  useAIMock: vi.fn(),
  useCurrencyMock: vi.fn(),
}));

vi.mock('../../contexts/AIContext', () => ({
  useAI: () => useAIMock(),
}));

vi.mock('../../contexts/CurrencyContext', () => ({
  useCurrency: () => useCurrencyMock(),
}));

const waitOutDebounce = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 850));
  });
};

const renderSheet = (props = {}) => {
  const onClose = vi.fn();
  const onAddIncome = vi.fn(() => true);
  const onAddExpense = vi.fn(() => true);
  const utils = render(
    <NewMovementSheet
      isOpen
      onClose={onClose}
      onAddIncome={onAddIncome}
      onAddExpense={onAddExpense}
      {...props}
    />
  );
  return { ...utils, onClose, onAddIncome, onAddExpense };
};

describe('NewMovementSheet — Checkpoint III-A (Saldo Design Constitution v1.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAIMock.mockReturnValue({ canUseAI: false, hasConsent: false, suggestCategory: vi.fn() });
    useCurrencyMock.mockReturnValue({ getSmartDefaultCurrency: () => 'USD' });
  });

  it('los tabs cambian el tipo activo (Gasto/Ingreso)', async () => {
    const user = userEvent.setup();
    renderSheet();

    expect(screen.getByRole('tab', { name: 'Gasto' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('¿En qué se usó el dinero?')).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Ingreso' }));

    expect(screen.getByRole('tab', { name: 'Ingreso' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByPlaceholderText('¿De donde viene el dinero?')).toBeInTheDocument();
  });

  it('el importe protagonista actualiza el estado al escribir', async () => {
    const user = userEvent.setup();
    renderSheet();

    const amountInput = screen.getByRole('textbox', { name: 'Importe' });
    await user.type(amountInput, '42,50');

    expect(amountInput).toHaveValue('42,50');
  });

  it('"Añadir" está deshabilitado sin importe/descripción válidos y habilitado con ambos', async () => {
    const user = userEvent.setup();
    renderSheet();

    const addButton = screen.getByRole('button', { name: 'Añadir' });
    expect(addButton).toBeDisabled();

    await user.type(screen.getByRole('textbox', { name: 'Importe' }), '42,50');
    expect(addButton).toBeDisabled(); // RC-1.2/C1: importe solo no alcanza, falta la descripción

    await user.type(screen.getByLabelText(/concepto/i), 'Supermercado');

    expect(addButton).not.toBeDisabled();
  });

  it('Enter con importe válido llama a onAddExpense con los argumentos correctos y luego onClose', async () => {
    const user = userEvent.setup();
    const { onAddExpense, onClose } = renderSheet();

    await user.type(screen.getByRole('textbox', { name: 'Importe' }), '42,50');
    await user.type(screen.getByLabelText(/concepto/i), 'Supermercado');
    await user.keyboard('{Enter}');

    expect(onAddExpense).toHaveBeenCalledTimes(1);
    const [description, category, amount, date, currency] = onAddExpense.mock.calls[0];
    expect(description).toBe('Supermercado');
    expect(category).toBe(EXPENSE_CATEGORIES[0].value);
    expect(amount).toBe(42.5);
    // Formato 'YYYY-MM-DD' — igual que BudgetForm.jsx y useTransactions.js.
    // Un objeto Date crudo rompe parseLocalDate() río abajo (Dashboard,
    // Movimientos recientes) — hallazgo de verificación del orquestador.
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(currency).toBe('USD');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Enter con importe válido y tipo Ingreso llama a onAddIncome (no onAddExpense)', async () => {
    const user = userEvent.setup();
    const { onAddIncome, onAddExpense } = renderSheet();

    await user.click(screen.getByRole('tab', { name: 'Ingreso' }));
    await user.type(screen.getByRole('textbox', { name: 'Importe' }), '100');
    await user.type(screen.getByLabelText(/concepto/i), 'Salario');
    await user.keyboard('{Enter}');

    expect(onAddIncome).toHaveBeenCalledTimes(1);
    expect(onAddExpense).not.toHaveBeenCalled();
    const [description, amount, date, currency] = onAddIncome.mock.calls[0];
    expect(description).toBe('Salario');
    expect(amount).toBe(100);
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(currency).toBe('USD');
  });

  it('Enter con importe vacío NO llama a onAddExpense/onAddIncome y muestra el mensaje de error', async () => {
    const user = userEvent.setup();
    const { onAddExpense, onAddIncome, onClose } = renderSheet();

    await user.type(screen.getByLabelText(/concepto/i), 'Algo');
    await user.keyboard('{Enter}');

    expect(onAddExpense).not.toHaveBeenCalled();
    expect(onAddIncome).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('El importe necesita un número para poder añadirse.')).toBeInTheDocument();
  });

  // RC-1.2/C1: antes, con importe válido y descripción vacía o corta,
  // guardar fallaba en silencio (sin mensaje de error, sin toast, sin
  // cierre de la hoja) porque useTransactions.js solo mostraba el error de
  // validación con notification==='legacy', nunca con 'toast' (el modo real
  // que usa esta hoja). Ahora la validación es client-side, con el mismo
  // patrón que el importe.
  it('Enter con descripción vacía NO llama a onAddExpense/onAddIncome y muestra el mensaje de error', async () => {
    const user = userEvent.setup();
    const { onAddExpense, onAddIncome, onClose } = renderSheet();

    await user.type(screen.getByRole('textbox', { name: 'Importe' }), '42,50');
    await user.keyboard('{Enter}');

    expect(onAddExpense).not.toHaveBeenCalled();
    expect(onAddIncome).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('La descripción es requerida')).toBeInTheDocument();
  });

  it('Enter con descripción de menos de 3 caracteres NO llama a onAddExpense y muestra el mensaje de error', async () => {
    const user = userEvent.setup();
    const { onAddExpense, onClose } = renderSheet();

    await user.type(screen.getByRole('textbox', { name: 'Importe' }), '42,50');
    await user.type(screen.getByLabelText(/concepto/i), 'Ab');
    await user.keyboard('{Enter}');

    expect(onAddExpense).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText('La descripción debe tener al menos 3 caracteres')).toBeInTheDocument();
  });

  it('corregir la descripción tras un intento fallido habilita "Añadir" y permite guardar', async () => {
    const user = userEvent.setup();
    const { onAddExpense } = renderSheet();

    await user.type(screen.getByRole('textbox', { name: 'Importe' }), '42,50');
    await user.keyboard('{Enter}');
    expect(screen.getByText('La descripción es requerida')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/concepto/i), 'Supermercado');
    expect(screen.getByRole('button', { name: 'Añadir' })).not.toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(onAddExpense).toHaveBeenCalledTimes(1);
  });

  it('gate de IA: con canUseAI && hasConsent, muestra AISuggestedCategory tras sugerencia (no el chip "Elegir categoría")', async () => {
    useAIMock.mockReturnValue({
      canUseAI: true,
      hasConsent: true,
      suggestCategory: vi.fn().mockResolvedValue({ category: 'Alimentación', confidence: 'alta' }),
    });
    const user = userEvent.setup();
    renderSheet();

    expect(screen.queryByText('Elegir categoría')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/concepto/i), 'Supermercado');
    await waitOutDebounce();

    expect(screen.getByText('Categoría sugerida:')).toBeInTheDocument();
    expect(screen.getByText('Alimentación')).toBeInTheDocument();
  });

  it('gate de IA: sin canUseAI o sin hasConsent, muestra el chip "Elegir categoría" (no AISuggestedCategory)', async () => {
    useAIMock.mockReturnValue({ canUseAI: false, hasConsent: false, suggestCategory: vi.fn() });
    const user = userEvent.setup();
    renderSheet();

    await user.type(screen.getByLabelText(/concepto/i), 'Supermercado');

    expect(screen.getByText('Elegir categoría')).toBeInTheDocument();
    expect(screen.queryByText('Categoría sugerida:')).not.toBeInTheDocument();
  });

  it('seleccionar una categoría del <select> nativo la fija (se usa al guardar)', async () => {
    useAIMock.mockReturnValue({ canUseAI: false, hasConsent: false, suggestCategory: vi.fn() });
    const user = userEvent.setup();
    const { onAddExpense } = renderSheet();

    await user.click(screen.getByText('Elegir categoría'));
    const select = screen.getByLabelText(/categoría/i);
    const targetCategory = EXPENSE_CATEGORIES[2];
    await user.selectOptions(select, targetCategory.value);

    // Vuelve al chip: el select se oculta tras elegir.
    expect(screen.queryByLabelText(/categoría/i)).not.toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Importe' }), '10');
    await user.type(screen.getByLabelText(/concepto/i), 'Farmacia');
    await user.click(screen.getByRole('button', { name: 'Añadir' }));

    expect(onAddExpense).toHaveBeenCalledTimes(1);
    expect(onAddExpense.mock.calls[0][1]).toBe(targetCategory.value);
  });

  it('cerrar y reabrir (sin re-montar, solo cambiando isOpen) conserva lo escrito', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onAddIncome = vi.fn(() => true);
    const onAddExpense = vi.fn(() => true);
    const { rerender } = render(
      <NewMovementSheet isOpen onClose={onClose} onAddIncome={onAddIncome} onAddExpense={onAddExpense} />
    );

    await user.type(screen.getByLabelText(/concepto/i), 'Café');

    rerender(
      <NewMovementSheet isOpen={false} onClose={onClose} onAddIncome={onAddIncome} onAddExpense={onAddExpense} />
    );
    rerender(
      <NewMovementSheet isOpen onClose={onClose} onAddIncome={onAddIncome} onAddExpense={onAddExpense} />
    );

    expect(screen.getByLabelText(/concepto/i)).toHaveValue('Café');
  });

  it('tras un "Añadir" exitoso, el formulario se resetea', async () => {
    const user = userEvent.setup();
    renderSheet();

    await user.type(screen.getByRole('textbox', { name: 'Importe' }), '42,50');
    await user.type(screen.getByLabelText(/concepto/i), 'Supermercado');
    await user.click(screen.getByRole('button', { name: 'Añadir' }));

    expect(screen.getByLabelText(/concepto/i)).toHaveValue('');
    expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveValue('');
    expect(screen.getByRole('tab', { name: 'Gasto' })).toHaveAttribute('aria-selected', 'true');
  });

  describe('Checkpoint III-C.1 — modo ráfaga (Ctrl/Cmd+Enter)', () => {
    it('Ctrl+Enter con importe y concepto válidos guarda, resetea el formulario, NO cierra la hoja y devuelve el foco al importe', async () => {
      const user = userEvent.setup();
      const { onAddExpense, onClose } = renderSheet();

      const amountInput = screen.getByRole('textbox', { name: 'Importe' });
      await user.type(amountInput, '42,50');
      await user.type(screen.getByLabelText(/concepto/i), 'Supermercado');
      await user.keyboard('{Control>}{Enter}{/Control}');

      expect(onAddExpense).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByLabelText(/concepto/i)).toHaveValue('');
      expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveValue('');
      expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Importe' }));
    });

    it('Cmd+Enter (metaKey) se comporta igual que Ctrl+Enter', async () => {
      const user = userEvent.setup();
      const { onAddExpense, onClose } = renderSheet();

      const amountInput = screen.getByRole('textbox', { name: 'Importe' });
      await user.type(amountInput, '42,50');
      await user.type(screen.getByLabelText(/concepto/i), 'Supermercado');
      await user.keyboard('{Meta>}{Enter}{/Meta}');

      expect(onAddExpense).toHaveBeenCalledTimes(1);
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByLabelText(/concepto/i)).toHaveValue('');
      expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveValue('');
      expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Importe' }));
    });

    it('Enter simple (sin modificador) sigue cerrando la hoja como antes (regresión)', async () => {
      const user = userEvent.setup();
      const { onAddExpense, onClose } = renderSheet();

      await user.type(screen.getByRole('textbox', { name: 'Importe' }), '42,50');
      await user.type(screen.getByLabelText(/concepto/i), 'Supermercado');
      await user.keyboard('{Enter}');

      expect(onAddExpense).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Ctrl/Cmd+Enter con importe vacío/inválido NO guarda, NO resetea el formulario, muestra el error y el foco queda en Importe', async () => {
      const user = userEvent.setup();
      const { onAddExpense, onAddIncome, onClose } = renderSheet();

      await user.type(screen.getByLabelText(/concepto/i), 'Algo');
      await user.keyboard('{Control>}{Enter}{/Control}');

      expect(onAddExpense).not.toHaveBeenCalled();
      expect(onAddIncome).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByText('El importe necesita un número para poder añadirse.')).toBeInTheDocument();
      expect(screen.getByLabelText(/concepto/i)).toHaveValue('Algo');
      expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Importe' }));
    });
  });

  describe('Checkpoint III-C.2 — persistencia y restauración del borrador (localStorage, TTL 60s)', () => {
    const STORAGE_KEY = 'budgetrp_new_movement_draft';

    // setupTests.js reemplaza global.localStorage por vi.fn() puros. Estos
    // tests necesitan comportamiento de storage real (seed antes de montar,
    // verificar que quede vacío tras guardar/vencer), así que respaldamos
    // los mocks con un store en memoria — mismo patrón que
    // newMovementDraft.test.js y GlobalBudgetTracker.test.jsx.
    let store;

    beforeEach(() => {
      store = {};
      localStorage.getItem.mockImplementation((key) => (key in store ? store[key] : null));
      localStorage.setItem.mockImplementation((key, value) => {
        store[key] = String(value);
      });
      localStorage.removeItem.mockImplementation((key) => {
        delete store[key];
      });
      localStorage.clear.mockImplementation(() => {
        store = {};
      });
    });

    afterEach(() => {
      store = {};
    });

    it('con un borrador fresco en localStorage, al renderizar restaura Importe/Concepto/tab activo', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeType: 'income',
          description: 'Freelance',
          amount: 250,
          category: EXPENSE_CATEGORIES[1].value,
          savedAt: Date.now() - 1000,
        })
      );

      renderSheet();

      expect(screen.getByRole('tab', { name: 'Ingreso' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByLabelText(/concepto/i)).toHaveValue('Freelance');
      expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveValue('250');
    });

    it('con un borrador vencido (>60s) en localStorage, al renderizar los campos quedan vacíos y el storage se limpia', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activeType: 'income',
          description: 'Viejo',
          amount: 999,
          category: EXPENSE_CATEGORIES[0].value,
          savedAt: Date.now() - 70000,
        })
      );

      renderSheet();

      expect(screen.getByRole('tab', { name: 'Gasto' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByLabelText(/concepto/i)).toHaveValue('');
      expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveValue('');
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('escribir en el formulario persiste un borrador en localStorage', async () => {
      const user = userEvent.setup();
      renderSheet();

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

      await user.type(screen.getByLabelText(/concepto/i), 'Supermercado');

      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
      const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(persisted.description).toBe('Supermercado');
    });

    it('guardar exitosamente (Enter) deja el borrador en localStorage en null', async () => {
      const user = userEvent.setup();
      renderSheet();

      await user.type(screen.getByRole('textbox', { name: 'Importe' }), '42,50');
      await user.type(screen.getByLabelText(/concepto/i), 'Supermercado');

      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

      await user.keyboard('{Enter}');

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });

    it('con JSON corrupto en localStorage, el componente se monta sin tirar excepción, los campos quedan vacíos, y el storage se limpia', () => {
      localStorage.setItem(STORAGE_KEY, 'esto no es json {');

      expect(() => renderSheet()).not.toThrow();

      expect(screen.getByLabelText(/concepto/i)).toHaveValue('');
      expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveValue('');
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('Checkpoint IV-B — modo edición (unificado con creación, prop `movement`)', () => {
    const expenseMovement = {
      id: 'exp-1',
      type: 'expense',
      description: 'Supermercado',
      amount: 55,
      category: EXPENSE_CATEGORIES[2].value,
      date: '2026-07-10',
      currency: 'EUR',
    };
    const incomeMovement = {
      id: 'inc-1',
      type: 'income',
      description: 'Freelance',
      amount: 300,
      date: '2026-07-05',
      currency: 'USD',
    };

    const CURRENCIES = [
      { code: 'USD', symbol: '$', name: 'Dólar Americano' },
      { code: 'EUR', symbol: '€', name: 'Euro' },
    ];

    const renderEditSheet = (movement, props = {}) => {
      const onClose = vi.fn();
      const onAddIncome = vi.fn(() => true);
      const onAddExpense = vi.fn(() => true);
      const onUpdateIncome = vi.fn(() => true);
      const onUpdateExpense = vi.fn(() => true);
      const utils = render(
        <NewMovementSheet
          isOpen
          onClose={onClose}
          onAddIncome={onAddIncome}
          onAddExpense={onAddExpense}
          onUpdateIncome={onUpdateIncome}
          onUpdateExpense={onUpdateExpense}
          movement={movement}
          {...props}
        />
      );
      return { ...utils, onClose, onAddIncome, onAddExpense, onUpdateIncome, onUpdateExpense };
    };

    beforeEach(() => {
      useCurrencyMock.mockReturnValue({ getSmartDefaultCurrency: () => 'USD', currencies: CURRENCIES });
    });

    it('siembra los campos desde `movement` (gasto): tab, concepto, importe, categoría', () => {
      renderEditSheet(expenseMovement);

      expect(screen.getByRole('tab', { name: 'Gasto' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByLabelText(/concepto/i)).toHaveValue('Supermercado');
      expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveValue('55');
    });

    it('siembra los campos desde `movement` (ingreso): tab e importe', () => {
      renderEditSheet(incomeMovement);

      expect(screen.getByRole('tab', { name: 'Ingreso' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByLabelText(/concepto/i)).toHaveValue('Freelance');
      expect(screen.getByRole('textbox', { name: 'Importe' })).toHaveValue('300');
    });

    it('muestra los campos Fecha y Moneda SOLO en modo edición, seedeados desde movement', () => {
      renderEditSheet(expenseMovement);

      expect(screen.getByLabelText(/^fecha$/i)).toHaveValue('2026-07-10');
      expect(screen.getByLabelText(/^moneda$/i)).toHaveValue('EUR');
    });

    it('en modo creación NO muestra los campos Fecha ni Moneda (conserva el chip fijo "Hoy")', () => {
      renderSheet();

      expect(screen.queryByLabelText(/^fecha$/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/^moneda$/i)).not.toBeInTheDocument();
      expect(screen.getByText('Hoy')).toBeInTheDocument();
    });

    it('el botón usa el label "Guardar" en modo edición (no "Añadir")', () => {
      renderEditSheet(expenseMovement);

      expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Añadir' })).not.toBeInTheDocument();
    });

    it('Guardar en modo edición (gasto) llama a onUpdateExpense con el id y los campos correctos, NO a onAddExpense, y cierra la hoja', async () => {
      const user = userEvent.setup();
      const { onUpdateExpense, onAddExpense, onClose } = renderEditSheet(expenseMovement);

      await user.clear(screen.getByLabelText(/concepto/i));
      await user.type(screen.getByLabelText(/concepto/i), 'Super actualizado');
      await user.click(screen.getByRole('button', { name: 'Guardar' }));

      expect(onUpdateExpense).toHaveBeenCalledTimes(1);
      expect(onAddExpense).not.toHaveBeenCalled();
      const [id, updates] = onUpdateExpense.mock.calls[0];
      expect(id).toBe('exp-1');
      expect(updates.description).toBe('Super actualizado');
      expect(updates.category).toBe(expenseMovement.category);
      expect(updates.date).toBe('2026-07-10');
      expect(updates.currency).toBe('EUR');
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Guardar en modo edición (ingreso) llama a onUpdateIncome con el id correcto, NO a onAddIncome', async () => {
      const user = userEvent.setup();
      const { onUpdateIncome, onAddIncome } = renderEditSheet(incomeMovement);

      await user.click(screen.getByRole('button', { name: 'Guardar' }));

      expect(onUpdateIncome).toHaveBeenCalledTimes(1);
      expect(onAddIncome).not.toHaveBeenCalled();
      expect(onUpdateIncome.mock.calls[0][0]).toBe('inc-1');
    });

    it('cambiar Fecha/Moneda en modo edición se refleja en los campos enviados a onUpdateExpense', async () => {
      const user = userEvent.setup();
      const { onUpdateExpense } = renderEditSheet(expenseMovement);

      fireEvent.change(screen.getByLabelText(/^fecha$/i), { target: { value: '2026-07-11' } });
      fireEvent.change(screen.getByLabelText(/^moneda$/i), { target: { value: 'USD' } });
      await user.click(screen.getByRole('button', { name: 'Guardar' }));

      const [, updates] = onUpdateExpense.mock.calls[0];
      expect(updates.date).toBe('2026-07-11');
      expect(updates.currency).toBe('USD');
    });

    it('Ctrl+Enter en modo edición NO activa ráfaga: guarda y cierra la hoja (no permanece abierta)', async () => {
      const user = userEvent.setup();
      const { onUpdateExpense, onClose } = renderEditSheet(expenseMovement);

      // Foco explícito dentro del form (el foco automático del Sheet vía
      // requestAnimationFrame puede no haberse asentado todavía en este
      // punto del test) — mismo patrón que los tests de ráfaga de III-C.1.
      await user.click(screen.getByLabelText(/concepto/i));
      await user.keyboard('{Control>}{Enter}{/Control}');

      expect(onUpdateExpense).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('importe inválido en modo edición NO llama a onUpdateExpense y muestra el mensaje de error', async () => {
      const user = userEvent.setup();
      const { onUpdateExpense, onClose } = renderEditSheet(expenseMovement);

      await user.clear(screen.getByRole('textbox', { name: 'Importe' }));
      await user.keyboard('{Enter}');

      expect(onUpdateExpense).not.toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByText('El importe necesita un número para poder añadirse.')).toBeInTheDocument();
    });

    describe('modo edición no toca el borrador de creación (localStorage)', () => {
      const STORAGE_KEY = 'budgetrp_new_movement_draft';
      let store;

      beforeEach(() => {
        store = {};
        localStorage.getItem.mockImplementation((key) => (key in store ? store[key] : null));
        localStorage.setItem.mockImplementation((key, value) => {
          store[key] = String(value);
        });
        localStorage.removeItem.mockImplementation((key) => {
          delete store[key];
        });
      });

      afterEach(() => {
        store = {};
      });

      it('editar campos en modo edición no escribe ningún borrador en localStorage', async () => {
        const user = userEvent.setup();
        renderEditSheet(expenseMovement);

        await user.type(screen.getByLabelText(/concepto/i), ' extra');

        expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      });

      it('con un borrador de creación previamente guardado, abrir en modo edición siembra desde `movement`, no desde el borrador, y no lo sobreescribe', () => {
        store[STORAGE_KEY] = JSON.stringify({
          activeType: 'income',
          description: 'Borrador viejo',
          amount: 999,
          category: EXPENSE_CATEGORIES[0].value,
          savedAt: Date.now(),
        });

        renderEditSheet(expenseMovement);

        expect(screen.getByLabelText(/concepto/i)).toHaveValue('Supermercado');
        expect(JSON.parse(localStorage.getItem(STORAGE_KEY)).description).toBe('Borrador viejo');
      });
    });
  });
});
