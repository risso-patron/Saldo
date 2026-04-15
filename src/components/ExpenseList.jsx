import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Trash, 
  ArrowUp, 
  ArrowDown,
  Queue,
  MagnifyingGlass,
  Funnel,
  ArrowsDownUp
} from '@phosphor-icons/react';
import { Card } from './UI/Card';
import { formatCurrency, formatDate } from '../utils/formatters';
import { EXPENSE_CATEGORIES, MESSAGES } from '../constants/categories';
import { EditTransactionModal } from './Transactions/EditTransactionModal';

export const ExpenseList = ({ 
  incomes = [], 
  expenses = [], 
  onRemoveIncome, 
  onRemoveExpense,
  onUpdateIncome,
  onUpdateExpense,
  onRemoveMultiple,
  onCategorizeMultiple,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeView, setActiveView] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCategory, setBulkCategory] = useState('');
  const [editingItem, setEditingItem] = useState(null);

  const filteredIncomes = incomes.filter(inc => 
    inc.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const allTransactions = [
    ...filteredIncomes.map(i => ({ ...i, type: 'income' })),
    ...filteredExpenses.map(e => ({ ...e, type: 'expense' }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const displayList = activeView === 'income' 
    ? allTransactions.filter(t => t.type === 'income')
    : activeView === 'expense'
    ? allTransactions.filter(t => t.type === 'expense')
    : allTransactions;

  const getCategoryIcon = (cat) => EXPENSE_CATEGORIES.find(c => c.value === cat)?.icon || '•';

  return (
    <Card className="flex flex-col gap-4" padding="p-4 sm:p-6">
      {/* Header compacto */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base sm:text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tighter">
          <ArrowsDownUp size={18} className="text-primary-500" />
          Historial
        </h3>
        
        <div className="flex gap-1 bg-slate-100/50 dark:bg-slate-800/80 p-1 rounded-xl">
          {['all', 'income', 'expense'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                activeView === view 
                  ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {view === 'all' ? 'Todo' : view === 'income' ? 'Entradas' : 'Salidas'}
            </button>
          ))}
        </div>
      </div>

      {/* Búsqueda y Filtro compactos en una fila */}
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs font-medium bg-slate-50 dark:bg-slate-900/50 border border-transparent rounded-xl outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900/20 transition-all"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900/50 border border-transparent rounded-xl outline-none focus:ring-2 focus:ring-primary-200 dark:text-white transition-all appearance-none cursor-pointer"
        >
          <option value="all">Categorías</option>
          {EXPENSE_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
          ))}
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/50 rounded-2xl px-3 py-2 flex items-center justify-between gap-3 animate-fade-in-slide">
          <span className="text-xs font-black text-primary-700 dark:text-primary-400">
            {selectedIds.length} seleccionados
          </span>
          <div className="flex gap-2">
            <select
              value={bulkCategory}
              onChange={(e) => {
                if (e.target.value) {
                  onCategorizeMultiple(selectedIds, e.target.value);
                  setSelectedIds([]);
                  setBulkCategory('');
                }
              }}
              className="px-2 py-1 text-[10px] font-bold bg-white dark:bg-slate-800 border border-primary-200 dark:border-primary-700 rounded-lg dark:text-white appearance-none cursor-pointer"
            >
              <option value="">🏷️ Mover a...</option>
              {EXPENSE_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
              ))}
            </select>
            <button
              onClick={() => {
                if (window.confirm(`¿Eliminar ${selectedIds.length} transacciones?`)) {
                  onRemoveMultiple(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="px-3 py-1 flex items-center gap-1 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-[10px] font-black uppercase rounded-lg"
            >
              <Trash size={11} weight="bold" /> Borrar
            </button>
          </div>
        </div>
      )}

      {/* Seleccionar todos — ultra compacto */}
      {displayList.length > 0 && (
        <div className="flex items-center gap-2 px-1 border-b border-slate-100 dark:border-slate-800 pb-2">
          <input
            type="checkbox"
            checked={selectedIds.length === displayList.length && displayList.length > 0}
            onChange={(e) => {
              if (e.target.checked) setSelectedIds(displayList.map(t => t.id));
              else setSelectedIds([]);
            }}
            className="w-4 h-4 rounded border-2 border-slate-300 text-primary-600 cursor-pointer"
          />
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Seleccionar todo</span>
          <span className="ml-auto text-[9px] text-slate-400 font-bold">{displayList.length} movimientos</span>
        </div>
      )}

      {/* Lista de Transacciones — diseño compacto tipo "feed" */}
      <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
        {displayList.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/30 dark:bg-slate-900/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{MESSAGES.EMPTY?.NO_TRANSACTIONS || 'Sin movimientos'}</p>
          </div>
        ) : (
          displayList.map((item) => (
            <div 
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 group ${
                selectedIds.includes(item.id) 
                  ? 'bg-primary-50/80 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700' 
                  : 'bg-white/60 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 hover:bg-white dark:hover:bg-slate-800/80'
              }`}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.includes(item.id)}
                onChange={(e) => {
                  if (e.target.checked) setSelectedIds(prev => [...prev, item.id]);
                  else setSelectedIds(prev => prev.filter(i => i !== item.id));
                }}
                className="w-3.5 h-3.5 shrink-0 rounded border-2 border-slate-300 text-primary-600 cursor-pointer"
              />
              
              {/* Indicador de tipo */}
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                item.type === 'income'
                  ? 'bg-emerald-500/10'
                  : 'bg-rose-500/10'
              }`}>
                {item.type === 'income'
                  ? <ArrowUp size={14} weight="bold" className="text-emerald-500" />
                  : <ArrowDown size={14} weight="bold" className="text-rose-500" />}
              </div>

              {/* Datos — tap abre edición */}
              <button
                className="flex-1 min-w-0 text-left"
                onClick={() => setEditingItem(item)}
                aria-label={`Editar: ${item.description}`}
              >
                <p className="text-xs font-black text-slate-800 dark:text-white truncate leading-tight">
                  {item.description}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-bold text-slate-400">{formatDate(item.date)}</span>
                  {item.category && (
                    <span className="text-[9px] text-slate-400">
                      {getCategoryIcon(item.category)} {item.category}
                    </span>
                  )}
                </div>
              </button>

              {/* Monto + Botón borrar */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-sm font-black tracking-tight flex flex-col items-end ${
                  item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  <span>{item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount, item.currency || 'USD')}</span>
                </span>
                <button 
                  onClick={() => item.type === 'income' ? onRemoveIncome(item.id) : onRemoveExpense(item.id)}
                  className="p-1.5 text-slate-300 dark:text-slate-600 hover:text-rose-400 dark:hover:text-rose-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de edición */}
      {editingItem && (
        <EditTransactionModal
          transaction={editingItem}
          type={editingItem.type}
          onClose={() => setEditingItem(null)}
          onSave={(id, updates) => {
            if (editingItem.type === 'income') onUpdateIncome?.(id, updates);
            else onUpdateExpense?.(id, updates);
            setEditingItem(null);
          }}
        />
      )}
    </Card>
  );
};

ExpenseList.propTypes = {
  incomes: PropTypes.array,
  expenses: PropTypes.array,
  onRemoveIncome: PropTypes.func.isRequired,
  onRemoveExpense: PropTypes.func.isRequired,
  onUpdateIncome: PropTypes.func,
  onUpdateExpense: PropTypes.func,
  onRemoveMultiple: PropTypes.func,
  onCategorizeMultiple: PropTypes.func,
};
