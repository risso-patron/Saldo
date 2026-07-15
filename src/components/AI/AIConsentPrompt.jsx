import PropTypes from 'prop-types'

/**
 * AIConsentPrompt — pedido de consentimiento just-in-time (spec.md Área 6,
 * design.md §3.2, proposal.md §7.1). Copy EXACTO ya cerrado a nivel de
 * producto: nunca nombra al proveedor, nunca aparece en onboarding — solo se
 * monta cuando el consumidor (BudgetForm) detecta la primera descripción de
 * >=3 caracteres sin consentimiento activo.
 *
 * Presentacional puro: no conoce `useAI()`, recibe `onAccept`/`onDecline`.
 */
export const AIConsentPrompt = ({ onAccept, onDecline }) => (
  <div className="p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-lg space-y-3">
    <p className="text-sm text-slate-700 dark:text-slate-200">
      Para sugerirte la categoría, Saldo le muestra la descripción de este movimiento a un servicio que nos ayuda con eso. Vos decidís.
    </p>
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onAccept}
        className="text-sm px-3 py-1 bg-violet-600 text-white rounded hover:bg-violet-700 transition font-medium"
      >
        Activar
      </button>
      <button
        type="button"
        onClick={onDecline}
        className="text-sm px-3 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition"
      >
        Ahora no
      </button>
    </div>
  </div>
)

AIConsentPrompt.propTypes = {
  onAccept: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
}
