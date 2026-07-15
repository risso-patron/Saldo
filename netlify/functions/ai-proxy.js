/* eslint-env node */
/* global process */

/**
 * Netlify Function: AI Proxy
 *
 * SEGURIDAD:
 * - Las API keys NUNCA llegan al navegador (están solo en variables de entorno del servidor)
 * - Rate limiting server-side persistente via Upstash Redis (con fallback en memoria)
 * - Validación y sanitización del input antes de enviarlo a la IA
 *
 * Variables de entorno requeridas en Netlify Dashboard:
 * GROQ_API_KEY=...
 * SUPABASE_URL=...
 * SUPABASE_ANON_KEY=...
 * (Sin prefijo VITE_ → no se incluyen en el bundle del cliente)
 *
 * Variables opcionales para rate limiting persistente (Upstash Redis free tier):
 * UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
 * UPSTASH_REDIS_REST_TOKEN=AX...
 * Sin ellas el rate limiter opera en memoria (se resetea por instancia de función).
 */

import { createClient } from '@supabase/supabase-js';
import { planHasCapability } from '../../shared/aiCapabilities.js';

const MAX_REQUESTS_PER_MINUTE = 10;
const WINDOW_SECONDS = 60;
const WINDOW_MS = WINDOW_SECONDS * 1000;

// ── Fallback en memoria (cuando Upstash no está configurado) ─────────────────
const rateLimits = new Map();

function checkRateLimitMemory(identityKey) {
  const now = Date.now();
  const requests = rateLimits.get(identityKey) || [];
  const recent = requests.filter(t => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_MINUTE) return false;

  recent.push(now);
  rateLimits.set(identityKey, recent);
  return true;
}

// ── Rate limiting persistente via Upstash Redis REST API ─────────────────────
// Ventana fija de 60 s: INCR + EXPIRE en la primera petición del ciclo.
// Sin SDKs adicionales — usa fetch nativo disponible en Node 18+.
async function checkRateLimitRedis(identityKey) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) return null; // No configurado → usar memoria

  const key = `rl:ai:${identityKey}`;
  const headers = { Authorization: `Bearer ${redisToken}` };

  try {
    // INCR es atómico — incrementa y devuelve el nuevo valor
    const incrRes = await fetch(`${redisUrl}/incr/${key}`, { headers });
    if (!incrRes.ok) return null;
    const { result: count } = await incrRes.json();

    // Solo en la primera petición del ciclo fijamos el TTL
    if (count === 1) {
      await fetch(`${redisUrl}/expire/${key}/${WINDOW_SECONDS}`, { headers });
    }

    return count <= MAX_REQUESTS_PER_MINUTE; // true = permitir, false = limitar
  } catch {
    // Error de red → fallar abierto (no bloquear al usuario por caída de Redis)
    return null;
  }
}

/**
 * Verifica rate limit: intenta Redis persistente; si no disponible usa memoria.
 * @returns {Promise<boolean>} true = la petición está permitida
 */
async function checkRateLimit(identityKey) {
  const redisResult = await checkRateLimitRedis(identityKey);
  if (redisResult !== null) return redisResult;
  return checkRateLimitMemory(identityKey);
}

function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || '';
  return raw
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

function isOriginAllowed(origin) {
  const allowed = getAllowedOrigins();
  // Peticiones servidor-a-servidor (sin cabecera origin): siempre permitir
  if (!origin) return true;
  // Si no hay lista configurada: usar la URL del sitio que Netlify inyecta automáticamente
  if (allowed.length === 0) {
    const siteUrl = process.env.URL || '';
    return !siteUrl || origin === siteUrl;
  }
  return allowed.includes(origin);
}

function createSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('supabase_not_configured');
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

async function authenticateRequest(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('missing_auth');
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) throw new Error('missing_auth');

  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user?.id) {
    throw new Error('invalid_auth');
  }

  return { user: data.user, supabase };
}

/**
 * Enforcement de plan server-side (Área 8, design.md §9, Principio 7).
 * Consulta `subscriptions` por user.id; ausencia de fila = 'free' (fail-closed,
 * igual criterio que create_default_subscription() en subscriptions-schema.sql).
 * La AUTORIZACIÓN vive acá (servidor, no bypasseable); la DEFINICIÓN de qué
 * capacidades habilita cada plan vive en shared/aiCapabilities.js (fuente única
 * compartida con el cliente, ex-R3).
 * @returns {Promise<string>} plan_type resuelto ('free' si no hay fila)
 */
async function getUserPlanType(supabase, userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan_type')
    .eq('user_id', userId)
    .single();

  if (error || !data) return 'free';
  return data.plan_type;
}

/**
 * Enforcement de consentimiento server-side (C1 — auditoría RC: el
 * consentimiento solo se validaba en el cliente). Consulta `user_settings`
 * por (user_id, setting_key='ai_consent'); mismo criterio fail-closed que
 * `AIContext.jsx` usa en el cliente (`data?.setting_value === true` en el
 * `useEffect` de reconciliación) — no se inventa un criterio distinto.
 * Fail-closed en TODOS los casos: fila ausente, error de query, o
 * `setting_value` no estrictamente `true` → sin consentimiento.
 * @returns {Promise<boolean>}
 */
async function getUserConsent(supabase, userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('setting_value')
    .eq('user_id', userId)
    .eq('setting_key', 'ai_consent')
    .single();

  if (error || !data) return false;
  return data.setting_value === true;
}

/**
 * Sanitiza el input para prevenir prompt injection
 */
function sanitizePrompt(text) {
  if (typeof text !== 'string') return '';
  return text
    .slice(0, 5000) // Limitar longitud
    .replace(/<[^>]*>/g, '') // Eliminar HTML tags
    .replace(/[^\w\s.,;:!?()$%@#\-+=/\\áéíóúñüÁÉÍÓÚÑÜ]/gi, ' ') // Solo caracteres seguros
    .trim();
}

/**
 * Llama a Groq
 */
async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Groq no configurado. Agrega GROQ_API_KEY en Netlify Environment Variables.');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) throw new Error(`Groq error: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Handler principal de la Netlify Function
 */
export const handler = async (event) => {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Método no permitido' }) };
  }

  const origin = event.headers.origin || event.headers.Origin;
  if (!isOriginAllowed(origin)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Origen no permitido' }),
    };
  }

  let user;
  let supabase;
  try {
    ({ user, supabase } = await authenticateRequest(event));
  } catch (authError) {
    const statusCode = authError.message === 'supabase_not_configured' ? 500 : 401;
    const message = authError.message === 'supabase_not_configured'
      ? 'Servicio temporalmente no disponible'
      : 'No autorizado';

    return {
      statusCode,
      body: JSON.stringify({ error: message }),
    };
  }

  // Obtener IP del cliente para rate limiting
  const clientIp = event.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const rateLimitKey = `${user.id}:${clientIp}`;

  // Verificar rate limit (Redis persistente con fallback en memoria)
  if (!await checkRateLimit(rateLimitKey)) {
    return {
      statusCode: 429,
      body: JSON.stringify({ error: 'Demasiadas solicitudes. Espera 1 minuto.' }),
    };
  }

  // Enforcement server-side del plan (Área 8, p7): ninguna función de IA se
  // ejecuta sin pasar el gate — ni siquiera si el cliente fuerza su estado.
  const planType = await getUserPlanType(supabase, user.id);
  if (!planHasCapability(planType, 'assisted_categorization')) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Esta función requiere un plan Pro.' }),
    };
  }

  // Enforcement server-side del consentimiento (C1 — auditoría RC): este
  // proxy es genérico (recibe un `prompt` libre, no distingue capacidades),
  // así que es el único punto por el que CUALQUIER salida hacia Groq puede
  // pasar. Fail-closed: sin fila, error, o setting_value !== true → 403.
  const hasConsent = await getUserConsent(supabase, user.id);
  if (!hasConsent) {
    return {
      statusCode: 403,
      body: JSON.stringify({ error: 'Esta función requiere consentimiento para usar IA.' }),
    };
  }

  // Parsear y validar el body
  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const { prompt, provider = 'auto' } = body;

  if (!prompt || typeof prompt !== 'string') {
    return { statusCode: 400, body: JSON.stringify({ error: 'El campo "prompt" es requerido' }) };
  }

  if (!['auto', 'groq'].includes(provider)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Proveedor inválido' }) };
  }

  // Sanitizar el prompt antes de enviarlo a la IA
  const safePrompt = sanitizePrompt(prompt);
  if (!safePrompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Prompt inválido después de sanitización' }) };
  }

  // Llamar a Groq
  try {
    const result = await callGroq(safePrompt);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result, provider: 'groq' }),
    };
  } catch (error) {
    console.error('[ai-proxy] groq_failed', { userId: user.id, error: error.message });
    return {
      statusCode: 503,
      body: JSON.stringify({ error: 'Groq no disponible. Verifica la API key en Netlify.' }),
    };
  }
};

// Exportes internos solo para pruebas de seguridad.
export const __private = {
  checkRateLimit,
  checkRateLimitMemory,
  checkRateLimitRedis,
  sanitizePrompt,
  isOriginAllowed,
  getUserPlanType,
  getUserConsent,
  clearRateLimits: () => rateLimits.clear(),
};
