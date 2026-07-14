// Tests OBJETIVO (HAL-001 parte 2 — deben quedar en ROJO hasta el fix).
// ExpenseList debe aceptar un filtro de categoría inicial (para el deep-link
// desde el banner de dominancia de "Otros" en ChartsTab), consumirlo una sola
// vez al montar, y dejar explícito cuándo la lista es un subconjunto filtrado.
import { render, screen, fireEvent } from '@testing-library/react';
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

// HAL-001 parte 3: sugerencia de categoría vía heurística local (categorizeWithRules),
// SOLO para las 4 categorías ya alineadas con EXPENSE_CATEGORIES (Transporte,
// Entretenimiento, Salud, Servicios) — sin IA, sin mapeos, opcional y descartable.
//
// "Aplicar" usa onCategorizeMultiple([id], categoria) — el mismo camino ya probado
// de la reclasificación masiva (parte 2) — y NO onUpdateExpense. Se detectó en
// verificación manual que onUpdateExpense corre validateTransaction() sobre el
// payload completo (useTransactions.js:210-227) y exige description/amount no
// vacíos; un payload parcial de solo {category} fallaba esa validación en
// silencio y la categoría nunca cambiaba. categorizeMultiple no valida esos
// campos — es la semántica correcta para "solo cambiar la categoría".
describe('ExpenseList — chip de sugerencia de categoría sobre "Otros" (HAL-001 parte 3)', () => {
  it('gasto "Otros" con descripción reconocible por la heurística (Transporte) muestra la sugerencia con botón Aplicar', () => {
    const otrosConSugerencia = [
      { id: 'e1', description: 'Viaje en Uber al trabajo', amount: 12, date: '2026-07-01', category: 'Otros' },
    ];
    render(<ExpenseList {...baseProps} expenses={otrosConSugerencia} />);

    expect(screen.getByText(/Sugerencia:.*Transporte/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aplicar/i })).toBeInTheDocument();
  });

  it('al hacer click en Aplicar, llama a onCategorizeMultiple con [id] y la categoría sugerida', () => {
    const onCategorizeMultiple = vi.fn();
    const otrosConSugerencia = [
      { id: 'e1', description: 'Viaje en Uber al trabajo', amount: 12, date: '2026-07-01', category: 'Otros' },
    ];
    render(<ExpenseList {...baseProps} expenses={otrosConSugerencia} onCategorizeMultiple={onCategorizeMultiple} />);

    fireEvent.click(screen.getByRole('button', { name: /aplicar/i }));

    expect(onCategorizeMultiple).toHaveBeenCalledWith(['e1'], 'Transporte');
    expect(onCategorizeMultiple).toHaveBeenCalledTimes(1);
  });

  it('NO llama a onUpdateExpense al aplicar una sugerencia — evita el payload parcial que falla la validación', () => {
    const onUpdateExpense = vi.fn();
    const otrosConSugerencia = [
      { id: 'e1', description: 'Viaje en Uber al trabajo', amount: 12, date: '2026-07-01', category: 'Otros' },
    ];
    render(<ExpenseList {...baseProps} expenses={otrosConSugerencia} onUpdateExpense={onUpdateExpense} onCategorizeMultiple={noop} />);

    fireEvent.click(screen.getByRole('button', { name: /aplicar/i }));

    expect(onUpdateExpense).not.toHaveBeenCalled();
  });

  it('gasto "Otros" cuya heurística matchea "Comida" (fuera del whitelist) NO muestra sugerencia', () => {
    const otrosSinSugerenciaSegura = [
      { id: 'e1', description: 'Almuerzo en McDonald\'s', amount: 8, date: '2026-07-01', category: 'Otros' },
    ];
    render(<ExpenseList {...baseProps} expenses={otrosSinSugerenciaSegura} />);

    expect(screen.queryByRole('button', { name: /aplicar/i })).not.toBeInTheDocument();
  });

  it('gasto que NO es "Otros" no muestra sugerencia aunque la descripción matchee una regla', () => {
    const yaCategorizado = [
      { id: 'e1', description: 'Viaje en Uber al trabajo', amount: 12, date: '2026-07-01', category: 'Transporte' },
    ];
    render(<ExpenseList {...baseProps} expenses={yaCategorizado} />);

    expect(screen.queryByRole('button', { name: /aplicar/i })).not.toBeInTheDocument();
  });

  it('gasto "Otros" sin ningún match de la heurística no muestra sugerencia', () => {
    const sinMatch = [
      { id: 'e1', description: 'Movimiento sin descripción reconocible xyz123', amount: 5, date: '2026-07-01', category: 'Otros' },
    ];
    render(<ExpenseList {...baseProps} expenses={sinMatch} />);

    expect(screen.queryByRole('button', { name: /aplicar/i })).not.toBeInTheDocument();
  });
});
