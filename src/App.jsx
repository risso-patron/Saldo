import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChartBar, ChartLine, Receipt, Target, Wrench } from '@phosphor-icons/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTransactions } from './hooks/useTransactions';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEYS, STRATEGIC_MESSAGES } from './constants/categories';
import { BudgetForm } from './components/BudgetForm';
import { ExpenseList } from './components/ExpenseList';
import { Summary } from './components/Summary';
import { calculateTotal, calculateBalance, filterByYear, filterByMonth, getAvailableYears } from './utils/calculations';
import { Alert } from './components/Shared/Alert';
import { ConfirmDialog } from './components/Shared/ConfirmDialog';
import { ThemeToggle } from './components/Shared/ThemeToggle';
import { ProfileMenu } from './components/Auth/ProfileMenu';
import MigrationDialog from './components/MigrationDialog';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import { hasPendingMigration } from './utils/dataMigration';
import { CreditCardManager } from './components/CreditCard/CreditCardManager';
// Nuevos gráficos avanzados
import { BalanceDonutChart } from './components/Charts/BalanceDonutChart';
import { TrendLineChart } from './components/Charts/TrendLineChart';
import { CategoryBarChart } from './components/Charts/CategoryBarChart';
import { ComparativeChart } from './components/Charts/ComparativeChart';
import { MonthlyCashFlowChart } from './components/Charts/MonthlyCashFlowChart';
import { SpendingByDayChart } from './components/Charts/SpendingByDayChart';
import { TopMerchantsChart } from './components/Charts/TopMerchantsChart';
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

/**
 * Componente principal de la aplicación con autenticación
 */
function AppContent() {
  const { user, loading: authLoading } = useAuth();
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
  } = useTransactions();

  // Hook de gamificación
  const achievements = useAchievements();

  // FEATURE 1: Transacciones Recurrentes — procesa vencidos al montar
  const { recurring, addRecurring, toggleRecurring, removeRecurring } = useRecurring(addIncome, addExpense);

  // Combinar todas las transacciones para IA (memoizado — evita objetos nuevos en cada render)
  const allTransactions = useMemo(() => [
    ...incomes.map(income => ({ ...income, type: 'income' })),
    ...expenses.map(expense => ({ ...expense, type: 'expense' }))
  ], [incomes, expenses]);

  // Hook de IA con multi-proveedores (Gemini, Groq, Claude, Ollama)
  const aiInsights = useAIInsights(allTransactions);

  // ── Tabs y filtro de período persistentes (Fase UX 1) ───────────────────
  const [activeTab, setActiveTab] = useLocalStorage('budgetrp_ui_activeTab', 'resumen');
  const [selectedYear, setSelectedYear] = useLocalStorage('budgetrp_ui_selectedYear', null);

  const availableYears = useMemo(() => 
    getAvailableYears(incomes, expenses), 
  [incomes, expenses]);

  const filteredIncomes = useMemo(() => 
    filterByYear(incomes, selectedYear), 
  [incomes, selectedYear]);

  const filteredExpenses = useMemo(() => 
    filterByYear(expenses, selectedYear), 
  [expenses, selectedYear]);

  const filteredTotalIncome   = useMemo(() => calculateTotal(filteredIncomes), [filteredIncomes]);
  const filteredTotalExpenses = useMemo(() => calculateTotal(filteredExpenses), [filteredExpenses]);
  const filteredBalance = useMemo(() => calculateBalance(filteredTotalIncome, filteredTotalExpenses), [filteredTotalIncome, filteredTotalExpenses]);

  // ── Totales del mes actual y anterior para deltas en Summary ────────────
  const monthlyComparison = useMemo(() => {
    const now = new Date();
    const curYear  = now.getFullYear();
    const curMonth = now.getMonth();
    const prevYear  = curMonth === 0 ? curYear - 1 : curYear;
    const prevMonth = curMonth === 0 ? 11 : curMonth - 1;

    const prevIncomes  = filterByMonth(incomes, prevYear, prevMonth);
    const prevExpenses = filterByMonth(expenses, prevYear, prevMonth);

    const prevTotalIncome   = calculateTotal(prevIncomes);
    const prevTotalExpenses = calculateTotal(prevExpenses);
    const prevBalance = calculateBalance(prevTotalIncome, prevTotalExpenses);

    return { prevTotalIncome, prevTotalExpenses, prevBalance };
  }, [incomes, expenses]);

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

  // HOOK DE IA - Combinar todas las transacciones
  // TEMPORALMENTE DESHABILITADO - Necesita VITE_ANTHROPIC_API_KEY
  /*+
  const allTransactions = useMemo(() => {
    return [
      ...incomes.map(t => ({ ...t, type: 'income' })),
      ...expenses.map(t => ({ ...t, type: 'expense' }))
    ];
  }, [incomes, expenses]);
  */

  // TEMPORALMENTE DESHABILITADO - Necesita VITE_ANTHROPIC_API_KEY
  // const aiInsights = useAIInsights(allTransactions, user?.id);

  // ✅ PREPARAR DATOS MENSUALES PARA PREDICCIONES
  /* TEMPORALMENTE DESHABILITADO - Necesita VITE_ANTHROPIC_API_KEY
  const monthlyData = useMemo(() => {
    const months = {};
    
    [...incomes, ...expenses].forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income' || incomes.includes(transaction)) {
        months[monthKey].income += transaction.amount;
      } else {
        months[monthKey].expense += transaction.amount;
      }
    });
    
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
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
      <div className="max-w-7xl mx-auto py-10">
        {/* Header Pastel minimalista */}
        <header className="relative z-50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-4xl px-8 pt-8 pb-6 mb-10 shadow-glass border border-white/40 dark:border-white/5">

          {/* Fila 1: Título + controles */}
          <div className="flex justify-between items-start gap-4 mb-8">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                <span className="hidden sm:inline">Calculadora Presupuestaria</span>
                <span className="sm:hidden text-3xl leading-none">Mi Presupuesto</span>
              </h1>
              <div className="h-6 flex items-center mt-2 ml-1">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider animate-fade-in-slide">
                  {quote}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
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
            <div className="flex gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl">
              {[
                { id: 'resumen',       label: 'Resumen',       Icon: ChartBar },
                { id: 'graficos',      label: 'Gráficos',      Icon: ChartLine },
                { id: 'movimientos',   label: 'Movimientos',   Icon: Receipt },
                { id: 'planificacion', label: 'Planificación', Icon: Target },
                { id: 'herramientas',  label: 'Herramientas',  Icon: Wrench },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-premium'
                      : 'text-slate-500 dark:text-slate-400 hover:text-primary-600 hover:bg-white/20'
                  }`}
                >
                  <tab.Icon size={16} weight={activeTab === tab.id ? 'fill' : 'regular'} />
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Selector de año Pastel */}
            {availableYears.length > 0 && (
              <div className="flex gap-1.5 bg-slate-100/50 dark:bg-slate-800/80 p-1 rounded-2xl">
                <button
                  onClick={() => setSelectedYear(null)}
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
                    onClick={() => setSelectedYear(year)}
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
            )}
          </div>
        </header>

        {/* Main content grid */}
        <div className="space-y-8">
          
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
          {activeTab === 'graficos' && <>
            <TrendLineChart
              incomes={filteredIncomes}
              expenses={filteredExpenses}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CategoryBarChart
                categoryAnalysis={categoryAnalysis}
                topN={5}
              />
              <ComparativeChart
                incomes={filteredIncomes}
                expenses={filteredExpenses}
              />
            </div>

            <MonthlyCashFlowChart
              incomes={filteredIncomes}
              expenses={filteredExpenses}
              months={6}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SpendingByDayChart expenses={filteredExpenses} />
              <TopMerchantsChart expenses={filteredExpenses} topN={8} />
            </div>
          </>}

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
            />

            <ImportManager
              onImport={handleImportTransaction}
              onBulkImport={handleBulkImportTransaction}
            />
          </>}

        </div>

        {/* Banner de instalación PWA si el navegador lo permite */}
        <InstallPWA />

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>
            © 2025 Budget Calculator | Desarrollado por{' '}
            <a 
              href="https://www.linkedin.com/in/jorge-luis-risso-/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors underline font-bold"
            >
              R P
            </a>
          </p>
          <p className="mt-2 text-xs opacity-70">
            <a href="/privacy.html" className="hover:text-primary-600 transition-colors">Política de Privacidad</a>
            {' · '}
            <a href="/terms.html" className="hover:text-primary-600 transition-colors">Términos de Servicio</a>
          </p>
        </footer>
      </div>
    </div>
  );
}

/**
 * App wrapper con AuthProvider y ThemeProvider
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <AppContent />
        </CurrencyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
