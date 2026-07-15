// Tests OBJETIVO (HAL-001 parte 3 — deben quedar en ROJO hasta el fix).
// suggestExpenseCategory() es un wrapper de solo-lectura sobre categorizeWithRules():
// NO modifica DEFAULT_RULES, NO agrega mapeos/traducciones permanentes — solo filtra
// el resultado a las 4 categorías que YA coinciden 1:1 con EXPENSE_CATEGORIES
// (Transporte, Entretenimiento, Salud, Servicios). Cualquier otro match de la regla
// (Comida, Compras, Ingresos) se descarta sin sugerir nada — ver HAL-009/HAL-010.
import { categorizeWithRules, suggestExpenseCategory, categorizeTransactionsFull } from './categorizationEngine';
import { categorizeWithAI } from '../services/aiService';

vi.mock('../services/aiService', () => ({
  categorizeWithAI: vi.fn(),
}));

describe('suggestExpenseCategory — solo sugiere categorías ya alineadas con EXPENSE_CATEGORIES (HAL-001 parte 3)', () => {
  it('sugiere Transporte cuando la regla matchea (ej. "uber")', () => {
    const result = suggestExpenseCategory('Viaje en Uber al aeropuerto');
    expect(result).toEqual({ category: 'Transporte', emoji: '🚗', source: 'rules' });
  });

  it('sugiere Entretenimiento cuando la regla matchea (ej. "netflix")', () => {
    const result = suggestExpenseCategory('Suscripción Netflix mensual');
    expect(result.category).toBe('Entretenimiento');
  });

  it('sugiere Salud cuando la regla matchea (ej. "farmacia")', () => {
    const result = suggestExpenseCategory('Compra en Farmacia Arrocha');
    expect(result.category).toBe('Salud');
  });

  it('sugiere Servicios cuando la regla matchea (ej. "internet")', () => {
    const result = suggestExpenseCategory('Factura de internet del mes');
    expect(result.category).toBe('Servicios');
  });

  it('NO sugiere nada cuando la regla matchea "Comida" — no está en EXPENSE_CATEGORIES', () => {
    const result = suggestExpenseCategory('Almuerzo en McDonald\'s');
    expect(result).toBeNull();
  });

  it('NO sugiere nada cuando la regla matchea "Compras" — no está en EXPENSE_CATEGORIES', () => {
    const result = suggestExpenseCategory('Compra en Amazon');
    expect(result).toBeNull();
  });

  it('NO sugiere nada cuando la regla matchea "Ingresos" — no es una categoría de gasto', () => {
    const result = suggestExpenseCategory('Depósito de nómina quincenal');
    expect(result).toBeNull();
  });

  it('devuelve null cuando ninguna regla matchea', () => {
    const result = suggestExpenseCategory('Movimiento sin descripción reconocible xyz123');
    expect(result).toBeNull();
  });

  it('no modifica el comportamiento de categorizeWithRules() — sigue devolviendo "Comida" tal cual', () => {
    // Guard de regresión: confirma que el wrapper no toca DEFAULT_RULES.
    const raw = categorizeWithRules('Pizza a domicilio');
    expect(raw.category).toBe('Comida');
  });
});

// Tareas 5.6/5.7 — gate de la categorización en lote de importación (hallazgo
// de verificación de sdd-tasks, design.md §6 "ImportManager.jsx:204"/§9
// "Alcance del enforcement"; spec.md Área 6/Área 8: ninguna función de IA se
// ejecuta sin pasar el gate de plan+consentimiento, sin excepciones por tipo
// de flujo). categorizeTransactionsFull recibe un segundo parámetro booleano
// (allowAI) resuelto por el llamador (ImportManager, vía useAI().canUseAI &&
// hasConsent) — guarda previa, separada de la lógica de categorización en sí.
describe('categorizeTransactionsFull — gate de IA en lote (spec.md Área 6/8, design.md §6/§9)', () => {
  beforeEach(() => {
    vi.mocked(categorizeWithAI).mockReset();
  });

  it('sin acceso (allowAI=false), NO invoca categorizeWithAI y cae a "Otros" para lo que no matchea reglas locales', async () => {
    const transactions = [{ description: 'Pago recurrente XYZ Corp', date: '2026-01-01', amount: 10 }];

    const result = await categorizeTransactionsFull(transactions, false);

    expect(categorizeWithAI).not.toHaveBeenCalled();
    expect(result).toEqual([
      { description: 'Pago recurrente XYZ Corp', date: '2026-01-01', amount: 10, category: 'Otros', emoji: '📦', source: 'fallback' },
    ]);
  });

  it('sin acceso (allowAI ausente, valor por defecto), tampoco invoca categorizeWithAI — fail-closed por defecto', async () => {
    const transactions = [{ description: 'Suscripción de streaming genérico ZZ', date: '2026-01-02', amount: 20 }];

    const result = await categorizeTransactionsFull(transactions);

    expect(categorizeWithAI).not.toHaveBeenCalled();
    expect(result[0].category).toBe('Otros');
    expect(result[0].source).toBe('fallback');
  });

  it('con acceso (allowAI=true), SÍ invoca categorizeWithAI para las descripciones sin match local (comportamiento preexistente preservado)', async () => {
    vi.mocked(categorizeWithAI).mockResolvedValue([
      { description: 'Pago recurrente XYZ Corp', category: 'Servicios' },
    ]);
    const transactions = [{ description: 'Pago recurrente XYZ Corp', date: '2026-01-01', amount: 10 }];

    const result = await categorizeTransactionsFull(transactions, true);

    expect(categorizeWithAI).toHaveBeenCalledWith(['Pago recurrente XYZ Corp']);
    expect(result[0].category).toBe('Servicios');
    expect(result[0].source).toBe('ai');
  });

  it('con acceso (allowAI=true), una descripción que SÍ matchea reglas locales no llega a categorizeWithAI (sin cambios de comportamiento)', async () => {
    const transactions = [{ description: 'Viaje en Uber', date: '2026-01-03', amount: 8 }];

    const result = await categorizeTransactionsFull(transactions, true);

    expect(categorizeWithAI).not.toHaveBeenCalled();
    expect(result[0].category).toBe('Transporte');
    expect(result[0].source).toBe('rules');
  });
});
