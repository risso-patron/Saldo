import { useRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2 (Checkpoint III-A)
// (docs/design/screens/Saldo Nuevo Movimiento.dc.html)
//
// Tabs — primitiva genérica de texto subrayado (Gasto/Ingreso en el mockup),
// SIN píldoras ni cajas: activo con border-bottom 2px sólido (ds-text-primary)
// y texto primary/semibold; inactivo con borde transparente y texto
// tertiary/normal. gap 24px entre opciones.
//
// Checkpoint III-C.4 — patrón WAI-ARIA "Tabs with Automatic Activation":
// roving tabindex (solo el tab activo es tabIndex=0, así Tab desde afuera
// aterriza en el tablist una sola vez), ArrowRight/ArrowDown/ArrowLeft/
// ArrowUp mueven el foco Y activan (con wrap-around en ambos extremos). El
// click sigue activando igual que antes.

export function Tabs({ options, value, onChange }) {
  const tabRefs = useRef([]);

  const moveTo = (index) => {
    const option = options[index];
    tabRefs.current[index]?.focus();
    onChange(option.value);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      moveTo((index + 1) % options.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      moveTo((index - 1 + options.length) % options.length);
    }
  };

  return (
    <div role="tablist" className="flex items-center gap-6">
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => { tabRefs.current[index] = el; }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              'pb-2 text-ds-body border-b-2 transition-colors duration-ds-fast ease-ds',
              isActive
                ? 'border-ds-text-primary text-ds-text-primary font-semibold'
                : 'border-transparent text-ds-text-secondary font-normal'
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
