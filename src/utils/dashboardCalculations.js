import { parseLocalDate, filterByMonth, calculateTotal } from './calculations';

// Fase II — Integración del Dashboard (Saldo Design Constitution v1.2).
// Fuente: docs/design/screens/Saldo Dashboard.dc.html.
//
// Lógica pura nueva para el Dashboard. Reusa calculateTotal/filterByMonth/
// parseLocalDate de ./calculations.js — no las duplica.

const MINUS_SIGN = '−'; // signo menos tipográfico — nunca el guion ASCII "-"

/**
 * Filtra `items` a los que caen en o antes del día `day` del mes (por
 * `parseLocalDate`). Si el mes histórico tiene menos días que `day`, cae
 * naturalmente — no hace falta lógica especial.
 */
const filterUpToDay = (items, day) => items.filter((item) => {
  const d = parseLocalDate(item.date);
  return d !== null && d.getDate() <= day;
});

/**
 * Compara el gasto acumulado del mes/año de `referenceDate` (hasta su
 * día-del-mes) contra el promedio de gasto acumulado hasta ese mismo día en
 * todos los meses históricos distintos con datos.
 *
 * Principio "nunca fabricar conocimiento" (Constitución): sin al menos un
 * mes histórico con datos, no hay base de comparación — se devuelve `null`
 * en vez de inventar un promedio.
 *
 * @param {Array<{date: string, amount: number}>} expenses
 * @param {Date} [referenceDate] - Fecha de referencia inyectable (default: hoy) — así los tests son determinísticos sin mockear Date global.
 * @returns {{currentAmount: number, historicalAverage: number, diff: number}|null}
 *   `diff = historicalAverage - currentAmount` — positivo significa que se
 *   está gastando MENOS que la media histórica.
 */
export const calculateSpendingPaceComparison = (expenses = [], referenceDate = new Date()) => {
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();

  const isReferenceMonth = (item) => {
    const d = parseLocalDate(item.date);
    return d !== null && d.getFullYear() === refYear && d.getMonth() === refMonth;
  };

  const currentMonthExpenses = expenses.filter(isReferenceMonth);
  const currentAmount = calculateTotal(filterUpToDay(currentMonthExpenses, refDay));

  // Agrupar el resto por (año, mes) distintos del mes de referencia.
  const historicalGroups = new Map();
  expenses.forEach((item) => {
    const d = parseLocalDate(item.date);
    if (!d) return;
    if (d.getFullYear() === refYear && d.getMonth() === refMonth) return;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!historicalGroups.has(key)) historicalGroups.set(key, []);
    historicalGroups.get(key).push(item);
  });

  if (historicalGroups.size === 0) return null;

  const historicalSums = [...historicalGroups.values()]
    .map((items) => calculateTotal(filterUpToDay(items, refDay)));
  const historicalAverage = historicalSums.reduce((sum, v) => sum + v, 0) / historicalSums.length;

  return {
    currentAmount,
    historicalAverage,
    diff: historicalAverage - currentAmount,
  };
};

/**
 * Serie de `months` totales mensuales consecutivos terminando en el mes de
 * `referenceDate`, en orden cronológico ascendente (el mes de referencia
 * queda al final). Meses sin gastos entran con `total: 0` — es dato real
 * ("no hubo gasto ese mes"), no relleno inventado.
 *
 * @param {Array<{date: string, amount: number}>} expenses
 * @param {Date} [referenceDate]
 * @param {number} [months]
 * @returns {Array<{year: number, month: number, total: number}>} Siempre exactamente `months` entradas.
 */
export const getMonthlySeries = (expenses = [], referenceDate = new Date(), months = 6) => {
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();

  const series = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(refYear, refMonth - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    series.push({ year, month, total: calculateTotal(filterByMonth(expenses, year, month)) });
  }
  return series;
};

/**
 * Los `limit` movimientos más recientes por fecha descendente. Opera sobre
 * la lista ya mezclada (misma forma que `allTransactions` de
 * `useTransactions`: cada item con `.date` y un discriminador `.type`
 * 'income'|'expense') — no reconstruye esa mezcla.
 *
 * @param {Array<{date: string}>} transactions
 * @param {number} [limit]
 * @returns {Array}
 */
export const getRecentTransactions = (transactions = [], limit = 5) => {
  return [...transactions]
    .sort((a, b) => {
      const timeA = parseLocalDate(a.date)?.getTime() ?? -Infinity;
      const timeB = parseLocalDate(b.date)?.getTime() ?? -Infinity;
      return timeB - timeA;
    })
    .slice(0, limit);
};

// Mismo locale que formatCurrency (src/utils/formatters.js) — consistencia
// con cómo el resto de la app formatea moneda.
const CURRENCY_LOCALE = 'es-419';

/**
 * Separa un monto en parte entera (grande) y parte decimal + símbolo de
 * moneda (chica), para la tipografía de dos tamaños de la cifra
 * protagonista (Numeric XL). Usa las MISMAS opciones de Intl.NumberFormat
 * que `formatCurrency` (mismo locale, mismo mapeo PAB→USD,
 * minimumFractionDigits/maximumFractionDigits) para quedar consistente con
 * el resto de la app — pero usando `formatToParts` en vez de parsear un
 * string a mano.
 *
 * Decisión de diseño (documentada — no especificada en detalle en el
 * encargo): el código/símbolo de moneda se reubica SIEMPRE junto al
 * decimal (parte chica), aunque el locale real (`es-419`) lo devuelva como
 * PREFIJO ("USD 1.234,56") y no como sufijo. Es una decisión tipográfica
 * deliberada para este componente (grande + chico), no una réplica literal
 * del string de `formatCurrency`.
 *
 * @param {number} amount
 * @param {string} [currencyCode]
 * @returns {{integerPart: string, decimalPart: string}}
 */
export const splitAmountForDisplay = (amount, currencyCode = 'USD') => {
  const numericAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const safeCode = currencyCode === 'PAB' ? 'USD' : currencyCode;

  let parts;
  try {
    parts = new Intl.NumberFormat(CURRENCY_LOCALE, {
      style: 'currency',
      currency: safeCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).formatToParts(numericAmount);
  } catch {
    // Código de moneda no reconocido por Intl — mismo espíritu del fallback de formatCurrency.
    const fixed = Math.abs(numericAmount).toFixed(2);
    const [intPart, fracPart] = fixed.split('.');
    return {
      integerPart: `${numericAmount < 0 ? MINUS_SIGN : ''}${intPart}`,
      decimalPart: `.${fracPart} ${safeCode}`,
    };
  }

  let integerDigits = '';
  let decimalSeparator = '.';
  let fractionDigits = '00';
  let currencyText = '';
  let isNegative = numericAmount < 0;

  parts.forEach((part) => {
    switch (part.type) {
      case 'integer':
      case 'group':
        integerDigits += part.value;
        break;
      case 'decimal':
        decimalSeparator = part.value;
        break;
      case 'fraction':
        fractionDigits = part.value;
        break;
      case 'currency':
        currencyText += part.value;
        break;
      case 'minusSign':
        isNegative = true;
        break;
      default:
        break;
    }
  });

  // Paridad con formatCurrency (mismo reemplazo textual — actualmente sin
  // efecto porque este ICU/CLDR representa USD como código "USD", no como
  // símbolo "US$"; se mantiene por si ese dato de CLDR cambia).
  const displayCurrency = currencyCode === 'PAB' ? currencyText.replace('US$', 'B/.') : currencyText;

  return {
    integerPart: `${isNegative ? MINUS_SIGN : ''}${integerDigits}`,
    decimalPart: `${decimalSeparator}${fractionDigits} ${displayCurrency}`,
  };
};
