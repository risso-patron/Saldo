import { useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { EditTransactionModal } from './EditTransactionModal';
import { useCurrency } from '../../contexts/CurrencyContext';

/**
 * Componente TransactionItem - Item individual con edición
 */
export const TransactionItem = ({ transaction, type, onRemove, onEdit, index, isSelected = false, onToggleSelect }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { convertCurrency, selectedCurrency } = useCurrency();

  const isIncome = type === 'income';
  
  const txCurrency = transaction.currency || 'USD';
  const hasDifferentCurrency = txCurrency !== selectedCurrency;

  const handleDelete = async () => {
    setIsDeleting(true);
    // Animación de salida antes de eliminar
    setTimeout(() => {
      onRemove();
    }, 300);
  };

  const handleEdit = (id, updates) => {
    onEdit(id, updates);
    setShowEditModal(false);
  };

  return (
    <>
      <div
        className={`
          group relative flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200
          ${isDeleting ? 'opacity-0 scale-95' : 'opacity-100'}
          ${isSelected
            ? 'border-primary-400/60 bg-primary-50/50 dark:bg-primary-900/20'
            : 'border-slate-200/60 dark:border-slate-700/50 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-600'
          }
        `}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        {/* Checkbox */}
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggleSelect(transaction.id, e.target.checked)}
            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700 shrink-0 cursor-pointer"
          />
        )}

        {/* Ícono tipo */}
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm
          ${isIncome ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-rose-100 dark:bg-rose-900/40'}`}>
          <svg className={`w-4 h-4 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isIncome
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            }
          </svg>
        </div>

        {/* Descripción + meta — toque abre edición */}
        <button
          onClick={() => setShowEditModal(true)}
          className="flex-1 min-w-0 text-left"
          aria-label={`Editar: ${transaction.description}`}
        >
          <p className="text-sm font-semibold text-slate-800 dark:text-white truncate leading-tight">
            {transaction.description}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span>{formatDate(transaction.date)}</span>
            {!isIncome && transaction.category && (
              <><span>·</span><span>{transaction.category}</span></>
            )}
          </p>
        </button>

        {/* Monto + botón eliminar */}
        <div className="flex items-center gap-2 shrink-0">
          <div className={`text-sm font-bold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, txCurrency)}
            {hasDifferentCurrency && (
              <div className="text-[10px] font-medium text-slate-400 leading-none mt-0.5 text-right">
                ≈ {formatCurrency(convertCurrency(transaction.amount, txCurrency, selectedCurrency), selectedCurrency)}
              </div>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
            aria-label="Eliminar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && (
        <EditTransactionModal
          transaction={transaction}
          type={type}
          onClose={() => setShowEditModal(false)}
          onSave={handleEdit}
        />
      )}
    </>
  );
};

TransactionItem.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    category: PropTypes.string,
  }).isRequired,
  type: PropTypes.oneOf(['income', 'expense']).isRequired,
  onRemove: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  index: PropTypes.number,
};
