import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { formatCurrency } from '../../utils/formatters';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2
// (docs/design/screens/Saldo Dashboard.dc.html)
//
// Fila de movimiento reutilizable (Dashboard hoy, Historial en el futuro).
// Grid concepto/fecha/importe (1fr 80px 120px), 44px de alto, separador
// inferior. El importe es SIEMPRE neutro — Regla Inquebrantable 4: la
// Constitución prohíbe rojo/verde permanentes en cifras. Gastos: signo "−"
// tipográfico (U+2212, NUNCA el guion ASCII "-"). Ingresos: sin signo "+",
// mismo color que los gastos.
//
// Nota de organización (regla del PO): esto es una primitiva de UI de
// propósito general (agnóstica de dominio) — vive en src/components/ds/
// junto a Button/Card/Input.

const MINUS_SIGN = '−';
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

// Fecha relativa: "Hoy" / "Ayer" / "D mmm" — mismo patrón que DSTopBar
// (Intl.DateTimeFormat con i18n.language, no un locale fijo a mano).
function formatRelativeDate(dateStr, locale, referenceDate) {
  const date = new Date(String(dateStr).substring(0, 10) + 'T12:00:00');
  if (isNaN(date)) return '';

  const dayDiff = Math.round((startOfDay(date) - startOfDay(referenceDate)) / DAY_MS);
  if (dayDiff === 0) return 'Hoy';
  if (dayDiff === -1) return 'Ayer';

  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
}

export function FilaMovimiento({ description, date, amount, type, currency = 'USD', className = '' }) {
  const { i18n } = useTranslation();
  const isExpense = type === 'expense';

  // Mismo helper que ExpenseList.jsx (formatCurrency(item.amount, item.currency
  // || 'USD')) — consistencia de moneda en toda la app. Math.abs() porque el
  // signo lo controla esta fila (regla del "−" tipográfico), no formatCurrency.
  const formattedAmount = formatCurrency(Math.abs(Number(amount) || 0), currency);

  return (
    <div
      className={cn(
        'grid items-center h-11 border-b border-ds-border-separator px-1',
        'hover:bg-ds-interaction-hover transition-colors duration-ds-fast ease-ds',
        className
      )}
      style={{ gridTemplateColumns: '1fr 80px 120px' }}
    >
      <span className="text-ds-body text-ds-text-primary truncate">{description}</span>
      <span className="text-ds-caption text-ds-text-tertiary">
        {formatRelativeDate(date, i18n.language, new Date())}
      </span>
      <span className="text-ds-numeric text-ds-text-primary tabular-nums">
        {isExpense ? MINUS_SIGN : ''}
        {formattedAmount}
      </span>
    </div>
  );
}

FilaMovimiento.propTypes = {
  description: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['income', 'expense']).isRequired,
  currency: PropTypes.string,
  className: PropTypes.string,
};
