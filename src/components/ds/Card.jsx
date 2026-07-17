import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2
// (docs/design/constitution/Saldo Design Constitution.dc.html)
//
// Card base: superficie raised, borde 1px default, radio surface (10px),
// SIN sombra en reposo. Solo tokens semánticos (regla inquebrantable 07).
//
// Sin ejes de variante propios (una sola superficie) — cva se usa igual acá
// solo para tener el mismo mecanismo base+cn() que Button/Input; el valor
// real del refactor es cn(): antes, `<Card className="bg-ds-surface-sunken">`
// dependía del ORDEN de las clases en el string final para "ganarle" a
// bg-ds-surface-raised (frágil). Con twMerge, gana por MERGE — resuelve el
// conflicto raised/sunken sin importar el orden.
const cardVariants = cva('bg-ds-surface-raised border border-ds-border rounded-ds-surface');

export function Card({ children, padding = 'p-6', className = '', ...props }) {
  return (
    <div className={cn(cardVariants(), padding, className)} {...props}>
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node,
  padding: PropTypes.string,
  className: PropTypes.string,
};
