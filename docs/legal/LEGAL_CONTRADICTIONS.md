# Contradicciones Legales Detectadas — SALDO

Registro de inconsistencias reales encontradas entre el código del producto y los documentos legales publicados, o entre los propios documentos legales entre sí. Ninguna se resuelve en esta fase — solo se documentan para decisión posterior.

---

## LEG-001 — Marca incorrecta en documentos publicados

**Descripción:** El producto se llama "SALDO" en el código (`src/components/AI/AIConsentPrompt.jsx:15`, texto in-app: *"Para sugerirte la categoría, Saldo le muestra la descripción..."*). Los documentos legales publicados usan "Budget Calculator" en título, contenido y footer.

**Fuente:**
- `public/terms.html` (título, §1, footer)
- `public/privacy.html` (título, §1, footer)
- Contraste: `src/components/AI/AIConsentPrompt.jsx:15`

**Impacto:** Un documento legal que nombra incorrectamente al servicio que regula es un defecto de forma que puede debilitar su exigibilidad y genera confusión sobre a qué producto se refiere el contrato.

**Acción requerida:** Decisión de nombre comercial definitivo antes de actualizar los documentos (ver PO-LEGAL-006 en `LEGAL_DECISIONS_PENDING.md`).

**Responsable:** Product Owner.

---

## LEG-002 — Proveedores de IA inconsistentes entre fuentes

**Descripción:** Tres fuentes del repositorio listan proveedores de IA distintos para la misma funcionalidad de categorización/insights.

**Fuente:**
- `public/terms.html §5`: "Gemini, Groq"
- `public/privacy.html §4`: "Google Gemini / Groq / Anthropic"
- `docs/technical/MONETIZATION_STRATEGY.md`: solo menciona "Claude AI" (Anthropic) como motor de insights

**Impacto:** Una Política de Privacidad que declara proveedores incorrectos incumple el principio de transparencia sobre a quién se transfieren los datos del usuario.

**Acción requerida:** Confirmar el/los proveedor(es) real(es) activo(s) en producción antes de redactar o actualizar la sección de terceros de la Privacy Policy (ver PO-LEGAL-003).

**Responsable:** Product Owner / equipo técnico.

---

## LEG-003 — Afirmación no verificada sobre retención de datos por proveedores de IA

**Descripción:** `terms.html §5` afirma que los datos enviados a los proveedores de IA "no son almacenados por nosotros". Esta afirmación no fue verificada contra la implementación real del proxy de IA en el backend.

**Fuente:** `public/terms.html §5`

**Impacto:** Si la afirmación fuera falsa o parcialmente falsa, el documento legal contendría una promesa incumplida — un riesgo legal mayor que no tener la afirmación en absoluto.

**Acción requerida:** Verificación técnica del comportamiento real del proxy de IA antes de repetir esta afirmación en cualquier documento actualizado. No se asume verdadera ni falsa en esta fase.

**Responsable:** Equipo técnico (verificación) → Product Owner (validación antes de publicar).

---

## LEG-004 — Eliminación de cuenta prometida sin mecanismo automático verificado

**Descripción:** `terms.html §8` promete eliminación de cuenta y datos "de forma permanente en un plazo de 30 días" tras solicitud por email. No se encontró en el código ningún mecanismo de autoservicio de eliminación de cuenta (búsqueda sin resultados de `deleteAccount`/`eliminar cuenta` en `src/`).

**Fuente:**
- `public/terms.html §8`
- Ausencia verificada en `src/` (sin componente ni handler de eliminación de cuenta)

**Impacto:** Una promesa de plazo de eliminación que depende de un proceso manual no verificable en el tiempo es un riesgo de incumplimiento a escala, especialmente si el volumen de usuarios crece.

**Acción requerida:** Decisión sobre si el proceso se mantiene manual (documentado y operacionalmente garantizado) o se construye autoservicio (ver PO-LEGAL-005).

**Responsable:** Product Owner.

---

## LEG-005 — Proveedores IA documentados versus proveedores IA activos verificados

**Descripción:** Existe una diferencia entre los proveedores de IA mencionados en documentación/configuración del repositorio y los proveedores cuyo uso fue confirmado mediante una llamada de red real en el código.

**Fuente:**
- Proveedores mencionados: `public/terms.html §5`, `public/privacy.html §4` (ya citados en LEG-002), `.env.example:19-37` (`VITE_GOOGLE_GEMINI_API_KEY`, `VITE_ANTHROPIC_API_KEY`), CSP de `netlify.toml:74-80` (`connect-src` permite `generativelanguage.googleapis.com` y `api.anthropic.com`)
- Proveedor confirmado mediante flujo real: **Groq** (`netlify/functions/ai-proxy.js`, única llamada de red real verificada, a `api.groq.com`)
- Proveedores sin llamada real verificada: **Gemini**, **Anthropic**
- **OpenAI**: evaluado y descartado como proveedor real — la única coincidencia textual encontrada (`api.groq.com/openai/v1/...`) es Groq exponiendo un formato de API compatible con el estándar de OpenAI, no una llamada a infraestructura de OpenAI
- Detalle completo de la verificación: `docs/legal/AI_DATA_FLOW.md §4`

**Impacto:** La Política de Privacidad no debe listar como proveedores activos a proveedores sin llamada real confirmada — hacerlo describiría una superficie de transferencia a terceros mayor a la verificada en el código.

**Acción requerida:** Confirmar con el Product Owner si (a) existen planes reales de multi-proveedor, (b) deben eliminarse las referencias obsoletas en `.env.example`/CSP, o (c) debe mantenerse la arquitectura preparada para futuros proveedores por decisión deliberada.

**Responsable:** Product Owner / equipo técnico.

---

## LEG-006 — Divergencia entre arquitectura de entrada IA y caminos alternativos

**Descripción:** `AIContext.jsx` se presenta a sí mismo, en su propio comentario de diseño, como punto central y único de entrada de IA. Sin embargo, existe otro camino (`useAIInsightsMulti.js`) con capacidades analíticas diferentes que no pasa por ese módulo.

**Fuente:**
- `src/contexts/AIContext.jsx:9-16` (comentario de diseño: "ENTRADA ÚNICA de IA... único módulo autorizado a disparar salidas al proxy")
- `src/hooks/useAIInsightsMulti.js` (imports y llamadas directas a `ai-providers.js`, sin pasar por `AIContext`)
- Detalle completo de la verificación: `docs/legal/AI_DATA_FLOW.md §1` y `§6`

**Estado:** No se confirmó que el flujo alternativo esté expuesto en una ruta activa de usuario. Evidencia indirecta de desconexión: el componente que lo consume (`AIInsightsPanel`) no aparece importado fuera de su propio archivo/barrel export, y existe un comentario en `ImportManager.test.jsx` que documenta una migración de `ImportManager` hacia afuera de `useAIInsights`.

**Impacto:** Si el flujo alternativo vuelve a activarse, el modelo actual de consentimiento IA (texto de `AIConsentPrompt.jsx`, que solo menciona "la descripción de este movimiento") podría requerir revisión, porque ese flujo maneja un alcance de datos distinto.

**Acción requerida:** Determinar si el flujo alternativo será eliminado, será integrado correctamente al gate único de `AIContext`, o permanecerá deliberadamente como código legado no utilizado.

**Responsable:** Product Owner / equipo técnico.

---

## LEG-007 — Capacidad IA potencialmente más amplia que el consentimiento actual

**Descripción:** Existe código capaz de enviar información financiera más amplia al procesamiento de IA que la que envía el flujo actualmente activo y documentado en el consentimiento del usuario.

**Fuente:**
- Flujo activo confirmado: solo la descripción del movimiento, o filas de CSV enmascaradas (`src/lib/groqProvider.js`)
- Flujo encontrado (no confirmado como accesible desde interfaz activa): `src/hooks/useAIInsightsMulti.js`, que arma prompts con transacciones completas — incluyen monto, categoría, fecha e identificadores (`id` interno de transacción)
- Detalle completo de la verificación: `docs/legal/AI_DATA_FLOW.md §3`

**Estado:** No verificado si existe acceso desde interfaz activa (hallazgo relacionado con LEG-006, pero enfocado en el contenido de los datos enviados, no en la arquitectura de entrada).

**Impacto:** Debe resolverse antes de ampliar funciones de IA que usen datos financieros completos — el texto de consentimiento actual no cubre ese alcance de datos.

**Acción requerida:** Auditar la exposición real del flujo (¿es alcanzable desde alguna ruta o feature flag no revisada todavía?) antes de decidir su destino.

**Responsable:** Equipo técnico (auditoría) → Product Owner (decisión).

---

## BILLING-001 — Posible desincronización entre cancelación interna y Stripe

**Descripción:** El flujo de cancelación interno actualiza el estado de suscripción en Supabase, pero no se confirmó una llamada directa a la API de Stripe para cancelar la suscripción real.

**Fuente:**
- `netlify/functions/subscription-manage.js` (acciones `cancel_at_period_end`/`downgrade_to_free` — el archivo solo importa `@supabase/supabase-js`, sin SDK de Stripe)
- Contraste con la integración de Stripe existente (`netlify/functions/stripe-webhook.js`, `create-checkout-session.js`)
- Detalle completo de la verificación: `docs/legal/BILLING_MODEL.md §4`

**Estado:** No verificado si existe sincronización alternativa mediante otro mecanismo (por ejemplo, Stripe Customer Portal u otra integración fuera de este repositorio).

**Impacto:** Podría existir diferencia entre el estado que SALDO muestra al usuario y el estado real de facturación en Stripe.

**Acción requerida:** Confirmar la arquitectura definitiva de cancelación antes de redactar la Política de Suscripciones y Reembolsos.

**Responsable:** Product Owner / equipo técnico.

---

*Este registro se actualiza solo cuando se detecta o se resuelve una contradicción verificada. No se agregan entradas especulativas.*
