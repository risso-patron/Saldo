# Tasks: `insights-ia-real` — desglose de implementación

**Fase**: sdd-tasks (plan de ejecución — NO código)
**Fecha**: 2026-07-14
**Insumos**: `proposal.md` (10 decisiones), `spec.md` (33 Requirements, 11 Áreas), `design.md` (8 principios, 15 áreas técnicas, 18 criterios de aceptación §15 tras la enmienda post-aprobación), `explore.md` + verificación directa del código a la fecha de esta fase.
**strict_tdd**: `true` — test runner `npm test` (Vitest 4). Toda tarea con lógica testeable se descompone en par test-rojo → implementación-verde citando el mismo Requirement/Scenario.

## Nota de verificación de código (ver también "Discrepancias" al final)

Se releyó el código real de `App.jsx`, `BudgetForm.jsx`, `SmartCategorySelector.jsx`, `ai-providers.js`, `ai-proxy.js`, `ImportManager.jsx`, `useAIInsightsMulti.js`, `useSubscription.js`, `categorizationEngine.js` y `supabase/subscriptions-schema.sql` antes de escribir este plan. Todas las líneas citadas por `design.md` (`App.jsx:125`, `App.jsx:266-267`, `BudgetForm.jsx:237-246`, `ai-providers.js:35`, `ai-proxy.js:26`, `useSubscription.js:102-104`, `ImportManager.jsx:138/292`) **coinciden exactamente** con el estado actual — no hubo drift de líneas. Se encontró, sin embargo, una cadena de dependencia no contemplada en `design.md` §6 (ver tarea 5.6/5.7 y sección de discrepancias): `ImportManager.jsx:204` (`categorizeTransactionsFull`) llama a Groq por una ruta distinta a la de `SmartCategorySelector`, sin pasar por ningún gate.

---

## Fase 1 — Infraestructura compartida (sin UI)

### 1.1 — Test rojo: `planHasCapability` (shared/aiCapabilities.js) [x]
**Depende de**: ninguna
**Satisface**: spec.md Área 8 (Requirement: "Ninguna función de IA se ejecuta sin pasar el gate de plan"), design.md §4 (`shared/aiCapabilities.js`, `AI_CAPABILITIES`/`AI_PLANS_WITH_AI`), §9 (catálogo compartido, ex-R3)
**Tipo**: test-rojo
**Criterio de finalización**: existe `shared/aiCapabilities.test.js` (o ubicación equivalente) con casos: plan `free` → `planHasCapability('free','assisted_categorization')` false; `pro_monthly`/`pro_yearly`/`lifetime` → true; capacidad inexistente → false. Test corre y falla (rojo) porque el módulo no existe aún.

### 1.2 — Implementar hasta verde: `shared/aiCapabilities.js` [x]
**Depende de**: 1.1
**Satisface**: mismos Requirement/§ que 1.1
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 1.1. El archivo vive en `shared/` (raíz del repo, fuera de `src/` y `netlify/functions/`), es ESM plano sin `import.meta.env` ni imports de React, y exporta `AI_PLANS_WITH_AI`, `AI_CAPABILITIES` (con las 4 capacidades: `assisted_categorization`, `spending_idea`, `future_glimpse`, `csv_column_mapping`) y `planHasCapability(planType, capability)`.

### 1.3 — Crear `src/config/aiInsights.js`
**Depende de**: ninguna
**Satisface**: spec.md Área 1 (Requirement: "Criterio objetivo de activación... el sistema MUST tratar este número como configurable... nunca incrustado como constante fija repetida"), design.md §2 y §4 (`config/aiInsights.js`)
**Tipo**: infra
**Criterio de finalización**: archivo exporta `AI_IDEA = { MIN_CATEGORIZED_EXPENSES: 20, MIN_HISTORY_DAYS: 28, EXCLUDED_CATEGORY: 'Otros' }`. Verificado manualmente (`grep`) que ningún otro archivo del repo repite el literal `20` o `28` como umbral de elegibilidad.

### 1.4 — Test rojo: `toConfidenceLabel` (src/lib/aiConfidence.js) [x]
**Depende de**: ninguna
**Satisface**: spec.md Área 10 (Requirement: "Toda sugerencia de categoría MUST tener una etiqueta de confianza válida... MUST NOT mostrar una sugerencia con una etiqueta de confianza no reconocida"), design.md §4 (`toConfidenceLabel`)
**Tipo**: test-rojo
**Criterio de finalización**: test con casos `>=0.8 → 'alta'`, `>=0.5 y <0.8 → 'media'`, `>0 y <0.5 → 'baja'`, `0`/negativo/`>1`/`NaN`/`undefined` → `null`. Falla en rojo (módulo no existe).

### 1.5 — Implementar hasta verde: `src/lib/aiConfidence.js` [x]
**Depende de**: 1.4
**Satisface**: igual que 1.4
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 1.4. Única fuente del mapeo número→etiqueta en el repo.

### 1.6 — Test rojo: `evaluateIdeaEligibility` — criterio objetivo de umbral
**Depende de**: 1.3
**Satisface**: spec.md Área 1 (Requirement: "Criterio objetivo de activación de 'Una idea sobre tu plata'"), Scenarios: "Exactamente 19 gastos... NO se activa", "20+ gastos cargados de golpe sin historial temporal... NO se activa", "Ambas condiciones cumplidas... SÍ se activa", "Días suficientes pero conteo insuficiente... NO se activa", "'Otros' no cuenta para el umbral... NO se activa"; design.md §4 (`ideaEligibility.js`), Principio 1
**Tipo**: test-rojo
**Criterio de finalización**: `src/lib/ideaEligibility.test.js` cubre los 5 escenarios citados con los datos exactos de cada Scenario (19 en categorías reales/40 días; 25 en categorías reales/2 días; 20 en categorías reales/28 días; 8 en categorías reales/90 días; 17 reales + 8 "Otros"/30 días). Falla en rojo.

### 1.7 — Implementar hasta verde: `evaluateIdeaEligibility` — umbral
**Depende de**: 1.6
**Satisface**: igual que 1.6
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa los 5 escenarios de 1.6. Función pura, importa `AI_IDEA` de `config/aiInsights.js`, excluye `EXCLUDED_CATEGORY` del conteo, evalúa ambas condiciones (a)/(b) de forma independiente.

### 1.8 — Test rojo: `evaluateIdeaEligibility` — abstención sin patrón genuino
**Depende de**: 1.7
**Satisface**: spec.md Área 1 (Requirement: "El sistema se abstiene de mostrar un hallazgo sin patrón genuino, aunque el umbral se cumpla"), Scenarios: "Umbral cumplido pero sin patrón genuino — el sistema se abstiene", "Umbral cumplido y patrón genuino presente — el sistema sí muestra el hallazgo"; design.md Principio 1, §4
**Tipo**: test-rojo
**Criterio de finalización**: test agrega casos con gasto parejo entre categorías (30 gastos/60 días, sin desviación) → `{ eligible:true, show:false }` o equivalente sin forzar conclusión; y con desviación clara y sostenida → `{ eligible:true, show:true }`. Falla en rojo.

### 1.9 — Implementar hasta verde: `evaluateIdeaEligibility` — abstención
**Depende de**: 1.8
**Satisface**: igual que 1.8
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa los 2 escenarios de 1.8 además de los 5 de 1.6/1.7. La ausencia de hallazgo es un resultado válido de la función, no un `null` accidental ni una excepción.

### 1.10 — Crear `src/lib/aiProvider.js` (AIProvider Interface, contrato) [x]
**Depende de**: ninguna
**Satisface**: design.md §1 (Capa de abstracción de proveedor), §4 (contrato `AIProvider`), Principio 3, decisión de arquitectura del PO #3
**Tipo**: infra
**Criterio de finalización**: archivo documenta vía JSDoc (`@typedef`/`@callback`, sin lógica runtime) las 4 capacidades: `categorize(description)`, `generateIdea(aggregates)`, `predict(aggregates)`, `mapColumns(headers, sampleRows)`, con sus shapes de retorno tal como los define design.md §4. Verificado manualmente que no importa React ni `ai-providers`/`groqProvider`.

### 1.11 — Migración SQL: `supabase/user-settings-schema.sql` [x]
**Depende de**: ninguna
**Satisface**: spec.md Área 6 (Requirements: "revocación inmediata... desde el área de cuenta", "sin consentimiento activo la superficie de IA desaparece", "ningún dato viaja al proveedor de IA antes de que exista consentimiento activo"), design.md §8 (esquema `user_settings`, decisión de arquitectura del PO #2)
**Tipo**: infra
**Criterio de finalización**: archivo sigue la convención verificada de `supabase/subscriptions-schema.sql` (`gen_random_uuid()`, FK a `auth.users(id) ON DELETE CASCADE`, RLS habilitada, índice por `user_id`). Crea tabla `user_settings(id, user_id, setting_key TEXT, setting_value JSONB, updated_at)` con `UNIQUE(user_id, setting_key)`, políticas `own_settings_select/insert/update` (patrón `transactions`, no el lockdown de `subscriptions`), y **reutiliza** la función `update_updated_at_column()` ya definida en `subscriptions-schema.sql` (no la redefine) en un nuevo trigger `set_user_settings_updated_at`. Verificado manualmente: el SQL es sintácticamente válido y no re-declara la función compartida.

### 1.12 — Test rojo: `groqProvider.categorize` [x]
**Depende de**: 1.10
**Satisface**: spec.md Área 10 (deuda técnica bloqueante — shape mismatch de `confidence`), design.md §4 ("Fix del shape mismatch"), §2 (`groqProvider.js`)
**Tipo**: test-rojo
**Criterio de finalización**: test cubre: respuesta Groq válida → `{ category, confidence:number }` (número crudo 0..1, el mapeo a etiqueta ocurre en el gateway, no acá); JSON de Groq malformado → rechazo controlado (no lanza excepción no manejada). Falla en rojo (módulo no existe).

### 1.13 — Implementar hasta verde: `groqProvider.js` — `categorize` [x]
**Depende de**: 1.12
**Satisface**: igual que 1.12
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 1.12. `src/lib/groqProvider.js` implementa `categorize` como refactor de `suggestCategory` (`ai-providers.js:216-220` actual), arma el prompt Groq, parsea el JSON, llama al proxy vía `callViaProxy`. Implementa la interfaz de 1.10.

### 1.14 — Test rojo: `groqProvider` — `generateIdea`, `predict`, `mapColumns`
**Depende de**: 1.10, 1.13
**Satisface**: spec.md Área 7 (Requirements de minimización por flujo: agregados para "idea"/predicción, headers para mapeo CSV), design.md §1/§4 (AIProvider Interface completa)
**Tipo**: test-rojo
**Criterio de finalización**: tests que confirman: `generateIdea(aggregates)` arma el prompt solo con agregados por categoría/período (nunca transacciones individuales) y puede resolver `null` (abstención, Principio 1); `predict(aggregates)` igual con agregados por categoría/mes; `mapColumns(headers, sampleRows)` conserva la firma de salida `columnMap` del `mapCSVColumns` actual (`ai-providers.js:360-411`). Falla en rojo.

### 1.15 — Implementar hasta verde: `groqProvider.js` — resto de capacidades + compatibilidad
**Depende de**: 1.14
**Satisface**: igual que 1.14; además preserva compatibilidad con consumidores no cubiertos por la AIProvider Interface (hallazgo de verificación, ver discrepancias)
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 1.14. `groqProvider.js` completa el refactor de `analyzeFinances`→`generateIdea`, `predictNextMonthExpenses`→`predict`, `mapCSVColumns`→`mapColumns`. Además, **preserva sin romper** `bulkCategorizeTransactions`, `getAvailableProviders`, `getProviderStatus` y `callAI` como exports adicionales (no parte de la interfaz de dominio) hasta que la Fase 5 los retire o migre — verificado manualmente que `src/services/aiService.js`, `src/hooks/useAIInsightsMulti.js`, `src/features/chat/AIChat.jsx` y `src/components/AI/AIProviderStatus.jsx` siguen resolviendo sus imports sin error tras el refactor (`ai-providers.js` puede quedar como re-export de `groqProvider.js` o eliminarse si todos sus consumidores ya migraron — a decidir en apply sin romper ninguno de los 4 consumidores listados).

---

## Fase 2 — Enforcement de servidor

### 2.1 — Test rojo: `ai-proxy.js` — enforcement de plan (403) [x]
**Depende de**: 1.2
**Satisface**: spec.md Área 8 (Requirement: "Ninguna función de IA se ejecuta sin pasar el gate de plan"), Scenarios: "Usuario free no dispara la función de IA subyacente" (403, sin llamar a Groq), "Usuario pro/lifetime accede con normalidad"; design.md §9 (enforcement doble capa), Principio 7
**Tipo**: test-rojo
**Criterio de finalización**: extiende `src/__tests__/aiProxy.security.test.js` (o archivo equivalente, mismo patrón `__private`) con: usuario autenticado cuyo `plan_type` en `subscriptions` es `free` → respuesta 403, `callGroq` nunca invocado; usuario `pro_monthly`/`lifetime` → continúa el flujo normal (no 403). Falla en rojo (el proxy no consulta plan hoy).

### 2.2 — Implementar hasta verde: `ai-proxy.js` — enforcement de plan [x]
**Depende de**: 2.1
**Satisface**: igual que 2.1
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 2.1. Tras `authenticateRequest`, el handler consulta `subscriptions` por `user.id`, importa `shared/aiCapabilities.js` (ruta relativa `../../shared/aiCapabilities`) y responde 403 si `!planHasCapability(plan_type, 'assisted_categorization')` antes de llamar a `callGroq`.

---

## Fase 3 — Entrada única de IA (AIContext)

### 3.1 — Test rojo: `assertOutboundAllowed` — fail-closed [x]
**Depende de**: ninguna
**Satisface**: spec.md Área 6 (Requirement: "Ningún dato viaja al proveedor de IA antes de que exista consentimiento activo... garantía dura, sin excepciones"), design.md §8 ("Cero llamadas salientes... en UN solo punto de control"), Principio 3, Riesgo R1
**Tipo**: test-rojo
**Criterio de finalización**: test cubre: `hasConsent=false` → deniega; `hasConsent=true, consentLoaded=false` (cache stale antes de reconciliar) → deniega igual (fail-closed); `hasConsent=true, consentLoaded=true` → permite. Falla en rojo.

### 3.2 — Implementar hasta verde: `assertOutboundAllowed` [x]
**Depende de**: 3.1
**Satisface**: igual que 3.1
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 3.1. Vive dentro de `src/contexts/AIContext.jsx` como guarda previa a cualquier llamada saliente.

### 3.3 — Test rojo: `grantConsent` / `revokeConsent` [x]
**Depende de**: 1.11, 3.2
**Satisface**: spec.md Área 6 (Requirements: "consentimiento al primer uso, en contexto", "revocación inmediata, sin justificación, desde el área de cuenta"), design.md §3.2 (secuencia de consentimiento), §8, Riesgo R3
**Tipo**: test-rojo
**Criterio de finalización**: test cubre: `grantConsent()` hace UPSERT sobre `(user_id, 'ai_consent')` en `user_settings` con `setting_value=true` y actualiza cache `localStorage['budgetrp_ai_consent']`; `revokeConsent()` pone `consent=false` de inmediato en memoria (optimista) antes de que resuelva la escritura remota, y reintenta si la escritura falla. Falla en rojo.

### 3.4 — Implementar hasta verde: `grantConsent` / `revokeConsent` [x]
**Depende de**: 3.3
**Satisface**: igual que 3.3
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 3.3. Al montar, `AIContext` lee cache de `localStorage` (evita flicker) y luego reconcilia con Supabase (`SELECT setting_value WHERE setting_key='ai_consent'`); ausencia de fila = sin consentimiento (fail-closed).

### 3.5 — Test rojo: estado único observado desde dos consumidores [x]
**Depende de**: 3.4
**Satisface**: spec.md Área 4 (Requirement: "Un único punto de verdad para gate, límite y consentimiento"), Scenario: "Dos pantallas, mismo estado en el mismo instante"; design.md §1 (Arquitectura AIContext), §4 (`AIState`)
**Tipo**: test-rojo
**Criterio de finalización**: test con dos componentes de prueba que consumen `useAI()` simultáneamente bajo el mismo `AIProvider`; al cambiar `hasConsent`/`canUseAI` en uno, el otro observa el mismo valor en el mismo render, sin desincronización. Falla en rojo (`AIContext` no existe aún como Provider completo).

### 3.6 — Implementar hasta verde: `AIContext` Provider + `useAI()` [x]
**Depende de**: 3.5
**Satisface**: igual que 3.5
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 3.5. Sigue el patrón `createContext(null)` + `Provider` con `value` memoizado + hook `useAI()` que lanza fuera del provider, igual que `PeriodContext.jsx`/`CurrencyContext.jsx`. Expone `hasConsent`, `consentLoaded`, `canUseAI` (`planHasCapability(planType, 'assisted_categorization')`), `status`.

### 3.7 — Test rojo: `suggestCategory` — 4 casos de error mapean a `status` tipado [x]
**Depende de**: 1.15, 1.5, 3.6
**Satisface**: spec.md Área 5 (los 4 Requirements de casos 1-4), design.md §7 (tabla de manejo de errores), Principio 6
**Tipo**: test-rojo
**Criterio de finalización**: test cubre: sin plan → `status:'no_plan'` sin llamar a la red; 429 del proxy → `status:'rate_limited'`; sin consentimiento → `status:'no_consent'` (corto-circuito, sin red); 503/red caída → `status:'provider_error'`; éxito → `{category, confidence:'alta'|'media'|'baja'}` vía `toConfidenceLabel`. Ninguna promesa queda sin manejar. Falla en rojo.

### 3.8 — Implementar hasta verde: `AIContext.suggestCategory` [x]
**Depende de**: 3.7
**Satisface**: igual que 3.7
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 3.7. El gateway envuelve la llamada a `groqProvider.categorize` en `try/catch`, nunca propaga la excepción cruda al render, delega el mapeo número→etiqueta a `toConfidenceLabel` (1.5) en un solo lugar.

### 3.9 — Test rojo: guarda de sesión de borrador (respuesta tardía descartada) [x]
**Depende de**: 3.8
**Satisface**: spec.md Área 3 (Requirement: "La sugerencia se confirma o se corrige — nunca se aplica en silencio"; "la categoría final del movimiento MUST ser siempre la que el usuario confirmó"), design.md Principio 8, §3.1 (secuencia, caso "RESPUESTA TARDÍA"), §14 Riesgo R2
**Tipo**: test-rojo
**Criterio de finalización**: test simula: se emite `suggestCategory` con `requestId`+`AbortController`; el usuario confirma/guarda antes de que la respuesta resuelva (`committed=true`); cuando la respuesta tardía resuelve, se descarta — no se escribe ni se propone al `SmartCategorySelector`, la categoría persistida sigue siendo la confirmada por el usuario. Falla en rojo.

### 3.10 — Implementar hasta verde: guarda de sesión de borrador [x]
**Depende de**: 3.9
**Satisface**: igual que 3.9
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 3.9. Cada pedido lleva `requestId` propio; al confirmar/guardar o desmontar `SmartCategorySelector`, el borrador pasa a `committed` (o se aborta vía `AbortController`); ningún efecto escribe la sugerencia en persistencia — el único camino de escritura es la acción explícita del usuario.

---

## Fase 4 — Integración UI

### 4.1 — Test rojo: `SmartCategorySelector` — confirmar/corregir y confianza inválida [x]
**Depende de**: 3.8
**Satisface**: spec.md Área 3 (Scenarios: "Confirmar con un toque", "Corregir manualmente anula la sugerencia"), Área 10 (Scenario: "Confianza fuera del conjunto reconocido no se muestra rota"); design.md Principio 2, §4
**Tipo**: test-rojo
**Criterio de finalización**: test con `@testing-library/react` cubre: tocar "Aplicar" guarda `suggestedCategory.category` vía `onCategoryChange`; elegir una categoría distinta del `<select>` guarda esa, no la sugerida; `suggestedCategory=null` (confianza no reconocida ya filtrada por el gateway) no renderiza ningún badge roto. Falla en rojo si el wiring actual no cumple alguno de los tres.

### 4.2 — Implementar hasta verde: ajustes de wiring en `SmartCategorySelector` [x]
**Depende de**: 4.1
**Satisface**: igual que 4.1
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 4.1. `SmartCategorySelector.jsx` no cambia su contrato de props (`propTypes` ya declara `confidence: oneOf(['alta','media','baja'])`); solo se ajusta si el test de 4.1 revela un gap real de wiring.

### 4.3 — Test rojo: `BudgetForm` monta `SmartCategorySelector` con fallback manual [x]
**Depende de**: 4.2, 3.10
**Satisface**: spec.md Área 3 (Requirement: "Sin sugerencia disponible, el selector manual sigue siendo el camino completo"), design.md §5 (Puntos de integración), Principios 4/5
**Tipo**: test-rojo
**Criterio de finalización**: test cubre: con `activeType==='expense'`, `canUseAI && hasConsent` → se renderiza `SmartCategorySelector` alimentado por `useAI()`; con `!canUseAI || !hasConsent` → se renderiza el `<Select id="budget-category">` de siempre, sin bloquear el guardado. Falla en rojo (hoy `BudgetForm.jsx:238-245` siempre renderiza el `<Select>` plano).

### 4.4 — Implementar hasta verde: montar `SmartCategorySelector` en `BudgetForm` [x]
**Depende de**: 4.3
**Satisface**: igual que 4.3
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 4.3. Reemplaza el bloque `<Select id="budget-category">` (`BudgetForm.jsx:238-245`) cuando corresponde; alimenta `onGetSuggestion={ai.suggestCategory}`, `suggestedCategory`, `loading` desde `useAI()`; usa `EXPENSE_CATEGORIES` (ya en `BudgetForm.jsx:107`).

### 4.5 — Test rojo: consentimiento just-in-time al primer uso [x]
**Depende de**: 3.4, 4.4
**Satisface**: spec.md Área 6 (Requirement: "El consentimiento se pide al primer uso, en contexto, no en onboarding"), Scenario: "Primer uso dispara el pedido de consentimiento"; design.md §3.2, propuesta §7.1
**Tipo**: test-rojo
**Criterio de finalización**: test simula un usuario sin consentimiento previo escribiendo por primera vez una descripción de ≥3 caracteres en `BudgetForm`; se muestra el pedido de consentimiento ("Activar"/"Ahora no") antes de cualquier salida de red; no aparece en ningún flujo de onboarding. Falla en rojo.

### 4.6 — Implementar hasta verde: UI de consentimiento just-in-time [x]
**Depende de**: 4.5
**Satisface**: igual que 4.5
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 4.5. Copy exacto de propuesta §7.1 ("Para sugerirte la categoría, Saldo le muestra la descripción de este movimiento a un servicio que nos ayuda con eso. Vos decidís." / "Activar" / "Ahora no"), sin nombrar al proveedor.

### 4.7 — Test rojo: fallback visual de los 4 casos de Área 5 [x]
**Depende de**: 3.8
**Satisface**: spec.md Área 5 (los 4 Requirements con reglas de copy comunes: sin jerga, sin código de error, sin nombrar proveedor, sin culpar), design.md §7 (tabla de manejo de errores)
**Tipo**: test-rojo
**Criterio de finalización**: test con los 4 `status` (`no_plan`, `rate_limited`, `no_consent`, `provider_error`) inyectados en el consumidor de `useAI()`; cada uno renderiza su copy distinto (invitación a mejorar / espera sin cifra / superficie ausente sin insistencia / reintento calmo); ninguno muestra "429", "rate limit", nombre de proveedor ni código técnico; el selector manual está siempre operable. Falla en rojo.

### 4.8 — Implementar hasta verde: componentes de fallback por `status` [x]
**Depende de**: 4.7
**Satisface**: igual que 4.7
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 4.7.

### 4.9 — Test rojo: revocación desde `ProfilePage` se refleja sin pasos adicionales [x]
**Depende de**: 3.6, 3.4
**Satisface**: spec.md Área 6 (Requirement: "revocación inmediata, sin justificación, desde el área de cuenta"), Área 4 (Requirement: "Un cambio de consentimiento se refleja en todas las pantallas sin pasos adicionales"); design.md §8, Riesgo R3
**Tipo**: test-rojo
**Criterio de finalización**: test monta `ProfilePage` y otro consumidor de `useAI()` bajo el mismo `AIProvider`; al apagar el interruptor "Usar la IA de Saldo" en `ProfilePage`, el otro consumidor ve `hasConsent=false` sin recargar ni repetir ninguna acción; no se pide motivo ni confirmación adicional. Falla en rojo.

### 4.10 — Implementar hasta verde: toggle de consentimiento en `ProfilePage` [x]
**Depende de**: 4.9
**Satisface**: igual que 4.9
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 4.9. Se integra en `ProfilePage.jsx` junto al área de plan/cuenta ya existente (mismo patrón que `PricingPlans`/`showPricing`), copy: "Usar la IA de Saldo — podés apagarla cuando quieras."

---

## Fase 5 — Migración y retiro

### 5.1 — Test rojo: `ImportManager` usa `useAI().mapColumns` [x]
**Depende de**: 1.15, 3.6
**Satisface**: spec.md Área 7 (Requirement: "Mapeo de columnas CSV — encabezados, sin filas completas sin enmascarar"), design.md §6 (Estrategia de migración, `ImportManager.jsx:138`)
**Tipo**: test-rojo
**Criterio de finalización**: test cubre: con acceso, el mapeo de columnas usa `useAI().mapColumns(headers, sampleRows)` y conserva la firma de salida `columnMap` idéntica al pipeline actual (`ImportManager.jsx:292`); sin acceso (gate/consentimiento denegado), cae a los modos no-IA existentes (`template|profile|pattern|manual`) sin romper el flujo de importación. Falla en rojo (hoy usa `useAIInsights([])` directo).

### 5.2 — Implementar hasta verde: migrar `ImportManager` a `useAI()` [x]
**Depende de**: 5.1
**Satisface**: igual que 5.1
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 5.1. Se reemplaza `const aiInsights = useAIInsights([])` (`ImportManager.jsx:138`) por `const ai = useAI()`; `aiInsights.mapImportColumns(...)` (`ImportManager.jsx:292`) pasa a `ai.mapColumns(...)`.

### 5.3 — Retirar `FloatingChatWidget`/`FloatingChatButton` [x]
**Depende de**: ninguna
**Satisface**: spec.md Área 2 (Requirement: "El widget de chat falso deja de mostrarse en toda la aplicación", Scenario: "Ausencia total, incluyendo mobile"), design.md §6 ("borrado directo, sin flag ni estado transicional")
**Tipo**: manual
**Criterio de finalización**: se elimina el mount (`App.jsx:266-267`) y los imports (`App.jsx:29-30`); se borran `src/components/Shared/FloatingChatWidget.jsx` y `src/components/Shared/FloatingChatButton.jsx`. Verificado manualmente en viewport de 375px que no queda ningún botón flotante ni espacio reservado, en ninguna pestaña.

### 5.4 — Limpiar instancia descartada de `useAIInsights` e imports muertos en `App.jsx` [x]
**Depende de**: 5.5
**Satisface**: spec.md Área 1 (Requirement: "El sistema MUST NOT exponer ninguna otra superficie de IA... componentes excluidos o diferidos no aparecen"), design.md §6 ("`App.jsx:125`... se elimina; el estado ahora vive en `AIProvider`")
**Tipo**: manual
**Criterio de finalización**: se elimina `useAIInsights(allTransactions)` (`App.jsx:125`, resultado ya descartado) y el import de `useAIInsights` (`App.jsx:26`). Se eliminan los imports muertos de `AIAlerts`/`AIProviderStatus` (`App.jsx:25`) y el `lazy` de `AIInsightsPanel` (`App.jsx:55`) — ninguno tenía JSX que los invocara (0 renders confirmados). Verificado manualmente que `npm run build` no reporta imports rotos.

### 5.5 — Montar `AIProvider` en `App.jsx` [x]
**Depende de**: 3.6
**Satisface**: spec.md Área 4 (entrada única), design.md §1 (arquitectura general, `AIProvider` envolviendo el árbol autenticado)
**Tipo**: infra
**Criterio de finalización**: `AIProvider` envuelve el árbol autenticado en `App.jsx` al mismo nivel que los providers existentes (`PeriodContext`, `CurrencyContext`). Verificado manualmente que `useAI()` resuelve sin lanzar en cualquier componente autenticado.

### 5.6 — Test rojo: gatear la categorización en lote de importación (hallazgo de verificación) [x]
**Depende de**: 5.5
**Satisface**: spec.md Área 6 (Requirement: "Ningún dato viaja al proveedor de IA antes de que exista consentimiento activo... garantía dura, sin excepciones por tipo de flujo"), Área 8 (Requirement: "Ninguna función de IA se ejecuta sin pasar el gate de plan"); design.md §6 (enmendado post-aprobación para cubrir explícitamente esta ruta — ver bullet de `ImportManager.jsx:204`), §9 (alcance del enforcement), §13, §15
**Tipo**: test-rojo
**Criterio de finalización**: test cubre que `categorizeTransactionsFull` (`categorizationEngine.js`, invocado desde `ImportManager.jsx:204`) **no** invoca su ruta de IA (`aiService.categorizeWithAI` → `bulkCategorizeTransactions`) cuando `!canUseAI || !hasConsent`; en ese caso, las transacciones sin match de reglas locales caen a `category:'Otros'` (fallback ya existente en el propio motor) en vez de llamar a Groq. Falla en rojo (hoy no hay ningún gate en esa ruta).

### 5.7 — Implementar hasta verde: gate en la categorización en lote de importación [x]
**Depende de**: 5.6
**Satisface**: igual que 5.6
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 5.6. `ImportManager` (o `categorizeTransactionsFull`, según se resuelva en apply sin tocar la firma pública que consumen sus llamadores) consulta `canUseAI`/`hasConsent` de `useAI()` antes de invocar el paso de IA en lote; sin acceso, usa solo las reglas locales (`categorizeWithRules`) y cae a `'Otros'` para el resto — el pipeline de importación no se bloquea.

---

## Fase 6 — Observabilidad y cierre

### 6.1 — Test rojo: eventos de logging IA solo contienen metadatos
**Depende de**: 3.8, 3.4, 2.2
**Satisface**: spec.md Área 7 (minimización de datos, principio transversal "nunca se envía/loguea más de lo necesario"), design.md §11 (Observabilidad, tabla de eventos permitidos/prohibidos), Principio 3
**Tipo**: test-rojo
**Criterio de finalización**: test cubre los 4 eventos (`idea_abstained`, `ai_provider_error`, `ai_gate_hit`, `ai_rate_limited`) verificando que el payload logueado nunca incluye `description`, `amount`, ni ningún campo de la transacción — solo los campos permitidos por la tabla de design.md §11 (`reason`, `kind`, `plan`). Falla en rojo.

### 6.2 — Implementar hasta verde: logging de eventos IA
**Depende de**: 6.1
**Satisface**: igual que 6.1
**Tipo**: implementación
**Criterio de finalización**: `npm test` pasa 6.1. Usa el `logger` existente (mismo patrón que `ai-proxy.js:244`, que ya loguea `groq_failed` sin contenido de transacción).

### 6.3 — Verificación cruzada final contra los 18 criterios de design.md §15
**Depende de**: todas las anteriores (1.1–6.2)
**Satisface**: design.md §15 (Criterios de aceptación, íntegro)
**Tipo**: manual
**Criterio de finalización**: se recorre cada uno de los 18 ítems de `design.md` §15 y se marca explícitamente cumplido/no cumplido con evidencia (test que lo cubre o verificación manual realizada); `npm test` corre la suite completa sin fallos; no queda ningún ítem sin marcar.

---

## Discrepancias código-real vs. `design.md`/`explore.md` encontradas en esta fase

1. **Sin drift de líneas**: todas las referencias de línea citadas por `design.md` (`App.jsx:125`, `App.jsx:266-267`, `BudgetForm.jsx:237-246`, `ai-providers.js:35`/`216-220`, `ai-proxy.js:26`, `useSubscription.js:102-104`, `ImportManager.jsx:138`/`292`) se verificaron exactas contra el código actual — no requirieron ajuste.

2. **Cadena de dependencia no contemplada en `design.md` §6 (hallazgo nuevo, real, con impacto de spec)**: `ImportManager.jsx:204` llama a `categorizeTransactionsFull` (`src/core/categorizationEngine.js:78-135`), que internamente llama a `categorizeWithAI` (`src/services/aiService.js`, no mencionado en ningún documento previo) → `bulkCategorizeTransactions` (`ai-providers.js`) → Groq — **una ruta de salida a Groq completamente distinta** de `SmartCategorySelector`/`suggestCategory`, y que `design.md` §6 (Estrategia de migración) no menciona en absoluto: solo cubre `ImportManager.jsx:138` (`mapImportColumns`), no `ImportManager.jsx:204` (categorización en lote). Esto significa que, sin la tarea 5.6/5.7, el MVP dejaría una segunda ruta de datos hacia Groq que ignora el gate de plan (Área 8) y el consentimiento (Área 6) — ambos Requirements son explícitos en no admitir excepciones por tipo de flujo. Se resolvió agregando el par 5.6/5.7 para gatear esa ruta detrás de `useAI()`, sin inventar ninguna arquitectura nueva: reutiliza el mismo `canUseAI`/`hasConsent` que ya expone `AIContext` por diseño.

3. **Corrección de caracterización de `categorizationEngine.js`**: `design.md` §2 lo describe como "(sin tocar) — camino local/manual de categorización; convive como fallback". Es cierto para `suggestExpenseCategory` (usado como sugerencia local instantánea, confirmado sin red) pero **no** para `categorizeTransactionsFull`, que sí depende de la cadena de Groq descrita en el punto 2. La tarea 5.6/5.7 acota el cambio a esa única función exportada, sin tocar `categorizeWithRules`/`suggestExpenseCategory`.

4. **Consumidores adicionales de `ai-providers.js` no listados en `design.md` §2**: además de `useAIInsightsMulti.js` (sí mencionado), se confirmó que `src/services/aiService.js` (`bulkCategorizeTransactions`), `src/features/chat/AIChat.jsx` (`callAI`) y `src/components/AI/AIProviderStatus.jsx` (`getAvailableProviders`/`getProviderStatus`) también importan directamente de `ai-providers.js`. La tarea 1.15 preserva estos exports como no-parte-de-la-interfaz para no romper ninguno de los cuatro, ya que ninguno está en el alcance de migración de esta fase (`AIChat`/`AIProviderStatus` están fuera del MVP por decisión de producto; `aiService.js` queda cubierto por 5.6/5.7).

Ninguna de estas discrepancias amplía el alcance de `design.md`: las tres primeras son correcciones de una omisión real en la Estrategia de migración (§6), resueltas aplicando Requirements ya aprobados (Área 6, Área 8) a una ruta de código que el documento de diseño no había mapeado; la cuarta es una tarea de preservación de compatibilidad, no una decisión de arquitectura nueva.
