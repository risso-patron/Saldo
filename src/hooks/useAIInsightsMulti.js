import { useState, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  analyzeFinances, 
  suggestCategory, 
  bulkCategorizeTransactions,
  predictNextMonthExpenses,
  detectAnomalies,
  getProviderStatus,
  getAvailableProviders,
  mapCSVColumns,
} from '../lib/ai-providers'

/**
 * Hook de IA — proveedor único: Groq (Llama 3.3 70B) vía proxy seguro Netlify
 * Rate limit: 30 req/min (Groq free tier)
 */
export const useAIInsights = (transactions = []) => {
  const { user } = useAuth()
  
  // Estados para análisis financiero
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState(null)
  
  // Estados para predicciones
  const [predictions, setPredictions] = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [predictionError, setPredictionError] = useState(null)
  
  // Estados para alertas
  const [alerts, setAlerts] = useState([])
  const [alertsLoading, setAlertsLoading] = useState(false)
  const [alertsError, setAlertsError] = useState(null)
  
  // Estado para categorización
  const [suggestedCategory, setSuggestedCategory] = useState(null)
  const [categorizing, setCategorizing] = useState(false)

  // Estado de proveedores
  const [providerStatus] = useState(getProviderStatus())
  
  /**
   * Verifica qué proveedores están disponibles
   */
  const checkProviders = useCallback(() => {
    const available = getAvailableProviders()
    console.log('🤖 Proveedores de IA disponibles:', available)
    
    if (available.length === 0) {
      console.warn('⚠️ No hay proveedores de IA configurados')
      console.info('📖 Lee docs/FREE_AI_SETUP.md para configurar opciones gratuitas')
    }
    
    return available
  }, [])

  /**
   * Analiza las finanzas del usuario
   */
  const runAnalysis = useCallback(async (monthlyTotals = null) => {
    if (!user) {
      setAnalysisError('Debes estar autenticado para usar esta función')
      return
    }

    if (!transactions || transactions.length === 0) {
      setAnalysisError('No hay transacciones para analizar')
      return
    }

    // Verificar proveedores disponibles
    const available = checkProviders()
    if (available.length === 0) {
      setAnalysisError('El servicio de IA no está disponible en este momento')
      return
    }

    try {
      setAnalyzing(true)
      setAnalysisError(null)
      
      console.log('🔄 Analizando', transactions.length, 'transacciones...')
      
      const result = await analyzeFinances(transactions, user.id, monthlyTotals)
      
      console.log('✅ Análisis completado con', result.provider)
      
      setAnalysis(result)
      
      // Guardar timestamp del último análisis
      localStorage.setItem('lastAnalysis', Date.now().toString())
      
      return result
    } catch (error) {
      console.error('❌ Error en análisis:', error)
      setAnalysisError(error.message || 'Error al analizar finanzas')
      return null
    } finally {
      setAnalyzing(false)
    }
  }, [transactions, user, checkProviders])

  /**
   * Sugiere categoría para una transacción
   */
  const getCategorySuggestion = useCallback(async (description) => {
    const available = checkProviders()
    if (available.length === 0) {
      return { category: 'Otros', confidence: 0.5 }
    }

    try {
      setCategorizing(true)
      const result = await suggestCategory(description)
      setSuggestedCategory(result)
      return result
    } catch (error) {
      console.error('Error sugiriendo categoría:', error)
      return { category: 'Otros', confidence: 0.5 }
    } finally {
      setCategorizing(false)
    }
  }, [checkProviders])

  /**
   * Predice gastos del próximo mes
   */
  const runPrediction = useCallback(async () => {
    if (!user) {
      setPredictionError('Debes estar autenticado')
      return
    }

    if (!transactions || transactions.length < 5) {
      setPredictionError('Necesitas al menos 5 transacciones para predicciones')
      return
    }

    const available = checkProviders()
    if (available.length === 0) {
      setPredictionError('No hay proveedores de IA configurados')
      return
    }

    try {
      setPredicting(true)
      setPredictionError(null)
      
      const result = await predictNextMonthExpenses(transactions, user.id)
      setPredictions(result)
      
      return result
    } catch (error) {
      console.error('Error en predicción:', error)
      setPredictionError(error.message)
      return null
    } finally {
      setPredicting(false)
    }
  }, [transactions, user, checkProviders])

  /**
   * Detecta anomalías en transacciones
   */
  const checkAnomalies = useCallback(async () => {
    if (!user) {
      setAlertsError('Debes estar autenticado')
      return
    }

    if (!transactions || transactions.length < 10) {
      setAlertsError('Necesitas al menos 10 transacciones')
      return
    }

    const available = checkProviders()
    if (available.length === 0) {
      setAlertsError('No hay proveedores de IA configurados')
      return
    }

    try {
      setAlertsLoading(true)
      setAlertsError(null)
      
      const result = await detectAnomalies(transactions, user.id)
      setAlerts(result.alertas || [])
      
      return result
    } catch (error) {
      console.error('Error detectando anomalías:', error)
      setAlertsError(error.message)
      return null
    } finally {
      setAlertsLoading(false)
    }
  }, [transactions, user, checkProviders])

  /**
   * Categoriza múltiples transacciones en lote
   * ÚTIL PARA IMPORTACIÓN CSV
   */
  const bulkCategorize = useCallback(async (transactionsArray) => {
    const available = checkProviders()
    if (available.length === 0) {
      console.warn('No hay IA configurada, usando categorías por defecto')
      return transactionsArray.map(t => ({ ...t, category: 'Otros' }))
    }

    const total = transactionsArray.length
    console.log(`🔄 Categorizando ${total} transacciones en lote (batches de 80)...`)

    const descriptions = transactionsArray.map(t => t.description)
    const batchResults = await bulkCategorizeTransactions(descriptions)

    const categorized = transactionsArray.map((t, i) => ({
      ...t,
      category: batchResults[i]?.category || 'Otros',
      aiConfidence: batchResults[i]?.aiConfidence ?? 0,
    }))

    const success = categorized.filter(c => c.category !== 'Otros').length
    console.log(`✅ Categorización en lote completada: ${success}/${total} asignadas`)

    return categorized
  }, [checkProviders])

  /**
   * Mapea columnas de un CSV bancario usando IA
   * @param {string[]} headers - Cabeceras del CSV
   * @param {string[][]} sampleRows - Primeras filas de datos (máx. 3)
   * @returns {Promise<Object>} columnMap { fecha, descripcion, monto, ... }
   */
  const mapImportColumns = useCallback(async (headers, sampleRows) => {
    const available = checkProviders()
    if (available.length === 0) {
      throw new Error('No hay proveedores de IA configurados')
    }
    const result = await mapCSVColumns(headers, sampleRows)
    return result.columnMap
  }, [checkProviders])

  return {
    // Estados
    analysis,
    analyzing,
    analysisError,
    predictions,
    predicting,
    predictionError,
    alerts,
    alertsLoading,
    alertsError,
    suggestedCategory,
    categorizing,
    providerStatus,
    
    // Funciones
    runAnalysis,
    getCategorySuggestion,
    runPrediction,
    checkAnomalies,
    checkProviders,
    bulkCategorize,
    mapImportColumns,
  }
}
