import PropTypes from 'prop-types';
import { useEffect } from 'react';

/**
 * Componente Alert para mostrar mensajes de éxito/error
 */
export const Alert = ({ type = 'success', message, onClose, className = '', children, autoDismiss = true }) => {
  // RC-1.7/A1+M4: autoDismiss=false cuando el descarte lo maneja un
  // coordinador externo (App.jsx, vía useFeedbackQueue) — evita el
  // temporizador duplicado. Default true preserva el comportamiento actual
  // para LoginForm/RegisterForm/ForgotPasswordForm, que usan este
  // componente de forma independiente, sin coordinador.
  useEffect(() => {
    if (onClose && autoDismiss) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [onClose, autoDismiss]);

  const styles = {
    success: 'bg-green-100 border-green-500 text-green-800',
    error: 'bg-red-100 border-red-500 text-red-800',
    info: 'bg-blue-100 border-blue-500 text-blue-800',
  };

  const icons = {
    success: '',
    error: '',
    info: '',
  };

  const content = message ?? children;

  if (!content) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 animate-fade-in ${className}`}>
      <div className={`${styles[type]} border-l-4 p-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md`}>
        <span className="text-xl font-bold">{icons[type]}</span>
        <p className="flex-1 font-medium">{content}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xl hover:scale-110 transition-transform"
            aria-label="Cerrar"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'info']),
  message: PropTypes.string,
  onClose: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node,
  autoDismiss: PropTypes.bool,
};
