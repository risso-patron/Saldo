/* @vitest-environment node */

import { createClient } from '@supabase/supabase-js';
import { handler, __private } from '../../netlify/functions/ai-proxy.js';

// Task 2.1 — enforcement de plan (403): mockeamos el cliente de Supabase para
// controlar tanto `auth.getUser` (autenticación) como `.from('subscriptions')`
// (plan_type) sin pegarle a una red real.
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(),
}));

function mockSupabaseClient({ planType, userId = 'user-1' } = {}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: planType ? { plan_type: planType } : null,
            error: planType ? null : { code: 'PGRST116' },
          }),
        }),
      }),
    }),
  };
}

describe('ai-proxy security', () => {
  beforeEach(() => {
    __private.clearRateLimits();
    delete process.env.ALLOWED_ORIGINS;
  });

  it('rechaza solicitudes sin token', async () => {
    const response = await handler({
      httpMethod: 'POST',
      headers: {},
      body: JSON.stringify({ prompt: 'hola' }),
    });

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body).error).toBe('No autorizado');
  });

  it('rate limit helper bloquea despues del umbral', () => {
    const key = 'user-1:127.0.0.1';

    let lastAllowed = true;
    for (let i = 0; i < 10; i += 1) {
      lastAllowed = __private.checkRateLimitMemory(key);
    }

    expect(lastAllowed).toBe(true);
    expect(__private.checkRateLimitMemory(key)).toBe(false);
  });

  it('valida origen permitido cuando ALLOWED_ORIGINS esta configurado', () => {
    process.env.ALLOWED_ORIGINS = 'https://budget-calculator.netlify.app,https://app.example.com';

    expect(__private.isOriginAllowed('https://budget-calculator.netlify.app')).toBe(true);
    expect(__private.isOriginAllowed('https://evil.example')).toBe(false);
  });
});

describe('ai-proxy enforcement de plan (403) — spec.md Área 8, design.md §9', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    __private.clearRateLimits();
    delete process.env.ALLOWED_ORIGINS;
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'anon-key';
    process.env.GROQ_API_KEY = 'groq-key';
    createClient.mockReset();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('usuario plan free recibe 403 y nunca invoca a Groq', async () => {
    createClient.mockReturnValue(mockSupabaseClient({ planType: 'free' }));
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const response = await handler({
      httpMethod: 'POST',
      headers: { authorization: 'Bearer token-valido' },
      body: JSON.stringify({ prompt: 'categoriza esta descripción' }),
    });

    expect(response.statusCode).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('usuario sin fila en subscriptions se trata como free (403), sin invocar a Groq', async () => {
    createClient.mockReturnValue(mockSupabaseClient({ planType: null }));
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy;

    const response = await handler({
      httpMethod: 'POST',
      headers: { authorization: 'Bearer token-valido' },
      body: JSON.stringify({ prompt: 'categoriza esta descripción' }),
    });

    expect(response.statusCode).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each(['pro_monthly', 'pro_yearly', 'lifetime'])(
    'usuario plan %s accede con normalidad (no 403, sí invoca a Groq)',
    async (planType) => {
      createClient.mockReturnValue(mockSupabaseClient({ planType }));
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ choices: [{ message: { content: '{"categoria":"Comida","confianza":0.9}' } }] }),
      });
      global.fetch = fetchSpy;

      const response = await handler({
        httpMethod: 'POST',
        headers: { authorization: 'Bearer token-valido' },
        body: JSON.stringify({ prompt: 'categoriza esta descripción' }),
      });

      expect(response.statusCode).toBe(200);
      expect(fetchSpy).toHaveBeenCalled();
    }
  );
});
