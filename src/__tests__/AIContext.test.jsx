import { renderHook, render, screen, waitFor, act } from '@testing-library/react';
import { assertOutboundAllowed, AIProvider, useAI } from '../contexts/AIContext';

// `useAuthMock` (hoisted, vi.fn) reemplaza el mock estático original para
// poder simular un cambio de usuario a mitad de sesión (M1: ventana de
// carrera en la que `consentLoaded` se resetea a `false` pero `hasConsent`
// conserva el valor stale del usuario anterior).
const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(() => ({ user: { id: 'user-1' } })),
}));

// Fase 3 — Entrada única de IA (AIContext). Se construye incrementalmente,
// tarea por tarea (3.1 → 3.10), agregando describe blocks conforme cada
// tarea lo requiere, siguiendo strict TDD (rojo → verde por tarea).

describe('assertOutboundAllowed — fail-closed (spec.md Área 6, design.md §8, Principio 3, Riesgo R1)', () => {
  it('deniega cuando hasConsent=false', () => {
    expect(() => assertOutboundAllowed({ hasConsent: false, consentLoaded: true })).toThrow();
  });

  it('deniega cuando consentLoaded=false aunque hasConsent=true (cache stale antes de reconciliar, fail-closed)', () => {
    expect(() => assertOutboundAllowed({ hasConsent: true, consentLoaded: false })).toThrow();
  });

  it('deniega cuando ninguno de los dos está en true', () => {
    expect(() => assertOutboundAllowed({ hasConsent: false, consentLoaded: false })).toThrow();
  });

  it('permite cuando hasConsent=true y consentLoaded=true', () => {
    expect(() => assertOutboundAllowed({ hasConsent: true, consentLoaded: true })).not.toThrow();
  });
});

// ── 3.3/3.4 — grantConsent / revokeConsent + reconciliación al montar ──────

const { singleMock, upsertMock, fromMock, useSubscriptionMock } = vi.hoisted(() => {
  const singleMock = vi.fn();
  const upsertMock = vi.fn();
  const eq2Mock = vi.fn(() => ({ single: singleMock }));
  const eq1Mock = vi.fn(() => ({ eq: eq2Mock }));
  const selectMock = vi.fn(() => ({ eq: eq1Mock }));
  const fromMock = vi.fn(() => ({ select: selectMock, upsert: upsertMock }));
  const useSubscriptionMock = vi.fn(() => ({ subscription: { plan_type: 'pro_monthly' } }));
  return { singleMock, upsertMock, fromMock, useSubscriptionMock };
});

vi.mock('../lib/supabase', () => ({
  supabase: { from: fromMock },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: useAuthMock,
}));

vi.mock('../hooks/useSubscription', () => ({
  useSubscription: useSubscriptionMock,
}));

const wrapper = ({ children }) => <AIProvider>{children}</AIProvider>;
const wrapperWithProvider = (providerImpl) => ({ children }) => (
  <AIProvider provider={providerImpl}>{children}</AIProvider>
);

describe('Reconciliación de consentimiento al montar (design.md §3.2, fail-closed)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    upsertMock.mockResolvedValue({ data: null, error: null });
  });

  it('antes de reconciliar: consentLoaded=false y hasConsent=false (fail-closed inicial)', () => {
    singleMock.mockImplementation(() => new Promise(() => {})); // nunca resuelve — inspecciona el estado inicial
    const { result } = renderHook(() => useAI(), { wrapper });

    expect(result.current.consentLoaded).toBe(false);
    expect(result.current.hasConsent).toBe(false);
  });

  it('ausencia de fila en user_settings = sin consentimiento (fail-closed) tras reconciliar', async () => {
    const { result } = renderHook(() => useAI(), { wrapper });

    await waitFor(() => expect(result.current.consentLoaded).toBe(true));
    expect(result.current.hasConsent).toBe(false);
  });

  it('fila existente con setting_value=true reconcilia hasConsent=true', async () => {
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });

    const { result } = renderHook(() => useAI(), { wrapper });

    await waitFor(() => expect(result.current.consentLoaded).toBe(true));
    expect(result.current.hasConsent).toBe(true);
  });
});

describe('grantConsent / revokeConsent (spec.md Área 6, design.md §3.2/§8, Riesgo R3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    upsertMock.mockResolvedValue({ data: null, error: null });
  });

  it('grantConsent hace UPSERT sobre (user_id, ai_consent)=true y cachea en localStorage', async () => {
    const { result } = renderHook(() => useAI(), { wrapper });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    await act(async () => { await result.current.grantConsent(); });

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', setting_key: 'ai_consent', setting_value: true }),
      expect.anything()
    );
    expect(result.current.hasConsent).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('budgetrp_ai_consent', JSON.stringify(true));
  });

  it('revokeConsent pone hasConsent=false de inmediato (optimista), antes de que la escritura remota resuelva', async () => {
    let resolveUpsert;
    const { result } = renderHook(() => useAI(), { wrapper });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));
    await act(async () => { await result.current.grantConsent(); });

    upsertMock.mockImplementation(() => new Promise((resolve) => { resolveUpsert = resolve; }));

    let revokePromise;
    act(() => {
      revokePromise = result.current.revokeConsent();
    });

    // Optimista: hasConsent ya es false ANTES de que la escritura remota resuelva.
    expect(result.current.hasConsent).toBe(false);

    resolveUpsert({ data: null, error: null });
    await act(async () => { await revokePromise; });
  });

  it('revokeConsent reintenta la escritura si la primera falla', async () => {
    const { result } = renderHook(() => useAI(), { wrapper });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    upsertMock
      .mockResolvedValueOnce({ data: null, error: { message: 'network error' } })
      .mockResolvedValueOnce({ data: null, error: null });

    await act(async () => { await result.current.revokeConsent(); });

    expect(upsertMock).toHaveBeenCalledTimes(2);
  });
});

// ── 3.5/3.6 — AIContext Provider + useAI(): estado único desde dos consumidores ──

function ConsumerA() {
  const { hasConsent, canUseAI } = useAI();
  return <div data-testid="consumer-a">{String(hasConsent)}|{String(canUseAI)}</div>;
}

function ConsumerB() {
  const { hasConsent, canUseAI } = useAI();
  return <div data-testid="consumer-b">{String(hasConsent)}|{String(canUseAI)}</div>;
}

function ConsumerWithGrant() {
  const { hasConsent, grantConsent, consentLoaded } = useAI();
  return (
    <div>
      <span data-testid="grant-consumer">{String(hasConsent)}</span>
      <button onClick={() => grantConsent()} disabled={!consentLoaded}>grant</button>
    </div>
  );
}

describe('Estado único observado desde dos consumidores (spec.md Área 4, design.md §1/§4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    upsertMock.mockResolvedValue({ data: null, error: null });
  });

  it('canUseAI es idéntico en dos consumidores simultáneos bajo el mismo AIProvider (plan pro_monthly → true)', async () => {
    render(
      <AIProvider>
        <ConsumerA />
        <ConsumerB />
      </AIProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('consumer-a').textContent.split('|')[1]).toBe('true');
    });
    expect(screen.getByTestId('consumer-b').textContent.split('|')[1]).toBe('true');
  });

  it('un cambio de hasConsent (grantConsent) se refleja igual en ambos consumidores en el mismo render — ninguno queda desincronizado', async () => {
    render(
      <AIProvider>
        <ConsumerWithGrant />
        <ConsumerB />
      </AIProvider>
    );

    await waitFor(() => expect(screen.getByTestId('grant-consumer').textContent).toBe('false'));
    expect(screen.getByTestId('consumer-b').textContent.split('|')[0]).toBe('false');

    await act(async () => {
      screen.getByRole('button', { name: 'grant' }).click();
    });

    expect(screen.getByTestId('grant-consumer').textContent).toBe('true');
    expect(screen.getByTestId('consumer-b').textContent.split('|')[0]).toBe('true');
  });
});

// ── 3.7/3.8 — suggestCategory: 4 estados de error + éxito ──────────────────
//
// `AIProvider` acepta una prop `provider` (implementación de la interfaz de
// `src/lib/aiProvider.js`) inyectable para testing; estos tests inyectan un
// stub/mock mínimo de `categorize` para verificar el ENRUTAMIENTO de
// `suggestCategory` a cada estado, sin depender de la implementación real de
// Groq (cubierta aparte en `src/lib/groqProvider.test.js`, tarea 1.12/1.13).

describe('suggestCategory — 4 estados de error + éxito (spec.md Área 5, design.md §7, Principio 6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Consentimiento ya otorgado por defecto en este describe (fila existente con true).
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });
    upsertMock.mockResolvedValue({ data: null, error: null });
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
  });

  it('sin plan (canUseAI=false) → status:no_plan, sin invocar al provider (sin salida de red)', async () => {
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'free' } });
    const categorizeMock = vi.fn();
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ categorize: categorizeMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let suggestion;
    await act(async () => { suggestion = await result.current.suggestCategory('café con amigos'); });

    expect(suggestion).toEqual({ status: 'no_plan' });
    expect(categorizeMock).not.toHaveBeenCalled();
  });

  it('sin consentimiento → status:no_consent, corto-circuito sin red', async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } }); // sin fila = sin consentimiento
    const categorizeMock = vi.fn();
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ categorize: categorizeMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let suggestion;
    await act(async () => { suggestion = await result.current.suggestCategory('café con amigos'); });

    expect(suggestion).toEqual({ status: 'no_consent' });
    expect(categorizeMock).not.toHaveBeenCalled();
  });

  it('429 del proxy (error.status=429) → status:rate_limited', async () => {
    const err = Object.assign(new Error('Too Many Requests'), { status: 429 });
    const categorizeMock = vi.fn().mockRejectedValue(err);
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ categorize: categorizeMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let suggestion;
    await act(async () => { suggestion = await result.current.suggestCategory('café con amigos'); });

    expect(suggestion).toEqual({ status: 'rate_limited' });
  });

  it('503/red caída → status:provider_error; la excepción nunca se propaga sin manejar', async () => {
    const categorizeMock = vi.fn().mockRejectedValue(new Error('network down'));
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ categorize: categorizeMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let suggestion;
    await expect(act(async () => {
      suggestion = await result.current.suggestCategory('café con amigos');
    })).resolves.not.toThrow();

    expect(suggestion).toEqual({ status: 'provider_error' });
  });

  it('éxito con confianza alta (>=0.8) → {category, confidence:"alta"}', async () => {
    const categorizeMock = vi.fn().mockResolvedValue({ category: 'Comida', confidence: 0.95 });
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ categorize: categorizeMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let suggestion;
    await act(async () => { suggestion = await result.current.suggestCategory('café con amigos'); });

    expect(suggestion).toEqual({ category: 'Comida', confidence: 'alta' });
    expect(categorizeMock).toHaveBeenCalledWith('café con amigos');
  });

  it('éxito con confianza media (>=0.5 y <0.8) → confidence:"media"', async () => {
    const categorizeMock = vi.fn().mockResolvedValue({ category: 'Transporte', confidence: 0.6 });
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ categorize: categorizeMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let suggestion;
    await act(async () => { suggestion = await result.current.suggestCategory('uber al trabajo'); });

    expect(suggestion).toEqual({ category: 'Transporte', confidence: 'media' });
  });

  it('confianza fuera de rango (0) → null, tratada como no disponible, nunca "rota" (Área 10)', async () => {
    const categorizeMock = vi.fn().mockResolvedValue({ category: 'Otros', confidence: 0 });
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ categorize: categorizeMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let suggestion;
    await act(async () => { suggestion = await result.current.suggestCategory('algo ambiguo'); });

    expect(suggestion).toBeNull();
  });

  it('sin prop `provider` inyectada, el default degrada a provider_error sin lanzar (App.jsx inyecta groqProvider en la composición raíz)', async () => {
    const { result } = renderHook(() => useAI(), { wrapper });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let suggestion;
    await act(async () => { suggestion = await result.current.suggestCategory('café con amigos'); });

    expect(suggestion).toEqual({ status: 'provider_error' });
  });
});

// ── 3.9/3.10 — Guarda de sesión de borrador: respuesta tardía descartada ───
//
// DESVIACIÓN DOCUMENTADA (ver reporte final): design.md §3.1/§14(R2) describe
// el mecanismo (`requestId` + guarda `committed`) pero no fija el nombre de la
// función pública que lo dispara — la wiring real con el guardado del usuario
// en `SmartCategorySelector`/`BudgetForm` es Fase 4 (fuera de este checkpoint).
// Se expone `commitCategoryDraft()` en `useAI()` como el punto de enganche que
// Fase 4 invocará al confirmar/guardar el movimiento.

describe('Guarda de sesión de borrador — respuesta tardía descartada (spec.md Área 3, design.md Principio 8, §3.1, Riesgo R2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });
    upsertMock.mockResolvedValue({ data: null, error: null });
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
  });

  it('una respuesta que resuelve DESPUÉS de commitCategoryDraft() se descarta — nunca se aplica ni reabre el movimiento', async () => {
    let resolveCategorize;
    const categorizeMock = vi.fn(() => new Promise((resolve) => { resolveCategorize = resolve; }));
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ categorize: categorizeMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let suggestionPromise;
    act(() => {
      suggestionPromise = result.current.suggestCategory('café con amigos');
    });

    // El usuario confirma/guarda el movimiento ANTES de que llegue la respuesta de IA.
    act(() => {
      result.current.commitCategoryDraft();
    });

    resolveCategorize({ category: 'Comida', confidence: 0.95 });

    let suggestion;
    await act(async () => { suggestion = await suggestionPromise; });

    expect(suggestion).toBeNull(); // descartada — jamás se propone/aplica (Principio 8)
  });

  it('una sugerencia más nueva (requestId superior) descarta la respuesta anterior, aunque no se haya commiteado explícitamente', async () => {
    let resolveFirst;
    const categorizeMock = vi.fn()
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockResolvedValueOnce({ category: 'Transporte', confidence: 0.9 });

    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ categorize: categorizeMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let firstPromise;
    act(() => { firstPromise = result.current.suggestCategory('café'); });

    let secondSuggestion;
    await act(async () => {
      secondSuggestion = await result.current.suggestCategory('uber');
    });

    resolveFirst({ category: 'Comida', confidence: 0.9 });
    let firstSuggestion;
    await act(async () => { firstSuggestion = await firstPromise; });

    expect(firstSuggestion).toBeNull(); // stale — superada por la segunda
    expect(secondSuggestion).toEqual({ category: 'Transporte', confidence: 'alta' });
  });

  it('sin commit ni request más reciente, una respuesta normal SÍ se aplica (no se descarta de más)', async () => {
    const categorizeMock = vi.fn().mockResolvedValue({ category: 'Comida', confidence: 0.95 });
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ categorize: categorizeMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let suggestion;
    await act(async () => { suggestion = await result.current.suggestCategory('café con amigos'); });

    expect(suggestion).toEqual({ category: 'Comida', confidence: 'alta' });
  });
});

// ── Checkpoint 3, tarea 5.1/5.2 — useAI().mapColumns ────────────────────────
//
// design.md §4 declara `mapColumns` en el contrato `AIApi` pero Checkpoint 2
// no lo expuso en `AIContext`. Se agrega acá siguiendo el mismo patrón de
// gateway que `suggestCategory`: gate de plan + `assertOutboundAllowed` ANTES
// de cualquier salida de red (Principio 3), y degradación calma a `null` ante
// cualquier falla (denegación o error del proveedor) — nunca propaga una
// excepción cruda (Principio 6). `ImportManager` (tarea 5.1/5.2) consume esto
// para caer a sus modos no-IA existentes sin bloquear la importación.

describe('mapColumns — gate + delegación al provider (spec.md Área 7, design.md §4/§6, Principios 3/6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });
    upsertMock.mockResolvedValue({ data: null, error: null });
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
  });

  it('sin plan (canUseAI=false) → null, sin invocar al provider (sin salida de red)', async () => {
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'free' } });
    const mapColumnsMock = vi.fn();
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ mapColumns: mapColumnsMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let mapResult;
    await act(async () => {
      mapResult = await result.current.mapColumns(['Fecha', 'Detalle'], [['15/07/2026', 'algo']]);
    });

    expect(mapResult).toBeNull();
    expect(mapColumnsMock).not.toHaveBeenCalled();
  });

  it('sin consentimiento → null, sin invocar al provider (corto-circuito, sin red)', async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } }); // sin fila = sin consentimiento
    const mapColumnsMock = vi.fn();
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ mapColumns: mapColumnsMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let mapResult;
    await act(async () => {
      mapResult = await result.current.mapColumns(['Fecha', 'Detalle'], [['15/07/2026', 'algo']]);
    });

    expect(mapResult).toBeNull();
    expect(mapColumnsMock).not.toHaveBeenCalled();
  });

  it('con acceso, delega a provider.mapColumns(headers, sampleRows) y devuelve el ColumnMap tal cual', async () => {
    const mapColumnsMock = vi.fn().mockResolvedValue({ fecha: 'Fecha Valor', descripcion: 'Detalle' });
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ mapColumns: mapColumnsMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let mapResult;
    await act(async () => {
      mapResult = await result.current.mapColumns(['Fecha Valor', 'Detalle'], [['15/07/2026', 'super']]);
    });

    expect(mapResult).toEqual({ fecha: 'Fecha Valor', descripcion: 'Detalle' });
    expect(mapColumnsMock).toHaveBeenCalledWith(['Fecha Valor', 'Detalle'], [['15/07/2026', 'super']]);
  });

  it('si provider.mapColumns rechaza (error del proveedor) → null, nunca propaga la excepción cruda (Principio 6)', async () => {
    const mapColumnsMock = vi.fn().mockRejectedValue(new Error('ai_malformed_response: roto'));
    const { result } = renderHook(() => useAI(), { wrapper: wrapperWithProvider({ mapColumns: mapColumnsMock }) });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    let mapResult;
    await expect(act(async () => {
      mapResult = await result.current.mapColumns(['a'], [['1']]);
    })).resolves.not.toThrow();

    expect(mapResult).toBeNull();
  });
});

// ── M1 — isAIAuthorized: único punto de control real reusado ──────────────
//
// Hallazgo de auditoría RC: `ImportManager.jsx` invocaba
// `categorizeTransactionsFull` con `ai.canUseAI && ai.hasConsent` (línea
// ~207), que omite `consentLoaded` — durante la ventana de reconciliación
// tras un cambio de usuario, `hasConsent` conserva el valor del usuario
// anterior. `isAIAuthorized` reusa `assertOutboundAllowed` (la MISMA función
// que ya usan `suggestCategory`/`mapColumns`) para que exista un solo
// criterio real, no una copia que pueda divergir.

describe('isAIAuthorized — único punto de control reusado (M1, hallazgo de auditoría RC)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({ user: { id: 'user-1' } });
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'pro_monthly' } });
    upsertMock.mockResolvedValue({ data: null, error: null });
  });

  it('false si !canUseAI, aunque haya consentimiento otorgado', async () => {
    useSubscriptionMock.mockReturnValue({ subscription: { plan_type: 'free' } });
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });

    const { result } = renderHook(() => useAI(), { wrapper });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    expect(result.current.isAIAuthorized).toBe(false);
  });

  it('false si hasConsent=false, aunque consentLoaded=true', async () => {
    singleMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });

    const { result } = renderHook(() => useAI(), { wrapper });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    expect(result.current.isAIAuthorized).toBe(false);
  });

  it('true solo cuando canUseAI, hasConsent y consentLoaded son true a la vez', async () => {
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });

    const { result } = renderHook(() => useAI(), { wrapper });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));

    expect(result.current.canUseAI).toBe(true);
    expect(result.current.hasConsent).toBe(true);
    expect(result.current.isAIAuthorized).toBe(true);
  });

  it('false cuando consentLoaded=false aunque hasConsent quedó stale en true (ventana de carrera al cambiar de usuario)', async () => {
    singleMock.mockResolvedValue({ data: { setting_value: true }, error: null });

    const { result, rerender } = renderHook(() => useAI(), { wrapper });
    await waitFor(() => expect(result.current.consentLoaded).toBe(true));
    expect(result.current.hasConsent).toBe(true);
    expect(result.current.isAIAuthorized).toBe(true);

    // Cambio de usuario: consentLoaded se resetea a false vía el useEffect de
    // reconciliación (AIContext.jsx), pero hasConsent NO se toca hasta que la
    // nueva consulta resuelva — acá la dejamos sin resolver a propósito para
    // capturar la ventana de carrera con hasConsent stale en true.
    singleMock.mockImplementation(() => new Promise(() => {}));
    useAuthMock.mockReturnValue({ user: { id: 'user-2' } });
    rerender();

    expect(result.current.consentLoaded).toBe(false);
    expect(result.current.hasConsent).toBe(true); // stale del usuario anterior
    expect(result.current.isAIAuthorized).toBe(false);
  });
});
