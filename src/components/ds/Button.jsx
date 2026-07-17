import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2
// (docs/design/constitution/Saldo Design Constitution.dc.html)
//
// Button base: variantes primary/secondary/ghost/link, tamaños compact/
// standard/prominent. Solo tokens semánticos (regla inquebrantable 07) —
// nunca hex crudos. PROHIBIDO: sombras, escalas, gradientes.

const ICON_SIZE = 16;

// `size` es un lookup simple (no vive dentro de cva): `link` lo ignora por
// completo (ver más abajo), así que forzarlo dentro de las `variants` de cva
// hubiera significado pelear contra el modelo aditivo de cva (que solo
// AGREGA clases, nunca las resta) con compoundVariants artificiales. Más
// simple y más legible: cva resuelve el eje variant/tone (la parte con
// estados hover/pressed/disabled interesantes); size se mergea aparte vía
// cn() — que sigue siendo el objetivo del refactor (merge de className
// externo vía twMerge, no "todo debe vivir dentro de cva").
const SIZE_CLASSES = {
  compact: 'h-8 px-3 text-ds-body',
  standard: 'h-9 px-4 text-ds-body',
  prominent: 'h-10 px-5 text-ds-body',
};

// Área táctil ≥44px: cuando el control visual mide menos (compact/standard),
// se extiende el hit-area con un ::before invisible más grande que el botón,
// centrado, sin alterar el tamaño visual (regla "Métricas de componente").
// No aplica a `link`: es texto inline sin caja, no hay control que extender.
const HIT_AREA_CLASSES = {
  compact: "relative before:content-[''] before:absolute before:-inset-x-[6px] before:-inset-y-[6px]",
  standard: "relative before:content-[''] before:absolute before:-inset-x-[4px] before:-inset-y-[4px]",
  prominent: "relative before:content-[''] before:absolute before:-inset-x-[2px] before:-inset-y-[2px]",
};

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-medium',
    'transition-colors duration-ds-fast ease-ds',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:ring-offset-2',
    'disabled:opacity-ds-disabled disabled:cursor-not-allowed disabled:pointer-events-none',
  ].join(' '),
  {
    variants: {
      variant: {
        primary: [
          'relative rounded-ds-control bg-ds-accent text-white',
          'hover:bg-ds-accent-hover active:bg-ds-accent-hover',
          // Pressed distinto del hover (hallazgo H29). La Constitución define
          // pressed como velo — rgba(0,0,0,0.06), "el doble del hover" — para
          // superficies neutras; pero `primary` ya tiene fondo sólido, y
          // repetir el mismo bg-ds-accent-hover en hover Y active los volvía
          // indistinguibles. Técnica elegida: superponer el velo
          // ds-interaction-pressed vía un pseudo-elemento ::after (no agrega
          // markup ni un wrapper extra) que solo se hace opaco en :active,
          // ENCIMA del hover ya aplicado — dos oscurecimientos reales en vez
          // de uno repetido.
          "after:content-[''] after:absolute after:inset-0 after:rounded-ds-control",
          'after:bg-ds-interaction-pressed after:opacity-0 active:after:opacity-100',
          'after:pointer-events-none after:transition-opacity after:duration-ds-fast after:ease-ds',
        ].join(' '),
        secondary: [
          'rounded-ds-control bg-transparent text-ds-text-primary border border-ds-border',
          'hover:bg-ds-interaction-hover active:bg-ds-interaction-pressed',
        ].join(' '),
        ghost: [
          'rounded-ds-control bg-transparent text-ds-text-primary',
          'hover:bg-ds-interaction-hover active:bg-ds-interaction-pressed',
        ].join(' '),
        // Variante inline — enlace de texto para acciones secundarias
        // ("Ver todos los movimientos", "Revisar", "Descartar", "Reintentar
        // ahora"): SIN altura fija, SIN padding de caja, SIN borde. Color en
        // vez de subrayado (la Constitución usa color, no subrayado, para
        // diferenciar enlaces). `size` NO aplica acá (ver SIZE_CLASSES /
        // componente): un enlace de texto hereda el tamaño del contexto.
        link: 'rounded-ds-control bg-transparent p-0 h-auto text-ds-accent hover:text-ds-accent-hover',
      },
      tone: {
        default: '',
        danger: '',
      },
    },
    compoundVariants: [
      // Tono danger — solo tiene efecto documentado en `link` (p.ej.
      // "Eliminar" del Historial). Sin hover propio: la Constitución no
      // define un tono hover para danger (igual que `ds.danger` no tiene
      // tenue — "no inventar uno"); el feedback de hover queda a cargo del
      // cursor y el foco, como cualquier texto sin variante tonal.
      { variant: 'link', tone: 'danger', class: 'text-ds-danger hover:text-ds-danger' },
    ],
    defaultVariants: {
      variant: 'primary',
      tone: 'default',
    },
  }
);

export function Button({
  children,
  variant = 'primary',
  size = 'standard',
  tone = 'default',
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
  ...props
}) {
  const iconEl = Icon ? <Icon width={ICON_SIZE} height={ICON_SIZE} strokeWidth={1.5} aria-hidden="true" /> : null;
  const isLink = variant === 'link';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        buttonVariants({ variant, tone }),
        !isLink && SIZE_CLASSES[size],
        !isLink && HIT_AREA_CLASSES[size],
        className
      )}
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
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'link']),
  size: PropTypes.oneOf(['compact', 'standard', 'prominent']),
  tone: PropTypes.oneOf(['default', 'danger']),
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};
