import { useState, useEffect, useMemo, useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X, MagnifyingGlass } from '@phosphor-icons/react';
import { calculateTotal } from '../../utils/calculations';
import { groupMovementsByDay } from '../../utils/movementGrouping';
import { formatCurrency } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { FilaMovimiento } from '../ds/FilaMovimiento';
import { ExpansionDetalle } from './ExpansionDetalle';
import { FilaDeslizable } from './FilaDeslizable';
import { HistorialSkeleton } from './HistorialSkeleton';
import { EstadoVacio } from './EstadoVacio';
import { EstadoSinResultados } from './EstadoSinResultados';
import { BannerErrorSincronizacion } from './BannerErrorSincronizacion';
import { Sheet } from '../ds/Sheet';
import { rowInteractionReducer, ROW_INTERACTION_INITIAL } from './rowInteractionReducer';
import { useIsDesktop, useIsMobileRow } from '../../hooks/useMediaQuery';
import { cn } from '../ds/cn';

// Checkpoint IV-A (Saldo Design Constitution v1.2) — Historial de movimientos.
// Fuente: docs/design/screens/Saldo Historial.dc.html.
//
// Reemplaza a ExpenseList.jsx + BudgetForm.jsx + LegacyPeriodFilters en la
// pestaña "Movimientos" de App.jsx. Capa de "consulta/agrupación" del dominio
// Movimiento — construye sobre las utilidades de src/utils/ en vez de
// reimplementar sumas o lógica de fecha relativa, y renderiza cada fila con
// FilaMovimiento (ds/) en vez de un markup artesanal (el problema que tenía
// ExpenseList.jsx).
//
// Alcance CERRADO (negociado con el PO, ver checkpoint): SIN selección
// múltiple/acciones en lote, SIN sugerencia heurística de categoría, SIN
// nota IA.
//
// Checkpoint IV-F.1 — estados de carga/vacío/sin-resultados. `hasMovements`
// es un booleano AGREGADO que App.jsx computa desde el dominio sin filtrar
// (allTransactions) — Historial NUNCA inspecciona incomes/expenses.length
// para decidir "¿hay algo en absoluto?": esos props ya vienen recortados
// por mes desde App.jsx, así que un usuario con movimientos en OTROS meses
// vería incorrectamente el estado vacío si Historial derivara la pregunta
// de sus propios props. "Sin resultados" (groups.length===0 con
// hasMovements=true) es un caso distinto — ahí sí hay datos, el filtro
// actual no encuentra nada, y los filtros permanecen visibles (al revés
// que "vacío real", que los oculta por completo).
//
// Checkpoint IV-F.2 — banner de error de sincronización. A diferencia de
// los estados de IV-F.1 (mutuamente excluyentes entre sí), este banner es
// ADITIVO: se muestra dentro del contenido normal cuando `syncError` es
// true, sin reemplazar nada. `useTransactions.js` sigue siendo la única
// autoridad de `syncError`/`lastSyncedAt` — Historial solo los recibe y los
// presenta, nunca los calcula. Alcance: cubre fallos de LECTURA (carga
// inicial y refreshTransactions) — fallos de escritura optimista
// (insert/update/delete) quedan fuera, documentados como deuda técnica
// independiente (ver diagnóstico del checkpoint).
//
// Checkpoint IV-E.3 — swipe-to-reveal (mobile, `useIsMobileRow`, el mismo
// corte `md` que ya usa el layout apilado de FilaMovimiento en IV-E.1;
// tablet/desktop no se ven afectados). `expandedId` (IV-B/IV-E.2) y
// `swipedId` (IV-E.3, revelar Editar/Eliminar deslizando la fila) son
// proyecciones de lectura de un ÚNICO useReducer (rowInteractionReducer.js)
// — no dos useState independientes con exclusión mutua mantenida a mano.
// El reducer es puro y agnóstico de gestos: Historial.jsx decide QUÉ
// transición pedir (ver handleRowClick/handleReveal/handleCloseReveal),
// el reducer solo la ejecuta. FilaDeslizable.jsx (el wrapper del gesto) no
// conoce otras filas — la coordinación entre filas vive acá.
//
// Checkpoint IV-E.2 — HojaDetalle: en desktop real (`ds-desktop`, 1200px,
// el mismo corte que ya usa DSSidebar.jsx) el detalle sigue expandiéndose
// en línea (ExpansionDetalle, sin cambios desde IV-B); en todo lo demás
// (tablet/mobile) el MISMO ExpansionDetalle se renderiza dentro de un
// <Sheet desktopBreakpoint="ds-desktop">. `expandedId` sigue siendo la
// única fuente de verdad — no hay un segundo estado que distinga "en línea"
// de "hoja", solo cambia cómo se renderiza. Sheet.jsx dispara sus propios
// efectos secundarios (trampa de foco, scroll-lock) en cuanto `isOpen` es
// true, sin importar si el nodo está oculto por CSS — por eso esta decisión
// se resuelve en JS (useIsDesktop, primer hook de breakpoint vivo del
// proyecto) y no con los pares `hidden`/`md:flex` que usa el resto de la
// navegación responsiva de la app.
//
// Checkpoint IV-D — navegación completa por teclado (↑↓/Enter/E/⌫/Escape),
// roving tabindex: Historial es la ÚNICA autoridad de cuál fila es
// alcanzable por Tab.
//
// LIMITACIÓN CONOCIDA DE IV-D (decisión consciente de arquitectura, no un
// descuido ni un workaround pendiente): si durante la edición un movimiento
// cambia de fecha y, por lo tanto, migra a otro GrupoDía, React desmonta el
// nodo original antes de que Sheet.jsx pueda restaurar el foco por
// referencia. Resolver correctamente este caso requiere redefinir el
// contrato de restauración de foco de Sheet.jsx. Esa decisión quedó
// explícitamente fuera del alcance de IV-D para preservar la autoridad
// actual del componente y evitar introducir una segunda autoridad de foco.
//
// Filtro de mes: reusa selectedYear/selectedMonth/setSelectedYear/
// setSelectedMonth de useFilters() (que a su vez delega a PeriodContext,
// fuente única del período global) — este componente NO inventa un estado de
// período paralelo. El único punto de escritura es la "✕" del chip, que
// limpia el filtro; elegir un mes específico sigue siendo responsabilidad de
// la UI que ya lo hace (LegacyPeriodFilters en la pestaña Gráficos) hasta que
// Historial reciba su propio selector de período en un checkpoint futuro.

const TYPE_OPTIONS = [
  { value: 'all', label: 'Todo' },
  { value: 'income', label: 'Ingreso' },
  { value: 'expense', label: 'Gasto' },
];

export function Historial({
  incomes = [],
  expenses = [],
  selectedYear = null,
  selectedMonth = null,
  setSelectedYear,
  setSelectedMonth,
  initialCategoryFilter = null,
  onInitialFilterConsumed,
  onEditMovement,
  onDeleteMovement,
  loading = false,
  hasMovements = true,
  onRegisterExpense,
  onNavigateToImport,
  syncError = false,
  lastSyncedAt = null,
  onRetrySync,
}) {
  const { i18n } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  // Checkpoint IV-B — expansión en línea (definitiva, no provisoria): clic
  // en una fila la expande mostrando detalle + Editar. Checkpoint IV-E.3 —
  // `expandedId` y `swipedId` (revelar Editar/Eliminar por swipe, mobile)
  // son proyecciones de UN ÚNICO reducer (rowInteractionReducer.js): nunca
  // pueden ser ambos no-nulos, por construcción (cada transición del
  // reducer define el par completo). Acordeón de uno para las DOS
  // interacciones combinadas, no una por separado.
  const [rowInteraction, dispatchRowInteraction] = useReducer(
    rowInteractionReducer,
    ROW_INTERACTION_INITIAL
  );
  const { expandedId, swipedId } = rowInteraction;

  // La intención ("¿abrir o cerrar?") se resuelve ACÁ, mirando el estado
  // actual — el reducer nunca inspecciona el estado previo, solo ejecuta.
  const handleRowClick = (id) => {
    dispatchRowInteraction(
      expandedId === id ? { type: 'CLOSE_ACTIVE_ROW' } : { type: 'OPEN_EXPANSION', id }
    );
  };
  // Checkpoint IV-E.3 — únicos dos puntos de entrada que FilaDeslizable
  // conoce (onReveal/onCloseReveal). La exclusión con `expandedId` es
  // gratis por la forma del reducer (REVEAL_ACTIONS ya limpia expandedId);
  // `handleCloseReveal` es id-aware para no pisar a otra fila que haya
  // pasado a ser la activa entretanto (coordinación entre filas, exclusiva
  // de Historial — FilaDeslizable no la conoce).
  const handleReveal = (id) => {
    dispatchRowInteraction({ type: 'REVEAL_ACTIONS', id });
  };
  const handleCloseReveal = (id) => {
    if (swipedId === id) {
      dispatchRowInteraction({ type: 'CLOSE_ACTIVE_ROW' });
    }
  };

  // Checkpoint IV-E.2 — decide únicamente CÓMO se renderiza expandedId
  // (en línea vs. HojaDetalle), nunca SI hay algo expandido.
  const isDesktop = useIsDesktop();
  // Checkpoint IV-E.3 — decide si el gesto de swipe está activo (mobile).
  const isMobileRow = useIsMobileRow();

  // Checkpoint IV-D — Historial es la ÚNICA autoridad del roving tabindex de
  // sus filas (docs/design/screens/Saldo Historial.dc.html: "↑↓ recorren
  // filas, Enter expande, E edita, ⌫ elimina, foco visible siempre"). Una
  // sola fila del listado es alcanzable por Tab a la vez; ↑↓ mueve el foco
  // real del DOM entre filas.
  //
  // `explicitActiveId`: la última fila que el usuario eligió de verdad (por
  // teclado o mouse, vía onFocus de cada fila — único punto de escritura).
  // `effectiveActiveId` (derivado, sin efecto): si esa fila sigue visible se
  // usa tal cual; si desapareció por un filtro (nadie tenía foco real ahí —
  // el usuario está en el buscador) cae a la primera fila visible, SIN
  // robarle el foco a nada — nunca se llama .focus() acá, es solo el valor
  // que decide qué fila tiene tabIndex 0 la próxima vez que el usuario entre
  // a la lista.
  const [explicitActiveId, setExplicitActiveId] = useState(null);
  const rowRefs = useRef(new Map());
  const setRowRef = (id) => (node) => {
    if (node) rowRefs.current.set(id, node);
    else rowRefs.current.delete(id);
  };

  // Único mecanismo de "foco pendiente por id": una fila puede desaparecer
  // del DOM como consecuencia directa de una acción del propio usuario sobre
  // ELLA (eliminarla) — el navegador resetea el foco a <body> cuando el
  // elemento enfocado se desmonta. Se calcula el vecino ANTES de eliminar y
  // se consume acá, una sola vez por render, sin sondear nada en cada
  // renderización ajena (evita robarle el foco al buscador mientras el
  // usuario filtra, que no tiene relación con esto).
  const pendingFocusIdRef = useRef(null);
  useEffect(() => {
    if (pendingFocusIdRef.current == null) return;
    const id = pendingFocusIdRef.current;
    pendingFocusIdRef.current = null;
    rowRefs.current.get(id)?.focus();
  });

  // Deep-link desde el banner de dominancia de "Otros" en ChartsTab — se
  // consume una sola vez al montar y se limpia, mismo patrón que tenía
  // ExpenseList.jsx (initialCategoryFilter/onInitialFilterConsumed).
  useEffect(() => {
    if (initialCategoryFilter) {
      onInitialFilterConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const matchesSearch = (description) =>
    description.toLowerCase().includes(searchTerm.trim().toLowerCase());

  const visibleIncomes = incomes.filter((inc) => {
    if (typeFilter === 'expense') return false;
    return matchesSearch(inc.description);
  });

  const visibleExpenses = expenses.filter((exp) => {
    if (typeFilter === 'income') return false;
    if (categoryFilter !== 'all' && exp.category !== categoryFilter) return false;
    return matchesSearch(exp.description);
  });

  // Resumen mensual pegajoso: "Gastado X · Ingresado Y" — NUNCA un saldo neto
  // (Regla Inquebrantable 4). Calculado sobre lo actualmente visible (mes
  // activo + categoría + tipo + búsqueda), reusando calculateTotal — no se
  // reimplementa la suma.
  const totalExpenses = calculateTotal(visibleExpenses);
  const totalIncomes = calculateTotal(visibleIncomes);

  const movements = [
    ...visibleIncomes.map((i) => ({ ...i, type: 'income' })),
    ...visibleExpenses.map((e) => ({ ...e, type: 'expense' })),
  ];

  const groups = groupMovementsByDay(movements, i18n.language, new Date());

  // Orden visual real (cruza fronteras de GrupoDía) — la misma que ve el
  // usuario en pantalla, necesaria para que ↑↓ avancen a la fila siguiente
  // aunque esté en otro día.
  const orderedMovements = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const indexById = useMemo(
    () => new Map(orderedMovements.map((m, i) => [m.id, i])),
    [orderedMovements]
  );

  const effectiveActiveId = useMemo(() => {
    if (orderedMovements.length === 0) return null;
    if (explicitActiveId != null && indexById.has(explicitActiveId)) return explicitActiveId;
    return orderedMovements[0].id;
  }, [orderedMovements, indexById, explicitActiveId]);

  // Único punto de entrada de eliminación (teclado ⌫ y clic en "Eliminar"
  // dentro de ExpansionDetalle pasan por acá): calcula el vecino ANTES de
  // eliminar y lo deja en pendingFocusIdRef — la fila desaparece del DOM
  // como efecto directo de esta acción, así que el foco se recupera acá
  // mismo, no en un efecto genérico que reaccione a cualquier cambio de la
  // lista.
  const handleDeleteMovement = (movement) => {
    if (!onDeleteMovement) return;
    const index = indexById.get(movement.id);
    const neighbor = orderedMovements[index + 1] ?? orderedMovements[index - 1] ?? null;
    pendingFocusIdRef.current = neighbor?.id ?? null;
    setExplicitActiveId(neighbor?.id ?? null);
    onDeleteMovement(movement);
  };

  const handleRowKeyDown = (e, movement) => {
    const index = indexById.get(movement.id);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = orderedMovements[index + 1];
      if (next) rowRefs.current.get(next.id)?.focus();
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = orderedMovements[index - 1];
      if (prev) rowRefs.current.get(prev.id)?.focus();
      return;
    }
    if (e.key === 'Escape') {
      if (expandedId === movement.id || swipedId === movement.id) {
        e.preventDefault();
        dispatchRowInteraction({ type: 'CLOSE_ACTIVE_ROW' });
      }
      return;
    }
    if ((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (!onEditMovement) return;
      e.preventDefault();
      onEditMovement(movement);
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      handleDeleteMovement(movement);
    }
    // Enter: sin manejo explícito — la fila es un <button> real, el
    // navegador ya dispara su onClick (handleRowClick) nativamente.
  };

  const monthChipLabel = (() => {
    if (selectedYear == null) return null;
    if (selectedMonth == null) return String(selectedYear);
    const monthName = new Intl.DateTimeFormat(i18n.language, { month: 'long' }).format(
      new Date(selectedYear, selectedMonth)
    );
    return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${selectedYear}`;
  })();

  const clearPeriodFilter = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
  };

  // Checkpoint IV-F.1 — "dos salidas" del estado sin-resultados: buscar en
  // todo el historial reutiliza clearPeriodFilter tal cual (App.jsx ya
  // recorta por mes antes de que Historial vea los datos, así que quitar
  // el mes es exactamente "buscar en todo"); quitar filtros hace lo mismo
  // y además resetea búsqueda/categoría/tipo.
  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setTypeFilter('all');
    clearPeriodFilter();
  };

  if (loading) return <HistorialSkeleton />;

  if (!hasMovements) {
    return <EstadoVacio onRegisterExpense={onRegisterExpense} onNavigateToImport={onNavigateToImport} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Checkpoint IV-F.2 — aditivo, no excluyente: convive con filtros,
          resumen y lista/sin-resultados de más abajo. */}
      {syncError && (
        <BannerErrorSincronizacion lastSyncedAt={lastSyncedAt} onRetrySync={onRetrySync} />
      )}

      {/* Filtros — mes (chip), categoría, tipo, búsqueda. Aplican al instante. */}
      <div className="flex flex-wrap items-center gap-2">
        {monthChipLabel && (
          <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-ds-control bg-ds-accent-tint text-ds-body text-ds-text-primary">
            {monthChipLabel}
            <button
              type="button"
              aria-label="Quitar filtro de período"
              onClick={clearPeriodFilter}
              className="text-ds-text-tertiary hover:text-ds-text-primary"
            >
              <X size={13} weight="bold" />
            </button>
          </span>
        )}

        <div className="flex gap-1">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTypeFilter(opt.value)}
              className={cn(
                'h-8 px-3 rounded-ds-control text-ds-body border',
                typeFilter === opt.value
                  ? 'bg-ds-accent-tint text-ds-text-primary border-transparent'
                  : 'bg-transparent text-ds-text-secondary border-ds-border hover:bg-ds-interaction-hover'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <select
          aria-label="Categoría"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-8 px-3 rounded-ds-control border border-ds-border bg-transparent text-ds-body text-ds-text-primary"
        >
          <option value="all">Categoría</option>
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <div className="relative flex-1 min-w-[160px]">
          <MagnifyingGlass
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ds-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            placeholder="Buscar…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-ds-control border border-ds-border bg-transparent text-ds-body text-ds-text-primary placeholder-ds-text-tertiary"
          />
        </div>
      </div>

      {/* Resumen mensual pegajoso — dos hechos, sin saldo neto moralizante. */}
      <div className="sticky top-0 z-10 bg-ds-bg-base flex items-baseline justify-between border-b border-ds-border pb-3">
        <p className="text-ds-caption text-ds-text-tertiary tabular-nums">
          Gastado {formatCurrency(totalExpenses)} · Ingresado {formatCurrency(totalIncomes)}
        </p>
      </div>

      {groups.length === 0 ? (
        <EstadoSinResultados
          searchTerm={searchTerm}
          monthLabel={monthChipLabel}
          onSearchEverywhere={clearPeriodFilter}
          onClearAllFilters={clearAllFilters}
        />
      ) : (
        <div className="flex flex-col gap-7">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="text-ds-overline">{group.label}</p>
              <div className="mt-1">
                {group.items.map((item) => {
                  const fila = (
                    <FilaMovimiento
                      ref={setRowRef(item.id)}
                      description={item.description}
                      date={item.date}
                      amount={item.amount}
                      type={item.type}
                      currency={item.currency}
                      category={item.type === 'expense' ? item.category : undefined}
                      showRelativeDate={false}
                      onClick={() => handleRowClick(item.id)}
                      tabIndex={item.id === effectiveActiveId ? 0 : -1}
                      onKeyDown={(e) => handleRowKeyDown(e, item)}
                      onFocus={() => setExplicitActiveId(item.id)}
                    />
                  );

                  return (
                    <div key={item.id}>
                      {isMobileRow ? (
                        <FilaDeslizable
                          id={item.id}
                          isRevealed={swipedId === item.id}
                          onReveal={handleReveal}
                          onCloseReveal={handleCloseReveal}
                          onEditMovement={onEditMovement}
                          onDeleteMovement={onDeleteMovement ? handleDeleteMovement : undefined}
                          movement={item}
                        >
                          {fila}
                        </FilaDeslizable>
                      ) : (
                        fila
                      )}
                      {expandedId === item.id && (
                        isDesktop ? (
                          <ExpansionDetalle
                            movement={item}
                            onEditMovement={onEditMovement}
                            onDeleteMovement={onDeleteMovement ? handleDeleteMovement : undefined}
                          />
                        ) : (
                          <Sheet
                            isOpen
                            onClose={() => dispatchRowInteraction({ type: 'CLOSE_ACTIVE_ROW' })}
                            desktopBreakpoint="ds-desktop"
                          >
                            <ExpansionDetalle
                              movement={item}
                              onEditMovement={onEditMovement}
                              onDeleteMovement={onDeleteMovement ? handleDeleteMovement : undefined}
                            />
                          </Sheet>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Historial.propTypes = {
  incomes: PropTypes.array,
  expenses: PropTypes.array,
  selectedYear: PropTypes.number,
  selectedMonth: PropTypes.number,
  setSelectedYear: PropTypes.func.isRequired,
  setSelectedMonth: PropTypes.func.isRequired,
  initialCategoryFilter: PropTypes.string,
  onInitialFilterConsumed: PropTypes.func,
  onEditMovement: PropTypes.func,
  onDeleteMovement: PropTypes.func,
  loading: PropTypes.bool,
  hasMovements: PropTypes.bool,
  onRegisterExpense: PropTypes.func,
  onNavigateToImport: PropTypes.func,
  syncError: PropTypes.bool,
  lastSyncedAt: PropTypes.string,
  onRetrySync: PropTypes.func,
};
