import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Star } from 'lucide-react';
import { Button } from './Button';

// Fundación de Diseño — Fase I (Saldo Design Constitution v1.2).
// Cubre variantes, tamaños, estados (disabled/focus) y ausencia de estilos
// prohibidos (sombras, escalas, gradientes) para el Button base de src/components/ds.

describe('Button (ds) — Saldo Design Constitution v1.2', () => {
  it('usa type="button" por defecto para no enviar forms sin querer', () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole('button', { name: 'Guardar' })).toHaveAttribute('type', 'button');
  });

  it('respeta un type explícito', () => {
    render(<Button type="submit">Enviar</Button>);
    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute('type', 'submit');
  });

  it('variante primary (default): fondo acento', () => {
    render(<Button>Confirmar</Button>);
    const btn = screen.getByRole('button', { name: 'Confirmar' });
    expect(btn.className).toMatch(/bg-ds-accent\b/);
  });

  it('variante secondary: borde default (la marca distintiva vs. primary/ghost)', () => {
    render(<Button variant="secondary">Cancelar</Button>);
    const btn = screen.getByRole('button', { name: 'Cancelar' });
    expect(btn.className).toMatch(/border-ds-border\b/);
  });

  it('variante ghost: sin borde (a diferencia de secondary)', () => {
    render(<Button variant="ghost">Descartar</Button>);
    const btn = screen.getByRole('button', { name: 'Descartar' });
    expect(btn.className).not.toMatch(/border-ds-border\b/);
  });

  it('tamaño compact usa 32px de alto', () => {
    render(<Button size="compact">Chico</Button>);
    expect(screen.getByRole('button', { name: 'Chico' }).className).toMatch(/h-8\b/);
  });

  it('tamaño standard (default) usa 36px de alto', () => {
    render(<Button>Medio</Button>);
    expect(screen.getByRole('button', { name: 'Medio' }).className).toMatch(/h-9\b/);
  });

  it('tamaño prominent usa 40px de alto', () => {
    render(<Button size="prominent">Grande</Button>);
    expect(screen.getByRole('button', { name: 'Grande' }).className).toMatch(/h-10\b/);
  });

  it('usa el radio de control (6px) — nunca full/píldora', () => {
    render(<Button>Radio</Button>);
    const btn = screen.getByRole('button', { name: 'Radio' });
    expect(btn.className).toMatch(/rounded-ds-control\b/);
    expect(btn.className).not.toMatch(/rounded-full\b/);
  });

  it('el label tiene peso 500 (font-medium)', () => {
    render(<Button>Peso</Button>);
    expect(screen.getByRole('button', { name: 'Peso' }).className).toMatch(/font-medium\b/);
  });

  it('renderiza un ícono Lucide opcional a 16px dentro del botón', () => {
    render(<Button icon={Star}>Favorito</Button>);
    const btn = screen.getByRole('button', { name: 'Favorito' });
    const icon = btn.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('width', '16');
    expect(icon).toHaveAttribute('height', '16');
  });

  it('estado disabled: aplica el token de opacidad disabled, marca el atributo y bloquea el click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Bloqueado</Button>);
    const btn = screen.getByRole('button', { name: 'Bloqueado' });
    expect(btn).toBeDisabled();
    expect(btn.className).toMatch(/disabled:opacity-ds-disabled\b/);
    await user.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('foco visible: ring 2px color acento con offset 2px', () => {
    render(<Button>Foco</Button>);
    const btn = screen.getByRole('button', { name: 'Foco' });
    expect(btn.className).toMatch(/focus-visible:ring-2\b/);
    expect(btn.className).toMatch(/focus-visible:ring-ds-accent\b/);
    expect(btn.className).toMatch(/focus-visible:ring-offset-2\b/);
  });

  it('no usa sombras, escalas ni gradientes en ninguna variante (prohibido por la Constitución)', () => {
    render(
      <>
        <Button variant="primary">A</Button>
        <Button variant="secondary">B</Button>
        <Button variant="ghost">C</Button>
        <Button variant="link">D</Button>
      </>
    );
    screen.getAllByRole('button').forEach((btn) => {
      expect(btn.className).not.toMatch(/shadow-/);
      expect(btn.className).not.toMatch(/scale-/);
      expect(btn.className).not.toMatch(/gradient/);
    });
  });

  it('propaga onClick cuando no está disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByRole('button', { name: 'Click' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('primary: el pressed usa un velo propio superpuesto al hover (hallazgo H29), no el mismo tono repetido', () => {
    render(<Button>Guardar</Button>);
    const btn = screen.getByRole('button', { name: 'Guardar' });
    // El hover oscurece el fondo (accent-hover); el pressed agrega ADEMÁS un
    // velo (ds-interaction-pressed) que solo se activa en :active — así
    // pressed queda visualmente distinto de hover, no idéntico.
    expect(btn.className).toMatch(/hover:bg-ds-accent-hover\b/);
    expect(btn.className).toMatch(/after:bg-ds-interaction-pressed\b/);
    expect(btn.className).toMatch(/active:after:opacity-100\b/);
  });
});

describe('Button (ds) — variante link (Fase I, hallazgo 1c)', () => {
  it('renderiza como botón accesible con el texto dado', () => {
    render(<Button variant="link">Ver todos los movimientos</Button>);
    expect(screen.getByRole('button', { name: 'Ver todos los movimientos' })).toBeInTheDocument();
  });

  it('usa color de acento en vez de subrayado, y foco visible igual que las demás variantes', () => {
    render(<Button variant="link">Revisar</Button>);
    const btn = screen.getByRole('button', { name: 'Revisar' });
    expect(btn.className).toMatch(/text-ds-accent\b/);
    expect(btn.className).not.toMatch(/underline/);
    expect(btn.className).toMatch(/focus-visible:ring-2\b/);
    expect(btn.className).toMatch(/focus-visible:ring-ds-accent\b/);
    expect(btn.className).toMatch(/focus-visible:ring-offset-2\b/);
  });

  it('tono danger: texto ds-danger (p.ej. "Eliminar" del Historial)', () => {
    render(<Button variant="link" tone="danger">Eliminar</Button>);
    const btn = screen.getByRole('button', { name: 'Eliminar' });
    expect(btn.className).toMatch(/text-ds-danger\b/);
    expect(btn.className).not.toMatch(/text-ds-accent\b/);
  });

  it('sin clases de caja: ningún tamaño (compact/standard/prominent) le agrega altura fija ni padding', () => {
    ['compact', 'standard', 'prominent', undefined].forEach((size) => {
      const { unmount } = render(
        <Button variant="link" size={size}>
          Descartar
        </Button>
      );
      const btn = screen.getByRole('button', { name: 'Descartar' });
      expect(btn.className).not.toMatch(/\bh-(8|9|10)\b/);
      expect(btn.className).not.toMatch(/\bpx-(3|4|5)\b/);
      unmount();
    });
  });
});
