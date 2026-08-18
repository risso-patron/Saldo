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
//
// HAL-001 parte 3 — prop `source` ('ai' default | 'rules'), retrocompatible:
// sin pasarla, comportamiento y texto idénticos a como era antes de esta
// prop. 'rules' nunca debe mencionar IA en su texto (principio de SALDO: no
// simular capacidades inteligentes inexistentes). `onAcceptClick`, si se
// pasa, vuelve el badge de categoría clickeable para aceptar la sugerencia
// directamente — usado solo por el camino 'rules' (el camino 'ai' aplica su
// sugerencia por otro mecanismo, ya existente, sin tocar acá).

const SOURCE_LABELS = {
  ai: 'Categoría sugerida:',
  rules: 'Podría ser:',
};

export function AISuggestedCategory({ category = null, source = 'ai', onAcceptClick = null, onChangeClick }) {
  return (
    <div aria-live="polite">
      {category && (
        <div className="flex items-center gap-2">
          <Sparkles width={14} height={14} strokeWidth={1.5} className="text-ds-text-secondary" aria-hidden="true" />
          <span className="text-ds-caption text-ds-text-secondary">{SOURCE_LABELS[source]}</span>
          {onAcceptClick ? (
            <button
              type="button"
              onClick={onAcceptClick}
              className="bg-ds-surface-sunken rounded-ds-control px-2.5 py-0.5 text-ds-caption font-medium text-ds-text-primary hover:bg-ds-interaction-hover transition-colors duration-ds-fast ease-ds"
            >
              {category}
            </button>
          ) : (
            <span className="bg-ds-surface-sunken rounded-ds-control px-2.5 py-0.5 text-ds-caption font-medium text-ds-text-primary">
              {category}
            </span>
          )}
          <button
            type="button"
            onClick={onChangeClick}
            className="text-ds-caption text-ds-text-secondary transition-colors duration-ds-fast ease-ds"
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
  source: PropTypes.oneOf(['ai', 'rules']),
  onAcceptClick: PropTypes.func,
  onChangeClick: PropTypes.func.isRequired,
};
