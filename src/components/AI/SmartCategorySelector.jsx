import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Robot } from '@phosphor-icons/react'

/** Icono animado de robot para estados de carga IA */
const RobotIcon = () => (
  <span className="inline-flex items-center animate-pulse">
    <Robot weight="duotone" size={16} color="#7C3AED" />
  </span>
)

/**
 * SmartCategorySelector - Categorizador inteligente con IA
 * 
 * Sugiere automáticamente la categoría basándose en la descripción
 * usando Claude AI. Permite override manual.
 */
export const SmartCategorySelector = ({
  description,
  selectedCategory,
  categories,
  onCategoryChange,
  onGetSuggestion,
  suggestedCategory,
  loading
}) => {
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [manualOverride, setManualOverride] = useState(false)

  // Cuando cambia la descripción, obtener sugerencia automáticamente
  useEffect(() => {
    if (description && description.trim().length >= 3 && !manualOverride) {
      // Debounce: esperar 800ms después de que el usuario deje de escribir
      const timer = setTimeout(() => {
        onGetSuggestion(description, categories)
        setShowSuggestion(true)
      }, 800)

      return () => clearTimeout(timer)
    } else {
      setShowSuggestion(false)
    }
  }, [description, categories, onGetSuggestion, manualOverride])

  // Aplicar sugerencia
  const applySuggestion = () => {
    if (suggestedCategory) {
      onCategoryChange(suggestedCategory.category)
      setShowSuggestion(false)
    }
  }

  // Cuando el usuario selecciona manualmente, marcar override
  const handleManualSelection = (category) => {
    setManualOverride(true)
    onCategoryChange(category)
    setShowSuggestion(false)
  }

  // Restablecer override cuando cambia la descripción significativamente
  useEffect(() => {
    if (description && description.trim().length >= 3) {
      setManualOverride(false)
    }
  }, [description])

  // Determinar color del indicador de confianza
  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'alta': return 'text-green-600 bg-green-100'
      case 'media': return 'text-yellow-600 bg-yellow-100'
      case 'baja': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getConfidenceLabel = (confidence) => {
    switch (confidence) {
      case 'alta': return 'Alta confianza'
      case 'media': return 'Confianza media'
      case 'baja': return 'Baja confianza'
      default: return ''
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Categoría
      </label>

      {/* Sugerencia de IA */}
      {showSuggestion && suggestedCategory && !manualOverride && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900">
                  Sugerencia de IA
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getConfidenceColor(suggestedCategory.confidence)}`}>
                  {getConfidenceLabel(suggestedCategory.confidence)}
                </span>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                Esta transacción parece ser: <span className="font-semibold">{suggestedCategory.category}</span>
              </p>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applySuggestion}
                  className="text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition font-medium"
                >
                  Aplicar
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuggestion(false)}
                  className="text-sm px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition"
                >
                  Ignorar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
            <RobotIcon />
            Analizando descripción...
          </div>
        </div>
      )}

      {/* Selector manual */}
      <div className="relative">
        <select
          value={selectedCategory}
          onChange={(e) => handleManualSelection(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
        >
          <option value="">Seleccionar categoría</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Indicador de override manual */}
      {manualOverride && (
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Categoría seleccionada manualmente
        </p>
      )}
    </div>
  )
}

SmartCategorySelector.propTypes = {
  description: PropTypes.string.isRequired,
  selectedCategory: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string).isRequired,
  onCategoryChange: PropTypes.func.isRequired,
  onGetSuggestion: PropTypes.func.isRequired,
  suggestedCategory: PropTypes.shape({
    category: PropTypes.string.isRequired,
    confidence: PropTypes.oneOf(['alta', 'media', 'baja']).isRequired
  }),
  loading: PropTypes.bool
}

SmartCategorySelector.defaultProps = {
  loading: false,
  suggestedCategory: null,
  selectedCategory: ''
}
