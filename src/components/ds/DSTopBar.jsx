import { Search } from 'lucide-react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { usePeriod } from '../../contexts/PeriodContext';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2
// (docs/design/screens/Saldo Dashboard.dc.html)
//
// Barra superior del contenido: a la izquierda el overline del período
// actual ("Julio 2026" — mayúscula inicial, SIN "de"); a la derecha, un
// slot `actions` (children) para que cada pantalla inyecte lo suyo (el
// Dashboard pondrá su botón primario en Fase II) y, SOLO en mobile, el
// placeholder de búsqueda (ver comentario constitucional más abajo). Sin
// saludo, sin quote, sin tabs, sin filtros — el diseño no los contempla acá.
//
// Overline: refleja el período REAL seleccionado (`usePeriod()`, no un prop
// `date` — ese prop estaba muerto, nada lo pasaba desde App.jsx, así que se
// retira en vez de cablearlo). DSTopBar se monta dentro de <AppContent/>,
// que a su vez está envuelta en <PeriodProvider> en App.jsx — usePeriod()
// resuelve sin necesidad de mover el punto de montaje.
//   - year + month seleccionados -> ese mes/año.
//   - solo year -> el año.
//   - nada seleccionado ("todos") o `custom` -> el mes actual (igual que el
//     comportamiento previo al wiring; `custom` no tiene un mes/año único
//     que mostrar como overline, así que cae al mismo default).
// Locale: `i18n.language` real (no 'es-ES' fijo) — mismo patrón que
// LegacyPeriodFilters.jsx.

function formatMonthYear(date, locale) {
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);
  const capitalized = month.charAt(0).toUpperCase() + month.slice(1);
  return `${capitalized} ${date.getFullYear()}`;
}

function getOverline({ type, year, month }, locale) {
  if (type === 'month' && year != null && month != null) {
    return formatMonthYear(new Date(year, month), locale);
  }
  if (type === 'year' && year != null) {
    return String(year);
  }
  return formatMonthYear(new Date(), locale);
}

export function DSTopBar({ onOpenOmnibar, children }) {
  const { i18n } = useTranslation();
  const { type, year, month } = usePeriod();
  const overline = getOverline({ type, year, month }, i18n.language);

  return (
    <div className="flex items-center justify-between font-ds">
      <span className="text-ds-overline">{overline}</span>
      <div className="flex items-center gap-5">
        {/* PLACEHOLDER CONSTITUCIONAL (integration-debt.md): la Constitución
            no define búsqueda mobile; este botón es un puente técnico mínimo
            hasta que el diseño la especifique. NO extender. */}
        <button
          type="button"
          onClick={onOpenOmnibar}
          aria-label="Buscar"
          className={cn(
            'md:hidden relative inline-flex items-center justify-center rounded-ds-control',
            "before:content-[''] before:absolute before:-inset-[12px]",
            'bg-transparent text-ds-text-primary',
            'hover:bg-ds-interaction-hover active:bg-ds-interaction-pressed',
            'transition-colors duration-ds-fast ease-ds',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:ring-offset-2'
          )}
        >
          <Search width={20} height={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
        {children}
      </div>
    </div>
  );
}

DSTopBar.propTypes = {
  onOpenOmnibar: PropTypes.func.isRequired,
  children: PropTypes.node,
};
