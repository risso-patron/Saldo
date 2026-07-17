import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Design System — Saldo Design Constitution v1.2
// (docs/design/constitution/Saldo Design Constitution.dc.html)
//
// Helper de merge de clases para los componentes de src/components/ds/.
// twMerge() por defecto solo conoce la escala nativa de Tailwind: el prefijo
// `text-` es ambiguo entre color (`text-white`) y tamaño de fuente
// (`text-sm`), y por defecto NO reconoce nuestra escala tipográfica custom
// (`.text-ds-body`, `.text-ds-caption`, etc. — utilidades definidas a mano en
// src/index.css, no generadas por el theme de Tailwind). Verificado: sin este
// `extend`, `twMerge('text-white text-ds-body')` colapsa a una sola clase
// (las trata como el mismo grupo "color de texto"), rompiendo en silencio
// componentes que combinan color + tamaño (p.ej. Button primary: texto
// blanco + escala body). El `extend` de abajo registra la escala `ds-*` como
// su propio grupo "font-size", separado de "text-color" — así ambas
// conviven y las colisiones REALES (dos tamaños entre sí, o dos colores
// entre sí) se siguen resolviendo por orden (gana la última).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'ds-display',
            'ds-heading',
            'ds-title',
            'ds-subtitle',
            'ds-body',
            'ds-caption',
            'ds-overline',
            'ds-numeric',
            'ds-numeric-xl',
          ],
        },
      ],
    },
  },
});

/**
 * cn(...) = twMerge(clsx(...))
 * Combina clases condicionales (clsx) y resuelve conflictos de utilidades
 * Tailwind entre sí (twMerge) — usado para mergear el `className` externo
 * que reciben Button/Input/Card/etc. sin que el orden de aparición decida
 * el resultado final.
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}
