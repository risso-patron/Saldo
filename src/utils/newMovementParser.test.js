import { parseMovementText } from './newMovementParser';

// Checkpoint III-C.3 — parser determinista de texto libre → borrador de
// movimiento ({activeType: 'expense', description, amount}). Dos patrones
// fijos ("descripción monto" / "monto descripción"), sin heurísticas, sin
// IA, sin fechas, sin categorías automáticas (alcance cerrado — ver
// instrucciones del PO). Nunca tira excepciones: siempre devuelve
// { success, movementDraft, error }.

describe('parseMovementText (Checkpoint III-C.3)', () => {
  describe('Patrón A: descripción + monto', () => {
    it('"café 3.20" → descripción "café", monto 3.20', () => {
      const result = parseMovementText('café 3.20');
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.movementDraft).toEqual({ activeType: 'expense', description: 'café', amount: 3.2 });
    });

    it('"uber 12" → descripción "uber", monto 12 (entero, sin decimales)', () => {
      const result = parseMovementText('uber 12');
      expect(result.success).toBe(true);
      expect(result.movementDraft).toEqual({ activeType: 'expense', description: 'uber', amount: 12 });
    });

    it('"almuerzo 15.50" → descripción "almuerzo", monto 15.50', () => {
      const result = parseMovementText('almuerzo 15.50');
      expect(result.success).toBe(true);
      expect(result.movementDraft).toEqual({ activeType: 'expense', description: 'almuerzo', amount: 15.5 });
    });

    it('descripción de varios tokens ("pago de luz 45") une todos los tokens previos al monto', () => {
      const result = parseMovementText('pago de luz 45');
      expect(result.success).toBe(true);
      expect(result.movementDraft).toEqual({ activeType: 'expense', description: 'pago de luz', amount: 45 });
    });
  });

  describe('Patrón B: monto + descripción', () => {
    it('"250 supermercado" → descripción "supermercado", monto 250', () => {
      const result = parseMovementText('250 supermercado');
      expect(result.success).toBe(true);
      expect(result.movementDraft).toEqual({ activeType: 'expense', description: 'supermercado', amount: 250 });
    });

    it('descripción de varios tokens ("10 agua y luz") une todos los tokens posteriores al monto', () => {
      const result = parseMovementText('10 agua y luz');
      expect(result.success).toBe(true);
      expect(result.movementDraft).toEqual({ activeType: 'expense', description: 'agua y luz', amount: 10 });
    });
  });

  describe('resultado sin categoría', () => {
    it('el movementDraft nunca incluye la clave "category" (alcance excluye categorización automática)', () => {
      const result = parseMovementText('café 3.20');
      expect(result.movementDraft).not.toHaveProperty('category');
    });
  });

  describe('entradas inválidas — estructura', () => {
    it('"abc" (ningún token es un monto válido) → success:false con error no vacío', () => {
      const result = parseMovementText('abc');
      expect(result.success).toBe(false);
      expect(result.movementDraft).toBeNull();
      expect(typeof result.error).toBe('string');
      expect(result.error.length).toBeGreaterThan(0);
    });

    it('"3.2.1" (no matchea el regex de monto en ninguna posición) → success:false', () => {
      const result = parseMovementText('3.2.1');
      expect(result.success).toBe(false);
      expect(result.movementDraft).toBeNull();
      expect(result.error.length).toBeGreaterThan(0);
    });

    it('string vacío → success:false con error', () => {
      const result = parseMovementText('');
      expect(result.success).toBe(false);
      expect(result.movementDraft).toBeNull();
      expect(result.error.length).toBeGreaterThan(0);
    });

    it('string de solo espacios → success:false con error', () => {
      const result = parseMovementText('   ');
      expect(result.success).toBe(false);
      expect(result.movementDraft).toBeNull();
    });

    it('un solo token sin monto ("café") → success:false', () => {
      const result = parseMovementText('café');
      expect(result.success).toBe(false);
      expect(result.movementDraft).toBeNull();
    });

    it('un solo token que sí es un monto válido ("50") → success:false (falta descripción)', () => {
      const result = parseMovementText('50');
      expect(result.success).toBe(false);
      expect(result.movementDraft).toBeNull();
    });
  });

  describe('bloqueo de palabras de fecha', () => {
    it('"ayer 50" es rechazado específicamente por el bloqueo de fecha, no por el patrón A/B', () => {
      const result = parseMovementText('ayer 50');
      expect(result.success).toBe(false);
      expect(result.movementDraft).toBeNull();
      expect(result.error.toLowerCase()).toMatch(/fecha/);
    });

    it('"hoy 20" es rechazado por el bloqueo de fecha', () => {
      const result = parseMovementText('hoy 20');
      expect(result.success).toBe(false);
      expect(result.error.toLowerCase()).toMatch(/fecha/);
    });

    it('"mañana 20" es rechazado por el bloqueo de fecha', () => {
      const result = parseMovementText('mañana 20');
      expect(result.success).toBe(false);
      expect(result.error.toLowerCase()).toMatch(/fecha/);
    });

    it('"anteayer 20" es rechazado por el bloqueo de fecha', () => {
      const result = parseMovementText('anteayer 20');
      expect(result.success).toBe(false);
      expect(result.error.toLowerCase()).toMatch(/fecha/);
    });

    it('"20 AYER" (mayúsculas) también es rechazado — comparación case-insensitive', () => {
      const result = parseMovementText('20 AYER');
      expect(result.success).toBe(false);
      expect(result.error.toLowerCase()).toMatch(/fecha/);
    });

    it('una palabra de fecha dentro de una descripción de varios tokens también bloquea ("pago ayer 45")', () => {
      const result = parseMovementText('pago ayer 45');
      expect(result.success).toBe(false);
      expect(result.error.toLowerCase()).toMatch(/fecha/);
    });
  });

  describe('normalización de espacios', () => {
    it('espacios múltiples entre palabras se normalizan correctamente ("café    3.20")', () => {
      const result = parseMovementText('café    3.20');
      expect(result.success).toBe(true);
      expect(result.movementDraft).toEqual({ activeType: 'expense', description: 'café', amount: 3.2 });
    });

    it('espacios al principio/final se recortan ("  café 3.20  ")', () => {
      const result = parseMovementText('  café 3.20  ');
      expect(result.success).toBe(true);
      expect(result.movementDraft).toEqual({ activeType: 'expense', description: 'café', amount: 3.2 });
    });

    it('múltiples espacios entre tokens de una descripción larga ("pago  de   luz  45")', () => {
      const result = parseMovementText('pago  de   luz  45');
      expect(result.success).toBe(true);
      expect(result.movementDraft).toEqual({ activeType: 'expense', description: 'pago de luz', amount: 45 });
    });
  });

  describe('robustez — nunca tira excepciones', () => {
    it('entrada null se maneja con gracia (no asume que text siempre es string)', () => {
      let result;
      expect(() => { result = parseMovementText(null); }).not.toThrow();
      expect(result.success).toBe(false);
      expect(result.movementDraft).toBeNull();
      expect(result.error.length).toBeGreaterThan(0);
    });

    it('entrada undefined se maneja con gracia', () => {
      let result;
      expect(() => { result = parseMovementText(undefined); }).not.toThrow();
      expect(result.success).toBe(false);
      expect(result.movementDraft).toBeNull();
    });

    it('sin argumentos se maneja con gracia', () => {
      let result;
      expect(() => { result = parseMovementText(); }).not.toThrow();
      expect(result.success).toBe(false);
    });

    it('entrada numérica se maneja con gracia (no es un string)', () => {
      let result;
      expect(() => { result = parseMovementText(42); }).not.toThrow();
      expect(result.success).toBe(false);
    });

    it('montos con signo o coma no matchean el regex de monto ("café -3.20", "café 3,20")', () => {
      expect(parseMovementText('café -3.20').success).toBe(false);
      expect(parseMovementText('café 3,20').success).toBe(false);
    });

    it('montos con más de 2 decimales no matchean ("café 3.201")', () => {
      const result = parseMovementText('café 3.201');
      expect(result.success).toBe(false);
    });
  });
});
