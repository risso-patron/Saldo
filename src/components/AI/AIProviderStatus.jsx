import { useState, useEffect } from 'react';
import { getAvailableProviders, getProviderStatus } from '../../lib/ai-providers';

/**
 * Panel de configuración de proveedores de IA
 * Muestra qué proveedores están configurados y listos
 */
export default function AIProviderStatus() {
  const [providers, setProviders] = useState([]);
  const [status, setStatus] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

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
            🤖 Inteligencia Artificial
            {hasAnyProvider && (
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                {configuredCount} activo{configuredCount > 1 ? 's' : ''}
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {hasAnyProvider 
              ? 'Proveedores configurados y listos para usar'
              : 'Configura al menos un proveedor para activar features de IA'}
          </p>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium"
        >
          {showDetails ? 'Ocultar' : 'Ver detalles'}
        </button>
      </div>

      {/* Estado de proveedores */}
      <div className="grid grid-cols-2 gap-4">
        {/* Google Gemini */}
        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
          status.gemini.configured 
            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 shadow-sm shadow-emerald-500/10' 
            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <span className="font-black text-slate-800 dark:text-white block uppercase tracking-wider text-xs">Gemini</span>
              <span className={`text-[10px] font-bold uppercase ${
                status.gemini.configured 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-slate-400'
              }`}>
                {status.gemini.configured ? '● Activo' : '○ Offline'}
              </span>
            </div>
          </div>
          {status.gemini.configured && (
            <div className="flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-full w-fit">
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-tighter">Plan Gratuito</span>
            </div>
          )}
        </div>

        {/* Groq */}
        <div className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
          status.groq.configured 
            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 shadow-sm shadow-amber-500/10' 
            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <span className="font-black text-slate-800 dark:text-white block uppercase tracking-wider text-xs">Groq</span>
              <span className={`text-[10px] font-bold uppercase ${
                status.groq.configured 
                  ? 'text-amber-600 dark:text-amber-400' 
                  : 'text-slate-400'
              }`}>
                {status.groq.configured ? '● Activo' : '○ Offline'}
              </span>
            </div>
          </div>
          {status.groq.configured && (
            <div className="flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 rounded-full w-fit">
              <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-tighter">Alta Velocidad</span>
            </div>
          )}
        </div>
      </div>

      {/* Detalles expandibles */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">
            📖 Cómo configurar proveedores gratuitos:
          </h4>
          
          <div className="space-y-3 text-sm">
            {/* Gemini */}
            {!status.gemini.configured && (
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  ✨ Google Gemini (Recomendado)
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                  🎁 Gratis: 1,500 requests/día
                </p>
                <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Ve a <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">Google AI Studio</a></li>
                  <li>Haz clic en "Get API Key"</li>
                  <li>Copia la key (empieza con AIza...)</li>
                  <li>Agrégala al archivo .env: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">VITE_GOOGLE_GEMINI_API_KEY=...</code></li>
                  <li>Reinicia el servidor: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">npm run dev</code></li>
                </ol>
              </div>
            )}

            {/* Groq */}
            {!status.groq.configured && (
              <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  ⚡ Groq (Más rápida)
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mb-2">
                  🎁 Gratis: 30 requests/minuto
                </p>
                <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>Ve a <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">Groq Console</a></li>
                  <li>Crea cuenta (sin tarjeta)</li>
                  <li>Crea API Key</li>
                  <li>Agrégala al .env: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">VITE_GROQ_API_KEY=...</code></li>
                  <li>Reinicia el servidor</li>
                </ol>
              </div>
            )}

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <p className="text-xs text-purple-700 dark:text-purple-300">
                💡 <strong>Tip:</strong> Puedes configurar múltiples proveedores. El sistema usa fallback automático si uno falla.
              </p>
            </div>

            <div className="text-center">
              <a 
                href="/docs/FREE_AI_SETUP.md" 
                target="_blank"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-xs font-medium underline"
              >
                📖 Ver guía completa de configuración
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Features disponibles cuando hay IA */}
      {hasAnyProvider && (
        <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-800">
          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
            ✨ Features activadas:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>✅</span>
              <span>Análisis financiero inteligente</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>✅</span>
              <span>Categorización automática</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>✅</span>
              <span>Predicción de gastos</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span>✅</span>
              <span>Detección de anomalías</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
