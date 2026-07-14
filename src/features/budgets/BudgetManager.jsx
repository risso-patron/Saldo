import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { usePeriod } from '../../contexts/PeriodContext'
import { useCurrency } from '../../contexts/CurrencyContext'
import { filterByDateRange } from '../../utils/calculations'
import { EXPENSE_CATEGORIES } from '../../constants/categories'
import { motion, AnimatePresence } from 'framer-motion'

const BUDGETS_KEY = 'budget_calculator_budgets'

/**
 * BudgetManager — Presupuestos por categoría con barras de progreso
 * Inspirado en MonAi: "Pon límites. Mantente al día."
 */
export function BudgetManager({ expenses }) {
  const { t, i18n } = useTranslation()
  const { dateRange, type, year, month, from, to } = usePeriod()
  const { convertCurrency, formatAmount, selectedCurrency, currencyInfo } = useCurrency()
  const [budgets, setBudgets] = useLocalStorage(BUDGETS_KEY, {})
  const [editingCategory, setEditingCategory] = useState(null)
  const [inputValue, setInputValue] = useState('')
  const [inputNote, setInputNote] = useState('')

  const getBudgetData = (catValue) => {
    const data = budgets[catValue]
    if (typeof data === 'number') return { limit: data, note: '' }
    if (data && typeof data === 'object') return data
    return null
  }

  // Gastos del período global elegido por categoría (dashboard, presupuestos y
  // exportación MUST coincidir en el mismo rango — spec "BudgetManager respeta
  // el período global"). Sin período elegido (type='all', dateRange=null) no
  // hay rango que aplicar: se consideran todas las transacciones.
  const periodSpending = useMemo(() => {
    const relevant = dateRange
      ? filterByDateRange(expenses, dateRange.from, dateRange.to)
      : expenses
    const result = {}

    relevant.forEach(exp => {
      if (!exp.category) return
      // Cada transacción guarda su propia moneda (useTransactions) — normalizar
      // a USD base antes de sumar, para no mezclar monedas distintas en un total.
      const amountUSD = convertCurrency(exp.amount, exp.currency || 'USD', 'USD')
      result[exp.category] = (result[exp.category] || 0) + amountUSD
    })

    return result
  }, [expenses, dateRange, convertCurrency])

  // Categorías con presupuesto asignado + las que tienen gastos en el período
  const activeCategories = useMemo(() => {
    const cats = new Set([
      ...Object.keys(budgets),
      ...Object.keys(periodSpending),
    ])
    return EXPENSE_CATEGORIES.filter(c => cats.has(c.value))
  }, [budgets, periodSpending])

  const handleSaveBudget = (category) => {
    const val = parseFloat(inputValue)
    if (isNaN(val) || val <= 0) return
    // El usuario escribe el límite en SU moneda; se guarda en USD base para ser
    // coherente con los gastos normalizados y con los límites ya existentes.
    const limitUSD = convertCurrency(val, selectedCurrency, 'USD')
    setBudgets(prev => ({ ...prev, [category]: { limit: limitUSD, note: inputNote.trim() } }))
    setEditingCategory(null)
    setInputValue('')
    setInputNote('')
  }

  const handleRemoveBudget = (category) => {
    setBudgets(prev => {
      const next = { ...prev }
      delete next[category]
      return next
    })
  }

  const startEdit = (category) => {
    setEditingCategory(category)
    const data = getBudgetData(category)
    // Prefill en la moneda del usuario (inversa de handleSaveBudget)
    setInputValue(data?.limit != null
      ? Number(convertCurrency(data.limit, 'USD', selectedCurrency).toFixed(2)).toString()
      : '')
    setInputNote(data?.note || '')
  }

  const getBarColor = (pct) => {
    if (pct >= 100) return 'bg-red-500'
    if (pct >= 80) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  const getTextColor = (pct) => {
    if (pct >= 100) return 'text-red-400'
    if (pct >= 80) return 'text-yellow-400'
    return 'text-emerald-400'
  }

  // Mostrar en la moneda elegida — formatAmount (CurrencyContext) recibe USD base
  // y convierte/formatea, mismo patrón que BalanceCard y el resto del dashboard.
  const formatCurrency = (amount) => formatAmount(amount || 0)

  // Etiqueta del período activo para el encabezado — MUST ser consistente con
  // los montos mostrados abajo (misma fuente `usePeriod()`), no el mes
  // calendario real. Antes el título usaba `new Date()` directo y podía leerse
  // "Julio" mientras los montos ya reflejaban el período elegido (ej. Marzo).
  const periodLabel = useMemo(() => {
    switch (type) {
      case 'month':
        return new Date(year, month, 1).toLocaleString(i18n.language, { month: 'long', year: 'numeric' })
      case 'year':
        return String(year)
      case 'custom':
        return `${from} — ${to}`
      case 'all':
      default:
        return t('header.all')
    }
  }, [type, year, month, from, to, i18n.language, t])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            🎯 Presupuestos por Categoría
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {periodLabel} — {t('budgets.monthly_limits')}
          </p>
        </div>
      </div>

      {/* Lista de categorías activas */}
      {activeCategories.length > 0 && (
        <div className="space-y-4 mb-6">
          {activeCategories.map(cat => {
            const spent = periodSpending[cat.value] || 0
            const data = getBudgetData(cat.value)
            const limit = data?.limit
            const note = data?.note
            const pct = limit ? Math.min((spent / limit) * 100, 100) : null
            const isEditing = editingCategory === cat.value

            return (
              <motion.div
                key={cat.value}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
              >
                {/* Fila superior: categoría + montos */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 dark:text-gray-200 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      {cat.label}
                    </div>
                    {note && <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal ml-7 italic">{note}</span>}
                  </span>
                  <div className="flex items-center gap-3">
                    {limit ? (
                      <span className={`text-sm font-semibold ${getTextColor(pct)}`}>
                        {formatCurrency(spent)} / {formatCurrency(limit)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">{formatCurrency(spent)} gastado</span>
                    )}
                    <button
                      onClick={() => startEdit(cat.value)}
                      className="text-xs text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                    >
                      {limit ? 'Editar' : 'Fijar límite'}
                    </button>
                    {limit && (
                      <button
                        onClick={() => handleRemoveBudget(cat.value)}
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Barra de progreso */}
                {limit && pct !== null && (
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className={`h-2.5 rounded-full ${getBarColor(pct)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                )}

                {/* Mensaje si supera el límite */}
                {pct >= 100 && (
                  <p className="text-xs text-red-400 mt-1 font-medium">
                    ⚠️ Límite superado en {formatCurrency(spent - limit)}
                  </p>
                )}

                {/* Input edición en línea */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 flex flex-col gap-2"
                    >
                      <input
                        type="text"
                        value={inputNote}
                        onChange={e => setInputNote(e.target.value)}
                        placeholder="Especificar alcance (Ej: Netflix, Gym..)"
                        className="w-full px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSaveBudget(cat.value) }}
                          placeholder={`Límite mensual (${currencyInfo.symbol})`}
                          autoFocus
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-500 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        />
                        <button
                          onClick={() => handleSaveBudget(cat.value)}
                          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg font-medium"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 text-gray-700 dark:text-white text-sm rounded-lg"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Selector para agregar nuevas categorías sin gastos */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wide">
          Fijar límite para otra categoría
        </p>
        <div className="flex flex-wrap gap-2">
          {EXPENSE_CATEGORIES.filter(c => !activeCategories.find(a => a.value === c.value)).map(cat => (
            <button
              key={cat.value}
              onClick={() => {
                setEditingCategory(cat.value)
                setInputValue('')
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 
                hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-gray-600 dark:text-gray-300 
                text-sm rounded-lg transition-colors"
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
          {/* Formulario inline para categorías fuera de la lista activa */}
          <AnimatePresence>
            {editingCategory && !activeCategories.find(c => c.value === editingCategory) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full mt-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 flex flex-col gap-2"
              >
                <div className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1 mb-1">
                  {EXPENSE_CATEGORIES.find(c => c.value === editingCategory)?.icon} {editingCategory}
                </div>
                
                <input
                  type="text"
                  value={inputNote}
                  onChange={e => setInputNote(e.target.value)}
                  placeholder="Especificar (Ej: Salidas, Apps..)"
                  className="w-full px-3 py-1.5 text-xs border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveBudget(editingCategory) }}
                    placeholder="Límite mensual ($)"
                    autoFocus
                    className="flex-1 px-3 py-1.5 text-sm border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <button
                    onClick={() => handleSaveBudget(editingCategory)}
                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm rounded-lg font-medium"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 text-gray-700 dark:text-white text-sm rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Estado vacío */}
      {activeCategories.length === 0 && (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500">
          <p className="text-4xl mb-3">💰</p>
          <p className="text-sm">Aún no tienes límites configurados.</p>
          <p className="text-xs mt-1">Selecciona una categoría arriba para comenzar.</p>
        </div>
      )}
    </div>
  )
}
