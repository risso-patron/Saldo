// Tests OBJETIVO (HAL-001 parte 2 — deben quedar en ROJO hasta el fix).
// El banner de dominancia de "Otros" debe ofrecer un CTA que navegue a
// Movimientos con el filtro de categoría pre-aplicado, vía la prop
// onReclassifyOtros — sin construir un flujo de navegación propio en ChartsTab.
import { render, screen, fireEvent } from '@testing-library/react';
import { ChartsTab } from './ChartsTab';
import { CurrencyProvider } from '../../contexts/CurrencyContext';

// WRITE-DISPLAY-CURRENCY-001: ChartsTab ahora usa useCurrency() (solo para
// el KPI "Mayor categoría") — requiere CurrencyProvider en el árbol.
// CurrencyProvider hace fetch de tasas al montar — sin red en tests, cae a
// FALLBACK_RATES (mismo patrón que Omnibar.test.jsx/BudgetManager.test.jsx).
beforeEach(() => {
  global.fetch = vi.fn(() => Promise.reject(new Error('sin red en tests')));
});

// Los sub-gráficos (recharts) no son el objeto de este test y requieren
// ResizeObserver/tamaño real de layout que jsdom no provee — se stubean para
// aislar el comportamiento del banner y el CTA.
vi.mock('./BalanceDonutChart', () => ({ BalanceDonutChart: () => null }));
vi.mock('./MonthlyCashFlowChart', () => ({ MonthlyCashFlowChart: () => null }));
vi.mock('./SpendingByDayChart', () => ({ SpendingByDayChart: () => null }));
vi.mock('./CategoryBarChart', () => ({ CategoryBarChart: () => null }));

// RC-1.6/C1 (pieza 3/3): ChartsTab ahora consume useSubscription para gatear
// MonthlyCashFlowChart/SpendingByDayChart — PRO por defecto acá para no
// alterar el comportamiento de los tests preexistentes de este archivo
// (ninguno es sobre el gate). El gate en sí se cubre en su propio describe,
// más abajo, con hasFeatureMock controlado por test.
const { hasFeatureMock } = vi.hoisted(() => ({ hasFeatureMock: vi.fn(() => true) }));
vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: () => ({ hasFeature: hasFeatureMock }),
}));

const baseProps = {
  filteredIncomes: [],
  filteredExpenses: [],
  filteredTotalIncome: 1000,
  filteredTotalExpenses: 800,
};

describe('ChartsTab — CTA de reclasificación en el banner de dominancia (HAL-001 parte 2)', () => {
  beforeEach(() => {
    hasFeatureMock.mockReturnValue(true);
  });

  it('cuando "Otros" domina, muestra un CTA que llama a onReclassifyOtros al hacer click', () => {
    const onReclassifyOtros = vi.fn();
    const categoryAnalysis = [
      { category: 'Vivienda', amount: 600, percentage: 55 },
      { category: 'Otros', amount: 280, percentage: 25 },
    ];
    render(
      <CurrencyProvider>
        <ChartsTab {...baseProps} categoryAnalysis={categoryAnalysis} onReclassifyOtros={onReclassifyOtros} />
      </CurrencyProvider>
    );

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
    render(
      <CurrencyProvider>
        <ChartsTab {...baseProps} categoryAnalysis={categoryAnalysis} onReclassifyOtros={onReclassifyOtros} />
      </CurrencyProvider>
    );

    expect(screen.queryByRole('button', { name: /reclasificar/i })).not.toBeInTheDocument();
  });
});

// RC-1.6/C1 (pieza 3/3) — MonthlyCashFlowChart y SpendingByDayChart son PRO
// (decisión de producto, ver docs/technical/MONETIZATION_STRATEGY.md
// actualizado); BalanceDonutChart y CategoryBarChart permanecen libres para
// todos. Mismo patrón de gate ya usado en CreditCardManager/GoalManager.
describe('ChartsTab — gate de gráficos avanzados (RC-1.6/C1, pieza 3/3)', () => {
  const categoryAnalysis = [{ category: 'Vivienda', amount: 600, percentage: 100 }];

  it('Free: los 2 gráficos PRO muestran el badge "No disponible" en vez del gráfico real', () => {
    hasFeatureMock.mockReturnValue(false);
    render(
      <CurrencyProvider>
        <ChartsTab {...baseProps} categoryAnalysis={categoryAnalysis} />
      </CurrencyProvider>
    );

    expect(screen.getAllByText('No disponible')).toHaveLength(2);
    expect(screen.getByText('Flujo de Caja Mensual')).toBeInTheDocument();
    expect(screen.getByText('Gastos por Día de la Semana')).toBeInTheDocument();
  });

  it('Free: hacer click en "Conocer más" abre UpgradeModal con feature="advanced_charts"', () => {
    hasFeatureMock.mockReturnValue(false);
    render(
      <CurrencyProvider>
        <ChartsTab {...baseProps} categoryAnalysis={categoryAnalysis} />
      </CurrencyProvider>
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Conocer más' })[0]);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('📊 Gráficos Avanzados')).toBeInTheDocument();
  });

  it('PRO: no muestra ningún badge "No disponible" ni modal', () => {
    hasFeatureMock.mockReturnValue(true);
    render(
      <CurrencyProvider>
        <ChartsTab {...baseProps} categoryAnalysis={categoryAnalysis} />
      </CurrencyProvider>
    );

    expect(screen.queryByText('No disponible')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
