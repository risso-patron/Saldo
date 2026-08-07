import { emitOnboardingEvent } from './onboardingEvents';

// Fase 1, task 1.1 (tasks.md) — onboarding-flow, Decisión 5 (design.md):
// observabilidad SIN infraestructura de analítica: un CustomEvent en window
// por transición. Este test cubre el contrato genérico de la utilidad
// (nombre + payload arbitrarios); las 4 transiciones concretas
// (started/resumed/skipped/completed) se cubren en useOnboardingFlow.test.jsx
// (task 1.7), que es quien realmente las dispara.

describe('emitOnboardingEvent', () => {
  it('despacha un CustomEvent en window con el name y el payload dados', () => {
    const listener = vi.fn();
    window.addEventListener('onboarding:started', listener);

    emitOnboardingEvent('onboarding:started', { step: 'A' });

    expect(listener).toHaveBeenCalledTimes(1);
    const receivedEvent = listener.mock.calls[0][0];
    expect(receivedEvent).toBeInstanceOf(CustomEvent);
    expect(receivedEvent.detail).toEqual({ step: 'A' });

    window.removeEventListener('onboarding:started', listener);
  });

  it('con un name distinto y sin payload, despacha CustomEvent con detail {} (triangulación)', () => {
    const listener = vi.fn();
    window.addEventListener('onboarding:completed', listener);

    emitOnboardingEvent('onboarding:completed');

    expect(listener).toHaveBeenCalledTimes(1);
    const receivedEvent = listener.mock.calls[0][0];
    expect(receivedEvent.type).toBe('onboarding:completed');
    expect(receivedEvent.detail).toEqual({});

    window.removeEventListener('onboarding:completed', listener);
  });
});
