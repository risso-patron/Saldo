import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import { planHasCapability } from '../../shared/aiCapabilities';
import { toConfidenceLabel } from '../lib/aiConfidence';

/**
 * src/contexts/AIContext.jsx — ENTRADA ÚNICA de IA (design.md §1, §4, Área 4).
 *
 * Único punto de verdad para gate de plan, consentimiento y estado de límite;
 * único módulo autorizado a disparar salidas al proxy (principios 3, 6).
 * Sigue el patrón `createContext(null)` + `Provider` con `value` memoizado +
 * hook `useX()` que lanza fuera del provider, igual que `PeriodContext.jsx`/
 * `CurrencyContext.jsx` (design.md §1).
 */

const AIContext = createContext(null);

// Igual prefijo que el resto del proyecto (design.md §13: "se respeta el prefijo budgetrp_").
const AI_CONSENT_STORAGE_KEY = 'budgetrp_ai_consent';
const AI_CONSENT_SETTING_KEY = 'ai_consent';

/**
 * Guarda fail-closed previa a CUALQUIER salida de red hacia el proveedor de IA
 * (design.md §8 "Cero llamadas salientes sin consentimiento en UN solo punto
 * de control"; Principio 3; Riesgo R1).
 *
 * Exige `hasConsent === true && consentLoaded === true`. Mientras el estado
 * no haya reconciliado con Supabase (`consentLoaded === false`), deniega
 * incluso si el cache local de `hasConsent` es `true` — un cache stale NUNCA
 * habilita una salida real.
 *
 * @param {{ hasConsent: boolean, consentLoaded: boolean }} state
 * @throws {Error} si la salida no está permitida
 */
export function assertOutboundAllowed({ hasConsent, consentLoaded }) {
  if (!consentLoaded || !hasConsent) {
    throw new Error('ai_outbound_denied: sin consentimiento activo y reconciliado');
  }
}

const cacheConsent = (value) => {
  try {
    localStorage.setItem(AI_CONSENT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // localStorage no disponible/lleno: el cache es solo cosmético (evita flicker),
    // nunca autoritativo — su falla no debe interrumpir el flujo (Principio 6).
  }
};

/**
 * Provider por defecto cuando `AIProvider` se monta sin una prop `provider`
 * explícita. `App.jsx` inyecta la implementación real (`groqProvider.js`,
 * tareas 1.12/1.13) en la composición raíz; este default solo cubre el caso
 * de un `AIProvider` montado sin esa prop (p.ej. tests) y degrada
 * honestamente a `provider_error` (nunca lanza sin manejar, nunca finge un
 * resultado — Principio 6).
 */
const DEFAULT_PROVIDER = {
  categorize: () =>
    Promise.reject(new Error('AIProvider sin implementación real todavía (groqProvider.js — Checkpoint 2)')),
  generateIdea: () => Promise.reject(new Error('not_implemented')),
  predict: () => Promise.reject(new Error('not_implemented')),
  mapColumns: () => Promise.reject(new Error('not_implemented')),
};

/**
 * Intenta la escritura remota de consentimiento con reintentos, sin bloquear
 * al usuario (Riesgo R3: la revocación ya es efectiva localmente).
 */
const upsertConsentWithRetry = async (userId, value, retriesLeft = 1) => {
  try {
    const { error } = await supabase
      .from('user_settings')
      .upsert(
        { user_id: userId, setting_key: AI_CONSENT_SETTING_KEY, setting_value: value },
        { onConflict: 'user_id,setting_key' }
      );
    if (error && retriesLeft > 0) {
      await upsertConsentWithRetry(userId, value, retriesLeft - 1);
    }
  } catch {
    if (retriesLeft > 0) {
      await upsertConsentWithRetry(userId, value, retriesLeft - 1);
    }
    // Sin más reintentos: se abandona la escritura remota. El estado local
    // (optimista) ya refleja la decisión del usuario — R3.
  }
};

export const AIProvider = ({ children, provider = DEFAULT_PROVIDER }) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [hasConsent, setHasConsent] = useState(false);
  const [consentLoaded, setConsentLoaded] = useState(false);
  const [status, setStatus] = useState('idle');

  // Guarda de sesión de borrador (design.md §3.1 "RESPUESTA TARDÍA", §14 R2,
  // Principio 8): cada `suggestCategory` abre un borrador con su propio
  // `requestId`; si el usuario confirma/guarda (`commitCategoryDraft()`) o si
  // llega una sugerencia MÁS NUEVA antes de que ésta resuelva, la respuesta se
  // descarta — nunca reabre ni reescribe el movimiento ya guardado.
  const draftRef = useRef({ requestId: 0, committed: false });

  const commitCategoryDraft = useCallback(() => {
    draftRef.current.committed = true;
  }, []);

  // Gate cliente (cosmético — la autoridad real es el 403 server-side de
  // ai-proxy.js, design.md §9). Misma fuente que el servidor: shared/aiCapabilities.js.
  const canUseAI = planHasCapability(subscription?.plan_type, 'assisted_categorization');

  // Reconciliación con Supabase al montar / cambiar de usuario (fail-closed,
  // design.md §3.2). `AI_CONSENT_STORAGE_KEY` es un cache de escritura (ver
  // `cacheConsent`), no de lectura: evitar el flicker del prompt de
  // consentimiento leyéndolo es responsabilidad de la UI que lo muestre (Fase
  // 4, fuera de este checkpoint) — acá nunca se usa para fijar `hasConsent`
  // antes de reconciliar con Supabase.
  useEffect(() => {
    let cancelled = false;

    if (!user?.id) {
      setHasConsent(false);
      setConsentLoaded(true);
      return undefined;
    }

    setConsentLoaded(false);
    (async () => {
      try {
        const { data } = await supabase
          .from('user_settings')
          .select('setting_value')
          .eq('user_id', user.id)
          .eq('setting_key', AI_CONSENT_SETTING_KEY)
          .single();
        if (cancelled) return;
        // Ausencia de fila (o cualquier valor no estrictamente true) = sin
        // consentimiento — fail-closed (design.md §13).
        setHasConsent(data?.setting_value === true);
      } catch {
        if (cancelled) return;
        setHasConsent(false);
      } finally {
        if (!cancelled) setConsentLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const grantConsent = useCallback(async () => {
    setHasConsent(true);
    cacheConsent(true);
    if (!user?.id) return;
    await upsertConsentWithRetry(user.id, true);
  }, [user?.id]);

  const revokeConsent = useCallback(async () => {
    // Optimista: corta el acceso YA, sin esperar a la escritura remota (R3, Área 6).
    setHasConsent(false);
    cacheConsent(false);
    if (!user?.id) return;
    await upsertConsentWithRetry(user.id, false);
  }, [user?.id]);

  /**
   * suggestCategory — único path de salida sancionado para categorización
   * asistida (design.md §4, §7; spec.md Área 5). Envuelve TODO en try/catch:
   * nunca propaga la excepción cruda al render, nunca deja una promesa sin
   * manejar (Principio 6). Mapea a un `status` tipado en cada uno de los 4
   * casos de error, o a `{category, confidence}`/`null` en éxito.
   * @param {string} description
   * @returns {Promise<{category:string, confidence:'alta'|'media'|'baja'} | {status:string} | null>}
   */
  const suggestCategory = useCallback(
    async (description) => {
      // Caso 1 (Área 5): plan sin acceso — corto-circuito, NUNCA llega a la red.
      if (!canUseAI) {
        setStatus('no_plan');
        return { status: 'no_plan' };
      }

      // Caso 3 (Área 5): sin consentimiento — corto-circuito, NUNCA llega a la red (p3).
      try {
        assertOutboundAllowed({ hasConsent, consentLoaded });
      } catch {
        setStatus('no_consent');
        return { status: 'no_consent' };
      }

      // Nuevo borrador: requestId propio, arranca sin comprometer (p8).
      const requestId = ++draftRef.current.requestId;
      draftRef.current.committed = false;
      const isStale = () => draftRef.current.committed || draftRef.current.requestId !== requestId;

      setStatus('loading');
      try {
        const raw = await provider.categorize(description);
        if (isStale()) return null; // respuesta tardía: descartada, nunca aplicada (p8)
        if (!raw) {
          setStatus('idle');
          return null;
        }
        const label = toConfidenceLabel(raw.confidence);
        if (!label) {
          // Confianza fuera de rango o parseo roto: se trata como "no disponible",
          // nunca se muestra una sugerencia con etiqueta rota (Área 10).
          setStatus('idle');
          return null;
        }
        setStatus('idle');
        return { category: raw.category, confidence: label };
      } catch (err) {
        if (isStale()) return null; // error tardío de un borrador ya superado: también se descarta

        // Caso 2 (Área 5): límite alcanzado — se deriva EXCLUSIVAMENTE del 429
        // real del servidor (Área 9), nunca de un contador propio del cliente.
        if (err?.status === 429) {
          setStatus('rate_limited');
          return { status: 'rate_limited' };
        }
        // Caso 4 (Área 5): cualquier otra falla del proveedor — degrada, no bloquea.
        setStatus('provider_error');
        return { status: 'provider_error' };
      }
    },
    [canUseAI, hasConsent, consentLoaded, provider]
  );

  /**
   * mapColumns — mapeo de columnas CSV asistido por IA (design.md §4 `AIApi`,
   * §6 "Estrategia de migración"; spec.md Área 7). Mismo gateway/gate que
   * `suggestCategory`: gate de plan + `assertOutboundAllowed` ANTES de
   * cualquier salida de red (Principio 3). Cualquier falla — denegación de
   * plan/consentimiento o error del proveedor — degrada a `null`, nunca
   * propaga una excepción cruda (Principio 6); `ImportManager` cae a sus
   * modos no-IA existentes (`template|profile|pattern|manual`) sin bloquear
   * la importación.
   * @param {string[]} headers
   * @param {string[][]} sampleRows
   * @returns {Promise<import('../lib/aiProvider').ColumnMap | null>}
   */
  const mapColumns = useCallback(
    async (headers, sampleRows) => {
      if (!canUseAI) return null;
      try {
        assertOutboundAllowed({ hasConsent, consentLoaded });
      } catch {
        return null;
      }
      try {
        return await provider.mapColumns(headers, sampleRows);
      } catch {
        return null;
      }
    },
    [canUseAI, hasConsent, consentLoaded, provider]
  );

  // isAIAuthorized — segunda puerta de autorización cerrada (M1, hallazgo de
  // auditoría RC). Reusa `assertOutboundAllowed`, el MISMO punto de control
  // que ya usan `suggestCategory`/`mapColumns` — no reimplementa la condición
  // a mano, para que exista un solo criterio real y no una copia que pueda
  // divergir (p.ej. `ImportManager.jsx` omitiendo `consentLoaded`).
  const isAIAuthorized = useMemo(() => {
    if (!canUseAI) return false;
    try {
      assertOutboundAllowed({ hasConsent, consentLoaded });
      return true;
    } catch {
      return false;
    }
  }, [canUseAI, hasConsent, consentLoaded]);

  const value = useMemo(
    () => ({
      hasConsent,
      consentLoaded,
      canUseAI,
      isAIAuthorized,
      status,
      grantConsent,
      revokeConsent,
      suggestCategory,
      mapColumns,
      commitCategoryDraft,
    }),
    [
      hasConsent,
      consentLoaded,
      canUseAI,
      isAIAuthorized,
      status,
      grantConsent,
      revokeConsent,
      suggestCategory,
      mapColumns,
      commitCategoryDraft,
    ]
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI debe usarse dentro de AIProvider');
  return ctx;
};

export default AIContext;
