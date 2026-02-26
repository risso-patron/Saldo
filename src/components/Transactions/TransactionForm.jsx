import { useState, useId, useRef } from 'react';
import PropTypes from 'prop-types';
import { NumericFormat } from 'react-number-format';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { validateDescription, validateAmount, validateDate } from '../../utils/validators';
import { CoinsWebP, DonutWebP } from '../Shared/WebPAnimation';

/**
 * Input de monto con formateo de moneda
 */
const CurrencyInput = ({ 
  id, 
  value, 
  onChange, 
  onBlur,
  error, 
  label, 
  required = true 
}) => {
  const errorId = `${id}-error`;
  
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500" aria-label="requerido">*</span>}
      </label>
      <NumericFormat
        id={id}
        value={value}
        onValueChange={(values) => onChange(values.floatValue || '')}
        onBlur={onBlur}
        thousandSeparator=","
        decimalSeparator="."
        prefix="$"
        decimalScale={2}
        fixedDecimalScale={false}
        allowNegative={false}
        placeholder="$0.00"
        className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
          ${error 
            ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900' 
            : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900'
          }
          dark:bg-gray-700 dark:text-white
        `}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        inputMode="decimal"
        autoComplete="transaction-amount"
      />
      {error && (
        <p id={errorId} role="alert" className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <span aria-hidden="true">⚠️</span> {error}
        </p>
      )}
    </div>
  );
};

CurrencyInput.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
};

/**
 * Componente TransactionForm - Formularios mejorados con validación en tiempo real
 */
export const TransactionForm = ({ onAddIncome, onAddExpense }) => {
  // IDs únicos para accesibilidad
  const incomeDescId = useId();
  const incomeAmountId = useId();
  const incomeDateId = useId();
  const expenseDescId = useId();
  const expenseCatId = useId();
  const expenseAmountId = useId();
  const expenseDateId = useId();

  // Estados para ingresos
  const [incomeDescription, setIncomeDescription] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeDate, setIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [incomeErrors, setIncomeErrors] = useState({});
  const [incomeTouched, setIncomeTouched] = useState({});

  // Estados para gastos
  const [expenseDescription, setExpenseDescription] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Vivienda');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseErrors, setExpenseErrors] = useState({});
  const [expenseTouched, setExpenseTouched] = useState({});

  // Estados de feedback visual tras submit exitoso
  const [showIncomeSuccess, setShowIncomeSuccess] = useState(false);
  const [showExpenseSuccess, setShowExpenseSuccess] = useState(false);
  const incomeTimerRef = useRef(null);
  const expenseTimerRef = useRef(null);

  // Validación de campos en tiempo real
  const validateIncomeField = (field, value) => {
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

  // Handlers de ingresos
  const handleIncomeDescriptionChange = (e) => {
    const value = e.target.value;
    setIncomeDescription(value);
    
    if (incomeTouched.description) {
      const error = validateIncomeField('description', value);
      setIncomeErrors(prev => ({ ...prev, description: error }));
    }
  };

  const handleIncomeAmountChange = (value) => {
    setIncomeAmount(value);
    
    if (incomeTouched.amount) {
      const error = validateIncomeField('amount', value);
      setIncomeErrors(prev => ({ ...prev, amount: error }));
    }
  };

  const handleIncomeDateChange = (e) => {
    const value = e.target.value;
    setIncomeDate(value);
    
    if (incomeTouched.date) {
      const error = validateIncomeField('date', value);
      setIncomeErrors(prev => ({ ...prev, date: error }));
    }
  };

  const handleIncomeBlur = (field) => {
    setIncomeTouched(prev => ({ ...prev, [field]: true }));
    
    let value;
    if (field === 'description') value = incomeDescription;
    if (field === 'amount') value = incomeAmount;
    if (field === 'date') value = incomeDate;
    
    const error = validateIncomeField(field, value);
    setIncomeErrors(prev => ({ ...prev, [field]: error }));
  };

  // Handlers de gastos
  const handleExpenseDescriptionChange = (e) => {
    const value = e.target.value;
    setExpenseDescription(value);
    
    if (expenseTouched.description) {
      const error = validateIncomeField('description', value);
      setExpenseErrors(prev => ({ ...prev, description: error }));
    }
  };

  const handleExpenseAmountChange = (value) => {
    setExpenseAmount(value);
    
    if (expenseTouched.amount) {
      const error = validateIncomeField('amount', value);
      setExpenseErrors(prev => ({ ...prev, amount: error }));
    }
  };

  const handleExpenseDateChange = (e) => {
    const value = e.target.value;
    setExpenseDate(value);
    
    if (expenseTouched.date) {
      const error = validateIncomeField('date', value);
      setExpenseErrors(prev => ({ ...prev, date: error }));
    }
  };

  const handleExpenseBlur = (field) => {
    setExpenseTouched(prev => ({ ...prev, [field]: true }));
    
    let value;
    if (field === 'description') value = expenseDescription;
    if (field === 'amount') value = expenseAmount;
    if (field === 'date') value = expenseDate;
    
    const error = validateIncomeField(field, value);
    setExpenseErrors(prev => ({ ...prev, [field]: error }));
  };

  /**
   * Manejar submit de ingreso
   */
  const handleIncomeSubmit = (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como touched
    setIncomeTouched({ description: true, amount: true, date: true });
    
    // Validar todos los campos
    const errors = {
      description: validateIncomeField('description', incomeDescription),
      amount: validateIncomeField('amount', incomeAmount),
      date: validateIncomeField('date', incomeDate),
    };
    
    setIncomeErrors(errors);
    
    // Si hay errores, no continuar
    if (Object.values(errors).some(error => error !== null)) {
      return;
    }
    
    const success = onAddIncome(incomeDescription, incomeAmount, incomeDate);
    if (success) {
      setIncomeDescription('');
      setIncomeAmount('');
      setIncomeDate(new Date().toISOString().split('T')[0]);
      setIncomeErrors({});
      setIncomeTouched({});
      setShowIncomeSuccess(true);
      clearTimeout(incomeTimerRef.current);
      incomeTimerRef.current = setTimeout(() => setShowIncomeSuccess(false), 2000);
    }
  };

  /**
   * Manejar submit de gasto
   */
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    
    setExpenseTouched({ description: true, amount: true, date: true });
    
    const errors = {
      description: validateIncomeField('description', expenseDescription),
      amount: validateIncomeField('amount', expenseAmount),
      date: validateIncomeField('date', expenseDate),
    };
    
    setExpenseErrors(errors);
    
    if (Object.values(errors).some(error => error !== null)) {
      return;
    }
    
    const success = onAddExpense(expenseDescription, expenseCategory, expenseAmount, expenseDate);
    if (success) {
      setExpenseDescription('');
      setExpenseAmount('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setExpenseErrors({});
      setExpenseTouched({});
      setShowExpenseSuccess(true);
      clearTimeout(expenseTimerRef.current);
      expenseTimerRef.current = setTimeout(() => setShowExpenseSuccess(false), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Formulario de Ingresos */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <CoinsWebP size="sm" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ingresos</h3>
        </div>
        <form onSubmit={handleIncomeSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor={incomeDescId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <input
              type="text"
              id={incomeDescId}
              value={incomeDescription}
              onChange={handleIncomeDescriptionChange}
              onBlur={() => handleIncomeBlur('description')}
              placeholder="Ej: Salario, Freelance"
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                ${incomeErrors.description 
                  ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900' 
                  : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900'
                }
                dark:bg-gray-700 dark:text-white
              `}
              aria-required="true"
              aria-invalid={incomeErrors.description ? 'true' : 'false'}
              aria-describedby={incomeErrors.description ? `${incomeDescId}-error` : undefined}
              autoComplete="off"
              maxLength={100}
            />
            {incomeErrors.description && (
              <p id={`${incomeDescId}-error`} role="alert" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span aria-hidden="true">⚠️</span> {incomeErrors.description}
              </p>
            )}
          </div>

          <CurrencyInput
            id={incomeAmountId}
            value={incomeAmount}
            onChange={handleIncomeAmountChange}
            onBlur={() => handleIncomeBlur('amount')}
            error={incomeErrors.amount}
            label="Cantidad"
            required
          />

          <div>
            <label htmlFor={incomeDateId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <input
              type="date"
              id={incomeDateId}
              value={incomeDate}
              onChange={handleIncomeDateChange}
              onBlur={() => handleIncomeBlur('date')}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                ${incomeErrors.date 
                  ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900' 
                  : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900'
                }
                dark:bg-gray-700 dark:text-white dark:color-scheme-dark
              `}
              aria-required="true"
              aria-invalid={incomeErrors.date ? 'true' : 'false'}
              aria-describedby={incomeErrors.date ? `${incomeDateId}-error` : undefined}
            />
            {incomeErrors.date && (
              <p id={`${incomeDateId}-error`} role="alert" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span aria-hidden="true">⚠️</span> {incomeErrors.date}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Agregar Ingreso
          </Button>

          <AnimatePresence>
            {showIncomeSuccess && (
              <motion.div
                key="income-success"
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 px-3 py-2 mt-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg text-emerald-700 dark:text-emerald-300 text-sm font-medium"
              >
                <CheckCircle weight="fill" size={18} color="#10B981" />
                ¡Ingreso registrado!
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Card>

      {/* Formulario de Gastos */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <DonutWebP size="sm" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Gastos</h3>
        </div>
        <form onSubmit={handleExpenseSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor={expenseDescId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <input
              type="text"
              id={expenseDescId}
              value={expenseDescription}
              onChange={handleExpenseDescriptionChange}
              onBlur={() => handleExpenseBlur('description')}
              placeholder="Ej: Renta, Comida"
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                ${expenseErrors.description 
                  ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900' 
                  : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900'
                }
                dark:bg-gray-700 dark:text-white
              `}
              aria-required="true"
              aria-invalid={expenseErrors.description ? 'true' : 'false'}
              aria-describedby={expenseErrors.description ? `${expenseDescId}-error` : undefined}
              autoComplete="off"
              maxLength={100}
            />
            {expenseErrors.description && (
              <p id={`${expenseDescId}-error`} role="alert" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span aria-hidden="true">⚠️</span> {expenseErrors.description}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={expenseCatId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <select
              id={expenseCatId}
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900 outline-none transition-all dark:bg-gray-700 dark:text-white"
              aria-required="true"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <CurrencyInput
            id={expenseAmountId}
            value={expenseAmount}
            onChange={handleExpenseAmountChange}
            onBlur={() => handleExpenseBlur('amount')}
            error={expenseErrors.amount}
            label="Cantidad"
            required
          />

          <div>
            <label htmlFor={expenseDateId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <input
              type="date"
              id={expenseDateId}
              value={expenseDate}
              onChange={handleExpenseDateChange}
              onBlur={() => handleExpenseBlur('date')}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all
                ${expenseErrors.date 
                  ? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900' 
                  : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900'
                }
                dark:bg-gray-700 dark:text-white dark:color-scheme-dark
              `}
              aria-required="true"
              aria-invalid={expenseErrors.date ? 'true' : 'false'}
              aria-describedby={expenseErrors.date ? `${expenseDateId}-error` : undefined}
            />
            {expenseErrors.date && (
              <p id={`${expenseDateId}-error`} role="alert" className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span aria-hidden="true">⚠️</span>  {expenseErrors.date}
              </p>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Agregar Gasto
          </Button>

          <AnimatePresence>
            {showExpenseSuccess && (
              <motion.div
                key="expense-success"
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 px-3 py-2 mt-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg text-emerald-700 dark:text-emerald-300 text-sm font-medium"
              >
                <CheckCircle weight="fill" size={18} color="#10B981" />
                ¡Gasto registrado!
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Card>
    </div>
  );
};

TransactionForm.propTypes = {
  onAddIncome: PropTypes.func.isRequired,
  onAddExpense: PropTypes.func.isRequired,
};
