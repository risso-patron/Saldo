import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RepeatOnce, RepeatIcon, Plus, Trash, ToggleLeft, ToggleRight,
  ArrowsClockwise } from '@phosphor-icons/react';
import { Card } from '../../components/Shared/Card';
import { Button } from '../../components/Shared/Button';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { sanitizeText, sanitizeCategory } from '../../utils/sanitize';
import { NumericFormat } from 'react-number-format';

const FREQUENCIES = [
  { value: 'daily',       label: 'Diario'     },
  { value: 'weekly',      label: 'Semanal'    },
  { value: 'biweekly',   label: 'Quincenal'  },
  { value: 'monthly',    label: 'Mensual'    },
  { value: 'yearly',     label: 'Anual'      },
];

const FREQ_LABELS = { daily: 'Cada día', weekly: 'Semanal', biweekly: 'Quincenal', monthly: 'Mensual', yearly: 'Anual' };

/**
 * Formatea 'YYYY-MM-DD' a string legible en español
 */
function fmtDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PA', { day: 'numeric', month: 'short', year: 'numeric' });
}

const EMPTY_FORM = {
  type: 'expense',
  description: '',
  category: EXPENSE_CATEGORIES[0]?.value ?? '',
  amount: '',
  frequency: 'monthly',
  startDate: new Date().toISOString().split('T')[0],
};

/**
 * RecurringManager – gestiona transacciones automáticas periódicas.
 * Permite crear, activar/pausar y eliminar reglas recurrentes.
 */
export const RecurringManager = ({ recurring, onAdd, onToggle, onRemove }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.description.trim()) e.description = 'La descripción es requerida';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Ingresa un monto válido';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    onAdd({
      type: form.type,
      description: sanitizeText(form.description),
      category: form.type === 'expense' ? sanitizeCategory(form.category) : 'income',
      amount: parseFloat(form.amount),
      frequency: form.frequency,
      startDate: form.startDate,
    });

    setForm(EMPTY_FORM);
    setErrors({});
    setShowForm(false);
  };

  const activeCount   = recurring.filter(r => r.active).length;
  const inactiveCount = recurring.length - activeCount;

  return (
    <Card>
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <ArrowsClockwise size={20} weight="light" className="text-violet-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              Transacciones Recurrentes
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activeCount} activa{activeCount !== 1 ? 's' : ''}
              {inactiveCount > 0 && ` · ${inactiveCount} pausada${inactiveCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={() => setShowForm(prev => !prev)}
          className="flex items-center gap-1.5 text-sm"
        >
          <Plus size={15} weight="bold" />
          Nueva
        </Button>
      </div>

      {/* Formulario de creación */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="mb-4 overflow-hidden"
            noValidate
          >
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">

              {/* Tipo */}
              <div className="flex gap-2">
                {['income', 'expense'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: t }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                      ${form.type === t
                        ? t === 'income'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-rose-500 text-white shadow-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                      }`}
                  >
                    {t === 'income' ? '💰 Ingreso' : '💸 Gasto'}
                  </button>
                ))}
              </div>

              {/* Descripción */}
              <div>
                <input
                  type="text"
                  placeholder="Descripción (ej: Salario, Netflix)"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  maxLength={100}
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all
                    dark:bg-gray-700 dark:text-white
                    ${errors.description
                      ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900'
                    }`}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">⚠️ {errors.description}</p>
                )}
              </div>

              {/* Categoría (solo gastos) */}
              {form.type === 'expense' && (
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600
                    rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900
                    outline-none transition-all dark:bg-gray-700 dark:text-white"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              )}

              {/* Monto */}
              <div>
                <NumericFormat
                  value={form.amount}
                  onValueChange={vals => setForm(f => ({ ...f, amount: vals.floatValue ?? '' }))}
                  thousandSeparator=","
                  decimalSeparator="."
                  prefix="$"
                  decimalScale={2}
                  allowNegative={false}
                  placeholder="$0.00"
                  inputMode="decimal"
                  className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all
                    dark:bg-gray-700 dark:text-white
                    ${errors.amount
                      ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                      : 'border-gray-200 dark:border-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900'
                    }`}
                />
                {errors.amount && (
                  <p className="text-red-500 text-xs mt-1">⚠️ {errors.amount}</p>
                )}
              </div>

              {/* Frecuencia + Fecha inicio */}
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.frequency}
                  onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600
                    rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900
                    outline-none transition-all dark:bg-gray-700 dark:text-white"
                >
                  {FREQUENCIES.map(fr => (
                    <option key={fr.value} value={fr.value}>{fr.label}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600
                    rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900
                    outline-none transition-all dark:bg-gray-700 dark:text-white dark:color-scheme-dark"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button type="submit" variant="primary" className="flex-1 text-sm">
                  Guardar regla
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => { setShowForm(false); setErrors({}); setForm(EMPTY_FORM); }}
                  className="text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Lista de reglas */}
      {recurring.length === 0 ? (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <RepeatOnce size={36} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Sin transacciones recurrentes todavía</p>
          <p className="text-xs mt-1">Automatiza tu salario, suscripciones o pagos fijos</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {recurring.map(rule => (
            <li
              key={rule.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                ${rule.active
                  ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/50 opacity-60'
                }`}
            >
              {/* Ícono tipo */}
              <span className="text-xl shrink-0" aria-hidden="true">
                {rule.type === 'income' ? '💰' :
                  EXPENSE_CATEGORIES.find(c => c.value === rule.category)?.icon ?? '💸'}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate
                  ${rule.active ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                  {rule.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {FREQ_LABELS[rule.frequency]} · próx. {fmtDate(rule.nextDue)}
                </p>
              </div>

              {/* Monto */}
              <span className={`text-sm font-bold shrink-0
                ${rule.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {rule.type === 'income' ? '+' : '-'}${Number(rule.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>

              {/* Acciones */}
              <button
                onClick={() => onToggle(rule.id)}
                title={rule.active ? 'Pausar' : 'Activar'}
                className="text-gray-400 hover:text-indigo-500 transition-colors shrink-0"
                aria-label={rule.active ? `Pausar ${rule.description}` : `Activar ${rule.description}`}
              >
                {rule.active
                  ? <ToggleRight size={22} weight="fill" className="text-indigo-500" />
                  : <ToggleLeft size={22} />
                }
              </button>

              <button
                onClick={() => onRemove(rule.id)}
                title="Eliminar"
                className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
                aria-label={`Eliminar ${rule.description}`}
              >
                <Trash size={17} weight="bold" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
