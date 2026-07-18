import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2 (Checkpoint III-A)
// (docs/design/screens/Saldo Nuevo Movimiento.dc.html,
//  docs/design/flows/Saldo Flow 01 - Registrar Movimiento.dc.html)
//
// Sheet — primitiva genérica de modal/hoja, domain-agnostic (no sabe qué
// contenido envuelve; eso lo decide quien la consume, p.ej. NewMovementSheet).
// Desktop/tablet (≥768px): panel centrado, max-width 480px, radio ds-modal
// (16px) en las 4 esquinas, sombra ds-modal, padding 40px 40px 32px.
// Mobile (<768px): anclado al borde inferior, radio ds-modal SOLO arriba,
// grabber centrado, padding 20px 24px 28px. Velo ds-scrim cubriendo todo el
// viewport — click en el velo (no en el panel) cierra; Escape cierra siempre;
// bloquea el scroll del body mientras está abierto.

export function Sheet({ isOpen, onClose, children }) {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setEntered(false);
      return undefined;
    }

    // Escucha global de Escape mientras la hoja está abierta.
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    // Bloquea el scroll del body mientras la hoja está abierta, restaurado
    // al cerrar/desmontar (nunca deja el body atascado en overflow:hidden).
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Fundido de entrada: arranca en el frame siguiente para que el
    // navegador pinte primero el estado inicial (opacidad 0) y luego
    // transicione — si no, no hay transición visible.
    const raf = requestAnimationFrame(() => setEntered(true));

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(raf);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Contenedor a pantalla completa: el click acá (fuera del panel, que
    // detiene su propia propagación) es un click en el velo -> cierra.
    <div className="fixed inset-0 z-[140]" onClick={onClose}>
      <div
        data-testid="sheet-scrim"
        aria-hidden="true"
        className={cn(
          'absolute inset-0 bg-ds-scrim transition-opacity duration-ds-slow ease-ds',
          entered ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={cn(
          // Mobile (default): anclado abajo, radio solo arriba, padding 20/24/28.
          'fixed inset-x-0 bottom-0 bg-ds-surface-raised shadow-ds-modal',
          'rounded-t-ds-modal pt-5 px-6 pb-7',
          'transition-[opacity,transform] duration-ds-slow ease-ds',
          entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
          // Desktop/tablet (≥768px): centrado vía inset-0 + margin:auto,
          // max-width 480px, radio ds-modal completo, padding 40/40/32.
          'md:inset-0 md:bottom-auto md:m-auto md:h-fit md:w-full md:max-w-[480px]',
          'md:rounded-ds-modal md:pt-10 md:px-10 md:pb-8',
          'md:translate-y-0'
        )}
      >
        <div
          aria-hidden="true"
          className="md:hidden mx-auto mb-5 h-1 w-9 rounded-ds-full bg-ds-border"
        />
        {children}
      </div>
    </div>
  );
}

Sheet.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
};
