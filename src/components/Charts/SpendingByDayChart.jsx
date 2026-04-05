import PropTypes from 'prop-types';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { transformToSpendingByDay } from '../../utils/chartHelpers';
import { formatCurrency } from '../../utils/formatters';

// Mapa de colores por intensidad relativa
const getBarColor = (value, maxValue) => {
  const ratio = maxValue > 0 ? value / maxValue : 0;
  if (ratio >= 0.8) return '#f43f5e';
  if (ratio >= 0.6) return '#fb923c';
  if (ratio >= 0.4) return '#fbbf24';
  if (ratio >= 0.2) return '#34d399';
  return '#6ee7b7';
};

const DayTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-sm">
      <p className="font-bold text-gray-800 dark:text-white mb-1">{label}</p>
      <p className="text-gray-600 dark:text-gray-300">
        Total: <span className="font-semibold text-red-500">{formatCurrency(d.monto)}</span>
      </p>
      <p className="text-gray-600 dark:text-gray-300">
        Promedio: <span className="font-semibold">{formatCurrency(d.promedio)}</span>
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
        {d.count} transaccion{d.count !== 1 ? 'es' : ''}
      </p>
    </div>
  );
};

/**
 * Gastos por Día de la Semana — barras coloreadas por intensidad
 */
export const SpendingByDayChart = ({ expenses }) => {
  const data = transformToSpendingByDay(expenses);
  const isEmpty = !expenses || expenses.length === 0;
  const maxValue = Math.max(...data.map(d => d.monto), 0);

  return (
    <ChartContainer
      title="Gastos por Día de la Semana"
      icon="📅"
      isEmpty={isEmpty}
      emptyMessage="Agrega gastos para ver en qué días gastas más"
      height="h-[200px] sm:h-72"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="dia"
            tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
            axisLine={false}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<DayTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)' }} />
          <Bar dataKey="monto" name="Gastos" radius={[6, 6, 0, 0]} maxBarSize={52}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getBarColor(entry.monto, maxValue)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

SpendingByDayChart.propTypes = {
  expenses: PropTypes.array.isRequired,
};
