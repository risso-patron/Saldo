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

// UX-001 — la sección "Utilidades" (Moneda + Vaciar datos locales) se oculta
// mientras hay una búsqueda activa (isQuerying), y reaparece al vaciar el
// input. No participaba del índice de teclado antes del cambio y sigue sin
// participar (ahora, directamente, ni se monta mientras se busca).
describe('Omnibar — sección "Utilidades" se oculta durante la búsqueda (UX-001)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('Omnibar recién abierto (sin búsqueda): "Utilidades" está visible', () => {
    renderOmnibar();
    expect(screen.getByText('Utilidades')).toBeInTheDocument();
    expect(screen.getByText('Moneda')).toBeInTheDocument();
  });

  it('al escribir cualquier texto, "Utilidades" desaparece', () => {
    renderOmnibar();
    const input = screen.getByPlaceholderText('Busca transacciones o navega...');
    fireEvent.change(input, { target: { value: 'netflix' } });

    expect(screen.queryByText('Utilidades')).not.toBeInTheDocument();
    expect(screen.queryByText('Moneda')).not.toBeInTheDocument();
  });

  it('al vaciar el input tras haber escrito, "Utilidades" reaparece', () => {
    renderOmnibar();
    const input = screen.getByPlaceholderText('Busca transacciones o navega...');
    fireEvent.change(input, { target: { value: 'netflix' } });
    expect(screen.queryByText('Utilidades')).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: '' } });
    expect(screen.getByText('Utilidades')).toBeInTheDocument();
  });

  it('"Vaciar datos locales" desaparece junto con Moneda al buscar (mismo bloque, mismo destino)', () => {
    renderOmnibar({ transactionCount: 5 });
    expect(screen.getByText('Vaciar datos locales')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Busca transacciones o navega...');
    fireEvent.change(input, { target: { value: 'netflix' } });

    expect(screen.queryByText('Vaciar datos locales')).not.toBeInTheDocument();
  });

  it('regresión: Atajos de Navegación y Transacciones Encontradas siguen funcionando igual mientras se busca', () => {
    renderOmnibar({
      allTransactions: [
        { id: 'tx-1', description: 'Netflix mensual', category: 'Entretenimiento', amount: 15, type: 'expense', date: '2026-07-01' },
      ],
    });
    const input = screen.getByPlaceholderText('Busca transacciones o navega...');
    fireEvent.change(input, { target: { value: 'netflix' } });

    expect(screen.getByText('Transacciones Encontradas')).toBeInTheDocument();
    expect(screen.getByText('Netflix mensual')).toBeInTheDocument();
    // "Utilidades" sigue sin aparecer aunque sí haya resultados de búsqueda.
    expect(screen.queryByText('Utilidades')).not.toBeInTheDocument();
  });

  it('regresión (pedido explícito del PO): cerrar y volver a abrir el Omnibar restablece searchTerm y "Utilidades" vuelve a mostrarse', () => {
    const { rerender, props } = renderOmnibar();
    const input = screen.getByPlaceholderText('Busca transacciones o navega...');
    fireEvent.change(input, { target: { value: 'netflix' } });
    expect(screen.queryByText('Utilidades')).not.toBeInTheDocument();

    // Cerrar (isOpen=false -> el componente retorna null)
    rerender(
      <CurrencyProvider>
        <Omnibar {...props} isOpen={false} />
      </CurrencyProvider>
    );
    expect(screen.queryByPlaceholderText('Busca transacciones o navega...')).not.toBeInTheDocument();

    // Reabrir (isOpen=true -> el useEffect de apertura resetea searchTerm)
    rerender(
      <CurrencyProvider>
        <Omnibar {...props} isOpen={true} />
      </CurrencyProvider>
    );

    expect(screen.getByPlaceholderText('Busca transacciones o navega...')).toHaveValue('');
    expect(screen.getByText('Utilidades')).toBeInTheDocument();
    expect(screen.getByText('Moneda')).toBeInTheDocument();
  });
});
