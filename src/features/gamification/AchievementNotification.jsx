import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { Trophy } from '@phosphor-icons/react';
import { FEEDBACK_DURATIONS } from '../../hooks/useFeedbackQueue';

/**
 * Notificación que aparece cuando se desbloquea un logro
 */
export const AchievementNotification = ({ achievement, onClose }) => {
  if (!achievement) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-20 right-4 z-50 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 dark:from-yellow-500 dark:via-orange-500 dark:to-red-500 rounded-xl shadow-2xl p-4 max-w-sm"
    >
      <div className="flex items-start gap-3">
        {/* Icono del logro con animación Simpson */}
        <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-white/20">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }}
          >
            <Trophy weight="fill" size={40} color="#F59E0B" />
          </motion.div>
        </div>
        
        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-white uppercase tracking-wide">
              Logro Desbloqueado
            </span>
          </div>
          
          <h3 className="text-white font-bold text-lg leading-tight mb-1">
            {achievement.name}
          </h3>
          
          <p className="text-white/90 text-sm">
            {achievement.description}
          </p>
        </div>
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
          aria-label="Cerrar notificación"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Barra de progreso animada — puramente visual. El descarte real (a
          los mismos 5s, FEEDBACK_DURATIONS.achievement) lo maneja el
          coordinador (RC-1.7/A1+M4) para no duplicar el temporizador. */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
      />
    </motion.div>
  );
};

AchievementNotification.propTypes = {
  achievement: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

/**
 * Contenedor de notificaciones de logro.
 *
 * RC-1.7/A1+A3: antes renderizaba TODO `achievements` apilado a la vez
 * (violaba "uno a la vez; nunca apilan" de la Design Constitution). Ahora
 * encola cada logro nuevo en el coordinador compartido (`enqueue`) y
 * renderiza únicamente el que el coordinador indica como activo — mismo
 * componente, mismos estilos/animación, solo cambia CUÁNDO se muestra.
 *
 * Siempre opera sobre `achievements[0]` (nunca por índice capturado de
 * antemano): como este componente es el único que remueve de esa lista, el
 * frente del array es siempre el próximo a procesar, sin riesgo de
 * desincronizarse si se desbloquean varios logros a la vez.
 */
export const AchievementNotifications = ({ achievements, onRemove, enqueue, activeItem, dismissActive }) => {
  const queuedIdRef = useRef(null);

  useEffect(() => {
    const front = achievements[0] ?? null;
    if (front && queuedIdRef.current !== front.id) {
      queuedIdRef.current = front.id;
      enqueue('achievement', front, FEEDBACK_DURATIONS.achievement, () => onRemove(0));
    }
    if (!front) {
      queuedIdRef.current = null;
    }
  }, [achievements, enqueue, onRemove]);

  const active = activeItem?.type === 'achievement' ? activeItem.payload : null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
      <AnimatePresence>
        {active && (
          <AchievementNotification key={active.id} achievement={active} onClose={dismissActive} />
        )}
      </AnimatePresence>
    </div>
  );
};

AchievementNotifications.propTypes = {
  achievements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemove: PropTypes.func.isRequired,
  enqueue: PropTypes.func.isRequired,
  activeItem: PropTypes.shape({
    type: PropTypes.string.isRequired,
    payload: PropTypes.object,
  }),
  dismissActive: PropTypes.func.isRequired,
};
