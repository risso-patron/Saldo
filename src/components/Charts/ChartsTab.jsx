import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  PiggyBank, TrendDown, CalendarBlank, Coins,
  ArrowUp, ArrowDown, Minus, WarningCircle,
} from '@phosphor-icons/react';
import { BalanceDonutChart } from './BalanceDonutChart';
import { MonthlyCashFlowChart } from './MonthlyCashFlowChart';
import { SpendingByDayChart } from './SpendingByDayChart';
import { CategoryBarChart } from './CategoryBarChart';
import { formatCurrency, formatPercentageSafe } from '../../utils/formatters';
import { transformToSpendingByDay } from '../../utils/chartHelpers';
import { getCategoryDominance } from '../../utils/calculations';
import { useSubscription } from '../../hooks/useSubscription';
import { UpgradeModal } from '../Subscription/UpgradeModal';

// ─── Gráfico bloqueado (PRO) ─────────────────────────────────────────────────
// RC-1.6/C1 (pieza 3/3): mismo badge ya usado en ExportManager.jsx, aplicado a
// un gráfico completo en vez de a un botón de acción —
// MonthlyCashFlowChart/SpendingByDayChart no tienen una acción que
// interceptar (se renderizan siempre), así que el gate ocurre al momento de
// decidir qué renderizar, no dentro de esos componentes (sin tocarlos).
//
// DISCOVERY-BR2-001 (temporal para BR-2, 2026-07-28): copy neutralizado
// ("No disponible" / "Conocer más" / "Esta visualización no está disponible
// para tu cuenta.") para eliminar lenguaje comercial pasivo durante la
// validación con usuarios reales — este badge se muestra sin ninguna acción
// deliberada del usuario, a diferencia de ExportManager/GoalManager/
// CreditCardManager. Sin cambios de lógica: hasFeature('advanced_charts') y
// onUpgradeClick siguen exactamente igual. Revertir al copy comercial
// original ("Función PRO" / "Actualizar" / "Desbloquea este gráfico con el
// plan PRO desde $4.99/mes") al finalizar BR-2, salvo que la evidencia
// obtenida justifique una decisión distinta del Product Owner.
const LockedChart = ({ title, height, onUpgradeClick }) => (
  <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-white/5 rounded-2xl p-5 shadow-sm">
    <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-4">{title}</p>
    <div className={`${height} w-full flex items-center justify-center`}>
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 max-w-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔒</span>
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              No disponible
            </span>
          </div>
          <button
            onClick={onUpgradeClick}
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-full font-semibold transition-colors"
          >
            Conocer más
          </button>
        </div>
        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
          Esta visualización no está disponible para tu cuenta.
        </p>
      </div>
    </div>
  </div>
);

LockedChart.propTypes = {
  title: PropTypes.string.isRequired,
  height: PropTypes.string.isRequired,
  onUpgradeClick: PropTypes.func.isRequired,
};

// ─── KPI Card ────────────────────────────────────────────────────────────────

const KpiCard = ({ iconNode, iconBg, label, value, sub, trend }) => {
  const trendColor =
    trend === 'up'   ? 'text-emerald-500' :
    trend === 'down' ? 'text-red-400'     : 'text-slate-400';

  const TrendIcon =
    trend === 'up'   ? ArrowUp   :
    trend === 'down' ? ArrowDown : Minus;

  return (
    <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/40 dark:border-white/5 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {iconNode}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
          {label}
        </p>
        <p className="text-xl font-black text-slate-800 dark:text-white leading-none truncate">
          {value}
        </p>
        {sub && (
          <p className={`text-xs mt-1 flex items-center gap-0.5 font-semibold ${trendColor}`}>
            <TrendIcon size={11} weight="bold" />
            {sub}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── ChartsTab ───────────────────────────────────────────────────────────────

export const ChartsTab = ({
  filteredIncomes,
  filteredExpenses,
  filteredTotalIncome,
  filteredTotalExpenses,
  categoryAnalysis,
  onReclassifyOtros,
}) => {
  // RC-1.6/C1 (pieza 3/3): MonthlyCashFlowChart y SpendingByDayChart son PRO
  // (definición de producto — ver docs/technical/MONETIZATION_STRATEGY.md).
  // BalanceDonutChart y CategoryBarChart permanecen libres para todos.
  const { hasFeature } = useSubscription();
  const hasAdvancedCharts = hasFeature('advanced_charts');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // ── KPI 1: Tasa de ahorro del período seleccionado ──
  const savingRate = useMemo(() => {
    if (!filteredTotalIncome || filteredTotalIncome === 0) return null;
    // Sin redondear: los umbrales (>=20, <0) y el display usan el valor real (HAL-004)
    return ((filteredTotalIncome - filteredTotalExpenses) / filteredTotalIncome) * 100;
  }, [filteredTotalIncome, filteredTotalExpenses]);

  // ── KPI 2: Categoría con más gasto ──
  const topCategory = useMemo(() => {
    if (!categoryAnalysis || categoryAnalysis.length === 0) return null;
    const top = [...categoryAnalysis].sort((a, b) => b.amount - a.amount)[0];
    return top ? { name: top.name || top.category, amount: top.amount } : null;
  }, [categoryAnalysis]);

  // ── KPI 3: Día de la semana con más gasto ──
  const worstDay = useMemo(() => {
    if (!filteredExpenses.length) return null;
    const byDay = transformToSpendingByDay(filteredExpenses);
    const max = byDay.reduce((a, b) => (b.monto > a.monto ? b : a), byDay[0]);
    return max.monto > 0 ? max : null;
  }, [filteredExpenses]);

  // ── KPI 4: Promedio de gasto diario ──
  const dailyAvg = useMemo(() => {
    if (!filteredExpenses.length) return null;
    const dates = new Set(filteredExpenses.map(e => e.date?.substring(0, 10)).filter(Boolean));
    const days = dates.size || 1;
    return filteredTotalExpenses / days;
  }, [filteredExpenses, filteredTotalExpenses]);

  // ── Tendencia ahorro respecto al mes anterior ──
  const savingTrend = savingRate === null ? 'neutral'
    : savingRate >= 20 ? 'up'
    : savingRate < 0   ? 'down'
    : 'neutral';

  // ── Dominancia de "Otros": señal de mala categorización, no de gasto real (HAL-001) ──
  const otrosDominance = useMemo(() => getCategoryDominance(categoryAnalysis), [categoryAnalysis]);

  return (
    <div className="space-y-6">

      {/* ── Aviso: "Otros" domina el período ─────────────────────────────────── */}
      {otrosDominance.isDominant && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500/8 dark:bg-amber-500/10 border border-amber-500/20 flex-wrap">
          <div className="shrink-0 text-amber-500">
            <WarningCircle size={20} weight="fill" />
          </div>
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex-1 min-w-[200px]">
            {`"Otros" representa el ${formatPercentageSafe(otrosDominance.percentage)} de tu gasto en este período — probablemente hay transacciones que podés reclasificar a una categoría más específica.`}
          </p>
          {onReclassifyOtros && (
            <button
              onClick={onReclassifyOtros}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-colors"
            >
              Ver y reclasificar →
            </button>
          )}
        </div>
      )}

      {/* ── 4 KPIs ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          iconNode={<PiggyBank size={22} weight="fill" className="text-white" />}
          iconBg={savingTrend === 'up' ? 'bg-emerald-500' : savingTrend === 'down' ? 'bg-red-400' : 'bg-slate-400'}
          label="Tasa de ahorro"
          value={savingRate !== null ? formatPercentageSafe(savingRate) : '—'}
          sub={
            savingRate === null ? null :
            savingRate >= 20 ? 'Buen ritmo de ahorro' :
            savingRate < 0   ? 'Gastos superan ingresos' :
            'Margen ajustado'
          }
          trend={savingTrend}
        />
        <KpiCard
          iconNode={<TrendDown size={22} weight="fill" className="text-white" />}
          iconBg="bg-violet-500"
          label="Mayor categoría"
          value={topCategory ? topCategory.name : '—'}
          sub={topCategory ? formatCurrency(topCategory.amount) : null}
          trend="neutral"
        />
        <KpiCard
          iconNode={<CalendarBlank size={22} weight="fill" className="text-white" />}
          iconBg="bg-orange-400"
          label="Día más gastador"
          value={worstDay ? worstDay.dia : '—'}
          sub={worstDay ? `${formatCurrency(worstDay.monto)} en total` : null}
          trend="neutral"
        />
        <KpiCard
          iconNode={<Coins size={22} weight="fill" className="text-white" />}
          iconBg="bg-blue-500"
          label="Gasto diario prom."
          value={dailyAvg ? formatCurrency(dailyAvg) : '—'}
          sub={dailyAvg ? `${filteredExpenses.length} transacciones` : null}
          trend="neutral"
        />
      </div>

      {/* ── Fila 1: Dona + Flujo mensual ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceDonutChart
          totalIncome={filteredTotalIncome}
          totalExpenses={filteredTotalExpenses}
        />
        <CategoryBarChart
          categoryAnalysis={categoryAnalysis}
          topN={5}
        />
      </div>

      {/* ── Fila 2: Flujo mensual full-width (PRO) ──────────────────────────── */}
      {hasAdvancedCharts ? (
        <MonthlyCashFlowChart
          incomes={filteredIncomes}
          expenses={filteredExpenses}
          months={6}
        />
      ) : (
        <LockedChart
          title="Flujo de Caja Mensual"
          height="h-[250px] sm:h-80"
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />
      )}

      {/* ── Fila 3: Gastos por día (PRO) ─────────────────────────────────────── */}
      {hasAdvancedCharts ? (
        <SpendingByDayChart expenses={filteredExpenses} />
      ) : (
        <LockedChart
          title="Gastos por Día de la Semana"
          height="h-[200px] sm:h-72"
          onUpgradeClick={() => setShowUpgradeModal(true)}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="advanced_charts"
        />
      )}
    </div>
  );
};

ChartsTab.propTypes = {
  filteredIncomes:       PropTypes.array.isRequired,
  filteredExpenses:      PropTypes.array.isRequired,
  filteredTotalIncome:   PropTypes.number.isRequired,
  filteredTotalExpenses: PropTypes.number.isRequired,
  categoryAnalysis:      PropTypes.array.isRequired,
  onReclassifyOtros:     PropTypes.func,
};
