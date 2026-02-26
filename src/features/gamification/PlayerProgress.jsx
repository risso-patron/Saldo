import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { Fire, Star } from '@phosphor-icons/react';
import { FireWebP } from '../../components/Shared/WebPAnimation';

/**
 * Panel que muestra el progreso del usuario: nivel, puntos, racha
 */
export const PlayerProgress = ({ 
  currentLevel, 
  totalPoints, 
  pointsForNext, 
  levelProgress,
  currentStreak,
  longestStreak 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Tu Progreso
      </h2>

      <div className="space-y-6">
        {/* Nivel y Puntos */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Star weight="fill" size={36} color="#F59E0B" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Nivel</div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white">
                  {currentLevel}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Puntos</div>
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {totalPoints}
              </div>
            </div>
          </div>

          {/* Barra de progreso del nivel */}
          <div className="relative">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {Math.round(levelProgress)}% hacia Nivel {currentLevel + 1}
            </div>
            
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary-500 to-purple-500 dark:from-primary-400 dark:to-purple-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <motion.div
                  className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {pointsForNext - totalPoints} puntos restantes
            </div>
          </div>
        </div>

        {/* Racha */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {currentStreak > 0 ? (
                <FireWebP size="sm" />
              ) : (
                <Fire weight="duotone" size={32} color="#9CA3AF" />
              )}
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Racha Actual</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {currentStreak} días
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-600 dark:text-gray-400">Récord</div>
              <div className="text-xl font-bold text-gray-800 dark:text-white">
                {longestStreak} días
              </div>
            </div>
          </div>

          {/* Mensaje motivacional */}
          {currentStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3"
            >
              {currentStreak === 1 && "¡Buen comienzo! Sigue así mañana."}
              {currentStreak >= 2 && currentStreak < 7 && "¡Excelente! Vas construyendo un hábito."}
              {currentStreak >= 7 && currentStreak < 30 && "¡Increíble! Una semana completa de disciplina."}
              {currentStreak >= 30 && "¡Eres imparable! Un mes de consistencia absoluta."}
            </motion.div>
          )}
          
          {currentStreak === 0 && (
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
              Registra una transacción hoy para comenzar tu racha
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

PlayerProgress.propTypes = {
  currentLevel: PropTypes.number.isRequired,
  totalPoints: PropTypes.number.isRequired,
  pointsForNext: PropTypes.number.isRequired,
  levelProgress: PropTypes.number.isRequired,
  currentStreak: PropTypes.number.isRequired,
  longestStreak: PropTypes.number.isRequired,
};
