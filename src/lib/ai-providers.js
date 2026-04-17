import { supabase } from './supabase';

/**
 * Proveedor de IA: Groq (Llama 3.3 70B)
 * Todas las llamadas pasan por el proxy seguro de Netlify Functions.
 * La API key vive solo en el servidor (variable de entorno GROQ_API_KEY).
 */

// ====================================
// CONFIGURACIÓN DE PROVEEDORES
// ====================================

const PROVIDERS = {
  PROXY: {
    name: 'Secure Netlify Proxy',
    free: true,
    limits: 'Definido por plan y rate limit server-side',
  },
  GROQ: {
    name: 'Groq (Llama 3.3 70B)',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    maxTokens: 2000,
    free: true,
    limits: '30 requests/minuto',
  },
};

// Sistema de caché para reducir llamadas
const responseCache = new Map();
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

// Rate limiting simple
const rateLimits = new Map();
const MAX_REQUESTS_PER_MINUTE = 20;

/**
 * Verifica rate limit
 */
const checkRateLimit = (userId) => {
  const now = Date.now();
  const userRequests = rateLimits.get(userId) || [];
  const recentRequests = userRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimits.set(userId, recentRequests);
  return true;
};

/**
 * Detecta qué proveedores están configurados
 */
export const getAvailableProviders = () => {
  // Seguridad: toda llamada de IA pasa por proxy autenticado server-side.
  return [{ id: 'PROXY', ...PROVIDERS.PROXY }];
};

/**
 * Llama al proxy seguro de Netlify Functions
 * La API key (GROQ_API_KEY) vive solo en el servidor
 */
const callViaProxy = async (prompt) => {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error('Debes iniciar sesión para usar análisis de IA.');
  }

  const response = await fetch('/.netlify/functions/ai-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ prompt, provider: 'auto' }),
  });

  if (response.status === 429) {
    throw new Error('Rate limit alcanzado. Espera 1 minuto.');
  }
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Proxy error: ${response.status}`);
  }

  const data = await response.json();
  return {
    content: data.result,
    provider: data.provider,
    model: 'proxy-secure',
  };
};

export const callAI = async (prompt, maxTokens = 2000, useCache = true) => {
  // Verificar caché
  const cacheKey = useCache ? `${prompt.substring(0, 100)}_${maxTokens}` : null;
  
  if (useCache && cacheKey) {
    const cached = responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      // Validar que la caché contiene JSON parseable antes de usarla
      try {
        if (cached.data?.content) {
          const jsonMatch = cached.data.content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error('caché inválida');
          JSON.parse(jsonMatch[0]);
        }
        return cached.data;
      } catch {
        responseCache.delete(cacheKey);
      }
    }
  }

  // Seguridad: siempre pasar por proxy autenticado server-side.
  const result = await callViaProxy(prompt);

  if (useCache && cacheKey) {
    responseCache.set(cacheKey, { data: result, timestamp: Date.now() });
  }

  return result;
};

/**
 * Construye prompt para análisis financiero
 */
const AI_LANG_NAMES = { es: 'español', en: 'English', fr: 'français' };

const buildAnalysisPrompt = (transactions, monthlyTotals, locale = 'es') => {
  const recentTransactions = transactions.slice(0, 50);
  const lang = AI_LANG_NAMES[locale] || 'español';
  
  return `Eres un asesor financiero experto. Analiza estas transacciones y proporciona:

1. **Resumen Ejecutivo**: Situación financiera en 2-3 oraciones
2. **Patrones**: 3 patrones específicos de gasto
3. **Recomendaciones**: 3 acciones concretas
4. **Score**: Número del 0-100 con justificación

**Transacciones (últimas ${recentTransactions.length}):**
${JSON.stringify(recentTransactions, null, 2)}

${monthlyTotals ? `**Totales:** ${JSON.stringify(monthlyTotals, null, 2)}` : ''}

**IMPORTANT: Respond entirely in ${lang}.**

**RESPONDE EN JSON:**
{
  "resumen": "...",
  "patrones": ["...", "...", "..."],
  "recomendaciones": ["...", "...", "..."],
  "score": 75,
  "scoreJustificacion": "..."
}`;
};

/**
 * ANÁLISIS FINANCIERO INTELIGENTE
 */
export const analyzeFinances = async (transactions, userId, monthlyTotals = null, locale = 'es') => {
  if (!checkRateLimit(userId)) {
    throw new Error('Límite de requests alcanzado. Espera 1 minuto.');
  }

  const prompt = buildAnalysisPrompt(transactions, monthlyTotals, locale);
  const result = await callAI(prompt, 2000, true);
  
  try {
    // Extraer JSON de la respuesta
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Respuesta no contiene JSON válido');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    return {
      ...analysis,
      provider: result.provider,
      model: result.model,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error parseando respuesta:', error);
    throw new Error('La IA devolvió un formato inválido');
  }
};

/**
 * CATEGORIZACIÓN AUTOMÁTICA
 */
export const suggestCategory = async (description) => {
  const prompt = `Categoriza esta transacción en español:
"${description}"

Categorías válidas: Comida, Transporte, Entretenimiento, Salud, Educación, Vivienda, Servicios, Otros

Responde en JSON:
{
  "categoria": "...",
  "confianza": 0.95
}`;

  const result = await callAI(prompt, 200, true);
  
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    const data = JSON.parse(jsonMatch[0]);
    
    return {
      category: data.categoria,
      confidence: data.confianza,
      provider: result.provider,
    };
  } catch (error) {
    return {
      category: 'Otros',
      confidence: 0.5,
      error: error.message,
    };
  }
};

/**
 * CATEGORIZACIÓN EN LOTE — 1 llamada por hasta BATCH_SIZE transacciones
 * Elimina duplicados, respeta rate limits con pausa entre batches.
 */
const BULK_BATCH_SIZE = 80;

export const bulkCategorizeTransactions = async (descriptions) => {
  const CATEGORIES = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Educación', 'Vivienda', 'Servicios', 'Otros'];

  // Deduplicar para ahorrar tokens
  const uniqueDescriptions = [...new Set(descriptions)];
  const catMap = new Map();

  for (let i = 0; i < uniqueDescriptions.length; i += BULK_BATCH_SIZE) {
    const batch = uniqueDescriptions.slice(i, i + BULK_BATCH_SIZE);

    const prompt = `Categoriza estas ${batch.length} transacciones bancarias usando SOLO estas categorías: ${CATEGORIES.join(', ')}.
Responde EXCLUSIVAMENTE con un JSON array en el mismo orden, sin texto adicional:
[{"i":0,"cat":"..."},{"i":1,"cat":"..."}]

Transacciones:
${batch.map((desc, idx) => `${idx}: "${desc}"`).join('\n')}`;

    try {
      const result = await callAI(prompt, 1200, true);
      const jsonMatch = result.content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        parsed.forEach(item => {
          if (typeof item.i === 'number' && batch[item.i]) {
            catMap.set(batch[item.i], CATEGORIES.includes(item.cat) ? item.cat : 'Otros');
          }
        });
      }
    } catch {
      // Asignar 'Otros' al batch completo si falla
      batch.forEach(desc => catMap.set(desc, 'Otros'));
    }

    // Pausa entre batches para respetar los rate limits (30 req/min en Groq)
    if (i + BULK_BATCH_SIZE < uniqueDescriptions.length) {
      await new Promise(r => setTimeout(r, 2500));
    }
  }

  return descriptions.map(desc => ({
    description: desc,
    category: catMap.get(desc) || 'Otros',
    aiConfidence: catMap.has(desc) ? 0.85 : 0,
  }));
};

/**
 * PREDICCIÓN DE GASTOS
 */
export const predictNextMonthExpenses = async (transactions, userId, locale = 'es') => {
  if (!checkRateLimit(userId)) {
    throw new Error('Límite de requests alcanzado');
  }
  const lang = AI_LANG_NAMES[locale] || 'español';

  const prompt = `Analiza estas transacciones y predice los gastos del próximo mes por categoría:

${JSON.stringify(transactions.slice(0, 100), null, 2)}

IMPORTANT: Respond entirely in ${lang}.

Responde en JSON:
{
  "predicciones": {
    "Comida": 450,
    "Transporte": 200,
    ...
  },
  "total": 1200,
  "confianza": 0.85
}`;

  const result = await callAI(prompt, 1500, true);
  
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error('Error parseando predicciones');
  }
};

/**
 * DETECCIÓN DE ANOMALÍAS
 */
export const detectAnomalies = async (transactions, userId, locale = 'es') => {
  if (!checkRateLimit(userId)) {
    throw new Error('Límite de requests alcanzado');
  }
  const lang = AI_LANG_NAMES[locale] || 'español';

  const prompt = `Detecta gastos anómalos o inusuales en estas transacciones:

${JSON.stringify(transactions.slice(0, 50), null, 2)}

IMPORTANT: Respond entirely in ${lang}.

Responde en JSON:
{
  "alertas": [
    {
      "tipo": "gasto_alto",
      "descripcion": "Gasto inusualmente alto en...",
      "transaccion": {...},
      "severidad": "alta"
    }
  ]
}`;

  const result = await callAI(prompt, 1500, true);
  
  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { alertas: [] };
  }
};

/**
 * MAPEO INTELIGENTE DE COLUMNAS CSV BANCARIAS
 * Envía los headers + filas de muestra a la IA y devuelve el mapa de columnas.
 * Sin caché — cada archivo es único.
 */
export const mapCSVColumns = async (headers, sampleRows) => {
  const prompt = `Eres un experto en extractos bancarios latinoamericanos. Mapea las columnas de este CSV al esquema interno.

Headers detectados: ${JSON.stringify(headers)}
Filas de muestra:
${sampleRows.slice(0, 3).map((row, i) => `Fila ${i + 1}: ${JSON.stringify(row)}`).join('\n')}

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

  const result = await callAI(prompt, 600, false);

  try {
    const jsonMatch = result.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Sin JSON en respuesta');

    const raw = JSON.parse(jsonMatch[0]);
    // Limpiar nulls y strings "null"
    const cleaned = {};
    for (const [key, val] of Object.entries(raw)) {
      if (val && val !== 'null' && val !== 'None' && val !== '') {
        cleaned[key] = val;
      }
    }
    return { columnMap: cleaned, provider: result.provider };
  } catch {
    throw new Error('La IA no pudo determinar el mapeo de columnas');
  }
};

/**
 * ESTADO DE LOS PROVEEDORES
 */
export const getProviderStatus = () => {
  return {
    proxy: {
      configured: true,
      free: true,
      priority: 1,
    },
    groq: {
      // La API key vive en el servidor (Netlify env var GROQ_API_KEY)
      // La configuración correcta se valida server-side, no client-side
      configured: true,
      free: true,
      priority: 2,
    },
  };
};
