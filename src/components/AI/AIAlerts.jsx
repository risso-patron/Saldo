import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

/**
 * AIAlerts - Sistema de alertas y notificaciones inteligentes
 * 
 * Muestra:
 * - Badge con contador de alertas
 * - Panel de notificaciones
 * - Acciones sugeridas
 * - Niveles de severidad
 */
export const AIAlerts = ({ alerts, loading, onRefresh, onDismiss }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  // Contar alertas por severidad
  const alertCount = alerts?.length || 0
  const criticalCount = alerts?.filter(a => a.severidad === 'alta').length || 0

  // Iconos por tipo de alerta
  const getAlertIcon = (tipo) => {
    switch (tipo) {
      case 'gasto_inusual':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        )
      case 'tendencia_alta':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )
      case 'categoria_nueva':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  // Colores por severidad
  const getSeverityColor = (severidad) => {
    switch (severidad) {
      case 'alta':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'media':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baja':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSeverityBadgeColor = (severidad) => {
    switch (severidad) {
      case 'alta':
        return 'bg-red-600'
      case 'media':
        return 'bg-yellow-600'
      case 'baja':
        return 'bg-blue-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="relative">
      {/* Badge de alertas */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
        title="Alertas inteligentes"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Badge contador */}
        {alertCount > 0 && (
          <span className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white rounded-full ${criticalCount > 0 ? 'bg-red-600' : 'bg-purple-600'}`}>
            {alertCount > 9 ? '9+' : alertCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <>
          {/* Backdrop para cerrar al hacer click fuera */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {t('ai.alerts_title')}
                </h3>
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="p-1.5 hover:bg-white rounded transition"
                  title="Actualizar"
                >
                  <svg 
                    className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600">
                {alertCount === 0 
                  ? t('ai.alerts_none') 
                  : t('ai.alerts_count', { count: alertCount })
                }
              </p>
            </div>

            {/* Lista de alertas */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-3"></div>
                  <p className="text-sm text-gray-600">{t('ai.alerts_analyzing')}</p>
                </div>
              ) : alertCount === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600 font-medium mb-1">{t('ai.alerts_ok')}</p>
                  <p className="text-sm text-gray-500">
                    {t('ai.alerts_ok_desc')}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {alerts.map((alerta, index) => (
                    <div 
                      key={index}
                      className={`p-4 hover:bg-gray-50 transition border-l-4 ${getSeverityColor(alerta.severidad)}`}
                    >
                      {/* Header de alerta */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getSeverityColor(alerta.severidad)}`}>
                          {getAlertIcon(alerta.tipo)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {alerta.categoria}
                            </h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getSeverityBadgeColor(alerta.severidad)} text-white`}>
                              {alerta.severidad}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {alerta.mensaje}
                          </p>
                        </div>
                      </div>

                      {/* Acción sugerida */}
                      {alerta.accionSugerida && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs text-gray-600 mb-1 font-medium">
                            💡 {t('ai.suggested_action')}:
                          </p>
                          <p className="text-sm text-gray-900">
                            {alerta.accionSugerida}
                          </p>
                        </div>
                      )}

                      {/* Botón de dismissal */}
                      {onDismiss && (
                        <button
                          onClick={() => onDismiss(index)}
                          className="mt-3 text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                          {t('ai.alerts_mark_seen')}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer con info */}
            <div className="p-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                {t('ai.alerts_weekly')}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

AIAlerts.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      tipo: PropTypes.oneOf(['gasto_inusual', 'tendencia_alta', 'categoria_nueva']).isRequired,
      categoria: PropTypes.string.isRequired,
      mensaje: PropTypes.string.isRequired,
      severidad: PropTypes.oneOf(['alta', 'media', 'baja']).isRequired,
      accionSugerida: PropTypes.string
    })
  ),
  loading: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
  onDismiss: PropTypes.func
}

AIAlerts.defaultProps = {
  alerts: [],
  loading: false,
  onDismiss: null
}
