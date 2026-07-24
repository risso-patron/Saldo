import { useCallback, useRef, useState } from 'react';

// RC-1.7/A1 — coordinador único del sistema de feedback puramente visual
// (alert, saludo diario, logro desbloqueado, banner de bienvenida). NO
// coordina el Toast de Deshacer (pendingOperation, useTransactions.js) — ese
// conserva su propia autoridad de dominio; este hook solo se pausa/reanuda
// mientras esté activo (ver App.jsx), sin absorber su lógica.
//
// Garantiza: un único slot activo entre los 4 tipos, política FIFO cuando
// hay más de un evento en simultáneo, y ausencia de superposición. No
// cambia la identidad visual de ningún mecanismo — cada uno sigue siendo su
// propio componente con su propio JSX/estilos; este hook solo decide CUÁNDO
// le toca a cada uno.
export const FEEDBACK_DURATIONS = {
  alert: 3000,
  dailyOnboarding: 8000,
  achievement: 5000,
  welcomeBanner: 4000,
};

export const useFeedbackQueue = () => {
  const [activeItem, setActiveItem] = useState(null); // { type, payload, duration, onExpire } | null
  const queueRef = useRef([]);
  const timerRef = useRef(null);
  const pausedRef = useRef(false);
  // Espejo síncrono de activeItem — decidir si el slot está libre no puede
  // depender de leer el estado de React (asíncrono/por render).
  const activeRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Avanza al siguiente item de la cola (o lo deja vacío si no hay más, o si
  // está pausado). Se llama al expirar el timer del item activo o al
  // descartarlo manualmente — nunca hay dos timers corriendo a la vez.
  const advance = useCallback(() => {
    clearTimer();
    if (pausedRef.current) {
      activeRef.current = null;
      setActiveItem(null);
      return;
    }
    const next = queueRef.current.shift() ?? null;
    activeRef.current = next;
    setActiveItem(next);
    if (next) {
      timerRef.current = setTimeout(() => {
        next.onExpire?.();
        advance();
      }, next.duration);
    }
  }, []);

  const enqueue = useCallback((type, payload, duration, onExpire) => {
    queueRef.current.push({ type, payload, duration, onExpire });
    if (activeRef.current === null && !pausedRef.current) {
      advance();
    }
  }, [advance]);

  const dismissActive = useCallback(() => {
    activeRef.current?.onExpire?.();
    advance();
  }, [advance]);

  // Prioridad del Toast de Deshacer (pendingOperation): mientras está
  // pausado, el item activo actual sigue su curso normal (no se interrumpe
  // — Toast y el resto de mecanismos no se superponen espacialmente), pero
  // al expirar NO se promueve el siguiente de la cola hasta resume().
  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    if (activeRef.current === null) advance();
  }, [advance]);

  return { activeItem, enqueue, dismissActive, pause, resume };
};
