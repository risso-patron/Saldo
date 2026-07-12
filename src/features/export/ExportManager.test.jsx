// Test OBJETIVO (Fase 3, task 3.6 — debe quedar en ROJO hasta 3.7).
// ExportManager MUST inicializar su rango de exportación con el `dateRange`
// activo del PeriodContext, sin que el usuario tenga que tocar los inputs
// (spec "ExportManager usa el rango activo del dashboard" — escenario
// "Exportación sin override manual").
import { render, screen } from '@testing-library/react';
import { PeriodProvider } from '../../contexts/PeriodContext';
import { ExportManager } from './ExportManager';

vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: () => ({ hasFeature: () => true }),
}));

const selectPeriod = (year, month) => {
  localStorage.getItem.mockImplementation((key) => {
    if (key === '@budgetRP_v1:budgetrp_ui_selectedYear') return JSON.stringify(year);
    if (key === '@budgetRP_v1:budgetrp_ui_selectedMonth') return JSON.stringify(month);
    return null;
  });
};

describe('ExportManager — usa el dateRange del período global activo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicializa el rango de exportación con Marzo 2026 (período activo del dashboard), sin override manual', () => {
    selectPeriod(2026, 2); // Marzo elegido en el dashboard

    const incomes = [{ description: 'Sueldo Marzo', amount: 1000, date: '2026-03-10' }];
    const expenses = [
      { description: 'Renta Marzo', amount: 500, date: '2026-03-05', category: 'Vivienda' },
      { description: 'Renta Julio', amount: 999, date: '2026-07-05', category: 'Vivienda' }, // fuera del período, no debe contarse
    ];

    const { container } = render(
      <PeriodProvider>
        <ExportManager incomes={incomes} expenses={expenses} categoryAnalysis={[]} />
      </PeriodProvider>
    );

    const dateInputs = container.querySelectorAll('input[type="date"]');
    expect(dateInputs[0]).toHaveValue('2026-03-01');
    expect(dateInputs[1]).toHaveValue('2026-03-31');
    expect(screen.getByText(/2 transacciones/)).toBeInTheDocument();
  });
});
