// Tests OBJETIVO (HAL-001 parte 3 — deben quedar en ROJO hasta el fix).
// suggestExpenseCategory() es un wrapper de solo-lectura sobre categorizeWithRules():
// NO modifica DEFAULT_RULES, NO agrega mapeos/traducciones permanentes — solo filtra
// el resultado a las 4 categorías que YA coinciden 1:1 con EXPENSE_CATEGORIES
// (Transporte, Entretenimiento, Salud, Servicios). Cualquier otro match de la regla
// (Comida, Compras, Ingresos) se descarta sin sugerir nada — ver HAL-009/HAL-010.
import { categorizeWithRules, suggestExpenseCategory } from './categorizationEngine';

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
