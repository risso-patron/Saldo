import { useRef, useState } from 'react';
import { PricingPlans } from './PricingPlans';
import { useModalA11y } from '../../hooks/useModalA11y';

/**
 * Modal que se muestra cuando un usuario free intenta usar una función premium
 */
export const UpgradeModal = ({ isOpen, onClose, feature }) => {
  const [showPricing, setShowPricing] = useState(false);
  const dialogRef = useRef(null);
  // RC-1.7/A5: Escape, trampa de Tab, foco inicial y retorno de foco —
  // mismo comportamiento que Sheet.jsx/ConfirmDialog.jsx, sin cambiar la
  // estructura visual de este modal.
  useModalA11y(isOpen, onClose, dialogRef);

  if (!isOpen) return null;

  const featureMessages = {
    export_csv: {
      title: 'Exportar tus movimientos',
      description: 'Descarga tus movimientos en una hoja de cálculo para revisarlos donde quieras.',
      icon: '📊',
    },
    export_pdf: {
      title: 'Exportar un resumen',
      description: 'Genera un resumen de tus movimientos y gráficos, listo para guardar o compartir.',
      icon: '📑',
    },
    ai_analysis: {
      title: '🤖 Análisis con IA',
      description: 'Obtén insights inteligentes sobre tus gastos con el poder de Claude AI.',
      icon: '🧠',
    },
    credit_cards: {
      title: '💳 Tarjetas de Crédito',
      description: 'Gestiona tus tarjetas de crédito y controla tus pagos mensuales.',
      icon: '💳',
    },
    advanced_charts: {
      title: '📊 Gráficos Avanzados',
      description: 'Visualiza tus finanzas con 4 tipos de gráficos profesionales.',
      icon: '📈',
    },
    unlimited_goals: {
      title: '🎯 Metas Ilimitadas',
      description: 'Crea todas las metas financieras que necesites sin límites.',
      icon: '🎯',
    },
    ai_predictions: {
      title: '🔮 Predicciones',
      description: 'Predicciones de gastos futuros basadas en tus patrones históricos.',
      icon: '🔮',
    },
  };

  const featureInfo = featureMessages[feature] || {
    title: 'Función Premium',
    description: 'Esta función está disponible solo para usuarios PRO.',
    icon: '⭐',
  };

  if (showPricing) {
    return <PricingPlans onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        tabIndex={-1}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <div className="text-6xl mb-3">{featureInfo.icon}</div>
            <h3 id="upgrade-modal-title" className="text-2xl font-bold">{featureInfo.title}</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
            {featureInfo.description}
          </p>

          {/* Beneficios de PRO */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="text-xl">✨</span>
              Con PRO también obtienes:
            </h4>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Exportar sin límite</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>🤖 Análisis con IA de Claude</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>📊 4 gráficos avanzados</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>💳 Gestión de tarjetas de crédito</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>🔮 Predicciones de gastos</span>
              </li>
            </ul>
          </div>

          {/* Pricing Options */}
          <div className="space-y-3 mb-6">
            <div className="border-2 border-purple-500 rounded-xl p-4 bg-purple-50 dark:bg-purple-900/20">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Plan Mensual</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">$4.99<span className="text-sm text-gray-600 dark:text-gray-400">/mes</span></div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Cancela cuando quieras
                </div>
              </div>
            </div>

            <div className="border-2 border-green-500 rounded-xl p-4 bg-green-50 dark:bg-green-900/20 relative">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">Plan Anual</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">$49<span className="text-sm text-gray-600 dark:text-gray-400">/año</span></div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Solo $4.08/mes (18% menos)
                </div>
              </div>
            </div>

            <div className="border-2 border-yellow-500 rounded-xl p-4 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    Lifetime <span className="text-xl">♾️</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">$79<span className="text-sm text-gray-600 dark:text-gray-400"> pago único</span></div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sin renovaciones
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setShowPricing(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
            >
              Ver planes
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Continuar con Plan Gratuito
            </button>
          </div>

          {/* Trust Signals */}
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>🔒 Pago seguro con Stripe</p>
            <p className="mt-1">💯 Garantía de 30 días | ❌ Cancela cuando quieras</p>
          </div>
        </div>
      </div>
    </div>
  );
};
