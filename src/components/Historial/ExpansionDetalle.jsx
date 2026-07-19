import PropTypes from 'prop-types';
import { Button } from '../ds/Button';

// Checkpoint IV-B (Saldo Design Constitution v1.2) — expansión en línea de
// una fila de Historial. Decisión explícita del PO: interacción DEFINITIVA
// (no provisoria) — clic en una fila la expande mostrando detalle + Editar,
// NUNCA clic-directo-a-la-hoja.
//
// Solo Categoría (y solo para gastos — los ingresos no tienen categoría en
// el modelo de datos de useTransactions.js, se omite por completo en vez de
// inventar una etiqueta sintética). NO se muestran "Cuenta" ni "Nota":
// hallazgo de verificación — useTransactions.js no tiene esos campos, el
// mockup los muestra como texto decorativo fijo, no datos reales (mismo
// criterio que "Sin IA = sin hueco reservado" ya aplicado en Dashboard e
// Historial).
//
// Preparada estructuralmente para "Eliminar" (Checkpoint IV-C) sin
// implementarlo: `onDeleteMovement` es opcional — si nadie lo pasa (IV-B),
// el botón simplemente no se renderiza. Ninguna lógica de eliminación real
// vive acá todavía.
export function ExpansionDetalle({ movement, onEditMovement, onDeleteMovement }) {
  const hasCategory = movement.type === 'expense' && Boolean(movement.category);

  return (
    <div className="px-1 py-3 border-b border-ds-border-separator bg-ds-surface-sunken flex items-center justify-between gap-3">
      <div>
        {hasCategory && (
          <p className="text-ds-caption text-ds-text-tertiary">Categoría: {movement.category}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="compact" onClick={() => onEditMovement(movement)}>
          Editar
        </Button>
        {onDeleteMovement && (
          <Button variant="secondary" size="compact" tone="danger" onClick={() => onDeleteMovement(movement)}>
            Eliminar
          </Button>
        )}
      </div>
    </div>
  );
}

ExpansionDetalle.propTypes = {
  movement: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['income', 'expense']).isRequired,
    category: PropTypes.string,
  }).isRequired,
  onEditMovement: PropTypes.func.isRequired,
  onDeleteMovement: PropTypes.func,
};
