import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeCategory, sanitizeAmount } from '../utils/sanitize';

// ─── sanitizeText ──────────────────────────────────────────────────────────

describe('sanitizeText', () => {
  it('devuelve string vacío para valor no-string', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(42)).toBe('');
  });

  it('elimina tags HTML', () => {
    expect(sanitizeText('<b>hola</b>')).toBe('hola');
  });

  it('elimina tag script completo', () => {
    const input = '<script>alert("xss")</script>texto';
    expect(sanitizeText(input)).not.toContain('<script>');
    expect(sanitizeText(input)).toContain('texto');
  });

  it('elimina atributos javascript:', () => {
    const input = 'javascript:void(0) texto';
    expect(sanitizeText(input)).not.toContain('javascript:');
  });

  it('elimina event handlers (onclick=)', () => {
    const input = 'img onclick=alert(1) click';
    expect(sanitizeText(input)).not.toMatch(/onclick=/i);
  });

  it('elimina event handlers (onerror=)', () => {
    const input = 'img onerror=xss algo';
    expect(sanitizeText(input)).not.toMatch(/onerror=/i);
  });

  it('respeta maxLength por defecto (200)', () => {
    const long = 'a'.repeat(300);
    expect(sanitizeText(long)).toHaveLength(200);
  });

  it('respeta maxLength personalizado', () => {
    const long = 'a'.repeat(100);
    expect(sanitizeText(long, 50)).toHaveLength(50);
  });

  it('preserva texto limpio sin modificaciones', () => {
    expect(sanitizeText('Salario mensual 2025')).toBe('Salario mensual 2025');
  });

  it('recorta espacios en extremos (trim)', () => {
    expect(sanitizeText('  texto  ')).toBe('texto');
  });

  it('preserva caracteres especiales seguros', () => {
    const input = 'Café & panadería 100%';
    expect(sanitizeText(input)).toBe(input);
  });
});

// ─── sanitizeCategory ─────────────────────────────────────────────────────

describe('sanitizeCategory', () => {
  it('devuelve string vacío para valor no-string', () => {
    expect(sanitizeCategory(null)).toBe('');
    expect(sanitizeCategory(undefined)).toBe('');
    expect(sanitizeCategory(123)).toBe('');
  });

  it('elimina tags HTML', () => {
    expect(sanitizeCategory('<b>Comida</b>')).toBe('Comida');
  });

  it('elimina caracteres no permitidos (puntuación especial)', () => {
    const result = sanitizeCategory('Alimentación!@#$');
    expect(result).not.toMatch(/[!@#$]/);
  });

  it('preserva letras con tilde y ñ', () => {
    expect(sanitizeCategory('Alimentación')).toContain('Alimentación');
    expect(sanitizeCategory('Niños')).toContain('Niños');
  });

  it('preserva guiones', () => {
    expect(sanitizeCategory('Sub-categoría')).toContain('-');
  });

  it('limita a 50 caracteres', () => {
    const long = 'Categoria'.repeat(10);
    expect(sanitizeCategory(long).length).toBeLessThanOrEqual(50);
  });

  it('preserva nombre de categoría limpio', () => {
    expect(sanitizeCategory('Transporte')).toBe('Transporte');
  });
});

// ─── sanitizeAmount ───────────────────────────────────────────────────────

describe('sanitizeAmount', () => {
  it('devuelve string vacío para valor vacío', () => {
    expect(sanitizeAmount('')).toBe('');
    expect(sanitizeAmount(null)).toBe('');
    expect(sanitizeAmount(undefined)).toBe('');
  });

  it('elimina caracteres no numéricos excepto punto decimal', () => {
    expect(sanitizeAmount('$1,234.56')).toBe('1234.56');
  });

  it('elimina letras mezcladas con números', () => {
    expect(sanitizeAmount('100abc')).toBe('100');
  });

  it('preserva un punto decimal', () => {
    expect(sanitizeAmount('10.50')).toBe('10.50');
  });

  it('conserva el número limpio intacto', () => {
    expect(sanitizeAmount('500')).toBe('500');
    expect(sanitizeAmount(500)).toBe('500');
  });

  it('maneja número de tipo number', () => {
    expect(sanitizeAmount(1234.56)).toBe('1234.56');
  });

  it('elimina signo negativo', () => {
    expect(sanitizeAmount('-100')).toBe('100');
  });
});
