import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { emitOnboardingEvent } from '../utils/onboardingEvents';

// Fase 1, task 1.8 (tasks.md) — onboarding-flow, design.md Decisión 1.
// Estado propio del flujo de onboarding, persistido en localStorage,
// sembrado UNA sola vez por usuario. No deriva "onboarding pendiente" del
// evento de registro (V6: AuthContext no expone ninguno) ni de `created_at`
// (V7: contradice el spec "independientemente de cuánto tiempo pasó") — el
// único proxy disponible en la siembra es `transactionCount` (decisión
// ratificada por el PO para el riesgo E-1 — ver design.md, NO reabrir).
const VERSION = 1;

/**
 * @param {object} params
 * @param {string} params.userId - sufijo de la key de storage (scoping por cuenta, `key={user.id}` en el consumidor).
 * @param {boolean} params.transactionsLoading - la siembra espera a que sea false (Gotcha D1).
 * @param {number} params.transactionCount - SOLO se lee en la siembra, nunca después (Idempotencia).
 */
export function useOnboardingFlow({ userId, transactionsLoading, transactionCount }) {
  const storageKey = `budgetrp_onboarding_${userId}`;
  const [state, setState] = useLocalStorage(storageKey, null);

  // Valor de localStorage leído en el montaje, ANTES de que cualquier efecto
  // de este hook lo modifique — es la "foto" real con la que arrancó la
  // sesión. Necesaria para distinguir una reanudación real (la app arrancó
  // con {pending,B} ya guardado) de una transición que ocurre DENTRO de la
  // misma sesión (ej. skipStepA también deja step:'B', pero eso no es una
  // reanudación — ya se emitió 'skipped').
  const initialStateRef = useRef(state);
  const seededRef = useRef(initialStateRef.current !== null);

  // Siembra — una sola vez, cuando no había estado persistido al montar Y ya
  // se sabe si el usuario tiene movimientos. Gotcha obligatorio (design.md
  // Decisión 1): sembrar mientras transactionsLoading sigue en true marcaría
  // "pending" a un usuario existente cuyos movimientos todavía no
  // terminaron de cargar, mostrándole el Paso A indebidamente.
  useEffect(() => {
    if (seededRef.current) return;
    if (transactionsLoading) return;
    seededRef.current = true;
    const now = Date.now();
    if (transactionCount > 0) {
      // Usuario existente (proxy temporal E-1, no una identidad histórica real).
      setState({ v: VERSION, status: 'completed', step: null, startedAt: now, completedAt: now });
    } else {
      setState({ v: VERSION, status: 'pending', step: 'A', startedAt: now, completedAt: null });
      emitOnboardingEvent('onboarding:started');
    }
  }, [transactionsLoading, transactionCount, setState]);

  // Reanudación — solo si el estado YA estaba en 'pending'/'B' al momento
  // del montaje (ver initialStateRef arriba). Corre una única vez.
  useEffect(() => {
    const initial = initialStateRef.current;
    if (initial && initial.status === 'pending' && initial.step === 'B') {
      emitOnboardingEvent('onboarding:resumed');
    }
  }, []);

  const status = state?.status ?? null;
  const step = state?.step ?? null;
  const isActive = status === 'pending';
  const isStepA = isActive && step === 'A';
  const isStepB = isActive && step === 'B';

  const skipStepA = () => {
    emitOnboardingEvent('onboarding:skipped', { step: 'A' });
    setState((prev) => (prev ? { ...prev, step: 'B' } : prev));
  };

  const continueStepA = () => {
    setState((prev) => (prev ? { ...prev, step: 'B' } : prev));
  };

  // Terminal (Idempotencia, spec): una vez completado, el estado nunca vuelve
  // a mirar transactionCount — complete() es la única vía de transición a
  // 'completed' dentro de una sesión activa de onboarding.
  const complete = () => {
    setState((prev) => (prev ? { ...prev, status: 'completed', step: null, completedAt: Date.now() } : prev));
    emitOnboardingEvent('onboarding:completed');
  };

  return { status, step, isActive, isStepA, isStepB, skipStepA, continueStepA, complete };
}
