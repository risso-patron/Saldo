import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

  // Indicador de sincronización con la nube
  const [syncStatus, setSyncStatus] = useState('idle');
  const syncTimerRef = useRef(null);
  const markSaved = useCallback(() => {
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    setSyncStatus('saved');
    syncTimerRef.current = setTimeout(() => setSyncStatus('idle'), 3000);
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
    markSaved();
    return true;
  }, [showAlert, syncInsert, markSaved]);

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
    markSaved();
    return true;
  }, [showAlert, syncInsert, markSaved]);

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
    markSaved();
    return true;
  }, [showAlert, syncUpdate, markSaved]);

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
    markSaved();
    return true;
  }, [showAlert, syncUpdate, markSaved]);

  const removeIncome = useCallback((id) => {
    setIncomes(prev => prev.filter(i => i.id !== id));
    showAlert('success', 'Ingreso eliminado');
    syncDelete(id);
    markSaved();
  }, [showAlert, syncDelete, markSaved]);

  const removeExpense = useCallback((id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showAlert('success', 'Gasto eliminado');
    syncDelete(id);
    markSaved();
  }, [showAlert, syncDelete, markSaved]);

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
      markSaved();

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

  // Combinar todas las transacciones para IA (memoizado — evita objetos nuevos en cada render)
  const allTransactions = useMemo(() => [
    ...incomes.map(income => ({ ...income, type: 'income' })),
    ...expenses.map(expense => ({ ...expense, type: 'expense' }))
  ], [incomes, expenses]);

  return {
    incomes,
    expenses,
    filter,
    alert,
    loading,
    syncStatus,
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
    allTransactions,
  };
};