import PropTypes from 'prop-types';
import { Fire, Plus, TrendUp, TrendDown, CheckCircle, Circle } from '@phosphor-icons/react';
import { formatCurrency } from '../../utils/formatters';

/**
 * HabitDailyCard
 *
 * Protagonista del tab "Inicio". Responde a tres preguntas en este orden:
 *  1. ¿Ya registraste hoy?         → racha + botón de acción
 *  2. ¿En qué se me va el dinero?  → categoría crítica del mes
 *  3. ¿Voy mejorando?              → tendencia mes a mes
 */
export function HabitDailyCard({
  currentStreak = 0,
  longestStreak = 0,
  allTransactions = [],
  categoryAnalysis = [],
  monthlyComparison = {},
  monthIncome = 0,
  monthExpenses = 0,
  onAddExpense,
  onAddIncome,
}) {
  // ── ¿Registré algo hoy? ───────────────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0];
  const registeredToday = allTransactions.some(
    (tx) => tx.date === today || (tx.createdAt && tx.createdAt.startsWith(today))
  );

  // ── Saldo del mes ────────────────────────────────────────────────────────
  const monthBalance = monthIncome - monthExpenses;
  const hasMonthData = monthIncome > 0 || monthExpenses > 0;

  // ── Categoría crítica del mes ─────────────────────────────────────────────
  const topCategory = categoryAnalysis[0] ?? null;

  // ── Tendencia mes a mes (gastos totales) ──────────────────────────────────
  const { prevTotalExpenses = 0, filteredTotalExpenses = 0 } = monthlyComparison;
  const hasPrevData = prevTotalExpenses > 0;
  const expenseDelta =
    hasPrevData
      ? Math.round(((filteredTotalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100)
      : null;
  const isImproving = expenseDelta !== null && expenseDelta < 0;
  const isWorse = expenseDelta !== null && expenseDelta > 0;

  // ── Mensaje de racha ──────────────────────────────────────────────────────
  function streakMessage(streak) {
    if (streak === 0) return '¡Empieza hoy tu racha!';
    if (streak < 3) return `${streak} día${streak > 1 ? 's' : ''} seguidos — ¡sigue así!`;
    if (streak < 7) return `🔥 ${streak} días — vas muy bien`;
    if (streak < 30) return `⭐ ${streak} días — ¡semana perfecta!`;
    return `💫 ${streak} días — ¡imparable!`;
  }

  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-3xl p-5 sm:p-7 space-y-5 shadow-sm">

      {/* ── Sección 1: Racha + acción del día ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Racha */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            currentStreak >= 7
              ? 'bg-amber-400/20 text-amber-500'
              : currentStreak >= 3
              ? 'bg-orange-400/20 text-orange-500'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
          }`}>
            <Fire size={26} weight={currentStreak > 0 ? 'fill' : 'regular'} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {currentStreak}
              <span className="text-sm font-bold text-slate-400 ml-1">
                / {longestStreak} mejor
              </span>
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              {streakMessage(currentStreak)}
            </p>
          </div>
        </div>

        {/* Estado de hoy */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold shrink-0 ${
          registeredToday
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500'
        }`}>
          {registeredToday
            ? <><CheckCircle size={15} weight="fill" /> Hoy registrado</>
            : <><Circle size={15} /> Sin registros hoy</>
          }
        </div>
      </div>

      {/* ── Botones de acción ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAddExpense}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-sm transition-colors active:scale-95"
        >
          <Plus size={18} weight="bold" />
          Anotar gasto
        </button>
        <button
          onClick={onAddIncome}
          className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm transition-colors active:scale-95"
        >
          <Plus size={18} weight="bold" />
          Anotar ingreso
        </button>
      </div>

      {/* ── Línea separadora ─────────────────────────────────────────────── */}
      {(topCategory || expenseDelta !== null) && (
        <div className="border-t border-slate-100 dark:border-slate-700/60" />
      )}

      {/* ── Sección 2: Saldo del mes ──────────────────────────────────────── */}
      {hasMonthData && (
        <div className="space-y-2">
          {/* Balance principal */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Saldo del mes
            </p>
            <p className={`text-lg font-black ${
              monthBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}>
              {monthBalance >= 0 ? '+' : ''}{formatCurrency(monthBalance)}
            </p>
          </div>
          {/* Desglose pequeño */}
          <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              ↑ {formatCurrency(monthIncome)}
            </span>
            <span className="text-rose-500 font-semibold">
              ↓ {formatCurrency(monthExpenses)}
            </span>
          </div>
          {/* Categoría top — ahora tiene contexto */}
          {topCategory && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
              Mayor gasto: <span className="font-semibold text-slate-500 dark:text-slate-400">{topCategory.category}</span>
              {' '}— {formatCurrency(topCategory.amount)} ({Math.round(topCategory.percentage)}%)
            </p>
          )}
        </div>
      )}

      {/* ── Sección 3: Tendencia mes a mes ───────────────────────────────── */}
      {expenseDelta !== null && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl ${
          isImproving
            ? 'bg-emerald-500/8 dark:bg-emerald-500/10 border border-emerald-500/20'
            : isWorse
            ? 'bg-rose-500/8 dark:bg-rose-500/10 border border-rose-500/20'
            : 'bg-slate-100/60 dark:bg-slate-700/30 border border-slate-200/50 dark:border-slate-700/50'
        }`}>
          <div className={`shrink-0 ${
            isImproving ? 'text-emerald-500' : isWorse ? 'text-rose-500' : 'text-slate-400'
          }`}>
            {isImproving
              ? <TrendDown size={20} weight="bold" />
              : isWorse
              ? <TrendUp size={20} weight="bold" />
              : <TrendUp size={20} weight="bold" />
            }
          </div>
          <p className={`text-xs font-bold ${
            isImproving
              ? 'text-emerald-700 dark:text-emerald-400'
              : isWorse
              ? 'text-rose-700 dark:text-rose-400'
              : 'text-slate-500'
          }`}>
            {isImproving
              ? `Gastaste ${Math.abs(expenseDelta)}% menos que el mes pasado — ¡buen hábito!`
              : isWorse
              ? `Gastaste ${expenseDelta}% más que el mes pasado`
              : 'Gastos estables vs el mes pasado'
            }
          </p>
        </div>
      )}
    </div>
  );
}

HabitDailyCard.propTypes = {
  currentStreak: PropTypes.number,
  longestStreak: PropTypes.number,
  allTransactions: PropTypes.array,
  categoryAnalysis: PropTypes.array,
  monthlyComparison: PropTypes.object,
  monthIncome: PropTypes.number,
  monthExpenses: PropTypes.number,
  onAddExpense: PropTypes.func,
  onAddIncome: PropTypes.func,
};
