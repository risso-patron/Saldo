import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import PropTypes from 'prop-types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Gráfico de Barras que compara de forma directa el Total de Ingresos vs Total de Gastos
 */
export const IncomeExpenseBarChart = ({ totalIncome, totalExpenses }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const data = {
    labels: ['Balance General'],
    datasets: [
      {
        label: 'Ingresos',
        data: [totalIncome],
        backgroundColor: '#10b981', // Emerald
        borderRadius: 6,
      },
      {
        label: 'Gastos',
        data: [totalExpenses],
        backgroundColor: '#ef4444', // Red
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 14 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return ` ${context.dataset.label}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[200px] md:h-[300px]">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[200px] md:h-[300px]">
      <Bar data={data} options={options} />
    </div>
  );
};

IncomeExpenseBarChart.propTypes = {
  totalIncome: PropTypes.number.isRequired,
  totalExpenses: PropTypes.number.isRequired
};
