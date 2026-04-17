import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAvailableProviders, getProviderStatus } from '../../lib/ai-providers';

/**
 * Panel de configuración de proveedores de IA
 * Muestra qué proveedores están configurados y listos
 */
export default function AIProviderStatus() {
  const [providers, setProviders] = useState([]);
  const [status, setStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const available = getAvailableProviders();
    const providerStatus = getProviderStatus();
    
    setProviders(available);
    setStatus(providerStatus);
  }, []);

  if (!status) return null;

  const configuredCount = providers.length;
  const hasAnyProvider = configuredCount > 0;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🤖 {t('ai.provider_title')}
            {hasAnyProvider && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                {configuredCount} activo{configuredCount > 1 ? 's' : ''}
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {hasAnyProvider 
              ? t('ai.provider_configured')
              : t('ai.provider_none')}
          </p>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
        >
          {showDetails ? t('ai.provider_hide') : t('ai.provider_show')}
        </button>
      </div>

      {/* Estado de proveedor: Groq */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 rounded-2xl border-2 transition-all duration-300 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 shadow-sm shadow-amber-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <span className="font-black text-slate-800 dark:text-white block uppercase tracking-wider text-xs">Groq — Llama 3.3 70B</span>
              <span className="text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
                ● Activo vía proxy seguro
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded-full w-fit">
              <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-tighter">Alta Velocidad</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 rounded-full w-fit">
              <span className="text-[10px] font-black text-green-700 dark:text-green-300 uppercase tracking-tighter">Gratis · 30 req/min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features disponibles cuando hay IA */}
      {hasAnyProvider && (
        <div className="mt-6 pt-6 border-t border-purple-200/50 dark:border-purple-800/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { emoji: '📈', text: t('ai.feature_analysis') },
              { emoji: '🏷️', text: t('ai.feature_categorize') },
              { emoji: '🔮', text: t('ai.feature_predict') },
              { emoji: '🛡️', text: t('ai.feature_anomalies') }
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center text-center p-3 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 shadow-glass-sm animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <span className="text-xl mb-1">{f.emoji}</span>
                <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600 dark:text-slate-400 leading-tight">
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
