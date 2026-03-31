// Categorías de gastos
export const EXPENSE_CATEGORIES = [
  { value: 'Vivienda', label: 'Vivienda', icon: '' },
  { value: 'Alimentación', label: 'Alimentación', icon: '' },
  { value: 'Transporte', label: 'Transporte', icon: '' },
  { value: 'Entretenimiento', label: 'Entretenimiento', icon: '' },
  { value: 'Salud', label: 'Salud', icon: '' },
  { value: 'Educación', label: 'Educación', icon: '' },
  { value: 'Servicios', label: 'Servicios', icon: '' },
  { value: 'Otros', label: 'Otros', icon: '' },
];

// Tipos de transacciones
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

// Filtros disponibles
export const FILTER_OPTIONS = {
  ALL: 'all',
  INCOME: 'income',
  EXPENSE: 'expense',
};

// Keys para localStorage
export const STORAGE_KEYS = {
  INCOMES: 'budget_calculator_incomes',
  EXPENSES: 'budget_calculator_expenses',
  CREDIT_CARDS: 'budget_calculator_credit_cards',
  GOALS: 'budget_calculator_goals',
};

// Mensajes de la aplicación
export const MESSAGES = {
  SUCCESS: {
    INCOME_ADDED: 'Ingreso agregado exitosamente',
    EXPENSE_ADDED: 'Gasto agregado exitosamente',
    ITEM_DELETED: 'Elemento eliminado',
  },
  ERROR: {
    INVALID_AMOUNT: 'Por favor ingresa una cantidad válida mayor a 0',
    INVALID_DESCRIPTION: 'Por favor ingresa una descripción',
    GENERIC: 'Ocurrió un error. Por favor intenta nuevamente',
  },
  CONFIRM: {
    DELETE: '¿Estás seguro de que deseas eliminar este elemento?',
  },
  EMPTY: {
    NO_INCOMES: 'Aún no has agregado ingresos',
    NO_EXPENSES: 'Aún no has agregado gastos',
    NO_TRANSACTIONS: 'Sin transacciones registradas',
    NO_CATEGORIES: 'Sin gastos por categoría',
  },
};

// Mensajes Estratégicos de Resiliencia
export const STRATEGIC_MESSAGES = {
  BADGES: {
    CRITICAL: { label: 'Consumo de Ahorros', color: 'text-rose-500', bgColor: 'bg-rose-50' },
    BASIC: { label: 'Construyendo Resiliencia', color: 'text-amber-500', bgColor: 'bg-amber-50' },
    SOLID: { label: 'Vía de la Libertad', color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    PRO: { label: 'Independencia Financiera', color: 'text-indigo-500', bgColor: 'bg-indigo-50' },
  },
  MOTIVATIONAL: [
    '¡Excelente! Has fortalecido tu resiliencia hoy.',
    'Tu libertad financiera ha crecido un paso más.',
    'Bien hecho. Priorizar tu ahorro es respetarte a ti mismo.',
    'Cada centavo ahorrado es una vacuna contra la incertidumbre.',
    'Estás construyendo el futuro que te mereces.',
  ],
  DEFINITIONS: {
    SAVINGS_RATE: 'Tu Índice de Libertad: El porcentaje de tus ingresos que conservas para tu futuro.',
    BALANCE: 'Tu Respaldo: El capital disponible para tus sueños y emergencias.',
  },
  QUOTES: [
    'Tu presupuesto es el mapa hacia tu libertad.',
    'Ahorrar es comprar tu tiempo del futuro.',
    'La resiliencia se construye un centavo a la vez.',
    'Controla tu dinero o él te controlará a ti.',
    'La verdadera riqueza es la libertad de elegir.',
  ]
};
