import React, { useState, useEffect, useRef } from 'react';
import { BellRinging, X } from '@phosphor-icons/react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

/**
 * Módulo de Engagement - Notificaciones asíncronas no invasivas.
 */
export const DailyReminder = () => {
  // Estado local para no fatigar la UI con banners repetidos
  const [permission, setPermission] = useState(Notification.permission);
  const [showBanner, setShowBanner] = useLocalStorage('budgetrp_show_notification_banner', true);
  const [lastNotifiedDate, setLastNotifiedDate] = useLocalStorage('budgetrp_last_notified', null);
  
  const timerRef = useRef(null);

  // Solicitar permiso amigablemente tras click humano (Regla: no ser invasivo)
  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        setShowBanner(false);
      }
    } catch (error) {
      console.error('Error pidiendo permiso de notificaciones:', error);
    }
  };

  const throwNotification = () => {
    const today = new Date().toLocaleDateString();
    
    // Si ya notificamos hoy, ignorar.
    if (lastNotifiedDate === today) return;

    if (Notification.permission === 'granted') {
      const notif = new Notification('Budget RP 💸', {
        body: '¿Gastaste algo hoy? Regístralo en 10 segundos y mantén tu racha intacta.',
        icon: '/favicon.svg', // Icono de la marca
        badge: '/favicon.svg',
        vibrate: [200, 100, 200]
      });

      notif.onclick = () => {
        window.focus(); // Trae la pestaña al frente si el usuario hace click
        notif.close();
      };

      setLastNotifiedDate(today);
    }
  };

  useEffect(() => {
    // Si ya tiene permiso explícito, arrancamos el motor del recordatorio
    if (permission === 'granted') {
      
      const checkSchedule = () => {
        const now = new Date();
        const currentHour = now.getHours();
        
        // Regla: Notificar a las 8 PM (20:00). 
        // Damos un rango (ej: puede ser entre 20h y 21h) para asegurarnos que lo lea cuando abra la app
        if (currentHour >= 20) {
          throwNotification();
        }
      };

      // Revisar inmediatamente y luego cada 30 minutos por si deja la app abierta todo el día
      checkSchedule();
      timerRef.current = setInterval(checkSchedule, 1000 * 60 * 30);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [permission]);


  // Si ya nos denegó el permiso, o si ya no quiere ver el banner, no estorbamos.
  if (permission !== 'default' || !showBanner) {
    return null;
  }

  return (
    <div className="bg-slate-800/80 backdrop-blur-sm border border-pink-500/30 p-4 mx-6 mb-6 rounded-2xl shadow-xl flex items-center justify-between animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
          <BellRinging size={24} weight="light" className="text-pink-500 animate-wiggle" />
        </div>
        <div>
          <h4 className="text-white font-bold text-sm">No olvides tus gastos</h4>
          <p className="text-gray-400 text-xs">Activa el recordatorio diario (8PM) para mantener tu control financiero.</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button 
          onClick={requestPermission}
          className="bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
        >
          Activar
        </button>
        <button 
          onClick={() => setShowBanner(false)}
          className="text-gray-500 hover:text-gray-300 p-1 transition-colors"
          aria-label="Cerrar aviso de notificaciones"
        >
          <X size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
};
