/**
 * categorizationEngine.js
 * Motor de clasificación híbrida (Reglas Locales + IA Fallback).
 * Asigna categorías y emojis optimizando llamadas a la nube.
 */

import { categorizeWithAI } from '../services/aiService';

const DEFAULT_RULES = [
  { keywords: ['uber', 'taxi', 'cabify', 'diDi', 'indriver', 'transporte'], category: 'Transporte', emoji: '🚗' },
  { keywords: ['mcdonald', 'burger', 'pizza', 'kfc', 'starbucks', 'restaurante', 'food', 'comida', 'supermercado', 'rey', 'super 99', 'riba smith'], category: 'Comida', emoji: '🍔' },
  { keywords: ['netflix', 'spotify', 'disney', 'hbomax', 'cine', 'cinema', 'entretenimiento', 'gaming', 'steam', 'playstation', 'xbox'], category: 'Entretenimiento', emoji: '🎬' },
  { keywords: ['farmacia', 'hospital', 'clinica', 'medico', 'doctor', 'salud', 'gym', 'ejercicio', 'sporting'], category: 'Salud', emoji: '🏥' },
  { keywords: ['telered', 'naturgy', 'ensame', 'agua', 'luz', 'cable', 'internet', 'tigo', 'mas movil', 'servicios', 'publicos'], category: 'Servicios', emoji: '🔌' },
  { keywords: ['amazon', 'aliexpress', 'shein', 'zara', 'compras', 'tienda', 'retail', 'tiendas por departamento'], category: 'Compras', emoji: '🛍️' },
  { keywords: ['abono', 'nomina', 'sueldo', 'pago planilla', 'salario', 'transferencia recibida', 'deposito', 'ingreso'], category: 'Ingresos', emoji: '💰' }
];

/** Caché de resultados (Reglas + IA) */
const categorizationCache = {};

/** Mapeo de Emojis por Categoría (para resultados de IA) */
const CATEGORY_EMOJIS = {
  'Transporte': '🚗',
  'Comida': '🍔',
  'Entretenimiento': '🎬',
  'Salud': '🏥',
  'Servicios': '🔌',
  'Compras': '🛍️',
  'Ingresos': '💰',
  'Educación': '📚',
  'Vivienda': '🏠',
  'Otros': '📦'
};

/** Categoriza una sola transacción usando REGLAS LOCALES (Síncrono) */
export const categorizeWithRules = (description) => {
  const desc = (description || '').toLowerCase();
  
  // 1. Verificar cache
  if (categorizationCache[desc]) return categorizationCache[desc];
  
  // 2. Buscar en reglas locales
  for (const rule of DEFAULT_RULES) {
    if (rule.keywords.some(kw => desc.includes(kw.toLowerCase()))) {
      const result = { category: rule.category, emoji: rule.emoji, source: 'rules' };
      categorizationCache[desc] = result;
      return result;
    }
  }
  
  return null; // Indica que se necesita IA o fallback
};

/**
 * Categorías de DEFAULT_RULES que ya coinciden 1:1 con EXPENSE_CATEGORIES
 * (constants/categories.js), sin necesidad de traducción. "Comida", "Compras"
 * e "Ingresos" quedan fuera a propósito — no existen en EXPENSE_CATEGORIES y
 * requieren una decisión de arquitectura antes de sugerirse (ver HAL-009/HAL-010).
 */
const SUGGESTABLE_CATEGORIES = ['Transporte', 'Entretenimiento', 'Salud', 'Servicios'];

/**
 * Sugiere una categoría para un gasto usando SOLO la heurística local ya
 * existente (categorizeWithRules) — sin IA, sin llamadas externas. No
 * modifica DEFAULT_RULES ni agrega ningún mapeo/traducción: es un filtro de
 * solo lectura sobre el resultado, limitado a SUGGESTABLE_CATEGORIES.
 * @param {string} description - Descripción del gasto.
 * @returns {{category: string, emoji: string, source: string}|null}
 */
export const suggestExpenseCategory = (description) => {
  const match = categorizeWithRules(description);
  if (!match || !SUGGESTABLE_CATEGORIES.includes(match.category)) return null;
  return match;
};

/** Categoriza un lote de transacciones usando el pipeline híbrido (Híbrido) */
export const categorizeTransactionsFull = async (transactions) => {
  const results = [];
  const pendingForAI = [];
  const descriptionIndices = new Map(); // Para re-insertar resultados de IA

  // 1. PASO 1: Reglas Locales
  transactions.forEach((t, i) => {
    const localMatch = categorizeWithRules(t.description);
    if (localMatch) {
      results[i] = { ...t, ...localMatch };
    } else {
      // Si no hay match, marcar para IA (evitando duplicados en el batch)
      if (!descriptionIndices.has(t.description)) {
        descriptionIndices.set(t.description, []);
      }
      descriptionIndices.get(t.description).push(i);
      
      // Solo agregamos a la lista de batch descripciones únicas
      if (descriptionIndices.get(t.description).length === 1) {
        pendingForAI.push(t.description);
      }
    }
  });

  // 2. PASO 2: IA como Fallback (en lotes de 20 por eficiencia)
  if (pendingForAI.length > 0) {
    const BATCH_SIZE = 20;
    
    for (let i = 0; i < pendingForAI.length; i += BATCH_SIZE) {
      const batch = pendingForAI.slice(i, i + BATCH_SIZE);
      const aiResults = await categorizeWithAI(batch);

      aiResults.forEach(aiItem => {
        const indices = descriptionIndices.get(aiItem.description);
        const finalCategory = aiItem.category || 'Otros';
        const finalEmoji = CATEGORY_EMOJIS[finalCategory] || '📦';
        
        const aiMatch = { category: finalCategory, emoji: finalEmoji, source: 'ai' };
        
        // Guardar en cache para futuros matches
        categorizationCache[aiItem.description.toLowerCase()] = aiMatch;

        // Aplicar a todas las transacciones con esa descripción
        indices.forEach(idx => {
          results[idx] = { ...transactions[idx], ...aiMatch };
        });
      });
    }
  }

  // 3. PASO 3: Asegurar que todo tenga una categoría (Fallback final)
  return transactions.map((t, i) => results[i] || { 
    ...t, 
    category: 'Otros', 
    emoji: '📦', 
    source: 'fallback' 
  });
};
