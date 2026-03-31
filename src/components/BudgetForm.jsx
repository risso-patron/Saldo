import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { NumericFormat } from 'react-number-format';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Coins, PlusCircle } from '@phosphor-icons/react';
import { Card } from './UI/Card';
import { Button } from './UI/Button';
import { Input } from './UI/Input';
import { Select } from './UI/Select';
import { EXPENSE_CATEGORIES, STRATEGIC_MESSAGES } from '../constants/categories';
import { validateDescription, validateAmount, validateDate } from '../utils/validators';
import { sanitizeText, sanitizeDate, sanitizeCategory } from '../utils/sanitize';

/**
 * Componente BudgetForm - Formulario Pastel Premium
 */
export const BudgetForm = ({ onAddIncome, onAddExpense }) => {
  const [activeType, setActiveType] = useState('expense'); // 'income' o 'expense'
  
  // Estados para el formulario unificado
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].value);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const successTimerRef = useRef(null);

  // Handlers
  const validateField = (field, value) => {
    let validation;
    if (field === 'description') validation = validateDescription(value);
    if (field === 'amount') validation = validateAmount(value);
    if (field === 'date') validation = validateDate(value);
    return validation?.isValid ? null : validation?.error;
  };

  const getRandomMessage = () => {
    const msgs = STRATEGIC_MESSAGES.MOTIVATIONAL;
    return msgs[Math.floor(Math.random() * msgs.length)];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación masiva
    const newErrors = {
      description: validateField('description', description),
      amount: validateField('amount', amount),
      date: validateField('date', date),
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(err => err !== null)) return;

    let success = false;
    if (activeType === 'income') {
      success = onAddIncome(sanitizeText(description), amount, sanitizeDate(date) || date);
    } else {
      success = onAddExpense(sanitizeText(description), sanitizeCategory(category), amount, sanitizeDate(date) || date);
    }

    if (success) {
      setDescription('');
      setAmount('');
      setMotivationalMessage(getRandomMessage());
      setShowSuccess(true);
      clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const categoryOptions = EXPENSE_CATEGORIES.map(cat => ({
    value: cat.value,
    label: `${cat.icon} ${cat.label}`
  }));

  return (
    <Card className="max-w-4xl mx-auto overflow-visible" padding="p-8">
      {/* Tabs Estilo Píldora Pastel */}
      <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mb-8">
        <button
          onClick={() => setActiveType('expense')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            activeType === 'expense' 
              ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-premium' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <PlusCircle weight="fill" size={20} />
          Nuevo Gasto
        </button>
        <button
          onClick={() => setActiveType('income')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            activeType === 'income' 
              ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-premium' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Coins weight="fill" size={20} />
          Nuevo Ingreso
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            id="budget-description"
            label="Detalle del movimiento"
            placeholder={activeType === 'income' ? '¿De donde viene el dinero?' : '¿En qué se usó el dinero?'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            required
          />

          {activeType === 'expense' && (
            <Select
              id="budget-category"
              label="Clasificación"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
              required
            />
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="budget-amount" className="text-xs font-bold tracking-wide uppercase text-slate-400 dark:text-slate-500 ml-1">
              Monto <span className="text-rose-400">*</span>
            </label>
            <div className="relative group">
              <NumericFormat
                id="budget-amount"
                value={amount}
                onValueChange={(values) => setAmount(values.floatValue || '')}
                thousandSeparator=","
                decimalSeparator="."
                prefix="$"
                decimalScale={2}
                placeholder="$0.00"
                className={`w-full px-5 py-3 text-sm font-black border border-transparent rounded-2xl outline-none transition-all duration-300 focus:ring-4 ${
                  errors.amount 
                    ? 'bg-rose-50/50 border-rose-200 text-rose-600 focus:ring-rose-100' 
                    : 'bg-slate-50/50 focus:bg-white focus:border-primary-200 focus:ring-primary-100 text-slate-800 dark:text-white'
                } dark:bg-slate-800/50 dark:focus:bg-slate-800 shadow-sm`}
              />
            </div>
            {errors.amount && (
              <p className="text-rose-500 text-[10px] sm:text-xs font-semibold ml-2 flex items-center gap-1 animate-fade-in">⚠️ {errors.amount}</p>
            )}
          </div>

          <Input
            id="budget-date"
            label="Fecha del registro"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
            required
            max={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="flex flex-col items-center gap-4 pt-4">
          <Button 
            type="submit" 
            variant={activeType === 'income' ? 'primary' : 'danger'} 
            size="lg"
            className="w-full sm:w-auto sm:min-w-[240px] uppercase tracking-widest text-[11px]"
          >
            {activeType === 'income' ? 'Confirmar Ingreso' : 'Confirmar Gasto'}
          </Button>

          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2 text-emerald-500 dark:text-emerald-400 font-bold text-center px-4"
              >
                <CheckCircle weight="fill" size={28} className="text-emerald-500" />
                <span className="text-[10px] sm:text-xs uppercase tracking-wider leading-relaxed">
                  {motivationalMessage}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </Card>
  );
};

BudgetForm.propTypes = {
  onAddIncome: PropTypes.func.isRequired,
  onAddExpense: PropTypes.func.isRequired,
};
