import { Coffee, ShieldCheck } from '@phosphor-icons/react';
import BudgetLogo from './BudgetLogo';

export const AppFooter = () => (
  <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 py-10 px-6 text-center text-sm text-slate-500 dark:text-slate-400">
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-5">

      {/* Logo + nombre */}
      <div className="flex items-center gap-2">
        <BudgetLogo size={22} />
        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Saldo
        </span>
      </div>

      {/* Subtítulo + autor */}
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-7 font-medium">
        <span>Gestión Inteligente de Finanzas Personales</span>
        <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
        <span className="flex items-center gap-1.5">
          Hecho con{' '}
          <Coffee size={15} weight="fill" className="text-amber-400" />
          {' '}por{' '}
          <a
            href="https://www.risso-patron.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors uppercase tracking-tight"
          >
            Luis Risso Patrón
          </a>
        </span>
      </div>

      {/* Cita */}
      <p className="text-xs text-slate-400 dark:text-slate-500 italic max-w-sm leading-relaxed">
        &ldquo;La construí porque yo también quería entender a dónde iba mi plata cada mes.&rdquo;
      </p>

      {/* Shield de Privacidad Local-First */}
      <div className="flex flex-col items-center gap-1.5 mt-2 p-4 bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 max-w-sm w-full mx-auto shadow-sm">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck size={20} weight="fill" />
          <span className="font-bold text-sm tracking-tight uppercase">Privacidad Absoluta</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-snug">
          Tus datos bancarios viven encriptados 100% en tu dispositivo. Nada sale a la nube.
        </p>
      </div>

      {/* Links legales */}
      <p className="text-xs opacity-60 mt-2">
        <a href="/privacy.html" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          Política de Privacidad
        </a>
        {' · '}
        <a href="/terms.html" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          Términos de Servicio
        </a>
      </p>

    </div>
  </footer>
);
