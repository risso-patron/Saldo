import { MagnifyingGlass } from '@phosphor-icons/react'
import { ThemeToggle } from './Shared/ThemeToggle'
import { ProfileMenu } from './Auth/ProfileMenu'
import { CurrencySelector } from '../features/currency/CurrencySelector'
import BudgetLogo from './Shared/BudgetLogo'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from 'react-i18next'

const TABS = [
  { id: 'resumen',       labelKey: 'nav.home' },
  { id: 'movimientos',   labelKey: 'nav.transactions' },
  { id: 'graficos',      labelKey: 'nav.trends' },
  { id: 'planificacion', labelKey: 'nav.planning' },
  { id: 'herramientas',  labelKey: 'nav.more' },
  { id: 'cuenta',        labelKey: 'nav.account' },
]

/**
 * Cabecera de la app: barra de búsqueda mobile, título, tabs desktop y filtros año/mes.
 * Extraído de AppContent para reducir el tamaño del componente raíz.
 */
export function AppHeader({
  activeTab,
  setActiveTab,
  onOpenOmnibar,
  quote,
  availableYears,
  selectedYear,
  setSelectedYear,
  availableMonths,
  selectedMonth,
  setSelectedMonth,
  onClearAll,
  transactionCount,
}) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const firstName = (user?.user_metadata?.full_name || user?.email || '').split(/[\s@]/)[0]

  return (
    <header className="relative z-[100] bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-3xl sm:rounded-4xl px-4 sm:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6 mb-6 sm:mb-10 shadow-glass border border-white/40 dark:border-white/5">

      {/* Mobile: barra de búsqueda + controles */}
      <div className="flex sm:hidden items-center gap-3 mb-6">
        <button
          onClick={onOpenOmnibar}
          className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 rounded-2xl font-bold text-sm border border-slate-200/50 dark:border-white/5 shadow-inner"
        >
          <MagnifyingGlass size={20} weight="black" />
          <span className="opacity-70">{t('header.search_placeholder')}</span>
        </button>
        <div className="flex items-center gap-2 text-white">
          <div className="scale-90 origin-right"><CurrencySelector /></div>
          <ThemeToggle />
          <ProfileMenu onClearAll={onClearAll} transactionCount={transactionCount} onNavigate={setActiveTab} condensed={true} />
        </div>
      </div>

      {/* Título + controles tablet */}
      <div className="flex justify-between items-center gap-4 mb-4 sm:mb-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <BudgetLogo size={36} />
            <div>
              <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">
                {t('header.greeting', { name: firstName })}
              </p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-tight">
                Saldo
              </h1>
            </div>
          </div>
          <p className="hidden sm:block text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">
            {quote}
          </p>
        </div>
        <div className="hidden sm:flex lg:hidden items-center gap-4 text-white">
          <button onClick={onOpenOmnibar} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500">
            <MagnifyingGlass size={22} weight="bold" />
          </button>
          <CurrencySelector />
          <ThemeToggle />
        </div>
      </div>

      {/* Tabs desktop */}
      <div className="hidden lg:flex w-full overflow-x-auto custom-scrollbar-sidebar pb-2">
        <div className="flex gap-1.5 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl whitespace-nowrap min-w-max">
          {TABS.map(({ id, labelKey }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.1em] transition-all ${
                activeTab === id
                  ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-premium scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Filtros Año / Mes */}
      {availableYears.length > 0 && (
        <div className="flex flex-col gap-2 mt-4 sm:mt-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar-sidebar">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Año</span>
            <div className="flex gap-1 whitespace-nowrap">
              <button
                onClick={() => { setSelectedYear(null); setSelectedMonth(null) }}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${!selectedYear ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Todo
              </button>
              {availableYears.map(y => (
                <button
                  key={y}
                  onClick={() => { setSelectedYear(y); setSelectedMonth(null) }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${selectedYear === y ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {selectedYear && availableMonths.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar-sidebar">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest shrink-0">Mes</span>
              <div className="flex gap-1 whitespace-nowrap">
                <button
                  onClick={() => setSelectedMonth(null)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${selectedMonth === null ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Todo
                </button>
                {availableMonths.map(m => {
                  const label = new Intl.DateTimeFormat('es', { month: 'short' }).format(new Date(selectedYear, m))
                  return (
                    <button
                      key={m}
                      onClick={() => setSelectedMonth(m)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase transition-all ${selectedMonth === m ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
