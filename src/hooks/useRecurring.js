import { useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

const RECURRING_KEY = 'budget_calculator_recurring';

/**
 * Calcula la próxima fecha de vencimiento relativa a fromDate según la frecuencia dada.
 * @param {'daily'|'weekly'|'monthly'|'yearly'} frequency
 * @param {string} fromDate - 'YYYY-MM-DD'
 * @returns {string} - 'YYYY-MM-DD'
 */
function getNextDue(frequency, fromDate) {
  const date = new Date(fromDate + 'T12:00:00');
  switch (frequency) {
    case 'daily':   date.setDate(date.getDate() + 1); break;
    case 'weekly':  date.setDate(date.getDate() + 7); break;
    case 'monthly': date.setMonth(date.getMonth() + 1); break;
    case 'yearly':  date.setFullYear(date.getFullYear() + 1); break;
    default: break;
  }
  return date.toISOString().split('T')[0];
}

/**
 * Hook que gestiona transacciones recurrentes.
 *
 * - Almacena plantillas en localStorage.
 * - Al montar, detecta cuáles están vencidas y las agrega automáticamente
 *   usando las funciones addIncome/addExpense del hook principal.
 *
 * @param {Function} addIncome  - Función addIncome de useTransactions
 * @param {Function} addExpense - Función addExpense de useTransactions
 */
export const useRecurring = (addIncome, addExpense) => {
  const [recurring, setRecurring] = useLocalStorage(RECURRING_KEY, []);
  const processed = useRef(false);

  // Procesa los vencidos una única vez al montar (o cuando las funciones estén disponibles)
  useEffect(() => {
    if (processed.current || !addIncome || !addExpense || recurring.length === 0) return;
    processed.current = true;

    const today = new Date().toISOString().split('T')[0];
    let needsUpdate = false;

    const updated = recurring.map(rule => {
      if (!rule.active || rule.nextDue > today) return rule;

      // Agrega todas las ocurrencias vencidas (por si pasaron varios ciclos)
      let nextDue = rule.nextDue;
      while (nextDue <= today) {
        if (rule.type === 'income') {
          addIncome(rule.description, rule.amount, nextDue);
        } else {
          addExpense(rule.description, rule.category, rule.amount, nextDue);
        }
        nextDue = getNextDue(rule.frequency, nextDue);
        needsUpdate = true;
      }

      return { ...rule, nextDue, lastProcessed: today };
    });

    if (needsUpdate) setRecurring(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addIncome, addExpense]);

  /** Agrega una nueva regla recurrente */
  const addRecurring = useCallback((rule) => {
    const startDate = rule.startDate || new Date().toISOString().split('T')[0];
    setRecurring(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        ...rule,
        active: true,
        nextDue: startDate,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, [setRecurring]);

  /** Activa o desactiva una regla */
  const toggleRecurring = useCallback((id) => {
    setRecurring(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
  }, [setRecurring]);

  /** Elimina una regla */
  const removeRecurring = useCallback((id) => {
    setRecurring(prev => prev.filter(r => r.id !== id));
  }, [setRecurring]);

  return { recurring, addRecurring, toggleRecurring, removeRecurring };
};
