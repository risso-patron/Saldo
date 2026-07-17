import { Plus } from 'lucide-react';
import PropTypes from 'prop-types';

// Design System — Saldo Design Constitution v1.2
// (docs/design/screens/Saldo Dashboard.dc.html)
//
// Único FAB del producto, y solo en mobile (<768px): círculo 56px, fondo
// ds-accent, icono Plus 24px blanco, sombra ds-floating, posición fija por
// encima de DSBottomNav (bottom:80px). Acción: la misma que el FAB legado
// (onQuickAction) — atajo directo al flujo de registro de movimiento.

export function DSFab({ onAction }) {
  return (
    <button
      type="button"
      onClick={onAction}
      aria-label="Nuevo movimiento"
      className="md:hidden fixed right-4 bottom-20 z-[110] w-14 h-14 rounded-ds-full
        bg-ds-accent shadow-ds-floating flex items-center justify-center
        transition-colors duration-ds-fast ease-ds hover:bg-ds-accent-hover"
    >
      <Plus width={24} height={24} strokeWidth={1.5} className="text-white" aria-hidden="true" />
    </button>
  );
}

DSFab.propTypes = {
  onAction: PropTypes.func.isRequired,
};
