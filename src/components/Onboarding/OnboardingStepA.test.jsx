import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingStepA } from './OnboardingStepA';

// Fase 2 (tasks.md 2.1-2.2) — onboarding-flow, spec.md "Paso A — confirmación
// opcional": única pantalla, dos acciones de igual peso visual (continuar y
// saltear), "saltear" MUST NOT tratarse como acción secundaria. Copy exacto
// fuera de alcance (spec, "Fuera de alcance" > Copy) — este test no fija el
// texto de la frase, solo el contrato de las dos acciones.

describe('OnboardingStepA — task 2.1', () => {
  it('con isOpen, renderiza una única pantalla con acciones "Continuar" y "Saltear" del mismo peso (mismo className)', () => {
    render(<OnboardingStepA isOpen onContinue={vi.fn()} onSkip={vi.fn()} />);

    const continueButton = screen.getByRole('button', { name: 'Continuar' });
    const skipButton = screen.getByRole('button', { name: 'Saltear' });

    expect(continueButton).toBeInTheDocument();
    expect(skipButton).toBeInTheDocument();
    // "Saltear" no es una acción secundaria (spec) — mismo className que
    // "Continuar" prueba el mismo variant de Button sin acoplarse al nombre
    // concreto de la clase.
    expect(skipButton.className).toBe(continueButton.className);
  });

  it('con isOpen=false, no renderiza ningún botón (triangulación — Sheet cerrado)', () => {
    render(<OnboardingStepA isOpen={false} onContinue={vi.fn()} onSkip={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Saltear' })).not.toBeInTheDocument();
  });
});

describe('OnboardingStepA — task 2.2', () => {
  it('click en "Saltear" invoca onSkip', async () => {
    const user = userEvent.setup();
    const onSkip = vi.fn();
    render(<OnboardingStepA isOpen onContinue={vi.fn()} onSkip={onSkip} />);

    await user.click(screen.getByRole('button', { name: 'Saltear' }));

    expect(onSkip).toHaveBeenCalledTimes(1);
  });

  it('click en "Continuar" invoca onContinue', async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();
    render(<OnboardingStepA isOpen onContinue={onContinue} onSkip={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
