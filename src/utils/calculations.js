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
/**
 * Normaliza cualquier string de fecha a mediodía local antes de construir un `Date`.
 * Maneja "YYYY-MM-DD", ISO completos "YYYY-MM-DDTHH:mm:ss+TZ", etc. Compartida por
 * BudgetManager, calculateMonthlyComparison y ExportManager para que los tres
 * coincidan siempre en qué día calendario cae una transacción (spec "Normalización
 * de timezone consistente").
 * @param {string|null|undefined} dateStr - Fecha a normalizar.
 * @returns {Date|null} Fecha al mediodía local, o `null` si es inválida/ausente.
 */
export const parseLocalDate = (dateStr) => {
  const d = new Date(String(dateStr).substring(0, 10) + 'T12:00:00');
  return isNaN(d) ? null : d;
};

const parseYear = (dateStr) => {
  const d = parseLocalDate(dateStr);
  return d ? d.getFullYear() : null;
};
const parseDate = parseLocalDate;

export const filterByYear = (items = [], year = null) => {
  if (!year) return items;
  return items.filter(item => {
    if (!item.date) return false;
    return parseYear(item.date) === year;
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
    const d = parseDate(item.date);
    if (!d) return false;
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
    if (!t.date) return;
    const y = parseYear(t.date);
    if (y !== null) years.add(y);
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
    const d = parseDate(t.date);
    if (d && d.getFullYear() === year) months.add(d.getMonth());
  };
  incomes.forEach(process);
  expenses.forEach(process);
  return [...months].sort((a, b) => a - b);
};

/**
 * Filtra transacciones dentro de un rango de fechas inclusive [from, to].
 * Usa `parseLocalDate` para que los límites del rango no se desplacen por timezone.
 * @param {Array} items - Lista de transacciones.
 * @param {string} from - Fecha ISO de inicio (YYYY-MM-DD).
 * @param {string} to - Fecha ISO de fin (YYYY-MM-DD).
 * @returns {Array} Lista filtrada; devuelve `items` sin cambios si falta from/to.
 */
export const filterByDateRange = (items = [], from, to) => {
  if (!from || !to) return items;
  const fromDate = parseLocalDate(from);
  const toDate = parseLocalDate(to);
  if (!fromDate || !toDate) return items;

  return items.filter(item => {
    const d = parseLocalDate(item.date);
    return d !== null && d >= fromDate && d <= toDate;
  });
};

const pad2 = (n) => String(n).padStart(2, '0');
const toISODate = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Deriva el rango inmediatamente anterior a [from, to], de igual duración (en días).
 * @returns {{from: string, to: string}|null} `null` si from/to son inválidos.
 */
const getPreviousRange = (from, to) => {
  const fromDate = parseLocalDate(from);
  const toDate = parseLocalDate(to);
  if (!fromDate || !toDate) return null;

  const durationDays = Math.round((toDate - fromDate) / MS_PER_DAY) + 1;
  const prevTo = new Date(fromDate);
  prevTo.setDate(prevTo.getDate() - 1);
  const prevFrom = new Date(prevTo);
  prevFrom.setDate(prevFrom.getDate() - (durationDays - 1));

  return { from: toISODate(prevFrom), to: toISODate(prevTo) };
};

/**
 * Calcula la comparación contra el período anterior.
 *
 * Si se provee `period` (forma del `PeriodContext`: `{type, year, month, from, to}`),
 * el período anterior se deriva de ESE período elegido por el usuario, no del
 * mes calendario real. Con `type='all'` no existe un período anterior natural:
 * se devuelve `hasComparison=false` sin ningún total numérico de respaldo.
 *
 * Si NO se provee `period` (comportamiento legado, para llamadas existentes),
 * se preserva el comportamiento original: mes calendario real anterior a "hoy".
 *
 * @param {Array} incomes - Lista de ingresos.
 * @param {Array} expenses - Lista de gastos.
 * @param {{type: string, year?: number, month?: number, from?: string, to?: string}|null} [period]
 * @returns {Object} { prevTotalIncome, prevTotalExpenses, prevBalance, hasComparison }
 */
export const calculateMonthlyComparison = (incomes = [], expenses = [], period = null) => {
  let prevIncomes;
  let prevExpenses;

  if (!period) {
    // Comportamiento legado (sin período global provisto): mes calendario real.
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const prevYear = curMonth === 0 ? curYear - 1 : curYear;
    const prevMonth = curMonth === 0 ? 11 : curMonth - 1;
    prevIncomes = filterByMonth(incomes, prevYear, prevMonth);
    prevExpenses = filterByMonth(expenses, prevYear, prevMonth);
  } else if (period.type === 'month' && period.year != null && period.month != null) {
    const prevYear = period.month === 0 ? period.year - 1 : period.year;
    const prevMonth = period.month === 0 ? 11 : period.month - 1;
    prevIncomes = filterByMonth(incomes, prevYear, prevMonth);
    prevExpenses = filterByMonth(expenses, prevYear, prevMonth);
  } else if (period.type === 'year' && period.year != null) {
    const prevYear = period.year - 1;
    prevIncomes = filterByYear(incomes, prevYear);
    prevExpenses = filterByYear(expenses, prevYear);
  } else if (period.type === 'custom' && period.from && period.to) {
    const prevRange = getPreviousRange(period.from, period.to);
    if (!prevRange) return { hasComparison: false };
    prevIncomes = filterByDateRange(incomes, prevRange.from, prevRange.to);
    prevExpenses = filterByDateRange(expenses, prevRange.from, prevRange.to);
  } else {
    // type='all' (o datos insuficientes para derivar un período anterior).
    return { hasComparison: false };
  }

  const prevTotalIncome = calculateTotal(prevIncomes);
  const prevTotalExpenses = calculateTotal(prevExpenses);
  const prevBalance = calculateBalance(prevTotalIncome, prevTotalExpenses);

  return { prevTotalIncome, prevTotalExpenses, prevBalance, hasComparison: true };
};
