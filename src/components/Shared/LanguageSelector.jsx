import { useTranslation } from 'react-i18next'
import { Globe } from '@phosphor-icons/react'

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

/**
 * LanguageSelector — muestra banderas para cambiar idioma.
 * compact=true: solo banderas (para sidebar / profile)
 * compact=false: banderas + nombre completo
 */
export const LanguageSelector = ({ compact = false }) => {
  const { i18n } = useTranslation()
  const current = i18n.language?.slice(0, 2) || 'es'

  if (compact) {
    return (
      <div className="flex items-center gap-0.5">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            title={lang.label}
            className={[
              'w-8 h-8 rounded-xl text-base transition-all duration-200',
              current === lang.code
                ? 'bg-violet-500/20 scale-110 shadow-sm'
                : 'text-slate-400 hover:bg-white/5 hover:scale-105 opacity-60 hover:opacity-100',
            ].join(' ')}
          >
            {lang.flag}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
        <Globe size={18} weight="bold" className="text-slate-600 dark:text-slate-300" />
      </div>
      <div className="flex-1">
        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm leading-snug">
          {LANGUAGES.find(l => l.code === current)?.label || 'Español'}
        </p>
        <div className="flex gap-1 mt-1">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              title={lang.label}
              className={[
                'px-2 py-0.5 rounded-lg text-[10px] font-black transition-all duration-200',
                current === lang.code
                  ? 'bg-violet-500 text-white'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700',
              ].join(' ')}
            >
              {lang.flag} {lang.code.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
