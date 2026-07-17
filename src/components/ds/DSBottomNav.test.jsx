import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DSBottomNav } from './DSBottomNav';

// Fundación de Diseño — Fase I-C (Saldo Design Constitution v1.2).
// Fuente: docs/design/screens/Saldo Dashboard.dc.html (mobile 390, franja
// inferior). 4 ítems fijos, sin quinto slot central (a diferencia del
// BottomNav legado que tenía un FAB central) — el FAB es un componente
// separado (DSFab).

describe('DSBottomNav (ds) — Saldo Design Constitution v1.2', () => {
  it('renderiza exactamente 4 ítems, sin quinto slot', () => {
    render(<DSBottomNav activeTab="resumen" onTabSelect={vi.fn()} />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Movimientos')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByText('Ajustes')).toBeInTheDocument();
  });

  it('el ítem activo tiene peso 600 y texto primario', () => {
    render(<DSBottomNav activeTab="graficos" onTabSelect={vi.fn()} />);
    const activeItem = screen.getByText('Insights').closest('button');
    expect(activeItem.className).toMatch(/font-semibold\b/);
    expect(activeItem.className).toMatch(/text-ds-text-primary\b/);
  });

  it('los ítems inactivos usan texto terciario', () => {
    render(<DSBottomNav activeTab="graficos" onTabSelect={vi.fn()} />);
    const inactiveItem = screen.getByText('Inicio').closest('button');
    expect(inactiveItem.className).toMatch(/text-ds-text-tertiary\b/);
    expect(inactiveItem.className).not.toMatch(/font-semibold\b/);
  });

  it('click en un ítem invoca onTabSelect con el tab correcto', async () => {
    const user = userEvent.setup();
    const onTabSelect = vi.fn();
    render(<DSBottomNav activeTab="resumen" onTabSelect={onTabSelect} />);
    await user.click(screen.getByText('Ajustes').closest('button'));
    expect(onTabSelect).toHaveBeenCalledWith('cuenta');
  });

  it('no usa framer-motion (sin atributos de animación en los ítems)', () => {
    render(<DSBottomNav activeTab="resumen" onTabSelect={vi.fn()} />);
    // Ausencia de indicador animado tipo layoutId — el DOM no debería tener
    // ningún elemento adicional flotante por ítem más allá de icono + label.
    const activeItem = screen.getByText('Inicio').closest('button');
    expect(activeItem.children.length).toBeLessThanOrEqual(2);
  });
});
