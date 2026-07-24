import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useModalA11y } from '../../hooks/useModalA11y';

/**
 * Modal de confirmación accesible — reemplaza window.confirm()
 * Soporta Escape para cancelar, trampa de foco y focus automático en
 * "Cancelar" (opción segura) vía useModalA11y (RC-1.7/M2).
 */
export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  const dialogRef = useRef(null);
  useModalA11y(isOpen, onCancel, dialogRef);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-message"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in">
        {/* Ícono */}
        <div className="flex justify-center mb-4">
          <span className="text-4xl" aria-hidden="true">
            {variant === 'danger' ? '⚠️' : '❓'}
          </span>
        </div>

        {/* Título */}
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-2"
        >
          {title}
        </h2>

        {/* Mensaje */}
        <p
          id="confirm-dialog-message"
          className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6"
        >
          {message}
        </p>

        {/* Botones */}
        <div className="flex gap-3">
          {/* Cancelar: primer botón enfocable del diálogo → foco inicial vía
              useModalA11y (opción segura por defecto) */}
          <button
            onClick={onCancel}
            className="flex-1 px-5 py-3 rounded-lg font-medium border-2 border-primary-500
              text-primary-600 dark:text-primary-400 dark:border-primary-600
              hover:bg-primary-50 dark:hover:bg-primary-900/20
              transition-all duration-200"
          >
            {cancelLabel}
          </button>

          {/* Confirmar */}
          <button
            onClick={onConfirm}
            className={`flex-1 px-5 py-3 rounded-lg font-medium text-white
              transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 ${
              variant === 'danger'
                ? 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800'
                : 'bg-gradient-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'default']),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
