/**
 * Utilidades de sanitización de inputs
 *
 * PROTEGE CONTRA:
 * - XSS (Cross-Site Scripting): elimina HTML/JS malicioso
 * - SQL Injection: aunque Supabase usa queries parametrizadas,
 *   siempre es buena práctica limpiar inputs
 * - Datos malformados: límites de longitud y caracteres válidos
 */

/**
 * Sanitiza texto libre (descripciones, notas)
 * Elimina HTML tags y limita longitud
 */
export function sanitizeText(value, maxLength = 200) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')           // Eliminar HTML tags: <script>, <img>, etc.
    .replace(/javascript:/gi, '')       // Eliminar javascript: en atributos
    .replace(/on\w+\s*=/gi, '')        // Eliminar event handlers: onclick=, onerror=, etc.
    .slice(0, maxLength)               // Limitar longitud
    .trim();
}

/**
 * Sanitiza nombres de categorías
 * Solo permite letras, números, espacios y guiones
 */
export function sanitizeCategory(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-zA-ZáéíóúñüÁÉÍÓÚÑÜ0-9\s-]/g, '')
    .slice(0, 50)
    .trim();
}

/**
 * Sanitiza montos monetarios
 * Solo permite números y un punto decimal
 */
export function sanitizeAmount(value) {
  if (value === '' || value === null || value === undefined) return '';
  const str = String(value);
  // Eliminar todo excepto dígitos y punto decimal
  const clean = str.replace(/[^0-9.]/g, '');
  // Asegurar que solo haya un punto decimal
  const parts = clean.split('.');
  if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
  return clean;
}

/**
 * Sanitiza fechas (formato YYYY-MM-DD)
 */
export function sanitizeDate(value) {
  if (typeof value !== 'string') return '';
  // Solo permitir el formato de fecha
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const [, year, month, day] = match;
  // Validar rangos básicos
  if (
    parseInt(year) < 2000 || parseInt(year) > 2100 ||
    parseInt(month) < 1 || parseInt(month) > 12 ||
    parseInt(day) < 1 || parseInt(day) > 31
  ) return '';
  return value;
}

/**
 * Sanitiza email
 */
export function sanitizeEmail(value) {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')
    .toLowerCase()
    .trim()
    .slice(0, 254); // Límite RFC 5321
}

/**
 * Sanitiza un objeto de transacción completo
 */
export function sanitizeTransaction(data) {
  return {
    description: sanitizeText(data.description, 200),
    category: sanitizeCategory(data.category),
    amount: sanitizeAmount(data.amount),
    date: sanitizeDate(data.date),
  };
}
