import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpgradeModal } from './UpgradeModal';

// RC-1.7/A5 — accesibilidad de UpgradeModal (hallazgo de la auditoría de
// RC-1.6/RC-1.7: sin role/aria-modal, sin manejo de Escape, sin foco
// gestionado). Mismo comportamiento que Sheet.jsx/ConfirmDialog.jsx, sin
// cambiar la estructura visual ni funcional del modal.

describe('UpgradeModal — accesibilidad (RC-1.7/A5)', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('no renderiza nada si isOpen=false', () => {
    const { container } = render(
      <UpgradeModal isOpen={false} onClose={vi.fn()} feature="export_csv" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('expone role="dialog", aria-modal y aria-labelledby apuntando al título visible', () => {
    render(<UpgradeModal isOpen onClose={vi.fn()} feature="export_csv" />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(document.getElementById(labelId)).toHaveTextContent('Exportar tus movimientos');
  });

  it('el botón de cerrar tiene aria-label', () => {
    render(<UpgradeModal isOpen onClose={vi.fn()} feature="export_csv" />);
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
  });

  it('tecla Escape dispara onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<UpgradeModal isOpen onClose={onClose} feature="export_csv" />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('el foco inicial cae en el primer elemento enfocable del diálogo (botón Cerrar)', async () => {
    render(<UpgradeModal isOpen onClose={vi.fn()} feature="export_csv" />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cerrar' }));
    });
  });

  it('Tab desde el último elemento enfocable vuelve al primero (trampa de foco)', async () => {
    const user = userEvent.setup();
    render(<UpgradeModal isOpen onClose={vi.fn()} feature="export_csv" />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cerrar' }));
    });

    screen.getByText('Continuar con Plan Gratuito').focus();
    await user.tab();

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cerrar' }));
  });

  it('al cerrar, el foco vuelve al elemento que lo tenía antes de abrir', async () => {
    const outsideButton = document.createElement('button');
    document.body.appendChild(outsideButton);
    outsideButton.focus();

    const { rerender } = render(
      <UpgradeModal isOpen={false} onClose={vi.fn()} feature="export_csv" />
    );
    rerender(<UpgradeModal isOpen onClose={vi.fn()} feature="export_csv" />);
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cerrar' }));
    });

    rerender(<UpgradeModal isOpen={false} onClose={vi.fn()} feature="export_csv" />);
    expect(document.activeElement).toBe(outsideButton);
    document.body.removeChild(outsideButton);
  });

  it('bloquea el scroll del body mientras está abierto y lo restaura al cerrar', () => {
    const { rerender } = render(
      <UpgradeModal isOpen onClose={vi.fn()} feature="export_csv" />
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(<UpgradeModal isOpen={false} onClose={vi.fn()} feature="export_csv" />);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('conserva el comportamiento funcional: click en "Continuar con Plan Gratuito" llama onClose', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<UpgradeModal isOpen onClose={onClose} feature="export_csv" />);
    await user.click(screen.getByText('Continuar con Plan Gratuito'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
