import { useMemo } from 'react'
import { usePeriod } from '../contexts/PeriodContext'
import {
  calculateTotal,
  calculateBalance,
  filterByYear,
  filterByMonth,
  getAvailableYears,
  getAvailableMonths,
  calculateMonthlyComparison,
} from '../utils/calculations'

/**
 * Encapsula toda la lógica de filtrado por año/mes y los cálculos derivados.
 * Extrae ~15 useMemos que antes vivían en AppContent.
 *
 * Delega el estado de año/mes a `PeriodContext` (fuente única del período
 * global) manteniendo exactamente la misma API pública de siempre — spec
 * "Consumidor existente sin cambios" (App.jsx/AppHeader.jsx no se tocan).
 */
export function useFilters(incomes, expenses) {
  const {
    year: selectedYear,
    setYear: setSelectedYear,
    month: selectedMonth,
    setMonth: setSelectedMonth,
    type,
    from,
    to,
  } = usePeriod()

  const filteredIncomes = useMemo(() => {
    const byYear = filterByYear(incomes, selectedYear)
    if (selectedYear && selectedMonth !== null) return filterByMonth(byYear, selectedYear, selectedMonth)
    return byYear
  }, [incomes, selectedYear, selectedMonth])

  const filteredExpenses = useMemo(() => {
    const byYear = filterByYear(expenses, selectedYear)
    if (selectedYear && selectedMonth !== null) return filterByMonth(byYear, selectedYear, selectedMonth)
    return byYear
  }, [expenses, selectedYear, selectedMonth])

  const filteredTotalIncome = useMemo(() => calculateTotal(filteredIncomes), [filteredIncomes])
  const filteredTotalExpenses = useMemo(() => calculateTotal(filteredExpenses), [filteredExpenses])
  const filteredBalance = useMemo(
    () => calculateBalance(filteredTotalIncome, filteredTotalExpenses),
    [filteredTotalIncome, filteredTotalExpenses]
  )

  const availableYears = useMemo(() => getAvailableYears(incomes, expenses), [incomes, expenses])
  const availableMonths = useMemo(
    () => getAvailableMonths(incomes, expenses, selectedYear),
    [incomes, expenses, selectedYear]
  )
  const monthlyComparison = useMemo(
    () => calculateMonthlyComparison(incomes, expenses, { type, year: selectedYear, month: selectedMonth, from, to }),
    [incomes, expenses, type, selectedYear, selectedMonth, from, to]
  )

  return {
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    filteredIncomes, filteredExpenses,
    filteredTotalIncome, filteredTotalExpenses, filteredBalance,
    availableYears, availableMonths,
    monthlyComparison,
  }
}
