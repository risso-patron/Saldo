import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  calculateSpendingPaceComparison,
  getMonthlySeries,
  getRecentTransactions,
  splitAmountForDisplay,
} from '../../utils/dashboardCalculations';
import { formatCurrency } from '../../utils/formatters';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Button } from '../ds/Button';
import { FilaMovimiento } from '../ds/FilaMovimiento';
import { cn } from '../ds/cn';

// Fase II — Integración del Dashboard (Saldo Design Constitution v1.2).
// Fuente: docs/design/screens/Saldo Dashboard.dc.html.
//
// Restricción del PO: DashboardHome NO contiene lógica de negocio compleja.
// Se limita a obtener datos (props), llamar helpers (src/utils/
// dashboardCalculations.js + src/utils/calculations.js) y renderizar
// componentes — es una capa de composición.

const RECENT_TRANSACTIONS_LIMIT = 5;
const MONTHLY_SERIES_LENGTH = 6;
const MIN_BAR_HEIGHT_PX = 4;
const MAX_BAR_HEIGHT_PX = 40;

// Skeleton (estado Cargando) — la Constitución prohíbe spinners ("los
// spinners son una derrota") y `animate-pulse` no está permitido. Se usa un
// bloque gris ESTÁTICO en vez de una animación de pulso lento a medida:
// Tailwind no expone una utilidad de opacidad "pulso lento" lista para usar
// sin CSS custom, y el PO priorizó no violar la Constitución sobre la
// fidelidad exacta del mockup acá. Decisión documentada para el orquestador.
function DashboardSkeleton() {
  return (
    <div className="space-y-6" data-testid="dashboard-skeleton">
      <div className="h-3 w-32 bg-ds-border-separator rounded-sm" />
      <div className="h-12 w-56 bg-ds-border-separator rounded-sm" />
      <div className="h-4 w-40 bg-ds-border-separator rounded-sm" />
      <div className="space-y-0">
        <div className="h-11 w-full bg-ds-border-separator rounded-sm" />
        <div className="h-11 w-full bg-ds-border-separator rounded-sm" />
      </div>
    </div>
  );
}

// Estado Vacío — sin "Conectar mi banco" (no existe integración bancaria
// real, excepción constitucional documentada en integration-debt.md): un
// único camino manual, "Registrar un gasto".
function EmptyState({ onRegisterExpense }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-ds-overline">Saldo disponible</p>
        <p className="text-ds-body text-ds-text-primary mt-2">
          Aquí verás tu saldo en cuanto conectes una cuenta o registres tu primer gasto.
        </p>
        <div className="mt-4">
          <Button variant="primary" onClick={onRegisterExpense}>Registrar un gasto</Button>
        </div>
      </div>
      <div>
        <h2 className="text-ds-title text-ds-text-disabled">Movimientos recientes</h2>
        <p className="text-ds-caption text-ds-text-disabled mt-1">Aquí aparecerán tus movimientos.</p>
      </div>
    </div>
  );
}

function DashboardContent({ expenses, balance, allTransactions, onViewAllTransactions }) {
  const { i18n } = useTranslation();
  const { selectedCurrency } = useCurrency();
  const now = new Date();

  // ── Cifra protagonista: Saldo disponible (ingresos - gastos, TODO el
  // historial, sin descontar deuda de tarjetas — decisión explícita del PO,
  // ver docs/design/integration-debt.md). WRITE-DISPLAY-CURRENCY-001: usa el
  // balance ya normalizado a la moneda seleccionada (useTransactions.js),
  // recibido como prop — no se recalcula desde incomes/expenses crudos.
  const balanceSplit = splitAmountForDisplay(balance, selectedCurrency);

  // ── Contexto del mes: serie de 6 meses (helper 1b) — el último elemento
  // es siempre el mes de referencia (hoy), reusado como cifra "Gasto de
  // este mes" en vez de duplicar el filtro mes-a-mes.
  const monthlySeries = getMonthlySeries(expenses, now, MONTHLY_SERIES_LENGTH);
  const currentMonthEntry = monthlySeries[monthlySeries.length - 1];
  const monthExpenseSplit = splitAmountForDisplay(currentMonthEntry.total);
  const monthName = new Intl.DateTimeFormat(i18n.language, { month: 'long' }).format(now);

  // ── Comparación de ritmo de gasto (helper 1a) — null si no hay historial
  // suficiente; en ese caso, la caption se omite por completo (nunca se
  // fabrica una comparación sin base).
  const paceComparison = calculateSpendingPaceComparison(expenses, now);

  // ── Mini-gráfico de 6 barras — altura proporcional al total de cada mes,
  // normalizada contra el máximo de la serie (altura mínima uniforme si
  // todos son 0, para no dividir por cero).
  const maxTotal = Math.max(...monthlySeries.map((entry) => entry.total));

  const recentTransactions = getRecentTransactions(allTransactions, RECENT_TRANSACTIONS_LIMIT);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-ds-overline">Saldo disponible</p>
        <p className="text-ds-numeric-xl text-ds-text-primary">
          {balanceSplit.integerPart}
          <span className="text-[50%] font-medium text-ds-text-tertiary align-baseline">
            {balanceSplit.decimalPart}
          </span>
        </p>
      </div>

      <div>
        <p className="text-ds-overline">{`Gasto de ${monthName}`}</p>
        <p className="text-ds-title text-ds-text-primary">
          {monthExpenseSplit.integerPart}{monthExpenseSplit.decimalPart}
        </p>
        {paceComparison && (
          <p className="text-ds-caption text-ds-text-tertiary">
            {paceComparison.diff > 0
              ? `${formatCurrency(paceComparison.diff)} menos que tu media a estas alturas del mes`
              : `${formatCurrency(Math.abs(paceComparison.diff))} más que tu media a estas alturas del mes`}
          </p>
        )}

        <div className="flex items-end gap-1.5 mt-3" aria-hidden="true">
          {monthlySeries.map((entry, index) => {
            const isCurrentMonth = index === monthlySeries.length - 1;
            const heightPx = maxTotal > 0
              ? Math.max(MIN_BAR_HEIGHT_PX, Math.round((entry.total / maxTotal) * MAX_BAR_HEIGHT_PX))
              : MIN_BAR_HEIGHT_PX;
            return (
              <div
                key={`${entry.year}-${entry.month}`}
                className={cn('w-2 rounded-sm', isCurrentMonth ? 'bg-ds-accent' : 'bg-ds-border')}
                style={{ height: `${heightPx}px` }}
              />
            );
          })}
        </div>
      </div>

      {/* Punto de integración futura: AIInsightCard (src/components/AI/) cuando
          exista un motor de IA funcional. Constitución: "Sin IA" = sin nota, sin
          hueco reservado. */}

      <div>
        <h2 className="text-ds-title text-ds-text-primary">Movimientos recientes</h2>
        <div>
          {recentTransactions.map((tx) => (
            <FilaMovimiento
              key={tx.id}
              description={tx.description}
              date={tx.date}
              amount={tx.amount}
              type={tx.type}
              currency={tx.currency}
            />
          ))}
        </div>
        <div className="mt-2">
          <Button variant="link" onClick={onViewAllTransactions}>Ver todos los movimientos</Button>
        </div>
      </div>
    </div>
  );
}

export function DashboardHome({
  incomes = [],
  expenses = [],
  balance = 0,
  allTransactions = [],
  loading = false,
  onRegisterExpense,
  onViewAllTransactions,
}) {
  if (loading) return <DashboardSkeleton />;

  if (allTransactions.length === 0) {
    return <EmptyState onRegisterExpense={onRegisterExpense} />;
  }

  return (
    <DashboardContent
      incomes={incomes}
      expenses={expenses}
      balance={balance}
      allTransactions={allTransactions}
      onViewAllTransactions={onViewAllTransactions}
    />
  );
}

DashboardHome.propTypes = {
  incomes: PropTypes.array,
  expenses: PropTypes.array,
  balance: PropTypes.number,
  allTransactions: PropTypes.array,
  loading: PropTypes.bool,
  onRegisterExpense: PropTypes.func.isRequired,
  onViewAllTransactions: PropTypes.func.isRequired,
};
