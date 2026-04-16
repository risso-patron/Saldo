import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { NumericFormat } from 'react-number-format';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Coins, 
  PlusCircle, 
  ArrowRight, 
  MagicWand, 
  Keyboard, 
  Camera,
  ArrowArcLeft
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Card } from './UI/Card';
import { Input } from './UI/Input';
import { Select } from './UI/Select';
import { EXPENSE_CATEGORIES, STRATEGIC_MESSAGES } from '../constants/categories';
import { validateDescription, validateAmount, validateDate } from '../utils/validators';
import { sanitizeText, sanitizeDate, sanitizeCategory } from '../utils/sanitize';
import { ReceiptScanner } from '../features/scanner/ReceiptScanner';
import { useCurrency } from '../contexts/CurrencyContext';

export const BudgetForm = ({ onAddIncome, onAddExpense }) => {
  // MODOS: 'choice', 'manual', 'scan'
  const [formMode, setFormMode] = useState('choice');
  const [activeType, setActiveType] = useState('expense');
  const { t } = useTranslation()
  
  const { currencies, getSmartDefaultCurrency, recordCurrencyUsage } = useCurrency();
  
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [ currency, setCurrency] = useState(() => getSmartDefaultCurrency());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].value);
  const [errors, setErrors] = useState({});
  const [, setShowSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [, setMotivationalMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const successTimerRef = useRef(null);

  // Detección básica de dispositivo
  useEffect(() => {
    const checkDevice = () => setIsMobile(window.innerWidth < 1024);
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

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
    e?.preventDefault();
    const newErrors = {
      description: validateField('description', description),
      amount: validateField('amount', amount),
      date: validateField('date', date),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(err => err !== null)) return;

    let success = false;
    if (activeType === 'income') {
      success = onAddIncome(sanitizeText(description), amount, sanitizeDate(date) || date, currency);
    } else {
      success = onAddExpense(sanitizeText(description), sanitizeCategory(category), amount, sanitizeDate(date) || date, currency);
    }

    if (success) {
      recordCurrencyUsage(currency); // Guardar memoria predictiva
      setDescription('');
      setAmount('');
      setMotivationalMessage(getRandomMessage());
      setShowSuccess(true);
      setSubmitted(true);
      clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setShowSuccess(false);
        setSubmitted(false);
        setFormMode('choice'); // Regresar a selección tras éxito
      }, 1800);
    }
  };

  const handleScanResult = (result) => {
    setDescription(result.description);
    setAmount(result.amount);
    setCategory(result.category);
    setDate(result.date);
    setFormMode('manual'); // Pasar al formulario para revisión
  };

  const categoryOptions = EXPENSE_CATEGORIES.map(cat => ({
    value: cat.value,
    label: `${cat.icon} ${cat.label}`
  }));

  return (
    <Card className="max-w-4xl mx-auto overflow-visible relative" padding="p-0">
      <AnimatePresence mode="wait">
        
        {/* PANTALLA DE ELECCIÓN INICIAL */}
        {formMode === 'choice' && (
          <motion.div 
            key="choice"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="p-8 pb-12 flex flex-col items-center gap-10"
          >
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{t('form.new_movement')}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('form.how_to_register')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl px-2 sm:px-4">
              <button 
                onClick={() => setFormMode('manual')}
                className="group relative flex flex-col items-center justify-center gap-4 p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-500 shadow-xl hover:shadow-primary-500/10"
              >
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors">
                  <Keyboard size={32} weight="duotone" />
                </div>
                <div className="text-center">
                  <span className="block text-sm sm:text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">{t('form.write_manual')}</span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{t('form.manual_subtitle')}</span>
                </div>
              </button>

              <button 
                onClick={() => setFormMode('scan')}
                className="group relative flex flex-col items-center justify-center gap-4 p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-500 shadow-xl hover:shadow-primary-500/10"
              >
                <div className="absolute -top-2.5 -right-2.5 px-2 py-0.5 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg animate-bounce">
                  IA Ready
                </div>
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center text-primary-500">
                  {isMobile ? <Camera size={32} weight="fill" /> : <MagicWand size={32} weight="fill" />}
                </div>
                <div className="text-center">
                  <span className="block text-sm sm:text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                    {isMobile ? t('form.scan') : t('form.import_ai')}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {isMobile ? t('form.scan_subtitle') : t('form.import_ai_subtitle')}
                  </span>
                </div>
              </button>
            </div>
            
            <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 italic">
              {isMobile ? t('form.mobile_note') : t('form.desktop_note')}
            </p>
          </motion.div>
        )}

        {/* MODO ESCÁNER */}
        {formMode === 'scan' && (
          <motion.div 
            key="scanner"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="h-[500px]"
          >
            <ReceiptScanner 
              onResult={handleScanResult} 
              onCancel={() => setFormMode('choice')} 
            />
          </motion.div>
        )}

        {/* MODO MANUAL */}
        {formMode === 'manual' && (
          <motion.div 
            key="manual"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setFormMode('choice')}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 uppercase tracking-widest transition-colors"
              >
                <ArrowArcLeft size={16} weight="bold" />
                {t('form.back')}
              </button>

              <div className="flex bg-slate-100/50 dark:bg-slate-800/80 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveType('expense')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeType === 'expense' ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {t('form.expense')}
                </button>
                <button
                  onClick={() => setActiveType('income')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeType === 'income' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'
                  }`}
                >
                  {t('form.income')}
                </button>
              </div>
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
                    <div className="absolute inset-y-0 left-0 flex items-center">
                      <label htmlFor="currency" className="sr-only">Moneda</label>
                      <select
                        id="currency"
                        name="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="h-full py-0 pl-3 pr-7 bg-transparent text-slate-500 font-bold text-sm border-transparent rounded-l-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none cursor-pointer"
                      >
                        {currencies.map(c => (
                          <option key={c.code} value={c.code}>{c.code}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      <div className="h-3/4 w-px bg-slate-200 dark:bg-slate-700 ml-1"></div>
                    </div>
                    <NumericFormat
                      id="budget-amount"
                      value={amount}
                      onValueChange={(values) => setAmount(values.floatValue || '')}
                      thousandSeparator="," decimalSeparator="." prefix="" decimalScale={2} placeholder="0.00"
                      className={`w-full pl-[85px] pr-5 py-4 text-lg font-black border border-transparent rounded-2xl outline-none transition-all focus:ring-4 ${
                        errors.amount ? 'bg-rose-50/50 border-rose-200 text-rose-600 focus:ring-rose-100' : 'bg-slate-100/50 focus:bg-white focus:border-primary-200 focus:ring-primary-100 text-slate-800 dark:text-white dark:bg-slate-800/80 shadow-inner'
                      }`}
                    />
                  </div>
                  {errors.amount && <p className="text-rose-500 text-[10px] font-bold ml-2">⚠️ {errors.amount}</p>}
                </div>

                <Input
                  id="budget-date"
                  label="Fecha"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  error={errors.date}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex flex-col items-center gap-4 pt-4">
                <motion.button
                  type="submit"
                  disabled={submitted}
                  layout
                  className={`relative inline-flex items-center justify-center w-full px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors shadow-lg active:scale-95 ${
                    submitted ? 'bg-emerald-500 text-white' : activeType === 'income' ? 'bg-primary-600 text-white shadow-primary-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {submitted ? (
                      <motion.span key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2"><CheckCircle weight="fill" size={20} /> ¡Listo!</motion.span>
                    ) : (
                      <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">Confirmar {activeType === 'income' ? 'Ingreso' : 'Gasto'} <ArrowRight size={18} weight="bold" /></motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

BudgetForm.propTypes = {
  onAddIncome: PropTypes.func.isRequired,
  onAddExpense: PropTypes.func.isRequired,
};
