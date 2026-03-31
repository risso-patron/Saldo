import { describe, it, expect } from 'vitest';
import { calculateTotal, calculateBalance, calculateCategoryAnalysis, filterByYear } from '../utils/calculations';

describe('Cálculos de Presupuesto', () => {
  const mockTransactions = [
    { description: 'Sueldo', amount: 1000, date: '2025-01-01', type: 'income' },
    { description: 'Freelance', amount: 500, date: '2025-02-01', type: 'income' },
    { description: 'Renta', amount: 600, date: '2025-01-05', category: 'Vivienda', type: 'expense' },
    { description: 'Comida', amount: 200, date: '2025-02-10', category: 'Alimentación', type: 'expense' },
  ];

  it('debe calcular el total correctamente', () => {
    const incomes = mockTransactions.filter(t => t.type === 'income');
    expect(calculateTotal(incomes)).toBe(1500);
  });

  it('debe calcular el balance correctamente', () => {
    expect(calculateBalance(1500, 800)).toBe(700);
  });

  it('debe calcular el análisis por categoría correctamente', () => {
    const expenses = mockTransactions.filter(t => t.type === 'expense');
    const analysis = calculateCategoryAnalysis(expenses, 800);
    
    expect(analysis).toHaveLength(2);
    expect(analysis[0].category).toBe('Vivienda');
    expect(analysis[0].amount).toBe(600);
    expect(analysis[0].percentage).toBe(75);
  });

  it('debe filtrar por año correctamente', () => {
    const filtered = filterByYear(mockTransactions, 2025);
    expect(filtered).toHaveLength(4);
    
    const none = filterByYear(mockTransactions, 2024);
    expect(none).toHaveLength(0);
  });
});
