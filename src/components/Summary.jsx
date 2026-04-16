import PropTypes from 'prop-types';
import { 
  TrendUp, 
  TrendDown, 
  HandCoins, 
  CreditCard,
  ChartPieSlice,
  Minus,
} from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Card } from './UI/Card';
import { formatCurrency } from '../utils/formatters';
import { calculatePercentage } from '../utils/currencyHelpers';
import { STRATEGIC_MESSAGES } from '../constants/categories';

function calcDelta(current, previous) {
  if (previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

function DeltaBadge({ current, previous, inverseColor = false }) {
  const { t } = useTranslation()
  const delta = calcDelta(current, previous);
  if (delta === null) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-slate-400 dark:text-slate-500">
        <Minus size={9} weight="bold" />{t('summary.no_data')}
      </span>
    );
  }
  const isUp = delta > 0;
  const isNeutral = delta === 0;
  const positive = inverseColor ? !isUp : isUp;
  const colorClass = isNeutral
    ? 'text-slate-400 dark:text-slate-500'
    : positive
      ? 'text-emerald-500 dark:text-emerald-400'
      : 'text-rose-500 dark:text-rose-400';
  const Icon = isNeutral ? Minus : isUp ? TrendUp : TrendDown;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold ${colorClass}`}>
      <Icon size={10} weight="bold" />
      {isNeutral ? t('summary.equal') : `${isUp ? '+' : ''}${delta}%`}
      <span className="text-slate-400 dark:text-slate-500 font-normal"> {t('summary.vs_prev')}</span>
    </span>
  );
}

DeltaBadge.propTypes = {
  current: PropTypes.number.isRequired,
  previous: PropTypes.number.isRequired,
  inverseColor: PropTypes.bool,
};

export const Summary = ({ 
  totalIncome = 0, 
  totalExpenses = 0, 
  balance = 0, 
  creditCardDebt = 0,
  prevTotalIncome = 0,
  prevTotalExpenses = 0,
  prevBalance = 0,
}) => {
  const totalOut = totalExpenses + creditCardDebt;
  const savingsRate = totalIncome > 0 ? calculatePercentage(Math.max(0, balance - creditCardDebt), totalIncome) : 0;
  const isPositive = (balance - creditCardDebt) >= 0;
  const { t } = useTranslation()

  const getHealthBadge = (rate) => {
    if (rate >= 30) return STRATEGIC_MESSAGES.BADGES.PRO;
    if (rate >= 15) return STRATEGIC_MESSAGES.BADGES.SOLID;
    if (rate > 0)   return STRATEGIC_MESSAGES.BADGES.BASIC;
    return STRATEGIC_MESSAGES.BADGES.CRITICAL;
  };
  const healthBadge = getHealthBadge(savingsRate);

  const stats = [
    {
      label: t('summary.income'),
      value: totalIncome,
      prevValue: prevTotalIncome,
      inverseColor: false,
      icon: <HandCoins size={18} weight="fill" className="text-emerald-500" />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconBg: 'bg-emerald-500/10',
      iconBorder: 'border-emerald-500/20',
      barColor: 'bg-emerald-500',
    },
    {
      label: t('summary.expenses'),
      value: totalOut,
      prevValue: prevTotalExpenses,
      inverseColor: true,
      icon: <CreditCard size={18} weight="fill" className="text-rose-500" />,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      iconBg: 'bg-rose-500/10',
      iconBorder: 'border-rose-500/20',
      barColor: 'bg-rose-500',
    },
    {
      label: t('summary.balance'),
      value: balance - creditCardDebt,
      prevValue: prevBalance,
      inverseColor: false,
      icon: isPositive
        ? <TrendUp size={18} weight="fill" className="text-primary-500" />
        : <TrendDown size={18} weight="fill" className="text-rose-500" />,
      color: isPositive ? 'text-primary-500' : 'text-rose-500',
      bgColor: isPositive ? 'bg-primary-50 dark:bg-primary-950/40' : 'bg-rose-50 dark:bg-rose-950/40',
      iconBg: isPositive ? 'bg-primary-500/10' : 'bg-rose-500/10',
      iconBorder: isPositive ? 'border-primary-500/20' : 'border-rose-500/20',
      barColor: isPositive ? 'bg-primary-500' : 'bg-rose-500',
    }
  ];

  return (
    <div className="space-y-3">
      {/* TARJETAS COMPACTAS - 3 columnas en móvil */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-800/60 rounded-2xl p-3 sm:p-5 border border-slate-100 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-7 h-7 sm:w-10 sm:h-10 rounded-xl ${stat.iconBg} ${stat.iconBorder} border flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <span className={`text-xs sm:text-[10px] font-black uppercase tracking-tight text-right leading-tight ${stat.color}`}>
                {stat.label}
              </span>
            </div>
            <p className={`text-base sm:text-2xl font-black ${stat.color} tracking-tight leading-none mb-1 truncate`}>
              {formatCurrency(stat.value)}
            </p>
            <DeltaBadge current={stat.value} previous={stat.prevValue} inverseColor={stat.inverseColor} />
          </div>
        ))}
      </div>

      {/* INDICADOR DE SALUD — Ultra compacto en móvil */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <ChartPieSlice size={16} weight="fill" className="text-indigo-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-black text-slate-800 dark:text-white">Capacidad de Ahorro</p>
                <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase ${healthBadge.color} ${healthBadge.bgColor}`}>
                  {healthBadge.label}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">{STRATEGIC_MESSAGES.DEFINITIONS.SAVINGS_RATE}</p>
            </div>
          </div>
          <span className={`text-2xl sm:text-3xl font-black ${isPositive ? 'text-indigo-500' : 'text-rose-500'} tracking-tighter shrink-0`}>
            {savingsRate}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700">
          <div
            className={`h-full transition-all duration-1000 ease-out ${
              savingsRate > 20 ? 'bg-indigo-500' : savingsRate > 0 ? 'bg-amber-400' : 'bg-rose-400'
            }`}
            style={{ width: `${Math.min(Math.max(0, savingsRate), 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

Summary.propTypes = {
  totalIncome: PropTypes.number,
  totalExpenses: PropTypes.number,
  balance: PropTypes.number,
  creditCardDebt: PropTypes.number,
  prevTotalIncome: PropTypes.number,
  prevTotalExpenses: PropTypes.number,
  prevBalance: PropTypes.number,
};
