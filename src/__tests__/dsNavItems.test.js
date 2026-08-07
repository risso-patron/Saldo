import { describe, it, expect } from 'vitest';
import { DS_NAV_ITEMS } from '../components/ds/dsNavItems';

// Guardia de regresión R-08 (tope duro de 4 destinos de navegación,
// design.md H1): esta suite debe seguir en verde para siempre, incluso
// después de cambios futuros no relacionados con metas-exposicion.
describe('DS_NAV_ITEMS — guardia R-08', () => {
  it('mantiene exactamente 4 destinos de navegación', () => {
    expect(DS_NAV_ITEMS).toHaveLength(4);
  });

  it('ningún destino tiene id "metas" (Metas no es un tab de nivel superior)', () => {
    expect(DS_NAV_ITEMS.some((item) => item.id === 'metas')).toBe(false);
  });
});
