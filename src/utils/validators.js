import { isValidAmount } from './currencyHelpers';

/**
 * Valida que una descripción no esté vacía y sea segura
 * @param {string} description - Descripción a validar
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return { isValid: false, error: 'La descripción es requerida' };
  }
  
  const trimmed = description.trim();
  
  if (!description || description.trim() === '') {
    return { isValid: false, error: 'La descripción es obligatoria' };
  }
  if (description.length < 3) {
    return { isValid: false, error: 'La descripción debe tener al menos 3 caracteres' };
  }
  if (description.length > 100) {
    return { isValid: false, error: 'La descripción no debe exceder los 100 caracteres' };
  }
  
  // Validar caracteres peligrosos
  const dangerousChars = /<script|<iframe|javascript:|onerror=/i;
  if (dangerousChars.test(trimmed)) {
    return { isValid: false, error: 'La descripción contiene caracteres no permitidos' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Valida que una cantidad sea válida
 * @param {number|string} amount - Cantidad a validar
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateAmount = (amount) => {
  if (!amount || amount === '' || amount === '0' || amount === 0) {
    return { isValid: false, error: 'El monto debe ser mayor a $0.00' };
  }
  
  if (!isValidAmount(amount)) {
    return { isValid: false, error: 'Ingresa un monto válido (máx. $999,999.99)' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Valida categoría
 * @param {string} category - Categoría a validar
 * @param {Array} allowedCategories - Categorías permitidas
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateCategory = (category, allowedCategories) => {
  if (!category) {
    return { isValid: false, error: 'Debes seleccionar una categoría' };
  }
  
  const isAllowed = allowedCategories.some(cat => cat.value === category);
  
  if (!isAllowed) {
    return { isValid: false, error: 'Categoría no válida' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Valida fecha
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {boolean} allowFuture - Permitir fechas futuras
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateDate = (date, allowFuture = false) => {
  if (!date) {
    return { isValid: false, error: 'La fecha es requerida' };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Fecha inválida' };
  }
  
  if (!allowFuture) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    
    if (dateObj > today) {
      return { isValid: false, error: 'No se permiten fechas futuras' };
    }
  }
  
  // Validar que no sea demasiado antigua (10 años)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  
  if (dateObj < tenYearsAgo) {
    return { isValid: false, error: 'Fecha demasiado antigua (máx. 10 años)' };
  }
  
  return { isValid: true, error: null };
};

/**
 * Valida un objeto de transacción completo
 * @param {Object} transaction - Transacción a validar
 * @param {boolean} requireCategory - Si la categoría es requerida
 * @param {Array} allowedCategories - Categorías permitidas (si aplica)
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateTransaction = (transaction, requireCategory = false, allowedCategories = []) => {
  const errors = {};
  
  // Validar descripción
  const descValidation = validateDescription(transaction.description);
  if (!descValidation.isValid) {
    errors.description = descValidation.error;
  }
  
  // Validar monto
  const amountValidation = validateAmount(transaction.amount);
  if (!amountValidation.isValid) {
    errors.amount = amountValidation.error;
  }
  
  // Validar categoría si es requerida
  if (requireCategory) {
    const catValidation = validateCategory(transaction.category, allowedCategories);
    if (!catValidation.isValid) {
      errors.category = catValidation.error;
    }
  }
  
  // Validar fecha si existe
  if (transaction.date) {
    const dateValidation = validateDate(transaction.date);
    if (!dateValidation.isValid) {
      errors.date = dateValidation.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitiza un string para evitar XSS
 * @param {string} str - String a sanitizar
 * @returns {string} - String sanitizado
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
