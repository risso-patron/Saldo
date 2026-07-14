// Tests OBJETIVO (P0 #2, HAL-004 — deben quedar en ROJO hasta el fix).
// GlobalBudgetTracker MUST distinguir "no gastaste nada" (0% real) de
// "gastaste poco" (0.3% que hoy Math.round colapsa a "0%").
import { render, screen } from '@testing-library/react';
import { GlobalBudgetTracker } from './GlobalBudgetTracker';

const setGlobalLimit = (limit) => {
  localStorage.getItem.mockImplementation((key) => {
    if (key === '@budgetRP_v1:budgetrp_global_limit') return JSON.stringify(limit);
    return null;
  });
};

describe('GlobalBudgetTracker — el porcentaje nunca miente hacia cero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('con gasto real chico (0.3% del límite) NO muestra "0%"', () => {
    setGlobalLimit(1000);
    render(<GlobalBudgetTracker totalExpenses={3} />);

    expect(screen.getByText('0.3%')).toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('con gasto verdaderamente cero SÍ muestra "0%" — cero real no se disfraza', () => {
    setGlobalLimit(1000);
    render(<GlobalBudgetTracker totalExpenses={0} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});
