import { motion } from 'framer-motion'
import { 
  SquaresFour, 
  Receipt, 
  Plus, 
  ChartPieSlice, 
  UserCircle 
} from '@phosphor-icons/react'

/**
 * BottomNav - Barra de navegación móvil (estilo Pipedrive Native)
 * Proporciona acceso ergonómico a las funciones principales.
 */
export const BottomNav = ({ activeTab, onTabSelect, onQuickAction }) => {
  const tabs = [
    { id: 'resumen', label: 'Inicio', icon: SquaresFour },
    { id: 'movimientos', label: 'Gastos', icon: Receipt },
    { id: 'quick', label: 'Añadir', icon: Plus, isPrimary: true },
    { id: 'graficos', label: 'Tendencias', icon: ChartPieSlice },
    { id: 'cuenta', label: 'Cuenta', icon: UserCircle }
  ]

  return (
    <nav className="lg:hidden fixed bottom-6 inset-x-4 z-[200]">
      {/* Contenedor Principal con Glassmorphism extremo */}
      <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/40 dark:border-white/5 rounded-3xl h-20 flex items-center justify-around px-4">
        
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          if (tab.isPrimary) {
            return (
              <div key={tab.id} className="relative -top-3">
                 <motion.button
                   whileHover={{ scale: 1.1 }}
                   whileTap={{ scale: 0.9 }}
                   onClick={onQuickAction}
                   className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] flex items-center justify-center border-4 border-slate-50 dark:border-slate-900"
                 >
                   <Icon size={32} weight="bold" />
                 </motion.button>
              </div>
            )
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabSelect(tab.id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 relative h-full"
            >
              <div className={`
                p-2 rounded-xl transition-all duration-300
                ${isActive ? 'bg-primary-500/10 text-primary-500' : 'text-slate-400 dark:text-slate-500'}
              `}>
                <Icon size={24} weight={isActive ? "fill" : "regular"} />
              </div>
              <span className={`
                text-[9px] font-black uppercase tracking-widest leading-none
                ${isActive ? 'text-primary-600' : 'text-slate-400 dark:text-slate-600'}
              `}>
                {tab.label}
              </span>

              {/* Indicador de pestaña activa */}
              {isActive && (
                <motion.div 
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-1 w-1 h-1 bg-primary-500 rounded-full"
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
