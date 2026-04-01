import React, { useState, useEffect } from 'react';
import { DownloadSimple, X } from '@phosphor-icons/react';

/**
 * Componente inteligente que detecta si la app puede ser instalada (PWA)
 * y muestra un banner elegante para invitar al usuario a instalarla.
 */
export const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Escuchar el evento que indica que el navegador permite instalar la PWA
    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);

    // Si ya fue instalada, ocultar el prompt para siempre
    window.addEventListener('appinstalled', () => {
      setSupportsPWA(false);
      setPromptInstall(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClickInstall = async () => {
    if (!promptInstall) return;
    
    // Mostrar el prompt nativo
    promptInstall.prompt();
    
    // Esperar a que el usuario responda al prompt
    const { outcome } = await promptInstall.userChoice;
    console.log(`Usuario ha respondido al prompt de PWA: ${outcome}`);
    
    // Limpiar el estado independientemente de lo que eligió
    setSupportsPWA(false);
    setPromptInstall(null);
  };

  if (!supportsPWA || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
      <div className="flex items-center justify-between gap-4 bg-slate-800/90 backdrop-blur-md border border-purple-500/30 p-4 rounded-2xl shadow-2xl shadow-purple-900/40 animate-slide-up">
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm">Instalar Budget RP</span>
          <span className="text-gray-400 text-xs">Usa la app offline o como app nativa.</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClickInstall}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-md"
          >
            <DownloadSimple size={16} weight="bold" />
            <span>Instalar</span>
          </button>
          
          <button 
            onClick={() => setIsDismissed(true)}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Cerrar prompt de instalación"
          >
            <X size={18} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
};
