import PropTypes from 'prop-types';

/**
 * Componente Select Pastel Premium
 */
export const Select = ({ 
  id, 
  label, 
  value, 
  onChange, 
  options = [], 
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
      <div className="relative group">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`
            w-full px-5 py-3 
            text-sm font-medium text-slate-800 dark:text-white
            bg-slate-50/50 dark:bg-slate-800/50
            border border-transparent
            rounded-2xl outline-none appearance-none transition-all duration-300
            ${error 
              ? 'border-rose-200 bg-rose-50/50 focus:ring-rose-100 dark:border-rose-900/50 dark:bg-rose-900/10' 
              : 'focus:border-primary-200 focus:bg-white dark:focus:bg-slate-800 focus:ring-primary-100 dark:focus:ring-primary-900/20 shadow-sm'
            }
            focus:ring-4
            cursor-pointer
            ${className}
          `}
          aria-required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white dark:bg-slate-800">
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom Arrow Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-rose-500 text-[10px] sm:text-xs font-semibold ml-2 flex items-center gap-1 animate-fade-in">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

Select.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
};
