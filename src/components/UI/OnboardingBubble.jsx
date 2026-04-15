import PropTypes from 'prop-types';
import { X } from '@phosphor-icons/react';
import { useOnboardingTip } from '../../hooks/useOnboardingTip';

/**
 * OnboardingBubble
 * Globo de conversación para guiar a usuarios nuevos.
 * Se muestra hasta que el usuario lo descarta (una vez, para siempre).
 *
 * Props:
 *  tipId   — clave única para persistir el estado en localStorage
 *  message — texto del tip
 *  emoji   — ícono/emoji al inicio del mensaje
 *  tail    — dónde apunta la cola: 'up' (apunta a algo arriba) | 'down' (apunta a algo abajo)
 */
export function OnboardingBubble({ tipId, message, emoji = '👋', tail = 'up' }) {
  const { visible, dismiss } = useOnboardingTip(tipId);

  if (!visible) return null;

  return (
    <div className="relative my-1">
      {/* Cola apuntando hacia arriba */}
      {tail === 'up' && (
        <div className="absolute -top-1.5 left-6 w-3 h-3 bg-violet-500 rotate-45 rounded-sm" />
      )}

      <div className="flex items-start gap-2.5 bg-violet-500 text-white rounded-2xl px-4 py-3 shadow-md shadow-violet-500/25">
        <span className="text-base shrink-0 leading-tight mt-px" aria-hidden="true">
          {emoji}
        </span>
        <p className="text-xs font-semibold flex-1 leading-relaxed">
          {message}
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/35 active:bg-white/40 transition-colors ml-1 mt-px"
          aria-label="Entendido, cerrar"
        >
          <X size={10} weight="bold" />
        </button>
      </div>

      {/* Cola apuntando hacia abajo */}
      {tail === 'down' && (
        <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-violet-500 rotate-45 rounded-sm" />
      )}
    </div>
  );
}

OnboardingBubble.propTypes = {
  tipId: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  emoji: PropTypes.string,
  tail: PropTypes.oneOf(['up', 'down']),
};
