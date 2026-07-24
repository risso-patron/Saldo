import { useEffect, useRef } from 'react';

// RC-1.7/A5 — accesibilidad reutilizable para diálogos modales que no usan
// Sheet.jsx (esa lógica ya vive ahí; se extrae acá tal cual, sin tocar
// Sheet.jsx, para aplicarla a UpgradeModal.jsx y AccountSettingsModal.jsx sin
// cambiar su estructura visual). Mismo comportamiento ya probado en Sheet:
// Escape cierra, trampa de Tab dentro del contenedor, foco inicial (el
// declarado o el primer elemento enfocable), retorno de foco al elemento
// previo al cerrar/desmontar, bloqueo de scroll del body mientras está
// abierto.
const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.disabled
  );
}

export function useModalA11y(isOpen, onClose, dialogRef, initialFocusRef) {
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedRef.current = document.activeElement;

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

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const raf = requestAnimationFrame(() => {
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

      const previouslyFocused = previouslyFocusedRef.current;
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      } else {
        document.body.focus();
      }
    };
  }, [isOpen, onClose, dialogRef, initialFocusRef]);
}
