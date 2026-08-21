import React, { useState, useEffect, useRef } from 'react';
import {
  MagnifyingGlass,
  Keyboard,
  Target,
  ChartPieSlice,
  Wrench,
  Database,
  Receipt,
  Wallet,
  ArrowUp,
  ArrowDown
} from '@phosphor-icons/react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CurrencySelector } from '../../features/currency/CurrencySelector';
import { useCurrency } from '../../contexts/CurrencyContext';
import { parseMovementText } from '../../utils/newMovementParser';
import { logDogfoodingEvent } from '../../utils/dogfoodingInstrumentation';

// Fase I-C (Integración de Diseño): el shell nuevo (DSSidebar/DSBottomNav)
// solo contempla 4 destinos de navegación (regla R-08 del diseño). Los tabs
// `planificacion` y `herramientas`, y controles sin superficie propia en el
// shell nuevo (moneda, "vaciar datos locales"), quedan accesibles acá como
// quick actions/utilidades — ver docs/design/integration-debt.md (filas c,
// f, g).
export const Omnibar = ({ isOpen, onClose, allTransactions = [], onNavigate, onClearAll, transactionCount = 0, onOpenNewMovementWithDraft }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  // WRITE-DISPLAY-CURRENCY-001: mismo patrón ya usado en TransactionItem.jsx.
  const { selectedCurrency } = useCurrency();

  // DOG-011 — instrumentación local: snapshot actualizado en cada render
  // (barato, sin efecto propio) para que el cleanup del effect de abajo
  // pueda leer el estado de búsqueda MÁS RECIENTE al momento del cierre,
  // sin depender de `searchTerm` en el array de dependencias del effect
  // (eso dispararía el cleanup en cada tecla, no una vez por cierre real).
  const searchSnapshotRef = useRef({ searchTerm: '', matched: 'none' });

  // Focus and clear input when opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
      // DOG-011 — apertura real (el effect solo re-corre cuando `isOpen`
      // cambia de valor, nunca en un render de recomposición ajeno).
      logDogfoodingEvent('omnibar_open');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      // DOG-011 — se ejecuta exactamente al cerrar (o desmontar). Usa el
      // snapshot más reciente, no un valor capturado en el momento en que
      // se abrió — así refleja la búsqueda real al momento del cierre, sin
      // registrar el texto en sí (solo si hubo o no búsqueda, y qué tipo de
      // resultado obtuvo).
      const { searchTerm: finalTerm, matched } = searchSnapshotRef.current;
      if (finalTerm.trim().length > 0) {
        logDogfoodingEvent('omnibar_search_used', { matched });
      }
    };
  }, [isOpen]);

  // Cerrar presionando escape o click fuera
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Atajos maestros a la nube — `planificacion` y `herramientas` no tienen
  // destino en el shell nuevo (solo 4 ítems fijos); quedan disponibles acá.
  //
  // Corrección de regresión (Dogfooding, 2026-08-20): la entrada de
  // `planificacion` (Tarjetas/Presupuestos/Recurrentes) se había perdido al
  // reapuntar "Mis Metas" a la vista dedicada `metas` durante
  // `metas-exposicion` (Fase 3, corrige H4) — ver
  // src/__tests__/Omnibar.test.jsx:4-6. Esa quick action era la única vía de
  // acceso a `planificacion`; su reasignación dejó el tab sin ningún punto
  // de entrada en la UI. Se restaura como entrada propia, sin tocar la
  // reasignación de "Mis Metas" (correcta para su propio alcance).
  const quickActions = [
    { id: 'movimientos', label: 'Ver Movimientos', icon: Receipt, query: 'movimientos' },
    { id: 'metas', label: 'Mis Metas', icon: Target, query: 'metas' },
    { id: 'planificacion', label: 'Planificación', icon: Wallet, query: 'planificacion, tarjetas, presupuestos, recurrentes, deuda, credito' },
    { id: 'graficos', label: 'Insights', icon: ChartPieSlice, query: 'insights, tendencias, graficos' },
    { id: 'herramientas', label: 'Herramientas', icon: Wrench, query: 'herramientas, exportar, importar' },
  ];

  // Motor de Búsqueda Fuzz (Básico)
  const isQuerying = searchTerm.trim().length > 0;

  // Checkpoint III-C.3 — parser determinista de texto → borrador de
  // movimiento. Solo se evalúa mientras hay texto; función pura, nunca tira.
  const parsedMovement = isQuerying ? parseMovementText(searchTerm) : null;

  const searchResults = isQuerying ? allTransactions.filter(tx =>
    tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (tx.category && tx.category.toLowerCase().includes(searchTerm.toLowerCase()))
  ).slice(0, 5) : []; // Max 5 matches

  const actionResults = isQuerying ? quickActions.filter(qa => 
    qa.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qa.query.includes(searchTerm.toLowerCase())
  ) : quickActions;

  // Lógica interactiva con fechas arriba abajo
  const totalItemsCount = searchResults.length + actionResults.length;

  // DOG-011 — actualiza el snapshot que lee el cleanup del effect de
  // apertura (arriba). Solo importa mientras `isQuerying` es true: si no hay
  // búsqueda activa, `finalTerm.trim().length > 0` en el cleanup ya lo
  // descarta, así que el valor de `matched` acá es irrelevante en ese caso.
  searchSnapshotRef.current = {
    searchTerm,
    matched: actionResults.length > 0 ? 'action' : (searchResults.length > 0 ? 'transaction' : 'none'),
  };

  // Prevent default arrow scrolling and handle it locally
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItemsCount - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : totalItemsCount - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Ejecutar la acción del indíce
      if (selectedIndex < actionResults.length) {
        logDogfoodingEvent('omnibar_navigate', { destination: actionResults[selectedIndex].id });
        onNavigate(actionResults[selectedIndex].id);
        onClose();
      } else {
        // Selecciono una transaccion
        logDogfoodingEvent('omnibar_navigate', { destination: 'movimientos' });
        onNavigate('movimientos');
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Main Omnibar Box */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in-down mx-4 sm:mx-auto border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]">
        
        {/* Search Input Area */}
        <div className="relative flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800">
          <MagnifyingGlass size={26} className="text-primary-500 shrink-0 mx-2" weight="bold" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none px-4 text-xl font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="Busca transacciones o navega..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            className="p-2 ml-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-white tracking-widest text-xs font-black transition-colors flex items-center gap-1"
            onClick={onClose}
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="overflow-y-auto px-4 pb-6 pt-2 custom-scrollbar">

          {/* Section: Nuevo Movimiento (Checkpoint III-C.3) — solo cuando el
              parser determinista interpretó el texto con éxito. Al margen
              del índice de navegación por flechas/Enter (mismo tratamiento
              que la sección "Utilidades" más abajo) — simplificación
              deliberada para no tocar la lógica de índices existente. */}
          {parsedMovement?.success && (
            <div className="mt-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-3 mb-2 block">
                Nuevo Movimiento
              </span>
              <ul className="space-y-1">
                <li
                  className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  onClick={() => { onOpenNewMovementWithDraft(parsedMovement.movementDraft); onClose(); }}
                >
                  <Receipt size={20} />
                  <span className="font-bold">
                    Nuevo movimiento: {parsedMovement.movementDraft.description} — {formatCurrency(parsedMovement.movementDraft.amount, selectedCurrency)}
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* Section: Atajos Nav */}
          {actionResults.length > 0 && (
            <div className="mt-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-3 mb-2 block">
                Atajos de Navegación
              </span>
              <ul className="space-y-1">
                {actionResults.map((action, i) => (
                  <li 
                    key={action.id}
                    className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-colors ${
                      i === selectedIndex 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                    onClick={() => { logDogfoodingEvent('omnibar_navigate', { destination: action.id }); onNavigate(action.id); onClose(); }}
                  >
                    <action.icon size={20} weight={i === selectedIndex ? "fill" : "regular"} />
                    <span className="font-bold">{action.label}</span>
                    {i === selectedIndex && (
                      <span className="ml-auto flex items-center gap-1 opacity-60 text-xs font-black">
                        ENTRAR <Keyboard size={14} />
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section: Transactions */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-3 mb-2 block">
                Transacciones Encontradas
              </span>
              <ul className="space-y-2">
                {searchResults.map((tx, idx) => {
                  const absoluteIndex = actionResults.length + idx;
                  const isSelected = absoluteIndex === selectedIndex;
                  const isIncome = tx.type === 'income';

                  return (
                     <li 
                      key={tx.id}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-colors border border-transparent ${
                        isSelected 
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white' 
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}
                      onClick={() => { logDogfoodingEvent('omnibar_navigate', { destination: 'movimientos' }); onNavigate('movimientos'); onClose(); }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isIncome ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                      }`}>
                        {isIncome ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-sm">{tx.description}</p>
                        <p className="text-xs opacity-70 uppercase tracking-widest font-semibold mt-0.5">
                          {formatDate(tx.date)} {tx.category && `• ${tx.category}`}
                        </p>
                      </div>

                      <div className={`font-black text-sm text-right ${isIncome ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount, tx.currency || 'USD')}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Empty State — se suprime cuando hay un match de "Nuevo
              Movimiento" (Checkpoint III-C.3): decisión no especificada en
              detalle por el PO, tomada para evitar mostrar "Sin resultados"
              al mismo tiempo que un resultado válido y accionable. */}
          {isQuerying && !parsedMovement?.success && searchResults.length === 0 && actionResults.length === 0 && (
            <div className="text-center py-12 px-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlass size={32} className="text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Sin resultados</h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                No logramos encontrar nada con "{searchTerm}" en tu base de datos local.
              </p>
            </div>
          )}

          {/* Utilidades — moneda y borrado de datos locales no tienen
              superficie propia en el shell nuevo (Fase I-C); quedan acá como
              resolución provisional (deuda registrada). No participan del
              índice de navegación por teclado (flechas/Enter). UX-001: se
              ocultan mientras hay una búsqueda activa (isQuerying) — al
              escribir, el contexto de uso pasa de "navegar" a "buscar", y
              estos controles no son resultados de búsqueda. Vuelven a
              aparecer al vaciar el input, exactamente igual que al abrir el
              Omnibar por primera vez. */}
          {!isQuerying && (
            <div className="mt-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-3 mb-2 block">
                Utilidades
              </span>
              <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800">
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Moneda</span>
                <CurrencySelector />
              </div>
              {onClearAll && transactionCount > 0 && (
                <button
                  onClick={() => { onClearAll(); onClose(); }}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer transition-colors text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                >
                  <Database size={20} weight="fill" />
                  <span className="font-bold">Vaciar datos locales</span>
                </button>
              )}
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Keyboard size={16} /> Navegar: Flechas</span>
            <span className="flex items-center gap-1"><Keyboard size={16} /> Seleccionar: Enter</span>
          </div>
          <span>Saldo · Finanzas Personales</span>
        </div>

      </div>
    </div>
  );
};
