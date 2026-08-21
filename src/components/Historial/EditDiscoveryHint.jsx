import PropTypes from 'prop-types';
import { X } from 'lucide-react';

// Mejora de descubribilidad — Dogfooding (DOG-004, 2026-08-20). Origen:
// evidencia externa (docs/research/dogfooding-log.md) reportó no poder
// modificar un movimiento — la edición existe (clic en la fila → detalle →
// "Editar"), el problema es que la fila no comunica visualmente que es
// interactiva, sobre todo en mobile (sin hover). Este hint enseña el ÚNICO
// mecanismo universal (tocar la fila) — no menciona el atajo de teclado "E"
// ni el swipe de mobile: ambos son atajos opcionales sobre el mismo
// mecanismo, no hacen falta para resolver la descubribilidad reportada, y
// enumerarlos sería explicar de más. Aditivo, mismo patrón que
// BannerErrorSincronizacion.jsx: nunca reemplaza contenido, solo convive con
// él, y desaparece para siempre una vez mostrado (Historial.jsx decide
// cuándo, vía localStorage).
export function EditDiscoveryHint({ onDismiss }) {
  return (
    <div
      role="status"
      className="bg-ds-accent-tint rounded-ds-surface px-[18px] py-3.5 flex items-center justify-between gap-3"
    >
      <p className="text-ds-caption text-ds-text-primary">
        Tocá cualquier movimiento para ver sus detalles, editarlo o eliminarlo.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar sugerencia"
        className="text-ds-text-secondary hover:text-ds-text-primary shrink-0"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

EditDiscoveryHint.propTypes = {
  onDismiss: PropTypes.func.isRequired,
};
