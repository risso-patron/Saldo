import { groqProvider } from './groqProvider';

// Tarea 1.12/1.13 — src/lib/groqProvider.js: implementación Groq de la
// AIProvider Interface (design.md §4, §2). `categorize` es un refactor de
// `suggestCategory` (ai-providers.js:216-220 actual): arma el prompt real,
// parsea la respuesta de Groq y llama al proxy vía `callViaProxy`. Devuelve
// `{category, confidence:number}` crudo (el mapeo a etiqueta ocurre en
// AIContext, no acá) o rechaza con un error controlado ante JSON malformado
// — nunca una excepción sin manejar (spec.md Área 10, design.md §4).

const { callViaProxyMock } = vi.hoisted(() => ({ callViaProxyMock: vi.fn() }));

vi.mock('./ai-providers', () => ({
  callViaProxy: callViaProxyMock,
}));

describe('groqProvider.categorize (spec.md Área 10, design.md §2/§4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('respuesta Groq válida → {category, confidence:number} crudo (sin mapear a etiqueta acá)', async () => {
    callViaProxyMock.mockResolvedValue({ content: '{"categoria":"Comida","confianza":0.95}' });

    const result = await groqProvider.categorize('uber eats pedido');

    expect(result).toEqual({ category: 'Comida', confidence: 0.95 });
    expect(callViaProxyMock).toHaveBeenCalledWith(expect.stringContaining('uber eats pedido'));
  });

  it('arma el prompt con una categoría distinta y devuelve la confianza cruda correspondiente (triangulación)', async () => {
    callViaProxyMock.mockResolvedValue({ content: '{"categoria":"Transporte","confianza":0.62}' });

    const result = await groqProvider.categorize('uber al trabajo');

    expect(result).toEqual({ category: 'Transporte', confidence: 0.62 });
  });

  it('JSON de Groq malformado (sin llaves) → rechazo controlado, nunca excepción sin manejar', async () => {
    callViaProxyMock.mockResolvedValue({ content: 'esto no es json' });

    await expect(groqProvider.categorize('algo raro')).rejects.toThrow();
  });

  it('JSON con llaves pero sintaxis inválida → rechazo controlado', async () => {
    callViaProxyMock.mockResolvedValue({ content: '{categoria: sin comillas}' });

    await expect(groqProvider.categorize('algo raro')).rejects.toThrow();
  });

  it('JSON válido pero sin campo "categoria" → rechazo controlado (no se inventa una categoría)', async () => {
    callViaProxyMock.mockResolvedValue({ content: '{"confianza":0.9}' });

    await expect(groqProvider.categorize('algo ambiguo')).rejects.toThrow();
  });

  it('propaga el status del proxy sin perderlo (429 real del servidor, Área 5 caso 2)', async () => {
    callViaProxyMock.mockRejectedValue(Object.assign(new Error('Rate limit'), { status: 429 }));

    await expect(groqProvider.categorize('otra transacción')).rejects.toMatchObject({ status: 429 });
  });
});
