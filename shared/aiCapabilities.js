/**
 * shared/aiCapabilities.js — FUENTE ÚNICA del catálogo capacidad→planes de IA.
 *
 * Carpeta neutral en la RAÍZ del repo (fuera de `src/` y de `netlify/functions/`):
 * módulo ESM plano, SIN `import.meta.env`, SIN React, SIN dependencias de framework —
 * importable por AMBOS lados:
 *   cliente:  import { AI_CAPABILITIES, planHasCapability } from '../../shared/aiCapabilities';
 *   servidor: import { AI_CAPABILITIES, planHasCapability } from '../../shared/aiCapabilities';
 *
 * Resuelve la ex-R3 (design.md §4/§9): la autorización real sigue siendo del servidor
 * (`ai-proxy.js`), pero la DEFINICIÓN de qué capacidades existen y qué planes las
 * habilitan vive una sola vez acá. Ninguna otra tabla de features puede divergir.
 */

// Paridad con useSubscription.js:102-104 — planes que incluyen IA.
export const AI_PLANS_WITH_AI = ['pro_monthly', 'pro_yearly', 'lifetime'];

// capacidad de dominio → feature de plan que la habilita (nombres ya usados en useSubscription)
export const AI_CAPABILITIES = {
  assisted_categorization: { feature: 'ai_analysis', plans: AI_PLANS_WITH_AI }, // MVP visible
  spending_idea: { feature: 'ai_analysis', plans: AI_PLANS_WITH_AI }, // "Una idea sobre tu plata"
  future_glimpse: { feature: 'ai_predictions', plans: AI_PLANS_WITH_AI }, // mirada a futuro
  csv_column_mapping: { feature: 'ai_analysis', plans: AI_PLANS_WITH_AI }, // mapeo import
};

/**
 * @param {string} planType tipo de plan (ej. 'free', 'pro_monthly', 'lifetime')
 * @param {string} capability capacidad de dominio (ej. 'assisted_categorization')
 * @returns {boolean} true si el planType incluye la capacidad. Misma verdad en cliente y servidor.
 */
export function planHasCapability(planType, capability) {
  return Boolean(AI_CAPABILITIES[capability]?.plans.includes(planType));
}
