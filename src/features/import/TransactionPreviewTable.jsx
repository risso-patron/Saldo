import React, { useState, useMemo } from 'react';

const CATEGORIES = [
  { value: 'Transporte', label: '🚗 Transporte' },
  { value: 'Comida', label: '🍔 Comida' },
  { value: 'Entretenimiento', label: '🎬 Entretenimiento' },
  { value: 'Salud', label: '🏥 Salud' },
  { value: 'Servicios', label: '🔌 Servicios' },
  { value: 'Compras', label: '🛍️ Compras' },
  { value: 'Ingresos', label: '💰 Ingresos' },
  { value: 'Educación', label: '📚 Educación' },
  { value: 'Vivienda', label: '🏠 Vivienda' },
  { value: 'Otros', label: '📦 Otros' }
];

export default function TransactionPreviewTable({ transactions, onUpdateTransaction, onImport, isImporting }) {
  const [filterText, setFilterText] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchText = t.description.toLowerCase().includes(filterText.toLowerCase());
      const matchCat = filterCat === 'All' || t.category === filterCat;
      return matchText && matchCat;
    });
  }, [transactions, filterText, filterCat]);

  const { incomes, expenses, net } = useMemo(() => {
    let inc = 0, exp = 0;
    transactions.forEach(t => {
      if (t.amount >= 0) inc += t.amount;
      else exp += Math.abs(t.amount);
    });
    return { incomes: inc, expenses: exp, net: inc - exp };
  }, [transactions]);

  return (
    <div className="mb-6 border-2 border-purple-200 dark:border-purple-800 rounded-[2.5rem] p-8 bg-white dark:bg-slate-900 shadow-2xl">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
        <div>
          <h4 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            Vista Previa de Movimientos
          </h4>
          <p className="text-slate-500 font-medium mt-1 ml-13">
            Edita las descripciones y categorías antes de la confirmación final.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="🔍 Buscar transacción..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-700 dark:text-slate-300 placeholder-slate-400 min-w-[200px]"
          />
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-700 dark:text-slate-300"
          >
            <option value="All">🔖 Todas las categorías</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/50 px-4 py-2 rounded-xl">
            {filteredTransactions.length} de {transactions.length} items
          </span>
        </div>
      </div>

      {/* 📊 RESUMEN DINÁMICO DE TOTALES */}
      {/* RC-1.4/C1: sin color permanente asociado a ingreso/gasto -- misma
          regla ya aplicada en FilaMovimiento.jsx ("el signo tipográfico
          distingue, nunca el rojo"). Ambas tarjetas comparten el mismo
          tratamiento neutro (slate); el signo "−" (MINUS_SIGN, mismo
          caracter que FilaMovimiento.jsx) y la etiqueta son lo único que
          distingue Total Gastos de Total Ingresos. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-600 dark:bg-slate-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Ingresos</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              ${incomes.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-600 dark:bg-slate-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Gastos</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white">
              −${expenses.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/30 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-black text-indigo-800 dark:text-indigo-400 uppercase tracking-widest">Balance Neto</p>
            <p className="text-2xl font-black text-indigo-700 dark:text-indigo-300">
              ${net.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* TABLA EDITABLE */}
      <div className="overflow-x-auto rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 max-h-[500px] custom-scrollbar">
        <table className="min-w-full divide-y-2 divide-slate-100 dark:divide-slate-800 table-fixed">
          <thead className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md sticky top-0 z-10 w-full">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[18%]">Fecha</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[40%]">Descripción (Editable)</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[20%]">Monto</th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-[22%]">Categoría</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((row, idx) => {
              const isIngreso = row.amount >= 0;
              // Original index in total array to apply correct updates
              const realIdx = transactions.indexOf(row);
              
              return (
                <tr key={idx} className={`group transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isIngreso ? 'bg-emerald-50/10' : 'bg-rose-50/10'}`}>
                  
                  {/* Fecha */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{row.date}</span>
                  </td>
                  
                  {/* Descripción Input */}
                  <td className="px-6 py-4 text-left">
                    <input 
                       type="text"
                       value={row.description}
                       onChange={(e) => onUpdateTransaction(realIdx, 'description', e.target.value)}
                       className="w-full bg-transparent text-sm font-bold text-slate-700 dark:text-slate-200 outline-none border-b border-transparent focus:border-primary-400 focus:pb-1 transition-all"
                    />
                  </td>
                  
                  {/* Monto */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-base font-black ${isIngreso ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                      {isIngreso ? '+' : '-'}${Math.abs(row.amount).toFixed(2)}
                    </span>
                  </td>

                  {/* Categoria Select */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative">
                      <select
                        value={row.category || 'Otros'}
                        onChange={(e) => onUpdateTransaction(realIdx, 'category', e.target.value)}
                        className="w-full appearance-none pl-8 pr-8 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-black uppercase tracking-tighter outline-none focus:ring-2 focus:ring-primary-400 transition-all cursor-pointer"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.value} value={c.value}>{c.value}</option>
                        ))}
                      </select>
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm">
                        {row.emoji || '📦'}
                      </span>
                      {row.source === 'ai' && (
                        <div className="absolute -right-1 -top-2 bg-purple-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10 animate-pulse shadow-sm shadow-purple-500/50" title="Categorizado con IA">IA</div>
                      )}
                    </div>
                  </td>
                  
                </tr>
              );
            })}
            
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center">
                  <span className="text-slate-400 font-medium">No se encontraron transacciones que coincidan con la búsqueda.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botón de importación destacado */}
      <div className="mt-8">
        <button
          onClick={onImport}
          disabled={isImporting || transactions.length === 0}
          className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg 
            hover:from-purple-700 hover:to-pink-700 
            transform hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            shadow-lg hover:shadow-xl
            flex items-center justify-center gap-3"
        >
          {isImporting ? (
            <>
              <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Importando {transactions.length} transacciones...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Importar TODOS los movimientos del preview ({transactions.length})</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
