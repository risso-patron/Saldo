import { render, screen } from '@testing-library/react';
import { DSTopBar } from './DSTopBar';

// Fundación de Diseño — Fase I-C (Saldo Design Constitution v1.2).
// Fuente: docs/design/screens/Saldo Dashboard.dc.html ("Julio 2026" —
// overline 11px, mayúscula inicial, SIN "de"). Sin saludo, sin quote, sin
// tabs, sin filtros — solo overline de período + slot `actions` (children).

describe('DSTopBar (ds) — Saldo Design Constitution v1.2', () => {
  it('muestra el overline del período con mayúscula inicial y sin "de" (locale es)', () => {
    render(<DSTopBar date={new Date(2026, 6, 17)} />);
    expect(screen.getByText('Julio 2026')).toBeInTheDocument();
  });

  it('formatea correctamente otro mes/año', () => {
    render(<DSTopBar date={new Date(2025, 0, 3)} />);
    expect(screen.getByText('Enero 2025')).toBeInTheDocument();
  });

  it('renderiza el slot actions (children) a la derecha', () => {
    render(
      <DSTopBar date={new Date(2026, 6, 17)}>
        <button>Nuevo movimiento</button>
      </DSTopBar>
    );
    expect(screen.getByRole('button', { name: 'Nuevo movimiento' })).toBeInTheDocument();
  });

  it('no renderiza saludo, quote, tabs ni filtros de año/mes', () => {
    render(<DSTopBar date={new Date(2026, 6, 17)} />);
    expect(screen.queryByText(/hola/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});
