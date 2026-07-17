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

  it('variante primary (default): fondo acento y texto blanco', () => {
    render(<Button>Confirmar</Button>);
    const btn = screen.getByRole('button', { name: 'Confirmar' });
    expect(btn.className).toMatch(/bg-ds-accent\b/);
    expect(btn.className).toMatch(/text-white\b/);
  });

  it('variante secondary: borde default, texto primario, fondo transparente', () => {
    render(<Button variant="secondary">Cancelar</Button>);
    const btn = screen.getByRole('button', { name: 'Cancelar' });
    expect(btn.className).toMatch(/border-ds-border\b/);
    expect(btn.className).toMatch(/text-ds-text-primary\b/);
    expect(btn.className).toMatch(/bg-transparent\b/);
  });

  it('variante ghost: solo texto, sin fondo ni borde', () => {
    render(<Button variant="ghost">Descartar</Button>);
    const btn = screen.getByRole('button', { name: 'Descartar' });
    expect(btn.className).toMatch(/bg-transparent\b/);
    expect(btn.className).not.toMatch(/border-ds-border\b/);
  });

  it('tamaño compact usa 32px de alto y 12px de padding horizontal', () => {
    render(<Button size="compact">Chico</Button>);
    const btn = screen.getByRole('button', { name: 'Chico' });
    expect(btn.className).toMatch(/h-8\b/);
    expect(btn.className).toMatch(/px-3\b/);
  });

  it('tamaño standard (default) usa 36px de alto y 16px de padding horizontal', () => {
    render(<Button>Medio</Button>);
    const btn = screen.getByRole('button', { name: 'Medio' });
    expect(btn.className).toMatch(/h-9\b/);
    expect(btn.className).toMatch(/px-4\b/);
  });

  it('tamaño prominent usa 40px de alto y 20px de padding horizontal', () => {
    render(<Button size="prominent">Grande</Button>);
    const btn = screen.getByRole('button', { name: 'Grande' });
    expect(btn.className).toMatch(/h-10\b/);
    expect(btn.className).toMatch(/px-5\b/);
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

  it('estado disabled: aplica opacity 0.45, marca el atributo y bloquea el click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Bloqueado</Button>);
    const btn = screen.getByRole('button', { name: 'Bloqueado' });
    expect(btn).toBeDisabled();
    expect(btn.className).toMatch(/opacity-\[0\.45\]/);
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
});
