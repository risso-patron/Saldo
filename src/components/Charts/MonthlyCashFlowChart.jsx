import PropTypes from 'prop-types';
import {
  ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { ChartContainer } from './ChartContainer';
import { transformToMonthlyCashFlow, hasChartData } from '../../utils/chartHelpers';
import { formatCurrency } from '../../utils/formatters';

const CashFlowTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-sm">
      <p className="font-bold text-gray-800 dark:text-white mb-2">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600 dark:text-gray-300">{entry.name}:</span>
          </div>
          <span className="font-semibold text-gray-800 dark:text-white">
            {entry.name === 'Ahorro %' ? `${entry.value}%` : formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

/**
 * Flujo de Caja Mensual — Ingresos / Gastos / Ahorro con tasa de ahorro %
 */
export const MonthlyCashFlowChart = ({ incomes, expenses, months = 6 }) => {
  const data = transformToMonthlyCashFlow(incomes, expenses, months);
  const isEmpty = !hasChartData(incomes, expenses);
  const hasAnyData = data.some(d => d.ingresos > 0 || d.gastos > 0);

  return (
    <ChartContainer
      title="Flujo de Caja Mensual"
      icon="💰"
      isEmpty={isEmpty || !hasAnyData}
      emptyMessage="Agrega transacciones para ver el flujo mensual"
      height="h-[250px] sm:h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          {/* Eje izquierdo: montos */}
          <YAxis
            yAxisId="money"
            orientation="left"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          {/* Eje derecho: porcentaje */}
          <YAxis
            yAxisId="pct"
            orientation="right"
            tick={{ fontSize: 11, fill: '#a78bfa' }}
            tickFormatter={v => `${v}%`}
            domain={[-100, 100]}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CashFlowTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
            formatter={v => <span className="text-gray-600 dark:text-gray-300">{v}</span>}
          />
          <ReferenceLine yAxisId="money" y={0} stroke="#e5e7eb" />
          <ReferenceLine yAxisId="pct"   y={0} stroke="#e5e7eb" strokeDasharray="4 4" />

          <Bar yAxisId="money" dataKey="ingresos" name="Ingresos"  fill="#10b981" radius={[4,4,0,0]} maxBarSize={40} />
          <Bar yAxisId="money" dataKey="gastos"   name="Gastos"    fill="#f87171" radius={[4,4,0,0]} maxBarSize={40} />
          <Bar yAxisId="money" dataKey="ahorro"   name="Ahorro"    fill="#667eea" radius={[4,4,0,0]} maxBarSize={40} />
          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="tasaAhorro"
            name="Ahorro %"
            stroke="#a78bfa"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#a78bfa' }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

MonthlyCashFlowChart.propTypes = {
  incomes:  PropTypes.array.isRequired,
  expenses: PropTypes.array.isRequired,
  months:   PropTypes.number,
};
