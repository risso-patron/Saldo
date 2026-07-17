import PropTypes from 'prop-types';

// Design System — Saldo Design Constitution v1.2
// (docs/design/constitution/Saldo Design Constitution.dc.html)
//
// Card base: superficie raised, borde 1px default, radio surface (10px),
// SIN sombra en reposo. Solo tokens semánticos (regla inquebrantable 07).

export function Card({ children, padding = 'p-6', className = '', ...props }) {
  return (
    <div
      className={`
        bg-ds-surface-raised border border-ds-border rounded-ds-surface
        ${padding}
        ${className}
      `.trim()}
      {...props}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node,
  padding: PropTypes.string,
  className: PropTypes.string,
};
