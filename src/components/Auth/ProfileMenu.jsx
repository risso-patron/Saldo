import { useState } from 'react'
import { 
  User, 
  Database, 
  SignOut, 
  Info, 
  LinkedinLogo, 
  CaretRight,
  ShieldCheck,
  TrendUp
} from '@phosphor-icons/react'
import { useAuth } from '../../contexts/AuthContext'
import { AccountSettingsModal } from './AccountSettingsModal'

export const ProfileMenu = ({ onClearAll, transactionCount = 0 }) => {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Estados locales para manejo de errores de imagen
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

  if (!user) return null

  // Jerarquía de Avatar: 1. Personalizado (Emoji) > 2. Google (si no hay error) > 3. Iniciales
  const customAvatar = user.user_metadata?.custom_avatar
  const avatarUrl = user.user_metadata?.avatar_url
  const initials = user.user_metadata?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  const renderAvatar = (size = 'small') => {
    // 1. Emoji Personalizado
    if (customAvatar) {
      return (
        <div className={`${size === 'small' ? 'w-9 h-9 text-xl' : 'w-12 h-12 text-2xl'} flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-white/10`}>
          {customAvatar}
        </div>
      )
    }

    // 2. Google Avatar (si no ha fallado)
    if (avatarUrl && !imageError) {
      return (
        <img 
          src={avatarUrl} 
          alt="Profile" 
          onError={() => setImageError(true)}
          className={`${size === 'small' ? 'w-9 h-9' : 'w-12 h-12'} rounded-xl shadow-lg border-2 border-white/50 group-hover:scale-105 transition-transform object-cover`}
        />
      )
    }

    // 3. Iniciales (Fallback)
    return (
      <div className={`${size === 'small' ? 'w-9 h-9' : 'w-12 h-12'} bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg group-hover:scale-105 transition-transform`}>
        {initials}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Botón de Perfil (Trigger) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center space-x-3 px-3 py-2 rounded-2xl bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-500 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-glass"
      >
        {renderAvatar('small')}
        <div className="text-left hidden sm:block">
          <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none mb-1">
            {user.user_metadata?.full_name?.split(' ')[0] || 'Usuario'}
          </p>
          <div className="flex items-center gap-1 opacity-60">
             <ShieldCheck size={10} className="text-emerald-500" weight="fill" />
             <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Verificado</span>
          </div>
        </div>
        <svg
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-500 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu Glassmorphism */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 dark:border-white/5 overflow-hidden z-[100] animate-fade-in-slide">
            
            {/* Cabecera del Menú: Perfil Detallado */}
            <div className="p-5 bg-gradient-to-br from-primary-50/50 to-white dark:from-primary-900/10 dark:to-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                {renderAvatar('large')}
                <div>
                  <p className="font-black text-slate-900 dark:text-white text-sm leading-tight">
                    {user.user_metadata?.full_name || 'Usuario'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Cuerpo del Menú: Secciones */}
            <div className="p-2 space-y-1">
              
              {/* Sección 1: Datos y Gestión */}
              <div className="px-3 py-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2 mb-2 block">Gestión de Datos</span>
                
                {onClearAll && transactionCount > 0 && (
                  <button
                    onClick={handleClear}
                    className="w-full group flex items-center gap-3 px-3 py-2.5 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Database size={18} weight="fill" />
                    </div>
                    <div className="text-left">
                      <span className="block font-bold">Limpiar Historial</span>
                      <span className="text-[10px] opacity-70">{transactionCount} transacciones</span>
                    </div>
                    <CaretRight size={12} className="ml-auto opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                )}

                <button 
                  onClick={() => { setIsSettingsOpen(true); setIsOpen(false); }}
                  className="w-full group flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <User size={18} weight="bold" />
                  </div>
                  <span className="font-bold text-xs uppercase tracking-wider">Ajustes Cuenta</span>
                  <CaretRight size={12} className="ml-auto opacity-40" />
                </button>
              </div>

              {/* Separador */}
              <div className="mx-4 border-t border-slate-100 dark:border-slate-800 my-2" />

              {/* Sección 2: Info & Comunidad */}
              <div className="px-3 py-2">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2 mb-2 block">Acerca de</span>
                
                <a
                  href="https://www.linkedin.com/in/jorge-luis-risso-/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 px-3 py-2.5 text-sm text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-xl transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LinkedinLogo size={18} weight="fill" />
                  </div>
                  <div className="text-left">
                    <span className="block font-bold">Desarrollador (R P)</span>
                    <span className="text-[10px] opacity-70">Conectar en LinkedIn</span>
                  </div>
                </a>

                <div className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-400">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Info size={18} weight="bold" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Versión 2.0.0 Stable</span>
                </div>
              </div>

              {/* Sección 3: Sesión */}
              <div className="p-2 pt-1">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <SignOut size={16} weight="bold" />
                  {loading ? 'Cerrando...' : 'Cerrar Sesión'}
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      {/* MODAL DE AJUSTES */}
      <AccountSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onShowAlert={(type, msg) => {
          // Nota: El alert global se dispara desde el AppContent, 
          // pero como este componente es hijo directo en App.jsx, 
          // necesitamos pasar el alert hacia arriba o usar un contexto.
          // El diseño actual usa el alert del hook useTransactions inyectado vía AppContent.
          console.log(`[Alert] ${type}: ${msg}`);
          // Para este caso, lanzaremos el alert nativo o usaremos un event
          window.dispatchEvent(new CustomEvent('app-alert', { detail: { type, message: msg } }));
        }}
      />
    </div>
  )
}
