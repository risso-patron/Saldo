import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BudgetForm } from './BudgetForm';
import { AIProvider } from '../contexts/AIContext';

// Tarea 4.3/4.4 — BudgetForm monta SmartCategorySelector con fallback manual
// (spec.md Área 3 "Sin sugerencia disponible, el selector manual sigue siendo
// el camino completo"; design.md §5 Puntos de integración; Principios 4/5).

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key }),
}));

vi.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    currencies: [{ code: 'USD' }],
    getSmartDefaultCurrency: () => 'USD',
    recordCurrencyUsage: vi.fn(),
  }),
}));

const { singleMock, upsertMock, fromMock, useSubscriptionMock } = vi.hoisted(() => {
  const singleMock = vi.fn();
  const upsertMock = vi.fn();
  const eq2Mock = vi.fn(() => ({ single: singleMock }));
  const eq1Mock = vi.fn(() => ({ eq: eq2Mock }));
  const selectMock = vi.fn(() => ({ eq: eq1Mock }));
  const fromMock = vi.fn(() => ({ select: selectMock, upsert: upsertMock }));
  const useSubscriptionMock = vi.fn(() => ({ subscription: { plan_type: 'pro_monthly' } }));
  return { singleMock, upsertMock, fromMock, useSubscriptionMock };
});

vi.mock('../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}));

vi.mock('../hooks/useSubscription', () => ({
  useSubscription: useSubscriptionMock,
}));

const openManualExpenseForm = async (user) => {
  await user.click(screen.getByText('form.write_manual'));
  await waitFor(() => expect(screen.getByLabelText(/detalle del movimiento/i)).toBeInTheDocument());
};

describe('BudgetForm — integración con SmartCategorySelector (spec.md Área 3, design.md §5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertMock.mockResolvedValue({ data: null, error: null });
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
  });

  it('con acceso (canUseAI && hasConsent), se monta SmartCategorySelector alimentado por useAI()', async () => {
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null }); // consentimiento activo
    const user = userEvent.setup();

    render(
      <AIProvider>
        <BudgetForm onAddIncome={vi.fn()} onAddExpense={vi.fn()} />
      </AIProvider>
    );

    await openManualExpenseForm(user);
    await waitFor(() => expect(screen.getByText('Categoría')).toBeInTheDocument());
    expect(screen.queryByText('Clasificación')).not.toBeInTheDocument();
  });

  it('sin plan (canUseAI=false), muestra el <select> manual de siempre sin bloquear el guardado', async () => {
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'free' } });
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });
    const user = userEvent.setup();
    const onAddExpense = vi.fn(() => true);

    render(
      <AIProvider>
        <BudgetForm onAddIncome={vi.fn()} onAddExpense={onAddExpense} />
      </AIProvider>
    );

    await openManualExpenseForm(user);
    await waitFor(() => expect(screen.getByText('Clasificación')).toBeInTheDocument());
    expect(screen.queryByText('Categoría')).not.toBeInTheDocument();
  });

  it('sin consentimiento (hasConsent=false), muestra el <select> manual de siempre sin bloquear el guardado', async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } }); // sin fila = sin consentimiento
    const user = userEvent.setup();

    render(
      <AIProvider>
        <BudgetForm onAddIncome={vi.fn()} onAddExpense={vi.fn()} />
      </AIProvider>
    );

    await openManualExpenseForm(user);
    await waitFor(() => expect(screen.getByText('Clasificación')).toBeInTheDocument());
    expect(screen.queryByText('Categoría')).not.toBeInTheDocument();
  });
});

// ── 4.5/4.6 — Consentimiento just-in-time (spec.md Área 6, proposal.md §7.1) ──

describe('BudgetForm — consentimiento just-in-time (spec.md Área 6, design.md §3.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertMock.mockResolvedValue({ data: null, error: null });
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
    singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } }); // sin consentimiento
  });

  it('escribir por primera vez una descripción de >=3 caracteres sin consentimiento dispara el pedido, no antes', async () => {
    const user = userEvent.setup();

    render(
      <AIProvider>
        <BudgetForm onAddIncome={vi.fn()} onAddExpense={vi.fn()} />
      </AIProvider>
    );

    await openManualExpenseForm(user);
    expect(screen.queryByRole('button', { name: 'Activar' })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/detalle del movimiento/i), 'uber');

    await waitFor(() => expect(screen.getByRole('button', { name: 'Activar' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Ahora no' })).toBeInTheDocument();
  });

  it('tocar "Activar" otorga consentimiento y a partir de ahí se monta SmartCategorySelector', async () => {
    const user = userEvent.setup();

    render(
      <AIProvider>
        <BudgetForm onAddIncome={vi.fn()} onAddExpense={vi.fn()} />
      </AIProvider>
    );

    await openManualExpenseForm(user);
    await user.type(screen.getByLabelText(/detalle del movimiento/i), 'uber');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Activar' })).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Activar' }));

    await waitFor(() => expect(screen.getByText('Categoría')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Activar' })).not.toBeInTheDocument();
  });

  it('tocar "Ahora no" cierra el pedido sin insistir de nuevo en la misma sesión de formulario', async () => {
    const user = userEvent.setup();

    render(
      <AIProvider>
        <BudgetForm onAddIncome={vi.fn()} onAddExpense={vi.fn()} />
      </AIProvider>
    );

    await openManualExpenseForm(user);
    await user.type(screen.getByLabelText(/detalle del movimiento/i), 'uber');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Activar' })).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: 'Ahora no' }));
    expect(screen.queryByRole('button', { name: 'Activar' })).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/detalle del movimiento/i), ' de vuelta');
    expect(screen.queryByRole('button', { name: 'Activar' })).not.toBeInTheDocument();
  });
});

// ── 4.7/4.8 — Fallback visual de los 4 casos de Área 5 dentro de BudgetForm ──

describe('BudgetForm — fallback visual de los 4 casos de Área 5 (spec.md Área 5, design.md §7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertMock.mockResolvedValue({ data: null, error: null });
  });

  it('caso 1 (plan free): muestra la invitación a mejorar, con el <select> manual siempre operable', async () => {
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'free' } });
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });
    const user = userEvent.setup();

    render(
      <AIProvider>
        <BudgetForm onAddIncome={vi.fn()} onAddExpense={vi.fn()} />
      </AIProvider>
    );

    await openManualExpenseForm(user);
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/plan superior/i));
    expect(screen.getByLabelText(/clasificación/i)).toBeInTheDocument();
  });

  it('caso 3 (sin consentimiento, ya rechazado): muestra invitación de una línea, sin insistir con el pedido', async () => {
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
    singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    const user = userEvent.setup();

    render(
      <AIProvider>
        <BudgetForm onAddIncome={vi.fn()} onAddExpense={vi.fn()} />
      </AIProvider>
    );

    await openManualExpenseForm(user);
    await user.type(screen.getByLabelText(/detalle del movimiento/i), 'uber');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ahora no' })).toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Ahora no' }));

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/activar la ia de saldo/i));
    expect(screen.queryByRole('button', { name: 'Activar' })).not.toBeInTheDocument();
  });

  it('caso 2 (límite alcanzado): status:rate_limited del gateway muestra copy de espera sin cifra, selector manual sigue operable', async () => {
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });
    const err = Object.assign(new Error('Too Many Requests'), { status: 429 });
    const categorizeMock = vi.fn().mockRejectedValue(err);
    const user = userEvent.setup();

    render(
      <AIProvider provider={{ categorize: categorizeMock }}>
        <BudgetForm onAddIncome={vi.fn()} onAddExpense={vi.fn()} />
      </AIProvider>
    );

    await openManualExpenseForm(user);
    await waitFor(() => expect(screen.getByText('Categoría')).toBeInTheDocument());
    await user.type(screen.getByLabelText(/detalle del movimiento/i), 'uber al trabajo');

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/mucha demanda/i), { timeout: 3000 });
    expect(screen.getByText('Categoría')).toBeInTheDocument(); // selector manual sigue operable
  });

  it('caso 4 (error del proveedor): status:provider_error muestra copy calmo de reintento, resto de la app sigue funcionando', async () => {
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });
    const categorizeMock = vi.fn().mockRejectedValue(new Error('network down'));
    const user = userEvent.setup();

    render(
      <AIProvider provider={{ categorize: categorizeMock }}>
        <BudgetForm onAddIncome={vi.fn()} onAddExpense={vi.fn()} />
      </AIProvider>
    );

    await openManualExpenseForm(user);
    await waitFor(() => expect(screen.getByText('Categoría')).toBeInTheDocument());
    await user.type(screen.getByLabelText(/detalle del movimiento/i), 'uber al trabajo');

    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/no pudimos sugerir/i), { timeout: 3000 });
    expect(screen.getByText('Categoría')).toBeInTheDocument();
  });
});
