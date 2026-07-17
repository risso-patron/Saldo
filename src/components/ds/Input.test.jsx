import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

// Fundación de Diseño — Fase I (Saldo Design Constitution v1.2).
// Cubre reposo, tamaños, foco, error, label asociado, disabled y el área
// táctil >=44px del Input base de src/components/ds.

describe('Input (ds) — Saldo Design Constitution v1.2', () => {
  it('reposo: fondo surface/sunken y radio de control', () => {
    render(<Input placeholder="Buscar" />);
    const input = screen.getByPlaceholderText('Buscar');
    expect(input.className).toMatch(/bg-ds-surface-sunken\b/);
    expect(input.className).toMatch(/rounded-ds-control\b/);
  });

  it('el texto tipeado usa la escala body', () => {
    render(<Input placeholder="x" />);
    expect(screen.getByPlaceholderText('x').className).toMatch(/text-ds-body\b/);
  });

  it('el placeholder usa el color terciario', () => {
    render(<Input placeholder="x" />);
    expect(screen.getByPlaceholderText('x').className).toMatch(/placeholder-ds-text-tertiary\b/);
  });

  it('tamaño standard (default) mide 36px de alto', () => {
    render(<Input placeholder="x" />);
    expect(screen.getByPlaceholderText('x').className).toMatch(/h-9\b/);
  });

  it('tamaño compact mide 32px de alto', () => {
    render(<Input placeholder="x" size="compact" />);
    expect(screen.getByPlaceholderText('x').className).toMatch(/h-8\b/);
  });

  it('tamaño prominent mide 40px de alto', () => {
    render(<Input placeholder="x" size="prominent" />);
    expect(screen.getByPlaceholderText('x').className).toMatch(/h-10\b/);
  });

  it('foco: ring 2px color acento con offset 2px', () => {
    render(<Input placeholder="x" />);
    const input = screen.getByPlaceholderText('x');
    expect(input.className).toMatch(/focus:ring-2\b/);
    expect(input.className).toMatch(/focus:ring-ds-accent\b/);
    expect(input.className).toMatch(/focus:ring-offset-2\b/);
  });

  it('label opcional: se asocia por htmlFor/id y usa estilo caption secundario', () => {
    render(<Input label="Correo electrónico" placeholder="tu@email.com" />);
    const input = screen.getByRole('textbox', { name: 'Correo electrónico' });
    expect(input).toBeInTheDocument();
    const label = screen.getByText('Correo electrónico');
    expect(label.tagName).toBe('LABEL');
    expect(label.className).toMatch(/text-ds-caption\b/);
    expect(label.className).toMatch(/text-ds-text-secondary\b/);
    expect(label).toHaveAttribute('for', input.id);
  });

  it('respeta un id explícito para la asociación label/input', () => {
    render(<Input id="email-field" label="Correo" />);
    const input = screen.getByRole('textbox', { name: 'Correo' });
    expect(input).toHaveAttribute('id', 'email-field');
  });

  it('estado error: borde state/danger, aria-invalid y mensaje caption', () => {
    render(<Input placeholder="x" error="Este campo es obligatorio" />);
    const input = screen.getByPlaceholderText('x');
    expect(input.className).toMatch(/border-ds-danger\b/);
    expect(input).toHaveAttribute('aria-invalid', 'true');

    const message = screen.getByText('Este campo es obligatorio');
    expect(message.className).toMatch(/text-ds-caption\b/);
    expect(message.className).toMatch(/text-ds-danger\b/);
    expect(input).toHaveAttribute('aria-describedby', message.id);
  });

  it('sin error no marca aria-invalid ni renderiza mensaje', () => {
    render(<Input placeholder="x" />);
    const input = screen.getByPlaceholderText('x');
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('estado disabled: aplica el token de opacidad disabled y bloquea la escritura', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="x" disabled />);
    const input = screen.getByPlaceholderText('x');
    expect(input).toBeDisabled();
    expect(input.className).toMatch(/disabled:opacity-ds-disabled\b/);
    await user.type(input, 'hola');
    expect(input).toHaveValue('');
  });

  it('el área táctil del control es >=44px aunque el input mida menos visualmente', () => {
    render(<Input placeholder="x" size="compact" />);
    const input = screen.getByPlaceholderText('x');
    // El wrapper inmediato garantiza el hit-area mínimo (44px = min-h-11 en Tailwind)
    // independientemente de la altura visual (32px) del control compact.
    expect(input.parentElement.className).toMatch(/min-h-11\b/);
  });

  it('acepta texto y dispara onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input placeholder="x" onChange={onChange} />);
    await user.type(screen.getByPlaceholderText('x'), 'a');
    expect(onChange).toHaveBeenCalled();
  });
});
