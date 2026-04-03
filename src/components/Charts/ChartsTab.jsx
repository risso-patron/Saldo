import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  PiggyBank, TrendDown, CalendarBlank, Coins,
  ArrowUp, ArrowDown, Minus,
} from '@phosphor-icons/react';
import { BalanceDonutChart } from './BalanceDonutChart';
import { MonthlyCashFlowChart } from './MonthlyCashFlowChart';
import { SpendingByDayChart } from './SpendingByDayChart';
import { CategoryBarChart } from './CategoryBarChart';
import { formatCurrency } from '../../utils/formatters';
import { transformToSpendingByDay } from '../../utils/chartHelpers';

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
}) => {

  // ── KPI 1: Tasa de ahorro del período seleccionado ──
  const savingRate = useMemo(() => {
    if (!filteredTotalIncome || filteredTotalIncome === 0) return null;
    const rate = ((filteredTotalIncome - filteredTotalExpenses) / filteredTotalIncome) * 100;
    return Math.round(rate);
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

  return (
    <div className="space-y-6">

      {/* ── 4 KPIs ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          iconNode={<PiggyBank size={22} weight="fill" className="text-white" />}
          iconBg={savingTrend === 'up' ? 'bg-emerald-500' : savingTrend === 'down' ? 'bg-red-400' : 'bg-slate-400'}
          label="Tasa de ahorro"
          value={savingRate !== null ? `${savingRate}%` : '—'}
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

      {/* ── Fila 2: Flujo mensual full-width ───────────────────────────────── */}
      <MonthlyCashFlowChart
        incomes={filteredIncomes}
        expenses={filteredExpenses}
        months={6}
      />

      {/* ── Fila 3: Gastos por día ──────────────────────────────────────────── */}
      <SpendingByDayChart expenses={filteredExpenses} />

    </div>
  );
};

ChartsTab.propTypes = {
  filteredIncomes:       PropTypes.array.isRequired,
  filteredExpenses:      PropTypes.array.isRequired,
  filteredTotalIncome:   PropTypes.number.isRequired,
  filteredTotalExpenses: PropTypes.number.isRequired,
  categoryAnalysis:      PropTypes.array.isRequired,
};
