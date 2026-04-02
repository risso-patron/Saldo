import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UsersThree, Plus, SignOut, Copy, Check, ArrowRight,
  Spinner, Warning, CheckCircle,
} from '@phosphor-icons/react';
import { Card } from '../../components/Shared/Card';
import { Button } from '../../components/Shared/Button';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { NumericFormat } from 'react-number-format';
import { sanitizeText, sanitizeCategory } from '../../utils/sanitize';

/** Formatea fecha YYYY-MM-DD a string legible */
function fmtDate(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es-PA', {
    day: 'numeric', month: 'short',
  });
}

const EMPTY_TX = {
  type: 'expense',
  description: '',
  category: EXPENSE_CATEGORIES[0]?.value ?? 'other',
  amount: '',
  date: new Date().toISOString().split('T')[0],
};

/**
 * SharedSpaceManager – UI para crear/unirse a un presupuesto compartido y
 * ver transacciones en tiempo real con otros usuarios (ej: parejas, familias).
 */
export const SharedSpaceManager = ({
  space,
  members,
  sharedTransactions,
  loading,
  actionLoading,
  error,
  onCreateSpace,
  onJoinSpace,
  onLeaveSpace,
  onAddTransaction,
  onRemoveTransaction,
  currentUser,
}) => {
  const [view, setView]   = useState('create'); // 'create' | 'join'
  const [spaceName, setSpaceName] = useState('');
  const [inviteInput, setInviteInput] = useState('');
  const [showTxForm, setShowTxForm] = useState(false);
  const [txForm, setTxForm] = useState(EMPTY_TX);
  const [txErrors, setTxErrors] = useState({});
  const [copied, setCopied] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCreate = async (ev) => {
    ev.preventDefault();
    if (!spaceName.trim()) { setFormError('Ingresa un nombre para el espacio'); return; }
    setFormError('');
    const result = await onCreateSpace(spaceName);
    if (result?.error) setFormError(result.error);
  };

  const handleJoin = async (ev) => {
    ev.preventDefault();
    if (!inviteInput.trim()) { setFormError('Ingresa el código de invitación'); return; }
    setFormError('');
    const result = await onJoinSpace(inviteInput);
    if (result?.error) setFormError(result.error);
  };

  const handleCopyCode = () => {
    if (!space?.invite_code) return;
    navigator.clipboard.writeText(space.invite_code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateTx = () => {
    const e = {};
    if (!txForm.description.trim()) e.description = 'Requerido';
    if (!txForm.amount || Number(txForm.amount) <= 0) e.amount = 'Monto inválido';
    return e;
  };

  const handleAddTx = async (ev) => {
    ev.preventDefault();
    const e = validateTx();
    if (Object.keys(e).length) { setTxErrors(e); return; }

    const result = await onAddTransaction({
      description: sanitizeText(txForm.description),
      amount: parseFloat(txForm.amount),
      category: txForm.type === 'expense' ? sanitizeCategory(txForm.category) : 'income',
      type: txForm.type,
      date: txForm.date,
    });

    if (result?.error) {
      setTxErrors({ general: result.error });
    } else {
      setTxForm(EMPTY_TX);
      setTxErrors({});
      setShowTxForm(false);
    }
  };

  // ── Sin espacio: mostrar pantalla de creación/unión ───────────────────────
  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
          <Spinner size={20} className="animate-spin" />
          <span className="text-sm">Cargando espacio compartido…</span>
        </div>
      </Card>
    );
  }

  if (!space) {
    return (
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <UsersThree size={20} weight="light" className="text-sky-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800 dark:text-white">
              Presupuesto Compartido
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Sincronización en tiempo real · ideal para parejas o familias
            </p>
          </div>
        </div>

        {/* Pestañas crear / unirse */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-4">
          {[
            { key: 'create', label: 'Crear espacio' },
            { key: 'join',   label: 'Unirse con código' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setView(tab.key); setFormError(''); }}
              className={`flex-1 py-1.5 text-sm rounded-lg font-medium transition-all
                ${view === tab.key
                  ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {view === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              placeholder="Nombre del espacio (ej: Familia García)"
              value={spaceName}
              onChange={e => setSpaceName(e.target.value)}
              maxLength={60}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600
                rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                dark:focus:ring-primary-900 dark:bg-gray-700 dark:text-white transition-all"
            />
            {formError && <p className="text-red-500 text-xs">⚠️ {formError}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={actionLoading}>
              {actionLoading ? <><Spinner size={14} className="animate-spin inline mr-1.5" />Creando…</> : <>Crear espacio <ArrowRight size={15} className="inline ml-1" /></>}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              placeholder="Código de 8 caracteres (ej: AB3XY7KQ)"
              value={inviteInput}
              onChange={e => setInviteInput(e.target.value.toUpperCase())}
              maxLength={8}
              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600
                rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                dark:focus:ring-primary-900 dark:bg-gray-700 dark:text-white uppercase tracking-widest
                font-mono transition-all"
            />
            {formError && <p className="text-red-500 text-xs">⚠️ {formError}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={actionLoading}>
              {actionLoading ? <><Spinner size={14} className="animate-spin inline mr-1.5" />Uniéndose…</> : 'Unirse al espacio'}
            </Button>
          </form>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
            <Warning size={14} /> {error}
          </div>
        )}
      </Card>
    );
  }

  // ── Con espacio: panel de presupuesto compartido ─────────────────────────
  const totalIncome  = sharedTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = sharedTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const sharedBalance = totalIncome - totalExpense;

  return (
    <Card>
      {/* Header del espacio */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <UsersThree size={20} weight="light" className="text-sky-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-gray-800 dark:text-white truncate">
              {space.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {members.length} miembro{members.length !== 1 ? 's' : ''}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden="true" />
              <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                En vivo
              </span>
            </div>
          </div>
        </div>

        {/* Código de invitación */}
        <button
          onClick={handleCopyCode}
          title="Copiar código de invitación"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-semibold
            bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300
            rounded-lg border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-100
            dark:hover:bg-indigo-900/50 transition-all shrink-0"
          aria-label="Copiar código de invitación"
        >
          {copied ? <Check size={13} weight="bold" /> : <Copy size={13} />}
          {space.invite_code}
        </button>
      </div>

      {/* Balance compartido */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Ingresos', value: totalIncome,  color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Gastos',   value: totalExpense, color: 'text-rose-600 dark:text-rose-400' },
          { label: 'Balance',  value: sharedBalance, color: sharedBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400' },
        ].map(item => (
          <div key={item.label} className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className={`text-sm font-bold ${item.color}`}>
              ${Math.abs(item.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* Botón agregar transacción */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Transacciones del grupo
        </h4>
        <Button
          variant="secondary"
          onClick={() => setShowTxForm(prev => !prev)}
          className="flex items-center gap-1.5 text-sm"
        >
          <Plus size={14} weight="bold" />
          Agregar
        </Button>
      </div>

      {/* Formulario de transacción compartida */}
      <AnimatePresence>
        {showTxForm && (
          <motion.form
            key="tx-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleAddTx}
            className="mb-3 overflow-hidden"
            noValidate
          >
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 space-y-2">
              <div className="flex gap-2">
                {['income', 'expense'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTxForm(f => ({ ...f, type: t }))}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
                      ${txForm.type === t
                        ? t === 'income' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                      }`}
                  >
                    {t === 'income' ? '💰 Ingreso' : '💸 Gasto'}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Descripción"
                value={txForm.description}
                onChange={e => setTxForm(f => ({ ...f, description: e.target.value }))}
                maxLength={100}
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600
                  rounded-lg outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100
                  dark:bg-gray-700 dark:text-white transition-all"
              />
              {txErrors.description && <p className="text-red-500 text-xs">⚠️ {txErrors.description}</p>}

              {txForm.type === 'expense' && (
                <select
                  value={txForm.category}
                  onChange={e => setTxForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600
                    rounded-lg outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
                  ))}
                </select>
              )}

              <div className="grid grid-cols-2 gap-2">
                <NumericFormat
                  value={txForm.amount}
                  onValueChange={vals => setTxForm(f => ({ ...f, amount: vals.floatValue ?? '' }))}
                  thousandSeparator="," decimalSeparator="." prefix="$"
                  decimalScale={2} allowNegative={false} placeholder="$0.00"
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600
                    rounded-lg outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="date"
                  value={txForm.date}
                  onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600
                    rounded-lg outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white
                    dark:color-scheme-dark"
                />
              </div>
              {txErrors.amount && <p className="text-red-500 text-xs">⚠️ {txErrors.amount}</p>}
              {txErrors.general && <p className="text-red-500 text-xs">⚠️ {txErrors.general}</p>}

              <div className="flex gap-2 pt-1">
                <Button type="submit" variant="primary" className="flex-1 text-sm" disabled={actionLoading}>
                  {actionLoading ? 'Guardando…' : 'Agregar al grupo'}
                </Button>
                <Button type="button" variant="secondary" className="text-sm"
                  onClick={() => { setShowTxForm(false); setTxErrors({}); setTxForm(EMPTY_TX); }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Lista de transacciones compartidas */}
      {sharedTransactions.length === 0 ? (
        <div className="text-center py-6 text-gray-400 dark:text-gray-500">
          <CheckCircle size={32} className="mx-auto mb-1.5 opacity-40" />
          <p className="text-sm">Sin transacciones grupales aún</p>
          <p className="text-xs mt-0.5">Los nuevos registros aparecen en tiempo real</p>
        </div>
      ) : (
        <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {sharedTransactions.map(tx => (
            <li
              key={tx.id}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 group"
            >
              <span className="text-lg shrink-0" aria-hidden="true">
                {tx.type === 'income' ? '💰' :
                  EXPENSE_CATEGORIES.find(c => c.value === tx.category)?.icon ?? '💸'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{tx.description}</p>
                <p className="text-xs text-gray-400">{fmtDate(tx.date?.split('T')[0])}</p>
              </div>
              <span className={`text-sm font-bold shrink-0
                ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              {tx.user_id === currentUser?.id && (
                <button
                  onClick={() => onRemoveTransaction(tx.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all text-xs px-1"
                  aria-label={`Eliminar ${tx.description}`}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Salir del espacio */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {space.role === 'owner' ? 'Eres el administrador' : 'Eres miembro'}
        </p>
        <button
          onClick={onLeaveSpace}
          disabled={actionLoading}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          <SignOut size={13} />
          {space.role === 'owner' ? 'Eliminar espacio' : 'Abandonar espacio'}
        </button>
      </div>
    </Card>
  );
};
