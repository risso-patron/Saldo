import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AISuggestedCategory } from './AISuggestedCategory';

// Checkpoint III-A (Saldo Design Constitution v1.2) — presentación PURA.
// Responsabilidad única (PO): icono Sparkles; texto "Categoría sugerida:
// {categoría}"; acción "Cambiar"; estados visuales. NO llama a useAI() ni a
// ningún hook de datos — recibe todo por props.
// Fuente: docs/design/screens/Saldo Nuevo Movimiento.dc.html (bloque
// "Concepto" desktop, línea sparkle + "Categoría sugerida: Alimentación · Cambiar").

describe('AISuggestedCategory — presentación pura (Checkpoint III-A)', () => {
  it('no renderiza nada si category es null/undefined/vacío ("sin sugerencia no hay hueco")', () => {
    const { container: c1 } = render(<AISuggestedCategory category={null} onChangeClick={vi.fn()} />);
    expect(c1).toBeEmptyDOMElement();

    const { container: c2 } = render(<AISuggestedCategory category={undefined} onChangeClick={vi.fn()} />);
    expect(c2).toBeEmptyDOMElement();

    const { container: c3 } = render(<AISuggestedCategory category="" onChangeClick={vi.fn()} />);
    expect(c3).toBeEmptyDOMElement();
  });

  it('con category presente, renderiza ícono Sparkles + texto + chip con el nombre + "Cambiar"', () => {
    render(<AISuggestedCategory category="Alimentación" onChangeClick={vi.fn()} />);
    expect(screen.getByText('Categoría sugerida:')).toBeInTheDocument();
    expect(screen.getByText('Alimentación')).toBeInTheDocument();
    expect(screen.getByText('Cambiar')).toBeInTheDocument();
  });

  it('el ícono Sparkles mide 14px y usa text-ds-text-tertiary', () => {
    const { container } = render(<AISuggestedCategory category="Alimentación" onChangeClick={vi.fn()} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('width', '14');
    expect(icon).toHaveAttribute('height', '14');
    expect(icon.getAttribute('class')).toMatch(/text-ds-text-tertiary\b/);
  });

  it('el chip de categoría usa fondo sunken, radio control y tipografía caption/medium', () => {
    render(<AISuggestedCategory category="Alimentación" onChangeClick={vi.fn()} />);
    const chip = screen.getByText('Alimentación');
    expect(chip.className).toMatch(/bg-ds-surface-sunken\b/);
    expect(chip.className).toMatch(/rounded-ds-control\b/);
    expect(chip.className).toMatch(/text-ds-caption\b/);
    expect(chip.className).toMatch(/font-medium\b/);
    expect(chip.className).toMatch(/text-ds-text-primary\b/);
  });

  it('"Cambiar" usa color tertiary, NO acento (no es Button variant="link")', () => {
    render(<AISuggestedCategory category="Alimentación" onChangeClick={vi.fn()} />);
    const changeAction = screen.getByText('Cambiar');
    expect(changeAction.className).toMatch(/text-ds-text-tertiary\b/);
    expect(changeAction.className).not.toMatch(/text-ds-accent\b/);
  });

  it('click en "Cambiar" llama a onChangeClick', async () => {
    const user = userEvent.setup();
    const onChangeClick = vi.fn();
    render(<AISuggestedCategory category="Alimentación" onChangeClick={onChangeClick} />);
    await user.click(screen.getByText('Cambiar'));
    expect(onChangeClick).toHaveBeenCalledTimes(1);
  });

  it('sin clases prohibidas: sombras, gradientes, colores legacy (purple/violet)', () => {
    const { container } = render(<AISuggestedCategory category="Alimentación" onChangeClick={vi.fn()} />);
    const html = container.innerHTML;
    expect(html).not.toMatch(/shadow-/);
    expect(html).not.toMatch(/gradient/);
    expect(html).not.toMatch(/purple/);
    expect(html).not.toMatch(/violet/);
  });
});
