import { useState, useEffect, useRef } from 'react';
import { CheckCircle, X } from '@phosphor-icons/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTransactions } from './hooks/useTransactions';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEYS, STRATEGIC_MESSAGES } from './constants/categories';
import { BudgetForm } from './components/BudgetForm';
import { ExpenseList } from './components/ExpenseList';
import { Summary } from './components/Summary';
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
import LandingPage from './pages/LandingPage';
import { hasPendingMigration } from './utils/dataMigration';
import { CreditCardManager } from './components/CreditCard/CreditCardManager';
// Nuevos gráficos avanzados
import { BalanceDonutChart } from './components/Charts/BalanceDonutChart';
import { ChartsTab } from './components/Charts/ChartsTab';
import { AIInsightsPanel, AIAlerts, PredictiveChart, AIProviderStatus } from './components/AI';
import { useAIInsights } from './hooks/useAIInsightsMulti';
// GRÁFICOS NUEVOS (Fase UX 3: Chart.js)
import { ExpensePieChart } from './components/Charts/ChartJS/ExpensePieChart';
import { IncomeExpenseBarChart } from './components/Charts/ChartJS/IncomeExpenseBarChart';
// FASE UX 4: Sistema de Presupuestos
import { GlobalBudgetTracker } from './components/Budget/GlobalBudgetTracker';
// FASE UX 5: Notificaciones / Recordatorios
import { DailyReminder } from './components/Notifications/DailyReminder';
import { DailyOnboardingToast } from './components/Notifications/DailyOnboardingToast';
import { FloatingChatButton } from './components/Shared/FloatingChatButton';
import { FloatingChatWidget } from './components/Shared/FloatingChatWidget';
import { Omnibar } from './components/Shared/Omnibar';
import { Sidebar } from './components/Shared/Sidebar';
// FEATURES PREMIUM
import { GoalManager } from './features/goals/GoalManager';
import { ExportManager } from './features/export/ExportManager';
import ImportManager from './features/import/ImportManager';
// GAMIFICACIÓN
import { GamificationDashboard, AchievementNotifications } from './features/gamification';
import { useAchievements } from './hooks/gamification/useAchievements';// NUEVAS FEATURES: Presupuestos + Chat IA
import { BudgetManager } from './features/budgets/BudgetManager'
import { AIChat } from './features/chat/AIChat'
// FEATURE 1: Transacciones Recurrentes
import { useRecurring } from './hooks/useRecurring'
import { RecurringManager } from './features/recurring/RecurringManager'
// FEATURE 2: Multi-moneda
import { CurrencyProvider } from './contexts/CurrencyContext'
import { CurrencySelector } from './features/currency/CurrencySelector'
import { InstallPWA } from './components/InstallPWA';
import { AppFooter } from './components/Shared/AppFooter';
import { BottomNav } from './components/Shared/BottomNav';

function AppContent() {
  const { user, loading: authLoading } = useAuth();
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
    const quotes = STRATEGIC_MESSAGES.QUOTES;
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const {
    incomes, expenses, alert, addIncome, addExpense, addBulkTransactions, updateIncome, updateExpense,
    removeIncome, removeExpense, removeMultiple, categorizeMultiple, showAlert, totalIncome, totalExpenses,
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

  const achievements = useAchievements();
  const { recurring, addRecurring, toggleRecurring, removeRecurring } = useRecurring(addIncome, addExpense);
  useAIInsights(allTransactions);

  const [activeTab, setActiveTab] = useLocalStorage('budgetrp_ui_activeTab', 'resumen');

  // Key para forzar el reinicio de BudgetForm al pulsar el "+" de la Bottom Nav
  const [budgetFormKey, setBudgetFormKey] = useState(0);

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
  const handleDeleteGoal = (goalId) => openConfirm({ title: 'Eliminar meta', message: '¿Seguro?', onConfirm: () => { setGoals(goals.filter(goal => goal.id !== goalId)); showAlert('success', 'Meta eliminada'); closeConfirm(); }});

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
    title: 'Limpiar todo', message: `¿Seguro de eliminar ${incomes.length + expenses.length} transacciones?`, confirmLabel: 'Sí, eliminar todo', onConfirm: () => { clearAll(); closeConfirm(); }
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
                <p className="text-[11px] sm:text-sm font-bold text-emerald-800 dark:text-emerald-300">Bienvenido — <span className="text-emerald-600 dark:text-emerald-400">{welcomeBanner}</span> transacciones listas.</p>
                <button onClick={() => setWelcomeBanner(null)} className="ml-auto text-emerald-400 p-1"><X size={14} /></button>
              </div>
            )}

            <main className="space-y-4 sm:space-y-10 pb-32">
              <DailyOnboardingToast /> <DailyReminder />
              <Omnibar isOpen={isOmnibarOpen} onClose={() => setIsOmnibarOpen(false)} allTransactions={allTransactions} onNavigate={setActiveTab} />
              <FloatingChatWidget isOpen={isChatWidgetOpen} onClose={() => setIsChatWidgetOpen(false)} context={{ balance: filteredBalance, savingsRate: filteredTotalIncome > 0 ? Math.round(((filteredBalance) / filteredTotalIncome) * 100) : 0 }} />
              <FloatingChatButton onClick={() => setIsChatWidgetOpen(!isChatWidgetOpen)} isOpen={isChatWidgetOpen} />

              {activeTab === 'resumen' && (
                <>
                  <GlobalBudgetTracker totalExpenses={filteredTotalExpenses} />
                  <Summary totalIncome={filteredTotalIncome} totalExpenses={filteredTotalExpenses} balance={filteredBalance} creditCardDebt={creditCards.reduce((s, c) => s + c.debt, 0)} prevTotalIncome={monthlyComparison.prevTotalIncome} prevTotalExpenses={monthlyComparison.prevTotalExpenses} prevBalance={monthlyComparison.prevBalance} />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><BalanceDonutChart totalIncome={filteredTotalIncome} totalExpenses={filteredTotalExpenses} /><div className="bg-slate-800/10 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl"><h3 className="text-slate-900 dark:text-white font-bold mb-4">Análisis de Gastos</h3><ExpensePieChart categoryAnalysis={categoryAnalysis} /></div></div>
                  <div className="bg-slate-800/10 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl"><h3 className="text-slate-900 dark:text-white font-bold mb-4">Balance General</h3><IncomeExpenseBarChart totalIncome={filteredTotalIncome} totalExpenses={filteredTotalExpenses} /></div>
                </>
              )}

              {activeTab === 'graficos' && <ChartsTab filteredIncomes={filteredIncomes} filteredExpenses={filteredExpenses} filteredTotalIncome={filteredTotalIncome} filteredTotalExpenses={filteredTotalExpenses} filteredBalance={filteredBalance} categoryAnalysis={categoryAnalysis} />}
              {activeTab === 'movimientos' && <><BudgetForm key={budgetFormKey} onAddIncome={handleAddIncome} onAddExpense={handleAddExpense} /><ExpenseList incomes={incomes} expenses={expenses} onRemoveIncome={id => openConfirm({title: 'Eliminar ingreso', message: '¿Seguro?', onConfirm: () => {removeIncome(id); closeConfirm()}})} onRemoveExpense={id => openConfirm({title: 'Eliminar gasto', message: '¿Seguro?', onConfirm: () => {removeExpense(id); closeConfirm()}})} onUpdateIncome={updateIncome} onUpdateExpense={updateExpense} onRemoveMultiple={removeMultiple} onCategorizeMultiple={categorizeMultiple} /></>}
              {activeTab === 'planificacion' && <><CreditCardManager creditCards={creditCards} onAddCard={handleAddCard} onUpdateDebt={handleUpdateDebt} onRemoveCard={handleRemoveCard} /><BudgetManager expenses={filteredExpenses} /><RecurringManager recurring={recurring} onAdd={addRecurring} onToggle={toggleRecurring} onRemove={removeRecurring} /><GoalManager goals={goals} onAddGoal={handleAddGoal} onUpdateProgress={handleUpdateGoalProgress} onDeleteGoal={handleDeleteGoal} currentBalance={balance} /></>}
              {activeTab === 'herramientas' && <><GamificationDashboard currentLevel={achievements.currentLevel} totalPoints={achievements.totalPoints} pointsForNext={achievements.pointsForNext} levelProgress={achievements.levelProgress} currentStreak={achievements.stats.currentStreak} longestStreak={achievements.stats.longestStreak} unlockedAchievements={achievements.unlockedAchievements} isAchievementUnlocked={achievements.isAchievementUnlocked} /><ExportManager incomes={incomes} expenses={expenses} categoryAnalysis={categoryAnalysis} totalIncome={totalIncome} totalExpenses={totalExpenses} balance={balance} onExport={() => achievements.updateStats({ dataExported: true })} /><ImportManager onImport={handleImportTransaction} onBulkImport={handleBulkImportTransaction} /></>}
            </main>
            <InstallPWA /> <AppFooter />
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
            <AppContent />
          </CurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
