// Tests OBJETIVO (HAL-001 parte 2 — deben quedar en ROJO hasta el fix).
// ExpenseList debe aceptar un filtro de categoría inicial (para el deep-link
// desde el banner de dominancia de "Otros" en ChartsTab), consumirlo una sola
// vez al montar, y dejar explícito cuándo la lista es un subconjunto filtrado.
import { render, screen } from '@testing-library/react';
import { ExpenseList } from './ExpenseList';

const noop = () => {};

const expenses = [
  { id: 'e1', description: 'Renta', amount: 500, date: '2026-07-01', category: 'Vivienda' },
  { id: 'e2', description: 'Suscripción rara', amount: 15, date: '2026-07-02', category: 'Otros' },
  { id: 'e3', description: 'Compra varia', amount: 30, date: '2026-07-03', category: 'Otros' },
];
const incomes = [];

const baseProps = {
  incomes,
  expenses,
  onRemoveIncome: noop,
  onRemoveExpense: noop,
};

describe('ExpenseList — filtro inicial pre-aplicado al montar (HAL-001 parte 2)', () => {
  it('con initialCategoryFilter="Otros", solo se muestran los gastos de esa categoría', () => {
    render(<ExpenseList {...baseProps} initialCategoryFilter="Otros" />);

    expect(screen.getByText('Suscripción rara')).toBeInTheDocument();
    expect(screen.getByText('Compra varia')).toBeInTheDocument();
    expect(screen.queryByText('Renta')).not.toBeInTheDocument();
  });

  it('el <select> de categoría refleja "Otros" como filtro activo (mismo mecanismo que el filtro manual)', () => {
    render(<ExpenseList {...baseProps} initialCategoryFilter="Otros" />);

    expect(screen.getByDisplayValue(/Otros/)).toBeInTheDocument();
  });

  it('sin initialCategoryFilter, el comportamiento por defecto no cambia: se muestra todo', () => {
    render(<ExpenseList {...baseProps} />);

    expect(screen.getByText('Renta')).toBeInTheDocument();
    expect(screen.getByText('Suscripción rara')).toBeInTheDocument();
    expect(screen.getByText('Compra varia')).toBeInTheDocument();
  });

  it('consume el filtro inicial una sola vez: llama a onInitialFilterConsumed al montar', () => {
    const onInitialFilterConsumed = vi.fn();
    render(<ExpenseList {...baseProps} initialCategoryFilter="Otros" onInitialFilterConsumed={onInitialFilterConsumed} />);

    expect(onInitialFilterConsumed).toHaveBeenCalledTimes(1);
  });

  it('sin initialCategoryFilter, NO llama a onInitialFilterConsumed', () => {
    const onInitialFilterConsumed = vi.fn();
    render(<ExpenseList {...baseProps} onInitialFilterConsumed={onInitialFilterConsumed} />);

    expect(onInitialFilterConsumed).not.toHaveBeenCalled();
  });

  it('con un filtro activo (inicial o manual), el contador deja explícito que es un subconjunto ("X de Y movimientos")', () => {
    render(<ExpenseList {...baseProps} initialCategoryFilter="Otros" />);

    // 2 gastos con categoría "Otros", de un total de 3 movimientos (2 gastos + 0 ingresos, vista "Todo").
    expect(screen.getByText('2 de 3 movimientos')).toBeInTheDocument();
  });

  it('sin ningún filtro activo, el contador NO muestra el total (comportamiento actual sin cambios)', () => {
    render(<ExpenseList {...baseProps} />);

    expect(screen.getByText('3 movimientos')).toBeInTheDocument();
    expect(screen.queryByText(/de 3 movimientos/)).not.toBeInTheDocument();
  });
});
