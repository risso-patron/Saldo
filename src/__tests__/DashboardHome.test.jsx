import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHome } from '../components/Dashboard/DashboardHome';

// Fase 4 (tasks.md) — contrato de navegación Dashboard -> metas.
// spec.md "Requirement: Contrato de navegación desde el Dashboard":
// DashboardHome MUST aceptar `goals`/`onNavigate` y su disparador de Metas
// MUST invocar onNavigate('metas'). La composición visual de la sección
// "Mis metas" queda fuera de esta capability (dashboard-claridad).

vi.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => ({ selectedCurrency: 'USD' }),
}));

const baseTransaction = {
  id: 'tx-1',
  description: 'Supermercado',
  amount: 50,
  type: 'expense',
  category: 'Alimentación',
  date: '2026-07-10',
  currency: 'USD',
};

describe('DashboardHome — contrato goals/onNavigate (metas-exposicion)', () => {
  it('recibe goals y onNavigate; el disparador de Metas invoca onNavigate("metas")', () => {
    const onNavigate = vi.fn();

    render(
      <DashboardHome
        incomes={[]}
        expenses={[baseTransaction]}
        balance={-50}
        allTransactions={[baseTransaction]}
        loading={false}
        goals={[{ id: 'g1', name: 'Vacaciones', targetAmount: 1000, currentAmount: 200 }]}
        onNavigate={onNavigate}
        onRegisterExpense={vi.fn()}
        onViewAllTransactions={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /mis metas/i }));

    expect(onNavigate).toHaveBeenCalledWith('metas');
  });

  it('funciona sin goals (default []) sin lanzar', () => {
    const onNavigate = vi.fn();

    expect(() =>
      render(
        <DashboardHome
          incomes={[]}
          expenses={[baseTransaction]}
          balance={-50}
          allTransactions={[baseTransaction]}
          loading={false}
          onNavigate={onNavigate}
          onRegisterExpense={vi.fn()}
          onViewAllTransactions={vi.fn()}
        />
      )
    ).not.toThrow();
  });
});
