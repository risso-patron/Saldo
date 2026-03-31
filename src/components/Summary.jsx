import PropTypes from 'prop-types';
import { 
  Wallet, 
  TrendUp, 
  TrendDown, 
  HandCoins, 
  CreditCard,
  ChartPieSlice
} from '@phosphor-icons/react';
import { Card } from './UI/Card';
import { formatCurrency } from '../utils/formatters';
import { calculatePercentage } from '../utils/currencyHelpers';
import { STRATEGIC_MESSAGES } from '../constants/categories';

/**
 * Componente Summary - Panel de estadísticas Pastel Premium
 */
export const Summary = ({ 
  totalIncome = 0, 
  totalExpenses = 0, 
  balance = 0, 
  creditCardDebt = 0 
}) => {
  const totalOut = totalExpenses + creditCardDebt;
  const savingsRate = totalIncome > 0 ? calculatePercentage(Math.max(0, balance - creditCardDebt), totalIncome) : 0;
  const isPositive = (balance - creditCardDebt) >= 0;

  // Lógica de Insignia de Salud Financiera
  const getHealthBadge = (rate) => {
    if (rate >= 30) return STRATEGIC_MESSAGES.BADGES.PRO;
    if (rate >= 15) return STRATEGIC_MESSAGES.BADGES.SOLID;
    if (rate > 0)   return STRATEGIC_MESSAGES.BADGES.BASIC;
    return STRATEGIC_MESSAGES.BADGES.CRITICAL;
  };
  const healthBadge = getHealthBadge(savingsRate);

  const stats = [
    {
      label: 'Ingresos Totales',
      value: totalIncome,
      icon: <HandCoins size={22} weight="fill" />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconColor: 'bg-emerald-500 text-white',
      tooltip: 'Suma de todas tus fuentes de ingresos.'
    },
    {
      label: 'Gastos + Deudas',
      value: totalOut,
      icon: <CreditCard size={22} weight="fill" />,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      iconColor: 'bg-rose-500 text-white',
      tooltip: 'Tus deudas y consumos actuales.'
    },
    {
      label: 'Balance Neto',
      value: balance - creditCardDebt,
      icon: isPositive ? <TrendUp size={22} weight="fill" /> : <TrendDown size={22} weight="fill" />,
      color: isPositive ? 'text-primary-500' : 'text-rose-500',
      bgColor: isPositive ? 'bg-primary-50 dark:bg-primary-950/40' : 'bg-rose-50 dark:bg-rose-950/40',
      iconColor: isPositive ? 'bg-primary-500 text-white' : 'bg-rose-500 text-white',
      tooltip: STRATEGIC_MESSAGES.DEFINITIONS.BALANCE
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} padding="p-5" className="group" title={stat.tooltip}>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl ${stat.iconColor} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform duration-500`}>
                {stat.icon}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-heavy tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                  {stat.label}
                </p>
                <p className={`text-2xl font-black ${stat.color} tracking-tight`}>
                  {formatCurrency(stat.value)}
                </p>
              </div>
            </div>
            {/* Sutil indicador visual de tendencia */}
            <div className={`h-1 w-full rounded-full ${stat.bgColor} overflow-hidden`}>
              <div className={`h-full ${stat.iconColor} opacity-20 w-3/4 animate-pulse`} />
            </div>
          </div>
        </Card>
      ))}

      {/* Indicador de Salud Financiera (Savings Rate) */}
      <Card className="md:col-span-3 overflow-hidden" padding="p-0">
        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500">
              <ChartPieSlice size={28} weight="fill" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-lg font-bold text-slate-800 dark:text-white leading-none">Capacidad de Ahorro</h4>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${healthBadge.color} ${healthBadge.bgColor} border border-current/10`}>
                  {healthBadge.label}
                </span>
              </div>
              <p className="text-sm text-slate-400 font-medium">{STRATEGIC_MESSAGES.DEFINITIONS.SAVINGS_RATE}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-1">
            <span className={`text-4xl font-black ${isPositive ? 'text-indigo-500' : 'text-rose-500'} tracking-tighter`}>
              {savingsRate}%
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Ratio Mensual</span>
          </div>
        </div>
        
        {/* Barra de Progreso Pastel */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800">
          <div 
            className={`h-full transition-all duration-1000 ease-out shadow-lg ${
              savingsRate > 20 ? 'bg-indigo-500' : savingsRate > 0 ? 'bg-amber-400' : 'bg-rose-400'
            }`}
            style={{ width: `${Math.min(Math.max(0, savingsRate), 100)}%` }}
          />
        </div>
      </Card>
    </div>
  );
};

Summary.propTypes = {
  totalIncome: PropTypes.number,
  totalExpenses: PropTypes.number,
  balance: PropTypes.number,
  creditCardDebt: PropTypes.number,
};
