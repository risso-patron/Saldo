# Design: `onboarding-flow` (SALDO v1.1)

**Alcance**: SOLO la capability `onboarding-flow`, contra `specs/onboarding-flow/spec.md` (9 requirements + D-1).
**No se diseña acá** (spec, "Fuera de alcance"): `dashboard-claridad`, diseño visual/composición, copy (cap 07), animaciones (cap 08), infraestructura de analítica. D-1 se **cita, no se resuelve**.

## Hallazgos de código (verificados en fuente primaria, no heredados del Discovery)

| # | Fuente verificada | Hallazgo | Consecuencia de diseño |
|---|---|---|---|
| V1 | `src/utils/newMovementDraft.js:7` | El borrador tiene **TTL de 60 s** (`TTL_MS = 60000`) y guarda solo campos del formulario — no hay noción de "paso". | El Discovery marcaba la reanudación como "posiblemente ya cubierta": **es falso**. El borrador cubre el *contenido tipeado* dentro de 60 s, nunca el *estado del flujo*. Hace falta estado propio. **No se toca el TTL** (afectaría a todos los usuarios, fuera de alcance). |
| V2 | `src/hooks/useTransactions.js:369-377, 411-420, 622-635` | `addIncome`/`addExpense`/`addBulkTransactions` producen **la misma forma de objeto**: no existe campo `source`/`origin`. | El dominio de Movimientos **no expone** la condición "movimiento propio" que el spec declara consumir (Terminología). Ver E-1. |
| V3 | `src/App.jsx:93, 106-114, 402-411` | Existe **una única** instancia de `NewMovementSheet`, siempre montada, con autoridad única de overlay (`isAnyOverlayOpen`, III-C.4) y remontaje por `key` (III-C.3). | Paso B **no monta un segundo sheet**: pide el que ya existe. Regla dura del proyecto. |
| V4 | `src/components/NewMovement/NewMovementSheet.jsx:32-35, 269` | `TYPE_OPTIONS` (Gasto/Ingreso) se renderiza con el `Tabs` del DS — ambas opciones ya tienen el mismo peso. | Paridad ingreso/gasto del Paso B ya está satisfecha: **cero cambios** en `NewMovementSheet`. |
| V5 | `src/App.jsx:188-191` | Precedente ya establecido: `pendingOperation` **pausa** `useFeedbackQueue` mientras está vivo. | El overlay de onboarding reusa ese mismo mecanismo en vez de entrar a la cola (ver Decisión 4). |
| V6 | `src/contexts/AuthContext.jsx:66-83` | `signUp` no deja ningún estado post-registro (`isNewUser`/`justRegistered` no existen); tras registrarse, `AppContent` renderiza la app normal. | "Onboarding pendiente" **no puede** derivarse de un evento de registro: se deriva de estado persistido (Decisión 1). |
| V7 | `supabase/schema.sql:79-88` | `user_profiles` tiene `created_at`, pero `AuthContext` **no lo lee** (solo hace `upsert` de id/email/full_name). | Usar fecha de registro exigiría una lectura nueva de Supabase **y** contradice el spec ("independientemente de cuánto tiempo pasó"). Descartado. |

## Decisiones de arquitectura

### Decisión 1 — `useOnboardingFlow`: estado propio en localStorage, sembrado una sola vez

**Elección**: hook nuevo `src/hooks/useOnboardingFlow.js` sobre `useLocalStorage` (patrón ya establecido), key `budgetrp_onboarding_{userId}` (sufijo dinámico: mismo patrón que `budgetrp_tip_{id}`).
Forma: `{ v: 1, status: 'pending'|'completed', step: 'A'|'B', startedAt, completedAt }`.
**Siembra** (única vez, cuando **no** hay estado persistido y `transactionsLoading === false`):
`transactionCount > 0` → `completed` · `transactionCount === 0` → `pending/step A`.
**Alternativas rechazadas**: (a) flag en Supabase `user_profiles` — cambio de schema con plan de rollback propio para un dato puramente local; (b) derivar de `created_at` (V7) — contradice el spec; (c) derivar en cada render de `transactionCount === 0` — viola Idempotencia (borrar movimientos re-dispararía el flujo).
**Gotcha obligatorio**: la siembra **debe** esperar `loading === false` de `useTransactions`. Sembrar antes marca `pending` a un usuario existente y le muestra el Paso A. Es el único punto frágil del diseño.
**Scoping por usuario**: `<OnboardingFlow key={user.id}>` fuerza el remontaje al cambiar de cuenta — `useLocalStorage` lee su key solo al inicializar. Mismo mecanismo de `key` ya documentado en `App.jsx` (III-C.3/IV-B).

### Decisión 2 — Paso B no construye formulario: conduce el `NewMovementSheet` existente

**Elección**: al entrar en `step: 'B'`, un efecto en `App.jsx` llama `setIsNewMovementOpen(true)` (una vez por montaje/transición, con guarda de `useRef`). La finalización se detecta en los wrappers **ya existentes** `handleCreateIncome`/`handleCreateExpense` (`App.jsx:286-294`): si `result.success && onboarding.isActive` → `onboarding.complete()`.
**Alternativas rechazadas**: un `<NewMovementSheet>` propio del flujo (reintroduce el bug de dos overlays que III-C.4 corrigió); un `onSuccess` nuevo en `NewMovementSheet` (modifica un componente que no necesita cambiar, V4).
**Justificación**: cero cambios en `NewMovementSheet.jsx`; un único punto de despacho para ingreso y gasto.

### Decisión 3 — "No salteable" = ausencia de afordancia, no bloqueo del cierre

**Elección**: el Paso B no expone ninguna acción de "saltear". Cerrar el sheet (Escape/velo) **no** avanza ni completa: el estado sigue `pending/step B` y se reintenta en la próxima entrada a la app.
**Alternativa rechazada**: un `Sheet` no-cerrable — requeriría modificar la primitiva DS (`Sheet.jsx:84-87`, Escape cierra siempre) y sería una trampa de foco sin salida, hostil en mobile.
**Justificación**: cubre "Paso B no salteable" y "Continuidad tras abandono" con el mismo mecanismo, sin tocar el DS.

### Decisión 4 — El flujo **no** entra en `useFeedbackQueue`; lo pausa

**Elección**: mientras `onboarding.isActive`, `App.jsx` llama `feedbackQueue.pause()` (mismo precedente que `pendingOperation`, V5) y suma el flujo a `isAnyOverlayOpen`.
**Justificación**: la cola coordina feedback **transitorio con duración** (`FEEDBACK_DURATIONS`, FIFO, auto-descarte); el onboarding es una tarea sin duración. Pero la colisión es real: `DailyOnboardingToast` dispara a los 2 s y el `welcomeBanner` se encola al cambiar `user.id` — ambos aparecerían sobre el Paso A. Pausar la reusa sin inventar coordinación nueva.

### Decisión 5 — Observabilidad: eventos de dominio, sin infraestructura

**Elección**: `src/utils/onboardingEvents.js` → `emitOnboardingEvent(name, payload)` despacha un `CustomEvent` en `window`. Cuatro nombres: `onboarding:started`, `onboarding:resumed`, `onboarding:skipped` (`{ step: 'A' }`), `onboarding:completed`.
**Alternativas rechazadas**: cliente de analítica (explícitamente fuera de alcance); `console.log` (no observable programáticamente).
**Justificación**: observable desde tests y desde cualquier adaptador futuro, con cero acoplamiento y cero dependencias.

### Decisión 6 — Paso C: cero código

El Paso C es la **ausencia** de overlay. Al completarse, el sheet cierra y debajo ya está el Dashboard montado tal cual (`App.jsx:425-437`). No hay pantalla de cierre, no hay navegación, no se toca `DashboardHome` salvo lo de D-2 (abajo).

### Decisión 7 — D-2 (paridad en `EmptyState`), delimitado

`EmptyState` (`DashboardHome.jsx:51-69`) suma un **segundo CTA de ingreso** con el mismo `Button variant="primary"`, vía prop nueva `onRegisterIncome`. En `App.jsx` se cablea reusando `handleOpenNewMovementWithDraft({ activeType: 'income' })` — el mecanismo **ya existente** del Omnibar (III-C.3: `writeDraft` + remontaje por `key`), que siembra `activeType` sin tocar `NewMovementSheet`.
**Límite explícito**: es el contrato del Paso B de `onboarding-flow`, **no** evolución de contenido del Dashboard. Nada más de `DashboardHome` cambia — ni `DashboardContent`, ni el skeleton, ni el copy existente, ni la composición.

## Mapa Requirement → decisión técnica

| Requirement (spec) | Implementación | Reusa | Nuevo |
|---|---|---|---|
| Inicio del onboarding | Siembra de `useOnboardingFlow` con `transactionCount` tras `loading===false` (D1) | `useLocalStorage`, `useTransactions.loading` | hook |
| Paso A — opcional | `OnboardingStepA` sobre `Sheet` DS; `onContinue`/`onSkip` → `step: 'B'` | `Sheet`, `Button` | componente |
| Paso B — obligatorio | Efecto abre la instancia única de `NewMovementSheet`; paridad ya dada por `Tabs` (V4) | `NewMovementSheet` **sin cambios** | efecto en `App.jsx` |
| Persistencia del estado | `useLocalStorage('budgetrp_onboarding_{userId}')` | patrón de storage | key |
| Reanudación | `step` persistido: si es `'B'`, se abre el sheet directo; el Paso A nunca se re-presenta | — | — |
| Continuidad tras abandono | Cerrar el sheet no muta el estado (D3); el efecto de apertura corre de nuevo al próximo montaje | `Sheet` | guarda `useRef` |
| Finalización | `onboarding.complete()` desde `handleCreateIncome`/`handleCreateExpense` si `success` (D2) | wrappers existentes | 2 líneas |
| Idempotencia | `completed` es terminal: sembrado el estado, el hook **nunca** vuelve a mirar `transactionCount` | — | — |
| Observabilidad | `emitOnboardingEvent` × 4 transiciones (D5) | — | util |
| **D-1 (dependencia)** | **No se resuelve.** El Paso C aterriza en el Dashboard tal cual (D6): una cifra protagonista, sin el "trío de cifras" de `06-onboarding.md:41-42`. Misma tensión C-03 (`GOV-001` §1), pendiente en `dashboard-claridad`. Ninguna mitigación alternativa se diseña acá. | — | — |

## Flujo de interrupción y reanudación

```
SESIÓN 1                                    SESIÓN 2 (reapertura)
usuario   App.jsx   useOnboardingFlow  LS   |  App.jsx   useOnboardingFlow   LS
   │         │            │            │    |     │            │             │
 registro ──►│            │            │    |   montaje ───────►│  lee ──────►│
   │         │  loading:false          │    |     │            │ {pending,B}◄┤
   │         ├───────────►│ siembra ──►│    |     │◄─ step 'B' ─┤             │
   │         │◄─ step 'A' ┤ {pending,A}│    |     │  emit resumed             │
   │◄─ Paso A┤            │            │    |     ├─ setIsNewMovementOpen(true)
   │ saltear►├───────────►│ step 'B' ─►│    |     │            │             │
   │         ├─ abre Sheet│ emit skipped    |   guarda ────────►│ complete ──►│
   │  ESC ──►├─ cierra    │  (sin cambio de │     │  success   │ {completed} │
   │         │            │   estado)       |     │  emit completed           │
  cierra la app ──────────┴─ estado en LS ──|     └─ sheet cierra → Dashboard (Paso C)
```

## Contratos

```jsx
// src/hooks/useOnboardingFlow.js
const {
  status,            // 'pending' | 'completed'
  step,              // 'A' | 'B'  (irrelevante si status === 'completed')
  isActive,          // status === 'pending' && seeded
  isStepA, isStepB,
  skipStepA,         // () => void   — emite 'skipped', pasa a 'B'
  continueStepA,     // () => void   — pasa a 'B'
  complete,          // () => void   — terminal, emite 'completed'
} = useOnboardingFlow({
  userId,               // string  — sufijo de la key de storage
  transactionsLoading,  // boolean — la siembra espera a que sea false (gotcha D1)
  transactionCount,     // number  — SOLO se lee en la siembra, nunca después
});

// src/components/Onboarding/OnboardingStepA.jsx
OnboardingStepA.propTypes = {
  isOpen: bool.isRequired, onContinue: func.isRequired, onSkip: func.isRequired,
};  // ambas acciones con el MISMO variant de Button (spec: saltear no es secundaria)

// src/utils/onboardingEvents.js
emitOnboardingEvent(name, payload = {})  // CustomEvent en window

// DashboardHome — prop añadida (D-2, nada más):
onRegisterIncome: func   // en App.jsx: () => handleOpenNewMovementWithDraft({ activeType: 'income' })
```

## File Changes

| Archivo | Acción | Descripción |
|---|---|---|
| `src/hooks/useOnboardingFlow.js` | Create | Estado, siembra, transiciones, emisión de eventos |
| `src/components/Onboarding/OnboardingStepA.jsx` | Create | Paso A sobre `Sheet` DS, dos acciones del mismo peso |
| `src/utils/onboardingEvents.js` | Create | `emitOnboardingEvent` (CustomEvent) |
| `src/App.jsx` | Modify | Montar `<OnboardingStepA key={user.id}>`; efecto de apertura del sheet en step B; `complete()` en los 2 wrappers de creación; `feedbackQueue.pause()`; sumar a `isAnyOverlayOpen`; cablear `onRegisterIncome` |
| `src/components/Dashboard/DashboardHome.jsx` | Modify | **Solo** `EmptyState`: segundo CTA de ingreso + prop `onRegisterIncome` (D-2). Nada más del archivo cambia |
| `src/hooks/useOnboardingFlow.test.jsx` | Create | Tests colocados (patrón `useFilters.test.jsx`) |
| `src/components/Onboarding/OnboardingStepA.test.jsx` | Create | Test colocado |
| `src/utils/onboardingEvents.test.js` | Create | Test colocado |
| `src/__tests__/App.onboardingFlow.test.jsx` | Create | Integración (patrón `App.metasView.test.jsx`) |
| `src/components/Dashboard/DashboardHome.test.jsx` | Modify | Caso nuevo: `EmptyState` ofrece ingreso y gasto |

**No se toca**: `NewMovementSheet.jsx`, `newMovementDraft.js` (TTL intacto), `useTransactions.js`, `AuthContext.jsx`, `Sheet.jsx`, `useFeedbackQueue.js`, `DailyOnboardingToast.jsx`, `dsNavItems.js`, ni el schema de Supabase.

## Testing Strategy (TDD estricto — `strict_tdd: true`, `npm test`)

| Capa | Qué | Cómo |
|---|---|---|
| Unit | Siembra: `count>0` → `completed`; `count===0` → `pending/A`; **no siembra mientras `loading===true`** | vitest + `renderHook` |
| Unit | Idempotencia: sembrado `completed`, bajar `transactionCount` a 0 no re-dispara | `renderHook` con rerender |
| Unit | Reanudación: LS con `{pending,B}` → `isStepB` sin pasar por A | `renderHook` + localStorage precargado |
| Unit | Los 4 eventos se emiten en sus transiciones | `window.addEventListener` espiado |
| Integración | Usuario sin movimientos ve Paso A; saltear abre el `NewMovementSheet` (una sola instancia en el DOM) | RTL sobre `App` |
| Integración | Guardar en Paso B → `completed` y **queda el Dashboard**, sin pantalla intermedia | RTL |
| Integración | Cerrar el sheet en Paso B no completa; remontar reabre en B | RTL |
| Integración | `EmptyState` ofrece ingreso y gasto con el mismo variant | RTL sobre `DashboardHome` |
| Regresión | Con onboarding activo, ⌘K y "N" no abren overlays (`isAnyOverlayOpen`) | RTL + `fireEvent.keyDown` |
| Mobile (<768px) | El Paso A se ancla abajo (comportamiento por defecto de `Sheet`) | RTL |

## Migration / Rollout

Sin migración de datos y **sin cambio de schema Supabase**: el estado vive en `localStorage`. Rollback = revertir commits; la key huérfana es inerte. Usuarios existentes **no** son re-onboardeados gracias a la siembra retroactiva (D1).

## Riesgos y escalaciones al PO

| # | Riesgo | Estado |
|---|---|---|
| **E-1** | **"Movimiento propio" no existe en el dominio** (V2). El spec declara consumir esa condición del dominio de Movimientos, que no la expone. | **Resuelto por decisión del PO (2026-08-07): opción (a).** No se incorpora `source: 'manual'\|'import'` al dominio de Movimientos en esta capability — motivo: SALDO no tiene hoy múltiples orígenes de movimientos implementados que lo justifiquen; crearlo ampliaría el alcance de `onboarding-flow` y abriría un ciclo independiente de evolución del dominio. **Usuarios nuevos**: la finalización se determina por el evento real de creación del primer movimiento durante el Paso B (sin cambios respecto del diseño original). **Usuarios existentes**: se usa `transactionCount > 0` como proxy temporal de onboarding completado — sin cambios de mecanismo, ahora como decisión ratificada, no como propuesta abierta.<br><br>**Limitación documentada (texto del PO, no reformular):** *"La ausencia actual de una distinción entre movimientos manuales e importados impide determinar históricamente si un usuario realizó una acción propia. El proxy `transactionCount` puede marcar como completado un usuario cuyos movimientos provengan de futuras fuentes automáticas/importadas. Resolver esta deuda requiere evolución del dominio Movimientos y queda fuera del alcance de `onboarding-flow`."* No se crea trabajo adicional en Movimientos. |
| **E-2** | La siembra depende de `loading === false` de `useTransactions`. Un fallo de sincronización que deje `loading` en false con `allTransactions` vacío sembraría `pending` a un usuario existente (le muestra el Paso A una vez; no borra datos). | Riesgo aceptado y cubierto por test. Se documenta como comentario obligatorio en el hook. |
| **E-3** | **D-1 sigue abierta**: el Paso C no muestra el trío de cifras que exige `06-onboarding.md:41-42`. | **Heredada, no resuelta** (spec, Requirement D-1). Depende de C-03 / `dashboard-claridad`. |
| **E-4** | Reusar `writeDraft` para preseleccionar "ingreso" (D-2) pisa un borrador previo del usuario. Semántica idéntica a la que ya tiene el Omnibar hoy. | Sin decisión requerida — comportamiento preexistente, no una regresión nueva. |

## Open Questions

- [x] **E-1**: resuelto — PO aprueba opción (a), proxy `transactionCount > 0` con limitación documentada (ver tabla de riesgos arriba). Sin trabajo adicional en Movimientos.

---

**Estado**: **completamente cerrado**. Implementado, verificado (`sdd-verify` PASS WITH WARNINGS) y con Product Acceptance otorgada por el PO (2026-08-07). Ver [`onboarding-flow-COMPLETED.md`](onboarding-flow-COMPLETED.md) para el resumen final.
