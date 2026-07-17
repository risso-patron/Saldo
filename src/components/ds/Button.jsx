import PropTypes from 'prop-types';

// Design System — Saldo Design Constitution v1.2
// (docs/design/constitution/Saldo Design Constitution.dc.html)
//
// Button base: variantes primary/secondary/ghost, tamaños compact/standard/
// prominent. Solo tokens semánticos (regla inquebrantable 07) — nunca hex
// crudos. PROHIBIDO: sombras, escalas, gradientes.

const VARIANT_CLASSES = {
  primary: 'bg-ds-accent text-white hover:bg-ds-accent-hover active:bg-ds-accent-hover',
  secondary:
    'bg-transparent text-ds-text-primary border border-ds-border hover:bg-black/[0.03] active:bg-black/[0.06]',
  ghost: 'bg-transparent text-ds-text-primary hover:bg-black/[0.03] active:bg-black/[0.06]',
};

const SIZE_CLASSES = {
  compact: 'h-8 px-3 text-ds-body',
  standard: 'h-9 px-4 text-ds-body',
  prominent: 'h-10 px-5 text-ds-body',
};

// Área táctil ≥44px: cuando el control visual mide menos (compact/standard),
// se extiende el hit-area con un ::before invisible más grande que el botón,
// centrado, sin alterar el tamaño visual (regla "Métricas de componente").
const HIT_AREA_CLASSES = {
  compact: "relative before:content-[''] before:absolute before:-inset-x-[6px] before:-inset-y-[6px]",
  standard: "relative before:content-[''] before:absolute before:-inset-x-[4px] before:-inset-y-[4px]",
  prominent: "relative before:content-[''] before:absolute before:-inset-x-[2px] before:-inset-y-[2px]",
};

const ICON_SIZE = 16;

export function Button({
  children,
  variant = 'primary',
  size = 'standard',
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const iconEl = Icon ? <Icon width={ICON_SIZE} height={ICON_SIZE} strokeWidth={1.5} aria-hidden="true" /> : null;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-ds-control
        transition-colors duration-ds-fast ease-ds
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:ring-offset-2
        disabled:opacity-[0.45] disabled:cursor-not-allowed disabled:pointer-events-none
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${HIT_AREA_CLASSES[size]}
        ${className}
      `.trim()}
      {...props}
    >
      {Icon && iconPosition === 'left' && iconEl}
      {children}
      {Icon && iconPosition === 'right' && iconEl}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['compact', 'standard', 'prominent']),
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};
