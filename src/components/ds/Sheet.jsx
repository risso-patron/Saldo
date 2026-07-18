import { useEffect, useRef, useState } from 'react';
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
//
// Checkpoint III-C.4 — accesibilidad completa, enteramente auto-contenida
// (quien consume Sheet no sabe cómo funciona nada de esto):
//   - Captura el elemento con foco al abrir y se lo devuelve al cerrar (o al
//     desmontar mientras estaba abierto); si ese elemento ya no está en el
//     DOM, cae a document.body — nunca deja el foco indefinido.
//   - Trampa de Tab/Shift+Tab dentro del contenedor del diálogo.
//   - Foco inicial declarado explícitamente vía `initialFocusRef`; sin ese
//     prop, cae al primer elemento enfocable del contenedor, y si no hay
//     ninguno, al propio contenedor.

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.disabled
  );
}

export function Sheet({ isOpen, onClose, children, initialFocusRef }) {
  const [entered, setEntered] = useState(false);
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setEntered(false);
      return undefined;
    }

    // Captura el elemento con foco ANTES de abrir, para devolvérselo al
    // cerrar (el usuario no debe perder su lugar en la página).
    previouslyFocusedRef.current = document.activeElement;

    // Escucha global de Escape/Tab mientras la hoja está abierta.
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = getFocusableElements(dialogRef.current);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement;

        if (e.shiftKey && current === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // Bloquea el scroll del body mientras la hoja está abierta, restaurado
    // al cerrar/desmontar (nunca deja el body atascado en overflow:hidden).
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Fundido de entrada: arranca en el frame siguiente para que el
    // navegador pinte primero el estado inicial (opacidad 0) y luego
    // transicione — si no, no hay transición visible. El foco inicial se
    // dispara en el mismo momento: `initialFocusRef` si se pasó, si no el
    // primer elemento enfocable del contenedor, si no el propio contenedor.
    // Guarda: si para cuando llega este frame el foco ya está en algo DENTRO
    // del diálogo (el usuario ya interactuó — p.ej. click/tab manual en el
    // instante entre abrir y este frame), no se lo robamos; el foco inicial
    // solo aplica cuando todavía nadie tomó el foco dentro de la hoja.
    const raf = requestAnimationFrame(() => {
      setEntered(true);
      const dialog = dialogRef.current;
      const focusAlreadyInsideDialog = dialog?.contains(document.activeElement);
      if (!focusAlreadyInsideDialog) {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else {
          const focusable = getFocusableElements(dialog);
          (focusable[0] ?? dialog)?.focus();
        }
      }
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      cancelAnimationFrame(raf);

      // Retorno de foco al cerrar/desmontar: si el elemento que tenía el
      // foco antes de abrir sigue en el DOM, se lo devolvemos; si no,
      // fallback seguro a document.body (nunca foco indefinido).
      const previouslyFocused = previouslyFocusedRef.current;
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      } else {
        document.body.focus();
      }
    };
  }, [isOpen, onClose, initialFocusRef]);

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
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
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
  initialFocusRef: PropTypes.shape({ current: PropTypes.any }),
};
