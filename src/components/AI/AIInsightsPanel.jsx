import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

/**
 * Panel de Insights de IA - Análisis Financiero Inteligente
 * 
 * Muestra análisis completo de finanzas con:
 * - Score de salud financiera
 * - Patrones de gasto identificados
 * - Recomendaciones accionables
 * - Resumen ejecutivo
 */
export const AIInsightsPanel = ({ 
  analysis, 
  analyzing, 
  error, 
  onAnalyze,
  monthlyTotals = null
}) => {
  const [expanded, setExpanded] = useState(false)
  const { t } = useTranslation()

  // Si no hay análisis y no está cargando, mostrar botón inicial
  if (!analysis && !analyzing && !error) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🤖 {t('ai.intro_title')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t('ai.intro_desc')}
            </p>
            <button
              onClick={() => onAnalyze(monthlyTotals)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
            >
              {t('ai.analyze_button')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Estado de carga
  if (analyzing) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 font-medium">{t('ai.analyzing')}</p>
            <p className="text-sm text-gray-500 mt-2">
              {t('ai.processing')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-6 border border-red-200">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h4 className="font-semibold text-red-900 mb-1">{t('ai.error_title')}</h4>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => onAnalyze(monthlyTotals)}
              className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium underline"
            >
              {t('ai.retry')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Mostrar análisis completo
  const { resumen, patrones, recomendaciones, score, scoreJustificacion } = analysis

  // Determinar color del score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return t('ai.score_excellent')
    if (score >= 60) return t('ai.score_good')
    if (score >= 40) return t('ai.score_regular')
    return t('ai.score_attention')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      {/* Header con Score */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {t('ai.panel_title')}
          </h3>
          
          <button
            onClick={() => onAnalyze(monthlyTotals)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            title="Actualizar análisis"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Score de Salud Financiera */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            <div className={`w-20 h-20 rounded-full ${getScoreColor(score)} flex items-center justify-center`}>
              <div className="text-center">
                <div className="text-2xl font-bold">{score}</div>
                <div className="text-xs">/ 100</div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-sm opacity-90 mb-1">{t('ai.financial_health')}</div>
            <div className="text-2xl font-bold mb-1">{getScoreLabel(score)}</div>
            <div className="text-sm opacity-80">{scoreJustificacion}</div>
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('ai.executive_summary')}
        </h4>
        <p className="text-gray-700 leading-relaxed">{resumen}</p>
      </div>

      {/* Patrones */}
      <div className="p-6 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          {t('ai.patterns_title')}
        </h4>
        <ul className="space-y-2">
          {patrones && patrones.map((patron, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <span className="text-gray-700 flex-1">{patron}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Recomendaciones */}
      <div className="p-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('ai.recommendations')}
          </h4>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expanded && (
          <ul className="mt-4 space-y-3">
            {recomendaciones && recomendaciones.map((rec, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="text-gray-700 flex-1">{rec}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer con info de costos */}
      {analysis.tokensUsed && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{t('ai.tokens_used')}: {analysis.tokensUsed.toLocaleString()}</span>
            <span>{t('ai.estimated_cost')}: ${(analysis.estimatedCost || 0).toFixed(4)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

AIInsightsPanel.propTypes = {
  analysis: PropTypes.shape({
    resumen: PropTypes.string,
    patrones: PropTypes.arrayOf(PropTypes.string),
    recomendaciones: PropTypes.arrayOf(PropTypes.string),
    score: PropTypes.number,
    scoreJustificacion: PropTypes.string,
    tokensUsed: PropTypes.number,
    estimatedCost: PropTypes.number
  }),
  analyzing: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onAnalyze: PropTypes.func.isRequired,
  monthlyTotals: PropTypes.object
}
