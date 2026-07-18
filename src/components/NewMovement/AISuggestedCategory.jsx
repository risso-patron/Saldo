import { Sparkles } from 'lucide-react';
import PropTypes from 'prop-types';

// Checkpoint III-A (Saldo Design Constitution v1.2) — presentación PURA.
// (docs/design/screens/Saldo Nuevo Movimiento.dc.html)
//
// Responsabilidad única (PO): icono Sparkles; texto "Categoría sugerida:
// {categoría}"; acción "Cambiar"; estados visuales. Nada más. NO llama a
// useAI() ni a ningún hook de datos — recibe todo por props. Quien la monta
// (NewMovementSheet) es responsable del debounce y de invocar useAI().
//
// Checkpoint III-C.4 — el contenedor con aria-live="polite" está SIEMPRE
// presente en el DOM (no se monta/desmonta con `category`), así un lector de
// pantalla detecta el CAMBIO de contenido en vez de la aparición/desaparición
// de todo un nodo — más confiable. El contenido visible adentro sigue siendo
// condicional: mismo resultado visual que antes (nada visible sin category).

export function AISuggestedCategory({ category, onChangeClick }) {
  return (
    <div aria-live="polite">
      {category && (
        <div className="flex items-center gap-2">
          <Sparkles width={14} height={14} strokeWidth={1.5} className="text-ds-text-tertiary" aria-hidden="true" />
          <span className="text-ds-caption text-ds-text-secondary">Categoría sugerida:</span>
          <span className="bg-ds-surface-sunken rounded-ds-control px-2.5 py-0.5 text-ds-caption font-medium text-ds-text-primary">
            {category}
          </span>
          <button
            type="button"
            onClick={onChangeClick}
            className="text-ds-caption text-ds-text-tertiary hover:text-ds-text-secondary transition-colors duration-ds-fast ease-ds"
          >
            Cambiar
          </button>
        </div>
      )}
    </div>
  );
}

AISuggestedCategory.propTypes = {
  category: PropTypes.string,
  onChangeClick: PropTypes.func.isRequired,
};

AISuggestedCategory.defaultProps = {
  category: null,
};
