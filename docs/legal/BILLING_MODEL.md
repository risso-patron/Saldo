# Modelo de Facturación de SALDO — Descubrimiento Técnico

**Este documento NO es legal ni define política comercial.** Es evidencia técnica para redactar correctamente la Política de Suscripciones y Reembolsos. Describe únicamente lo que el código implementa hoy, con cita `archivo:línea` en cada afirmación. Donde algo está solo documentado en una guía pero no implementado en el repo, se indica explícitamente como **"no implementado en el repo (solo documentado)"**.

---

## 1. Modelo comercial actual

| Plan | Precio | Frecuencia | Evidencia |
|---|---|---|---|
| **Free** | $0 | — | `plan_type` por defecto en el esquema (`supabase/subscriptions-schema.sql:9`); features listadas en `src/hooks/useSubscription.js:101` |
| **PRO Mensual** | $4.99 | Mensual (recurrente, `mode: 'subscription'`) | `src/hooks/useSubscription.js:137` (precio mostrado); `netlify/functions/create-checkout-session.js:77-80` (mapeo a `STRIPE_PRICE_PRO_MONTHLY`) |
| **PRO Anual** | $49 | Anual (recurrente, `mode: 'subscription'`) | `src/hooks/useSubscription.js:138`; `create-checkout-session.js:81-84` (mapeo a `STRIPE_PRICE_PRO_YEARLY`) |
| **Lifetime** | $79 | Pago único (`mode: 'payment'`) | `src/hooks/useSubscription.js:139`; `create-checkout-session.js:85-88` (mapeo a `STRIPE_PRICE_LIFETIME`) |

Los Price IDs reales de Stripe (`STRIPE_PRICE_PRO_MONTHLY`, etc.) son variables de entorno — su valor no vive en el repositorio, por lo que no se puede confirmar desde el código que los precios configurados en el Stripe Dashboard real coincidan con los que muestra el frontend. **No verificado.**

---

## 2. Flujo de compra

**Flujo real implementado en el repo:**

```
Usuario
  |
  |  selecciona plan en PricingPlans.jsx
  v
POST /.netlify/functions/create-checkout-session
  |  Authorization: Bearer <token de sesión Supabase>
  |  body: { planId, billingCycle }
  v
netlify/functions/create-checkout-session.js
  |  1. Autentica el token contra Supabase (líneas 23-36)
  |  2. Mapea planId+billingCycle → priceId de Stripe (líneas 72-91)
  |  3. stripe.checkout.sessions.create(...) (línea 104)
  |     — incluye metadata: { userId, planType } (líneas 113-116)
  v
Stripe Checkout (hosted, fuera de la app)
  |
  |  usuario paga
  v
Stripe emite evento webhook
  v
netlify/functions/stripe-webhook.js
  |  1. Verifica firma del webhook (líneas 54-63)
  |  2. Evento 'checkout.session.completed':
  |     lee metadata.userId / metadata.planType (línea 72)
  |     UPDATE subscriptions SET plan_type, status='active', ... 
  |       WHERE user_id = userId (líneas 79-100)
  v
Tabla `subscriptions` en Supabase actualizada
  v
Frontend lee la fila vía useSubscription.js (poll/reload, no realtime
  verificado) → isPro()/hasFeature() reflejan el nuevo plan
```

Esto coincide en lo esencial con el flujo descrito en `docs/STRIPE-INTEGRATION.md`, con una diferencia real verificada: la guía describe la función de checkout como algo a crear ("Crea `netlify/functions/create-checkout-session.js`"); en el repo esa función **ya existe implementada**, no es solo un paso pendiente de la guía.

---

## 3. Estado de suscripción

**Tabla:** `subscriptions` (`supabase/subscriptions-schema.sql:4-32`).

**Columnas verificadas:**

| Columna | Tipo | Notas |
|---|---|---|
| `id` | UUID (PK) | — |
| `user_id` | UUID, `REFERENCES auth.users(id) ON DELETE CASCADE`, `UNIQUE` | Un usuario = una fila |
| `plan_type` | TEXT, `CHECK IN ('free','pro_monthly','pro_yearly','lifetime')` | Default `'free'` |
| `stripe_customer_id`, `stripe_subscription_id`, `stripe_price_id` | TEXT | — |
| `status` | TEXT, `CHECK IN ('active','inactive','cancelled','past_due','trialing')` | Default `'active'` |
| `current_period_start`, `current_period_end` | TIMESTAMPTZ | — |
| `cancel_at_period_end` | BOOLEAN | Default `FALSE` |
| `cancelled_at`, `trial_end` | TIMESTAMPTZ | Presentes en el esquema; no se encontró código que las escriba (ver §4) |

**Row Level Security:** usuarios autenticados pueden `SELECT` e `INSERT` su propia fila (`subscriptions-schema.sql:45-52`); **no existe policy de `UPDATE` para el cliente autenticado** — el propio comentario del esquema lo dice explícitamente: *"NO permitir UPDATE directo desde cliente autenticado. Cualquier cambio de plan/estado debe pasar por backend seguro"* (`subscriptions-schema.sql:54-57`). Verificado: todos los `UPDATE` reales encontrados ocurren en funciones serverless con `SUPABASE_SERVICE_ROLE_KEY` (`stripe-webhook.js:65`, `subscription-manage.js:69`), nunca desde el cliente con la anon key.

**Creación automática:** un trigger (`create_subscription_on_signup`, `subscriptions-schema.sql:88-92`) inserta una fila `free`/`active` en cuanto se crea un usuario en `auth.users`.

**Cómo el frontend determina PRO/Lifetime:** `src/hooks/useSubscription.js`:
- `loadSubscription()` (líneas 45-83) lee `SELECT * FROM subscriptions WHERE user_id = ...` directamente vía Supabase client (no vía función serverless) — lectura, no escritura, por eso no viola la restricción de RLS anterior.
- `isPro()` (línea 112-115): `true` si `plan_type` ∈ `['pro_monthly','pro_yearly','lifetime']`.
- `isLifetime()` (línea 118-120): `true` si `plan_type === 'lifetime'`.
- `hasFeature(featureName)` (líneas 97-109): tabla hardcodeada en el propio hook que mapea `plan_type` → lista de features. **Esta tabla existe en paralelo a `shared/aiCapabilities.js`** (que gatea específicamente capacidades de IA server-side) — son dos fuentes de features distintas, no se verificó si están sincronizadas entre sí para todas las features no relacionadas con IA.

No se encontró uso de Supabase Realtime/suscripción en vivo a cambios de esta tabla en el código revisado — la actualización del estado en el frontend depende de que `loadSubscription()` se vuelva a ejecutar (p. ej. al recargar o remontar el hook). **No verificado** si existe algún mecanismo de refresco automático tras completar un pago (p. ej. polling en la página `/success`).

---

## 4. Cancelaciones

**Sí existe cancelación self-service en la app**, confirmado por uso real:

- `src/hooks/useSubscription.js:166` llama a `callSubscriptionManager('cancel_at_period_end')`.
- `src/hooks/useSubscription.js:154` llama a `callSubscriptionManager('downgrade_to_free', { stripeData })`.
- Ambas apuntan a `POST /.netlify/functions/subscription-manage` (`useSubscription.js:13`).

**Hallazgo relevante para la política de suscripciones:** `netlify/functions/subscription-manage.js` maneja las acciones `cancel_at_period_end` (líneas 84-88) y `downgrade_to_free` (líneas 74-83) actualizando **únicamente** la tabla `subscriptions` de Supabase. El archivo importa solo `@supabase/supabase-js` (línea 13) — **no importa el SDK de Stripe y no se encontró ninguna llamada a la API de Stripe** (`stripe.subscriptions.update(...)`, `stripe.subscriptions.cancel(...)`, o equivalente) dentro de esta función.

Esto significa, verificado desde el código: cuando un usuario cancela desde la app, lo que cambia de inmediato es el registro interno de Supabase (y por lo tanto lo que la UI le muestra), pero **no se verificó que la suscripción real en Stripe reciba la misma instrucción de cancelación en el mismo momento**. La única vía verificada por la que Stripe y Supabase vuelven a sincronizarse es el webhook (`stripe-webhook.js`, evento `customer.subscription.updated`/`deleted`), que depende de que Stripe dispare ese evento por su cuenta — algo que solo ocurriría si la suscripción también se cancela del lado de Stripe por otro medio (p. ej. el propio Stripe Customer Portal, o una acción directa no encontrada en este repo).

**No se encontró** ningún uso del Stripe Customer Portal (`stripe.billingPortal.sessions.create` u otra referencia) en el código.

**No asumo** si esto es un bug, una función incompleta, o si la sincronización con Stripe ocurre por un mecanismo fuera de este repositorio (p. ej. configurado directamente en el Dashboard de Stripe) — no verificable desde el código fuente disponible.

---

## 5. Reembolsos

Búsqueda de `refund`/`reembolso` en todo el repositorio (excluyendo `node_modules`): **sin resultados en código**. Las únicas dos coincidencias del repositorio están en documentación (`docs/STRIPE-INTEGRATION.md` y el propio catálogo de documentos legales creado en la fase anterior).

`docs/STRIPE-INTEGRATION.md:557-558` responde a la pregunta "¿Cómo hago refunds?" con: *"Desde Stripe Dashboard → Payments → Click en pago → Refund."* — esto describe una **capacidad operativa manual del administrador**, no una política de reembolsos para el usuario (no define plazos, condiciones, causales, ni un flujo que el usuario pueda iniciar).

**No definido actualmente**: no existe en el repo ninguna regla de negocio, endpoint, ni UI que permita a un usuario solicitar o ejecutar un reembolso. No existe ventana de reembolso, condición de elegibilidad, ni distinción entre reembolso de suscripción recurrente vs. Lifetime en el código.

---

## 6. Lifetime

- **Representación en el esquema:** no es una tabla ni estructura separada — es un valor más de la misma columna `plan_type` (`'lifetime'`, `subscriptions-schema.sql:9`), en la misma fila y tabla que Free/PRO Mensual/PRO Anual.
- **Expiración:** no se encontró ningún campo de expiración específico para Lifetime. Las columnas `current_period_end`/`trial_end` existen en el esquema pero corresponden al modelo de suscripción recurrente (`mode: 'subscription'`); Lifetime se crea con `mode: 'payment'` (`create-checkout-session.js:87`), pago único sin período recurrente. El webhook `checkout.session.completed` solo llena `current_period_start`/`current_period_end`/`stripe_subscription_id` cuando `session.mode === 'subscription'` (`stripe-webhook.js:88-95`) — para Lifetime esa rama no se ejecuta, por lo que esos campos quedarían sin definir para un comprador Lifetime. **No verificado** si esto genera algún efecto secundario en otras partes de la app que lean esas columnas asumiendo que existen.
- **¿Se trata como caso especial en `useSubscription.js`?** Sí: tiene su propio helper `isLifetime()` (línea 118-120) y su propia entrada en `hasFeature()` con una feature exclusiva `lifetime_badge` (línea 104).
- **Interacción con cancelación (hallazgo relevante, ver §4):** `subscription-manage.js` no distingue `plan_type` antes de aplicar `downgrade_to_free` — la acción reescribe `plan_type: 'free'` para cualquier usuario que la invoque, sin verificar si el plan actual era recurrente o Lifetime (líneas 74-83, sin lectura previa de `plan_type`). Dado que Lifetime es un pago único y no debería tener equivalente de "cancelar", **no se encontró ninguna restricción en el código que impida que la acción `downgrade_to_free` se ejecute también sobre una cuenta Lifetime** si esa acción llegara a invocarse para ese usuario. No se verificó si el frontend oculta esa opción para usuarios Lifetime (no se revisó la UI de configuración de cuenta en este pase) — **no verificado**, se registra como pregunta abierta.

---

*Todas las citas de línea corresponden al estado del repositorio en el momento de esta investigación. Este documento debe re-verificarse si alguno de los archivos citados cambia.*
