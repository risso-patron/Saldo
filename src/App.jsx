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
import { useAchievements } from './hooks/gamification/useAchievements';


/**
 * Componente principal de la aplicación con autenticación
 */
function AppContent() {
  const { user, loading: authLoading } = useAuth();
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
    <div className="min-h-screen p-5 md:p-8">
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
        <header className="bg-gradient-dark dark:bg-gray-800 text-white rounded-2xl px-6 pt-6 pb-4 mb-8 shadow-xl">
          <div className="flex justify-between items-start gap-4">
            {/* Título + tabs */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl md:text-4xl font-light mb-1 truncate">
                Calculadora de Presupuesto Personal
              </h1>
              <p className="text-sm opacity-70 mb-4">
                Gestiona tus finanzas personales de manera inteligente con IA
              </p>
              {/* Tabs de navegación */}
              <div className="flex gap-1 bg-white/10 rounded-xl p-1 w-fit">
                {[
                  { id: 'resumen',      label: 'Resumen',      Icon: ChartBar },
                  { id: 'graficos',     label: 'Gráficos',     Icon: ChartLine },
                  { id: 'herramientas', label: 'Herramientas', Icon: Wrench },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-indigo-700 shadow-md'
                        : 'text-white/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <tab.Icon size={15} weight={activeTab === tab.id ? 'fill' : 'regular'} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Controles derechos */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <ProfileMenu />
              </div>
              {/* Selector de año */}
              {availableYears.length > 0 && (
                <div className="flex gap-1 bg-white/10 rounded-xl p-1">
                  <button
                    onClick={() => setSelectedYear(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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

            {(incomes.length > 0 || expenses.length > 0) && (
              <div className="flex justify-center">
                <button
                  onClick={handleClearAllTransactions}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg 
                    shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 
                    transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  🧹 Limpiar Todas las Transacciones ({incomes.length + expenses.length})
                </button>
              </div>
            )}

            <CreditCardManager
              creditCards={creditCards}
              onAddCard={handleAddCard}
              onUpdateDebt={handleUpdateDebt}
              onRemoveCard={handleRemoveCard}
            />

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
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
