import PropTypes from 'prop-types'
import { Robot } from '@phosphor-icons/react'

/**
 * AIInsightCard — contenedor DEFINITIVO de "Una idea sobre tu plata"
 * (proposal.md Decisión 1 y §7.1, spec.md Área 1, design.md Arquitectura de
 * Confianza — Principios 1, 2, 6, 7). Checkpoint 4 de `insights-ia-real`.
 *
 * Reutilizable: sin imports ni asunciones de dónde se monta (Dashboard,
 * pantalla dedicada, etc.). Presentacional puro — como `AIStatusNotice` y
 * `AIConsentPrompt`, no importa `useAI()` ni ningún servicio; todo llega por
 * props para que la lógica real (elegibilidad, cálculo del hallazgo) pueda
 * conectarse en un checkpoint futuro sin modificar esta UI.
 *
 * `status` cubre exactamente 6 estados (ni más ni menos, decisión del PO):
 * - insufficient_history: historial todavía no alcanza el criterio objetivo
 *   de spec.md Área 1 — mensaje alentador, sin exponer el umbral numérico
 *   interno (20 gastos / 28 días son un detalle de implementación, no algo
 *   que la persona deba ver).
 * - loading: cálculo en curso, breve y calmo.
 * - idea_available: renderiza `idea.message`/`idea.category` recibidos por
 *   props — este componente NO genera el hallazgo, solo lo muestra rotulado
 *   como IA (Principio 2).
 * - ai_disabled: sin consentimiento activo — invitación de una línea, sin
 *   insistir (mismo espíritu que `AIStatusNotice` caso `no_consent`).
 * - no_plan: fuera del plan actual — invitación a mejorar, sin castigar
 *   (mismo espíritu que `AIStatusNotice` caso `no_plan`).
 * - error: falla transitoria — calmo, sin nombrar al proveedor, invita a
 *   reintentar (mismo espíritu que `AIStatusNotice` caso `provider_error`).
 *
 * Cualquier `status` no reconocido (incluido `undefined`/`null`) no
 * renderiza nada: cuando la lógica de abstención de spec.md Área 1 (Principio
 * 1 — "nunca fabricar conocimiento") se conecte más adelante, simplemente no
 * pasa ningún `status` reconocido, sin que este componente necesite saber
 * por qué.
 */

/** Icono animado de robot para el estado de carga — mismo patrón que SmartCategorySelector */
const RobotIcon = () => (
  <span className="inline-flex items-center animate-pulse">
    <Robot weight="duotone" size={16} color="#7C3AED" />
  </span>
)

const CARD_CLASS =
  'p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700 rounded-lg'

const MESSAGE_CLASS = 'text-sm text-slate-700 dark:text-slate-200 leading-snug'

const STATUS_MESSAGE = {
  insufficient_history:
    'Todavía estamos conociendo tus movimientos. En cuanto tengamos suficiente historial, vas a ver acá una idea sobre tu plata.',
  ai_disabled:
    'Podés activar la IA de Saldo cuando quieras desde tu cuenta para empezar a ver ideas sobre tu plata.',
  no_plan:
    'Mostrarte una idea sobre tu plata es parte de un plan superior — mejorá tu plan cuando quieras para activarla.',
  error: 'No pudimos traer tu idea esta vez — probá de nuevo en un rato.',
}

export const AIInsightCard = ({ status, idea }) => {
  if (status === 'loading') {
    return (
      <div role="status" className={CARD_CLASS}>
        <div className="flex items-center gap-2 text-sm text-violet-700 dark:text-violet-300">
          <RobotIcon />
          Buscando una idea sobre tu plata...
        </div>
      </div>
    )
  }

  if (status === 'idea_available') {
    if (!idea) return null

    return (
      <div className={CARD_CLASS}>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Una idea sobre tu plata
          </p>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-200">
            IA
          </span>
        </div>
        <p className={MESSAGE_CLASS}>{idea.message}</p>
        {idea.category && (
          <span className="inline-block mt-2 text-xs text-violet-600 dark:text-violet-300">
            {idea.category}
          </span>
        )}
      </div>
    )
  }

  const message = STATUS_MESSAGE[status]
  if (!message) return null

  return (
    <div role="status" className={CARD_CLASS}>
      <p className={MESSAGE_CLASS}>{message}</p>
    </div>
  )
}

AIInsightCard.propTypes = {
  status: PropTypes.oneOf([
    'insufficient_history',
    'loading',
    'idea_available',
    'ai_disabled',
    'no_plan',
    'error',
  ]),
  idea: PropTypes.shape({
    category: PropTypes.string,
    message: PropTypes.string.isRequired,
  }),
}

AIInsightCard.defaultProps = {
  status: null,
  idea: null,
}
