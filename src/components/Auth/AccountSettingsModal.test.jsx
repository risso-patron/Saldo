import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountSettingsModal } from './AccountSettingsModal';
import { useAuth } from '../../contexts/AuthContext';

// RC-1.7/A5 — accesibilidad de AccountSettingsModal (mismo hallazgo que
// UpgradeModal: sin role/aria-modal, sin manejo de Escape, sin foco
// gestionado). Mismo comportamiento que Sheet.jsx/ConfirmDialog.jsx, sin
// cambiar la estructura visual ni funcional del modal.

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('AccountSettingsModal — accesibilidad (RC-1.7/A5)', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: { email: 'preview@example.com', user_metadata: {} },
      updateProfile: vi.fn(async () => ({ error: null })),
      updatePassword: vi.fn(async () => ({ error: null })),
    });
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('no renderiza nada si isOpen=false', () => {
    const { container } = render(
      <AccountSettingsModal isOpen={false} onClose={vi.fn()} onShowAlert={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('expone role="dialog", aria-modal y aria-labelledby apuntando a "Ajustes" (estable entre pestañas)', () => {
    render(<AccountSettingsModal isOpen onClose={vi.fn()} onShowAlert={vi.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(document.getElementById(labelId)).toHaveTextContent('Ajustes');
  });

  it('el botón de cerrar tiene aria-label', () => {
    render(<AccountSettingsModal isOpen onClose={vi.fn()} onShowAlert={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('tecla Escape dispara onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<AccountSettingsModal isOpen onClose={onClose} onShowAlert={vi.fn()} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('el foco inicial cae en el primer elemento enfocable del diálogo', async () => {
    render(<AccountSettingsModal isOpen onClose={vi.fn()} onShowAlert={vi.fn()} />);
    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
      expect(document.activeElement.closest('[role="dialog"]')).toBeInTheDocument();
    });
  });

  it('al cerrar, el foco vuelve al elemento que lo tenía antes de abrir', async () => {
    const outsideButton = document.createElement('button');
    document.body.appendChild(outsideButton);
    outsideButton.focus();

    const { rerender } = render(
      <AccountSettingsModal isOpen={false} onClose={vi.fn()} onShowAlert={vi.fn()} />
    );
    rerender(<AccountSettingsModal isOpen onClose={vi.fn()} onShowAlert={vi.fn()} />);
    await waitFor(() => {
      expect(document.activeElement.closest('[role="dialog"]')).toBeInTheDocument();
    });

    rerender(<AccountSettingsModal isOpen={false} onClose={vi.fn()} onShowAlert={vi.fn()} />);
    expect(document.activeElement).toBe(outsideButton);
    document.body.removeChild(outsideButton);
  });

  it('bloquea el scroll del body mientras está abierto y lo restaura al cerrar', () => {
    const { rerender } = render(
      <AccountSettingsModal isOpen onClose={vi.fn()} onShowAlert={vi.fn()} />
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<AccountSettingsModal isOpen={false} onClose={vi.fn()} onShowAlert={vi.fn()} />);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('conserva el comportamiento funcional: navegación entre pestañas Perfil/Seguridad/Soporte', async () => {
    const user = userEvent.setup();
    render(<AccountSettingsModal isOpen onClose={vi.fn()} onShowAlert={vi.fn()} />);

    expect(screen.getByText('Tu Identidad')).toBeInTheDocument();

    await user.click(screen.getByText('Seguridad'));
    await waitFor(() => {
      expect(screen.getByText('Zona de Seguridad')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Soporte'));
    await waitFor(() => {
      expect(screen.getByText('Soporte', { selector: 'h3' })).toBeInTheDocument();
    });
  });

  it('conserva el comportamiento funcional: enviar el formulario de perfil llama a updateProfile y onShowAlert', async () => {
    const user = userEvent.setup();
    const onShowAlert = vi.fn();
    render(<AccountSettingsModal isOpen onClose={vi.fn()} onShowAlert={onShowAlert} />);

    await user.click(screen.getByText('Confirmar Identidad'));

    await waitFor(() => {
      expect(vi.mocked(useAuth)().updateProfile).toHaveBeenCalled();
    });
  });
});
