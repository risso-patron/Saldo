import { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Trash, 
  ArrowUp, 
  ArrowDown,
  Queue,
  MagnifyingGlass,
  Funnel
} from '@phosphor-icons/react';
import { Card } from './UI/Card';
import { formatCurrency, formatDate } from '../utils/formatters';
import { EXPENSE_CATEGORIES, MESSAGES } from '../constants/categories';

/**
 * Componente ExpenseList - Historial Pastel Premium
 */
export const ExpenseList = ({ 
  incomes = [], 
  expenses = [], 
  onRemoveIncome, 
  onRemoveExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeView, setActiveView] = useState('all'); // 'all', 'income', 'expense'

  // Proceso de filtrado
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

  return (
    <Card className="flex flex-col gap-8" padding="p-8">
      {/* Header con Tabs Integradas */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tighter">
          <Queue size={28} className="text-primary-500" />
          Movimientos
        </h3>
        
        <div className="flex gap-1.5 bg-slate-100/50 dark:bg-slate-800/80 p-1 rounded-2xl w-full sm:w-auto">
          {['all', 'income', 'expense'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeView === view 
                  ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-premium' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {view === 'all' ? 'Ver Todo' : view === 'income' ? 'Ingresos' : 'Gastos'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative group">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Buscar por detalle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm font-medium bg-slate-50/50 dark:bg-slate-900/50 border border-transparent rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <Funnel size={18} className="text-slate-400" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex-1 px-4 py-3 text-sm font-medium bg-slate-50/50 dark:bg-slate-900/50 border border-transparent rounded-2xl outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all shadow-sm appearance-none cursor-pointer"
          >
            <option value="all">Filtro por categoría</option>
            {EXPENSE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista Principal */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {displayList.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/30 dark:bg-slate-900/20 rounded-3xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{MESSAGES.EMPTY.NO_TRANSACTIONS}</p>
          </div>
        ) : (
          displayList.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-5 bg-white/50 dark:bg-slate-800/30 border border-slate-50 dark:border-slate-800/50 rounded-3xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-premium transition-all duration-300 group animate-fade-in-slide"
            >
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl shadow-sm ${
                  item.type === 'income' 
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' 
                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500'
                }`}>
                  {item.type === 'income' ? <ArrowUp size={22} weight="bold" /> : <ArrowDown size={22} weight="bold" />}
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight tracking-tight">
                    {item.description}
                  </h4>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] uppercase font-heavy tracking-widest text-slate-400">
                      {formatDate(item.date)}
                    </span>
                    {item.category && (
                      <span className="px-2.5 py-1 bg-slate-100/50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 text-[9px] font-black uppercase tracking-tighter rounded-lg">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className={`text-right ${
                  item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                }`}>
                  <p className="text-lg font-black tracking-tighter whitespace-nowrap">
                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                  </p>
                </div>
                
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <button 
                    onClick={() => item.type === 'income' ? onRemoveIncome(item.id) : onRemoveExpense(item.id)}
                    className="p-3 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-xl transition-colors"
                    title="Eliminar registro"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

ExpenseList.propTypes = {
  incomes: PropTypes.array,
  expenses: PropTypes.array,
  onRemoveIncome: PropTypes.func.isRequired,
  onRemoveExpense: PropTypes.func.isRequired,
};
