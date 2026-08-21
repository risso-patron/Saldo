import { useState } from 'react';
import { useCurrency, SUPPORTED_CURRENCIES } from '../../contexts/CurrencyContext';
import { logDogfoodingEvent } from '../../utils/dogfoodingInstrumentation';

/**
 * CurrencySelector – selector compacto para elegir la moneda de visualización.
 * Soporta alineación 'sidebar' para abrir hacia arriba.
 */
export const CurrencySelector = ({ align = 'default' }) => {
  const { selectedCurrency, setSelectedCurrency, ratesLoading } = useCurrency();
  const [open, setOpen] = useState(false);

  const current = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency) ?? SUPPORTED_CURRENCIES[0];
  const isSidebar = align === 'sidebar';

  return (
    <div className={`relative ${isSidebar ? 'w-full' : ''}`}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-300 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-sm overflow-hidden ${
          isSidebar 
            ? 'w-full bg-slate-800/40 hover:bg-slate-700/60 justify-between' 
            : 'bg-white/10 hover:bg-white/20'
        }`}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          {/* Bandera con imagen real vía FlagCDN */}
          {current.code === 'EUR' ? (
            <img src="https://flagcdn.com/w20/eu.png" alt="EUR" className="w-4 h-auto rounded-[2px]" />
          ) : (
            <img src={`https://flagcdn.com/w20/${current.code.slice(0, 2).toLowerCase()}.png`} alt={current.code} className="w-4 h-auto rounded-[2px]" onError={(e) => { e.target.style.display='none'; }}/>
          )}
          {/* Se fuerza el color claro en el sidebar porque siempre tiene fondo oscuro */}
          <span className={`font-bold text-xs ${isSidebar ? 'text-slate-200' : 'text-slate-700 dark:text-white'}`}>
            {current.code}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {ratesLoading && (
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          )}
          <svg
            className={`w-3 h-3 transition-transform ${isSidebar ? 'text-slate-400' : 'text-slate-400 dark:text-white'} ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50" onClick={() => setOpen(false)} />
          <ul
            className={`absolute ${
              isSidebar ? 'bottom-full left-0 mb-3' : 'right-0 mt-1'
            } z-[100] bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 py-1 min-w-[200px] max-h-[300px] overflow-y-auto animate-fade-in-slide custom-scrollbar`}
          >
            <li className="px-3 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5 mb-1">
              Seleccionar Moneda
            </li>
            {SUPPORTED_CURRENCIES.map(c => (
              <li key={c.code}>
                <button
                  onClick={() => {
                    // DOG-011 — solo cuenta como cambio real si la moneda
                    // seleccionada difiere de la actual (re-clickear la
                    // misma no es un cambio).
                    if (c.code !== selectedCurrency) {
                      logDogfoodingEvent('currency_change', { to: c.code });
                    }
                    setSelectedCurrency(c.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all
                    ${c.code === selectedCurrency
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                >
                  {/* Bandera con imagen real vía FlagCDN */}
                  {c.code === 'EUR' ? (
                    <img src="https://flagcdn.com/w20/eu.png" alt="EUR" className="w-[18px] h-auto rounded-[2px]" />
                  ) : (
                    <img src={`https://flagcdn.com/w20/${c.code.slice(0, 2).toLowerCase()}.png`} alt={c.code} className="w-[18px] h-auto rounded-[2px]" onError={(e) => { e.target.style.display='none'; }}/>
                  )}
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-bold">{c.code}</span>
                    <span className="text-[10px] opacity-60 mt-0.5">{c.name}</span>
                  </div>
                  {c.code === selectedCurrency && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 shadow-sm shadow-primary-500/50" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
