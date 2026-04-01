import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import PropTypes from 'prop-types';

// Registrar los elementos de Chart.js necesarios
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Gráfico de Pastel (Pie) que muestra los gastos particionados por Categoría.
 * Ligero, usando Chart.js nativo.
 */
export const ExpensePieChart = ({ categoryAnalysis }) => {
  // Configuración de datos adaptada para Chart.js
  const data = {
    labels: categoryAnalysis.map(cat => cat.name),
    datasets: [
      {
        label: 'Gasto por Categoría',
        data: categoryAnalysis.map(cat => cat.value),
        backgroundColor: [
          '#a855f7', // Purple
          '#3b82f6', // Blue
          '#ec4899', // Pink
          '#10b981', // Emerald
          '#f59e0b', // Amber
          '#ef4444', // Red
          '#6366f1', // Indigo
          '#14b8a6', // Teal
          '#db2777', // Fuchsia
        ],
        borderColor: '#1e293b', // Color de los separadores (ajustado para dark mode)
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#cbd5e1', // Texto gris claro para dark theme
          padding: 20,
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 13
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            // Damos formato local simulado
            return ` ${label}: $${value.toLocaleString()}`;
          }
        }
      }
    }
  };

  if (!categoryAnalysis || categoryAnalysis.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>No hay gastos para mostrar en el gráfico de pastel.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[300px]">
      <Pie data={data} options={options} />
    </div>
  );
};

ExpensePieChart.propTypes = {
  categoryAnalysis: PropTypes.array.isRequired
};
