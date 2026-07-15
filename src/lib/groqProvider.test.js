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

// Tarea 1.14/1.15 (parcial — SOLO mapColumns) — src/lib/groqProvider.js:
// refactor de `mapCSVColumns` (ai-providers.js:365-416) detrás de la
// AIProvider Interface. Conserva la MISMA firma de salida (ColumnMap plano,
// design.md §4 `AIProviderMapColumns`) que ya consume `ImportManager` vía
// `useAI().mapColumns`. Cubre además spec.md Área 7 (Requirement "Mapeo de
// columnas CSV — encabezados, sin filas completas sin enmascarar"): las
// filas de muestra NUNCA viajan sin enmascarar.
describe('groqProvider.mapColumns (spec.md Área 7, design.md §1/§4/§6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('respuesta Groq válida → ColumnMap plano (misma firma que mapCSVColumns actual), sin envolver en {columnMap}', async () => {
    callViaProxyMock.mockResolvedValue({
      content: '{"fecha":"Fecha Valor","descripcion":"Detalle","monto":"Importe","debito":null,"credito":null,"tipo":null,"categoria":null}',
    });

    const result = await groqProvider.mapColumns(
      ['Fecha Valor', 'Detalle', 'Importe'],
      [['15/07/2026', 'SUPERMERCADO DIA', '45.50']]
    );

    expect(result).toEqual({ fecha: 'Fecha Valor', descripcion: 'Detalle', monto: 'Importe' });
  });

  it('limpia nulls y strings "null"/"None"/"" del resultado (triangulación con headers/mapa distinto)', async () => {
    callViaProxyMock.mockResolvedValue({
      content:
        '{"fecha":"Date","descripcion":"Memo","monto":null,"debito":"Cargo","credito":"Abono","tipo":"None","categoria":""}',
    });

    const result = await groqProvider.mapColumns(
      ['Date', 'Memo', 'Cargo', 'Abono'],
      [['01/01/2026', 'UBER TRIP', '12.00', '']]
    );

    expect(result).toEqual({ fecha: 'Date', descripcion: 'Memo', debito: 'Cargo', credito: 'Abono' });
  });

  it('envía los headers sin modificar, pero las filas de muestra van SIEMPRE enmascaradas — nunca en texto plano', async () => {
    callViaProxyMock.mockResolvedValue({ content: '{"fecha":"Fecha","descripcion":"Detalle","monto":"Monto"}' });

    const accountLikeValue = '4111222233334444';
    await groqProvider.mapColumns(
      ['Fecha', 'Detalle', 'Monto'],
      [['15/07/2026', accountLikeValue, '45.50']]
    );

    expect(callViaProxyMock).toHaveBeenCalledTimes(1);
    const promptSent = callViaProxyMock.mock.calls[0][0];
    // Los headers SÍ viajan en texto plano (spec.md Área 7 lo permite/exige).
    expect(promptSent).toContain('Fecha');
    expect(promptSent).toContain('Detalle');
    // El valor de muestra identificable (tipo número de cuenta) NUNCA viaja tal cual.
    expect(promptSent).not.toContain(accountLikeValue);
    expect(promptSent).not.toContain('SUPERMERCADO');
  });

  it('JSON de Groq malformado → rechazo controlado, nunca excepción sin manejar (Principio 1, no se inventa un mapeo)', async () => {
    callViaProxyMock.mockResolvedValue({ content: 'esto no es json' });

    await expect(groqProvider.mapColumns(['a', 'b'], [['1', '2']])).rejects.toThrow();
  });
});
