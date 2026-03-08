import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChartBar, ChartLine, Wrench } from '@phosphor-icons/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTransactions } from './hooks/useTransactions';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEYS } from './constants/categories';
import { TransactionForm } from './components/Transactions/TransactionForm';
import { TransactionList } from './components/Transactions/TransactionList';
import { BalanceCard } from './components/Dashboard/BalanceCard';
import { CategoryChart } from './components/Dashboard/CategoryChart';
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
// COMPONENTES DE IA - HABILITADOS CON GEMINI GRATIS
import { AIInsightsPanel, AIAlerts, PredictiveChart, AIProviderStatus } from './components/AI';
import { useAIInsights } from './hooks/useAIInsightsMulti';
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
// FEATURE 3: Espacio Compartido / Sync en tiempo real
import { useSharedSpace } from './hooks/useSharedSpace'
import { SharedSpaceManager } from './features/sharing/SharedSpaceManager'

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

  // FEATURE 3: Espacio Compartido con Supabase Realtime
  const sharedSpace = useSharedSpace();

  // Combinar todas las transacciones para IA (memoizado — evita objetos nuevos en cada render)
  const allTransactions = useMemo(() => [
    ...incomes.map(income => ({ ...income, type: 'income' })),
    ...expenses.map(expense => ({ ...expense, type: 'expense' }))
  ], [incomes, expenses]);

  // Hook de IA con multi-proveedores (Gemini, Groq, Claude, Ollama)
  const aiInsights = useAIInsights(allTransactions);

  // ── Tabs y filtro de período ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('resumen');
  const [selectedYear, setSelectedYear] = useState(null);

  const availableYears = useMemo(() => {
    const years = new Set();
    [...incomes, ...expenses].forEach(t => {
      if (t.date) years.add(new Date(t.date + 'T12:00:00').getFullYear());
    });
    return [...years].sort((a, b) => b - a);
  }, [incomes, expenses]);

  const filteredIncomes = useMemo(() =>
    selectedYear
      ? incomes.filter(t => t.date && new Date(t.date + 'T12:00:00').getFullYear() === selectedYear)
      : incomes,
  [incomes, selectedYear]);

  const filteredExpenses = useMemo(() =>
    selectedYear
      ? expenses.filter(t => t.date && new Date(t.date + 'T12:00:00').getFullYear() === selectedYear)
      : expenses,
  [expenses, selectedYear]);

  const filteredTotalIncome   = useMemo(() => filteredIncomes.reduce((s, t)  => s + t.amount, 0), [filteredIncomes]);
  const filteredTotalExpenses = useMemo(() => filteredExpenses.reduce((s, t) => s + t.amount, 0), [filteredExpenses]);
  const filteredBalance = filteredTotalIncome - filteredTotalExpenses;

  // Datos para sparklines — últimos 6 meses con actividad real
  const sparklineData = useMemo(() => {
    // Recopilar todos los meses que tienen al menos una transacción
    const monthSet = new Set();
    [...filteredIncomes, ...filteredExpenses].forEach(t => {
      if (t.date) monthSet.add(t.date.substring(0, 7));
    });

    // Tomar los últimos 6 meses con datos, ordenados
    const activeMonths = [...monthSet].sort().slice(-6);

    if (activeMonths.length === 0) return [];

    const months = {};
    activeMonths.forEach(key => {
      months[key] = { mes: key, ingresos: 0, gastos: 0 };
    });

    filteredIncomes.forEach(t => {
      const key = t.date?.substring(0, 7);
      if (months[key]) months[key].ingresos += t.amount;
    });
    filteredExpenses.forEach(t => {
      const key = t.date?.substring(0, 7);
      if (months[key]) months[key].gastos += t.amount;
    });

    return Object.values(months);
  }, [filteredIncomes, filteredExpenses]);

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
          <p className="text-gray-600">Cargando...</p>
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
      <div className="max-w-7xl mx-auto">
        {/* Header con Profile Menu */}
        <header className="bg-gradient-dark dark:bg-gray-800 text-white rounded-2xl px-4 sm:px-6 pt-5 pb-4 mb-6 sm:mb-8 shadow-xl">

          {/* Fila 1: Título + controles */}
          <div className="flex justify-between items-start gap-3 mb-4">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-4xl font-light leading-tight">
                <span className="hidden sm:inline">Calculadora de Presupuesto Personal</span>
                <span className="sm:hidden">Presupuesto Personal</span>
              </h1>
              <p className="hidden sm:block text-sm opacity-70 mt-0.5">
                Gestiona tus finanzas personales de manera inteligente con IA
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
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
            {/* Tabs de navegación */}
            <div className="flex gap-1 bg-white/10 rounded-xl p-1">
              {[
                { id: 'resumen',      label: 'Resumen',      Icon: ChartBar },
                { id: 'graficos',     label: 'Gráficos',     Icon: ChartLine },
                { id: 'herramientas', label: 'Herramientas', Icon: Wrench },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-indigo-700 shadow-md'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.Icon size={14} weight={activeTab === tab.id ? 'fill' : 'regular'} />
                  <span className="hidden xs:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Selector de año */}
            {availableYears.length > 0 && (
              <div className="flex gap-1 bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setSelectedYear(null)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedYear === null
                      ? 'bg-white text-indigo-700 shadow'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Todo
                </button>
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedYear === year
                        ? 'bg-white text-indigo-700 shadow'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
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

          {/* ── TAB: RESUMEN ──────────────────────────────────────────────── */}
          {activeTab === 'resumen' && <>
            <BalanceCard
              totalIncome={filteredTotalIncome}
              totalExpenses={filteredTotalExpenses}
              balance={filteredBalance}
              creditCardDebt={creditCards.reduce((sum, card) => sum + card.debt, 0)}
              sparklineData={sparklineData}
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
              <CategoryChart expenses={filteredExpenses} />
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

          {/* ── TAB: HERRAMIENTAS ─────────────────────────────────────────── */}
          {activeTab === 'herramientas' && <>
            <TransactionForm
              onAddIncome={handleAddIncome}
              onAddExpense={handleAddExpense}
            />

            <TransactionList
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



            <CreditCardManager
              creditCards={creditCards}
              onAddCard={handleAddCard}
              onUpdateDebt={handleUpdateDebt}
              onRemoveCard={handleRemoveCard}
            />

            {/* Presupuestos por categoría */}
            <BudgetManager expenses={filteredExpenses} />

            {/* FEATURE 1: Transacciones Recurrentes */}
            <RecurringManager
              recurring={recurring}
              onAdd={addRecurring}
              onToggle={toggleRecurring}
              onRemove={removeRecurring}
            />

            {/* FEATURE 3: Presupuesto Compartido en tiempo real */}
            {user && (
              <SharedSpaceManager
                space={sharedSpace.space}
                members={sharedSpace.members}
                sharedTransactions={sharedSpace.sharedTransactions}
                loading={sharedSpace.loading}
                actionLoading={sharedSpace.actionLoading}
                error={sharedSpace.error}
                onCreateSpace={sharedSpace.createSpace}
                onJoinSpace={sharedSpace.joinSpace}
                onLeaveSpace={sharedSpace.leaveSpace}
                onAddTransaction={sharedSpace.addSharedTransaction}
                onRemoveTransaction={sharedSpace.removeSharedTransaction}
                currentUser={user}
              />
            )}

            <GoalManager
              goals={goals}
              onAddGoal={handleAddGoal}
              onUpdateProgress={handleUpdateGoalProgress}
              onDeleteGoal={handleDeleteGoal}
              currentBalance={balance}
            />

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

        {/* Footer */}
        <footer className="mt-12 text-center text-white/80 text-sm">
          <p>
            © 2025 Budget Calculator | Desarrollado por{' '}
            <a 
              href="https://www.linkedin.com/in/jorge-luis-risso-/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              R P
            </a>
          </p>
          <p className="mt-2 text-xs text-white/50">
            <a href="/privacy.html" className="hover:text-white/80 transition-colors">Política de Privacidad</a>
            {' · '}
            <a href="/terms.html" className="hover:text-white/80 transition-colors">Términos de Servicio</a>
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
