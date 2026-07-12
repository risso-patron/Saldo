// Test OBJETIVO (Fase 3, task 3.1 — debe quedar en ROJO en este lote a propósito).
// `parseLocalDate` todavía NO existe como util compartida en calculations.js.
// Documenta el comportamiento requerido por la spec "Normalización de timezone
// consistente": normalizar con `.substring(0,10)+'T12:00:00'` antes de construir
// un Date, para que BudgetManager, calculateMonthlyComparison y ExportManager
// coincidan siempre en qué día cae una transacción, sin desplazamiento por timezone.
import { parseLocalDate } from '../utils/calculations';

describe('parseLocalDate — normalización de timezone compartida (RED hasta 3.1)', () => {
  it('parsea una fecha simple "YYYY-MM-DD" al día local exacto, sin desplazamiento', () => {
    const d = parseLocalDate('2026-03-01');

    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // Marzo, 0-indexed
    expect(d.getDate()).toBe(1);
  });

  it('normaliza un ISO completo con hora/timezone al mismo día calendario (límite de día, UTC-6)', () => {
    // Sin normalizar a mediodía local, un `new Date('2026-03-01T02:00:00-06:00')`
    // parseado directo puede desplazarse a Febrero 28 según el timezone del runner.
    const d = parseLocalDate('2026-03-01T02:00:00-06:00');

    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(2); // Marzo, no debe correrse a Febrero
    expect(d.getDate()).toBe(1);
  });

  it('devuelve null ante una fecha inválida, sin lanzar excepción', () => {
    expect(parseLocalDate('no-es-una-fecha')).toBeNull();
    expect(parseLocalDate(null)).toBeNull();
    expect(parseLocalDate(undefined)).toBeNull();
  });
});
