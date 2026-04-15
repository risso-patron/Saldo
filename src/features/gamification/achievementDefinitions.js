/**
 * Definiciones de todos los logros/achievements del sistema de gamificación
 * Cada logro tiene: id, nombre, descripción, icono, condición de desbloqueo, puntos
 */

export const ACHIEVEMENT_CATEGORIES = {
  BEGINNER: 'beginner',
  TRANSACTIONS: 'transactions',
  SAVINGS: 'savings',
  GOALS: 'goals',
  STREAK: 'streak',
  ADVANCED: 'advanced',
  HABIT: 'habit',
};

export const ACHIEVEMENTS = {
  // LOGROS DE PRINCIPIANTE
  FIRST_INCOME: {
    id: 'first_income',
    name: 'Primer Ingreso',
    description: 'Registra tu primer ingreso',
    icon: '💰',
    category: ACHIEVEMENT_CATEGORIES.BEGINNER,
    points: 10,
    condition: (stats) => stats.totalIncomes >= 1,
  },
  
  FIRST_EXPENSE: {
    id: 'first_expense',
    name: 'Primer Gasto',
    description: 'Registra tu primer gasto',
    icon: '💸',
    category: ACHIEVEMENT_CATEGORIES.BEGINNER,
    points: 10,
    condition: (stats) => stats.totalExpenses >= 1,
  },

  FIRST_GOAL: {
    id: 'first_goal',
    name: 'Soñador',
    description: 'Crea tu primera meta financiera',
    icon: '🎯',
    category: ACHIEVEMENT_CATEGORIES.BEGINNER,
    points: 15,
    condition: (stats) => stats.totalGoals >= 1,
  },

  DARK_MODE: {
    id: 'dark_mode',
    name: 'Modo Nocturno',
    description: 'Activa el modo oscuro',
    icon: '🌙',
    category: ACHIEVEMENT_CATEGORIES.BEGINNER,
    points: 1,
    condition: (stats) => stats.usedDarkMode === true,
  },

  // LOGROS DE TRANSACCIONES
  TRANSACTION_10: {
    id: 'transaction_10',
    name: 'Disciplinado',
    description: 'Registra 10 transacciones',
    icon: '📝',
    category: ACHIEVEMENT_CATEGORIES.TRANSACTIONS,
    points: 20,
    condition: (stats) => (stats.totalIncomes + stats.totalExpenses) >= 10,
  },

  TRANSACTION_50: {
    id: 'transaction_50',
    name: 'Detallista',
    description: 'Registra 50 transacciones',
    icon: '📊',
    category: ACHIEVEMENT_CATEGORIES.TRANSACTIONS,
    points: 50,
    condition: (stats) => (stats.totalIncomes + stats.totalExpenses) >= 50,
  },

  TRANSACTION_100: {
    id: 'transaction_100',
    name: 'Contador Profesional',
    description: 'Registra 100 transacciones',
    icon: '🏆',
    category: ACHIEVEMENT_CATEGORIES.TRANSACTIONS,
    points: 100,
    condition: (stats) => (stats.totalIncomes + stats.totalExpenses) >= 100,
  },

  // LOGROS DE AHORRO
  POSITIVE_BALANCE: {
    id: 'positive_balance',
    name: 'En Verde',
    description: 'Mantén un balance positivo',
    icon: '✅',
    category: ACHIEVEMENT_CATEGORIES.SAVINGS,
    points: 25,
    condition: (stats) => stats.currentBalance > 0,
  },

  SAVINGS_1000: {
    id: 'savings_1000',
    name: 'Ahorrista Novato',
    description: 'Alcanza $1,000 en ahorros',
    icon: '💵',
    category: ACHIEVEMENT_CATEGORIES.SAVINGS,
    points: 30,
    condition: (stats) => stats.currentBalance >= 1000,
  },

  SAVINGS_5000: {
    id: 'savings_5000',
    name: 'Ahorrista Intermedio',
    description: 'Alcanza $5,000 en ahorros',
    icon: '💎',
    category: ACHIEVEMENT_CATEGORIES.SAVINGS,
    points: 75,
    condition: (stats) => stats.currentBalance >= 5000,
  },

  SAVINGS_10000: {
    id: 'savings_10000',
    name: 'Maestro del Ahorro',
    description: 'Alcanza $10,000 en ahorros',
    icon: '👑',
    category: ACHIEVEMENT_CATEGORIES.SAVINGS,
    points: 150,
    condition: (stats) => stats.currentBalance >= 10000,
  },

  // LOGROS DE METAS
  GOAL_COMPLETED: {
    id: 'goal_completed',
    name: 'Objetivo Cumplido',
    description: 'Completa tu primera meta',
    icon: '🎉',
    category: ACHIEVEMENT_CATEGORIES.GOALS,
    points: 50,
    condition: (stats) => stats.goalsCompleted >= 1,
  },

  GOAL_3_COMPLETED: {
    id: 'goal_3_completed',
    name: 'Triatleta Financiero',
    description: 'Completa 3 metas',
    icon: '🏅',
    category: ACHIEVEMENT_CATEGORIES.GOALS,
    points: 100,
    condition: (stats) => stats.goalsCompleted >= 3,
  },

  GOAL_ON_TRACK: {
    id: 'goal_on_track',
    name: 'Bien Encaminado',
    description: 'Mantén una meta on-track durante 7 días',
    icon: '📈',
    category: ACHIEVEMENT_CATEGORIES.GOALS,
    points: 40,
    condition: (stats) => stats.goalsOnTrackDays >= 7,
  },

  // LOGROS DE RACHA
  STREAK_3: {
    id: 'streak_3',
    name: 'Constante',
    description: 'Registra transacciones 3 días seguidos',
    icon: '🔥',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    points: 40,
    condition: (stats) => stats.currentStreak >= 3,
  },

  STREAK_7: {
    id: 'streak_7',
    name: 'Semana Perfecta',
    description: 'Registra transacciones 7 días seguidos',
    icon: '⭐',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    points: 100,
    condition: (stats) => stats.currentStreak >= 7,
  },

  STREAK_30: {
    id: 'streak_30',
    name: 'Mes Imparable',
    description: 'Registra transacciones 30 días seguidos',
    icon: '💫',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    points: 300,
    condition: (stats) => stats.currentStreak >= 30,
  },

  // LOGROS DE HÁBITO
  MORNING_HABIT: {
    id: 'morning_habit',
    name: 'Mañana Financiera',
    description: 'Registra transacciones antes del mediodía 5 días',
    icon: '🌅',
    category: ACHIEVEMENT_CATEGORIES.HABIT,
    points: 40,
    condition: (stats) => (stats.morningRegistrations || 0) >= 5,
  },

  TAMED_THE_BEAST: {
    id: 'tamed_the_beast',
    name: 'Domé la Bestia',
    description: 'Reduce tu categoría de mayor gasto un 10% vs el mes anterior',
    icon: '📉',
    category: ACHIEVEMENT_CATEGORIES.HABIT,
    points: 75,
    condition: (stats) => stats.topCategoryReduced === true,
  },

  // LOGROS AVANZADOS
  EXPORT_DATA: {
    id: 'export_data',
    name: 'Archivista',
    description: 'Exporta tus datos por primera vez',
    icon: '📥',
    category: ACHIEVEMENT_CATEGORIES.ADVANCED,
    points: 3,
    condition: (stats) => stats.dataExported === true,
  },

  AI_INSIGHTS: {
    id: 'ai_insights',
    name: 'Analista IA',
    description: 'Usa las predicciones de IA',
    icon: '🤖',
    category: ACHIEVEMENT_CATEGORIES.ADVANCED,
    points: 25,
    condition: (stats) => stats.usedAI === true,
  },

  CREDIT_CARD_MANAGER: {
    id: 'credit_card_manager',
    name: 'Gestor de Crédito',
    description: 'Agrega una tarjeta de crédito',
    icon: '💳',
    category: ACHIEVEMENT_CATEGORIES.ADVANCED,
    points: 20,
    condition: (stats) => stats.creditCardsAdded >= 1,
  },

  BUDGET_MASTER: {
    id: 'budget_master',
    name: 'Maestro del Presupuesto',
    description: 'Desbloquea todos los logros básicos',
    icon: '🏆',
    category: ACHIEVEMENT_CATEGORIES.ADVANCED,
    points: 200,
    condition: (stats) => stats.achievementsUnlocked >= 15,
  },
};

/**
 * Obtiene todos los logros como array
 */
export const getAllAchievements = () => {
  return Object.values(ACHIEVEMENTS);
};

/**
 * Calcula el nivel del usuario basado en puntos totales
 */
export const calculateLevel = (totalPoints) => {
  if (totalPoints < 50) return 1;
  if (totalPoints < 150) return 2;
  if (totalPoints < 300) return 3;
  if (totalPoints < 500) return 4;
  if (totalPoints < 750) return 5;
  if (totalPoints < 1000) return 6;
  if (totalPoints < 1500) return 7;
  if (totalPoints < 2000) return 8;
  if (totalPoints < 3000) return 9;
  return 10;
};

/**
 * Calcula puntos necesarios para el siguiente nivel
 */
export const getPointsForNextLevel = (totalPoints) => {
  const thresholds = [50, 150, 300, 500, 750, 1000, 1500, 2000, 3000];
  const nextThreshold = thresholds.find(t => t > totalPoints);
  return nextThreshold || 3000;
};

/**
 * Calcula el progreso hacia el siguiente nivel (0-100)
 */
export const getLevelProgress = (totalPoints) => {
  const currentLevel = calculateLevel(totalPoints);
  if (currentLevel === 10) return 100;
  
  const thresholds = [0, 50, 150, 300, 500, 750, 1000, 1500, 2000, 3000];
  const currentThreshold = thresholds[currentLevel - 1];
  const nextThreshold = thresholds[currentLevel];
  
  const progress = ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return Math.min(100, Math.max(0, progress));
};
