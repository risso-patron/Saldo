import { renderHook, act } from '@testing-library/react';
import { useOnboardingFlow } from './useOnboardingFlow';

// Fase 1 (tasks.md 1.3-1.7) — onboarding-flow, design.md Decisión 1.
// Patrón de test: mismo estilo que useFilters.test.jsx (renderHook +
// localStorage.getItem mockeado — setupTests.js reemplaza global.localStorage
// por un mock sin backing real). useLocalStorage prefija toda key con
// '@budgetRP_v1:' (storageEngine.js) — hay que replicar ese prefijo acá para
// simular estado precargado.
const STORAGE_PREFIX = '@budgetRP_v1:';
const userId = 'user-1';
const storageKey = `${STORAGE_PREFIX}budgetrp_onboarding_${userId}`;

describe('useOnboardingFlow — siembra (tasks.md 1.3-1.5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  // Task 1.3 — Gotcha D1 (design.md Decisión 1): con transactionsLoading en
  // true, la siembra NO debe ejecutarse aunque transactionCount ya tenga un
  // valor definido. Sembrar antes de tiempo marcaría "pending" (y le
  // mostraría el Paso A) a un usuario existente cuyos movimientos todavía no
  // terminaron de cargar.
  it('Gotcha D1: con transactionsLoading true no siembra estado en localStorage', () => {
    const { result } = renderHook(() =>
      useOnboardingFlow({ userId, transactionsLoading: true, transactionCount: 3 })
    );

    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(result.current.status).toBeNull();
  });

  // Task 1.4 — Siembra tras loading:false, ambas ramas (triangulación).
  it('siembra completed cuando transactionCount > 0 tras loading:false', () => {
    const { result } = renderHook(() =>
      useOnboardingFlow({ userId, transactionsLoading: false, transactionCount: 5 })
    );

    expect(result.current.status).toBe('completed');
    expect(result.current.isActive).toBe(false);
  });

  it('siembra pending/step A cuando transactionCount === 0 tras loading:false', () => {
    const { result } = renderHook(() =>
      useOnboardingFlow({ userId, transactionsLoading: false, transactionCount: 0 })
    );

    expect(result.current.status).toBe('pending');
    expect(result.current.step).toBe('A');
    expect(result.current.isStepA).toBe(true);
    expect(result.current.isStepB).toBe(false);
  });

  // Task 1.5 — Idempotencia (spec, Requirement Idempotencia): sembrado
  // completed, bajar transactionCount a 0 y re-renderizar NO reabre el flujo.
  it('Idempotencia: sembrado completed, bajar transactionCount a 0 no re-dispara el flujo', () => {
    const { result, rerender } = renderHook(
      ({ transactionCount }) =>
        useOnboardingFlow({ userId, transactionsLoading: false, transactionCount }),
      { initialProps: { transactionCount: 5 } }
    );

    expect(result.current.status).toBe('completed');

    rerender({ transactionCount: 0 });

    expect(result.current.status).toBe('completed');
    expect(result.current.isActive).toBe(false);
  });
});

describe('useOnboardingFlow — reanudación (tasks.md 1.6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  // Task 1.6 — LS precargado {status:'pending', step:'B'} debe reflejarse en
  // isStepB sin pasar por el Paso A (spec, Requirement Reanudación).
  it('LS con {pending, step:B} da isStepB true sin pasar por A', () => {
    localStorage.getItem.mockImplementation((key) =>
      key === storageKey
        ? JSON.stringify({ v: 1, status: 'pending', step: 'B', startedAt: 1, completedAt: null })
        : null
    );

    const { result } = renderHook(() =>
      useOnboardingFlow({ userId, transactionsLoading: false, transactionCount: 0 })
    );

    expect(result.current.isStepB).toBe(true);
    expect(result.current.isStepA).toBe(false);
  });

  // Triangulación: LS precargado en 'A' (nunca ocurre en la práctica dado que
  // A es el default de siembra, pero prueba que la reconstrucción del estado
  // desde storage no está hardcodeada a 'B').
  it('LS con {pending, step:A} da isStepA true (no siembra de nuevo)', () => {
    localStorage.getItem.mockImplementation((key) =>
      key === storageKey
        ? JSON.stringify({ v: 1, status: 'pending', step: 'A', startedAt: 1, completedAt: null })
        : null
    );

    const { result } = renderHook(() =>
      useOnboardingFlow({ userId, transactionsLoading: false, transactionCount: 0 })
    );

    expect(result.current.isStepA).toBe(true);
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});

describe('useOnboardingFlow — observabilidad, 4 transiciones (tasks.md 1.7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  it('emite onboarding:started al sembrar pending/A', () => {
    const listener = vi.fn();
    window.addEventListener('onboarding:started', listener);

    renderHook(() => useOnboardingFlow({ userId, transactionsLoading: false, transactionCount: 0 }));

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('onboarding:started', listener);
  });

  it('NO emite onboarding:started al sembrar completed (usuario existente, triangulación)', () => {
    const listener = vi.fn();
    window.addEventListener('onboarding:started', listener);

    renderHook(() => useOnboardingFlow({ userId, transactionsLoading: false, transactionCount: 5 }));

    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener('onboarding:started', listener);
  });

  it('emite onboarding:resumed al montar con estado persistido pending/B', () => {
    localStorage.getItem.mockImplementation((key) =>
      key === storageKey
        ? JSON.stringify({ v: 1, status: 'pending', step: 'B', startedAt: 1, completedAt: null })
        : null
    );
    const listener = vi.fn();
    window.addEventListener('onboarding:resumed', listener);

    renderHook(() => useOnboardingFlow({ userId, transactionsLoading: false, transactionCount: 0 }));

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('onboarding:resumed', listener);
  });

  it('skipStepA emite onboarding:skipped con {step:"A"} y avanza a step B', () => {
    const { result } = renderHook(() =>
      useOnboardingFlow({ userId, transactionsLoading: false, transactionCount: 0 })
    );
    const listener = vi.fn();
    window.addEventListener('onboarding:skipped', listener);

    act(() => {
      result.current.skipStepA();
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail).toEqual({ step: 'A' });
    expect(result.current.isStepB).toBe(true);
    window.removeEventListener('onboarding:skipped', listener);
  });

  it('skipStepA dentro de la misma sesión NO emite onboarding:resumed (triangulación — no es reanudación real)', () => {
    const { result } = renderHook(() =>
      useOnboardingFlow({ userId, transactionsLoading: false, transactionCount: 0 })
    );
    const listener = vi.fn();
    window.addEventListener('onboarding:resumed', listener);

    act(() => {
      result.current.skipStepA();
    });

    expect(listener).not.toHaveBeenCalled();
    window.removeEventListener('onboarding:resumed', listener);
  });

  it('complete emite onboarding:completed y deja status completed', () => {
    const { result } = renderHook(() =>
      useOnboardingFlow({ userId, transactionsLoading: false, transactionCount: 0 })
    );
    const listener = vi.fn();
    window.addEventListener('onboarding:completed', listener);

    act(() => {
      result.current.complete();
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('completed');
    window.removeEventListener('onboarding:completed', listener);
  });

  it('continueStepA avanza a step B sin emitir ningún evento (no está entre las 4 transiciones)', () => {
    const { result } = renderHook(() =>
      useOnboardingFlow({ userId, transactionsLoading: false, transactionCount: 0 })
    );
    const skippedListener = vi.fn();
    const resumedListener = vi.fn();
    window.addEventListener('onboarding:skipped', skippedListener);
    window.addEventListener('onboarding:resumed', resumedListener);

    act(() => {
      result.current.continueStepA();
    });

    expect(result.current.isStepB).toBe(true);
    expect(skippedListener).not.toHaveBeenCalled();
    expect(resumedListener).not.toHaveBeenCalled();
    window.removeEventListener('onboarding:skipped', skippedListener);
    window.removeEventListener('onboarding:resumed', resumedListener);
  });
});
