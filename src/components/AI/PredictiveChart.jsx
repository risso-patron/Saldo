import { useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

/**
 * PredictiveChart - Gráfico con predicciones de gastos futuros
 * 
 * Muestra:
 * - Datos históricos (sólido)
 * - Predicción del próximo mes (punteado)
 * - Rango de confianza (sombreado)
 */
export const PredictiveChart = ({ historicalData, predictions, loading }) => {
  // Preparar datos para el gráfico
  const chartData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return []

    // Combinar datos históricos con predicciones
    const data = [...historicalData]

    if (predictions && predictions.totalEstimado) {
      // Agregar mes de predicción
      const nextMonth = {
        month: 'Próximo Mes',
        total: predictions.totalEstimado,
        isPrediction: true,
        // Calcular rango de confianza (±15%)
        rangeMin: predictions.totalEstimado * 0.85,
        rangeMax: predictions.totalEstimado * 1.15
      }
      data.push(nextMonth)
    }

    return data
  }, [historicalData, predictions])

  // Formato personalizado para tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null

    const data = payload[0].payload

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-2">{data.month}</p>
        
        {data.isPrediction ? (
          <>
            <div className="flex items-center justify-between gap-4 mb-1">
              <span className="text-sm text-purple-600 font-medium">Predicción:</span>
              <span className="font-bold text-purple-600">
                ${data.total?.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {data.rangeMin && data.rangeMax && (
              <div className="text-xs text-gray-500 mt-1">
                Rango estimado: ${data.rangeMin.toFixed(0)} - ${data.rangeMax.toFixed(0)}
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-600">Total:</span>
            <span className="font-bold text-gray-900">
              ${data.total?.toLocaleString('es-PA', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    )
  }

  CustomTooltip.propTypes = {
    active: PropTypes.bool,
    payload: PropTypes.array
  }

  if (loading) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Generando predicciones...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg border border-gray-200">
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="font-medium">No hay datos suficientes para generar predicciones</p>
          <p className="text-sm mt-2">Necesitas al menos 2 meses de transacciones</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Predicción de Gastos
        </h3>
        <p className="text-sm text-gray-600">
          Proyección basada en tus patrones históricos de gasto
        </p>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            {/* Gradiente para datos históricos */}
            <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            
            {/* Gradiente para predicción */}
            <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#9333ea" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
          />
          
          <YAxis 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          
          {/* Área de rango de confianza (solo para predicción) */}
          <Area
            type="monotone"
            dataKey="rangeMax"
            stroke="none"
            fill="#9333ea"
            fillOpacity={0.1}
            name="Rango máximo"
            connectNulls
          />
          
          <Area
            type="monotone"
            dataKey="rangeMin"
            stroke="none"
            fill="#ffffff"
            fillOpacity={1}
            name="Rango mínimo"
            connectNulls
          />
          
          {/* Línea principal */}
          <Area
            type="monotone"
            dataKey="total"
            stroke={(data) => data.isPrediction ? '#9333ea' : '#3b82f6'}
            strokeWidth={2}
            strokeDasharray={(data) => data.isPrediction ? '5 5' : '0'}
            fill={(data) => data.isPrediction ? 'url(#colorPrediction)' : 'url(#colorHistorical)'}
            name="Total gastos"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Leyenda de predicciones por categoría */}
      {predictions && predictions.predicciones && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Predicciones por Categoría
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(predictions.predicciones).map(([categoria, data]) => (
              <div 
                key={categoria} 
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{categoria}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {data.razon} • {data.confianza === 'alta' ? '🟢' : data.confianza === 'media' ? '🟡' : '🔴'} {data.confianza}
                  </div>
                </div>
                <div className="text-lg font-bold text-purple-600">
                  ${data.monto.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advertencias */}
      {predictions && predictions.advertencias && predictions.advertencias.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Puntos de atención
          </h4>
          <ul className="space-y-1">
            {predictions.advertencias.map((adv, index) => (
              <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

PredictiveChart.propTypes = {
  historicalData: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired
    })
  ),
  predictions: PropTypes.shape({
    predicciones: PropTypes.object,
    totalEstimado: PropTypes.number,
    advertencias: PropTypes.arrayOf(PropTypes.string)
  }),
  loading: PropTypes.bool
}

PredictiveChart.defaultProps = {
  loading: false,
  historicalData: [],
  predictions: null
}
