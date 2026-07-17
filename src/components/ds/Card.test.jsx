import { render, screen } from '@testing-library/react';
import { Card } from './Card';

// Fundación de Diseño — Fase I (Saldo Design Constitution v1.2).
// Superficie raised, borde 1px default, radio surface (10), padding 24 por
// defecto, SIN sombra en reposo. Slot children simple.

describe('Card (ds) — Saldo Design Constitution v1.2', () => {
  it('renderiza los children', () => {
    render(<Card>Contenido de la tarjeta</Card>);
    expect(screen.getByText('Contenido de la tarjeta')).toBeInTheDocument();
  });

  it('superficie raised, borde 1px default y radio surface (10px)', () => {
    render(<Card>x</Card>);
    const card = screen.getByText('x').closest('div');
    expect(card.className).toMatch(/bg-ds-surface-raised\b/);
    expect(card.className).toMatch(/border\b/);
    expect(card.className).toMatch(/border-ds-border\b/);
    expect(card.className).toMatch(/rounded-ds-surface\b/);
  });

  it('padding 24 (p-6) por defecto', () => {
    render(<Card>x</Card>);
    expect(screen.getByText('x').closest('div').className).toMatch(/p-6\b/);
  });

  it('acepta un padding distinto dentro de la escala', () => {
    render(<Card padding="p-4">x</Card>);
    const card = screen.getByText('x').closest('div');
    expect(card.className).toMatch(/p-4\b/);
    expect(card.className).not.toMatch(/p-6\b/);
  });

  it('SIN sombra en reposo (prohibido por la Constitución)', () => {
    render(<Card>x</Card>);
    expect(screen.getByText('x').closest('div').className).not.toMatch(/shadow-/);
  });

  it('permite className adicional sin perder los tokens base', () => {
    render(<Card className="mt-4">x</Card>);
    const card = screen.getByText('x').closest('div');
    expect(card.className).toMatch(/mt-4\b/);
    expect(card.className).toMatch(/bg-ds-surface-raised\b/);
  });
});
