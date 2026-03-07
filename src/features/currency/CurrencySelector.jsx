import { useState } from 'react';
import { useCurrency, SUPPORTED_CURRENCIES } from '../../contexts/CurrencyContext';

/**
 * CurrencySelector – selector compacto para elegir la moneda de visualización.
 * Se coloca en el header de la app.
 */
export const CurrencySelector = () => {
  const { selectedCurrency, setSelectedCurrency, ratesLoading } = useCurrency();
  const [open, setOpen] = useState(false);

  const current = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency) ?? SUPPORTED_CURRENCIES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        title="Cambiar moneda de visualización"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20
          text-white text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-white/30"
        aria-label={`Moneda: ${current.name}`}
        aria-expanded={open}
      >
        <span aria-hidden="true">{current.flag}</span>
        <span>{current.code}</span>
        {ratesLoading && (
          <span className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" aria-label="actualizando tasas" />
        )}
        <svg
          className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />

          <ul
            role="listbox"
            aria-label="Seleccionar moneda"
            className="absolute right-0 mt-1 z-20 bg-white dark:bg-gray-800 rounded-xl shadow-xl
              border border-gray-200 dark:border-gray-700 py-1 min-w-[180px]"
          >
            {SUPPORTED_CURRENCIES.map(c => (
              <li
                key={c.code}
                role="option"
                aria-selected={c.code === selectedCurrency}
              >
                <button
                  onClick={() => { setSelectedCurrency(c.code); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors
                    ${c.code === selectedCurrency
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <span aria-hidden="true">{c.flag}</span>
                  <span className="font-medium">{c.code}</span>
                  <span className="text-gray-400 dark:text-gray-500 text-xs ml-auto truncate max-w-[80px]">
                    {c.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
