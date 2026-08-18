import { forwardRef, useId } from 'react';
import PropTypes from 'prop-types';
import { cva } from 'class-variance-authority';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2
// (docs/design/constitution/Saldo Design Constitution.dc.html)
//
// Input base: fondo surface/sunken en reposo, radio control, tamaños
// compact/standard/prominent, error con state/danger, label opcional.
// Solo tokens semánticos (regla inquebrantable 07).

const inputVariants = cva(
  [
    'w-full bg-ds-surface-sunken text-ds-text-primary text-ds-body',
    'placeholder-ds-text-secondary rounded-ds-control border',
    'focus:outline-none focus:ring-2 focus:ring-ds-accent focus:ring-offset-2',
    'disabled:opacity-ds-disabled disabled:cursor-not-allowed',
    'transition-colors duration-ds-fast ease-ds',
  ].join(' '),
  {
    variants: {
      size: {
        compact: 'h-8 px-3',
        standard: 'h-9 px-4',
        prominent: 'h-10 px-5',
      },
      error: {
        true: 'border-ds-danger',
        false: 'border-transparent',
      },
    },
    defaultVariants: {
      size: 'standard',
      error: false,
    },
  }
);

export const Input = forwardRef(function Input(
  {
    label,
    id,
    size = 'standard',
    error,
    disabled = false,
    className = '',
    type = 'text',
    ...props
  },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="inline-flex w-full flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-ds-caption text-ds-text-secondary font-medium">
          {label}
        </label>
      )}
      {/* Wrapper con min-h-11 (44px): garantiza el área táctil mínima aunque
          el control visual (compact/standard) mida menos. */}
      <div className="relative inline-flex w-full min-h-11 items-center">
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId}
          className={cn(inputVariants({ size, error: Boolean(error) }), className)}
          {...props}
        />
      </div>
      {error && (
        <p id={errorId} className="text-ds-caption text-ds-danger">
          {error}
        </p>
      )}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  size: PropTypes.oneOf(['compact', 'standard', 'prominent']),
  error: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
};
