import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import {
  Trophy, Leaf, Receipt, PiggyBank, Target, Fire, Lightning, Lock,
  Star, Sparkle, Medal, Crown, Diamond, CalendarCheck, Robot,
  CreditCard, ChartLine, ArrowFatLinesUp,
} from '@phosphor-icons/react';
import { ACHIEVEMENT_CATEGORIES, getAllAchievements } from './achievementDefinitions';

/** Mapeo de categoría → icono Phosphor */
const CATEGORY_ICON = {
  all:          Trophy,
  beginner:     Leaf,
  transactions: Receipt,
  savings:      PiggyBank,
  goals:        Target,
  streak:       Fire,
  advanced:     Lightning,
};

/** Mapeo de achievement.id → icono Phosphor específico */
const ACHIEVEMENT_ICON = {
  first_income:           ArrowFatLinesUp,
  first_expense:          Receipt,
  first_goal:             Target,
  dark_mode:              Sparkle,
  transaction_10:         CalendarCheck,
  transaction_50:         Medal,
  transaction_100:        Trophy,
  savings_1000:           Star,
  savings_5000:           Diamond,
  savings_10000:          Crown,
  goal_completed:         Target,
  goal_3_completed:       Medal,
  goal_on_track:          ChartLine,
  streak_3:               Fire,
  streak_7:               Star,
  streak_30:              Fire,
  export_data:            Receipt,
  ai_insights:            Robot,
  credit_card_manager:    CreditCard,
  budget_master:          Trophy,
};

/** Colores de acento por achievement desbloqueado */
const ACHIEVEMENT_COLOR = {
  savings:      '#F59E0B',
  goals:        '#667eea',
  streak:       '#F97316',
  transactions: '#10B981',
  beginner:     '#6EE7B7',
  advanced:     '#8B5CF6',
  all:          '#F59E0B',
};

/**
 * Tarjeta individual de logro
 */
const AchievementCard = ({ achievement, isUnlocked, unlockedAt }) => {
  return (
    <div
      className={`
        relative rounded-lg p-4 border-2 transition-all
        ${isUnlocked 
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-400 dark:border-yellow-600' 
          : 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-50'
        }
      `}
    >
      {/* Badge de puntos */}
      <div className="absolute top-2 right-2">
        <span className={`
          text-xs font-bold px-2 py-1 rounded-full
          ${isUnlocked 
            ? 'bg-yellow-400 dark:bg-yellow-600 text-gray-900' 
            : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }
        `}>
          {achievement.points} pts
        </span>
      </div>

      {/* Icono Phosphor */}
      {(() => {
        const IconComp = ACHIEVEMENT_ICON[achievement.id] || CATEGORY_ICON[achievement.category] || Star;
        const color = isUnlocked
          ? (ACHIEVEMENT_COLOR[achievement.category] || '#F59E0B')
          : '#6B7280';
        return (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
            isUnlocked
              ? 'bg-yellow-100 dark:bg-yellow-900/30'
              : 'bg-gray-200 dark:bg-gray-700'
          }`}>
            <IconComp weight="fill" size={26} color={color} />
          </div>
        );
      })()}

      {/* Nombre */}
      <h3 className={`font-bold text-lg mb-1 ${
        isUnlocked 
          ? 'text-gray-800 dark:text-white' 
          : 'text-gray-600 dark:text-gray-400'
      }`}>
        {achievement.name}
      </h3>

      {/* Descripción */}
      <p className={`text-sm ${
        isUnlocked 
          ? 'text-gray-600 dark:text-gray-300' 
          : 'text-gray-500 dark:text-gray-500'
      }`}>
        {achievement.description}
      </p>

      {/* Fecha de desbloqueo */}
      {isUnlocked && unlockedAt && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Desbloqueado: {new Date(unlockedAt).toLocaleDateString('es-ES')}
        </div>
      )}

      {/* Candado si está bloqueado */}
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 dark:bg-gray-900/20 rounded-lg">
          <Lock weight="fill" size={28} color="#9CA3AF" className="opacity-60" />
        </div>
      )}
    </div>
  );
};

AchievementCard.propTypes = {
  achievement: PropTypes.object.isRequired,
  isUnlocked: PropTypes.bool.isRequired,
  unlockedAt: PropTypes.string,
};

/**
 * Panel principal de logros
 */
export const AchievementsPanel = ({ unlockedAchievements, isAchievementUnlocked }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const allAchievements = getAllAchievements();
  
  // Filtrar logros por categoría
  const filteredAchievements = selectedCategory === 'all' 
    ? allAchievements 
    : allAchievements.filter(a => a.category === selectedCategory);

  // Calcular progreso por categoría
  const getCategoryProgress = (category) => {
    const categoryAchievements = category === 'all'
      ? allAchievements
      : allAchievements.filter(a => a.category === category);
    
    const unlocked = categoryAchievements.filter(a => isAchievementUnlocked(a.id)).length;
    return Math.round((unlocked / categoryAchievements.length) * 100);
  };

  const categories = [
    { id: 'all',                              name: 'Todos',         Icon: Trophy },
    { id: ACHIEVEMENT_CATEGORIES.BEGINNER,     name: 'Principiante',  Icon: Leaf },
    { id: ACHIEVEMENT_CATEGORIES.TRANSACTIONS, name: 'Transacciones', Icon: Receipt },
    { id: ACHIEVEMENT_CATEGORIES.SAVINGS,      name: 'Ahorros',       Icon: PiggyBank },
    { id: ACHIEVEMENT_CATEGORIES.GOALS,        name: 'Metas',         Icon: Target },
    { id: ACHIEVEMENT_CATEGORIES.STREAK,       name: 'Rachas',        Icon: Fire },
    { id: ACHIEVEMENT_CATEGORIES.ADVANCED,     name: 'Avanzado',      Icon: Lightning },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Logros
        </h2>
        
        <div className="text-right">
          <div className="text-sm text-gray-600 dark:text-gray-400">Progreso Total</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {unlockedAchievements.length} / {allAchievements.length}
          </div>
        </div>
      </div>

      {/* Filtros por categoría */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2">
          {categories.map(category => {
            const progress = getCategoryProgress(category.id);
            const isActive = selectedCategory === category.id;
            
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                  ${isActive 
                    ? 'bg-primary-600 dark:bg-primary-500 text-white shadow-md' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                <category.Icon
                  weight="fill"
                  size={15}
                  color={isActive ? '#ffffff' : ACHIEVEMENT_COLOR[category.id] || '#6B7280'}
                />
                <span>{category.name}</span>
                {category.id !== 'all' && (
                  <span className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {progress}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de logros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map(achievement => {
            const unlocked = unlockedAchievements.find(a => a.id === achievement.id);
            
            return (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={!!unlocked}
                unlockedAt={unlocked?.unlockedAt}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Mensaje si no hay logros en categoría */}
      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No hay logros en esta categoría
        </div>
      )}
    </div>
  );
};

AchievementsPanel.propTypes = {
  unlockedAchievements: PropTypes.array.isRequired,
  isAchievementUnlocked: PropTypes.func.isRequired,
};
