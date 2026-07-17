import PropTypes from 'prop-types';

// Design System — Saldo Design Constitution v1.2
// (docs/design/screens/Saldo Dashboard.dc.html)
//
// Barra superior del contenido: a la izquierda el overline del período
// actual ("Julio 2026" — mayúscula inicial, SIN "de", locale es); a la
// derecha un slot `actions` (children) para que cada pantalla inyecte lo
// suyo (el Dashboard pondrá su botón primario en Fase II). Sin saludo, sin
// quote, sin tabs, sin filtros — el diseño no los contempla acá.

function formatPeriodOverline(date = new Date(), locale = 'es-ES') {
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  const capitalized = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capitalized} ${date.getFullYear()}`;
}

export function DSTopBar({ date, children }) {
  return (
    <div className="flex items-center justify-between font-ds">
      <span className="text-ds-overline">{formatPeriodOverline(date)}</span>
      {children && <div className="flex items-center gap-5">{children}</div>}
    </div>
  );
}

DSTopBar.propTypes = {
  date: PropTypes.instanceOf(Date),
  children: PropTypes.node,
};
