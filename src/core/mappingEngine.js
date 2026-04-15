/**
 * mappingEngine.js
 * Motor de detección automática de columnas basado en alias y patrones.
 * Encargado de identificar: Fecha, Monto y Descripción.
 */

import { normalizeHeader } from './headerDetector';

/** Diccionario de alias optimizado para detección regional */
export const COLUMN_ALIASES = {
  date: [
    'fecha', 'date', 'fch', 'fecha transaccion', 'fecha operacion', 'fecha txn',
    'posting date', 'transaction date', 'valor', 'fecha valor', 'dia', 'day'
  ],
  amount: [
    'monto', 'amount', 'importe', 'valor', 'value', 'egreso', 'ingreso',
    'debito', 'credito', 'debe', 'haber', 'cargo', 'abono', 'suma'
  ],
  description: [
    'descripcion', 'description', 'detalle', 'concepto', 'comercio',
    'memo', 'narracion', 'detalle movimiento', 'glosa', 'comentarios'
  ]
};

/**
 * Encuentra los índices de las columnas críticas
 * @param {string[]} headers Array de cabeceras originales del CSV
 * @returns {Object} { date, amount, description, confidence }
 */
export const findColumnIndices = (headers) => {
  const mapping = {
    date: null,
    amount: null,
    description: null,
    confidence: 0
  };

  const normalized = headers.map(normalizeHeader);
  let detectedCount = 0;

  // Analizar cada header vs nuestro diccionario
  normalized.forEach((header, index) => {
    // 1. Detección de Fecha (exact o inclusión parcial, ej: "fecha tran")
    if (mapping.date === null && (
      COLUMN_ALIASES.date.includes(header) ||
      COLUMN_ALIASES.date.some(alias => header.includes(alias) || alias.includes(header))
    )) {
      mapping.date = index;
      detectedCount++;
    }
    // 2. Detección de Monto (prioridad a exacta, luego inclusión)
    else if (mapping.amount === null && (
      COLUMN_ALIASES.amount.includes(header) || 
      COLUMN_ALIASES.amount.some(alias => header.includes(alias))
    )) {
      mapping.amount = index;
      detectedCount++;
    }
    // 3. Detección de Descripción
    else if (mapping.description === null && (
      COLUMN_ALIASES.description.includes(header) ||
      COLUMN_ALIASES.description.some(alias => header.includes(alias))
    )) {
      mapping.description = index;
      detectedCount++;
    }
  });

  // Calcular Confidence Score (0.0 a 1.0)
  mapping.confidence = Number((detectedCount / 3).toFixed(2));

  return mapping;
};
