import { supabase } from '../lib/supabase'
import { STORAGE_KEYS, TRANSACTION_TYPES } from '../constants/categories'

const LEGACY_STORAGE_KEY = 'budget-calculator-transactions'
const MIGRATION_STATUS_KEY = 'budget-calculator-migrated'
const BACKUP_PREFIX = 'budget-calculator-backup'
const COMPLETED_VALUES = new Set(['true', 'skip', 'completed'])

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const readArrayFromStorage = (key) => {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn(`Error al leer localStorage key "${key}":`, error)
    return []
  }
}

const normalizeTransaction = (tx, fallbackType) => ({
  ...tx,
  type: tx.type || fallbackType,
})

const toISODate = (value) => {
  const candidate = value ? new Date(value) : null
  if (candidate && !Number.isNaN(candidate.getTime())) {
    return candidate.toISOString().split('T')[0]
  }
  return new Date().toISOString().split('T')[0]
}

/**
 * Obtiene todas las transacciones almacenadas localmente (ingresos, gastos y legacy)
 */
export function getLocalTransactionsSnapshot() {
  if (!canUseStorage()) return []

  const incomes = readArrayFromStorage(STORAGE_KEYS.INCOMES).map(tx => ({
    ...normalizeTransaction(tx, TRANSACTION_TYPES.INCOME),
    // Los ingresos no tienen categoría; se usa 'income' para cumplir con NOT NULL de Supabase
    category: tx.category || 'income',
  }))

  const expenses = readArrayFromStorage(STORAGE_KEYS.EXPENSES).map(tx =>
    normalizeTransaction(tx, TRANSACTION_TYPES.EXPENSE)
  )

  const legacy = readArrayFromStorage(LEGACY_STORAGE_KEY).map(tx =>
    normalizeTransaction(
      tx,
      tx.category ? TRANSACTION_TYPES.EXPENSE : TRANSACTION_TYPES.INCOME
    )
  )

  const deduped = new Map()
  ;[...legacy, ...incomes, ...expenses].forEach(tx => {
    const key = tx.id ?? `${tx.type}-${tx.description}-${tx.amount}-${tx.date}`
    if (!deduped.has(key)) {
      deduped.set(key, tx)
    }
  })

  return Array.from(deduped.values())
}

/**
 * Migra datos de localStorage a Supabase para un usuario autenticado
 * @returns {Promise<{success: boolean, migratedCount: number, error: any}>}
 */
export async function migrateFromLocalStorage() {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        migratedCount: 0,
        error: 'Usuario no autenticado'
      }
    }

    const transactions = getLocalTransactionsSnapshot()

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return {
        success: true,
        migratedCount: 0,
        error: null
      }
    }

    const validTransactions = transactions
      .map(tx => ({
        ...tx,
        amount: parseFloat(tx.amount),
        description: (tx.description || '').trim(),
      }))
      .filter(tx => tx.description && !Number.isNaN(tx.amount))

    if (validTransactions.length === 0) {
      return {
        success: true,
        migratedCount: 0,
        error: null
      }
    }

    const transactionsToInsert = validTransactions.map(tx => {
      // Si el ID es un número (timestamp antiguo), generar un UUID nuevo
      let id = tx.id;
      if (typeof id === 'number' || !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        id = crypto.randomUUID();
      }
      
      const txType = tx.type || (tx.category ? TRANSACTION_TYPES.EXPENSE : TRANSACTION_TYPES.INCOME);
      return {
        id: id,
        user_id: user.id,
        description: tx.description,
        amount: tx.amount,
        // La columna 'category' es NOT NULL en Supabase.
        // Los ingresos no tienen categoría → usar el tipo como valor por defecto.
        category: tx.category || (txType === TRANSACTION_TYPES.INCOME ? 'income' : 'other'),
        type: txType,
        date: toISODate(tx.date),
      };
    });

    const { error } = await supabase
      .from('transactions')
      .upsert(transactionsToInsert, {
        onConflict: 'id',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error al migrar transacciones:', error)
      return {
        success: false,
        migratedCount: 0,
        error: error.message
      }
    }

    const backupKey = `${BACKUP_PREFIX}-${Date.now()}`
    window.localStorage.setItem(backupKey, JSON.stringify(transactionsToInsert))

    window.localStorage.setItem(MIGRATION_STATUS_KEY, 'true')

    return {
      success: true,
      migratedCount: transactionsToInsert.length,
      error: null
    }
  } catch (error) {
    console.error('Error durante la migraci��n:', error)
    return {
      success: false,
      migratedCount: 0,
      error: error.message
    }
  }
}

/**
 * Verifica si ya se realiz�� (o se omiti��) la migraci��n
 */
export function hasMigrated() {
  if (!canUseStorage()) return true
  const status = window.localStorage.getItem(MIGRATION_STATUS_KEY)
  return status ? COMPLETED_VALUES.has(status) : false
}

/**
 * Verifica si hay datos en localStorage pendientes de migrar
 */
export function hasPendingMigration() {
  if (!canUseStorage()) return false
  return !hasMigrated() && getLocalTransactionsSnapshot().length > 0
}

/**
 * Obtiene el conteo de transacciones pendientes de migrar
 */
export function getPendingMigrationCount() {
  if (!canUseStorage() || hasMigrated()) return 0
  return getLocalTransactionsSnapshot().length
}

/**
 * Resetea el estado de migraci��n (ǧtil para testing)
 */
export function resetMigrationStatus() {
  if (!canUseStorage()) return
  window.localStorage.removeItem(MIGRATION_STATUS_KEY)
}
