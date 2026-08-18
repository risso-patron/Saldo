import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';

// Design System — Saldo Design Constitution v1.2, Checkpoint III-A.
// Fuente: docs/design/screens/Saldo Nuevo Movimiento.dc.html (tabs
// Gasto/Ingreso). Tabs de texto subrayado, SIN píldoras ni cajas: activo
// border-bottom 2px sólido + texto primary/semibold, inactivo transparente +
// texto tertiary/normal. gap 24px.

const OPTIONS = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
];

describe('Tabs (ds) — Saldo Design Constitution v1.2', () => {
  it('renderiza cada opción como tab', () => {
    render(<Tabs options={OPTIONS} value="expense" onChange={vi.fn()} />);
    expect(screen.getByRole('tab', { name: 'Gasto' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Ingreso' })).toBeInTheDocument();
  });

  it('usa role="tablist" en el contenedor', () => {
    render(<Tabs options={OPTIONS} value="expense" onChange={vi.fn()} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('el tab activo tiene aria-selected=true y borde/color de acento visual', () => {
    render(<Tabs options={OPTIONS} value="expense" onChange={vi.fn()} />);
    const active = screen.getByRole('tab', { name: 'Gasto' });
    expect(active).toHaveAttribute('aria-selected', 'true');
    expect(active.className).toMatch(/border-b-2\b/);
    expect(active.className).toMatch(/border-ds-text-primary\b/);
    expect(active.className).toMatch(/text-ds-text-primary\b/);
    expect(active.className).toMatch(/font-semibold\b/);
  });

  it('el tab inactivo tiene aria-selected=false, borde transparente y color secondary (C-08: tertiary no cumple AA)', () => {
    render(<Tabs options={OPTIONS} value="expense" onChange={vi.fn()} />);
    const inactive = screen.getByRole('tab', { name: 'Ingreso' });
    expect(inactive).toHaveAttribute('aria-selected', 'false');
    expect(inactive.className).toMatch(/border-transparent\b/);
    expect(inactive.className).toMatch(/text-ds-text-secondary\b/);
    expect(inactive.className).not.toMatch(/font-semibold\b/);
  });

  it('click en una opción dispara onChange con el value correcto', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs options={OPTIONS} value="expense" onChange={onChange} />);
    await user.click(screen.getByRole('tab', { name: 'Ingreso' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('income');
  });

  it('sin píldoras, cajas, sombras ni fondo en el contenedor ni en los tabs', () => {
    render(<Tabs options={OPTIONS} value="expense" onChange={vi.fn()} />);
    const list = screen.getByRole('tablist');
    expect(list.className).not.toMatch(/rounded-/);
    expect(list.className).not.toMatch(/shadow-/);
    expect(list.className).not.toMatch(/bg-/);
    screen.getAllByRole('tab').forEach((tab) => {
      expect(tab.className).not.toMatch(/rounded-full\b/);
      expect(tab.className).not.toMatch(/shadow-/);
    });
  });

  it('gap de 24px entre tabs', () => {
    render(<Tabs options={OPTIONS} value="expense" onChange={vi.fn()} />);
    expect(screen.getByRole('tablist').className).toMatch(/gap-6\b/);
  });

  describe('Checkpoint III-C.4 — patrón WAI-ARIA de tabs (activación automática)', () => {
    it('roving tabindex: el tab activo tiene tabIndex=0 y el inactivo tabIndex=-1', () => {
      render(<Tabs options={OPTIONS} value="expense" onChange={vi.fn()} />);
      expect(screen.getByRole('tab', { name: 'Gasto' })).toHaveAttribute('tabIndex', '0');
      expect(screen.getByRole('tab', { name: 'Ingreso' })).toHaveAttribute('tabIndex', '-1');
    });

    it('ArrowRight desde el primer tab mueve el foco Y la selección al segundo', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Tabs options={OPTIONS} value="expense" onChange={onChange} />);

      screen.getByRole('tab', { name: 'Gasto' }).focus();
      await user.keyboard('{ArrowRight}');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('income');
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Ingreso' }));
    });

    it('ArrowRight desde el último tab hace wrap-around al primero', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Tabs options={OPTIONS} value="income" onChange={onChange} />);

      screen.getByRole('tab', { name: 'Ingreso' }).focus();
      await user.keyboard('{ArrowRight}');

      expect(onChange).toHaveBeenCalledWith('expense');
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Gasto' }));
    });

    it('ArrowLeft desde el primer tab hace wrap-around al último', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Tabs options={OPTIONS} value="expense" onChange={onChange} />);

      screen.getByRole('tab', { name: 'Gasto' }).focus();
      await user.keyboard('{ArrowLeft}');

      expect(onChange).toHaveBeenCalledWith('income');
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Ingreso' }));
    });

    it('ArrowLeft desde un tab no-primero mueve el foco Y la selección al anterior', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Tabs options={OPTIONS} value="income" onChange={onChange} />);

      screen.getByRole('tab', { name: 'Ingreso' }).focus();
      await user.keyboard('{ArrowLeft}');

      expect(onChange).toHaveBeenCalledWith('expense');
      expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Gasto' }));
    });

    it('Tab (no flecha) no cambia la selección dentro del tablist', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Tabs options={OPTIONS} value="expense" onChange={onChange} />);

      screen.getByRole('tab', { name: 'Gasto' }).focus();
      await user.keyboard('{Tab}');

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
