# Exploración: `insights-ia-real`

**Fase**: sdd-explore (solo investigación, sin propuesta de diseño ni de alcance)
**Fecha**: 2026-07-14
**Hallazgo de auditoría origen**: código de IA real construido y funcional, nunca montado; el usuario ve `FloatingChatWidget`, un bot de keyword-matching sin IA, presentado visualmente como "Asistente IA".

---

## 1. Los componentes huérfanos (5, no 4 — hallazgo nuevo)

El encargo mencionaba 4 componentes huérfanos. Se encontró un **quinto** no listado originalmente: `PredictiveChart.jsx`. Los 5 están exportados desde el barrel `src/components/AI/index.js:5-9` pero **cero** ocurrencias de `<AIInsightsPanel`, `<AIAlerts`, `<AIProviderStatus`, `<SmartCategorySelector` o `<PredictiveChart` existen en todo `src/` (grep JSX de apertura, 0 resultados). Todos están terminados, no son esqueletos: tienen `PropTypes` completos, manejo de loading/error/empty, y sus claves de i18n (`ai.intro_title`, `ai.panel_title`, `ai.alerts_title`, `ai.provider_title`, etc.) están traducidas en los 3 locales (`src/i18n/locales/en.json`, `es.json`, `fr.json` — confirmado por grep de `"intro_title"` etc.). No son trabajo abandonado a medio camino; son features completas sin punto de montaje.

### `src/components/AI/AIInsightsPanel.jsx`
- Props: `analysis`, `analyzing`, `error`, `onAnalyze`, `monthlyTotals` (líneas 14-20, `propTypes` en 232-246).
- Consume el shape que devuelve `analyzeFinances` de `ai-providers.js`: `{ resumen, patrones, recomendaciones, score, scoreJustificacion, tokensUsed?, estimatedCost? }` (destructuring en línea 95, footer de costos en 219-227).
- Tres estados completos: intro/CTA (25-52), loading con spinner (55-69), error con botón de reintento (72-92), y resultado completo con score coloreado, patrones numerados y recomendaciones expandibles (94-229).
- Nota: `analysis.tokensUsed`/`estimatedCost` nunca se pueblan hoy — `analyzeFinances` en `ai-providers.js:183-188` no los agrega al objeto devuelto, así que ese footer (línea 220) jamás se renderizaría con los datos actuales de la IA real.

### `src/components/AI/AIAlerts.jsx`
- Props: `alerts`, `loading`, `onRefresh`, `onDismiss` (línea 14, `propTypes` 228-241, `defaultProps` 243-247).
- Espera `alerts: [{ tipo, categoria, mensaje, severidad, accionSugerida? }]` (`propTypes` 229-236) — **no calza exactamente** con lo que devuelve `detectAnomalies` en `ai-providers.js`, cuyo prompt (líneas 334-343) pide `{ alertas: [{ tipo, descripcion, transaccion, severidad }] }` — sin `categoria` ni `mensaje` ni `accionSugerida`. Sería necesario un mapeo/adaptador o cambiar el prompt antes de conectar este componente tal cual.
- UI: badge con contador (82-97), panel dropdown con backdrop (100-223), iconos por tipo de alerta (23-50), colores por severidad (52-77).

### `src/components/AI/AIProviderStatus.jsx`
- Sin props — se auto-alimenta de `getAvailableProviders()` y `getProviderStatus()` de `ai-providers.js` en un `useEffect` (líneas 9-21).
- Muestra "⚡ Groq — Llama 3.3 70B ... ● Activo vía proxy seguro" y un badge **"Gratis · 30 req/min"** (línea 74) — cifra que contradice el límite real server-side de 10 req/min (ver sección 3).
- Grid de 4 "features disponibles" (análisis, categorización, predicción, anomalías) en líneas 84-96, puramente decorativo — no linkea a ningún componente real.

### `src/components/AI/SmartCategorySelector.jsx`
- Props: `description`, `selectedCategory`, `categories`, `onCategoryChange`, `onGetSuggestion`, `suggestedCategory`, `loading` (líneas 18-26, `propTypes` 182-193).
- Auto-dispara sugerencia con debounce de 800ms cuando `description.length >= 3` y no hay override manual (líneas 31-43) — llama a `onGetSuggestion` (equivalente a `getCategorySuggestion` del hook), no directamente a `ai-providers.js`.
- Espera `suggestedCategory: { category, confidence: 'alta'|'media'|'baja' }` (`propTypes` 188-191) — pero `suggestCategory()` en `ai-providers.js:216-219` devuelve `confidence` como **número** (`data.confianza`, ej. `0.95`), no como string `'alta'/'media'/'baja'`. Mismatch de tipo directo: `getConfidenceColor`/`getConfidenceLabel` (líneas 68-84) harían `switch` sobre un número y caerían siempre al `default` (sin color/label). Esto es un bug real de integración, no solo una diferencia cosmética.
- Nota aparte (ya conocida, fuera de alcance): las categorías fijas embebidas en el prompt de `suggestCategory` (`ai-providers.js:202`: `Comida, Transporte, Entretenimiento, Salud, Educación, Vivienda, Servicios, Otros`) no necesariamente calzan 1:1 con `EXPENSE_CATEGORIES` — esto es HAL-010, no tocar.

### `src/components/AI/PredictiveChart.jsx` (hallazgo adicional, no listado en el encargo)
- Props: `historicalData: [{month, total}]`, `predictions: {predicciones, totalEstimado, advertencias}`, `loading` (líneas 23, `propTypes` 254-267).
- Gráfico de área (Recharts) con datos históricos sólidos + mes de predicción punteado y banda de confianza ±15% calculada client-side (líneas 32-41).
- **Mismatch de shape con la IA real**: espera `predictions.totalEstimado` y `predictions.predicciones[cat] = {razon, confianza, monto}` (líneas 32, 211-226), pero `predictNextMonthExpenses()` en `ai-providers.js:297-306` pide al LLM devolver `{ predicciones: {Comida: 450, ...}, total: 1200, confianza: 0.85 }` — es decir, valores numéricos planos por categoría, no objetos `{razon, confianza, monto}`, y la clave es `total` no `totalEstimado`. Este componente **no funcionaría** con el output actual de `predictNextMonthExpenses` sin cambiar el prompt o adaptar la respuesta.

---

## 2. `src/features/chat/AIChat.jsx`

- **Huérfano total**: `grep` de `from ['"].*AIChat` y `from ['"].*features/chat` en todo `src/` no arroja ningún resultado. `src/features/chat/` contiene únicamente este archivo (confirmado por `Glob`). No está importado ni siquiera en `App.jsx`.
- Está terminado y es autocontenido: maneja su propio estado de mensajes, input, loading, apertura/cierre colapsable (líneas 19-30, 103-119).
- Llama directamente a `callAI(prompt, 500, false)` de `ai-providers.js` (línea 91) — no pasa por `useAIInsightsMulti`, es un consumidor independiente de la capa de proveedor.
- Construye su propio contexto financiero comprimido (`financialContext`, líneas 32-66): totales de ingresos/gastos, gastos por categoría del mes, y **las últimas 10 transacciones con descripción, monto y fecha en texto plano** (línea 51-54), todo esto se concatena al prompt.
- Es de **propósito general acotado a finanzas**: el system-prompt embebido (línea 87) le pide responder en español, máx. 3-4 líneas, sin markdown complejo — está pensado como asistente conversacional, no como generador de reportes estructurados (a diferencia de `analyzeFinances`, que exige JSON).
- Trae 6 preguntas rápidas predefinidas (`QUICK_QUESTIONS`, líneas 5-12) que disparan `sendMessage(q)` directamente.
- Maneja error de red con mensaje genérico (líneas 93-97), sin distinguir 429 (rate limit) de otros errores — a diferencia de `ai-providers.js:83-84` que sí tiene mensaje específico para 429, ese matiz se pierde en `AIChat` porque `callAI`/`callViaProxy` lanzan errores genéricos que `AIChat` no inspecciona por código.

---

## 3. Costo, límites y control de gasto reales

### Server-side (`netlify/functions/ai-proxy.js`) — la única enforcement real
- `MAX_REQUESTS_PER_MINUTE = 10` (línea 26), ventana fija de 60s.
- Rate limiting **por `user.id` + IP del cliente** combinados como clave (`rateLimitKey = ${user.id}:${clientIp}`, línea 201) — no es un límite global de la app, es por-usuario-por-IP.
- Doble implementación: Upstash Redis si está configurado (`checkRateLimitRedis`, líneas 48-73, con `INCR`+`EXPIRE` atómico), con fallback a un `Map` en memoria del proceso (`checkRateLimitMemory`, líneas 33-43) si no hay Redis — y ese fallback en memoria **se resetea por instancia de función** (comentario explícito, línea 21), lo cual en un entorno serverless multi-instancia significa que el límite real efectivo puede ser más laxo de lo nominal si Redis no está configurado.
- Si Redis falla por red, el código **falla abierto** (`return null` en el catch de línea 69-72, luego "fallar abierto" documentado en el comentario de línea 70) — es decir, ante un error de Redis no bloquea al usuario, prioriza disponibilidad sobre control de costo estricto.
- `max_tokens: 1000` fijo en la llamada a Groq (`callGroq`, línea 158) — este es el único control de costo por tokens en el lado servidor, y es un tope **de salida**, no de entrada (el prompt de entrada puede ser hasta 5000 chars por `sanitizePrompt`, línea 136).
- Autenticación obligatoria vía Supabase (`authenticateRequest`, líneas 105-128) — sin sesión válida, no hay llamada a Groq.
- Sin ninguna referencia a pricing/costo de Groq en comentarios del código (ni en `ai-proxy.js` ni en `ai-providers.js`) más allá de la etiqueta "Gratis"/"free: true" en las constantes de `PROVIDERS` (`ai-providers.js:16, 24`).

### Client-side (`src/lib/ai-providers.js`) — capas adicionales, **no confiables como control real**
- Caché de 15 minutos en memoria (`responseCache`, `CACHE_DURATION`, líneas 30-31) por prompt truncado a 100 chars + maxTokens como clave (línea 101) — reduce llamadas repetidas dentro de una misma sesión de pestaña, se pierde al recargar.
- Rate limiter client-side propio: `MAX_REQUESTS_PER_MINUTE = 20` (línea 35), por `userId`, en un `Map` en memoria del navegador (líneas 33-52) — **trivialmente bypaseable** (recargar página, editar el bundle no aplica pero el estado se resetea con cualquier remount) y por tanto no es un control de costo real, solo UX (evitar spam accidental de clicks).
- **Inconsistencia de tres cifras de rate limit** documentada en tres lugares distintos del código:
  - UI: "Gratis · 30 req/min" (`AIProviderStatus.jsx:74`)
  - Comentario de hook: "Rate limit: 30 req/min (Groq free tier)" (`useAIInsightsMulti.js:18`) y comentario en `ai-providers.js:269` ("30 req/min en Groq")
  - Constante `GROQ.limits: '30 requests/minuto'` (`ai-providers.js:25`)
  - Rate limiter client-side real: `MAX_REQUESTS_PER_MINUTE = 20` (`ai-providers.js:35`)
  - Rate limiter server-side real (el único que realmente se aplica): `MAX_REQUESTS_PER_MINUTE = 10` (`ai-proxy.js:26`)
  - Ninguna de las tres cifras coincide entre sí. El usuario vería "30 req/min" en la UI pero sería bloqueado por el servidor a partir de la solicitud número 11 en la ventana de 60s.
- `bulkCategorizeTransactions` en `ai-providers.js` pausa 2500ms entre batches de 80 descripciones (líneas 234, 270-272) — mitigación manual de rate limit para el flujo de importación masiva, no relacionado al proxy.

---

## 4. Privacidad — qué viaja al LLM (Groq, tercero)

Se confirmó, leyendo cada builder de prompt en `ai-providers.js`, que **datos reales de transacciones del usuario, en texto plano, viajan a Groq** sin anonimización ni agregación:

- `buildAnalysisPrompt` (líneas 135-161): serializa con `JSON.stringify` las **últimas 50 transacciones completas** (línea 136, 146-147) — esto incluye cualquier campo presente en el objeto transacción (descripción, monto, fecha, categoría; el shape exacto de `transactions` no se validó en esta exploración, pero el `JSON.stringify` no filtra campos, así que cualquier PII que viva en `description` — ej. "Pago a Juan Pérez", nombres de comercios, ubicaciones — viaja completo).
- `predictNextMonthExpenses` (líneas 285-316): serializa **hasta 100 transacciones completas** (línea 293) de la misma forma.
- `detectAnomalies` (líneas 321-353): serializa **hasta 50 transacciones completas** (línea 329).
- `suggestCategory` (líneas 198-228): envía solo la descripción individual de una transacción (línea 200) — el prompt más acotado en cuanto a superficie de datos, pero aun así texto libre potencialmente con PII.
- `mapCSVColumns` (líneas 360-411): envía headers + hasta 3 filas de muestra completas del CSV bancario (línea 365) — potencialmente incluye números de cuenta u otros datos si el banco los incluye en el extracto.
- `AIChat.jsx` (líneas 32-66): construye y envía **las últimas 10 transacciones con descripción, monto y fecha en texto plano** (líneas 51-54) además de totales agregados, en cada pregunta del usuario al chat.
- No se encontró ningún paso de anonimización, hashing, ni redacción de PII antes de estos `JSON.stringify`/interpolaciones — el único filtro de seguridad existente es `sanitizePrompt` en `ai-proxy.js:133-140`, que remueve HTML tags y caracteres no alfanuméricos, pero **no remueve ni enmascara nombres, montos ni ningún dato financiero real**; su propósito es prevenir prompt injection, no proteger PII.
- El proveedor (Groq, vía `api.groq.com`) es un tercero fuera de la infraestructura de Supabase/Netlify de la app — no se encontró en el código ninguna mención a un DPA, política de retención de datos de Groq, ni bandera/consentimiento explícito del usuario para el envío de sus datos financieros a este tercero.

---

## 5. Planes / monetización — gate de features de IA

- `src/hooks/useSubscription.js` define `hasFeature(featureName)` (líneas 97-109) contra una tabla de features por plan (líneas 100-105):
  - `free`: `['basic_transactions', 'basic_charts', 'dark_mode', 'limited_goals']` — **sin ninguna feature de IA**.
  - `pro_monthly` / `pro_yearly`: incluyen `'ai_analysis'` y `'ai_predictions'` (además de `export_csv`, `export_pdf`, `credit_cards`, `advanced_charts`, `unlimited_goals`).
  - `lifetime`: mismo set de `pro_yearly` + `'lifetime_badge'`.
- El comentario de cabecera del hook (líneas 33-37) documenta explícitamente el modelo: *"free: Gratis (sin export, sin IA)"* / *"pro_monthly/pro_yearly/lifetime: export + IA"*.
- **El gate existe en el modelo de datos pero no se usa en ningún lado**: `grep` de `hasFeature\(['"]ai` en todo `src/` devuelve **cero resultados**. Ningún componente ni hook llama a `hasFeature('ai_analysis')` ni `hasFeature('ai_predictions')` — a diferencia de exportación, donde sí existe un patrón establecido de gating (confirmado por la existencia de `export_csv`/`export_pdf` en la misma tabla, aunque no se auditó en detalle el punto de uso de esos flags en esta exploración — no era parte del encargo).
- Conclusión de este punto: el modelo de planes **ya anticipa IA como feature paga**, pero al día de hoy cualquier usuario autenticado (incluso plan `free`) que lograra invocar `useAIInsightsMulti` tendría acceso completo a `analyzeFinances`, `predictNextMonthExpenses`, `detectAnomalies`, etc., porque el único gate real hoy es la autenticación Supabase en `ai-proxy.js` (línea 105-128), no el plan.

---

## 6. Grado de desconexión entre las piezas

- **Los 5 componentes huérfanos** (`AIInsightsPanel`, `AIAlerts`, `AIProviderStatus`, `SmartCategorySelector`, `PredictiveChart`) son "tontos" (dumb/presentational): no llaman ellos mismos a `ai-providers.js` ni a `useAIInsightsMulti`; reciben todo por props (`onAnalyze`, `onGetSuggestion`, `onRefresh`, etc., ver props listadas arriba). Están diseñados para ser alimentados por un padre que sí use el hook.
- **`AIProviderStatus` es la única excepción**: llama directamente a `getAvailableProviders()`/`getProviderStatus()` de `ai-providers.js` en su propio `useEffect` (líneas 15-21), sin pasar por el hook — es el único componente con lógica de datos propia.
- **`AIChat.jsx` es completamente independiente**: no usa `useAIInsightsMulti` en absoluto, llama a `callAI` directo (línea 91) y mantiene su propio estado de conversación. Cero código compartido con los 5 componentes de `components/AI/`.
- **Duplicación confirmada de instancias del hook**: hay dos invocaciones independientes de `useAIInsights` en el codebase:
  1. `App.jsx:125` — `useAIInsights(allTransactions)`, resultado completamente descartado (no se asigna a variable).
  2. `src/features/import/ImportManager.jsx:138` — `const aiInsights = useAIInsights([])`, usado solo para `aiInsights.mapImportColumns` (línea 292) dentro del flujo de importación CSV.
  - No hay contexto ni estado compartido entre ambas — cada una mantiene su propio `analysis`, `alerts`, `predictions`, etc. de forma aislada. Si se montaran los componentes huérfanos hoy usando una tercera instancia del hook, sería una **tercera copia de estado** desconectada de las otras dos.
- **Shape mismatches confirmados entre componentes UI y las funciones de IA que deberían alimentarlos** (no son solo huérfanos — algunos directamente no funcionarían sin cambios):
  - `SmartCategorySelector` espera `confidence` como string `'alta'|'media'|'baja'`; `suggestCategory()` devuelve un número (`data.confianza`, ej. `0.95`).
  - `PredictiveChart` espera `predictions.totalEstimado` y `predictions.predicciones[cat] = {razon, confianza, monto}`; `predictNextMonthExpenses()` devuelve `predictions.total` (no `totalEstimado`) y `predicciones[cat]` como número plano.
  - `AIAlerts` espera `alerta.categoria`, `alerta.mensaje`, `alerta.accionSugerida`; `detectAnomalies()` devuelve `alerta.descripcion` y `alerta.transaccion`, sin `categoria`/`mensaje`/`accionSugerida`.
  - `AIInsightsPanel` es el único que calza razonablemente bien con su fuente (`analyzeFinances`), salvo el footer de tokens/costo que nunca se pobla.

---

## 7. Superficie de la app — opciones estructurales existentes (sin decidir)

Estructura de tabs confirmada en `App.jsx` (`activeTab`, línea 127, con persistencia en `localStorage` bajo la key `budgetrp_ui_activeTab`):

| Tab | Contenido actual (línea) | Notas |
|---|---|---|
| `resumen` (default) | `HabitDailyCard`, `Summary`, `GlobalBudgetTracker`, botón a `graficos`, `GamificationDashboard` colapsable (269-317) | Ya tiene un patrón de sección colapsable secundaria (logros, 300-315) que podría reutilizarse como precedente de UI para una sección de IA opcional. |
| `graficos` | `ChartsTab` (318) | Ya recibe `categoryAnalysis`, candidato natural para `PredictiveChart` (predicciones de gasto) o `AIInsightsPanel` (patrones). |
| `movimientos` | `BudgetForm` + `ExpenseList` (319) | `SmartCategorySelector` encajaría conceptualmente en el flujo de alta/edición de transacción, pero `BudgetForm`/`ExpenseList` no fueron auditados en esta exploración para confirmar si ya tienen selector de categoría propio que reemplazar. |
| `planificacion` | `CreditCardManager`, `BudgetManager`, `RecurringManager`, `GoalManager` (320) | Sin relación obvia con IA hoy. |
| `herramientas` | `ExportManager`, `ImportManager` (321) | `ImportManager` ya consume IA (`categorizeTransactionsFull`, `mapImportColumns`) — es el único tab con IA end-to-end funcionando hoy. |
| `cuenta` | `ProfilePage` (322) | Vía `useSubscription`, es el lugar natural para mostrar el plan/gate de IA si se decide exponer `hasFeature('ai_analysis')` en UI. |

Fuera del sistema de tabs, montado siempre visible en el `<main>` (líneas 264-267):
- `DailyOnboardingToast`, `DailyReminder`, `Omnibar` (Ctrl/Cmd+K, línea 265), `FloatingChatWidget` + `FloatingChatButton` (266-267) — este es el punto de montaje del bot falso que un reemplazo con `AIChat.jsx` sustituiría directamente si esa fuera la dirección elegida (no decidido en esta fase).

`AIAlerts` y `AIProviderStatus` están importados en `App.jsx:25` (`import { AIAlerts, AIProviderStatus } from './components/AI'`) pero, igual que `AIInsightsPanel` (importado vía `lazy` en línea 55), **ningún JSX los invoca** — el import en sí no tiene ningún efecto visible, es dead code a nivel de árbol de renderizado aunque el bundler sí lo incluya.

---

## Resumen de hallazgos nuevos (no estaban en el contexto previo de la sesión)

1. Hay un **quinto componente huérfano**: `PredictiveChart.jsx`, no mencionado en el encargo original.
2. **Tres shape-mismatches concretos** entre componentes UI y las funciones de IA reales que deberían alimentarlos (`SmartCategorySelector`/`suggestCategory`, `PredictiveChart`/`predictNextMonthExpenses`, `AIAlerts`/`detectAnomalies`) — conectar estos componentes no es un simple "montar en JSX", requiere adaptar prompts o mapear respuestas.
3. **Tres cifras distintas de rate limit** conviven en el código (30 en UI/comentarios, 20 en el limiter client-side, 10 en el límite real server-side) — la UI miente sobre el límite real.
4. El **gate de plan para IA existe en el modelo de datos** (`hasFeature('ai_analysis')`, `hasFeature('ai_predictions')`) pero **no se invoca en ningún punto del código** — hoy cualquier usuario autenticado (plan free incluido) tendría acceso completo si estos componentes se montaran sin agregar el chequeo de plan.
5. **Duplicación de instancias del hook** confirmada: `App.jsx` y `ImportManager.jsx` cada uno instancia `useAIInsights` por separado, sin estado compartido.
6. Transacciones completas (descripción, monto, fecha) viajan en texto plano a Groq en 4 de los 6 flujos de IA (`analyzeFinances`, `predictNextMonthExpenses`, `detectAnomalies`, `AIChat`) — sin anonimización, solo con sanitización anti-injection (no anti-PII).
7. El límite server-side real puede degradarse en despliegues multi-instancia sin Redis configurado (fallback en memoria por instancia, documentado en el propio comentario del código).

## Ready for Proposal

**Sí** — hay suficiente información verificada para pasar a `sdd-propose`. Puntos que la propuesta deberá resolver explícitamente (no resueltos en esta fase, solo mapeados):
- Qué hacer con `FloatingChatWidget` (reemplazar por `AIChat`, coexistir, o deprecar) — impacta UX de todas las pantallas.
- Cómo resolver los 3 shape-mismatches antes de montar `SmartCategorySelector`, `PredictiveChart`, `AIAlerts`.
- Si el rollout de IA real se ata a `hasFeature('ai_analysis')`/`hasFeature('ai_predictions')` (ya existe el modelo) o se lanza gratis a todos primero.
- Cuál cifra de rate limit es la "verdad" a comunicar en UI (recomendable alinear a 10, el único que se aplica).
- Si se consolida a una sola instancia de `useAIInsights` (vía Context) en vez de instancias duplicadas por árbol de componentes.
- Privacidad: si se requiere aviso/consentimiento antes de enviar transacciones reales a Groq, dado que hoy no existe ninguno.
