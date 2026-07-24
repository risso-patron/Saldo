import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { HandWaving, X } from '@phosphor-icons/react';
import { FEEDBACK_DURATIONS } from '../../hooks/useFeedbackQueue';

/**
 * Muestra un "Toast" de bienvenida inteligente al abrir la app.
 * Sólo salta 1 vez al día, recordando cargar los gastos sin usar notificaciones del OS.
 *
 * RC-1.7/A1: la visibilidad efectiva y el auto-descarte pasan a coordinarse
 * vía `enqueue`/`isActive` (App.jsx, useFeedbackQueue) — evita superponerse
 * con Alert/Toast de logros/banner de bienvenida. La lógica de "una vez por
 * día" + el delay de 2s antes de ofrecerse siguen siendo responsabilidad
 * local de este componente (no son parte del "cuánto dura visible", que sí
 * pasa al coordinador).
 */
export const DailyOnboardingToast = ({ enqueue, isActive, onDismiss }) => {
  const [lastWelcomedDate, setLastWelcomedDate] = useLocalStorage('budgetrp_last_welcome_date', null);
  const [wantsToShow, setWantsToShow] = useState(false);

  useEffect(() => {
    const today = new Date().toLocaleDateString();

    // Si no ha sido bienvenido hoy, ofrecerse a los 2 segundos de entrar.
    if (lastWelcomedDate !== today) {
      const timer = setTimeout(() => {
        setWantsToShow(true);
        setLastWelcomedDate(today);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [lastWelcomedDate, setLastWelcomedDate]);

  useEffect(() => {
    if (wantsToShow) {
      enqueue('dailyOnboarding', {}, FEEDBACK_DURATIONS.dailyOnboarding, () => setWantsToShow(false));
    }
  }, [wantsToShow, enqueue]);

  if (!isActive) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm animate-fade-in-down">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-indigo-500/20 shadow-2xl p-4 rounded-2xl flex items-start gap-4">

        {/* Icon */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-inner">
          <HandWaving size={22} weight="fill" className="text-white animate-wiggle" />
        </div>

        {/* Text */}
        <div className="flex-1 pt-0.5">
          <h4 className="text-slate-800 dark:text-white font-black text-sm leading-tight flex items-center gap-1">
            ¡Hola de nuevo! ✨
          </h4>
          <p className="text-slate-500 dark:text-slate-300 text-xs mt-1 font-medium leading-relaxed">
            Un día excelente para no olvidar registrar esas pequeñas salidas y el cafecito de hoy.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-700/50 rounded-full p-1.5"
          aria-label="Cerrar saludo diario"
        >
          <X size={14} weight="bold" />
        </button>
      </div>
    </div>
  );
};

DailyOnboardingToast.propTypes = {
  enqueue: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  onDismiss: PropTypes.func.isRequired,
};
