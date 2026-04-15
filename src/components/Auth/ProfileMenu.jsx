import { useState } from 'react'
import { 
  User, 
  Database, 
  SignOut, 
  ShieldCheck,
  Receipt,
  Target,
  FileCsv
} from '@phosphor-icons/react'
import { useAuth } from '../../contexts/AuthContext'
import { AccountSettingsModal } from './AccountSettingsModal'

/**
 * ProfileMenu - Menú de usuario con soporte para Sidebar y Versión Móvil
 * @param {string} align - 'right' (default), 'sidebar' (upward), 'center' (mobile)
 * @param {boolean} condensed - Si es true, solo muestra el avatar (mejor para móvil)
 */
export const ProfileMenu = ({ onClearAll, transactionCount = 0, onNavigate, align = 'right', condensed = false }) => {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await signOut()
    setLoading(false)
  }

  const handleClear = () => {
    setIsOpen(false)
    onClearAll?.()
  }

  const handleShortcut = (tabId) => {
    onNavigate?.(tabId)
    setIsOpen(false)
  }

  if (!user) return null

  const isSidebar = align === 'sidebar';

  // Jerarquía de Avatar
  const customAvatar = user.user_metadata?.custom_avatar
  const avatarUrl = user.user_metadata?.avatar_url
  const initials = user.user_metadata?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  const renderAvatar = (size = 'small') => {
    const sizeClasses = {
      small: 'w-10 h-10 text-xl',
      large: 'w-14 h-14 text-2xl'
    };
    
    if (customAvatar) {
      return (
        <div className={`${sizeClasses[size]} flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-white/10`}>
          {customAvatar}
        </div>
      )
    }
    if (avatarUrl && !imageError) {
      return (
        <img 
          src={avatarUrl} 
          alt="Profile" 
          onError={() => setImageError(true)}
          className={`${sizeClasses[size]} rounded-2xl shadow-lg border-2 border-white/50 object-cover`}
        />
      )
    }
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg uppercase`}>
        {initials}
      </div>
    )
  }

  return (
    <div className={`relative ${isSidebar ? 'w-full' : ''}`}>
      {/* Botón de Perfil (Trigger) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center transition-all duration-300 backdrop-blur-xl border border-white/30 dark:border-white/5 shadow-glass ${
          condensed 
            ? 'p-0.5 rounded-2xl bg-transparent border-none' 
            : `space-x-3 px-3 py-2.5 rounded-2xl w-full ${isSidebar ? 'bg-slate-800/40 hover:bg-slate-700/60' : 'bg-white/40 dark:bg-white/5 hover:bg-white/60'}`
        }`}
      >
        {renderAvatar('small')}
        
        {!condensed && (
          <>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-1 truncate">
                {user.user_metadata?.full_name?.split(' ')[0] || 'Usuario'}
              </p>
              <div className="flex items-center gap-1 opacity-60">
                 <ShieldCheck size={10} className="text-emerald-500" weight="fill" />
                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">OK</span>
              </div>
            </div>
            <svg
              className={`w-3 h-3 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-sm sm:bg-transparent" onClick={() => setIsOpen(false)} />
          <div className={`
            fixed sm:absolute z-[120] 
            ${condensed ? 'top-20 inset-x-4 sm:top-full sm:right-0 sm:inset-x-auto sm:mt-3' : isSidebar ? 'bottom-full left-0 mb-4' : 'right-0 mt-3'}
            w-auto sm:w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-fade-in-slide
          `}>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                {renderAvatar('large')}
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
                    {user.user_metadata?.full_name || 'Usuario'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* ATAJOS */}
            <div className="px-4 py-4 bg-white dark:bg-slate-900">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 pl-1">Accesos Rápidos</p>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => handleShortcut('movimientos')} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all group">
                  <Receipt size={22} weight="fill" className="text-emerald-500 mb-1" />
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Gasto</span>
                </button>
                <button onClick={() => handleShortcut('planificacion')} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all group">
                  <Target size={22} weight="fill" className="text-amber-500 mb-1" />
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Metas</span>
                </button>
                <button onClick={() => handleShortcut('herramientas')} className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all group">
                  <FileCsv size={22} weight="fill" className="text-blue-500 mb-1" />
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase">Exportar</span>
                </button>
              </div>
            </div>

            <div className="p-2 pt-0">
              <div className="px-4 py-3 space-y-2">
                <button onClick={() => { setIsSettingsOpen(true); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all font-bold">
                  <User size={18} weight="bold" />
                  <span>Configuración de Cuenta</span>
                </button>
                {onClearAll && transactionCount > 0 && (
                  <button onClick={handleClear} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl transition-all font-bold">
                    <Database size={18} weight="fill" />
                    <span>Eliminar Datos Locales</span>
                  </button>
                )}
              </div>
              
              <div className="p-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button onClick={handleLogout} disabled={loading} className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-[0.2em] shadow-lg">
                  <SignOut size={16} weight="bold" />
                  {loading ? 'Saliendo...' : 'Cerrar Sesión'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <AccountSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onShowAlert={(type, msg) => {
        window.dispatchEvent(new CustomEvent('app-alert', { detail: { type, message: msg } }));
      }} />
    </div>
  )
}
