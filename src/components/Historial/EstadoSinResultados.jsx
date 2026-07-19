import PropTypes from 'prop-types';
import { Button } from '../ds/Button';

// Checkpoint IV-F.1 (Saldo Design Constitution v1.2) — "Sin resultados"
// (docs/design/screens/Saldo Historial.dc.html, "Estados": "La ausencia es
// información dicha con calma; siempre dos puertas de salida. Los filtros
// activos permanecen visibles — nunca un resultado vacío inexplicable.").
// Nombre tomado literalmente de "Nacen en esta pantalla" del documento de
// diseño. A diferencia de EstadoVacio, Historial.jsx sigue mostrando
// filtros/resumen alrededor de este componente — hay datos, el filtro
// actual simplemente no encuentra nada.
export function buildNoResultsMessage(searchTerm, monthLabel) {
  const trimmed = searchTerm?.trim();
  if (trimmed && monthLabel) return `Nada con «${trimmed}» en ${monthLabel}.`;
  if (trimmed) return `Nada con «${trimmed}».`;
  if (monthLabel) return `Nada en ${monthLabel}.`;
  return 'Nada coincide con los filtros actuales.';
}

export function EstadoSinResultados({ searchTerm, monthLabel, onSearchEverywhere, onClearAllFilters }) {
  return (
    <div className="flex flex-col items-start">
      <p className="text-ds-body text-ds-text-primary">
        {buildNoResultsMessage(searchTerm, monthLabel)}
      </p>
      <div className="flex items-center gap-6 mt-4">
        <Button variant="link" onClick={onSearchEverywhere}>
          Buscar en todo el historial
        </Button>
        <button
          type="button"
          onClick={onClearAllFilters}
          className="text-ds-body text-ds-text-tertiary hover:text-ds-text-secondary"
        >
          Quitar filtros
        </button>
      </div>
    </div>
  );
}

EstadoSinResultados.propTypes = {
  searchTerm: PropTypes.string,
  monthLabel: PropTypes.string,
  onSearchEverywhere: PropTypes.func.isRequired,
  onClearAllFilters: PropTypes.func.isRequired,
};
