import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DSFab } from './DSFab';

// Fundación de Diseño — Fase I-C (Saldo Design Constitution v1.2).
// Fuente: docs/design/screens/Saldo Dashboard.dc.html (mobile 390). Único
// FAB del producto: círculo 56px, ds-accent, icono Plus. Acción = la misma
// que el FAB legado (onQuickAction → flujo de registro de movimiento).

describe('DSFab (ds) — Saldo Design Constitution v1.2', () => {
  it('renderiza un botón accesible con aria-label', () => {
    render(<DSFab onAction={vi.fn()} />);
    expect(screen.getByRole('button', { name: /nuevo movimiento/i })).toBeInTheDocument();
  });

  it('invoca onAction al hacer click', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<DSFab onAction={onAction} />);
    await user.click(screen.getByRole('button', { name: /nuevo movimiento/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('usa fondo ds-accent y radio full (círculo)', () => {
    render(<DSFab onAction={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /nuevo movimiento/i });
    expect(btn.className).toMatch(/bg-ds-accent\b/);
    expect(btn.className).toMatch(/rounded-ds-full\b/);
  });

  it('renderiza el icono Plus dentro del botón', () => {
    render(<DSFab onAction={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /nuevo movimiento/i });
    expect(btn.querySelector('svg')).toBeInTheDocument();
  });
});
