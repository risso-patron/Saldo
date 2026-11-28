# Flujo de Datos de IA en SALDO — Descubrimiento Técnico

**Este documento NO es legal.** Es evidencia técnica para redactar correctamente la Política de Privacidad y el registro de tratamiento de IA. Describe únicamente lo que el código demuestra hoy, con cita `archivo:línea` en cada afirmación. Donde no hay evidencia suficiente, se escribe explícitamente "no verificado" — nunca se asume ausencia de comportamiento.

---

## 1. Estado actual

**¿Existe IA activa en producción?** Sí, con arquitectura híbrida: reglas locales primero, IA real como fallback/función explícita.

**¿Dónde vive la lógica?** Repartida en dos capas verificadas:

- **Cliente (frontend)**: arma prompts y decide cuándo pedir IA. No contiene ninguna API key de proveedor de IA — solo un token de sesión de Supabase (`netlify/functions/ai-proxy.js` no recibe key alguna del cliente; `src/lib/ai-providers.js:71-86`, función `callViaProxy`, envía únicamente `Authorization: Bearer <accessToken de Supabase>`).
- **Servidor (backend)**: `netlify/functions/ai-proxy.js` es la única función serverless que posee la API key del proveedor de IA (`GROQ_API_KEY`, variable de entorno server-side, `netlify/functions/ai-proxy.js:13,192`) y la única que efectivamente llama a la red externa del proveedor.

**Existen DOS implementaciones cliente paralelas** que llegan al mismo proxy server-side por caminos de código distintos (ver §6, LEG-006):

1. **Camino "oficial" actual** — `src/contexts/AIContext.jsx`. Su propio comentario lo describe como "ENTRADA ÚNICA de IA... único módulo autorizado a disparar salidas al proxy" (`AIContext.jsx:9-16`). Expone solo dos capacidades: `suggestCategory` (sugerencia de categoría para una transacción) y `mapColumns` (mapeo de columnas CSV en import). Ambas exigen, ANTES de cualquier salida de red: plan compatible (`canUseAI`, `AIContext.jsx:112`) y consentimiento activo y ya reconciliado con Supabase (`assertOutboundAllowed`, `AIContext.jsx:37-41`).
2. **Camino legado** — `src/hooks/useAIInsightsMulti.js` (hook exportado como `useAIInsights`), que importa directamente de `src/lib/ai-providers.js` (no de `AIContext`) las funciones `analyzeFinances`, `predictNextMonthExpenses`, `detectAnomalies` y `mapCSVColumns`. Este camino NO verifica `canUseAI` ni `hasConsent`/`consentLoaded` en el cliente — su único gate cliente es `checkProviders()`, que llama a `getAvailableProviders()` (`src/lib/ai-providers.js:57-60`), función que devuelve un proveedor fijo sin condicionarlo a plan ni consentimiento.

**¿Cuál camino está realmente montado en la app?** Evidencia de que el camino legado está desconectado de la UI viva:
- `AIInsightsPanel` (el único componente que usa `useAIInsights`) se exporta desde `src/components/AI/index.js:5` pero no aparece importado en `src/App.jsx` ni en ningún otro archivo de `src/` fuera de su propia definición y su barrel export (búsqueda sin resultados adicionales).
- `src/features/import/ImportManager.test.jsx:13` contiene el comentario: *"Tarea 5.1/5.2 — ImportManager migra de useAIInsights([]).mapImportColumns"* — evidencia textual de que el flujo de import fue migrado DESDE el hook legado HACIA el camino de `AIContext`.
- La única llamada real a `ai.suggestCategory` encontrada en un componente montado es `src/components/NewMovement/NewMovementSheet.jsx:108`, y usa el camino de `AIContext` (gateado).

**Conclusión de hecho, no de interpretación**: no se encontró evidencia de que `analyzeFinances`, `predictNextMonthExpenses`, `detectAnomalies` o el `mapCSVColumns` sin enmascarar (`ai-providers.js`) sean alcanzables desde una ruta o componente actualmente montado en la aplicación. La función de categorización asistida y de mapeo de columnas en import, ambas gateadas y con datos enmascarados/mínimos, sí son alcanzables y están en uso.

**Funciones locales (sin IA) vs. funciones con IA real:**

| Función | Tipo | Evidencia |
|---|---|---|
| `categorizeWithRules` | 100% local — diccionario de keywords, sin red | `src/core/categorizationEngine.js:37-53` |
| `suggestExpenseCategory` | 100% local — filtro sobre `categorizeWithRules` | `src/core/categorizationEngine.js:71-75` |
| `categorizeTransactionsFull` | Híbrido: reglas locales primero; IA solo si `allowAI=true` (default `false`, fail-closed) | `src/core/categorizationEngine.js:87-113` |
| `AIContext.suggestCategory` | IA real (Groq), gateada por plan+consentimiento | `src/contexts/AIContext.jsx:179-232` |
| `AIContext.mapColumns` | IA real (Groq), gateada por plan+consentimiento, con enmascarado de datos de muestra | `src/contexts/AIContext.jsx:247-262`, `src/lib/groqProvider.js:33-38` |
| `analyzeFinances`, `predictNextMonthExpenses`, `detectAnomalies` | IA real (Groq) — sin gate de consentimiento/plan en el cliente que las invoca | `src/lib/ai-providers.js:171,290,326`; invocadas por `src/hooks/useAIInsightsMulti.js:88,153,190` — **no verificado como alcanzable desde la UI viva** (ver arriba) |

---

## 2. Flujo de datos (camino verificado y en uso)

```
Usuario
  |
  |  ingresa/edita un movimiento (descripción libre)
  v
NewMovementSheet.jsx
  |
  |  (si canUseAI Y hasConsent Y consentLoaded — AIContext.jsx:179-193)
  v
AIContext.suggestCategory(description)
  |
  v
groqProvider.categorize(description)  [src/lib/groqProvider.js:98-119]
  |  arma prompt con SOLO la descripción (línea 79-88)
  v
callViaProxy(prompt)  [src/lib/ai-providers.js:71-102]
  |  fetch a /.netlify/functions/ai-proxy
  |  Authorization: Bearer <token de sesión Supabase>
  |  body: { prompt, provider: 'auto' }
  v
netlify/functions/ai-proxy.js (servidor)
  |  1. Autentica el token contra Supabase (líneas 115-132)
  |  2. Rate limit (10 req/min por user+IP, líneas 27-84)
  |  3. Verifica plan server-side (planHasCapability, líneas 258-266) — 403 si no aplica
  |  4. Verifica consentimiento server-side (getUserConsent, líneas 268-278) — 403 si no aplica
  |  5. Sanitiza el prompt (elimina HTML, limita longitud — líneas 179-186)
  v
callGroq(prompt)  [ai-proxy.js:191-211]
  |  POST https://api.groq.com/openai/v1/chat/completions
  |  modelo: llama-3.3-70b-versatile
  v
Respuesta de Groq (JSON con categoría + confianza)
  |
  v
Resultado devuelto al cliente → mostrado en AIConsentPrompt/NewMovementSheet
  (no se encontró escritura de la respuesta de IA en Supabase como registro
  separado — el resultado solo se persiste si el usuario confirma el
  movimiento, momento en el que la categoría queda como dato normal de la
  transacción, igual que si la hubiera tipeado el usuario)
```

---

## 3. Datos enviados

Por función, verificado leyendo el armado exacto del prompt/payload:

| Función | Datos enviados al proveedor | Evidencia |
|---|---|---|
| `suggestCategory` / `AIContext.suggestCategory` (camino en uso) | **Únicamente la descripción del movimiento** (string libre). No se envía monto, fecha, categoría previa, id de usuario ni id de transacción dentro del prompt. | `src/lib/groqProvider.js:79-88` (`buildCategorizePrompt`) |
| `mapColumns` (camino en uso, import CSV) | Headers del CSV (texto plano) + hasta 3 filas de muestra **enmascaradas**: letras → `X`, dígitos → `9`, se preserva el formato pero no el contenido real (ni montos, ni nombres de comercio, ni números de cuenta en texto plano) | `src/lib/groqProvider.js:33-51` (`maskSampleValue`, `buildMapColumnsPrompt`) |
| `analyzeFinances` (camino no verificado como alcanzable desde UI) | Hasta 50 transacciones completas serializadas con `JSON.stringify` — incluye `id` interno de la transacción, `description`, `amount`, `category`, `date` (forma confirmada en `src/hooks/useSupabaseTransactions.js:32-37`) + totales mensuales | `src/lib/ai-providers.js:140-153` (`buildAnalysisPrompt`) |
| `predictNextMonthExpenses` (camino no verificado como alcanzable desde UI) | Hasta 100 transacciones completas serializadas igual que arriba | `src/lib/ai-providers.js:296-298` |
| `detectAnomalies` (camino no verificado como alcanzable desde UI) | Hasta 50 transacciones completas serializadas igual que arriba | `src/lib/ai-providers.js:332-334` |
| `mapCSVColumns` de `ai-providers.js` (versión SIN enmascarar — distinta de la versión de `groqProvider.js` que sí está en uso) | Headers + hasta 3 filas de muestra **en texto plano, sin enmascarar** | `src/lib/ai-providers.js:368-370` |

**Identificadores de usuario**: ningún prompt observado incluye email o nombre del usuario. El `id` interno de la transacción (clave primaria de Supabase, no el `user_id`) SÍ viaja dentro del JSON de transacciones en las tres funciones del camino no verificado como alcanzable (`analyzeFinances`, `predictNextMonthExpenses`, `detectAnomalies`). El camino en uso (`suggestCategory`, `mapColumns`) no incluye ningún identificador.

Si un dato no se envía, se indica explícitamente arriba — no se asume por omisión.

---

## 4. Proveedores

| Proveedor | Evidencia encontrada | Uso | Estado |
|---|---|---|---|
| **Groq** (Llama 3.3 70B) | Llamada HTTP real: `netlify/functions/ai-proxy.js:195` (`fetch('https://api.groq.com/openai/v1/chat/completions', ...)`). Config: `GROQ_API_KEY` server-side (`ai-proxy.js:13,192`) | Categorización asistida, mapeo de columnas CSV, y (en el camino no verificado como alcanzable) análisis financiero/predicciones/anomalías | **Confirmado** — único proveedor con llamada de red real verificada en el código |
| **Google Gemini** | Mencionado en `.env.example:19-24` como "OPCIÓN 1 (RECOMENDADA)" con variable `VITE_GOOGLE_GEMINI_API_KEY`. Dominio `https://generativelanguage.googleapis.com` está permitido en el CSP de `netlify.toml:77`. **Búsqueda de `generativelanguage` y `VITE_GOOGLE_GEMINI` en todo `src/`: sin resultados** — ninguna llamada real encontrada. | Ninguno verificado | **No confirmado como activo** — solo referencia en documentación de configuración y en la lista blanca de CSP, sin llamada de código real encontrada |
| **Anthropic (Claude)** | Mencionado en `.env.example:33-37` como "OPCIÓN 3 (PAGO)" con variable `VITE_ANTHROPIC_API_KEY`. Dominio `https://api.anthropic.com` está permitido en el CSP de `netlify.toml:79`. Mencionado también en `docs/technical/MONETIZATION_STRATEGY.md` como "Claude AI". **Búsqueda de `api.anthropic.com` y `VITE_ANTHROPIC` en todo `src/`: sin resultados.** | Ninguno verificado | **No confirmado como activo** — mismo patrón que Gemini: presente en configuración/CSP, ausente en código de llamada real |
| **OpenAI** | El endpoint de Groq usa una ruta con forma compatible-OpenAI (`api.groq.com/openai/v1/...`, `ai-providers.js:21`) — esto es Groq exponiendo un formato de API compatible con el estándar de OpenAI, **no es una llamada a la infraestructura de OpenAI**. Sin otra mención de OpenAI en el código. | N/A | **No aplica** — falso positivo de búsqueda por texto, no es un proveedor real |
| **Ollama (local)** | Mencionado en `.env.example:39-44` como opción sin API key, sin instrucciones de variable de entorno | Ninguno verificado | **No confirmado como activo** |

---

## 5. Retención

- **¿SALDO almacena prompts?** No verificado que los almacene; tampoco verificado exhaustivamente que NO lo haga. En el código de `netlify/functions/ai-proxy.js` no se encontró ninguna escritura del `prompt` a Supabase ni a ningún almacén — solo se reenvía a Groq y se descarta de memoria al terminar la función. **No verificado** en ningún otro punto del pipeline fuera de este archivo.
- **¿SALDO almacena respuestas?** Igual que arriba: no se encontró código que inserte la respuesta de IA en una tabla de Supabase como registro propio. La única persistencia observada es indirecta: si el usuario ACEPTA la categoría sugerida y guarda el movimiento, esa categoría queda almacenada como dato normal de la transacción (mismo campo que si el usuario la hubiera tipeado a mano) — no como un log de IA separado. **No verificado** de forma exhaustiva fuera del camino revisado.
- **¿Existe logging?** Sí, pero de metadatos de error, no de contenido: `netlify/functions/ai-proxy.js:313` registra `console.error('[ai-proxy] groq_failed', { userId: user.id, error: error.message })` únicamente cuando Groq falla — no incluye el prompt ni la respuesta. No se encontró logging del contenido del prompt/respuesta en ningún punto revisado.
- **¿El proveedor externo (Groq) almacena datos?** **No verificado.** No es algo que el código de SALDO pueda confirmar ni negar — depende de la política de retención propia de Groq, que no fue revisada en esta tarea (queda fuera del alcance de un descubrimiento de código).
- **¿Existe configuración de privacidad del proveedor?** **No verificado.** No se encontró en el código ninguna configuración explícita de retención/privacidad enviada a Groq (p. ej. headers de "no entrenar con estos datos" u opt-out equivalente). No se puede afirmar que exista ni que no exista sin revisar la cuenta/contrato real de Groq, fuera del alcance de este descubrimiento.

**Nunca se escribe "no almacena" en este documento salvo que el flujo completo se haya verificado de punta a punta — no es el caso aquí.**

---

## 6. Contradicciones nuevas encontradas

### LEG-005 — Proveedores documentados/permitidos por CSP sin llamada real verificada

**Descripción:** `.env.example` y el Content-Security-Policy de `netlify.toml` documentan y permiten conexión directa desde el navegador a Google Gemini y Anthropic, pero no se encontró ninguna llamada de código real a esos dominios en `src/`. El único proveedor con llamada de red verificada es Groq, y ocurre exclusivamente server-side.

**Fuente A:** `.env.example:19-37` (variables `VITE_GOOGLE_GEMINI_API_KEY`, `VITE_ANTHROPIC_API_KEY`) y `netlify.toml:74-80` (CSP `connect-src` incluye `generativelanguage.googleapis.com` y `api.anthropic.com`).

**Fuente B:** Búsqueda sin resultados de esos dominios/variables en `src/` como llamada real de código.

**Impacto legal:** Si la Política de Privacidad llega a listar Gemini y Anthropic como proveedores activos (como hacen hoy `privacy.html` y, para Anthropic, `MONETIZATION_STRATEGY.md`), estaría describiendo una superficie de terceros mayor a la verificada en el código actual. Además, si esas variables `VITE_`-prefijadas llegaran a usarse en el futuro sin pasar por el proxy server-side, expondrían la API key en el bundle del cliente (contradice el modelo de seguridad documentado en `ai-proxy.js:7-9`).

---

### LEG-006 — Afirmación de "entrada única de IA" no se sostiene en el código

**Descripción:** El comentario de cabecera de `AIContext.jsx` afirma ser la "ENTRADA ÚNICA de IA" y el "único módulo autorizado a disparar salidas al proxy". Sin embargo, `src/hooks/useAIInsightsMulti.js` invoca `ai-providers.js` de forma independiente, sin pasar por `AIContext` ni por sus gates de plan/consentimiento en el cliente.

**Fuente A:** `src/contexts/AIContext.jsx:9-16` (comentario de diseño).

**Fuente B:** `src/hooks/useAIInsightsMulti.js:5-14,88,153,190` (imports y llamadas directas a `ai-providers.js`).

**Impacto legal:** La autorización real (¿puede esta llamada llegar a Groq?) sigue estando protegida server-side en `ai-proxy.js` para AMBOS caminos, porque el proxy revisa plan y consentimiento sin importar qué código del cliente lo invocó — este es un hecho verificado y mitigante. Pero la documentación interna del código describe una garantía de arquitectura ("un solo punto de control") que el propio repositorio contradice con una segunda ruta de cliente existente. Esto es relevante para la Política de Privacidad porque, si el código legado (`analyzeFinances`, `predictNextMonthExpenses`, `detectAnomalies`) llegara a reconectarse a la UI en el futuro sin que alguien revise este documento, enviaría datos de transacciones completos (no solo la descripción) bajo el mismo texto de consentimiento actual, que solo menciona "la descripción de este movimiento" (`AIConsentPrompt.jsx:15`).

---

*Todas las citas de línea corresponden al estado del repositorio en el momento de esta investigación. Este documento debe re-verificarse si alguno de los archivos citados cambia.*
