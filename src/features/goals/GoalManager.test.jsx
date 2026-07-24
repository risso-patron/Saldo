import { render, screen, fireEvent } from '@testing-library/react';
import { GoalManager } from './GoalManager';

// RC-1.6/C1 (pieza 2) — crear una meta que supere el límite de 3 (Free) es
// exclusivo de PRO. La infraestructura de gating (useSubscription/hasFeature,
// copy de UpgradeModal para 'unlimited_goals') ya existía, pero GoalManager
// nunca la consumía — cualquier usuario podía crear metas sin límite. Regla
// objetiva ya documentada en PricingPlans.jsx ("Hasta 3 metas financieras" /
// "Metas financieras ilimitadas"). Mismo patrón ya usado en
// CreditCardManager.jsx (RC-1.6/C1, pieza 1).

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key) => key, i18n: { language: 'es' } }),
}));

const { hasFeatureMock } = vi.hoisted(() => ({ hasFeatureMock: vi.fn() }));
vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: () => ({ hasFeature: hasFeatureMock }),
}));

const makeGoal = (i) => ({
  id: `goal-${i}`,
  name: `Meta ${i}`,
  targetAmount: 1000,
  currentAmount: 0,
  targetDate: '2030-01-01',
  createdAt: new Date().toISOString(),
});

describe('GoalManager — feature gate al crear meta (RC-1.6/C1, pieza 2)', () => {
  const baseProps = {
    onUpdateProgress: vi.fn(),
    onDeleteGoal: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillAndSubmit = (container) => {
    fireEvent.click(screen.getByRole('button', { name: '+ Agregar Nueva Meta' }));
    fireEvent.change(
      screen.getByPlaceholderText('Ej: Vacaciones en Europa, Fondo de Emergencia'),
      { target: { value: 'Meta nueva' } }
    );
    fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '2000' } });
    fireEvent.change(container.querySelector('input[type="date"]'), {
      target: { value: '2030-06-15' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear Meta' }));
  };

  it('Free con menos de 3 metas: crea la meta normalmente, sin modal', () => {
    hasFeatureMock.mockReturnValue(false);
    const onAddGoal = vi.fn();
    const { container } = render(
      <GoalManager
        {...baseProps}
        goals={[makeGoal(1), makeGoal(2)]}
        onAddGoal={onAddGoal}
      />
    );

    fillAndSubmit(container);

    expect(onAddGoal).toHaveBeenCalledTimes(1);
    expect(onAddGoal).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Meta nueva', targetAmount: 2000 })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('Free con 3 metas: al intentar crear la 4ª se abre UpgradeModal y no se crea', () => {
    hasFeatureMock.mockReturnValue(false);
    const onAddGoal = vi.fn();
    const { container } = render(
      <GoalManager
        {...baseProps}
        goals={[makeGoal(1), makeGoal(2), makeGoal(3)]}
        onAddGoal={onAddGoal}
      />
    );

    fillAndSubmit(container);

    expect(onAddGoal).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('🎯 Metas Ilimitadas')).toBeInTheDocument();
  });

  it('PRO con 3 o más metas: crea normalmente, sin modal', () => {
    hasFeatureMock.mockReturnValue(true);
    const onAddGoal = vi.fn();
    const { container } = render(
      <GoalManager
        {...baseProps}
        goals={[makeGoal(1), makeGoal(2), makeGoal(3)]}
        onAddGoal={onAddGoal}
      />
    );

    fillAndSubmit(container);

    expect(onAddGoal).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
