import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '../Shared/Card';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../constants/categories';

const COLORS = ['#667eea', '#764ba2', '#2ecc71', '#3498db', '#e74c3c', '#f39c12', '#1abc9c', '#95a5a6'];

const PERIODS = [
  { label: '15d',  days: 15  },
  { label: '30d',  days: 30  },
  { label: '3m',   days: 90  },
  { label: 'Todo', days: null },
];

/**
 * Componente CategoryChart - Gráfico de análisis por categorías con filtro de período
 */
export const CategoryChart = ({ expenses = [] }) => {
  const [activePeriod, setActivePeriod] = useState(null); // null = Todo

  const filteredExpenses = useMemo(() => {
    if (activePeriod === null) return expenses;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - activePeriod);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return expenses.filter(e => e.date && e.date >= cutoffStr);
  }, [expenses, activePeriod]);

  const categoryAnalysis = useMemo(() => {
    const totals = {};
    filteredExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    const total = Object.values(totals).reduce((s, v) => s + v, 0);
    return Object.entries(totals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const chartData = categoryAnalysis.map(item => {
    const cat = EXPENSE_CATEGORIES.find(c => c.value === item.category);
    return {
      name: cat?.label || item.category,
      value: item.amount,
      percentage: item.percentage,
      icon: cat?.icon || '',
    };
  });

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-sm font-semibold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="col-span-full">
      {/* Cabecera con título + filtros */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-dark-500">Gastos por Categoría</h2>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
          {PERIODS.map(p => (
            <button
              key={p.label}
              onClick={() => setActivePeriod(p.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePeriod === p.days
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-100 hover:text-indigo-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {categoryAnalysis.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📊</p>
          <p>Sin gastos en este período</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico circular */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={600}
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={v => formatCurrency(v)}
                  contentStyle={{
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry) => `${entry.payload.icon} ${value}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista de categorías */}
          <div className="space-y-3">
            <h3 className="font-semibold text-dark-500 mb-4">Desglose detallado</h3>
            {categoryAnalysis.map((item, index) => {
              const category = EXPENSE_CATEGORIES.find(c => c.value === item.category);
              return (
                <div
                  key={item.category}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 animate-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-2xl">{category?.icon || ''}</span>
                    <span className="font-medium text-dark-500">{item.category}</span>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <div className="font-bold text-dark-500">{formatCurrency(item.amount)}</div>
                    <div className="text-sm text-gray-500">{formatPercentage(item.percentage)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};

CategoryChart.propTypes = {
  expenses: PropTypes.arrayOf(PropTypes.shape({
    category: PropTypes.string.isRequired,
    amount:   PropTypes.number.isRequired,
    date:     PropTypes.string,
  })).isRequired,
};
