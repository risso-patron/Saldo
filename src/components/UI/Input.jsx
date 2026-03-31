import PropTypes from 'prop-types';

/**
 * Componente Input Pastel Premium
 */
export const Input = ({ 
  id, 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  className = '',
  ...props 
}) => {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-xs font-bold tracking-wide uppercase text-slate-400 dark:text-slate-500 ml-1">
          {label} {required && <span className="text-rose-400" aria-label="requerido">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          w-full px-5 py-3 
          text-sm font-medium text-slate-800 dark:text-white
          bg-slate-50/50 dark:bg-slate-800/50
          border border-transparent
          rounded-2xl outline-none transition-all duration-300
          ${error 
            ? 'border-rose-200 bg-rose-50/50 focus:ring-rose-100 dark:border-rose-900/50 dark:bg-rose-900/10' 
            : 'focus:border-primary-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-primary-100 dark:focus:ring-primary-900/20 shadow-sm'
          }
          focus:ring-4
          ${className}
        `}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-rose-500 text-[10px] sm:text-xs font-semibold ml-2 flex items-center gap-1 animate-fade-in">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};
