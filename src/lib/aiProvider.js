/**
 * src/lib/aiProvider.js — AIProvider Interface (contrato, sin lógica runtime).
 *
 * design.md §1 (Capa de abstracción de proveedor) y §4 (contrato `AIProvider`).
 * El dominio de Saldo (`AIContext` y cualquier consumidor) depende EXCLUSIVAMENTE
 * de esta interfaz, expresada en términos de capacidades — nunca de Groq.
 *
 * La implementación concreta (armado de prompts Groq, parseo de su JSON, llamada
 * HTTP al proxy) vive detrás de esta interfaz en `src/lib/groqProvider.js`
 * (Checkpoint 2 de `insights-ia-real` — no implementada todavía en este archivo).
 * Sustituir Groq por otro proveedor = escribir otra implementación de `AIProvider`;
 * ningún módulo de dominio se toca.
 *
 * Este archivo NO importa React ni `ai-providers.js`/`groqProvider.js` — es puro
 * contrato JSDoc, sin código ejecutable.
 */

/**
 * @typedef {Object} CategoryAggregate
 * @property {string} category - nombre de la categoría
 * @property {number} total - monto total agregado en esa categoría/período
 * @property {string} [period] - período al que corresponde el agregado (ej. '2026-07')
 */

/**
 * @typedef {Object} CategorizeResult
 * @property {string} category - categoría sugerida
 * @property {number} confidence - confianza cruda 0..1 (el mapeo a etiqueta ocurre en el gateway, no acá)
 */

/**
 * @typedef {Object} Idea
 * @property {string} category - categoría sobre la que trata el hallazgo
 * @property {string} message - mensaje honesto y accionable para el usuario
 */

/**
 * @typedef {Object} Prediction
 * @property {Object<string, number>} predictions - monto previsto por categoría para el próximo período
 */

/**
 * @typedef {Object} ColumnMap
 * @property {string} [fecha] - nombre de columna original mapeado a fecha
 * @property {string} [descripcion] - nombre de columna original mapeado a descripción
 * @property {string} [monto] - nombre de columna original mapeado a monto (columna única)
 * @property {string} [debito] - nombre de columna original mapeado a débito
 * @property {string} [credito] - nombre de columna original mapeado a crédito
 * @property {string} [tipo] - nombre de columna original mapeado a tipo (ingreso/gasto)
 * @property {string} [categoria] - nombre de columna original mapeado a categoría
 */

/**
 * AIProvider — interfaz que oculta el proveedor concreto (Groq u otro) al dominio.
 * Ninguna implementación se declara acá: este archivo documenta únicamente el
 * contrato mediante JSDoc (`@callback`/`@typedef`), sin lógica de ejecución.
 *
 * @callback AIProviderCategorize
 * @param {string} description - descripción del movimiento (único dato enviado, p3)
 * @returns {Promise<CategorizeResult | null>} null = abstención/sin resultado (p1)
 */

/**
 * @callback AIProviderGenerateIdea
 * @param {CategoryAggregate[]} aggregates - agregados por categoría/período, nunca transacciones individuales (p3, Área 7)
 * @returns {Promise<Idea | null>} null = abstención (p1, "Una idea sobre tu plata")
 */

/**
 * @callback AIProviderPredict
 * @param {CategoryAggregate[]} aggregates - agregados por categoría/mes (p3, Área 7)
 * @returns {Promise<Prediction | null>} null = abstención (p1)
 */

/**
 * @callback AIProviderMapColumns
 * @param {string[]} headers - encabezados del archivo CSV
 * @param {string[][]} sampleRows - filas de muestra (enmascaradas si contienen datos sensibles, Área 7)
 * @returns {Promise<ColumnMap>}
 */

/**
 * @typedef {Object} AIProvider
 * @property {AIProviderCategorize} categorize - categorización asistida
 * @property {AIProviderGenerateIdea} generateIdea - "Una idea sobre tu plata"
 * @property {AIProviderPredict} predict - mirada a futuro
 * @property {AIProviderMapColumns} mapColumns - mapeo de columnas CSV import
 */

export {};
