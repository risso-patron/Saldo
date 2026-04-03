import { addAmounts, subtractAmounts, calculatePercentage } from './currencyHelpers';

/**
 * Calcula el total sumando los montos de una lista de transacciones.
 * @param {Array} items - Lista de transacciones (ingresos o gastos).
 * @returns {number} Total calculado con precisión decimal.
 */
export const calculateTotal = (items = []) => {
  return items.reduce((sum, item) => addAmounts(sum, item.amount), 0);
};

/**
 * Calcula el balance final (Ingresos - Gastos).
 * @param {number} totalIncome - Total de ingresos.
 * @param {number} totalExpenses - Total de gastos.
 * @returns {number} Balance neto.
 */
export const calculateBalance = (totalIncome = 0, totalExpenses = 0) => {
  return subtractAmounts(totalIncome, totalExpenses);
};

/**
 * Realiza un análisis de gastos por categoría.
 * @param {Array} expenses - Lista de gastos.
 * @param {number} totalExpenses - Total acumulado de gastos.
 * @returns {Array} Análisis ordenado por monto descendente.
 */
export const calculateCategoryAnalysis = (expenses = [], totalExpenses = 0) => {
  const categories = {};
  
  expenses.forEach(expense => {
    if (!categories[expense.category]) {
      categories[expense.category] = 0;
    }
    categories[expense.category] = addAmounts(categories[expense.category], expense.amount);
  });

  return Object.entries(categories)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: calculatePercentage(amount, totalExpenses),
    }))
    .sort((a, b) => b.amount - a.amount);
};

/**
 * Filtra una lista de transacciones por un año específico.
 * @param {Array} items - Lista de transacciones.
 * @param {number|null} year - Año a filtrar (null para no filtrar).
 * @returns {Array} Lista filtrada.
 */
export const filterByYear = (items = [], year = null) => {
  if (!year) return items;
  return items.filter(item => {
    if (!item.date) return false;
    // Usamos T12:00:00 para evitar problemas de zona horaria al obtener el año
    return new Date(item.date + 'T12:00:00').getFullYear() === year;
  });
};

/**
 * Filtra transacciones por año y mes específicos.
 * @param {Array} items - Lista de transacciones.
 * @param {number} year - Año (ej: 2026).
 * @param {number} month - Mes (0-indexed: 0=enero, 11=diciembre).
 * @returns {Array} Lista filtrada al mes exacto.
 */
export const filterByMonth = (items = [], year, month) => {
  return items.filter(item => {
    if (!item.date) return false;
    const d = new Date(item.date + 'T12:00:00');
    return d.getFullYear() === year && d.getMonth() === month;
  });
};

/**
 * Obtiene una lista de años únicos con transacciones.
 * @param {Array} incomes - Lista de ingresos.
 * @param {Array} expenses - Lista de gastos.
 * @returns {Array} Años ordenados descendente.
 */
export const getAvailableYears = (incomes = [], expenses = []) => {
  const years = new Set();
  const process = t => {
    if (t.date) {
      years.add(new Date(t.date + 'T12:00:00').getFullYear());
    }
  };
  incomes.forEach(process);
  expenses.forEach(process);
  return [...years].sort((a, b) => b - a);
};

/**
 * Obtiene los meses disponibles para un año específico.
 * @param {Array} incomes - Lista de ingresos.
 * @param {Array} expenses - Lista de gastos.
 * @param {number} year - Año a consultar.
 * @returns {Array} Meses únicos (0-11) ordenados.
 */
export const getAvailableMonths = (incomes = [], expenses = [], year) => {
  if (!year) return [];
  const months = new Set();
  const process = t => {
    if (!t.date) return;
    const d = new Date(t.date + 'T12:00:00');
    if (d.getFullYear() === year) months.add(d.getMonth());
  };
  incomes.forEach(process);
  expenses.forEach(process);
  return [...months].sort((a, b) => a - b);
};

/**
 * Calcula la comparación mensual (totales del mes anterior).
 * @param {Array} incomes - Lista de ingresos.
 * @param {Array} expenses - Lista de gastos.
 * @returns {Object} { prevTotalIncome, prevTotalExpenses, prevBalance }
 */
export const calculateMonthlyComparison = (incomes = [], expenses = []) => {
  const now = new Date();
  const curYear  = now.getFullYear();
  const curMonth = now.getMonth();
  const prevYear  = curMonth === 0 ? curYear - 1 : curYear;
  const prevMonth = curMonth === 0 ? 11 : curMonth - 1;

  const prevIncomes  = filterByMonth(incomes, prevYear, prevMonth);
  const prevExpenses = filterByMonth(expenses, prevYear, prevMonth);

  const prevTotalIncome   = calculateTotal(prevIncomes);
  const prevTotalExpenses = calculateTotal(prevExpenses);
  const prevBalance = calculateBalance(prevTotalIncome, prevTotalExpenses);

  return { prevTotalIncome, prevTotalExpenses, prevBalance };
};
