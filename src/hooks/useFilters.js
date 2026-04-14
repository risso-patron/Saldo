import { useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
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
 */
export function useFilters(incomes, expenses) {
  const [selectedYear, setSelectedYear] = useLocalStorage('budgetrp_ui_selectedYear', null)
  const [selectedMonth, setSelectedMonth] = useLocalStorage('budgetrp_ui_selectedMonth', null)

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
  const monthlyComparison = useMemo(() => calculateMonthlyComparison(incomes, expenses), [incomes, expenses])

  return {
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    filteredIncomes, filteredExpenses,
    filteredTotalIncome, filteredTotalExpenses, filteredBalance,
    availableYears, availableMonths,
    monthlyComparison,
  }
}
