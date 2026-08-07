import { render, screen, fireEvent } from '@testing-library/react';
import { Omnibar } from '../components/Shared/Omnibar';

// Fase 3 (tasks.md) — corrige H4 (design.md): la quick action "Mis Metas"
// del Omnibar navegaba a `planificacion` (pila de 4 módulos), no a la vista
// `metas` dedicada. spec.md "Requirement: Omnibar navega a `metas`".

vi.mock('../contexts/CurrencyContext', () => ({
  // Omnibar renderiza CurrencySelector (sección "Utilidades") cuando no hay
  // búsqueda activa — usa tanto useCurrency() como el export SUPPORTED_CURRENCIES.
  SUPPORTED_CURRENCIES: [{ code: 'USD', symbol: '$', name: 'Dólar Americano', flag: '🇺🇸' }],
  useCurrency: () => ({ selectedCurrency: 'USD', setSelectedCurrency: vi.fn(), ratesLoading: false }),
}));

describe('Omnibar — quick action "Mis Metas"', () => {
  it('invoca onNavigate("metas") y cierra el Omnibar', () => {
    const onNavigate = vi.fn();
    const onClose = vi.fn();

    render(
      <Omnibar
        isOpen={true}
        onClose={onClose}
        allTransactions={[]}
        onNavigate={onNavigate}
        onClearAll={vi.fn()}
        transactionCount={0}
        onOpenNewMovementWithDraft={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Mis Metas'));

    expect(onNavigate).toHaveBeenCalledWith('metas');
    expect(onNavigate).not.toHaveBeenCalledWith('planificacion');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('el resto de quick actions permanece intacto', () => {
    const onNavigate = vi.fn();

    render(
      <Omnibar
        isOpen={true}
        onClose={vi.fn()}
        allTransactions={[]}
        onNavigate={onNavigate}
        onClearAll={vi.fn()}
        transactionCount={0}
        onOpenNewMovementWithDraft={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('Ver Movimientos'));
    expect(onNavigate).toHaveBeenCalledWith('movimientos');

    fireEvent.click(screen.getByText('Insights'));
    expect(onNavigate).toHaveBeenCalledWith('graficos');

    fireEvent.click(screen.getByText('Herramientas'));
    expect(onNavigate).toHaveBeenCalledWith('herramientas');
  });
});
