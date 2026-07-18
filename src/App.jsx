import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, X } from '@phosphor-icons/react';
import { Plus } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTransactions } from './hooks/useTransactions';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEYS } from './constants/categories';
import { useFilters } from './hooks/useFilters';
import { useConfirmDialog } from './hooks/useConfirmDialog';
import { DSTopBar } from './components/ds/DSTopBar';
import { DSSidebar } from './components/ds/DSSidebar';
import { DSBottomNav } from './components/ds/DSBottomNav';
import { DSFab } from './components/ds/DSFab';
import { Button } from './components/ds/Button';
import { Alert } from './components/Shared/Alert';
import { ConfirmDialog } from './components/Shared/ConfirmDialog';
import { ErrorBoundary } from './components/Shared/ErrorBoundary';
import MigrationDialog from './components/MigrationDialog';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPageNew';
import { hasPendingMigration } from './utils/dataMigration';
// Siempre visible en tab inicial — carga síncrona
import { DashboardHome } from './components/Dashboard/DashboardHome';
import { DailyReminder } from './components/Notifications/DailyReminder';
import { DailyOnboardingToast } from './components/Notifications/DailyOnboardingToast';
import { Omnibar } from './components/Shared/Omnibar';
import { NewMovementSheet } from './components/NewMovement/NewMovementSheet';
import { Toast } from './components/ds/Toast';
import { LegacyPeriodFilters } from './components/Shared/LegacyPeriodFilters';
import { Historial } from './components/Historial/Historial';
import { InstallPWA } from './components/InstallPWA';
import { useAchievements } from './hooks/gamification/useAchievements';
import { AchievementNotifications } from './features/gamification/AchievementNotification';
import { useRecurring } from './hooks/useRecurring';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PeriodProvider } from './contexts/PeriodContext';
import { AIProvider } from './contexts/AIContext';
import { groqProvider } from './lib/groqProvider';
import { filterByMonth } from './utils/calculations';
import { writeDraft } from './utils/newMovementDraft';

// Tabs lazy — solo se cargan cuando el usuario navega a esa sección
// Checkpoint IV-A: BudgetForm y ExpenseList dejan de montarse en "Movimientos"
// (reemplazados por Historial, importado arriba como carga síncrona porque
// Historial es una capa liviana de consulta/agrupación, no un tab completo
// con sus propias dependencias pesadas) — los archivos permanecen en el
// repo (edición/auditoría de código muerto es IV-G), solo se retira el
// import no usado acá.
const ChartsTab = lazy(() => import('./components/Charts/ChartsTab').then(m => ({ default: m.ChartsTab })));
const CreditCardManager = lazy(() => import('./components/CreditCard/CreditCardManager').then(m => ({ default: m.CreditCardManager })));
const BudgetManager = lazy(() => import('./features/budgets/BudgetManager').then(m => ({ default: m.BudgetManager })));
const RecurringManager = lazy(() => import('./features/recurring/RecurringManager').then(m => ({ default: m.RecurringManager })));
const GoalManager = lazy(() => import('./features/goals/GoalManager').then(m => ({ default: m.GoalManager })));
const ExportManager = lazy(() => import('./features/export/ExportManager').then(m => ({ default: m.ExportManager })));
const ImportManager = lazy(() => import('./features/import/ImportManager'));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

const TabLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [showAuth, setShowAuth] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);
  const [isNewMovementOpen, setIsNewMovementOpen] = useState(false);
  // Checkpoint III-C.3 — key de remontaje forzado de NewMovementSheet. El
  // componente lee su borrador UNA sola vez al montar (III-C.2, patrón
  // useRef con guarda) y queda SIEMPRE montado (III-A), así que la única
  // forma de que recoja un borrador escrito después del montaje inicial
  // (ej. desde el Omnibar) sin tocar NewMovementSheet.jsx es forzar un
  // desmontaje/remontaje real cambiándole el prop `key` — metadata de React
  // para el reconciler, no parte del contrato del componente en sí.
  const [newMovementRemountKey, setNewMovementRemountKey] = useState(0);
  // Checkpoint III-B: toast de "Deshacer" tras crear un movimiento desde
  // NewMovementSheet. Forma: { movement } | null — null significa "cerrado".
  const [undoToast, setUndoToast] = useState(null);
  const { confirmDialog, openConfirm, closeConfirm } = useConfirmDialog();

  // Checkpoint III-C.4 — autoridad única de overlay: ningún overlay puede
  // abrirse si otro ya está abierto. Constante derivada única, usada
  // simétricamente por los dos triggers globales de teclado (N y ⌘K) para
  // que ninguno pueda abrir un overlay por encima de otro ya abierto.
  const isAnyOverlayOpen = isOmnibarOpen || isNewMovementOpen || confirmDialog.isOpen || showMigration;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Checkpoint III-C.4 — el Omnibar puede seguir cerrándose con ⌘K
        // aunque sea "el" overlay abierto (isAnyOverlayOpen también es true
        // en ese caso); solo se bloquea si el overlay abierto es OTRO
        // distinto del propio Omnibar.
        if (isAnyOverlayOpen && !isOmnibarOpen) return;
        setIsOmnibarOpen(prev => !prev);
        return;
      }

      // Checkpoint III-C.1 — atajo "N" abre NewMovementSheet (docs/design/
      // flows/Saldo Flow 01 - Registrar Movimiento.dc.html: "N abre").
      // Sin Ctrl/Cmd/Alt (con modificadores sería un atajo distinto, no este
      // — y chocaría con atajos nativos del navegador/OS). Reutiliza este
      // mismo listener global en vez de sumar un segundo addEventListener,
      // por pedido explícito del PO (evita listeners duplicados al
      // desmontar/remontar).
      if (
        (e.key === 'n' || e.key === 'N') &&
        !e.ctrlKey && !e.metaKey && !e.altKey
      ) {
        const active = document.activeElement;
        const isEditableFocus =
          active &&
          (active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'SELECT' ||
            active.isContentEditable === true);

        if (!isEditableFocus && !isAnyOverlayOpen) {
          e.preventDefault();
          setIsNewMovementOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnyOverlayOpen, isOmnibarOpen]);

  const [creditCards, setCreditCards] = useLocalStorage(STORAGE_KEYS.CREDIT_CARDS, []);
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.GOALS, []);

  // Checkpoint IV-A: updateIncome/updateExpense/removeIncome/removeExpense/
  // removeMultiple/categorizeMultiple dejaban de tener consumidor en App.jsx
  // al retirar ExpenseList de "Movimientos" (Historial es de solo lectura —
  // editar/eliminar es IV-B/IV-C) — se dejan de desestructurar acá para no
  // arrastrar bindings sin uso; useTransactions.js no se toca, las sigue
  // exponiendo para quien las necesite.
  const {
    incomes, expenses, alert, addIncome, addExpense, addBulkTransactions,
    undoAddMovement, showAlert,
    balance, categoryAnalysis, clearAll, refreshTransactions, loading, allTransactions,
  } = useTransactions();

  const [welcomeBanner, setWelcomeBanner] = useState(null);
  const lastShownUserId = useRef(null);
  useEffect(() => {
    if (user && !loading && lastShownUserId.current !== user.id) {
      lastShownUserId.current = user.id;
      const count = (incomes?.length ?? 0) + (expenses?.length ?? 0);
      setWelcomeBanner(count);
      setTimeout(() => setWelcomeBanner(null), 4000);
    }
  }, [user?.id, loading, incomes.length, expenses.length]);

  // Detectar regreso desde Stripe Checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      showAlert('success', '🎉 ¡Pago exitoso! Tu plan Pro está activándose. Puede tomar unos segundos.');
      window.history.replaceState({}, '', '/');
    } else if (params.get('cancelled') === 'true') {
      showAlert('info', 'Pago cancelado. Puedes intentarlo cuando quieras.');
      window.history.replaceState({}, '', '/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const achievements = useAchievements();
  const { recurring, addRecurring, toggleRecurring, removeRecurring } = useRecurring(addIncome, addExpense);

  const [activeTab, setActiveTab] = useLocalStorage('budgetrp_ui_activeTab', 'resumen');

  // Filtro de categoría pendiente para Movimientos — deep-link desde el CTA
  // del banner de dominancia de "Otros" en ChartsTab (HAL-001 parte 2).
  // ExpenseList lo consume una vez al montar y lo limpia vía onInitialFilterConsumed.
  const [pendingCategoryFilter, setPendingCategoryFilter] = useState(null);
  const handleReclassifyOtros = () => {
    setPendingCategoryFilter('Otros');
    setActiveTab('movimientos');
  };

  // Ref del contenedor de scroll para hacer scroll-to-top al cambiar de pestaña
  const scrollContainerRef = useRef(null);
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const {
    filteredIncomes, filteredExpenses,
    filteredTotalIncome, filteredTotalExpenses, filteredBalance,
    // Recuperación transitoria (deuda Fase I-C): el shell DS no tiene filtros
    // de período; estos valores alimentan LegacyPeriodFilters dentro de los
    // tabs Movimientos e Insights — única UI que escribe PeriodContext.
    availableYears, selectedYear, setSelectedYear,
    availableMonths, selectedMonth, setSelectedMonth,
  } = useFilters(incomes, expenses);

  const handleAddCard = (card) => { setCreditCards([...creditCards, card]); showAlert('success', `Tarjeta "${card.name}" agregada`); return true; };
  const handleUpdateDebt = (cardId, newDebt) => setCreditCards(creditCards.map(card => card.id === cardId ? { ...card, debt: newDebt } : card));
  const handleRemoveCard = (cardId) => { setCreditCards(creditCards.filter(card => card.id !== cardId)); showAlert('success', 'Tarjeta eliminada'); };
  const handleAddGoal = (goal) => { setGoals([...goals, goal]); showAlert('success', `Meta "${goal.name}" creada`); return true; };
  const handleUpdateGoalProgress = (goalId, newAmount) => setGoals(goals.map(goal => goal.id === goalId ? { ...goal, currentAmount: newAmount } : goal));
  const handleDeleteGoal = (goalId) => openConfirm({ title: t('app.delete_goal_title'), message: t('app.delete_goal_confirm'), onConfirm: () => { setGoals(goals.filter(goal => goal.id !== goalId)); showAlert('success', t('app.goal_deleted')); closeConfirm(); }});

  // addIncome/addExpense ahora devuelven { success, movement } (Checkpoint
  // III-B) — estos wrappers preservan el contrato booleano plano que ya
  // consume BudgetForm.jsx (no se toca).
  const handleAddIncome = (description, amount, date, currency) => {
    const result = addIncome(description, amount, date, currency);
    if (result.success) achievements.recordTransaction('income');
    return result.success;
  };

  const handleAddExpense = (description, category, amount, date, currency) => {
    const result = addExpense(description, category, amount, date, currency);
    if (result.success) achievements.recordTransaction('expense');
    return result.success;
  };

  // Wrappers distintos de handleAddIncome/handleAddExpense (mismo par de
  // operaciones de dominio, dos consumidores con necesidades de notificación
  // distintas — Checkpoint III-B): BudgetForm.jsx sigue disparando el
  // showAlert legacy vía handleAddIncome/handleAddExpense; NewMovementSheet
  // usa estos handleCreate* con { notification: 'none' } y en su lugar
  // muestra el Toast de "Deshacer" propio de este flujo.
  const handleCreateIncome = (description, amount, date, currency) => {
    const result = addIncome(description, amount, date, currency, { notification: 'none' });
    if (result.success) {
      achievements.recordTransaction('income');
      setUndoToast({ movement: result.movement });
    }
    return result.success;
  };

  const handleCreateExpense = (description, category, amount, date, currency) => {
    const result = addExpense(description, category, amount, date, currency, { notification: 'none' });
    if (result.success) {
      achievements.recordTransaction('expense');
      setUndoToast({ movement: result.movement });
    }
    return result.success;
  };

  const handleImportTransaction = async (type, data) => {
    if (type === 'income') return handleAddIncome(data.description, data.amount, data.date);
    return handleAddExpense(data.description, data.category, data.amount, data.date);
  };

  const handleBulkImportTransaction = async (transactions) => addBulkTransactions(transactions);

  const handleClearAllTransactions = () => openConfirm({
    title: t('app.clear_all_title'), message: t('app.clear_all_message', { count: incomes.length + expenses.length }), confirmLabel: t('app.clear_all_confirm'), onConfirm: () => { clearAll(); closeConfirm(); }
  });

  // Único consumidor: el FAB (Checkpoint III-A). Abre la hoja nueva de
  // "Nuevo movimiento" — ya no reinicia BudgetForm ni navega a "movimientos".
  const handleQuickAddAction = () => {
    setIsNewMovementOpen(true);
  };

  // Checkpoint III-C.3 — único consumidor: el Omnibar, cuando el usuario
  // escribió texto que el parser determinista interpretó con éxito como un
  // movimiento. Escribe el borrador (writeDraft ya pone savedAt: Date.now()
  // por defecto — timestamp fresco, dentro del TTL de lectura) y fuerza el
  // remontaje de NewMovementSheet para que su lectura síncrona de arranque
  // recoja este borrador recién escrito en lugar del que tenía en memoria.
  const handleOpenNewMovementWithDraft = (movementDraft) => {
    writeDraft(movementDraft);
    setNewMovementRemountKey((k) => k + 1);
    setIsNewMovementOpen(true);
  };

  useEffect(() => { if (user && hasPendingMigration()) setShowMigration(true); }, [user]);
  useEffect(() => {
    achievements.updateStats({
      totalIncomes: incomes.length, totalExpenses: expenses.length, totalGoals: goals.length,
      goalsCompleted: goals.filter(g => g.currentAmount >= g.targetAmount).length, currentBalance: balance, creditCardsAdded: creditCards.length,
    });
  }, [incomes.length, expenses.length, goals.length, balance, creditCards.length]);

  // Logro "Domé la Bestia": la categoría top actual bajó ≥10% vs el mes anterior
  useEffect(() => {
    if (!categoryAnalysis.length || achievements.stats.topCategoryReduced) return;
    const topCategory = categoryAnalysis[0];
    if (!topCategory) return;
    const now = new Date();
    const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const prevExpenses = filterByMonth(expenses, prevYear, prevMonth);
    const prevCategoryTotal = prevExpenses
      .filter(e => e.category === topCategory.category)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    if (prevCategoryTotal > 0 && topCategory.amount <= prevCategoryTotal * 0.9) {
      achievements.updateStats({ topCategoryReduced: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryAnalysis, expenses]);

  if (!user && !authLoading) {
    if (!showAuth) return <LandingPage onGetStarted={() => setShowAuth(true)} onLogin={() => setShowAuth(true)} />;
    return <AuthPage />;
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-ds-bg-base">
      {showMigration && <MigrationDialog onClose={() => setShowMigration(false)} onComplete={(count) => { showAlert('success', `${count} transacciones migradas`); setShowMigration(false); refreshTransactions(); }} />}
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => showAlert(null)} />}
      <ConfirmDialog isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message} confirmLabel={confirmDialog.confirmLabel} variant={confirmDialog.variant} onConfirm={() => confirmDialog.onConfirm?.()} onCancel={closeConfirm} />
      <AchievementNotifications achievements={achievements.newAchievements} onRemove={achievements.removeNewAchievement} />

      <div className="flex h-screen overflow-hidden bg-ds-bg-base">
        <DSSidebar activeTab={activeTab} onTabSelect={setActiveTab} onOpenOmnibar={() => setIsOmnibarOpen(true)} />

        <div ref={scrollContainerRef} className="flex-1 h-screen overflow-y-auto custom-scrollbar relative px-3 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto py-2 sm:py-10">

            <DSTopBar onOpenOmnibar={() => setIsOmnibarOpen(true)}>
              {/* Oculto en mobile (<768px, mismo corte que el placeholder de
                  búsqueda de DSTopBar): el mockup mobile NO muestra este botón
                  en la barra superior — el único punto de entrada táctil ahí
                  es el DSFab ("círculo 56px... el único FAB del producto").
                  Verificado visualmente: sin este ocultamiento, el botón se
                  superpone con el overline de período a 390px. */}
              <div className="hidden md:block">
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setIsNewMovementOpen(true)}
                >
                  Nuevo movimiento
                </Button>
              </div>
            </DSTopBar>

            {welcomeBanner !== null && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2.5 mb-6 animate-fade-in-slide">
                <CheckCircle size={18} className="text-emerald-500" />
                <p className="text-[11px] sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">{t('app.welcome_banner', { count: welcomeBanner })}</p>
                <button onClick={() => setWelcomeBanner(null)} className="ml-auto text-emerald-400 p-1"><X size={14} /></button>
              </div>
            )}

            <main className="space-y-4 sm:space-y-10 pb-32">
              <DailyOnboardingToast /> <DailyReminder />
              <Omnibar isOpen={isOmnibarOpen} onClose={() => setIsOmnibarOpen(false)} allTransactions={allTransactions} onNavigate={setActiveTab} onClearAll={handleClearAllTransactions} transactionCount={incomes.length + expenses.length} onOpenNewMovementWithDraft={handleOpenNewMovementWithDraft} />
              {/* Checkpoint III-A: SIEMPRE montado (no condicionado por tab) —
                  solo `isOpen` controla si Sheet renderiza algo, así el borrador
                  sobrevive a cambios de tab y a cerrar con Escape/clic-fuera.
                  Checkpoint III-C.3: `key` fuerza remontaje real cuando el
                  Omnibar precarga un borrador — ver handleOpenNewMovementWithDraft. */}
              <NewMovementSheet
                key={newMovementRemountKey}
                isOpen={isNewMovementOpen}
                onClose={() => setIsNewMovementOpen(false)}
                onAddIncome={handleCreateIncome}
                onAddExpense={handleCreateExpense}
              />
              <Toast
                isOpen={undoToast !== null}
                message="Movimiento añadido"
                actionLabel="Deshacer"
                onAction={() => { undoAddMovement(undoToast.movement); setUndoToast(null); }}
                onDismiss={() => setUndoToast(null)}
              />

              {activeTab === 'resumen' && (
                <DashboardHome
                  incomes={incomes}
                  expenses={expenses}
                  allTransactions={allTransactions}
                  loading={loading}
                  onRegisterExpense={handleQuickAddAction}
                  onViewAllTransactions={() => setActiveTab('movimientos')}
                />
              )}
              {activeTab === 'graficos' && <Suspense fallback={<TabLoader />}><LegacyPeriodFilters availableYears={availableYears} selectedYear={selectedYear} setSelectedYear={setSelectedYear} availableMonths={availableMonths} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} /><ChartsTab filteredIncomes={filteredIncomes} filteredExpenses={filteredExpenses} filteredTotalIncome={filteredTotalIncome} filteredTotalExpenses={filteredTotalExpenses} filteredBalance={filteredBalance} categoryAnalysis={categoryAnalysis} onReclassifyOtros={handleReclassifyOtros} /></Suspense>}
              {activeTab === 'movimientos' && (
                <Historial
                  incomes={filteredIncomes}
                  expenses={filteredExpenses}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  initialCategoryFilter={pendingCategoryFilter}
                  onInitialFilterConsumed={() => setPendingCategoryFilter(null)}
                />
              )}
              {activeTab === 'planificacion' && <Suspense fallback={<TabLoader />}><CreditCardManager creditCards={creditCards} onAddCard={handleAddCard} onUpdateDebt={handleUpdateDebt} onRemoveCard={handleRemoveCard} /><BudgetManager expenses={filteredExpenses} /><RecurringManager recurring={recurring} onAdd={addRecurring} onToggle={toggleRecurring} onRemove={removeRecurring} /><GoalManager goals={goals} onAddGoal={handleAddGoal} onUpdateProgress={handleUpdateGoalProgress} onDeleteGoal={handleDeleteGoal} currentBalance={balance} /></Suspense>}
              {activeTab === 'herramientas' && <Suspense fallback={<TabLoader />}><ExportManager incomes={incomes} expenses={expenses} onExport={() => achievements.updateStats({ dataExported: true })} /><ImportManager onImport={handleImportTransaction} onBulkImport={handleBulkImportTransaction} /></Suspense>}
              {activeTab === 'cuenta' && <Suspense fallback={<TabLoader />}><ProfilePage filteredTotalExpenses={filteredTotalExpenses} totalTransactions={allTransactions.length} currentStreak={achievements.stats.currentStreak} categoryCount={categoryAnalysis.length} onNavigate={setActiveTab} onShowAlert={showAlert} /></Suspense>}
            </main>
            <InstallPWA />
          </div>
        </div>

        <DSBottomNav activeTab={activeTab} onTabSelect={setActiveTab} />
        <DSFab onAction={handleQuickAddAction} />
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AIProvider provider={groqProvider}>
            <CurrencyProvider>
              <PeriodProvider>
                <AppContent />
              </PeriodProvider>
            </CurrencyProvider>
          </AIProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
