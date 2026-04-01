import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Target, PencilSimple, CheckCircle } from '@phosphor-icons/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatCurrency } from '../../utils/formatters';

export const GlobalBudgetTracker = ({ totalExpenses }) => {
  const [budgetLimit, setBudgetLimit] = useLocalStorage('budgetrp_global_limit', 1000);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(budgetLimit.toString());

  // Lógica de cálculo
  const safeBudget = Number(budgetLimit) || 0;
  const percentage = safeBudget > 0 ? Math.min(100, Math.round((totalExpenses / safeBudget) * 100)) : 100;
  
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
    <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-xl w-full text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        
        {/* Cabecera y Título */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Target size={24} weight="bold" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Presupuesto Mensual</h3>
            <p className="text-sm text-gray-400">{getAlertText()}</p>
          </div>
        </div>

        {/* Input Interactive */}
        <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-slate-600/50">
          {isEditing ? (
            <>
              <input
                type="number"
                min="0"
                step="100"
                autoFocus
                className="bg-transparent border-none outline-none text-right font-mono font-bold w-24 px-2 
                           text-purple-300 placeholder-slate-500 appearance-none m-0"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button 
                onClick={handleSave}
                className="p-1.5 bg-green-500 hover:bg-green-400 rounded-lg transition-colors"
                aria-label="Guardar límite de presupuesto"
              >
                <CheckCircle size={18} weight="bold" className="text-slate-900" />
              </button>
            </>
          ) : (
            <>
              <span className="font-mono font-bold text-lg px-3 py-1 cursor-pointer hover:text-purple-300 transition-colors" 
                    onClick={() => setIsEditing(true)}>
                {formatCurrency(safeBudget)}
              </span>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                aria-label="Editar límite de presupuesto"
              >
                <PencilSimple size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Barra de Progreso Dinámica */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-semibold">
          <span className="text-gray-300">Usado: {formatCurrency(totalExpenses)}</span>
          <span className={percentage >= 90 ? 'text-red-400' : 'text-gray-400'}>
            {percentage}%
          </span>
        </div>
        
        <div className="relative h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 shadow-inner">
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
