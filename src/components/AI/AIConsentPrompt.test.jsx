import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AIConsentPrompt } from './AIConsentPrompt';

// Tarea 4.5/4.6 — consentimiento just-in-time (spec.md Área 6, design.md
// §3.2, proposal.md §7.1). Copy EXACTO, sin nombrar al proveedor.

describe('AIConsentPrompt (proposal.md §7.1)', () => {
  it('muestra el copy exacto de la propuesta, sin nombrar al proveedor', () => {
    render(<AIConsentPrompt onAccept={vi.fn()} onDecline={vi.fn()} />);

    expect(
      screen.getByText(
        'Para sugerirte la categoría, Saldo le muestra la descripción de este movimiento a un servicio que nos ayuda con eso. Vos decidís.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/groq/i)).not.toBeInTheDocument();
  });

  it('tocar "Activar" llama a onAccept', async () => {
    const user = userEvent.setup();
    const onAccept = vi.fn();
    render(<AIConsentPrompt onAccept={onAccept} onDecline={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Activar' }));

    expect(onAccept).toHaveBeenCalledTimes(1);
  });

  it('tocar "Ahora no" llama a onDecline', async () => {
    const user = userEvent.setup();
    const onDecline = vi.fn();
    render(<AIConsentPrompt onAccept={vi.fn()} onDecline={onDecline} />);

    await user.click(screen.getByRole('button', { name: 'Ahora no' }));

    expect(onDecline).toHaveBeenCalledTimes(1);
  });
});
