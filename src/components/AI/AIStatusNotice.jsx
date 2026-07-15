import PropTypes from 'prop-types'

/**
 * AIStatusNotice — copy de los 4 casos sin acceso al feature de IA
 * (spec.md Área 5, design.md §7). Reglas comunes a los 4 (MUST cumplirse en
 * todos): sin jerga técnica, sin código de error crudo, sin nombrar al
 * proveedor de IA, sin culpar al usuario. El selector manual sigue operable
 * en los 4 casos — este componente solo agrega el copy, nunca bloquea nada.
 *
 * Presentacional puro: recibe el `status` tal como lo expone `useAI()`.
 */
const COPY_BY_STATUS = {
  // Caso 1 (permanente, frontera de monetización): existe + invitación a mejorar.
  no_plan: 'Sugerir la categoría con IA es parte de un plan superior — mejorá tu plan cuando quieras para activarla.',
  // Caso 2 (temporal): espera humana, sin cifra técnica.
  rate_limited: 'Estamos con mucha demanda ahora mismo — en un momentito volvé a intentar y te sugerimos la categoría.',
  // Caso 3 (estado elegido, se respeta): invitación de una línea, ignorable, sin insistir.
  no_consent: 'Podés activar la IA de Saldo cuando quieras desde tu cuenta para recibir sugerencias de categoría.',
  // Caso 4 (falla transitoria del sistema): calmo, sin nombre de proveedor ni stack.
  provider_error: 'No pudimos sugerir la categoría esta vez — probá de nuevo en un rato.',
}

export const AIStatusNotice = ({ status }) => {
  const message = COPY_BY_STATUS[status]
  if (!message) return null

  return (
    <p
      role="status"
      className="text-xs text-slate-500 dark:text-slate-400 px-1 leading-snug"
    >
      {message}
    </p>
  )
}

AIStatusNotice.propTypes = {
  status: PropTypes.oneOf(['no_plan', 'rate_limited', 'no_consent', 'provider_error', 'idle', 'loading', null]),
}

AIStatusNotice.defaultProps = {
  status: null,
}
