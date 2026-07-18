import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';

// Design System — Saldo Design Constitution v1.2 (Checkpoint III-B).
// Fuente: docs/design/screens/Saldo Nuevo Movimiento.dc.html (sección
// "Éxito") + docs/design/flows/Saldo Flow 01 - Registrar Movimiento.dc.html
// (paso 6 "Añadir"). Primitiva genérica domain-agnostic: solo sabe mostrar
// un mensaje + una acción de texto + avisar cuando se hace click o se acaba
// el tiempo. NO sabe qué es "deshacer" ni "un movimiento" — ese cableado
// vive en App.jsx.

describe('Toast (ds) — Saldo Design Constitution v1.2', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('no renderiza nada si isOpen=false', () => {
    const { container } = render(
      <Toast isOpen={false} message="Movimiento añadido" actionLabel="Deshacer" onAction={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza el mensaje y la acción si isOpen=true', () => {
    render(
      <Toast isOpen message="Movimiento añadido" actionLabel="Deshacer" onAction={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(screen.getByText('Movimiento añadido')).toBeInTheDocument();
    expect(screen.getByText('Deshacer')).toBeInTheDocument();
  });

  it('click en la acción llama onAction', () => {
    const onAction = vi.fn();
    render(
      <Toast isOpen message="Movimiento añadido" actionLabel="Deshacer" onAction={onAction} onDismiss={vi.fn()} />
    );
    fireEvent.click(screen.getByText('Deshacer'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('tras `duration` ms llama a onDismiss automáticamente', () => {
    const onDismiss = vi.fn();
    render(
      <Toast isOpen message="Movimiento añadido" actionLabel="Deshacer" onAction={vi.fn()} onDismiss={onDismiss} duration={8000} />
    );
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(8000);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('usa duration=8000 como default', () => {
    const onDismiss = vi.fn();
    render(
      <Toast isOpen message="Movimiento añadido" actionLabel="Deshacer" onAction={vi.fn()} onDismiss={onDismiss} />
    );
    vi.advanceTimersByTime(7999);
    expect(onDismiss).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('no dispara onDismiss si isOpen vuelve a false antes de que se cumpla `duration`', () => {
    const onDismiss = vi.fn();
    const { rerender } = render(
      <Toast isOpen message="Movimiento añadido" actionLabel="Deshacer" onAction={vi.fn()} onDismiss={onDismiss} duration={8000} />
    );
    vi.advanceTimersByTime(3000);
    rerender(
      <Toast isOpen={false} message="Movimiento añadido" actionLabel="Deshacer" onAction={vi.fn()} onDismiss={onDismiss} duration={8000} />
    );
    vi.advanceTimersByTime(6000);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('no dispara onDismiss si el componente se desmonta antes de `duration`', () => {
    const onDismiss = vi.fn();
    const { unmount } = render(
      <Toast isOpen message="Movimiento añadido" actionLabel="Deshacer" onAction={vi.fn()} onDismiss={onDismiss} duration={8000} />
    );
    vi.advanceTimersByTime(3000);
    unmount();
    vi.advanceTimersByTime(6000);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('sin clases prohibidas (sombras exageradas/gradientes/animate-pulse)', () => {
    const { container } = render(
      <Toast isOpen message="Movimiento añadido" actionLabel="Deshacer" onAction={vi.fn()} onDismiss={vi.fn()} />
    );
    const html = container.innerHTML;
    expect(html).not.toMatch(/animate-pulse/);
    expect(html).not.toMatch(/bg-gradient/);
    expect(html).not.toMatch(/shadow-(premium|glass|2xl|xl)\b/);
    expect(html).not.toMatch(/scale-/);
    expect(html).not.toMatch(/bounce/);
  });

  it('el label de acción no usa clases de color acento', () => {
    render(
      <Toast isOpen message="Movimiento añadido" actionLabel="Deshacer" onAction={vi.fn()} onDismiss={vi.fn()} />
    );
    const actionEl = screen.getByText('Deshacer');
    expect(actionEl.className).not.toMatch(/text-ds-accent/);
  });

  it('el label de acción está subrayado y en blanco', () => {
    render(
      <Toast isOpen message="Movimiento añadido" actionLabel="Deshacer" onAction={vi.fn()} onDismiss={vi.fn()} />
    );
    const actionEl = screen.getByText('Deshacer');
    expect(actionEl.className).toMatch(/underline/);
    expect(actionEl.className).toMatch(/text-white/);
  });

  it('usa fondo de superficie inversa (bg-ds-surface-inverse)', () => {
    render(
      <Toast isOpen message="Movimiento añadido" actionLabel="Deshacer" onAction={vi.fn()} onDismiss={vi.fn()} />
    );
    expect(screen.getByText('Movimiento añadido').closest('[data-testid="toast"]').className).toMatch(/bg-ds-surface-inverse\b/);
  });
});
