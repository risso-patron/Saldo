/**
 * Utilidades para transformación de datos de gráficos
 */

import { formatCurrency, formatDate } from './formatters';

/**
 * Transforma transacciones a formato para gráfico de dona (Balance)
 */
export const transformToDonutData = (totalIncome, totalExpenses) => {
  if (totalIncome === 0 && totalExpenses === 0) {
    return [];
  }

  return [
    {
      name: 'Ingresos',
      value: totalIncome,
      color: '#00b894',
      percentage: totalIncome + totalExpenses > 0 
        ? ((totalIncome / (totalIncome + totalExpenses)) * 100).toFixed(1)
        : 0
    },
    {
      name: 'Gastos',
      value: totalExpenses,
      color: '#ff7675',
      percentage: totalIncome + totalExpenses > 0 
        ? ((totalExpenses / (totalIncome + totalExpenses)) * 100).toFixed(1)
        : 0
    }
  ];
};

/**
 * Transforma transacciones a formato para gráfico de líneas (Tendencias)
 * Agrupa por fecha y acumula ingresos/gastos
 */
export const transformToLineData = (incomes, expenses, fromDateStr, toDateStr) => {
  const from = new Date(fromDateStr + 'T00:00:00');
  const to   = new Date(toDateStr   + 'T00:00:00');

  if (isNaN(from) || isNaN(to) || from > to) return [];

  // Generar un día por cada día del rango
  const dataMap = {};
  const cursor = new Date(from);
  while (cursor <= to) {
    const dateKey = cursor.toISOString().split('T')[0];
    dataMap[dateKey] = {
      date: formatDate(new Date(cursor), { month: 'short', day: 'numeric' }),
      ingresos: 0,
      gastos: 0,
    };
    cursor.setDate(cursor.getDate() + 1);
  }

  // Sumar ingresos por fecha
  incomes.forEach(income => {
    const dateKey = income.date || new Date().toISOString().split('T')[0];
    if (dataMap[dateKey]) dataMap[dateKey].ingresos += income.amount;
  });

  // Sumar gastos por fecha
  expenses.forEach(expense => {
    const dateKey = expense.date || new Date().toISOString().split('T')[0];
    if (dataMap[dateKey]) dataMap[dateKey].gastos += expense.amount;
  });

  // Convertir a array ordenado y calcular acumulados
  let ingresosAcumulado = 0;
  let gastosAcumulado = 0;

  return Object.keys(dataMap).sort().map(key => {
    ingresosAcumulado += dataMap[key].ingresos;
    gastosAcumulado   += dataMap[key].gastos;
    return {
      ...dataMap[key],
      ingresosAcum: ingresosAcumulado,
      gastosAcum:   gastosAcumulado,
    };
  });
};

/**
 * Transforma análisis de categorías a formato para gráfico de barras
 * Retorna top N categorías ordenadas de mayor a menor
 */
export const transformToBarData = (categoryAnalysis, topN = 5) => {
  if (!categoryAnalysis || categoryAnalysis.length === 0) {
    return [];
  }

  // Ordenar por monto descendente y tomar top N
  const topCategories = [...categoryAnalysis]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, topN);

  return topCategories.map((cat, index) => ({
    name: cat.name,
    monto: cat.amount,
    porcentaje: cat.percentage,
    color: getCategoryColor(index),
    icon: cat.icon
  }));
};

/**
 * Genera datos comparativos entre mes actual y anterior
 */
export const transformToComparativeData = (incomes, expenses) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calcular mes anterior
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const filterByMonth = (transactions, month, year) => {
    return transactions.filter(t => {
      const date = new Date(t.date || new Date());
      return date.getMonth() === month && date.getFullYear() === year;
    });
  };

  const currentIncomes = filterByMonth(incomes, currentMonth, currentYear);
  const currentExpenses = filterByMonth(expenses, currentMonth, currentYear);
  const previousIncomes = filterByMonth(incomes, previousMonth, previousYear);
  const previousExpenses = filterByMonth(expenses, previousMonth, previousYear);

  const sumAmount = (arr) => arr.reduce((sum, item) => sum + item.amount, 0);

  const currentIncomesTotal = sumAmount(currentIncomes);
  const currentExpensesTotal = sumAmount(currentExpenses);
  const previousIncomesTotal = sumAmount(previousIncomes);
  const previousExpensesTotal = sumAmount(previousExpenses);

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return [
    {
      name: 'Ingresos',
      mesActual: currentIncomesTotal,
      mesAnterior: previousIncomesTotal,
      variacion: previousIncomesTotal > 0 
        ? (((currentIncomesTotal - previousIncomesTotal) / previousIncomesTotal) * 100).toFixed(1)
        : 0,
      currentMonthName: monthNames[currentMonth],
      previousMonthName: monthNames[previousMonth]
    },
    {
      name: 'Gastos',
      mesActual: currentExpensesTotal,
      mesAnterior: previousExpensesTotal,
      variacion: previousExpensesTotal > 0 
        ? (((currentExpensesTotal - previousExpensesTotal) / previousExpensesTotal) * 100).toFixed(1)
        : 0,
      currentMonthName: monthNames[currentMonth],
      previousMonthName: monthNames[previousMonth]
    }
  ];
};

/**
 * Colores para categorías en gráficos de barras
 */
const getCategoryColor = (index) => {
  const colors = [
    '#667eea', // Morado principal
    '#764ba2', // Morado oscuro
    '#00b894', // Verde
    '#fdcb6e', // Amarillo
    '#e17055', // Naranja
    '#0984e3', // Azul
    '#6c5ce7', // Morado claro
    '#a29bfe'  // Lavanda
  ];
  return colors[index % colors.length];
};

/**
 * Tooltip personalizado para gráficos
 */
export const CustomTooltip = ({ active, payload, label, _type = 'default' }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
      {label && <p className="font-semibold text-gray-700 mb-2">{label}</p>}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-semibold text-gray-800">
            {formatCurrency(entry.value)}
          </span>
          {entry.payload.percentage && (
            <span className="text-gray-500 text-xs">
              ({entry.payload.percentage}%)
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

/**
 * Verifica si hay datos suficientes para mostrar gráficos
 */
export const hasChartData = (incomes, expenses) => {
  return (incomes && incomes.length > 0) || (expenses && expenses.length > 0);
};

// ─── Nuevas transformaciones ───────────────────────────────────────────────

/**
 * Flujo de caja mensual — últimos N meses
 * Retorna [{ mes, ingresos, gastos, ahorro, tasaAhorro }]
 */
export const transformToMonthlyCashFlow = (incomes = [], expenses = [], months = 6) => {
  const now = new Date();
  const result = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year  = d.getFullYear();
    const month = d.getMonth();
    const label = d.toLocaleDateString('es-PA', { month: 'short', year: '2-digit' });

    const ingresosMes = incomes
      .filter(t => { const td = new Date(t.date); return td.getFullYear() === year && td.getMonth() === month; })
      .reduce((s, t) => s + (t.amount || 0), 0);

    const gastosMes = expenses
      .filter(t => { const td = new Date(t.date); return td.getFullYear() === year && td.getMonth() === month; })
      .reduce((s, t) => s + (t.amount || 0), 0);

    const ahorro = ingresosMes - gastosMes;
    const tasaAhorro = ingresosMes > 0 ? Math.round((ahorro / ingresosMes) * 100) : 0;

    result.push({ mes: label, ingresos: ingresosMes, gastos: gastosMes, ahorro, tasaAhorro });
  }

  return result;
};

/**
 * Gastos por día de la semana
 * Retorna [{ dia: 'Lun', monto, count }] — ordenado lunes→domingo
 */
export const transformToSpendingByDay = (expenses = []) => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const order = [1, 2, 3, 4, 5, 6, 0]; // lunes primero
  const acc = Array(7).fill(null).map(() => ({ monto: 0, count: 0 }));

  expenses.forEach(t => {
    const d = new Date(t.date);
    if (!isNaN(d.getTime())) {
      acc[d.getDay()].monto += t.amount || 0;
      acc[d.getDay()].count += 1;
    }
  });

  return order.map(i => ({
    dia: days[i],
    monto: Math.round(acc[i].monto * 100) / 100,
    promedio: acc[i].count > 0 ? Math.round((acc[i].monto / acc[i].count) * 100) / 100 : 0,
    count: acc[i].count,
  }));
};

/**
 * Top N descripciones/comercios por monto de gasto
 * Retorna [{ nombre, monto, count }]
 */
export const transformToTopMerchants = (expenses = [], topN = 8) => {
  const map = {};
  expenses.forEach(t => {
    const key = (t.description || 'Sin descripción').trim();
    if (!map[key]) map[key] = { nombre: key, monto: 0, count: 0 };
    map[key].monto  += t.amount || 0;
    map[key].count  += 1;
  });

  return Object.values(map)
    .sort((a, b) => b.monto - a.monto)
    .slice(0, topN)
    .map(item => ({ ...item, monto: Math.round(item.monto * 100) / 100 }));
};
