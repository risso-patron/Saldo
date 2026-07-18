import PropTypes from 'prop-types';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2 (Checkpoint III-A)
// (docs/design/screens/Saldo Nuevo Movimiento.dc.html)
//
// Tabs — primitiva genérica de texto subrayado (Gasto/Ingreso en el mockup),
// SIN píldoras ni cajas: activo con border-bottom 2px sólido (ds-text-primary)
// y texto primary/semibold; inactivo con borde transparente y texto
// tertiary/normal. gap 24px entre opciones.

export function Tabs({ options, value, onChange }) {
  return (
    <div role="tablist" className="flex items-center gap-6">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              'pb-2 text-ds-body border-b-2 transition-colors duration-ds-fast ease-ds',
              isActive
                ? 'border-ds-text-primary text-ds-text-primary font-semibold'
                : 'border-transparent text-ds-text-tertiary font-normal'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

Tabs.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
