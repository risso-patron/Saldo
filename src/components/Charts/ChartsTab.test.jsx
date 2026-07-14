// Tests OBJETIVO (HAL-001 parte 2 — deben quedar en ROJO hasta el fix).
// El banner de dominancia de "Otros" debe ofrecer un CTA que navegue a
// Movimientos con el filtro de categoría pre-aplicado, vía la prop
// onReclassifyOtros — sin construir un flujo de navegación propio en ChartsTab.
import { render, screen, fireEvent } from '@testing-library/react';
import { ChartsTab } from './ChartsTab';

// Los sub-gráficos (recharts) no son el objeto de este test y requieren
// ResizeObserver/tamaño real de layout que jsdom no provee — se stubean para
// aislar el comportamiento del banner y el CTA.
vi.mock('./BalanceDonutChart', () => ({ BalanceDonutChart: () => null }));
vi.mock('./MonthlyCashFlowChart', () => ({ MonthlyCashFlowChart: () => null }));
vi.mock('./SpendingByDayChart', () => ({ SpendingByDayChart: () => null }));
vi.mock('./CategoryBarChart', () => ({ CategoryBarChart: () => null }));

const baseProps = {
  filteredIncomes: [],
  filteredExpenses: [],
  filteredTotalIncome: 1000,
  filteredTotalExpenses: 800,
};

describe('ChartsTab — CTA de reclasificación en el banner de dominancia (HAL-001 parte 2)', () => {
  it('cuando "Otros" domina, muestra un CTA que llama a onReclassifyOtros al hacer click', () => {
    const onReclassifyOtros = vi.fn();
    const categoryAnalysis = [
      { category: 'Vivienda', amount: 600, percentage: 55 },
      { category: 'Otros', amount: 280, percentage: 25 },
    ];
    render(<ChartsTab {...baseProps} categoryAnalysis={categoryAnalysis} onReclassifyOtros={onReclassifyOtros} />);

    const cta = screen.getByRole('button', { name: /reclasificar/i });
    fireEvent.click(cta);

    expect(onReclassifyOtros).toHaveBeenCalledTimes(1);
  });

  it('cuando "Otros" NO domina, no hay banner ni CTA de reclasificación', () => {
    const onReclassifyOtros = vi.fn();
    const categoryAnalysis = [
      { category: 'Vivienda', amount: 600, percentage: 60 },
      { category: 'Otros', amount: 100, percentage: 10 },
    ];
    render(<ChartsTab {...baseProps} categoryAnalysis={categoryAnalysis} onReclassifyOtros={onReclassifyOtros} />);

    expect(screen.queryByRole('button', { name: /reclasificar/i })).not.toBeInTheDocument();
  });
});
