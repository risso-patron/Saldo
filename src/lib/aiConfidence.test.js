import { toConfidenceLabel } from './aiConfidence';

// Tarea 1.4/1.5 — src/lib/aiConfidence.js: fuente única del mapeo número→etiqueta
// de confianza (spec.md Área 10, design.md §4, Principio 2). Casos límite exactos
// exigidos por el criterio de finalización de 1.4.

describe('toConfidenceLabel (spec.md Área 10, design.md §4)', () => {
  it('>=0.8 → "alta"', () => {
    expect(toConfidenceLabel(0.8)).toBe('alta');
    expect(toConfidenceLabel(0.95)).toBe('alta');
    expect(toConfidenceLabel(1)).toBe('alta');
  });

  it('>=0.5 y <0.8 → "media"', () => {
    expect(toConfidenceLabel(0.5)).toBe('media');
    expect(toConfidenceLabel(0.79)).toBe('media');
  });

  it('>0 y <0.5 → "baja"', () => {
    expect(toConfidenceLabel(0.01)).toBe('baja');
    expect(toConfidenceLabel(0.49)).toBe('baja');
  });

  it('0 → null (no se muestra rota, Área 10)', () => {
    expect(toConfidenceLabel(0)).toBeNull();
  });

  it('negativo → null', () => {
    expect(toConfidenceLabel(-0.5)).toBeNull();
  });

  it('>1 → null', () => {
    expect(toConfidenceLabel(1.5)).toBeNull();
  });

  it('NaN → null', () => {
    expect(toConfidenceLabel(NaN)).toBeNull();
  });

  it('undefined → null', () => {
    expect(toConfidenceLabel(undefined)).toBeNull();
  });
});
