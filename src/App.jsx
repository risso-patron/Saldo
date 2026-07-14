import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, X } from '@phosphor-icons/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTransactions } from './hooks/useTransactions';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEYS, STRATEGIC_MESSAGES } from './constants/categories';
import { useFilters } from './hooks/useFilters';
import { useConfirmDialog } from './hooks/useConfirmDialog';
import { AppHeader } from './components/AppHeader';
import { Alert } from './components/Shared/Alert';
import { ConfirmDialog } from './components/Shared/ConfirmDialog';
import { ThemeToggle } from './components/Shared/ThemeToggle';
import { ErrorBoundary } from './components/Shared/ErrorBoundary';
import { ProfileMenu } from './components/Auth/ProfileMenu';
import MigrationDialog from './components/MigrationDialog';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPageNew';
import { hasPendingMigration } from './utils/dataMigration';
// Siempre visible en tab inicial — carga síncrona
import { Summary } from './components/Summary';
import { HabitDailyCard } from './components/Dashboard/HabitDailyCard';
import { GlobalBudgetTracker } from './components/Budget/GlobalBudgetTracker';
import { AIAlerts, AIProviderStatus } from './components/AI';
import { useAIInsights } from './hooks/useAIInsightsMulti';
import { DailyReminder } from './components/Notifications/DailyReminder';
import { DailyOnboardingToast } from './components/Notifications/DailyOnboardingToast';
import { FloatingChatButton } from './components/Shared/FloatingChatButton';
import { FloatingChatWidget } from './components/Shared/FloatingChatWidget';
import { Omnibar } from './components/Shared/Omnibar';
import { Sidebar } from './components/Shared/Sidebar';
import { InstallPWA } from './components/InstallPWA';
import { BottomNav } from './components/Shared/BottomNav';
import { useAchievements } from './hooks/gamification/useAchievements';
import { AchievementNotifications } from './features/gamification/AchievementNotification';
import { useRecurring } from './hooks/useRecurring';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { PeriodProvider } from './contexts/PeriodContext';
import { CurrencySelector } from './features/currency/CurrencySelector';
import { filterByMonth } from './utils/calculations';

// Tabs lazy — solo se cargan cuando el usuario navega a esa sección
const BudgetForm = lazy(() => import('./components/BudgetForm').then(m => ({ default: m.BudgetForm })));
const ExpenseList = lazy(() => import('./components/ExpenseList').then(m => ({ default: m.ExpenseList })));
const ChartsTab = lazy(() => import('./components/Charts/ChartsTab').then(m => ({ default: m.ChartsTab })));
const CreditCardManager = lazy(() => import('./components/CreditCard/CreditCardManager').then(m => ({ default: m.CreditCardManager })));
const BudgetManager = lazy(() => import('./features/budgets/BudgetManager').then(m => ({ default: m.BudgetManager })));
const RecurringManager = lazy(() => import('./features/recurring/RecurringManager').then(m => ({ default: m.RecurringManager })));
const GoalManager = lazy(() => import('./features/goals/GoalManager').then(m => ({ default: m.GoalManager })));
const ExportManager = lazy(() => import('./features/export/ExportManager').then(m => ({ default: m.ExportManager })));
const ImportManager = lazy(() => import('./features/import/ImportManager'));
const GamificationDashboard = lazy(() => import('./features/gamification').then(m => ({ default: m.GamificationDashboard })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AIInsightsPanel = lazy(() => import('./components/AI').then(m => ({ default: m.AIInsightsPanel })));

const TabLoader = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const [showAuth, setShowAuth] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const [isChatWidgetOpen, setIsChatWidgetOpen] = useState(false);
  const [isOmnibarOpen, setIsOmnibarOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOmnibarOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [creditCards, setCreditCards] = useLocalStorage(STORAGE_KEYS.CREDIT_CARDS, []);
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.GOALS, []);
  const { confirmDialog, openConfirm, closeConfirm } = useConfirmDialog();

  const [quote, setQuote] = useState('');
  useEffect(() => {
    const quotes = t('quotes', { returnObjects: true });
    const list = Array.isArray(quotes) ? quotes : STRATEGIC_MESSAGES.QUOTES;
    setQuote(list[Math.floor(Math.random() * list.length)]);
  }, [i18n.language, t]);

  const {
    incomes, expenses, alert, addIncome, addExpense, addBulkTransactions, updateIncome, updateExpense,
    removeIncome, removeExpense, removeMultiple, categorizeMultiple, showAlert,
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
  useAIInsights(allTransactions);

  const [activeTab, setActiveTab] = useLocalStorage('budgetrp_ui_activeTab', 'resumen');

  // Filtro de categoría pendiente para Movimientos — deep-link desde el CTA
  // del banner de dominancia de "Otros" en ChartsTab (HAL-001 parte 2).
  // ExpenseList lo consume una vez al montar y lo limpia vía onInitialFilterConsumed.
  const [pendingCategoryFilter, setPendingCategoryFilter] = useState(null);
  const handleReclassifyOtros = () => {
    setPendingCategoryFilter('Otros');
    setActiveTab('movimientos');
  };

  // Key para forzar el reinicio de BudgetForm al pulsar el "+" de la Bottom Nav
  const [budgetFormKey, setBudgetFormKey] = useState(0);

  // Sección de logros colapsable en el tab Resumen
  const [showGamification, setShowGamification] = useState(false);

  // Ref del contenedor de scroll para hacer scroll-to-top al cambiar de pestaña
  const scrollContainerRef = useRef(null);
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const {
    selectedYear, setSelectedYear,
    selectedMonth, setSelectedMonth,
    filteredIncomes, filteredExpenses,
    filteredTotalIncome, filteredTotalExpenses, filteredBalance,
    availableYears, availableMonths,
    monthlyComparison,
  } = useFilters(incomes, expenses);

  const handleAddCard = (card) => { setCreditCards([...creditCards, card]); showAlert('success', `Tarjeta "${card.name}" agregada`); return true; };
  const handleUpdateDebt = (cardId, newDebt) => setCreditCards(creditCards.map(card => card.id === cardId ? { ...card, debt: newDebt } : card));
  const handleRemoveCard = (cardId) => { setCreditCards(creditCards.filter(card => card.id !== cardId)); showAlert('success', 'Tarjeta eliminada'); };
  const handleAddGoal = (goal) => { setGoals([...goals, goal]); showAlert('success', `Meta "${goal.name}" creada`); return true; };
  const handleUpdateGoalProgress = (goalId, newAmount) => setGoals(goals.map(goal => goal.id === goalId ? { ...goal, currentAmount: newAmount } : goal));
  const handleDeleteGoal = (goalId) => openConfirm({ title: t('app.delete_goal_title'), message: t('app.delete_goal_confirm'), onConfirm: () => { setGoals(goals.filter(goal => goal.id !== goalId)); showAlert('success', t('app.goal_deleted')); closeConfirm(); }});

  const handleAddIncome = (description, amount, date, currency) => {
    const result = addIncome(description, amount, date, currency);
    if (result) achievements.recordTransaction('income');
    return result;
  };

  const handleAddExpense = (description, category, amount, date, currency) => {
    const result = addExpense(description, category, amount, date, currency);
    if (result) achievements.recordTransaction('expense');
    return result;
  };

  const handleImportTransaction = async (type, data) => {
    if (type === 'income') return handleAddIncome(data.description, data.amount, data.date);
    return handleAddExpense(data.description, data.category, data.amount, data.date);
  };

  const handleBulkImportTransaction = async (transactions) => addBulkTransactions(transactions);

  const handleClearAllTransactions = () => openConfirm({
    title: t('app.clear_all_title'), message: t('app.clear_all_message', { count: incomes.length + expenses.length }), confirmLabel: t('app.clear_all_confirm'), onConfirm: () => { clearAll(); closeConfirm(); }
  });

  const handleQuickAddAction = () => {
    setActiveTab('movimientos');
    setBudgetFormKey(prev => prev + 1); // Reinicia BudgetForm para mostrar el selector (Escribir/Escanear)
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
      {showMigration && <MigrationDialog onClose={() => setShowMigration(false)} onComplete={(count) => { showAlert('success', `${count} transacciones migradas`); setShowMigration(false); refreshTransactions(); }} />}
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => showAlert(null)} />}
      <ConfirmDialog isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message} confirmLabel={confirmDialog.confirmLabel} variant={confirmDialog.variant} onConfirm={() => confirmDialog.onConfirm?.()} onCancel={closeConfirm} />
      <AchievementNotifications achievements={achievements.newAchievements} onRemove={achievements.removeNewAchievement} />

      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenOmnibar={() => setIsOmnibarOpen(true)} ProfileMenuComponent={<ProfileMenu onClearAll={handleClearAllTransactions} transactionCount={incomes.length + expenses.length} onNavigate={setActiveTab} />} ThemeToggleComponent={<ThemeToggle />} CurrencySelectorComponent={<CurrencySelector />} />

        <div ref={scrollContainerRef} className="flex-1 h-screen overflow-y-auto custom-scrollbar relative px-3 sm:px-6 lg:px-10">
          <div className="max-w-7xl mx-auto py-2 sm:py-10">
            
            <AppHeader
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onOpenOmnibar={() => setIsOmnibarOpen(true)}
              quote={quote}
              availableYears={availableYears}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              availableMonths={availableMonths}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              onClearAll={handleClearAllTransactions}
              transactionCount={incomes.length + expenses.length}
            />

            {welcomeBanner !== null && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-2.5 mb-6 animate-fade-in-slide">
                <CheckCircle size={18} className="text-emerald-500" />
                <p className="text-[11px] sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">{t('app.welcome_banner', { count: welcomeBanner })}</p>
                <button onClick={() => setWelcomeBanner(null)} className="ml-auto text-emerald-400 p-1"><X size={14} /></button>
              </div>
            )}

            <main className="space-y-4 sm:space-y-10 pb-32">
              <DailyOnboardingToast /> <DailyReminder />
              <Omnibar isOpen={isOmnibarOpen} onClose={() => setIsOmnibarOpen(false)} allTransactions={allTransactions} onNavigate={setActiveTab} />
              <FloatingChatWidget isOpen={isChatWidgetOpen} onClose={() => setIsChatWidgetOpen(false)} context={{ balance: filteredBalance, savingsRate: filteredTotalIncome > 0 ? (filteredBalance / filteredTotalIncome) * 100 : 0 }} />
              <FloatingChatButton onClick={() => setIsChatWidgetOpen(!isChatWidgetOpen)} isOpen={isChatWidgetOpen} />

              {activeTab === 'resumen' && (
                <>
                  {/* 1. Protagonista: hábito del día */}
                  <HabitDailyCard
                    currentStreak={achievements.stats.currentStreak}
                    longestStreak={achievements.stats.longestStreak}
                    allTransactions={allTransactions}
                    categoryAnalysis={categoryAnalysis}
                    monthlyComparison={{ prevTotalExpenses: monthlyComparison.prevTotalExpenses, filteredTotalExpenses }}
                    monthIncome={filteredTotalIncome}
                    monthExpenses={filteredTotalExpenses}
                    onAddExpense={() => { setActiveTab('movimientos'); setBudgetFormKey(prev => prev + 1); }}
                    onAddIncome={() => { setActiveTab('movimientos'); setBudgetFormKey(prev => prev + 1); }}
                  />

                  {/* 2. Números clave */}
                  <Summary totalIncome={filteredTotalIncome} totalExpenses={filteredTotalExpenses} balance={filteredBalance} creditCardDebt={creditCards.reduce((s, c) => s + c.debt, 0)} prevTotalIncome={monthlyComparison.prevTotalIncome} prevTotalExpenses={monthlyComparison.prevTotalExpenses} prevBalance={monthlyComparison.prevBalance} />

                  {/* 3. Presupuesto global */}
                  <GlobalBudgetTracker totalExpenses={filteredTotalExpenses} />

                  {/* 4. Acceso a tendencias — sin gráficos inline */}
                  <button
                    onClick={() => setActiveTab('graficos')}
                    className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-primary-500/40 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
                  >
                    <span>Ver mis tendencias detalladas</span>
                    <span className="text-slate-400 group-hover:text-primary-500 transition-colors">→</span>
                  </button>

                  {/* 5. Logros — colapsable, secundario */}
                  <div>
                    <button
                      onClick={() => setShowGamification(v => !v)}
                      className="w-full flex items-center justify-between px-5 py-3 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    >
                      <span>Mis logros y progreso</span>
                      <span className="transition-transform duration-200" style={{ display: 'inline-block', transform: showGamification ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
                    </button>
                    {showGamification && (
                      <div className="mt-3">
                        <Suspense fallback={<TabLoader />}>
                          <GamificationDashboard currentLevel={achievements.currentLevel} totalPoints={achievements.totalPoints} pointsForNext={achievements.pointsForNext} levelProgress={achievements.levelProgress} currentStreak={achievements.stats.currentStreak} longestStreak={achievements.stats.longestStreak} unlockedAchievements={achievements.unlockedAchievements} isAchievementUnlocked={achievements.isAchievementUnlocked} />
                        </Suspense>
                      </div>
                    )}
                  </div>
                </>
              )}
              {activeTab === 'graficos' && <Suspense fallback={<TabLoader />}><ChartsTab filteredIncomes={filteredIncomes} filteredExpenses={filteredExpenses} filteredTotalIncome={filteredTotalIncome} filteredTotalExpenses={filteredTotalExpenses} filteredBalance={filteredBalance} categoryAnalysis={categoryAnalysis} onReclassifyOtros={handleReclassifyOtros} /></Suspense>}
              {activeTab === 'movimientos' && <Suspense fallback={<TabLoader />}><BudgetForm key={budgetFormKey} onAddIncome={handleAddIncome} onAddExpense={handleAddExpense} /><ExpenseList incomes={incomes} expenses={expenses} onRemoveIncome={id => openConfirm({title: 'Eliminar ingreso', message: '¿Seguro?', onConfirm: () => {removeIncome(id); closeConfirm()}})} onRemoveExpense={id => openConfirm({title: 'Eliminar gasto', message: '¿Seguro?', onConfirm: () => {removeExpense(id); closeConfirm()}})} onUpdateIncome={updateIncome} onUpdateExpense={updateExpense} onRemoveMultiple={removeMultiple} onCategorizeMultiple={categorizeMultiple} initialCategoryFilter={pendingCategoryFilter} onInitialFilterConsumed={() => setPendingCategoryFilter(null)} /></Suspense>}
              {activeTab === 'planificacion' && <Suspense fallback={<TabLoader />}><CreditCardManager creditCards={creditCards} onAddCard={handleAddCard} onUpdateDebt={handleUpdateDebt} onRemoveCard={handleRemoveCard} /><BudgetManager expenses={filteredExpenses} /><RecurringManager recurring={recurring} onAdd={addRecurring} onToggle={toggleRecurring} onRemove={removeRecurring} /><GoalManager goals={goals} onAddGoal={handleAddGoal} onUpdateProgress={handleUpdateGoalProgress} onDeleteGoal={handleDeleteGoal} currentBalance={balance} /></Suspense>}
              {activeTab === 'herramientas' && <Suspense fallback={<TabLoader />}><ExportManager incomes={incomes} expenses={expenses} onExport={() => achievements.updateStats({ dataExported: true })} /><ImportManager onImport={handleImportTransaction} onBulkImport={handleBulkImportTransaction} /></Suspense>}
              {activeTab === 'cuenta' && <Suspense fallback={<TabLoader />}><ProfilePage filteredTotalExpenses={filteredTotalExpenses} totalTransactions={allTransactions.length} currentStreak={achievements.stats.currentStreak} categoryCount={categoryAnalysis.length} onNavigate={setActiveTab} onShowAlert={showAlert} /></Suspense>}
            </main>
            <InstallPWA />
          </div>
        </div>

        <BottomNav activeTab={activeTab} onTabSelect={setActiveTab} onQuickAction={handleQuickAddAction} />
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CurrencyProvider>
            <PeriodProvider>
              <AppContent />
            </PeriodProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
