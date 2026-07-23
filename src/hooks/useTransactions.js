import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { STORAGE_KEYS, TRANSACTION_TYPES, EXPENSE_CATEGORIES } from '../constants/categories';
import { validateTransaction } from '../utils/validators';
import { calculateTotal, calculateBalance, calculateCategoryAnalysis } from '../utils/calculations';
import { loadFromStorage, saveToStorage } from '../core/storageEngine';
import { useCurrency } from '../contexts/CurrencyContext';

// ─── Mappers Supabase ↔ Local ────────────────────────────────────────────────

const fromSupabase = (row) => ({
  id: row.id,
  description: row.description,
  amount: parseFloat(row.amount),
  currency: row.currency || 'USD',
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
  currency: tx.currency || 'USD',
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
  const { convertCurrency, selectedCurrency } = useCurrency(); // MULTI-MONEDA

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

  // Checkpoint IV-F.2 — estado de sincronización de LECTURA (carga inicial +
  // refreshTransactions), eje distinto de `syncStatus` (que es de ESCRITURA:
  // "¿guardé algo localmente hace poco?", vía markSaved, sin relación con si
  // Supabase realmente lo recibió). No se unifican — no comparten
  // consumidor ni ciclo de vida, mismo criterio ya aplicado a
  // pendingOperation (IV-C) y expandedId/swipedId (IV-E.3): cosas
  // conceptualmente distintas no se fuerzan a compartir una variable.
  //
  // `lastSyncedAt` SOLO se actualiza en un fetch exitoso — un fallo
  // posterior deja el valor anterior intacto (el banner de error sigue
  // mostrando la fecha del último sync que sí funcionó, spec: "Datos del 14
  // jul, 18:40" conviviendo con el aviso de error). `syncError` es lo único
  // que cambia ante un fallo.
  const [syncError, setSyncError] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  // Guardia de concurrencia: "Reintentar ahora" es ahora un botón real que
  // el usuario puede clickear varias veces seguidas — sin esto, dos fetches
  // superpuestos podrían resolverse fuera de orden y el más viejo pisar al
  // más nuevo.
  const isFetchingRef = useRef(false);

  // Actualiza localStorage cada vez que cambia el estado (caché de respaldo)
  useEffect(() => { saveToStorage(STORAGE_KEYS.INCOMES, incomes); }, [incomes]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.EXPENSES, expenses); }, [expenses]);

  // Checkpoint IV-F.2 — única función que trae transacciones desde Supabase.
  // Antes duplicada casi literalmente entre la carga inicial y
  // refreshTransactions (dos bloques idénticos: mismo query, mismo mapeo,
  // mismo try/catch) — ahora es la MISMA función en ambos casos, así que la
  // carga inicial simplemente es su primera invocación. NO toca `loading`
  // acá adentro: quien la llama decide si corresponde mostrar el skeleton
  // (la carga inicial sí; un reintento manual NO — el historial debe seguir
  // visible mientras reintenta, spec: "El diario sigue completo y
  // fechado").
  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setIncomes(data.filter(r => r.type === 'income').map(fromSupabase));
      setExpenses(data.filter(r => r.type === 'expense').map(fromSupabase));
      setSyncError(false);
      setLastSyncedAt(new Date().toISOString());
    } catch (err) {
      console.error('Error sincronizando transacciones desde Supabase:', err);
      // Mantiene el caché local como fallback (ya cargado en useState
      // inicial) y conserva el lastSyncedAt anterior — solo syncError cambia.
      setSyncError(true);
    } finally {
      isFetchingRef.current = false;
    }
  }, [user?.id]);

  // ── Carga inicial desde Supabase ──────────────────────────────────────────
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    refreshTransactions().finally(() => setLoading(false));
  }, [user?.id, refreshTransactions]);

  // ── Helpers internos ──────────────────────────────────────────────────────
  // RC-1.7/C1: las 5 funciones de sync devuelven { error } (nunca lanzan) para
  // que cada llamador decida cómo revertir su propio cambio optimista y
  // notificar — la reversión es distinta según qué se mutó, así que vive en
  // el call site, no acá.
  const syncInsert = useCallback(async (tx) => {
    if (!user) return { error: null };
    const { error } = await supabase.from('transactions').insert(toSupabase(tx, user.id));
    if (error) console.error('Supabase insert error:', error.message);
    return { error };
  }, [user]);

  const syncUpdate = useCallback(async (tx) => {
    if (!user) return { error: null };
    const { error } = await supabase
      .from('transactions')
      .update(toSupabase(tx, user.id))
      .eq('id', tx.id)
      .eq('user_id', user.id);
    if (error) console.error('Supabase update error:', error.message);
    return { error };
  }, [user]);

  const syncDelete = useCallback(async (id) => {
    if (!user) return { error: null };
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) console.error('Supabase delete error:', error.message);
    return { error };
  }, [user]);

  const syncDeleteMultiple = useCallback(async (ids) => {
    if (!user || !ids.length) return { error: null };
    const { error } = await supabase.from('transactions').delete().in('id', ids).eq('user_id', user.id);
    if (error) console.error('Supabase delete multiple error:', error.message);
    return { error };
  }, [user]);

  const syncUpdateMultiple = useCallback(async (updates) => {
    if (!user || !updates.length) return { error: null };
    const { error } = await supabase.from('transactions').upsert(updates.map(tx => toSupabase(tx, user.id)));
    if (error) console.error('Supabase update multiple error:', error.message);
    return { error };
  }, [user]);

  // ── Operación reversible (Checkpoint IV-C) ────────────────────────────────
  //
  // Única fuente de verdad de "cuál es la operación reversible viva ahora
  // mismo" — antes partida entre este hook (la lógica de deshacer un alta,
  // III-B) y App.jsx (el estado `undoToast` que decidía si había un Toast
  // visible). Esa partición es lo que iba a obligar a App.jsx a arbitrar
  // entre dos operaciones ("¿gana el alta o la baja?"), convirtiéndolo en un
  // orquestador de reglas de negocio — exactamente lo que la Constitución
  // prohíbe. Ahora vive acá entera.
  //
  // pendingOperation: { kind: 'create', movement } | { kind: 'delete', movement, index } | null
  //
  // Autoridad única (mismo principio que isAnyOverlayOpen, III-C.4, aplicado
  // acá a operaciones de dominio en vez de a overlays de UI): iniciar una
  // operación reversible nueva SIEMPRE finaliza la anterior según su propio
  // tipo antes de reemplazarla. Nunca hay dos operaciones "Deshacer" vivas
  // a la vez.
  const [pendingOperation, setPendingOperation] = useState(null);

  // Remueve del estado local sin sincronizar ni alertar — paso puramente
  // optimista, compartido por deleteMovement (baja diferida) y por la
  // compensación de deshacer una creación (antes `undoAddMovement`).
  const removeFromLocalState = useCallback((movement) => {
    if (movement.type === 'income') {
      setIncomes(prev => prev.filter(i => i.id !== movement.id));
    } else {
      setExpenses(prev => prev.filter(e => e.id !== movement.id));
    }
  }, []);

  // Efecto de "confirmar" una operación pendiente, según su tipo. Se llama
  // SIEMPRE en el cuerpo de una función normal (deleteMovement,
  // confirmPendingOperation, los "toast" de addIncome/addExpense) — NUNCA
  // dentro de un actualizador funcional de setState (`setX(prev => ...)`),
  // porque StrictMode invoca esos actualizadores dos veces a propósito para
  // detectar efectos secundarios escondidos ahí — duplicaría el syncDelete.
  const finalizePendingOperation = useCallback((pending) => {
    if (!pending) return;
    if (pending.kind === 'delete') {
      // RC-1.7/C1: si Supabase rechaza la baja, restaurar el movimiento en su
      // posición original (misma técnica que undoPendingOperation ya usa
      // para su propio revert intencional) — el índice se acota al tamaño
      // actual del array por si otras altas/bajas ocurrieron mientras tanto.
      syncDelete(pending.movement.id).then(({ error }) => {
        if (!error) return;
        const restore = (prev) => {
          const next = [...prev];
          next.splice(Math.min(pending.index, next.length), 0, pending.movement);
          return next;
        };
        if (pending.movement.type === 'income') setIncomes(restore);
        else setExpenses(restore);
        showAlert('error', 'No se pudo eliminar el movimiento. Se restauró.');
      });
      markSaved();
    }
    // kind 'create': no-op — el alta ya se sincronizó al crearse.
  }, [syncDelete, markSaved, showAlert]);

  const confirmPendingOperation = useCallback(() => {
    finalizePendingOperation(pendingOperation);
    setPendingOperation(null);
  }, [pendingOperation, finalizePendingOperation]);

  const undoPendingOperation = useCallback(() => {
    if (!pendingOperation) return;

    if (pendingOperation.kind === 'delete') {
      const { movement, index } = pendingOperation;
      const restore = (prev) => {
        const next = [...prev];
        next.splice(index, 0, movement);
        return next;
      };
      if (movement.type === 'income') setIncomes(restore);
      else setExpenses(restore);
    } else {
      // kind 'create': compensar — ya estaba sincronizado, hay que
      // removerlo de verdad y avisarle a Supabase (mismo efecto que el
      // `undoAddMovement` de III-B, ahora como rama de un único coordinador).
      const movement = pendingOperation.movement;
      removeFromLocalState(movement);
      // RC-1.7/C1: si Supabase rechaza el borrado compensatorio, el
      // movimiento sigue existiendo en el servidor — hay que devolverlo al
      // estado local (sin índice guardado para este caso, se reinserta al
      // final, igual que como se agregó originalmente).
      syncDelete(movement.id).then(({ error }) => {
        if (!error) return;
        if (movement.type === 'income') setIncomes(prev => [...prev, movement]);
        else setExpenses(prev => [...prev, movement]);
        showAlert('error', 'No se pudo deshacer correctamente: el movimiento sigue existiendo.');
      });
      markSaved();
    }
    setPendingOperation(null);
  }, [pendingOperation, removeFromLocalState, syncDelete, markSaved, showAlert]);

  // ── CRUD ──────────────────────────────────────────────────────────────────

  // `options.notification`: 'legacy' (default, preserva el showAlert interno
  // ya existente — lo sigue usando ImportManager vía handleAddIncome/
  // handleAddExpense) | 'toast' (suprime showAlert y en su lugar arranca una
  // operación reversible — Checkpoint IV-C, usado por NewMovementSheet vía
  // handleCreateIncome/handleCreateExpense).
  const addIncome = useCallback((description, amount, date = null, currency = 'USD', options = {}) => {
    const { notification = 'legacy' } = options;
    const validation = validateTransaction({ description, amount, date });
    if (!validation.isValid) {
      if (notification === 'legacy') showAlert('error', Object.values(validation.errors)[0]);
      return { success: false, movement: null };
    }

    const newIncome = {
      id: crypto.randomUUID(),
      description: description.trim(),
      amount: parseFloat(amount),
      currency,
      type: TRANSACTION_TYPES.INCOME,
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setIncomes(prev => [...prev, newIncome]);
    if (notification === 'legacy') showAlert('success', 'Ingreso agregado exitosamente');
    if (notification === 'toast') {
      finalizePendingOperation(pendingOperation);
      setPendingOperation({ kind: 'create', movement: newIncome });
    }
    // RC-1.7/C1: si Supabase rechaza el alta, revertir el agregado optimista
    // y, si el Toast de "Deshacer" todavía apunta a este mismo movimiento,
    // limpiarlo (no tiene sentido ofrecer deshacer algo que nunca se guardó).
    syncInsert(newIncome).then(({ error }) => {
      if (!error) return;
      setIncomes(prev => prev.filter(i => i.id !== newIncome.id));
      setPendingOperation(prev => (prev?.kind === 'create' && prev.movement.id === newIncome.id) ? null : prev);
      showAlert('error', 'No se pudo guardar el ingreso. Se deshizo el cambio.');
    });
    markSaved();
    return { success: true, movement: newIncome };
  }, [showAlert, syncInsert, markSaved, pendingOperation, finalizePendingOperation]);

  const addExpense = useCallback((description, category, amount, date = null, currency = 'USD', options = {}) => {
    const { notification = 'legacy' } = options;
    const validation = validateTransaction(
      { description, category, amount, date },
      true,
      EXPENSE_CATEGORIES
    );
    if (!validation.isValid) {
      if (notification === 'legacy') showAlert('error', Object.values(validation.errors)[0]);
      return { success: false, movement: null };
    }

    const newExpense = {
      id: crypto.randomUUID(),
      description: description.trim(),
      category,
      amount: parseFloat(amount),
      currency,
      type: TRANSACTION_TYPES.EXPENSE,
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setExpenses(prev => [...prev, newExpense]);
    if (notification === 'legacy') showAlert('success', 'Gasto agregado exitosamente');
    if (notification === 'toast') {
      finalizePendingOperation(pendingOperation);
      setPendingOperation({ kind: 'create', movement: newExpense });
    }
    // RC-1.7/C1: mismo revert que addIncome — ver comentario ahí.
    syncInsert(newExpense).then(({ error }) => {
      if (!error) return;
      setExpenses(prev => prev.filter(e => e.id !== newExpense.id));
      setPendingOperation(prev => (prev?.kind === 'create' && prev.movement.id === newExpense.id) ? null : prev);
      showAlert('error', 'No se pudo guardar el gasto. Se deshizo el cambio.');
    });
    markSaved();
    return { success: true, movement: newExpense };
  }, [showAlert, syncInsert, markSaved, pendingOperation, finalizePendingOperation]);

  // Checkpoint IV-C — ÚNICA API pública para eliminar un movimiento existente
  // (Historial). Sin confirmación (spec: docs/design/screens/Saldo
  // Historial.dc.html, "Eliminar: sin confirmación"). Baja diferida: sale
  // del estado local al instante (Dashboard e Historial lo pierden de vista
  // gratis, derivan del mismo array); Supabase NO se toca hasta que la
  // operación se confirme (confirmPendingOperation, cuando expira el Toast)
  // — mientras tanto puede deshacerse (undoPendingOperation) sin que el
  // servidor se haya enterado nunca.
  const deleteMovement = useCallback((movement) => {
    finalizePendingOperation(pendingOperation);
    const list = movement.type === 'income' ? incomes : expenses;
    const index = list.findIndex((m) => m.id === movement.id);
    removeFromLocalState(movement);
    setPendingOperation({ kind: 'delete', movement, index });
  }, [incomes, expenses, pendingOperation, finalizePendingOperation, removeFromLocalState]);

  const updateIncome = useCallback((id, updates) => {
    const validation = validateTransaction(updates);
    if (!validation.isValid) {
      showAlert('error', Object.values(validation.errors)[0]);
      return false;
    }

    // RC-1.7/C1 (ampliado): `previous`/`updated` se calculan ACÁ, a partir de
    // `incomes` (closure, por eso está en las deps de este useCallback — mismo
    // patrón que ya usa deleteMovement) — no dentro del callback funcional de
    // `setIncomes`. Ese patrón anterior era un bug real preexistente: React no
    // garantiza invocar el updater de forma síncrona, así que leer la variable
    // en la línea siguiente la encontraba siempre `undefined`, y `syncUpdate`
    // JAMÁS se llegaba a invocar (el update nunca se sincronizaba con Supabase).
    const previous = incomes.find(income => income.id === id);
    if (!previous) return false;
    const updated = { ...previous, ...updates, amount: parseFloat(updates.amount) };

    setIncomes(prev => prev.map(income => income.id === id ? updated : income));
    showAlert('success', 'Ingreso actualizado');
    syncUpdate(updated).then(({ error }) => {
      if (!error) return;
      setIncomes(prev => prev.map(income => income.id === id ? previous : income));
      showAlert('error', 'No se pudo actualizar el ingreso. Se restauró el valor anterior.');
    });
    markSaved();
    return true;
  }, [incomes, showAlert, syncUpdate, markSaved]);

  const updateExpense = useCallback((id, updates) => {
    const validation = validateTransaction(updates, true, EXPENSE_CATEGORIES);
    if (!validation.isValid) {
      showAlert('error', Object.values(validation.errors)[0]);
      return false;
    }

    // RC-1.7/C1 (ampliado) — ver comentario en updateIncome.
    const previous = expenses.find(expense => expense.id === id);
    if (!previous) return false;
    const updated = { ...previous, ...updates, amount: parseFloat(updates.amount) };

    setExpenses(prev => prev.map(expense => expense.id === id ? updated : expense));
    showAlert('success', 'Gasto actualizado');
    syncUpdate(updated).then(({ error }) => {
      if (!error) return;
      setExpenses(prev => prev.map(expense => expense.id === id ? previous : expense));
      showAlert('error', 'No se pudo actualizar el gasto. Se restauró el valor anterior.');
    });
    markSaved();
    return true;
  }, [expenses, showAlert, syncUpdate, markSaved]);

  // --- CRM BULK ACTIONS ---
  const removeMultiple = useCallback((ids) => {
    // RC-1.7/C1: se capturan los objetos completos eliminados (no solo los
    // ids) dentro del propio callback funcional, para poder revertir con
    // precisión si Supabase rechaza el borrado.
    let removedIncomes = [];
    let removedExpenses = [];
    setIncomes(prev => {
      removedIncomes = prev.filter(i => ids.includes(i.id));
      return prev.filter(i => !ids.includes(i.id));
    });
    setExpenses(prev => {
      removedExpenses = prev.filter(e => ids.includes(e.id));
      return prev.filter(e => !ids.includes(e.id));
    });
    syncDeleteMultiple(ids).then(({ error }) => {
      if (!error) return;
      if (removedIncomes.length) setIncomes(prev => [...prev, ...removedIncomes]);
      if (removedExpenses.length) setExpenses(prev => [...prev, ...removedExpenses]);
      showAlert('error', `No se pudieron eliminar ${ids.length} transacciones. Se restauraron.`);
    });
    markSaved();
    showAlert('success', `${ids.length} transacciones eliminadas.`);
  }, [syncDeleteMultiple, markSaved, showAlert]);

  const categorizeMultiple = useCallback((ids, newCategory) => {
    setIncomes(prev => prev.map(inc => {
      if (ids.includes(inc.id)) {
        console.warn('Attempted to categorize an income, ignoring.');
        return inc;
      }
      return inc;
    }));

    // RC-1.7/C1 (ampliado) — mismo fix de fondo que updateIncome/updateExpense:
    // `previousExpenses`/`updatedTxsForSync` se calculan ACÁ, a partir de
    // `expenses` (closure, por eso está en las deps), no dentro del callback
    // funcional de `setExpenses`. El patrón anterior (capturar via .push()
    // dentro del updater y leer el array en la línea siguiente) tenía el mismo
    // bug preexistente que updateIncome: el `if` nunca era verdadero, y
    // syncUpdateMultiple JAMÁS se llegaba a invocar.
    const previousExpenses = expenses.filter(exp => ids.includes(exp.id));
    const updatedTxsForSync = previousExpenses.map(exp => ({ ...exp, category: newCategory }));

    if (updatedTxsForSync.length > 0) {
      setExpenses(prev => prev.map(exp => {
        const found = updatedTxsForSync.find(u => u.id === exp.id);
        return found || exp;
      }));
      syncUpdateMultiple(updatedTxsForSync).then(({ error }) => {
        if (!error) return;
        setExpenses(prev => prev.map(exp => {
          const original = previousExpenses.find(p => p.id === exp.id);
          return original || exp;
        }));
        showAlert('error', `No se pudo recategorizar ${updatedTxsForSync.length} gastos. Se restauraron.`);
      });
      markSaved();
      showAlert('success', `${updatedTxsForSync.length} gastos movidos a ${newCategory}.`);
    }
  }, [expenses, syncUpdateMultiple, markSaved, showAlert]);

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
          currency: transaction.currency || 'USD',
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

  // ── Cálculos memoizados (Normalizados a la Moneda Principal) ─────────────
  
  // Normalizador interno: Mapea todas las transacciones a la moneda base seleccionada usando la tasa en tiempo real
  const normalizedIncomes = useMemo(() => incomes.map(t => ({ ...t, amount: convertCurrency(t.amount, t.currency || 'USD', selectedCurrency) })), [incomes, convertCurrency, selectedCurrency]);
  const normalizedExpenses = useMemo(() => expenses.map(t => ({ ...t, amount: convertCurrency(t.amount, t.currency || 'USD', selectedCurrency) })), [expenses, convertCurrency, selectedCurrency]);

  const totalIncome = useMemo(() => calculateTotal(normalizedIncomes), [normalizedIncomes]);
  const totalExpenses = useMemo(() => calculateTotal(normalizedExpenses), [normalizedExpenses]);
  const balance = useMemo(() => calculateBalance(totalIncome, totalExpenses), [totalIncome, totalExpenses]);
  const categoryAnalysis = useMemo(() => calculateCategoryAnalysis(normalizedExpenses, totalExpenses), [normalizedExpenses, totalExpenses]);

  // filteredTransactions NO DEBE NORMALIZARSE para no perder la visualización individual.
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
    syncError,
    lastSyncedAt,
    addIncome,
    addExpense,
    addBulkTransactions,
    updateIncome,
    updateExpense,
    pendingOperation,
    deleteMovement,
    confirmPendingOperation,
    undoPendingOperation,
    removeMultiple,
    categorizeMultiple,
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