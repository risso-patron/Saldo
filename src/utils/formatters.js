/**
 * Formatea un número como moneda en dólares
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada (ej: "$1,234.56")
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  
  const safeCode = currencyCode === 'PAB' ? 'USD' : currencyCode;
  try {
    let formatted = new Intl.NumberFormat('es-419', {
      style: 'currency',
      currency: safeCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    
    if (currencyCode === 'PAB') {
      formatted = formatted.replace('US$', 'B/.');
    }
    return formatted;
  } catch {
    return `$${amount.toFixed(2)}`;
  }
};

/**
 * Formatea una fecha a formato legible
 * @param {Date|string} date - Fecha a formatear
 * @param {Object} options - Opciones de formato (opcional)
 * @returns {string} - Fecha formateada (ej: "3 de Nov, 2025")
 */
export const formatDate = (date, options = {}, locale = undefined) => {
  if (date === null || date === undefined) return 'Fecha inválida';
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };

  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
};

/**
 * Formatea un número como porcentaje
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (default: 1)
 * @returns {string} - Porcentaje formateado (ej: "45.5%")
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }

  return `${value.toFixed(decimals)}%`;
};

/**
 * Formatea un porcentaje sin mentir hacia cero (HAL-004).
 * "0%" queda reservado para el cero exacto; un valor real chico nunca se
 * disfraza de cero, porque redondear información existente a "0%" es la
 * clase de dato incorrecto que destruye la confianza en toda la app.
 *
 * Convención:
 *   v === 0        → "0%"    (cero verdadero es información verdadera)
 *   0 < |v| < 0.1  → "≈0%"   (existe pero es despreciable; sin fingir precisión)
 *   0.1 ≤ |v| < 1  → "0.3%"  (un decimal — el valor real)
 *   |v| ≥ 1        → "12%"   (toFixed(decimals), default 0: aspecto actual)
 *
 * @param {number} value - Porcentaje en escala 0-100 (ej: 12.4, no 0.124)
 * @param {number} decimals - Decimales para |v| ≥ 1 (default: 0)
 * @returns {string} - Porcentaje formateado
 */
export const formatPercentageSafe = (value, decimals = 0) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0%';
  }
  if (value === 0) return '0%';

  const abs = Math.abs(value);
  if (abs < 0.1) return '≈0%';
  if (abs < 1) return `${value.toFixed(1)}%`;

  return `${value.toFixed(decimals)}%`;
};

/**
 * Trunca un texto si excede la longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} - Texto truncado con "..."
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  return `${text.substring(0, maxLength)}...`;
};
