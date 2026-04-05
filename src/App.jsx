import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChartBar, ChartLine, Receipt, Target, Wrench, CheckCircle, X } from '@phosphor-icons/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useTransactions } from './hooks/useTransactions';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEYS, STRATEGIC_MESSAGES } from './constants/categories';
import { BudgetForm } from './components/BudgetForm';
import { ExpenseList } from './components/ExpenseList';
import { Summary } from './components/Summary';
import { 
  calculateTotal, 
  calculateBalance, 
  filterByYear, 
  filterByMonth, 
  getAvailableYears,
  getAvailableMonths,
  calculateMonthlyComparison
} from './utils/calculations';
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

/**
 * Componente principal de la aplicación con autenticación
 */
function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const [showMigration, setShowMigration] = useState(false);
  const [creditCards, setCreditCards] = useLocalStorage(STORAGE_KEYS.CREDIT_CARDS, []);
  const [goals, setGoals] = useLocalStorage(STORAGE_KEYS.GOALS, []);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Eliminar',
    variant: 'danger',
    onConfirm: null,
  });

  // Frase inspiradora aleatoria
  const [quote, setQuote] = useState('');
  useEffect(() => {
    const quotes = STRATEGIC_MESSAGES.QUOTES;
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false, onConfirm: null }));
  }, []);

  const openConfirm = useCallback((config) => {
    setConfirmDialog({ isOpen: true, confirmLabel: 'Eliminar', variant: 'danger', ...config });
  }, []);

  const {
    incomes,
    expenses,
    alert,
    addIncome,
    addExpense,
    addBulkTransactions,
    updateIncome,
    updateExpense,
    removeIncome,
    removeExpense,
    showAlert,
    totalIncome,
    totalExpenses,
    balance,
    categoryAnalysis,
    clearAll,
    refreshTransactions,
    loading,
    syncStatus,
    allTransactions,
  } = useTransactions();

  // Banner de bienvenida — se muestra una vez por sesión al cargar datos desde la nube
  // NOTA: debe estar DESPUÉS de useTransactions() para que `loading` no esté en TDZ
  const [welcomeBanner, setWelcomeBanner] = useState(null);
  const lastShownUserId = useRef(null);
  useEffect(() => {
    if (user && !loading && lastShownUserId.current !== user.id) {
      lastShownUserId.current = user.id;
      const count = (incomes?.length ?? 0) + (expenses?.length ?? 0);
      setWelcomeBanner(count);
      const timer = setTimeout(() => setWelcomeBanner(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [user?.id, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hook de gamificación
  const achievements = useAchievements();

  // FEATURE 1: Transacciones Recurrentes — procesa vencidos al montar
  const { recurring, addRecurring, toggleRecurring, removeRecurring } = useRecurring(addIncome, addExpense);

  // Hook de IA con Groq (Llama 3.3 70B) vía proxy seguro
  const aiInsights = useAIInsights(allTransactions);

  // ── Tabs y filtro de período persistentes (Fase UX 1) ───────────────────
  const [activeTab, setActiveTab] = useLocalStorage('budgetrp_ui_activeTab', 'resumen');
  const [selectedYear, setSelectedYear] = useLocalStorage('budgetrp_ui_selectedYear', null);
  const [selectedMonth, setSelectedMonth] = useLocalStorage('budgetrp_ui_selectedMonth', null);


  const filteredIncomes = useMemo(() => {
    const byYear = filterByYear(incomes, selectedYear);
    if (selectedYear && selectedMonth !== null) return filterByMonth(byYear, selectedYear, selectedMonth);
    return byYear;
  }, [incomes, selectedYear, selectedMonth]);

  const filteredExpenses = useMemo(() => {
    const byYear = filterByYear(expenses, selectedYear);
    if (selectedYear && selectedMonth !== null) return filterByMonth(byYear, selectedYear, selectedMonth);
    return byYear;
  }, [expenses, selectedYear, selectedMonth, loading]);

  const filteredTotalIncome   = useMemo(() => calculateTotal(filteredIncomes), [filteredIncomes]);
  const filteredTotalExpenses = useMemo(() => calculateTotal(filteredExpenses), [filteredExpenses]);
  const filteredBalance = useMemo(() => calculateBalance(filteredTotalIncome, filteredTotalExpenses), [filteredTotalIncome, filteredTotalExpenses]);

  // 1. Años con datos
  const availableYears = useMemo(() => 
    getAvailableYears(incomes, expenses), 
  [incomes, expenses]);

  // 2. Meses con datos (solo del año seleccionado)
  const availableMonths = useMemo(() => 
    getAvailableMonths(incomes, expenses, selectedYear), 
  [incomes, expenses, selectedYear]);

  // 3. Comparativa mes anterior
  const monthlyComparison = useMemo(() => 
    calculateMonthlyComparison(incomes, expenses), 
  [incomes, expenses]);

  // Funciones para tarjetas de crédito
  const handleAddCard = (card) => {
    setCreditCards([...creditCards, card]);
    showAlert('success', `Tarjeta "${card.name}" agregada exitosamente`);
    return true;
  };

  const handleUpdateDebt = (cardId, newDebt) => {
    setCreditCards(creditCards.map(card =>
      card.id === cardId ? { ...card, debt: newDebt } : card
    ));
  };

  const handleRemoveCard = (cardId) => {
    setCreditCards(creditCards.filter(card => card.id !== cardId));
    showAlert('success', 'Tarjeta eliminada');
  };

  // Funciones para metas financieras
  const handleAddGoal = (goal) => {
    setGoals([...goals, goal]);
    showAlert('success', `Meta "${goal.name}" creada exitosamente`);
    return true;
  };

  const handleUpdateGoalProgress = (goalId, newAmount) => {
    setGoals(goals.map(goal =>
      goal.id === goalId ? { ...goal, currentAmount: newAmount } : goal
    ));
  };

  const handleDeleteGoal = (goalId) => {
    openConfirm({
      title: 'Eliminar meta',
      message: '\u00bfEst\u00e1s seguro de eliminar esta meta? Esta acci\u00f3n no se puede deshacer.',
      onConfirm: () => {
        setGoals(goals.filter(goal => goal.id !== goalId));
        showAlert('success', 'Meta eliminada');
        closeConfirm();
      },
    });
  };

  // Wrappers para transacciones que registran en gamificación
  const handleAddIncome = (description, amount, date) => {
    const result = addIncome(description, amount, date);
    if (result) {
      achievements.recordTransaction('income');
    }
    return result;
  };

  const handleAddExpense = (description, category, amount, date) => {
    const result = addExpense(description, category, amount, date);
    if (result) {
      achievements.recordTransaction('expense');
    }
    return result;
  };

  // Handler para importación CSV
  const handleImportTransaction = async (type, data) => {
    try {
      if (type === 'income') {
        const result = handleAddIncome(data.description, data.amount, data.date);
        if (!result) {
          throw new Error('Error al agregar ingreso');
        }
        return result;
      } else {
        const result = handleAddExpense(data.description, data.category, data.amount, data.date);
        if (!result) {
          throw new Error('Error al agregar gasto');
        }
        return result;
      }
    } catch (error) {
      console.error('Error en handleImportTransaction:', error);
      throw error;
    }
  };

  // Handler para importación masiva (bulk)
  const handleBulkImportTransaction = async (transactions) => {
    try {
      console.log('🚀 Iniciando importación masiva:', transactions.length, 'transacciones');
      
      // Usar la función de bulk del hook
      const result = addBulkTransactions(transactions);
      
      console.log('✅ Resultado de importación masiva:', result);
      return result;
    } catch (error) {
      console.error('Error en handleBulkImportTransaction:', error);
      throw error;
    }
  };

  // Handler para limpiar todas las transacciones
  const handleClearAllTransactions = () => {
    openConfirm({
      title: 'Limpiar todas las transacciones',
      message: `\u00bfEst\u00e1s seguro de eliminar las ${incomes.length + expenses.length} transacciones? Esta acci\u00f3n no se puede deshacer.`,
      confirmLabel: 'S\u00ed, eliminar todo',
      onConfirm: () => {
        clearAll();
        closeConfirm();
      },
    });
  };

  // ✅ PREPARAR DATOS MENSUALES PARA PREDICCIONES
  // TEMPORALMENTE DESHABILITADO - Necesita VITE_ANTHROPIC_API_KEY
  /*
  const monthlyData = useMemo(() => {
    // ...
    return [];
  }, [incomes, expenses]);
  */

  // Verificar si hay datos pendientes de migración
  useEffect(() => {
    if (user && hasPendingMigration()) {
      setShowMigration(true);
    }
  }, [user]);

  // Sincronizar estadísticas con el sistema de logros
  useEffect(() => {
    const goalsCompleted = goals.filter(g => g.currentAmount >= g.targetAmount).length;
    achievements.updateStats({
      totalIncomes: incomes.length,
      totalExpenses: expenses.length,
      totalGoals: goals.length,
      goalsCompleted,
      currentBalance: balance,
      creditCardsAdded: creditCards.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incomes.length, expenses.length, goals.length, balance, creditCards.length]);

  // Registrar uso del modo oscuro para el logro dark_mode
  useEffect(() => {
    if (theme === 'dark') {
      achievements.updateStats({ usedDarkMode: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Mostrar página de autenticación si no hay usuario
  if (!user && !authLoading) {
    if (!showAuth) {
      return (
        <LandingPage
          onGetStarted={() => setShowAuth(true)}
          onLogin={() => setShowAuth(true)}
        />
      );
    }
    return <AuthPage />;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-300">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-5 md:p-8">
      {/* Diálogo de migración */}
      {showMigration && (
        <MigrationDialog
          onClose={() => setShowMigration(false)}
          onComplete={(count) => {
            showAlert('success', `${count} transacciones migradas exitosamente`);
            setShowMigration(false);
            refreshTransactions();
          }}
        />
      )}

      {/* Alert global */}
      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message}
          onClose={() => showAlert(null)}
        />
      )}

      {/* Modal de confirmación global */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        onConfirm={() => confirmDialog.onConfirm?.()}
        onCancel={closeConfirm}
      />

      {/* Notificaciones de logros */}
      <AchievementNotifications
        achievements={achievements.newAchievements}
        onRemove={(index) => achievements.removeNewAchievement(index)}
      />

      {/* Container principal */}
      <div className="max-w-7xl mx-auto py-4 sm:py-10 px-2 sm:px-0">
        {/* Header Pastel minimalista */}
        <header className="relative z-50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-3xl sm:rounded-4xl px-4 sm:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6 mb-4 sm:mb-10 shadow-glass border border-white/40 dark:border-white/5">

          {/* Mobile: controles en fila propia arriba */}
          <div className="flex sm:hidden justify-end items-center gap-2 mb-3">
            <CurrencySelector />
            <ThemeToggle />
            <ProfileMenu
              onClearAll={handleClearAllTransactions}
              transactionCount={incomes.length + expenses.length}
            />
          </div>

          {/* Fila título + controles (desktop: side-by-side / mobile: título solo) */}
          <div className="flex justify-between items-center gap-4 mb-5 sm:mb-8">
            <div className="min-w-0 flex-1">
              <h1 className="text-3xl sm:text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                <span className="hidden sm:inline">Calculadora Presupuestaria</span>
                <span className="sm:hidden">Mi Presupuesto</span>
              </h1>
              <div className="flex items-center gap-2 mt-2 ml-0.5">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider animate-fade-in-slide truncate">
                  {quote}
                </p>
                {syncStatus === 'saved' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-fade-in-slide shrink-0">
                    <CheckCircle size={11} weight="fill" className="text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Guardado</span>
                  </span>
                )}
              </div>
            </div>
            {/* Desktop: controles inline con el título */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <CurrencySelector />
              <ThemeToggle />
              <ProfileMenu
                onClearAll={handleClearAllTransactions}
                transactionCount={incomes.length + expenses.length}
              />
            </div>
          </div>

          {/* Fila 2: Tabs + selector de año */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Tabs de navegación Estilo Pastel */}
            <div className="flex gap-1 sm:gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1 sm:p-1.5 rounded-2xl overflow-x-auto">
              {[
                { id: 'resumen',       label: 'Resumen',       Icon: ChartBar },
                { id: 'movimientos',   label: 'Movimientos',   Icon: Receipt },
                { id: 'graficos',      label: 'Gráficos',      Icon: ChartLine },
                { id: 'planificacion', label: 'Planificación', Icon: Target },
                { id: 'herramientas',  label: 'Herramientas',  Icon: Wrench },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-premium'
                      : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:bg-white/20'
                  }`}
                >
                  <tab.Icon size={16} weight={activeTab === tab.id ? 'fill' : 'regular'} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Selector de año + mes */}
            {availableYears.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {/* Pill de años */}
                <div className="flex gap-1.5 bg-slate-100/50 dark:bg-slate-800/80 p-1 rounded-2xl">
                  <button
                    onClick={() => { setSelectedYear(null); setSelectedMonth(null); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                      selectedYear === null
                        ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-premium'
                        : 'text-slate-500 dark:text-slate-400 hover:text-primary-600'
                    }`}
                  >
                    Todo
                  </button>
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => { setSelectedYear(year); setSelectedMonth(null); }}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                        selectedYear === year
                          ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-premium'
                          : 'text-slate-500 dark:text-slate-400 hover:text-primary-600'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>

                {/* Selector de mes — solo visible cuando hay año seleccionado */}
                {selectedYear && availableMonths.length > 0 && (
                  <div className="flex gap-1.5 bg-slate-100/50 dark:bg-slate-800/80 p-1 rounded-2xl">
                    <button
                      onClick={() => setSelectedMonth(null)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                        selectedMonth === null
                          ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-premium'
                          : 'text-slate-500 dark:text-slate-400 hover:text-primary-600'
                      }`}
                    >
                      Todos
                    </button>
                    {availableMonths.map(month => (
                      <button
                        key={month}
                        onClick={() => setSelectedMonth(month)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                          selectedMonth === month
                            ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-premium'
                            : 'text-slate-500 dark:text-slate-400 hover:text-primary-600'
                        }`}
                      >
                        {new Date(2000, month).toLocaleString('es', { month: 'short' })}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Banner bienvenida — una vez por sesión al sincronizar datos desde la nube */}
        {welcomeBanner !== null && (
          <div className="flex items-center gap-3 bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-5 py-3.5 mb-6 backdrop-blur-sm animate-fade-in-slide">
            <CheckCircle size={20} weight="fill" className="text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300 leading-tight">
                Bienvenido de nuevo — tus datos están seguros en la nube
              </p>
              {welcomeBanner > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {welcomeBanner} transacción{welcomeBanner !== 1 ? 'es' : ''} sincronizada{welcomeBanner !== 1 ? 's' : ''} correctamente
                </p>
              )}
            </div>
            <button
              onClick={() => setWelcomeBanner(null)}
              className="ml-auto text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors shrink-0 p-1"
              aria-label="Cerrar"
            >
              <X size={16} weight="bold" />
            </button>
          </div>
        )}

        {/* Main content grid */}
        <div className="space-y-4 sm:space-y-8">
          
          <DailyReminder />

          {/* ── TAB: RESUMEN ──────────────────────────────────────────────── */}
          {activeTab === 'resumen' && <>
            {/* Límite de Gasto Mensual (UX 4) */}
            <GlobalBudgetTracker totalExpenses={filteredTotalExpenses} />

            <Summary
              totalIncome={filteredTotalIncome}
              totalExpenses={filteredTotalExpenses}
              balance={filteredBalance}
              creditCardDebt={creditCards.reduce((sum, card) => sum + card.debt, 0)}
              prevTotalIncome={monthlyComparison.prevTotalIncome}
              prevTotalExpenses={monthlyComparison.prevTotalExpenses}
              prevBalance={monthlyComparison.prevBalance}
            />

            <AIProviderStatus />

            {/* Chat IA conversacional */}
            <AIChat
              transactions={allTransactions}
              totalIncome={filteredTotalIncome}
              totalExpenses={filteredTotalExpenses}
              balance={filteredBalance}
            />

            <AIInsightsPanel
              analysis={aiInsights.analysis}
              loading={aiInsights.analyzing}
              error={aiInsights.analysisError}
              onAnalyze={() => aiInsights.runAnalysis({ totalIncome: filteredTotalIncome, totalExpenses: filteredTotalExpenses, balance: filteredBalance })}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <BalanceDonutChart
                totalIncome={filteredTotalIncome}
                totalExpenses={filteredTotalExpenses}
              />
              
              {/* Fase UX 3: Nuevo gráfico en Chart.js (Pastel) */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl shadow-xl flex flex-col justify-center">
                <h3 className="text-white font-bold mb-4">Análisis de Gastos (Directo)</h3>
                <ExpensePieChart categoryAnalysis={categoryAnalysis} />
              </div>
            </div>

            {/* Fase UX 3: Nuevo gráfico en Chart.js (Barras) */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 p-6 rounded-2xl shadow-xl mt-8">
              <h3 className="text-white font-bold mb-4">Balance General Comparativo</h3>
              <IncomeExpenseBarChart 
                totalIncome={filteredTotalIncome} 
                totalExpenses={filteredTotalExpenses} 
              />
            </div>
          </>}

          {/* ── TAB: GRÁFICOS ─────────────────────────────────────────────── */}
          {activeTab === 'graficos' && (
            <ChartsTab
              filteredIncomes={filteredIncomes}
              filteredExpenses={filteredExpenses}
              filteredTotalIncome={filteredTotalIncome}
              filteredTotalExpenses={filteredTotalExpenses}
              filteredBalance={filteredBalance}
              categoryAnalysis={categoryAnalysis}
            />
          )}

          {/* ── TAB: MOVIMIENTOS ─────────────────────────────────────────── */}
          {activeTab === 'movimientos' && <>
            <BudgetForm
              onAddIncome={handleAddIncome}
              onAddExpense={handleAddExpense}
            />

            <ExpenseList
              incomes={incomes}
              expenses={expenses}
              onRemoveIncome={(id) => openConfirm({
                title: 'Eliminar ingreso',
                message: '\u00bfEst\u00e1s seguro de que deseas eliminar este ingreso?',
                onConfirm: () => { removeIncome(id); closeConfirm(); },
              })}
              onRemoveExpense={(id) => openConfirm({
                title: 'Eliminar gasto',
                message: '\u00bfEst\u00e1s seguro de que deseas eliminar este gasto?',
                onConfirm: () => { removeExpense(id); closeConfirm(); },
              })}
              onUpdateIncome={updateIncome}
              onUpdateExpense={updateExpense}
            />
          </>}

          {/* ── TAB: PLANIFICACIÓN ───────────────────────────────────────────── */}
          {activeTab === 'planificacion' && <>
            <CreditCardManager
              creditCards={creditCards}
              onAddCard={handleAddCard}
              onUpdateDebt={handleUpdateDebt}
              onRemoveCard={handleRemoveCard}
            />

            {/* Presupuestos por categoría */}
            <BudgetManager expenses={filteredExpenses} />

            {/* Transacciones Recurrentes */}
            <RecurringManager
              recurring={recurring}
              onAdd={addRecurring}
              onToggle={toggleRecurring}
              onRemove={removeRecurring}
            />

            <GoalManager
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateProgress={handleUpdateGoalProgress}
              onDeleteGoal={handleDeleteGoal}
              currentBalance={balance}
            />
          </>}

          {/* ── TAB: HERRAMIENTAS ─────────────────────────────────────────── */}
          {activeTab === 'herramientas' && <>
            <GamificationDashboard
              currentLevel={achievements.currentLevel}
              totalPoints={achievements.totalPoints}
              pointsForNext={achievements.pointsForNext}
              levelProgress={achievements.levelProgress}
              currentStreak={achievements.stats.currentStreak}
              longestStreak={achievements.stats.longestStreak}
              unlockedAchievements={achievements.unlockedAchievements}
              isAchievementUnlocked={achievements.isAchievementUnlocked}
            />

            <ExportManager
              incomes={incomes}
              expenses={expenses}
              categoryAnalysis={categoryAnalysis}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              balance={balance}
              onExport={() => achievements.updateStats({ dataExported: true })}
            />

            <ImportManager
              onImport={handleImportTransaction}
              onBulkImport={handleBulkImportTransaction}
            />
          </>}

        </div>

        {/* Banner de instalación PWA si el navegador lo permite */}
        <InstallPWA />

        <AppFooter />
      </div>
    </div>
  );
}

/**
 * App wrapper con AuthProvider y ThemeProvider
 */
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
