import { useState, useEffect, useCallback } from 'react';
import { ACHIEVEMENTS, getAllAchievements, calculateLevel, getPointsForNextLevel, getLevelProgress } from '../../features/gamification/achievementDefinitions';

const STORAGE_KEY = 'budget_app_achievements';
const STATS_KEY = 'budget_app_stats';
const STREAK_KEY = 'budget_app_streak';
const MORNING_KEY = 'budget_app_morning';

/**
 * Hook para gestionar el sistema de logros y gamificación
 */
export const useAchievements = () => {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalIncomes: 0,
    totalExpenses: 0,
    totalGoals: 0,
    goalsCompleted: 0,
    goalsOnTrackDays: 0,
    currentBalance: 0,
    currentStreak: 0,
    longestStreak: 0,
    usedDarkMode: false,
    dataExported: false,
    usedAI: false,
    creditCardsAdded: 0,
    achievementsUnlocked: 0,
    morningRegistrations: 0,
    topCategoryReduced: false,
  });
  const [newAchievements, setNewAchievements] = useState([]);

  // Cargar datos desde localStorage al iniciar
  useEffect(() => {
    const savedAchievements = localStorage.getItem(STORAGE_KEY);
    const savedStats = localStorage.getItem(STATS_KEY);
    
    if (savedAchievements) {
      try {
        setUnlockedAchievements(JSON.parse(savedAchievements));
      } catch (error) {
        console.error('Error loading achievements:', error);
      }
    }
    
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
  }, []);

  // Guardar achievements cuando cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedAchievements));
  }, [unlockedAchievements]);

  // Guardar stats cuando cambien
  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  /**
   * Verifica si un logro está desbloqueado
   */
  const isAchievementUnlocked = useCallback((achievementId) => {
    return unlockedAchievements.some(a => a.id === achievementId);
  }, [unlockedAchievements]);

  /**
   * Verifica y desbloquea logros basados en las estadísticas actuales
   */
  const checkAchievements = useCallback(() => {
    const allAchievements = getAllAchievements();
    const newlyUnlocked = [];

    allAchievements.forEach(achievement => {
      // Solo verificar si no está desbloqueado
      if (!isAchievementUnlocked(achievement.id)) {
        // Verificar condición
        if (achievement.condition(stats)) {
          const unlockedAchievement = {
            ...achievement,
            unlockedAt: new Date().toISOString(),
          };
          newlyUnlocked.push(unlockedAchievement);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newlyUnlocked]);
      setNewAchievements(newlyUnlocked);
      
      // Actualizar contador de logros desbloqueados
      setStats(prev => ({
        ...prev,
        achievementsUnlocked: prev.achievementsUnlocked + newlyUnlocked.length,
      }));
      
      // Limpiar nuevos logros después de 5 segundos
      setTimeout(() => setNewAchievements([]), 5000);
      
      return newlyUnlocked;
    }
    
    return [];
  }, [stats, isAchievementUnlocked]);

  /**
   * Actualiza la racha de días consecutivos
   */
  const updateStreak = useCallback(() => {
    const streakData = localStorage.getItem(STREAK_KEY);
    const today = new Date().toDateString();
    
    if (streakData) {
      try {
        const { lastDate, currentStreak, longestStreak } = JSON.parse(streakData);
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date(today);
        
        // Calcular diferencia en días
        const diffTime = todayObj - lastDateObj;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          // Mismo día, no hacer nada
          return;
        } else if (diffDays === 1) {
          // Día consecutivo
          const newStreak = currentStreak + 1;
          const newLongest = Math.max(newStreak, longestStreak);
          
          localStorage.setItem(STREAK_KEY, JSON.stringify({
            lastDate: today,
            currentStreak: newStreak,
            longestStreak: newLongest,
          }));
          
          setStats(prev => ({ 
            ...prev,
            currentStreak: newStreak,
            longestStreak: newLongest,
          }));
        } else {
          // Se rompió la racha
          localStorage.setItem(STREAK_KEY, JSON.stringify({
            lastDate: today,
            currentStreak: 1,
            longestStreak: longestStreak,
          }));
          
          setStats(prev => ({ ...prev, currentStreak: 1 }));
        }
      } catch (error) {
        console.error('Error updating streak:', error);
      }
    } else {
      // Primera vez
      localStorage.setItem(STREAK_KEY, JSON.stringify({
        lastDate: today,
        currentStreak: 1,
        longestStreak: 1,
      }));
      
      setStats(prev => ({ ...prev, currentStreak: 1, longestStreak: 1 }));
    }
  }, []);

  /**
   * Actualiza las estadísticas y verifica logros
   */
  const updateStats = useCallback((updates) => {
    setStats(prev => ({ ...prev, ...updates }));
  }, []);

  // Verificar logros cuando cambien cualquier stat relevante
  useEffect(() => {
    checkAchievements();
  }, [
    stats.totalIncomes,
    stats.totalExpenses,
    stats.totalGoals,
    stats.goalsCompleted,
    stats.currentBalance,
    stats.creditCardsAdded,
    stats.currentStreak,
    stats.usedDarkMode,
    stats.dataExported,
    stats.usedAI,
    stats.goalsOnTrackDays,
    stats.achievementsUnlocked,
    stats.morningRegistrations,
    stats.topCategoryReduced,
    checkAchievements,
  ]);

  /**
   * Incrementa el contador de transacciones (sin closure stale)
   */
  const recordTransaction = useCallback((type) => {
    const key = type === 'income' ? 'totalIncomes' : 'totalExpenses';
    const now = new Date();
    const isMorning = now.getHours() < 12;
    const today = now.toDateString();
    const lastMorningDate = localStorage.getItem(MORNING_KEY);
    const isNewMorningDay = isMorning && lastMorningDate !== today;
    if (isNewMorningDay) localStorage.setItem(MORNING_KEY, today);
    setStats(prev => ({
      ...prev,
      [key]: prev[key] + 1,
      ...(isNewMorningDay && { morningRegistrations: (prev.morningRegistrations || 0) + 1 }),
    }));
    updateStreak();
  }, [updateStreak]);

  /**
   * Calcula puntos totales
   */
  const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

  /**
   * Calcula nivel actual
   */
  const currentLevel = calculateLevel(totalPoints);

  /**
   * Puntos para siguiente nivel
   */
  const pointsForNext = getPointsForNextLevel(totalPoints);

  /**
   * Progreso del nivel actual (0-100)
   */
  const levelProgress = getLevelProgress(totalPoints);

  /**
   * Obtiene logros por categoría
   */
  const getAchievementsByCategory = useCallback((category) => {
    return getAllAchievements().filter(a => a.category === category);
  }, []);

  /**
   * Progreso general (porcentaje de logros desbloqueados)
   */
  const overallProgress = (unlockedAchievements.length / getAllAchievements().length) * 100;

  return {
    // Estado
    unlockedAchievements,
    stats,
    newAchievements,
    
    // Métricas
    totalPoints,
    currentLevel,
    pointsForNext,
    levelProgress,
    overallProgress,
    
    // Métodos
    updateStats,
    recordTransaction,
    checkAchievements,
    isAchievementUnlocked,
    getAchievementsByCategory,
    removeNewAchievement: (index) => {
      setNewAchievements(prev => prev.filter((_, i) => i !== index));
    },
  };
};
