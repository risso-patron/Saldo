import { describe, it, expect } from 'vitest';
import {
  validateDescription,
  validateAmount,
  validateCategory,
  validateDate,
  validateTransaction,
} from '../utils/validators';

// ─── validateDescription ───────────────────────────────────────────────────

describe('validateDescription', () => {
  it('rechaza valor null', () => {
    expect(validateDescription(null)).toMatchObject({ isValid: false });
  });

  it('rechaza string vacío', () => {
    expect(validateDescription('')).toMatchObject({ isValid: false });
  });

  it('rechaza string solo espacios', () => {
    expect(validateDescription('   ')).toMatchObject({ isValid: false });
  });

  it('rechaza descripción menor a 3 caracteres', () => {
    expect(validateDescription('ab')).toMatchObject({ isValid: false });
  });

  it('rechaza descripción con más de 100 caracteres', () => {
    const long = 'a'.repeat(101);
    expect(validateDescription(long)).toMatchObject({ isValid: false });
  });

  it('rechaza contenido con <script>', () => {
    expect(validateDescription('<script>alert(1)</script>')).toMatchObject({ isValid: false });
  });

  it('rechaza contenido con onerror=', () => {
    expect(validateDescription('img onerror=XSS')).toMatchObject({ isValid: false });
  });

  it('rechaza contenido con javascript:', () => {
    expect(validateDescription('javascript:void(0)')).toMatchObject({ isValid: false });
  });

  it('acepta descripción válida mínima (3 chars)', () => {
    expect(validateDescription('abc')).toMatchObject({ isValid: true, error: null });
  });

  it('acepta descripción válida normal', () => {
    expect(validateDescription('Salario del mes de enero')).toMatchObject({ isValid: true });
  });

  it('acepta descripción con caracteres especiales seguros', () => {
    expect(validateDescription('Café & panadería 100%')).toMatchObject({ isValid: true });
  });

  it('acepta descripción de exactamente 100 caracteres', () => {
    const exact = 'a'.repeat(100);
    expect(validateDescription(exact)).toMatchObject({ isValid: true });
  });
});

// ─── validateAmount ────────────────────────────────────────────────────────

describe('validateAmount', () => {
  it('rechaza undefined', () => {
    expect(validateAmount(undefined)).toMatchObject({ isValid: false });
  });

  it('rechaza string vacío', () => {
    expect(validateAmount('')).toMatchObject({ isValid: false });
  });

  it('rechaza cero como número', () => {
    expect(validateAmount(0)).toMatchObject({ isValid: false });
  });

  it('rechaza cero como string', () => {
    expect(validateAmount('0')).toMatchObject({ isValid: false });
  });

  it('acepta valor negativo (el sanitizer elimina el signo: -100 → 100)', () => {
    // cleanCurrencyInput strips non-numeric chars including '-', so -100 becomes 100
    expect(validateAmount(-100)).toMatchObject({ isValid: true });
  });

  it('rechaza valor que supera 999999.99', () => {
    expect(validateAmount(1000000)).toMatchObject({ isValid: false });
  });

  it('rechaza más de 2 decimales', () => {
    expect(validateAmount('10.999')).toMatchObject({ isValid: false });
  });

  it('rechaza texto no numérico', () => {
    expect(validateAmount('abc')).toMatchObject({ isValid: false });
  });

  it('acepta 1 (monto mínimo positivo)', () => {
    expect(validateAmount(1)).toMatchObject({ isValid: true });
  });

  it('acepta monto entero como string', () => {
    expect(validateAmount('500')).toMatchObject({ isValid: true });
  });

  it('acepta monto con 1 decimal', () => {
    expect(validateAmount('10.5')).toMatchObject({ isValid: true });
  });

  it('acepta monto con 2 decimales', () => {
    expect(validateAmount('999.99')).toMatchObject({ isValid: true });
  });

  it('acepta valor máximo exacto 999999.99', () => {
    expect(validateAmount('999999.99')).toMatchObject({ isValid: true });
  });
});

// ─── validateCategory ──────────────────────────────────────────────────────

describe('validateCategory', () => {
  const CATS = [
    { value: 'Alimentación' },
    { value: 'Transporte' },
    { value: 'Salud' },
  ];

  it('rechaza undefined', () => {
    expect(validateCategory(undefined, CATS)).toMatchObject({ isValid: false });
  });

  it('rechaza string vacío', () => {
    expect(validateCategory('', CATS)).toMatchObject({ isValid: false });
  });

  it('rechaza categoría no listada', () => {
    expect(validateCategory('Gastos Secretos', CATS)).toMatchObject({ isValid: false });
  });

  it('acepta categoría válida', () => {
    expect(validateCategory('Alimentación', CATS)).toMatchObject({ isValid: true, error: null });
  });

  it('acepta cualquier categoría de la lista', () => {
    CATS.forEach(({ value }) => {
      expect(validateCategory(value, CATS)).toMatchObject({ isValid: true });
    });
  });
});

// ─── validateDate ──────────────────────────────────────────────────────────

describe('validateDate', () => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  // Usar fecha claramente futura para evitar problemas de timezone (+1 día en UTC
  // puede resolverse al día actual en zonas UTC-5)
  const tomorrow = '2099-12-31';
  const elevenYearsAgo = new Date();
  elevenYearsAgo.setFullYear(elevenYearsAgo.getFullYear() - 11);
  const tooOld = elevenYearsAgo.toISOString().split('T')[0];

  it('rechaza fecha vacía', () => {
    expect(validateDate('')).toMatchObject({ isValid: false });
  });

  it('rechaza fecha inválida', () => {
    expect(validateDate('no-es-fecha')).toMatchObject({ isValid: false });
  });

  it('rechaza fecha futura por defecto', () => {
    expect(validateDate(tomorrow)).toMatchObject({ isValid: false });
  });

  it('rechaza fecha con más de 10 años de antigüedad', () => {
    expect(validateDate(tooOld)).toMatchObject({ isValid: false });
  });

  it('acepta fecha de hoy', () => {
    expect(validateDate(today)).toMatchObject({ isValid: true });
  });

  it('acepta fecha de ayer', () => {
    expect(validateDate(yesterday)).toMatchObject({ isValid: true });
  });

  it('acepta fecha futura si allowFuture = true', () => {
    expect(validateDate(tomorrow, true)).toMatchObject({ isValid: true });
  });
});

// ─── validateTransaction ───────────────────────────────────────────────────

describe('validateTransaction', () => {
  const today = new Date().toISOString().split('T')[0];
  const CATS = [{ value: 'Alimentación' }];

  it('devuelve isValid:false cuando descripción es inválida', () => {
    const result = validateTransaction({ description: '', amount: 100, date: today });
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('description');
  });

  it('devuelve isValid:false cuando monto es cero', () => {
    const result = validateTransaction({ description: 'Sueldo', amount: 0, date: today });
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('amount');
  });

  it('devuelve isValid:false cuando requireCategory=true y falta categoría', () => {
    const result = validateTransaction(
      { description: 'Almuerzo', amount: 10, date: today },
      true,
      CATS
    );
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('category');
  });

  it('devuelve isValid:true para ingreso válido sin categoría', () => {
    const result = validateTransaction({ description: 'Sueldo mensual', amount: 1500, date: today });
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('devuelve isValid:true para gasto válido con categoría requerida', () => {
    const result = validateTransaction(
      { description: 'Supermercado', category: 'Alimentación', amount: 50, date: today },
      true,
      CATS
    );
    expect(result.isValid).toBe(true);
  });

  it('acumula múltiples errores simultáneamente', () => {
    const result = validateTransaction(
      { description: '', amount: 0, date: today },
      true,
      CATS
    );
    expect(result.isValid).toBe(false);
    // Al menos descripción y monto deben fallar
    expect(Object.keys(result.errors).length).toBeGreaterThanOrEqual(2);
  });
});
