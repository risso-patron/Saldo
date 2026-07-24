import { render, screen, fireEvent } from '@testing-library/react';
import { CreditCardManager } from './CreditCardManager';

// RC-1.6/C1 — crear una tarjeta de crédito nueva es exclusivo de PRO. La
// infraestructura de gating (useSubscription/hasFeature, UpgradeModal con
// copy para 'credit_cards') ya existía, pero CreditCardManager nunca la
// consumía — cualquier usuario, gratuito o no, podía crear tarjetas sin
// límite. Mismo patrón ya usado en ExportManager.jsx: verificar hasFeature()
// en el momento de la acción, sin bloquear el resto de la UI.

const { hasFeatureMock } = vi.hoisted(() => ({ hasFeatureMock: vi.fn() }));
vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: () => ({ hasFeature: hasFeatureMock }),
}));

describe('CreditCardManager — feature gate al crear tarjeta (RC-1.6/C1)', () => {
  const baseProps = {
    creditCards: [],
    onUpdateDebt: vi.fn(),
    onRemoveCard: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillAndSubmit = () => {
    fireEvent.click(screen.getByRole('button', { name: '+ Agregar Tarjeta de Crédito' }));
    fireEvent.change(screen.getByPlaceholderText('Ej: Visa Principal, Mastercard'), {
      target: { value: 'Visa' },
    });
    fireEvent.change(screen.getByPlaceholderText('5000'), { target: { value: '1000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Agregar Tarjeta' }));
  };

  it('usuario Free: al intentar crear una tarjeta se abre UpgradeModal y no se crea la tarjeta', () => {
    hasFeatureMock.mockReturnValue(false);
    const onAddCard = vi.fn();
    render(<CreditCardManager {...baseProps} onAddCard={onAddCard} />);

    fillAndSubmit();

    expect(onAddCard).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('💳 Tarjetas de Crédito')).toBeInTheDocument();
  });

  it('usuario PRO: la tarjeta se crea normalmente y no aparece el modal', () => {
    hasFeatureMock.mockReturnValue(true);
    const onAddCard = vi.fn(() => true);
    render(<CreditCardManager {...baseProps} onAddCard={onAddCard} />);

    fillAndSubmit();

    expect(onAddCard).toHaveBeenCalledTimes(1);
    expect(onAddCard).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Visa', limit: 1000 })
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
