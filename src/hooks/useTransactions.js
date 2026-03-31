import { useState, useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS, TRANSACTION_TYPES, EXPENSE_CATEGORIES } from '../constants/categories';
import { validateTransaction } from '../utils/validators';
import { calculateTotal, calculateBalance, calculateCategoryAnalysis } from '../utils/calculations';

/**
 * Custom hook para manejar toda la lógica de transacciones (ingresos y gastos)
 * @returns {Object} - Objeto con estados y funciones para manejar transacciones
 */
export const useTransactions = () => {
  // Estados en localStorage
  const [incomes, setIncomes, refreshIncomes] = useLocalStorage(STORAGE_KEYS.INCOMES, []);
  const [expenses, setExpenses, refreshExpenses] = useLocalStorage(STORAGE_KEYS.EXPENSES, []);
  
  // Estados locales
  const [filter, setFilter] = useState('all'); // 'all', 'income', 'expense'
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', message: string }

  /**
   * Muestra una alerta temporal. Si no se pasa tipo, limpia la alerta.
   */
  const showAlert = useCallback((type, message) => {
    if (!type) {
      setAlert(null);
      return;
    }

    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  }, []);

  /**
   * Agrega un nuevo ingreso
   */
  const addIncome = useCallback((description, amount, date = null) => {
    const validation = validateTransaction({ description, amount, date });
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showAlert('error', firstError);
      return false;
    }

    const newIncome = {
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: parseFloat(amount),
      type: TRANSACTION_TYPES.INCOME,
      date: date || new Date().toISOString().split('T')[0], // Formato: YYYY-MM-DD
      createdAt: new Date().toISOString(),
    };

    setIncomes(prev => [...prev, newIncome]);
    showAlert('success', 'Ingreso agregado exitosamente');
    return true;
  }, [setIncomes, showAlert]);

  /**
   * Agrega un nuevo gasto
   */
  const addExpense = useCallback((description, category, amount, date = null) => {
    const validation = validateTransaction(
      { description, category, amount, date }, 
      true, 
      EXPENSE_CATEGORIES
    );
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showAlert('error', firstError);
      return false;
    }

    const newExpense = {
      id: crypto.randomUUID(),
      description: description.trim(),
      category,
      amount: parseFloat(amount),
      type: TRANSACTION_TYPES.EXPENSE,
      date: date || new Date().toISOString().split('T')[0], // Formato: YYYY-MM-DD
      createdAt: new Date().toISOString(),
    };

    setExpenses(prev => [...prev, newExpense]);
    showAlert('success', 'Gasto agregado exitosamente');
    return true;
  }, [setExpenses, showAlert]);

  /**
   * Actualiza un ingreso existente
   */
  const updateIncome = useCallback((id, updates) => {
    const validation = validateTransaction(updates);
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showAlert('error', firstError);
      return false;
    }

    setIncomes(prev => prev.map(income => 
      income.id === id 
        ? { ...income, ...updates, amount: parseFloat(updates.amount) }
        : income
    ));
    showAlert('success', 'Ingreso actualizado');
    return true;
  }, [setIncomes, showAlert]);

  /**
   * Actualiza un gasto existente
   */
  const updateExpense = useCallback((id, updates) => {
    const validation = validateTransaction(updates, true, EXPENSE_CATEGORIES);
    
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      showAlert('error', firstError);
      return false;
    }

    setExpenses(prev => prev.map(expense => 
      expense.id === id 
        ? { ...expense, ...updates, amount: parseFloat(updates.amount) }
        : expense
    ));
    showAlert('success', 'Gasto actualizado');
    return true;
  }, [setExpenses, showAlert]);

  /**
   * Elimina un ingreso (sin confirm nativo — la confirmaci\u00f3n se maneja en UI)
   */
  const removeIncome = useCallback((id) => {
    setIncomes(prev => prev.filter(income => income.id !== id));
    showAlert('success', 'Ingreso eliminado');
  }, [setIncomes, showAlert]);

  /**
   * Elimina un gasto (sin confirm nativo — la confirmaci\u00f3n se maneja en UI)
   */
  const removeExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
    showAlert('success', 'Gasto eliminado');
  }, [setExpenses, showAlert]);

  /**
   * Elimina todas las transacciones (ingresos y gastos)
   */
  const clearAll = useCallback(() => {
    setIncomes([]);
    setExpenses([]);
    showAlert('success', 'Todas las transacciones eliminadas');
  }, [setIncomes, setExpenses, showAlert]);

  /**
   * Agrega múltiples transacciones en lote (para importación masiva)
   */
  const addBulkTransactions = useCallback((transactions) => {
    const newIncomes = [];
    const newExpenses = [];
    let errorCount = 0;

    transactions.forEach((transaction) => {
      try {
        const { type, description, amount, date, category } = transaction;
        
        // Validación básica
        if (!description || !amount || amount <= 0) {
          errorCount++;
          return;
        }

        const baseTransaction = {
          id: crypto.randomUUID(),
          description: description.trim(),
          amount: parseFloat(amount),
          date: date || new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };

        if (type === 'income') {
          newIncomes.push({
            ...baseTransaction,
            type: TRANSACTION_TYPES.INCOME,
          });
        } else {
          newExpenses.push({
            ...baseTransaction,
            category: category || 'Otros',
            type: TRANSACTION_TYPES.EXPENSE,
          });
        }
      } catch (error) {
        console.error('Error procesando transacci��n:', error);
        errorCount++;
      }
    });

    // Actualizar estados en batch
    if (newIncomes.length > 0) {
      setIncomes(prev => [...prev, ...newIncomes]);
    }
    if (newExpenses.length > 0) {
      setExpenses(prev => [...prev, ...newExpenses]);
    }

    const total = newIncomes.length + newExpenses.length;
    if (total > 0) {
      showAlert('success', `${total} transacciones importadas exitosamente`);
    }
    
    return {
      imported: total,
      errors: errorCount,
      total: transactions.length,
    };
  }, [setIncomes, setExpenses, showAlert]);

  // Cálculos automáticos con precisión decimal (memoizados para performance)
  const totalIncome = useMemo(() => calculateTotal(incomes), [incomes]);

  const totalExpenses = useMemo(() => calculateTotal(expenses), [expenses]);

  const balance = useMemo(() => calculateBalance(totalIncome, totalExpenses), [totalIncome, totalExpenses]);

  /**
   * Análisis de gastos por categoría con precisión decimal
   */
  const categoryAnalysis = useMemo(() => 
    calculateCategoryAnalysis(expenses, totalExpenses), 
  [expenses, totalExpenses]);

  /**
   * Transacciones filtradas
   */
  const filteredTransactions = useMemo(() => {
    const allTransactions = [
      ...incomes.map(inc => ({ ...inc, type: 'income' })),
      ...expenses.map(exp => ({ ...exp, type: 'expense' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filter === 'income') return allTransactions.filter(t => t.type === 'income');
    if (filter === 'expense') return allTransactions.filter(t => t.type === 'expense');
    return allTransactions;
  }, [incomes, expenses, filter]);

  /**
   * Fuerza re-lectura de ingresos y gastos desde localStorage.
   * Usado tras operaciones externas (ej: migración a Supabase).
   */
  const refreshTransactions = useCallback(() => {
    refreshIncomes();
    refreshExpenses();
  }, [refreshIncomes, refreshExpenses]);

  return {
    // Estados
    incomes,
    expenses,
    filter,
    alert,
    
    // Funciones
    addIncome,
    addExpense,
    addBulkTransactions,
    updateIncome,
    updateExpense,
    removeIncome,
    removeExpense,
    clearAll,
    refreshTransactions,
    setFilter,
    showAlert,
    
    // Cálculos
    totalIncome,
    totalExpenses,
    balance,
    categoryAnalysis,
    filteredTransactions,
  };
};
