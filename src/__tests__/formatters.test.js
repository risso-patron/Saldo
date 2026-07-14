
import { formatCurrency, formatDate, formatPercentageSafe } from '../utils/formatters'

// Tests OBJETIVO (P0 #2, HAL-004 — deben quedar en ROJO hasta implementar).
// Convención: 0 real se distingue SIEMPRE de un positivo chico redondeado —
// nunca ambos como "0%", que es la ambigüedad que originó el bug.
describe('formatPercentageSafe — nunca redondear un valor no-cero a "0%"', () => {
  it('0 real muestra "0%" — cero verdadero es información verdadera', () => {
    expect(formatPercentageSafe(0)).toBe('0%')
  })

  it('valores no numéricos o no finitos caen a "0%" (mismo guard que formatPercentage)', () => {
    expect(formatPercentageSafe(NaN)).toBe('0%')
    expect(formatPercentageSafe(Infinity)).toBe('0%')
    expect(formatPercentageSafe('12')).toBe('0%')
    expect(formatPercentageSafe(undefined)).toBe('0%')
  })

  it('banda decimal: 0.1 ≤ |v| < 1 muestra un decimal, nunca "0%"', () => {
    expect(formatPercentageSafe(0.3)).toBe('0.3%')
    expect(formatPercentageSafe(0.7)).toBe('0.7%')
    expect(formatPercentageSafe(-0.4)).toBe('-0.4%')
    expect(formatPercentageSafe(0.1)).toBe('0.1%')
  })

  it('banda mínima: 0 < |v| < 0.1 muestra "≈0%" — distinto de "0%" exacto, sin fingir precisión', () => {
    expect(formatPercentageSafe(0.03)).toBe('≈0%')
    expect(formatPercentageSafe(-0.03)).toBe('≈0%')
  })

  it('|v| ≥ 1 conserva el aspecto actual: entero redondeado por defecto', () => {
    expect(formatPercentageSafe(12.4)).toBe('12%')
    expect(formatPercentageSafe(-7.2)).toBe('-7%')
    expect(formatPercentageSafe(100)).toBe('100%')
  })

  it('acepta decimales explícitos para quien los pida', () => {
    expect(formatPercentageSafe(12.46, 1)).toBe('12.5%')
  })
})

describe('formatCurrency', () => {
  it('formats positive numbers — includes the amount', () => {
    const result = formatCurrency(1234.56)
    expect(result).toContain('1,234.56')
  })

  it('formats negative numbers — includes minus and amount', () => {
    const result = formatCurrency(-500.00)
    expect(result).toContain('500')
    expect(result).toMatch(/-/)
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })

  it('handles very large numbers', () => {
    const result = formatCurrency(1000000)
    expect(result).toContain('1,000,000')
  })

  it('handles decimal precision (rounds correctly)', () => {
    const result = formatCurrency(99.999)
    expect(result).toContain('100')
  })

  it('returns fallback for non-number input', () => {
    expect(formatCurrency('abc')).toBe('$0.00')
    expect(formatCurrency(NaN)).toBe('$0.00')
    expect(formatCurrency(undefined)).toBe('$0.00')
  })
})

describe('formatDate', () => {
  it('formats a valid date string — returns non-empty string', () => {
    const result = formatDate('2024-01-15')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
    expect(result).not.toBe('Fecha inválida')
  })

  it('handles Date objects', () => {
    const date = new Date('2024-01-15')
    const result = formatDate(date)
    expect(result).not.toBe('Fecha inválida')
    expect(typeof result).toBe('string')
  })

  it('handles invalid date string', () => {
    expect(formatDate('invalid')).toBe('Fecha inválida')
  })

  it('handles null', () => {
    expect(formatDate(null)).toBe('Fecha inválida')
  })

  it('handles undefined', () => {
    expect(formatDate(undefined)).toBe('Fecha inválida')
  })
})
