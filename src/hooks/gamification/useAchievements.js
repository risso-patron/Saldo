import { useState, useEffect, useMemo } from 'react';
import { getAllMilestones } from '../../features/gamification/achievementDefinitions';

const STORAGE_KEY = 'budget_app_gamification';
const LEGACY_ACHIEVEMENTS_KEY = 'budget_app_achievements';
const WINDOW_SIZE = 14;

// Remapeo de logros retirados hacia los 4 hitos aprobados (cap 14,
// PM-RECON-002, PRE-RC-001-T5-SPEC). Todo id sin equivalente se descarta sin
// aviso — no representa ningún recurso material del usuario que preservar.
const LEGACY_ID_REMAP = {
  first_income: 'first_movement',
  first_expense: 'first_movement',
  goal_completed: 'goal_completed',
};

const emptyMilestonesState = () => ({
  first_movement: { unlockedAt: null },
  first_month_closed: { unlockedAt: null },
  goal_completed: { unlockedAt: null },
  sustained_budget: { unlockedAt: null, consecutiveMonthsCurrent: 0, lastEvaluatedMonth: null },
});

const toDayKey = (date) => date.toISOString().split('T')[0];

function loadMilestones() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return { ...emptyMilestonesState(), ...JSON.parse(saved).milestones };
    } catch (error) {
      console.error('Error cargando gamificación:', error);
    }
  }

  // Migración desde el modelo anterior (23 logros, streak, puntos) — se lee
  // una sola vez; la clave vieja no se vuelve a escribir.
  const migrated = emptyMilestonesState();
  try {
    const legacy = localStorage.getItem(LEGACY_ACHIEVEMENTS_KEY);
    if (legacy) {
      JSON.parse(legacy).forEach((entry) => {
        const newId = LEGACY_ID_REMAP[entry.id];
        if (!newId) return; // logro retirado, se descarta sin aviso
        const current = migrated[newId].unlockedAt;
        if (!current || new Date(entry.unlockedAt) < new Date(current)) {
          migrated[newId] = { ...migrated[newId], unlockedAt: entry.unlockedAt };
        }
      });
    }
  } catch (error) {
    console.error('Error migrando logros previos:', error);
  }
  return migrated;
}

/**
 * Hook de gamificación (cap 14): ventana móvil de constancia + 4 hitos
 * reales, derivados siempre de los movimientos/metas reales que recibe como
 * argumento — sin estado incremental propio, sin puntos, sin niveles, sin
 * streak clásico (PM-RECON-002, PRE-RC-001-T5-SPEC).
 */
export const useAchievements = (incomes = [], expenses = [], goalsCompletedCount = 0) => {
  const [milestones, setMilestones] = useState(loadMilestones);
  const [newAchievements, setNewAchievements] = useState([]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ milestones }));
  }, [milestones]);

  // Ventana móvil de constancia (cap 14: "cargaste movimientos 12 de los
  // últimos 14 días"). Se deriva siempre de las fechas reales de los
  // movimientos — nunca de un contador incremental — para que un día sin
  // actividad baje el número en 1, nunca lo reinicie, y para que el valor
  // coincida en cualquier dispositivo (PRE-RC-001-T5-SPEC §1/§4).
  const constancyWindow = useMemo(() => {
    const today = new Date();
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() - (WINDOW_SIZE - 1));
    const cutoffKey = toDayKey(cutoff);
    const todayKey = toDayKey(today);
    const activeDays = new Set();
    [...incomes, ...expenses].forEach((tx) => {
      if (tx.date && tx.date >= cutoffKey && tx.date <= todayKey) {
        activeDays.add(tx.date);
      }
    });
    return activeDays.size;
  }, [incomes, expenses]);

  // Verifica y desbloquea hitos cuando cambian los datos reales que evalúan
  // sus condiciones. Reactivo a `milestones` para poder chequear si un hito
  // ya está desbloqueado sin depender de una función memorizada aparte;
  // es idempotente (si no hay nada nuevo, no hace nada) así que no genera
  // un bucle.
  useEffect(() => {
    const statsForConditions = {
      totalMovements: incomes.length + expenses.length,
      goalsCompleted: goalsCompletedCount,
    };
    const newlyUnlocked = getAllMilestones().filter(
      (milestone) => !milestones[milestone.id]?.unlockedAt && milestone.condition(statsForConditions)
    );
    if (newlyUnlocked.length === 0) return;

    const unlockedAt = new Date().toISOString();
    setMilestones((prev) => {
      const next = { ...prev };
      newlyUnlocked.forEach((m) => {
        next[m.id] = { ...next[m.id], unlockedAt };
      });
      return next;
    });
    setNewAchievements(newlyUnlocked.map((m) => ({ ...m, unlockedAt })));
    setTimeout(() => setNewAchievements([]), 5000);
  }, [incomes.length, expenses.length, goalsCompletedCount, milestones]);

  return {
    milestones,
    newAchievements,
    constancyWindow,
    windowSize: WINDOW_SIZE,
    removeNewAchievement: (index) => {
      setNewAchievements((prev) => prev.filter((_, i) => i !== index));
    },
  };
};
