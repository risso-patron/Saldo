import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import { Omnibar } from './Omnibar';

// Checkpoint III-C.3 — cobertura SOLO de lo que este checkpoint agrega: la
// sección "Nuevo Movimiento" del Omnibar, alimentada por el parser
// determinista (newMovementParser.js). No se le da cobertura exhaustiva al
// resto de Omnibar.jsx (búsqueda de transacciones, atajos de navegación,
// índice de flechas/Enter) — eso es preexistente y no se tocó.

// CurrencyProvider hace fetch de tasas al montar — sin red en tests, cae a
// FALLBACK_RATES (mismo patrón que BudgetManager.test.jsx).
beforeEach(() => {
  global.fetch = vi.fn(() => Promise.reject(new Error('sin red en tests')));
});

const renderOmnibar = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    allTransactions: [],
    onNavigate: vi.fn(),
    onClearAll: vi.fn(),
    transactionCount: 0,
    onOpenNewMovementWithDraft: vi.fn(),
  };
  const merged = { ...defaultProps, ...props };
  const utils = render(
    <CurrencyProvider>
      <Omnibar {...merged} />
    </CurrencyProvider>
  );
  return { ...utils, props: merged };
};

describe('Omnibar — sección "Nuevo Movimiento" (Checkpoint III-C.3)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('con texto válido ("café 3.20") muestra la sección con descripción y monto correctos', () => {
    renderOmnibar();
    const input = screen.getByPlaceholderText('Busca transacciones o navega...');
    fireEvent.change(input, { target: { value: 'café 3.20' } });

    expect(screen.getByText('Nuevo Movimiento')).toBeInTheDocument();
    expect(screen.getByText(/Nuevo movimiento: café/)).toBeInTheDocument();
  });

  it('con texto inválido ("abc") NO muestra la sección "Nuevo Movimiento"', () => {
    renderOmnibar();
    const input = screen.getByPlaceholderText('Busca transacciones o navega...');
    fireEvent.change(input, { target: { value: 'abc' } });

    expect(screen.queryByText('Nuevo Movimiento')).not.toBeInTheDocument();
  });

  it('click en el ítem llama a onOpenNewMovementWithDraft con el movementDraft correcto y a onClose', () => {
    const { props } = renderOmnibar();
    const input = screen.getByPlaceholderText('Busca transacciones o navega...');
    fireEvent.change(input, { target: { value: 'uber 12' } });

    fireEvent.click(screen.getByText(/Nuevo movimiento: uber/));

    expect(props.onOpenNewMovementWithDraft).toHaveBeenCalledWith({
      activeType: 'expense',
      description: 'uber',
      amount: 12,
    });
    expect(props.onClose).toHaveBeenCalled();
  });
});
