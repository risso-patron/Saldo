import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2 (Checkpoint III-B)
// (docs/design/screens/Saldo Nuevo Movimiento.dc.html, sección "Éxito" —
//  docs/design/flows/Saldo Flow 01 - Registrar Movimiento.dc.html, paso 6
//  "Añadir")
//
// Toast — primitiva genérica de notificación efímera con una acción de
// texto, domain-agnostic (no sabe qué es "deshacer" ni "un movimiento" — eso
// lo decide quien la consume, p.ej. App.jsx). Esquina inferior, fondo
// inverso, auto-dismiss configurable.
//
// Aproximaciones documentadas respecto al mockup (detalle menor, aprobado
// por el PO — Checkpoint III-B):
// - Posición: el mockup fija `left: 56px; bottom: 28px` en desktop. Se usa
//   `bottom-6 left-6` (24px) de la escala de espaciado ds — responsive y
//   consistente con el resto del sistema en vez de replicar el pixel exacto.
// - Radio: el mockup usa 8px, que no es ninguno de los tokens de radio
//   existentes (ds-control=6px / ds-surface=10px / ds-modal=16px). Se usa
//   `rounded-ds-control` (6px), el más cercano.
// - Padding: `12px 18px` — el vertical mapea limpio a `py-3` (12px) de la
//   escala nativa de Tailwind; el horizontal (18px) no tiene equivalente en
//   la escala, se mantiene como valor arbitrario `px-[18px]` para fidelidad
//   con el mockup en vez de redondear a 16/20.
// - Color de texto sobre superficie inversa: `tailwind.config.js` no define
//   un token semántico para texto sobre `ds-surface-inverse` (solo
//   ds.text.primary/secondary/tertiary/disabled, pensados para superficies
//   claras) — se usa `text-white` directo.
// - underline-offset: el mockup pide `text-underline-offset: 3px` exacto —
//   sin token en la escala, se usa el valor arbitrario `underline-offset-[3px]`.

export function Toast({ isOpen, message, actionLabel, onAction, onDismiss, duration = 8000 }) {
  const [entered, setEntered] = useState(false);

  // Auto-dismiss: arranca cuando isOpen pasa a true, se limpia si el
  // componente se desmonta o isOpen vuelve a false antes de tiempo (mismo
  // patrón de limpieza que Sheet.jsx).
  useEffect(() => {
    if (!isOpen) {
      setEntered(false);
      return undefined;
    }

    const raf = requestAnimationFrame(() => setEntered(true));
    const timer = setTimeout(() => onDismiss(), duration);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [isOpen, duration, onDismiss]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="toast"
      role="status"
      className={cn(
        'fixed bottom-6 left-6 z-[150] flex items-center gap-4',
        'bg-ds-surface-inverse rounded-ds-control py-3 px-[18px]',
        'transition-opacity duration-ds-slow ease-ds',
        entered ? 'opacity-100' : 'opacity-0'
      )}
    >
      <span className="text-ds-body text-white">{message}</span>
      <button
        type="button"
        onClick={onAction}
        className="text-ds-body text-white underline underline-offset-[3px]"
      >
        {actionLabel}
      </button>
    </div>
  );
}

Toast.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  actionLabel: PropTypes.string.isRequired,
  onAction: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  duration: PropTypes.number,
};
