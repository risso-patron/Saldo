import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatters';
import { formatRelativeDate } from '../../utils/movementGrouping';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2
// (docs/design/screens/Saldo Dashboard.dc.html)
//
// Fila de movimiento reutilizable (Dashboard hoy, Historial desde Checkpoint
// IV-A). Grid concepto/columna-media/importe (1fr 80px 120px), 44px de alto,
// separador inferior. El importe es SIEMPRE neutro — Regla Inquebrantable 4:
// la Constitución prohíbe rojo/verde permanentes en cifras. Gastos: signo "−"
// tipográfico (U+2212, NUNCA el guion ASCII "-"). Ingresos: sin signo "+",
// mismo color que los gastos.
//
// Nota de organización (regla del PO): esto es una primitiva de UI de
// propósito general (agnóstica de dominio) — vive en src/components/ds/
// junto a Button/Card/Input.
//
// Checkpoint IV-A — la fecha relativa ("Hoy"/"Ayer"/"D mmm") ya NO vive acá
// como función privada: se extrajo a src/utils/movementGrouping.js (misma
// fuente de verdad que usa la cabecera de GrupoDía en Historial, para que
// ambas pantallas nunca puedan discrepar sobre qué cuenta como "hoy").
//
// Props aditivas para Historial (ambas con default que preserva el
// comportamiento exacto de Dashboard, que no las pasa):
//   - `category`: si se provee, reemplaza la fecha relativa en la columna
//     media (dentro de un GrupoDía la fecha ya está en la cabecera del
//     grupo — repetirla por fila sería ruido redundante).
//   - `showRelativeDate` (default true): permite ocultar la fecha relativa
//     sin necesidad de pasar `category` (p.ej. una fila de ingreso dentro de
//     un grupo, sin categoría propia en el modelo de datos).

const MINUS_SIGN = '−';

export const FilaMovimiento = forwardRef(function FilaMovimiento({
  description,
  date,
  amount,
  type,
  currency = 'USD',
  category = null,
  showRelativeDate = true,
  className = '',
  onClick = undefined,
  tabIndex = undefined,
  onKeyDown = undefined,
  onFocus = undefined,
}, ref) {
  const { i18n } = useTranslation();
  const isExpense = type === 'expense';

  // Mismo helper que ExpenseList.jsx (formatCurrency(item.amount, item.currency
  // || 'USD')) — consistencia de moneda en toda la app. Math.abs() porque el
  // signo lo controla esta fila (regla del "−" tipográfico), no formatCurrency.
  const formattedAmount = formatCurrency(Math.abs(Number(amount) || 0), currency);

  const middleColumnContent = category
    ?? (showRelativeDate ? formatRelativeDate(date, i18n.language, new Date()) : null);

  // Checkpoint IV-B — prop aditiva `onClick` (default undefined, preserva
  // EXACTAMENTE el comportamiento de Dashboard, que no la pasa): cuando se
  // provee, la fila es un elemento accesible real (<button type="button">,
  // no un <div onClick> sin equivalente de foco/teclado) — Historial la usa
  // para expandir el detalle de un movimiento. Mismas clases visuales en
  // ambos casos, un solo bloque de JSX (Wrapper dinámico) en vez de duplicar
  // los children.
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      ref={ref}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      className={cn(
        'grid items-center h-11 border-b border-ds-border-separator px-1',
        'hover:bg-ds-interaction-hover transition-colors duration-ds-fast ease-ds',
        // Checkpoint IV-D — anillo de foco 2px acento (spec: "foco anillo
        // acento 2 px"), no el outline genérico global — mismo patrón que
        // Button.jsx. Solo cuando la fila es interactiva (onClick presente);
        // Dashboard, que no pasa onClick, no se ve afectado.
        onClick && 'w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent',
        className
      )}
      style={{ gridTemplateColumns: '1fr 80px 120px' }}
    >
      <span className="text-ds-body text-ds-text-primary truncate">{description}</span>
      {middleColumnContent && (
        <span className="text-ds-caption text-ds-text-tertiary truncate">{middleColumnContent}</span>
      )}
      <span className="text-ds-numeric text-ds-text-primary tabular-nums">
        {isExpense ? MINUS_SIGN : ''}
        {formattedAmount}
      </span>
    </Wrapper>
  );
});

FilaMovimiento.propTypes = {
  description: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['income', 'expense']).isRequired,
  currency: PropTypes.string,
  category: PropTypes.string,
  showRelativeDate: PropTypes.bool,
  tabIndex: PropTypes.number,
  onKeyDown: PropTypes.func,
  onFocus: PropTypes.func,
  className: PropTypes.string,
  onClick: PropTypes.func,
};
