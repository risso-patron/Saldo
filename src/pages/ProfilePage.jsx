import { useState } from 'react'
import {
  Bell, Robot, Moon, Sun, Question, SignOut,
  Diamond, CaretRight, Gear, Export, UserCircle
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { AccountSettingsModal } from '../components/Auth/AccountSettingsModal'
import { LanguageSelector } from '../components/Shared/LanguageSelector';
import { PricingPlans } from '../components/Subscription/PricingPlans';
const formatAmount = (n) => {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${Math.round(n).toLocaleString('es')}`
}

export const ProfilePage = ({
  filteredTotalExpenses = 0,
  totalTransactions = 0,
  currentStreak = 0,
  categoryCount = 0,
  onNavigate,
  onShowAlert,
}) => {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showPricing, setShowPricing] = useState(false)

  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'
  const email = user?.email || ''
  const avatar = user?.user_metadata?.custom_avatar

  const renderAvatar = () => {
    // Emoji avatar personalizado
    if (avatar && avatar.length <= 2) {
      return (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-md ring-4 ring-white dark:ring-slate-900">
          {avatar}
        </div>
      )
    }
    // Google / OAuth photo
    const photoUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
    if (photoUrl) {
      return (
        <img
          src={photoUrl}
          alt={fullName}
          className="w-16 h-16 rounded-2xl object-cover shadow-md ring-4 ring-white dark:ring-slate-900"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
        />
      )
    }
    // Initials fallback
    const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    return (
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md ring-4 ring-white dark:ring-slate-900">
        {initials}
      </div>
    )
  }

  const stats = [
    { label: t('profile.spent'), value: formatAmount(filteredTotalExpenses) },
    { label: t('profile.movements'), value: String(totalTransactions) },
    { label: t('profile.streak'), value: `${currentStreak}🔥` },
    { label: t('profile.categories'), value: String(categoryCount) },
  ]

  const menuItems = [
    {
      icon: Bell,
      label: t('profile.notifications'),
      sub: t('profile.notifications_sub'),
      action: null,
    },
    {
      icon: Export,
      label: t('profile.export'),
      sub: t('profile.export_sub'),
      action: () => onNavigate?.('herramientas'),
    },
    {
      icon: Robot,
      label: t('profile.ai_config'),
      sub: t('profile.ai_config_sub'),
      action: () => onNavigate?.('herramientas'),
    },
    {
      icon: theme === 'dark' ? Sun : Moon,
      label: theme === 'dark' ? t('profile.light_mode') : t('profile.dark_mode'),
      sub: theme === 'dark' ? t('profile.light_mode_sub') : t('profile.dark_mode_sub'),
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    },
    {
      icon: Gear,
      label: t('profile.account_settings'),
      sub: t('profile.account_settings_sub'),
      action: () => setIsSettingsOpen(true),
    },
    {
      icon: Question,
      label: t('profile.help'),
      sub: t('profile.help_sub'),
      action: null,
    },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="max-w-lg mx-auto pb-36">

      {/* ── Header ── */}
      <div className="flex items-center justify-between py-4 mb-3">
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          {t('profile.title')}
        </h1>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          aria-label="Configuración"
        >
          <Gear size={20} weight="bold" />
        </button>
      </div>

      {/* ── Profile card ── */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="w-full flex items-center gap-4 p-5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-3xl shadow-sm hover:border-violet-400/50 dark:hover:border-violet-500/40 transition-colors mb-4 text-left"
      >
        {renderAvatar()}
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-800 dark:text-white text-lg leading-tight truncate">
            {fullName}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm truncate mt-0.5">
            {email}
          </p>
          <p className="text-violet-500 text-xs font-bold mt-2">
            {t('profile.view_profile')}
          </p>
        </div>
        <UserCircle size={22} className="text-slate-300 dark:text-slate-600 shrink-0" />
      </button>

      {/* ── Pro / Stats card ── */}
      <div className="relative rounded-3xl overflow-hidden mb-4 bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 p-5 shadow-xl shadow-violet-900/25">
        {/* Inner glare */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />

        {/* Top row */}
        <div className="flex items-start justify-between mb-5 relative">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Diamond size={17} weight="fill" className="text-violet-200" />
              <span className="text-white font-black text-xl">Pro</span>
            </div>
            <p className="text-violet-200 text-xs font-medium">
              {t('profile.pro_subtitle')}
            </p>
          </div>
          <button
              onClick={() => setShowPricing(true)}
              className="bg-white text-violet-700 text-sm font-black px-4 py-2 rounded-2xl shadow-sm hover:bg-violet-50 active:scale-95 transition-all">
            {t('profile.go_pro')}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 relative">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-white font-black text-base leading-none">{s.value}</p>
              <p className="text-violet-200/80 text-[10px] font-medium mt-1.5 leading-tight">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Menu list ── */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-sm mb-4">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={item.action || undefined}
            disabled={!item.action}
            className={[
              'w-full flex items-center gap-4 px-5 py-4 text-left transition-colors',
              item.action
                ? 'hover:bg-slate-50 dark:hover:bg-slate-700/40 active:bg-slate-100 dark:active:bg-slate-700/60 cursor-pointer'
                : 'opacity-50 cursor-default',
              i < menuItems.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/40' : '',
            ].join(' ')}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <item.icon size={18} weight="bold" className="text-slate-600 dark:text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-snug">
                {item.label}
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5 leading-snug">
                {item.sub}
              </p>
            </div>
            {item.action && (
              <CaretRight size={15} className="text-slate-300 dark:text-slate-600 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* ── Sign out ── */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center gap-4 px-5 py-4 bg-white dark:bg-slate-800/60 border border-red-100 dark:border-red-900/30 rounded-3xl text-left hover:bg-red-50 dark:hover:bg-red-900/10 active:bg-red-100 transition-colors shadow-sm"
      >
        <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
          <SignOut size={18} weight="bold" className="text-red-500" />
        </div>
        <span className="flex-1 font-bold text-red-500 text-sm">{t('profile.sign_out')}</span>
        <CaretRight size={15} className="text-red-300 dark:text-red-700 shrink-0" />
      </button>

      {/* ── Language selector (mobile) ── */}
      <div className="mt-4 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-3xl px-5 py-4 shadow-sm">
        <LanguageSelector />
      </div>

      {/* ── Account Settings Modal ── */}
      <AccountSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onShowAlert={onShowAlert || (() => {})}
      />

      {/* ── Pricing Modal ── */}
      {showPricing && <PricingPlans onClose={() => setShowPricing(false)} />}
    </div>
  )
}
