/**
 * Definiciones de los 4 hitos de reconocimiento financiero (cap 14, PM-RECON-002).
 * Cada hito representa un momento real de progreso citado en cap 05 — sin
 * puntos, sin niveles, sin comparación entre usuarios (PM-RECON-003/C1:
 * estos reconocimientos no constituyen gamificación tradicional).
 *
 * "first_month_closed" y "sustained_budget" quedan con condición `() => false`
 * a propósito: su definición técnica exacta no está ratificada todavía
 * (PRE-RC-001-T5-SPEC, ambigüedades #1 y #2). El hito existe en el catálogo,
 * pero no se inventa su condición de desbloqueo aquí.
 */

export const MILESTONES = {
  FIRST_MOVEMENT: {
    id: 'first_movement',
    name: 'Primer movimiento cargado',
    description: 'Registraste tu primer movimiento',
    icon: '💰',
    condition: (stats) => stats.totalMovements >= 1,
  },

  FIRST_MONTH_CLOSED: {
    id: 'first_month_closed',
    name: 'Primer mes cerrado',
    description: 'Completaste tu primer mes registrando movimientos',
    icon: '📅',
    // Pendiente de ratificación técnica — no inventar (ver comentario de arriba).
    condition: () => false,
  },

  GOAL_COMPLETED: {
    id: 'goal_completed',
    name: 'Primer objetivo cumplido',
    description: 'Completaste tu primera meta financiera',
    icon: '🎯',
    condition: (stats) => stats.goalsCompleted >= 1,
  },

  SUSTAINED_BUDGET: {
    id: 'sustained_budget',
    name: 'Primer presupuesto sostenido',
    description: '3 meses consecutivos sin superar tu límite',
    icon: '📈',
    // Pendiente de ratificación técnica — no inventar (ver comentario de arriba).
    condition: () => false,
  },
};

/**
 * Obtiene los 4 hitos como array
 */
export const getAllMilestones = () => Object.values(MILESTONES);
