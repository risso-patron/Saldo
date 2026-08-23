import PropTypes from 'prop-types';
import { Button } from '../ds/Button';

const formatImportSource = (source) => {
  if (source === 'txt_import') return 'TXT';
  if (source === 'csv_import') return 'CSV';
  return 'archivo';
};

const formatImportedAt = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('es-PA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

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
  const hasImportMetadata = Boolean(movement.importBatchId || movement.source || movement.importedAt);
  const importedAtLabel = formatImportedAt(movement.importedAt);
  const importSourceLabel = formatImportSource(movement.source);

  return (
    <div className="px-1 py-3 border-b border-ds-border-separator bg-ds-surface-sunken flex items-center justify-between gap-3">
      <div className="space-y-1">
        {hasCategory && (
          <p className="text-ds-caption">Categoría: {movement.category}</p>
        )}
        {hasImportMetadata && (
          <p className="text-ds-caption">
            Origen: importado desde {importSourceLabel}{importedAtLabel ? ` el ${importedAtLabel}` : ''}
          </p>
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
    importBatchId: PropTypes.string,
    source: PropTypes.string,
    importedAt: PropTypes.string,
  }).isRequired,
  onEditMovement: PropTypes.func.isRequired,
  onDeleteMovement: PropTypes.func,
};
