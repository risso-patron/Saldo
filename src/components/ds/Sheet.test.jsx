import { useRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sheet } from './Sheet';

// Design System — Saldo Design Constitution v1.2, Checkpoint III-A.
// Fuente: docs/design/screens/Saldo Nuevo Movimiento.dc.html +
// docs/design/flows/Saldo Flow 01 - Registrar Movimiento.dc.html.
// Primitiva domain-agnostic: modal/hoja centrada (desktop/tablet) o anclada
// abajo (mobile), sobre velo ds-scrim. NO conoce el contenido que envuelve.

describe('Sheet (ds) — Saldo Design Constitution v1.2', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('no renderiza nada si isOpen=false', () => {
    const { container } = render(
      <Sheet isOpen={false} onClose={vi.fn()}>
        <p>Contenido</p>
      </Sheet>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renderiza el velo y el panel si isOpen=true', () => {
    render(
      <Sheet isOpen onClose={vi.fn()}>
        <p>Contenido de la hoja</p>
      </Sheet>
    );
    expect(screen.getByTestId('sheet-scrim')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Contenido de la hoja')).toBeInTheDocument();
  });

  it('click en el velo (scrim) dispara onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Sheet isOpen onClose={onClose}>
        <p>Contenido</p>
      </Sheet>
    );
    await user.click(screen.getByTestId('sheet-scrim'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('click DENTRO del panel NO dispara onClose (propagación detenida)', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Sheet isOpen onClose={onClose}>
        <p>Contenido clickeable</p>
      </Sheet>
    );
    await user.click(screen.getByText('Contenido clickeable'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('tecla Escape dispara onClose mientras isOpen=true', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Sheet isOpen onClose={onClose}>
        <p>Contenido</p>
      </Sheet>
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('bloquea el scroll del body mientras está abierto y lo restaura al cerrar', () => {
    const { rerender } = render(
      <Sheet isOpen onClose={vi.fn()}>
        <p>Contenido</p>
      </Sheet>
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <Sheet isOpen={false} onClose={vi.fn()}>
        <p>Contenido</p>
      </Sheet>
    );
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('restaura el scroll del body al desmontar mientras estaba abierto', () => {
    const { unmount } = render(
      <Sheet isOpen onClose={vi.fn()}>
        <p>Contenido</p>
      </Sheet>
    );
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('usa el velo ds-scrim y el radio/sombra de modal en el panel', () => {
    render(
      <Sheet isOpen onClose={vi.fn()}>
        <p>Contenido</p>
      </Sheet>
    );
    expect(screen.getByTestId('sheet-scrim').className).toMatch(/bg-ds-scrim\b/);
    const panel = screen.getByRole('dialog');
    expect(panel.className).toMatch(/shadow-ds-modal\b/);
    expect(panel.className).toMatch(/rounded-t-ds-modal\b/);
    expect(panel.className).toMatch(/md:rounded-ds-modal\b/);
    expect(panel.className).toMatch(/md:max-w-\[480px\]/);
  });

  it('no usa rebotes ni escalas en la animación (prohibido por la Constitución)', () => {
    render(
      <Sheet isOpen onClose={vi.fn()}>
        <p>Contenido</p>
      </Sheet>
    );
    const panel = screen.getByRole('dialog');
    expect(panel.className).not.toMatch(/scale-/);
    expect(panel.className).not.toMatch(/bounce/);
  });

  describe('Checkpoint III-C.4 — accesibilidad: foco inicial, trampa de Tab, retorno de foco', () => {
    it('sin initialFocusRef, el foco inicial cae en el primer elemento enfocable del contenedor', async () => {
      render(
        <Sheet isOpen onClose={vi.fn()}>
          <button type="button">Primero</button>
          <button type="button">Segundo</button>
        </Sheet>
      );
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByText('Primero'));
      });
    });

    it('con initialFocusRef, el foco inicial cae en ESE elemento y no en el primero del DOM', async () => {
      function Wrapper() {
        const ref = useRef(null);
        return (
          <Sheet isOpen onClose={vi.fn()} initialFocusRef={ref}>
            <button type="button">Primero</button>
            <button type="button" ref={ref}>Segundo</button>
          </Sheet>
        );
      }
      render(<Wrapper />);
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByText('Segundo'));
      });
    });

    it('Tab desde el último elemento enfocable vuelve al primero (preventDefault, ciclo cerrado)', async () => {
      const user = userEvent.setup();
      render(
        <Sheet isOpen onClose={vi.fn()}>
          <button type="button">Primero</button>
          <button type="button">Segundo</button>
          <button type="button">Ultimo</button>
        </Sheet>
      );
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByText('Primero'));
      });

      screen.getByText('Ultimo').focus();
      await user.tab();

      expect(document.activeElement).toBe(screen.getByText('Primero'));
    });

    it('Shift+Tab desde el primer elemento enfocable va al último (preventDefault, ciclo cerrado)', async () => {
      const user = userEvent.setup();
      render(
        <Sheet isOpen onClose={vi.fn()}>
          <button type="button">Primero</button>
          <button type="button">Segundo</button>
          <button type="button">Ultimo</button>
        </Sheet>
      );
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByText('Primero'));
      });

      await user.tab({ shift: true });

      expect(document.activeElement).toBe(screen.getByText('Ultimo'));
    });

    it('al cerrar, el foco vuelve al elemento que lo tenía antes de abrir', async () => {
      const outsideButton = document.createElement('button');
      outsideButton.textContent = 'Afuera';
      document.body.appendChild(outsideButton);
      outsideButton.focus();
      expect(document.activeElement).toBe(outsideButton);

      const { rerender } = render(
        <Sheet isOpen={false} onClose={vi.fn()}>
          <button type="button">Dentro</button>
        </Sheet>
      );

      rerender(
        <Sheet isOpen onClose={vi.fn()}>
          <button type="button">Dentro</button>
        </Sheet>
      );
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByText('Dentro'));
      });

      rerender(
        <Sheet isOpen={false} onClose={vi.fn()}>
          <button type="button">Dentro</button>
        </Sheet>
      );

      expect(document.activeElement).toBe(outsideButton);
      document.body.removeChild(outsideButton);
    });

    it('si el elemento que tenía el foco ya no existe en el DOM al cerrar, el foco cae en document.body sin tirar error', async () => {
      const outsideButton = document.createElement('button');
      document.body.appendChild(outsideButton);
      outsideButton.focus();

      const { rerender } = render(
        <Sheet isOpen={false} onClose={vi.fn()}>
          <button type="button">Dentro</button>
        </Sheet>
      );
      rerender(
        <Sheet isOpen onClose={vi.fn()}>
          <button type="button">Dentro</button>
        </Sheet>
      );
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByText('Dentro'));
      });

      document.body.removeChild(outsideButton);

      expect(() => {
        rerender(
          <Sheet isOpen={false} onClose={vi.fn()}>
            <button type="button">Dentro</button>
          </Sheet>
        );
      }).not.toThrow();

      expect(document.activeElement).toBe(document.body);
    });
  });
});
