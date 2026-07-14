import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Target, PencilSimple, CheckCircle } from '@phosphor-icons/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatCurrency, formatPercentageSafe } from '../../utils/formatters';

export const GlobalBudgetTracker = ({ totalExpenses }) => {
  const [budgetLimit, setBudgetLimit] = useLocalStorage('budgetrp_global_limit', 1000);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(budgetLimit.toString());

  // Lógica de cálculo — sin redondear: umbrales, barra y texto usan el valor
  // real; el display lo resuelve formatPercentageSafe (HAL-004)
  const safeBudget = Number(budgetLimit) || 0;
  const percentage = safeBudget > 0 ? Math.min(100, (totalExpenses / safeBudget) * 100) : 100;
  
  // Psicología del color para UX
  const getProgressColor = () => {
    if (safeBudget === 0) return 'bg-gray-500';
    if (percentage < 70) return 'bg-emerald-500 shadow-emerald-500/50';
    if (percentage < 90) return 'bg-amber-400 shadow-amber-400/50';
    return 'bg-red-500 shadow-red-500/50';
  };

  const getAlertText = () => {
    if (safeBudget === 0) return 'Establece un límite de gasto.';
    if (percentage < 70) return '¡Vas por buen camino!';
    if (percentage < 90) return 'Cerca del límite. Toma precauciones.';
    if (percentage < 100) return '¡Peligro! Estás a punto de pasarte.';
    return 'Límite de presupuesto excedido.';
  };

  const handleSave = () => {
    const parsed = parseFloat(tempValue);
    if (!isNaN(parsed) && parsed >= 0) {
      setBudgetLimit(parsed);
    } else {
      setTempValue(budgetLimit.toString()); // Revertir si es inválido
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 px-4 py-3 sm:p-6 rounded-2xl shadow-xl w-full text-white">
      <div className="flex justify-between items-center gap-3 mb-3">
        
        {/* Cabecera y Título */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Target size={18} weight="fill" className="text-purple-400" />
          </div>
          <div>
            <h3 className="font-black text-sm leading-tight">Presupuesto Mensual</h3>
            <p className="text-[10px] text-gray-400 font-medium">{getAlertText()}</p>
          </div>
        </div>

        {/* Input Interactive */}
        <div className="flex items-center gap-1.5 bg-slate-900/50 px-2 py-1 rounded-xl border border-slate-600/50">
          {isEditing ? (
            <>
              <input
                type="number" min="0" step="100" autoFocus
                className="bg-transparent border-none outline-none text-right font-mono font-black w-20 text-sm text-purple-300 appearance-none m-0"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button onClick={handleSave} className="p-1 bg-green-500 hover:bg-green-400 rounded-lg transition-colors">
                <CheckCircle size={14} weight="bold" className="text-slate-900" />
              </button>
            </>
          ) : (
            <>
              <span className="font-mono font-black text-sm px-1 py-0.5 cursor-pointer hover:text-purple-300 transition-colors whitespace-nowrap" onClick={() => setIsEditing(true)}>
                {formatCurrency(safeBudget)}
              </span>
              <button onClick={() => setIsEditing(true)} className="p-1 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white">
                <PencilSimple size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Barra de Progreso Dinámica */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold">
          <span className="text-gray-300">Usado: {formatCurrency(totalExpenses)}</span>
          <span className={percentage >= 90 ? 'text-red-400' : 'text-gray-400'}>{formatPercentageSafe(percentage)}</span>
        </div>
        <div className="relative h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
          <div
            className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out shadow-lg ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

GlobalBudgetTracker.propTypes = {
  totalExpenses: PropTypes.number.isRequired
};
