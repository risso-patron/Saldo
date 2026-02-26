import PropTypes from 'prop-types';
import { Card } from '../Shared/Card';
import { formatCurrency } from '../../utils/formatters';
import { addAmounts, subtractAmounts, calculatePercentage } from '../../utils/currencyHelpers';
import { MoneyRainWebP } from '../Shared/WebPAnimation';
import { Wallet, TrendUp, TrendDown, ArrowUp } from '@phosphor-icons/react';

/**
 * Mini sparkline SVG — muestra la tendencia de los últimos 6 meses
 */
const MiniSparkline = ({ values, color }) => {
  if (!values || values.length < 2 || values.every(v => v === 0)) return null;
  const max = Math.max(...values, 1);
  const W = 72, H = 24;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W;
      const y = H - (v / max) * (H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={W} height={H} className="opacity-60 mt-1" aria-hidden="true">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
};

/**
 * Componente BalanceCard - Muestra el balance con indicador visual y sparklines
 */
export const BalanceCard = ({ totalIncome, totalExpenses, balance, creditCardDebt = 0, sparklineData = [] }) => {
  // Usar decimal.js para evitar errores de punto flotante en sumas/restas
  const totalExpensesWithDebt = addAmounts(totalExpenses, creditCardDebt);
  const realBalance = subtractAmounts(balance, creditCardDebt);

  // Porcentaje con precisión decimal
  const percentage = calculatePercentage(Math.max(0, realBalance), totalIncome);
  const isPositive = realBalance >= 0;

  const ingresosSpark  = sparklineData.map(d => d.ingresos);
  const gastosSpark    = sparklineData.map(d => d.gastos);
  const balanceSpark   = sparklineData.map(d => d.ingresos - d.gastos);

  return (
    <Card className="bg-gradient-dark text-white col-span-full relative overflow-hidden">
      {/* Animación de fondo si balance muy positivo */}
      {realBalance > 1000 && (
        <div className="absolute top-4 right-4 opacity-30 pointer-events-none">
          <MoneyRainWebP size="xl" />
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-white/15">
          {realBalance > 500 ? (
            <Wallet weight="fill" size={28} color="#4ade80" />
          ) : realBalance > 0 ? (
            <TrendUp weight="bold" size={26} color="#4ade80" />
          ) : (
            <TrendDown weight="bold" size={26} color="#f87171" />
          )}
        </div>
        <h2 className="text-xl font-medium opacity-90">Resumen Financiero</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Ingresos */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 transform transition-transform hover:scale-105">
          <div className="text-sm opacity-80 mb-1">Total Ingresos</div>
          <div className="text-3xl font-bold">{formatCurrency(totalIncome)}</div>
          <MiniSparkline values={ingresosSpark} color="#4ade80" />
        </div>

        {/* Total Gastos */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 transform transition-transform hover:scale-105">
          <div className="text-sm opacity-80 mb-1">Total Gastos</div>
          <div className="text-3xl font-bold">{formatCurrency(totalExpensesWithDebt)}</div>
          {creditCardDebt > 0 && (
            <div className="text-xs opacity-70 mt-1">
              Gastos: {formatCurrency(totalExpenses)} + Tarjetas: {formatCurrency(creditCardDebt)}
            </div>
          )}
          <MiniSparkline values={gastosSpark} color="#f87171" />
        </div>

        {/* Balance */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 transform transition-transform hover:scale-105">
          <div className="text-sm opacity-80 mb-1">Balance</div>
          <div className={`text-3xl font-bold ${isPositive ? 'text-accent-green' : 'text-accent-red'}`}>
            {formatCurrency(realBalance)}
          </div>
          <MiniSparkline values={balanceSpark} color={isPositive ? '#4ade80' : '#f87171'} />
          
          {/* Barra de progreso */}
          <div className="mt-3 w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isPositive ? 'bg-gradient-success' : 'bg-gradient-danger'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

BalanceCard.propTypes = {
  totalIncome: PropTypes.number.isRequired,
  totalExpenses: PropTypes.number.isRequired,
  balance: PropTypes.number.isRequired,
  creditCardDebt: PropTypes.number,
  sparklineData: PropTypes.arrayOf(PropTypes.shape({
    mes:      PropTypes.string,
    ingresos: PropTypes.number,
    gastos:   PropTypes.number,
  })),
};
