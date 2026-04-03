import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { STORAGE_KEYS, TRANSACTION_TYPES, EXPENSE_CATEGORIES } from '../constants/categories';
import { validateTransaction } from '../utils/validators';
import { calculateTotal, calculateBalance, calculateCategoryAnalysis } from '../utils/calculations';
import { loadFromStorage, saveToStorage } from '../core/storageEngine';

// ─── Mappers Supabase ↔ Local ────────────────────────────────────────────────

const fromSupabase = (row) => ({
  id: row.id,
  description: row.description,
  amount: parseFloat(row.amount),
  type: row.type,
  category: row.category === 'income' ? undefined : row.category,
  date: row.date,
  createdAt: row.created_at,
});

const toSupabase = (tx, userId) => ({
  id: tx.id,
  user_id: userId,
  description: tx.description.trim(),
  amount: parseFloat(tx.amount),
  type: tx.type,
  category: tx.category || (tx.type === TRANSACTION_TYPES.INCOME ? 'income' : 'Otros'),
  date: tx.date,
});

/**
 * Custom hook para manejar toda la lógica de transacciones.
 * Fuente de verdad: Supabase (con localStorage como caché de respaldo).
 */
export const useTransactions = () => {
  const { user } = useAuth();

  // Inicializar desde caché local para evitar pantalla vacía en el primer render
  const [incomes, setIncomes] = useState(() => loadFromStorage(STORAGE_KEYS.INCOMES, []));
  const [expenses, setExpenses] = useState(() => loadFromStorage(STORAGE_KEYS.EXPENSES, []));
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('all');
  const [alert, setAlert] = useState(null);

  const showAlert = useCallback((type, message) => {
    if (!type) { setAlert(null); return; }
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 3000);
  }, []);

  // Actualiza localStorage cada vez que cambia el estado (caché de respaldo)
  useEffect(() => { saveToStorage(STORAGE_KEYS.INCOMES, incomes); }, [incomes]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.EXPENSES, expenses); }, [expenses]);

  // ── Carga inicial desde Supabase ──────────────────────────────────────────
  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;

        setIncomes(data.filter(r => r.type === 'income').map(fromSupabase));
        setExpenses(data.filter(r => r.type === 'expense').map(fromSupabase));
      } catch (err) {
        console.error('Error cargando transacciones desde Supabase:', err);
        // Mantiene el caché local como fallback (ya cargado en useState inicial)
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.id]);

  // ── Helpers internos ──────────────────────────────────────────────────────
  const syncInsert = useCallback(async (tx) => {
    if (!user) return;
    const { error } = await supabase.from('transactions').insert(toSupabase(tx, user.id));
    if (error) console.error('Supabase insert error:', error.message);
  }, [user]);

  const syncUpdate = useCallback(async (tx) => {
    if (!user) return;
    const { error } = await supabase
      .from('transactions')
      .update(toSupabase(tx, user.id))
      .eq('id', tx.id)
      .eq('user_id', user.id);
    if (error) console.error('Supabase update error:', error.message);
  }, [user]);

  const syncDelete = useCallback(async (id) => {
    if (!user) return;
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) console.error('Supabase delete error:', error.message);
  }, [user]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  const addIncome = useCallback((description, amount, date = null) => {
    const validation = validateTransaction({ description, amount, date });
    if (!validation.isValid) {
      showAlert('error', Object.values(validation.errors)[0]);
      return false;
    }

    const newIncome = {
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: parseFloat(amount),
      type: TRANSACTION_TYPES.INCOME,
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setIncomes(prev => [...prev, newIncome]);
    showAlert('success', 'Ingreso agregado exitosamente');
    syncInsert(newIncome);
    return true;
  }, [showAlert, syncInsert]);

  const addExpense = useCallback((description, category, amount, date = null) => {
    const validation = validateTransaction(
      { description, category, amount, date },
      true,
      EXPENSE_CATEGORIES
    );
    if (!validation.isValid) {
      showAlert('error', Object.values(validation.errors)[0]);
      return false;
    }

    const newExpense = {
      id: crypto.randomUUID(),
      description: description.trim(),
      category,
      amount: parseFloat(amount),
      type: TRANSACTION_TYPES.EXPENSE,
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setExpenses(prev => [...prev, newExpense]);
    showAlert('success', 'Gasto agregado exitosamente');
    syncInsert(newExpense);
    return true;
  }, [showAlert, syncInsert]);

  const updateIncome = useCallback((id, updates) => {
    const validation = validateTransaction(updates);
    if (!validation.isValid) {
      showAlert('error', Object.values(validation.errors)[0]);
      return false;
    }

    let updated;
    setIncomes(prev => prev.map(income => {
      if (income.id !== id) return income;
      updated = { ...income, ...updates, amount: parseFloat(updates.amount) };
      return updated;
    }));
    showAlert('success', 'Ingreso actualizado');
    if (updated) syncUpdate(updated);
    return true;
  }, [showAlert, syncUpdate]);

  const updateExpense = useCallback((id, updates) => {
    const validation = validateTransaction(updates, true, EXPENSE_CATEGORIES);
    if (!validation.isValid) {
      showAlert('error', Object.values(validation.errors)[0]);
      return false;
    }

    let updated;
    setExpenses(prev => prev.map(expense => {
      if (expense.id !== id) return expense;
      updated = { ...expense, ...updates, amount: parseFloat(updates.amount) };
      return updated;
    }));
    showAlert('success', 'Gasto actualizado');
    if (updated) syncUpdate(updated);
    return true;
  }, [showAlert, syncUpdate]);

  const removeIncome = useCallback((id) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
    showAlert('success', 'Ingreso eliminado');
    syncDelete(id);
  }, [showAlert, syncDelete]);

  const removeExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showAlert('success', 'Gasto eliminado');
    syncDelete(id);
  }, [showAlert, syncDelete]);

  const clearAll = useCallback(() => {
    setIncomes([]);
    setExpenses([]);
    showAlert('success', 'Todas las transacciones eliminadas');
    if (user) {
      supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
        .then(({ error }) => { if (error) console.error('Supabase clearAll error:', error.message); });
    }
  }, [user, showAlert]);

  const addBulkTransactions = useCallback((transactions) => {
    const newIncomes = [];
    const newExpenses = [];
    let errorCount = 0;

    transactions.forEach((transaction) => {
      try {
        const { type, description, amount, date, category } = transaction;
        if (!description || !amount || amount <= 0) { errorCount++; return; }

        const base = {
          id: crypto.randomUUID(),
          description: description.trim(),
          amount: parseFloat(amount),
          date: date || new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };

        if (type === 'income') {
          newIncomes.push({ ...base, type: TRANSACTION_TYPES.INCOME });
        } else {
          newExpenses.push({ ...base, category: category || 'Otros', type: TRANSACTION_TYPES.EXPENSE });
        }
      } catch (err) {
        console.error('Error procesando transacción:', err);
        errorCount++;
      }
    });

    if (newIncomes.length > 0) setIncomes(prev => [...prev, ...newIncomes]);
    if (newExpenses.length > 0) setExpenses(prev => [...prev, ...newExpenses]);

    const total = newIncomes.length + newExpenses.length;
    if (total > 0) {
      showAlert('success', `${total} transacciones importadas exitosamente`);

      // Sync batch a Supabase en background
      if (user) {
        const rows = [
          ...newIncomes.map(tx => toSupabase(tx, user.id)),
          ...newExpenses.map(tx => toSupabase(tx, user.id)),
        ];
        supabase
          .from('transactions')
          .upsert(rows, { onConflict: 'id', ignoreDuplicates: true })
          .then(({ error }) => { if (error) console.error('Supabase bulk insert error:', error.message); });
      }
    }

    return { imported: total, errors: errorCount, total: transactions.length };
  }, [user, showAlert]);

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (error) throw error;
      setIncomes(data.filter(r => r.type === 'income').map(fromSupabase));
      setExpenses(data.filter(r => r.type === 'expense').map(fromSupabase));
    } catch (err) {
      console.error('Error en refreshTransactions:', err);
    }
  }, [user?.id]);

  // ── Cálculos memoizados ───────────────────────────────────────────────────
  const totalIncome = useMemo(() => calculateTotal(incomes), [incomes]);
  const totalExpenses = useMemo(() => calculateTotal(expenses), [expenses]);
  const balance = useMemo(() => calculateBalance(totalIncome, totalExpenses), [totalIncome, totalExpenses]);
  const categoryAnalysis = useMemo(() => calculateCategoryAnalysis(expenses, totalExpenses), [expenses, totalExpenses]);

  const filteredTransactions = useMemo(() => {
    const all = [
      ...incomes.map(t => ({ ...t, type: 'income' })),
      ...expenses.map(t => ({ ...t, type: 'expense' })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (filter === 'income') return all.filter(t => t.type === 'income');
    if (filter === 'expense') return all.filter(t => t.type === 'expense');
    return all;
  }, [incomes, expenses, filter]);

  return {
    incomes,
    expenses,
    filter,
    alert,
    loading,
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
    totalIncome,
    totalExpenses,
    balance,
    categoryAnalysis,
    filteredTransactions,
  };
};


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
