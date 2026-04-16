import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { 
  User, 
  ShieldCheck, 
  X, 
  Check, 
  Lock, 
  IdentificationCard,
  Envelope,
  Info,
  Image as ImageIcon,
  Coffee,
  Article,
  Headset
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import BudgetLogo from '../Shared/BudgetLogo'

// Selección curada de emojis para avatares Premium
const AVATAR_OPTIONS = [
  '🦁', '🐯', '🐼', '🦊', '🐨', '🦉', 
  '🦋', '🦄', '🐲', '🚀', '💎', '🔥',
  '🌙', '🌈', '⚡', '🍀'
]

export const AccountSettingsModal = ({ isOpen, onClose, onShowAlert }) => {
  const { user, updateProfile, updatePassword } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  
  // States for Profile Form
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '')
  const [selectedAvatar, setSelectedAvatar] = useState(user?.user_metadata?.custom_avatar || null)
  const [imageError, setImageError] = useState(false)

  // Reset states when modal closes/opens
  useEffect(() => {
    if (isOpen) {
      setFullName(user?.user_metadata?.full_name || '')
      setSelectedAvatar(user?.user_metadata?.custom_avatar || null)
      setImageError(false)
    }
  }, [isOpen, user])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await updateProfile({ 
      fullName, 
      customAvatar: selectedAvatar 
    })
    setLoading(false)
    
    if (error) {
      onShowAlert('error', `Error al actualizar perfil: ${error}`)
    } else {
      onShowAlert('success', '¡Perfil actualizado con éxito!')
    }
  }

  // States for Security Form
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleUpdateSecurity = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      onShowAlert('error', 'Las contraseñas no coinciden')
      return
    }
    
    setLoading(true)
    const { error } = await updatePassword(newPassword)
    setLoading(false)
    
    if (error) {
      onShowAlert('error', `Error al actualizar contraseña: ${error}`)
    } else {
      onShowAlert('success', '¡Contraseña actualizada con éxito!')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  if (!isOpen) return null

  // Lógica de visualización del avatar actual en el modal
  const renderAvatarPreview = () => {
    // 1. Si hay un avatar personalizado (emoji) elegido
    if (selectedAvatar && AVATAR_OPTIONS.includes(selectedAvatar)) {
      return (
        <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl shadow-xl ring-4 ring-white dark:ring-slate-900 border border-slate-200 dark:border-white/10 animate-bounce-subtle">
          {selectedAvatar}
        </div>
      )
    }

    // 2. Si no hay personalizado, intentar Google Avatar (si no ha dado error)
    if (user?.user_metadata?.avatar_url && !imageError) {
      return (
        <img 
          src={user.user_metadata.avatar_url} 
          alt="Avatar" 
          onError={() => setImageError(true)}
          className="w-20 h-20 rounded-[2rem] shadow-xl ring-4 ring-white dark:ring-slate-900 object-cover border border-slate-200 dark:border-white/10"
        />
      )
    }

    // 3. Fallback final: Iniciales
    return (
      <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-black shadow-xl ring-4 ring-white dark:ring-slate-900 border border-white/20">
        {user?.email?.charAt(0).toUpperCase()}
      </div>
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[150] overflow-y-auto p-4">
      {/* Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
      />

      {/* Centering wrapper */}
      <div className="flex min-h-full items-center justify-center py-12">
        {/* Modal Container */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 dark:border-white/5 overflow-hidden flex flex-col md:flex-row min-h-[550px] max-h-[90vh]"
        >
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-950 p-8 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <IdentificationCard size={24} weight="light" className="text-primary-500" />
            </div>
            <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Ajustes</h2>
          </div>

          <nav className="space-y-2 flex-1">
            {[
              { id: 'profile', label: 'Mi Perfil', icon: User },
              { id: 'security', label: 'Seguridad', icon: ShieldCheck },
              { id: 'soporte', label: 'Soporte', icon: Headset },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-premium' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50 dark:hover:bg-slate-900/50'
                }`}
              >
                <tab.icon size={20} weight={activeTab === tab.id ? 'fill' : 'bold'} />
                {tab.label}
              </button>
            ))}
          </nav>

          <footer className="mt-auto pt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-50">
            Versión 2.0.0 Stable
          </footer>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 text-slate-300 hover:text-slate-500 dark:hover:text-white transition-colors p-2"
          >
            <X size={24} weight="bold" />
          </button>

          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                className="space-y-10"
              >
                <div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tighter">Tu Identidad</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Personaliza cómo te ves en la app.</p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  {/* Hero Avatar Selection Area */}
                  <div className="flex flex-col md:flex-row items-center gap-10">
                    {/* Preview */}
                    <div className="flex flex-col items-center">
                       {renderAvatarPreview()}
                    </div>

                    {/* Galería de Emojis */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-primary-500" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Galería de Iconos Premium</span>
                      </div>
                      <div className="grid grid-cols-8 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                        {/* Botón para resetear a Google o Iniciales */}
                        <button
                          type="button"
                          onClick={() => setSelectedAvatar(null)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs transition-all ${!selectedAvatar ? 'bg-primary-500 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        >
                          <User weight="bold" />
                        </button>

                        {AVATAR_OPTIONS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setSelectedAvatar(emoji)}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${selectedAvatar === emoji ? 'bg-primary-500 shadow-lg scale-110' : 'hover:bg-white dark:hover:bg-slate-800 hover:scale-105'}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Nombre Completo</label>
                      <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                          <IdentificationCard size={22} />
                        </div>
                        <input 
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-14 pr-6 py-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-primary-400 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-800 dark:text-white font-bold text-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 opacity-60">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Email (No ajustable)</label>
                      <div className="relative">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Envelope size={22} />
                        </div>
                        <input 
                          type="email"
                          value={user?.email}
                          readOnly
                          className="w-full pl-14 pr-6 py-5 rounded-3xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent cursor-not-allowed outline-none text-slate-500 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 rounded-3xl bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-primary-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check size={24} weight="bold" />
                        Confirmar Identidad
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tighter">Zona de Seguridad</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Protección de acceso y privacidad.</p>
                </div>

                <form onSubmit={handleUpdateSecurity} className="space-y-6">
                  {/* Password Inputs... Same logic but styled */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Nueva Contraseña</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock size={22} />
                      </div>
                      <input 
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-primary-400 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-800 dark:text-white font-bold"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2">Repetir Contraseña</label>
                    <div className="relative">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock size={22} />
                      </div>
                      <input 
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 rounded-3xl bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-primary-400 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none text-slate-800 dark:text-white font-bold"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading || !newPassword}
                    className="w-full py-5 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-3 border-slate-500 border-t-slate-900 dark:border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck size={24} weight="bold" />
                        Actualizar Clave
                      </>
                    )}
                  </button>
                </form>

                <div className="p-5 rounded-[2rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 flex gap-4">
                  <div className="text-amber-500 shrink-0">
                    <Info size={24} weight="fill" />
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-200 font-bold leading-relaxed uppercase tracking-tight">
                    Info: Si usas Google OAuth, tu contraseña se gestiona en Google Account. No es necesario cambiarla aquí a menos que desees habilitar el inicio con email directo.
                  </p>
                </div>
              </motion.div>
            )}
            {activeTab === 'soporte' && (
              <motion.div
                key="soporte"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tighter">Soporte</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Información de la app y recursos de ayuda.</p>
                </div>

                {/* Sobre la app */}
                <div className="flex flex-col items-center gap-3 py-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <BudgetLogo size={26} />
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                      Saldo
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Gestión Inteligente de Finanzas Personales
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center max-w-xs leading-relaxed">
                    &ldquo;La construí porque yo también quería entender a dónde iba mi plata cada mes.&rdquo;
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-slate-400">
                    Hecho con{' '}
                    <Coffee size={13} weight="fill" className="text-amber-400" />
                    {' '}por{' '}
                    <a
                      href="https://www.risso-patron.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-purple-600 dark:text-purple-400 hover:underline uppercase tracking-tight"
                    >
                      Luis Risso Patrón
                    </a>
                  </p>
                </div>

                {/* Privacidad */}
                <div className="flex items-start gap-4 p-5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-3xl">
                  <ShieldCheck size={24} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tight mb-1">Privacidad Absoluta</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                      Tus datos bancarios viven encriptados 100% en tu dispositivo. Nada sale a la nube.
                    </p>
                  </div>
                </div>

                {/* Documentación */}
                <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 rounded-3xl">
                  <Article size={24} weight="bold" className="text-slate-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight mb-2">Legal</p>
                    <div className="flex flex-col gap-1.5 text-xs font-bold">
                      <a href="/privacy.html" target="_blank" rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:underline">
                        Política de Privacidad →
                      </a>
                      <a href="/terms.html" target="_blank" rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:underline">
                        Términos de Servicio →
                      </a>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      </div>
    </div>,
    document.body
  )
}
