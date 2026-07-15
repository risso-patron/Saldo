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

/**
 * Enmascara un valor de muestra preservando su FORMA (longitud, puntuación,
 * separadores) pero nunca su contenido real: letras → 'X', dígitos → '9'.
 * Alcanza para que el modelo distinga fecha/monto/texto por patrón (ej.
 * "15/07/2026" → "99/99/9999", "1,234.56" → "9,999.99") sin exponer un
 * número de cuenta, monto real ni nombre de comercio en texto plano
 * (spec.md Área 7 "Mapeo de columnas CSV — encabezados, sin filas completas
 * sin enmascarar").
 * @param {*} value
 * @returns {string}
 */
const maskSampleValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/\p{L}/gu, 'X')
    .replace(/[0-9]/g, '9');
};

const buildMapColumnsPrompt = (headers, sampleRows) => {
  const maskedRows = sampleRows
    .slice(0, 3)
    .map((row, i) => `Fila ${i + 1}: ${JSON.stringify(row.map(maskSampleValue))}`)
    .join('\n');

  return `Eres un experto en extractos bancarios latinoamericanos. Mapea las columnas de este CSV al esquema interno.

Headers detectados: ${JSON.stringify(headers)}
Filas de muestra (valores enmascarados por privacidad — letras/dígitos reemplazados, conservan formato):
${maskedRows}

Esquema interno:
- fecha: columna con la fecha de la transacción
- descripcion: nombre del comercio o descripción del movimiento
- monto: columna de importe si hay UNA sola columna numérica
- debito: columna de débitos/cargos/retiros (si hay columnas separadas D/C)
- credito: columna de créditos/abonos/depósitos (si hay columnas separadas D/C)
- tipo: columna que indica explícitamente si es ingreso o gasto (omitir si no existe)
- categoria: columna de categoría (omitir si no existe)

REGLAS:
1. Si hay columnas separadas de débito y crédito → usa "debito" y "credito", NO "monto"
2. Si hay una sola columna de importe → usa "monto"
3. Usa el nombre EXACTO de la columna original tal como aparece en los headers
4. Pon null para los campos que no puedas identificar con certeza

Responde SOLO JSON sin explicaciones:
{
  "fecha": "...",
  "descripcion": "...",
  "monto": null,
  "debito": "...",
  "credito": "...",
  "tipo": null,
  "categoria": null
}`;
};

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

/**
 * mapColumns — refactor de `mapCSVColumns` (`ai-providers.js:365-416`
 * anterior a este cambio, tarea 1.14/1.15): arma el prompt con los headers
 * (texto plano) y filas de muestra ENMASCARADAS (nunca texto plano, spec.md
 * Área 7), parsea la respuesta de Groq y llama al proxy vía `callViaProxy`.
 * Conserva la MISMA firma de salida (`ColumnMap` plano, sin envolver) que ya
 * consume `ImportManager`.
 * @param {string[]} headers
 * @param {string[][]} sampleRows
 * @returns {Promise<import('./aiProvider').ColumnMap>}
 * @throws {Error} error controlado si la respuesta de Groq no trae JSON
 *   parseable — nunca se inventa un mapeo a partir de una respuesta rota
 *   (Principio 1).
 */
const mapColumns = async (headers, sampleRows) => {
  const prompt = buildMapColumnsPrompt(headers, sampleRows);
  const result = await callViaProxy(prompt);

  const jsonMatch = result?.content?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('ai_malformed_response: la respuesta de Groq no contiene JSON');
  }

  let raw;
  try {
    raw = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('ai_malformed_response: el JSON de Groq no es válido');
  }

  const columnMap = {};
  for (const [key, val] of Object.entries(raw)) {
    if (val && val !== 'null' && val !== 'None' && val !== '') {
      columnMap[key] = val;
    }
  }
  return columnMap;
};

/** @type {import('./aiProvider').AIProvider} */
export const groqProvider = {
  categorize,
  mapColumns,
  // generateIdea/predict: fuera de alcance de este checkpoint (Checkpoint 3
  // implementa solo mapColumns de las 3 capacidades pendientes de 1.14/1.15).
  // No se implementan todavía — cualquier consumidor que las invoque antes de
  // esa fase recibe un rechazo controlado, nunca una excepción sin manejar
  // (Principio 6).
  generateIdea: () => Promise.reject(new Error('not_implemented: groqProvider.generateIdea — fase posterior')),
  predict: () => Promise.reject(new Error('not_implemented: groqProvider.predict — fase posterior')),
};

export default groqProvider;
