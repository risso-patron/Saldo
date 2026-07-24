import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

// RC-1.7/M2 — ConfirmDialog ya tenía role/aria-modal/aria-labelledby/
// aria-describedby, Escape y foco inicial en "Cancelar", pero le faltaba
// trampa de foco (Tab podía escapar del diálogo hacia la página detrás del
// backdrop). Se reemplazan el useEffect de Escape y el autoFocus manuales
// por useModalA11y (mismo hook ya probado en UpgradeModal/
// AccountSettingsModal, RC-1.7/A5), que además agrega focus-restore-on-close
// y bloqueo de scroll del body — comportamientos ausentes hoy, no nombrados
// por el título de M2 pero aprobados junto con la reutilización del hook.

describe('ConfirmDialog — accesibilidad (RC-1.7/M2)', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  const baseProps = {
    title: '¿Eliminar movimiento?',
    message: 'Esta acción no se puede deshacer.',
    onConfirm: () => {},
    onCancel: () => {},
  };

  it('no renderiza nada si isOpen=false', () => {
    const { container } = render(<ConfirmDialog {...baseProps} isOpen={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('expone role="dialog", aria-modal y aria-labelledby apuntando al título visible', () => {
    render(<ConfirmDialog {...baseProps} isOpen />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(document.getElementById(labelId)).toHaveTextContent('¿Eliminar movimiento?');
  });

  it('tecla Escape dispara onCancel', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} isOpen onCancel={onCancel} />);
    await user.keyboard('{Escape}');
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('el foco inicial cae en el primer elemento enfocable del diálogo (botón Cancelar)', async () => {
    render(<ConfirmDialog {...baseProps} isOpen />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancelar' }));
    });
  });

  it('Tab desde el último elemento enfocable vuelve al primero (trampa de foco)', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...baseProps} isOpen />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancelar' }));
    });

    screen.getByRole('button', { name: 'Eliminar' }).focus();
    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancelar' }));
  });

  it('Shift+Tab desde el primer elemento enfocable vuelve al último (trampa de foco)', async () => {
    const user = userEvent.setup();
    render(<ConfirmDialog {...baseProps} isOpen />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancelar' }));
    });

    await user.tab({ shift: true });

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Eliminar' }));
  });

  it('al cerrar, el foco vuelve al elemento que lo tenía antes de abrir', async () => {
    const outsideButton = document.createElement('button');
    document.body.appendChild(outsideButton);
    outsideButton.focus();

    const { rerender } = render(<ConfirmDialog {...baseProps} isOpen={false} />);
    rerender(<ConfirmDialog {...baseProps} isOpen />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancelar' }));
    });

    rerender(<ConfirmDialog {...baseProps} isOpen={false} />);
    expect(document.activeElement).toBe(outsideButton);
    document.body.removeChild(outsideButton);
  });

  it('bloquea el scroll del body mientras está abierto y lo restaura al cerrar', () => {
    const { rerender } = render(<ConfirmDialog {...baseProps} isOpen />);
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<ConfirmDialog {...baseProps} isOpen={false} />);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('conserva el comportamiento funcional: click en "Eliminar" llama onConfirm, click en "Cancelar" llama onCancel', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} isOpen onConfirm={onConfirm} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('respeta confirmLabel/cancelLabel personalizados y variant default', () => {
    render(
      <ConfirmDialog
        {...baseProps}
        isOpen
        confirmLabel="Continuar"
        cancelLabel="Volver"
        variant="default"
      />
    );
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
  });
});
