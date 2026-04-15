import { useState, useEffect, useId } from 'react';
import PropTypes from 'prop-types';
import { NumericFormat } from 'react-number-format';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { validateDescription, validateAmount, validateDate } from '../../utils/validators';
import { sanitizeText, sanitizeDate, sanitizeCategory } from '../../utils/sanitize';
import { Button } from '../Shared/Button';
import { useCurrency } from '../../contexts/CurrencyContext';

/**
 * Modal para editar una transacción
 */
export const EditTransactionModal = ({ 
  transaction, 
  onClose, 
  onSave, 
  type 
}) => {
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount);
  const [currency, setCurrency] = useState(transaction.currency || 'USD');
  const [date, setDate] = useState(transaction.date);
  const [category, setCategory] = useState(transaction.category || 'Vivienda');
  const [errors, setErrors] = useState({});
  const [, setTouched] = useState({});
  
  const { currencies } = useCurrency();

  const descId = useId();
  const amountId = useId();
  const dateId = useId();
  const catId = useId();

  // Click fuera del modal para cerrar
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC para cerrar
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const validateField = (field, value) => {
    let validation;
    
    switch (field) {
      case 'description':
        validation = validateDescription(value);
        break;
      case 'amount':
        validation = validateAmount(value);
        break;
      case 'date':
        validation = validateDate(value);
        break;
      default:
        return null;
    }
    
    return validation.isValid ? null : validation.error;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    let value;
    if (field === 'description') value = description;
    if (field === 'amount') value = amount;
    if (field === 'date') value = date;
    
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setTouched({ description: true, amount: true, date: true });
    
    const validationErrors = {
      description: validateField('description', description),
      amount: validateField('amount', amount),
      date: validateField('date', date),
    };
    
    setErrors(validationErrors);
    
    if (Object.values(validationErrors).some(error => error !== null)) {
      return;
    }
    
    const updates = {
      description: sanitizeText(description),
      amount,
      currency,
      date: sanitizeDate(date) || date,
      ...(type === 'expense' && { category: sanitizeCategory(category) }),
    };
    
    onSave(transaction.id, updates);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 id="modal-title" className="text-2xl font-bold text-gray-800 dark:text-white">
            {type === 'income' ? '💰 Editar Ingreso' : '💳 Editar Gasto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Cerrar modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Descripción */}
          <div>
            <label htmlFor={descId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id={descId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => handleBlur('description')}
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                ${errors.description 
                  ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900' 
                  : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900'
                }
                dark:bg-gray-700 dark:text-white
              `}
              aria-required="true"
              aria-invalid={errors.description ? 'true' : 'false'}
              maxLength={100}
            />
            {errors.description && (
              <p role="alert" className="text-red-500 text-xs mt-1">⚠️ {errors.description}</p>
            )}
          </div>

          {/* Categoría (solo para gastos) */}
          {type === 'expense' && (
            <div>
              <label htmlFor={catId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id={catId}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900 outline-none transition-all dark:bg-gray-700 dark:text-white"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Monto y Moneda */}
          <div>
            <label htmlFor={amountId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cantidad <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full sm:w-1/3 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900 outline-none transition-all dark:bg-gray-700 dark:text-white font-bold"
              >
                {currencies.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    {cat.code}
                  </option>
                ))}
              </select>
              <NumericFormat
                id={amountId}
                value={amount}
                onValueChange={(values) => setAmount(values.floatValue || '')}
                onBlur={() => handleBlur('amount')}
                thousandSeparator=","
                decimalSeparator="."
                prefix=""
                decimalScale={2}
                allowNegative={false}
                className={`w-full sm:w-2/3 px-4 py-3 border-2 rounded-lg outline-none transition-all
                  ${errors.amount 
                    ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900' 
                    : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900'
                  }
                  dark:bg-gray-700 dark:text-white font-black
                `}
                aria-required="true"
                aria-invalid={errors.amount ? 'true' : 'false'}
                inputMode="decimal"
              />
            </div>
            {errors.amount && (
              <p role="alert" className="text-red-500 text-xs mt-1">⚠️ {errors.amount}</p>
            )}
          </div>

          {/* Fecha */}
          <div>
            <label htmlFor={dateId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id={dateId}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onBlur={() => handleBlur('date')}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                ${errors.date 
                  ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900' 
                  : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900'
                }
                dark:bg-gray-700 dark:text-white dark:color-scheme-dark
              `}
              aria-required="true"
              aria-invalid={errors.date ? 'true' : 'false'}
            />
            {errors.date && (
              <p role="alert" className="text-red-500 text-xs mt-1">⚠️ {errors.date}</p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditTransactionModal.propTypes = {
  transaction: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['income', 'expense']).isRequired,
};
