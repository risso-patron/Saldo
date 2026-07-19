import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { X, MagnifyingGlass } from '@phosphor-icons/react';
import { calculateTotal } from '../../utils/calculations';
import { groupMovementsByDay } from '../../utils/movementGrouping';
import { formatCurrency } from '../../utils/formatters';
import { EXPENSE_CATEGORIES } from '../../constants/categories';
import { FilaMovimiento } from '../ds/FilaMovimiento';
import { ExpansionDetalle } from './ExpansionDetalle';
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
// editar/eliminar movimientos (filas de solo lectura, igual que Dashboard
// hoy — clic/expansión/editar es IV-B), SIN navegación por teclado especial
// (IV-D), SIN swipe (IV-E), SIN estados ilustrados completos (IV-F: vacío
// ilustrado, sin-resultados con dos salidas, error de sync), SIN nota IA.
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

const EMPTY_MESSAGE = 'Sin movimientos';

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
}) {
  const { i18n } = useTranslation();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  // Checkpoint IV-B — expansión en línea (definitiva, no provisoria): clic
  // en una fila la expande mostrando detalle + Editar. Un solo id expandido
  // a la vez (acordeón) — clic en la misma fila la colapsa, clic en otra
  // cambia cuál está expandida.
  const [expandedId, setExpandedId] = useState(null);
  const toggleExpanded = (id) => setExpandedId((prev) => (prev === id ? null : id));

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

  return (
    <div className="flex flex-col gap-6">
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
        <p className="text-ds-caption text-ds-text-tertiary">{EMPTY_MESSAGE}</p>
      ) : (
        <div className="flex flex-col gap-7">
          {groups.map((group) => (
            <div key={group.key}>
              <p className="text-ds-overline">{group.label}</p>
              <div className="mt-1">
                {group.items.map((item) => (
                  <div key={item.id}>
                    <FilaMovimiento
                      description={item.description}
                      date={item.date}
                      amount={item.amount}
                      type={item.type}
                      currency={item.currency}
                      category={item.type === 'expense' ? item.category : undefined}
                      showRelativeDate={false}
                      onClick={() => toggleExpanded(item.id)}
                    />
                    {expandedId === item.id && (
                      <ExpansionDetalle
                        movement={item}
                        onEditMovement={onEditMovement}
                        onDeleteMovement={onDeleteMovement}
                      />
                    )}
                  </div>
                ))}
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
};
