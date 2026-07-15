import { callViaProxy } from './ai-providers';

/**
 * src/lib/groqProvider.js — implementación Groq de la AIProvider Interface
 * (design.md §1 "Capa de abstracción de proveedor", §2, §4).
 *
 * El dominio de Saldo (`AIContext` y cualquier consumidor) depende
 * EXCLUSIVAMENTE del contrato `AIProvider` (`src/lib/aiProvider.js`), nunca
 * de Groq. Este archivo es la única pieza que conoce el formato de prompt y
 * de respuesta de Groq — arma el prompt, parsea su JSON y llama al proxy vía
 * `callViaProxy` (reutilizada de `ai-providers.js`, no duplicada).
 *
 * `categorize` es el refactor de `suggestCategory` (`ai-providers.js:216-220`
 * anterior a este cambio, tarea 1.12/1.13): devuelve la confianza CRUDA
 * (0..1) tal como la entrega Groq — el mapeo a etiqueta ('alta'/'media'/
 * 'baja') ocurre en el gateway (`AIContext`, vía `aiConfidence.js`), no acá
 * (design.md §4 "Fix del shape mismatch").
 */

const CATEGORY_LIST = 'Comida, Transporte, Entretenimiento, Salud, Educación, Vivienda, Servicios, Otros';

const buildCategorizePrompt = (description) => `Categoriza esta transacción en español:
"${description}"

Categorías válidas: ${CATEGORY_LIST}

Responde en JSON:
{
  "categoria": "...",
  "confianza": 0.95
}`;

/**
 * @param {string} description - único dato enviado (p3, Área 7)
 * @returns {Promise<{category: string, confidence: number}>}
 * @throws {Error} error controlado si la respuesta de Groq no trae JSON
 *   parseable o le falta el campo `categoria` — nunca se inventa una
 *   categoría a partir de una respuesta rota (Principio 1). El llamador
 *   (`AIContext.suggestCategory`) ya envuelve esto en try/catch (Principio 6).
 */
const categorize = async (description) => {
  const prompt = buildCategorizePrompt(description);
  const result = await callViaProxy(prompt);

  const jsonMatch = result?.content?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('ai_malformed_response: la respuesta de Groq no contiene JSON');
  }

  let data;
  try {
    data = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('ai_malformed_response: el JSON de Groq no es válido');
  }

  if (!data || typeof data.categoria !== 'string' || data.categoria.length === 0) {
    throw new Error('ai_malformed_response: falta "categoria" en la respuesta de Groq');
  }

  return { category: data.categoria, confidence: data.confianza };
};

/** @type {import('./aiProvider').AIProvider} */
export const groqProvider = {
  categorize,
  // generateIdea/predict/mapColumns: fuera de alcance de este checkpoint
  // (tareas 1.14/1.15). No se implementan todavía — cualquier consumidor que
  // los invoque antes de esa fase recibe un rechazo controlado, nunca una
  // excepción sin manejar (Principio 6).
  generateIdea: () => Promise.reject(new Error('not_implemented: groqProvider.generateIdea — fase posterior')),
  predict: () => Promise.reject(new Error('not_implemented: groqProvider.predict — fase posterior')),
  mapColumns: () => Promise.reject(new Error('not_implemented: groqProvider.mapColumns — fase posterior')),
};

export default groqProvider;
