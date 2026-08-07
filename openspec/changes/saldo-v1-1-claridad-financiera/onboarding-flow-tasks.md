# Tasks: `onboarding-flow`

Fuente: proposal + spec (9 requirements + D-1) + design de `onboarding-flow`. TDD estricto (`npm test`). Alcance: solo los archivos de "File Changes" del design.

## Fase 1: Utilidades y estado (`onboardingEvents`, `useOnboardingFlow`)

- [x] 1.1 [RED] `onboardingEvents.test.js`: `emitOnboardingEvent(name, payload)` despacha `CustomEvent` en `window` con esos datos.
- [x] 1.2 [GREEN] Crear `src/utils/onboardingEvents.js` implementando el contrato de 1.1.
- [x] 1.3 [RED] **Gotcha D1**: con `transactionsLoading: true` no siembra estado en LS, aunque `transactionCount` esté definido.
- [x] 1.4 [RED] Siembra tras `loading: false` — `transactionCount > 0` → `completed`; `=== 0` → `pending/step A`.
- [x] 1.5 [RED] Idempotencia — sembrado `completed`, bajar `transactionCount` a 0 y re-renderizar no reabre el flujo.
- [x] 1.6 [RED] Reanudación — LS precargado `{status:'pending', step:'B'}` → `isStepB` true sin pasar por A.
- [x] 1.7 [RED] 4 eventos en sus transiciones: siembra→`started`; remontaje `pending/B`→`resumed`; `skipStepA`→`skipped`; `complete`→`completed`.
- [x] 1.8 [GREEN] Crear `src/hooks/useOnboardingFlow.js`: key `budgetrp_onboarding_{userId}` sobre `useLocalStorage`, contrato del design (`status, step, isActive, isStepA, isStepB, skipStepA, continueStepA, complete`), comentario del gotcha de `loading`.

## Fase 2: Paso A (`OnboardingStepA`)

- [x] 2.1 [RED] `OnboardingStepA.test.jsx`: con `isOpen`, renderiza una única pantalla con acciones "continuar" y "saltear" del mismo `Button variant`.
- [x] 2.2 [RED] Click en "saltear"/"continuar" invoca `onSkip`/`onContinue`.
- [x] 2.3 [GREEN] Crear `src/components/Onboarding/OnboardingStepA.jsx` sobre `Sheet` DS, cumpliendo 2.1-2.2.

## Fase 3: `EmptyState` de `DashboardHome` (D-2, contrato de Paso B)

- [x] 3.1 [RED] `DashboardHome.test.jsx`, caso nuevo: `EmptyState` ofrece CTA de ingreso además del de gasto, mismo `variant="primary"`.
- [x] 3.2 [GREEN] Modificar **solo** el bloque `EmptyState` de `DashboardHome.jsx`: agregar prop `onRegisterIncome` y el CTA.
- [x] 3.3 [GUARD — D-1] Diff de `DashboardHome.jsx` debe caer solo en `EmptyState` (~L51-69) — nada de `DashboardContent`, skeleton o copy. Si excede, revertir y ajustar. **Verificado**: diff cae en EmptyState + plumbing de prop obligatorio (destructuring de `DashboardHome`, invocación de `EmptyState`, `propTypes`) — nada de `DashboardContent`/skeleton/copy.

## Fase 4: Wiring en `App.jsx`

- [x] 4.1 [RED] `App.onboardingFlow.test.jsx`: sin movimientos ve Paso A al montar; "saltear" abre la única instancia de `NewMovementSheet`.
- [x] 4.2 [RED] Guardar movimiento en Paso B deja `completed` y muestra el Dashboard, sin pantalla intermedia.
- [x] 4.3 [RED] Cerrar el sheet en Paso B (Escape/velo) no completa el flujo; remontar reabre directo en B.
- [x] 4.4 [RED] Regresión: con onboarding activo, `⌘K` y `N` no abren otros overlays (`isAnyOverlayOpen`).
- [x] 4.5 [RED] Mobile <768px: Paso A se ancla abajo (default de `Sheet`).
- [x] 4.6 [GREEN] `App.jsx`: montar `<OnboardingStepA key={user.id}>`; efecto abre `NewMovementSheet` en `step:'B'` con guarda `useRef`; `onboarding.complete()` en `handleCreateIncome`/`handleCreateExpense` si `success`; `feedbackQueue.pause()` mientras `isActive`; sumar a `isAnyOverlayOpen`; cablear `onRegisterIncome={() => handleOpenNewMovementWithDraft({ activeType: 'income' })}`. **Nota**: requirió adelantar la llamada a `useTransactions()` dentro de `AppContent` (antes del efecto de teclado) porque `useOnboardingFlow` y `isAnyOverlayOpen` necesitan `loading`/`allTransactions` antes de ese punto — documentado in-line.

## Fase 5: Verificación de alcance y cierre

- [x] 5.1 [GUARD — D-1] `git diff --stat`: nada de la lista "No se toca" del design (`NewMovementSheet.jsx`, `newMovementDraft.js`, `useTransactions.js`, `AuthContext.jsx`, `Sheet.jsx`, `useFeedbackQueue.js`, `DailyOnboardingToast.jsx`, `dsNavItems.js`, schema Supabase) ni `dashboard-claridad` aparece modificado. **Verificado**: confirmado.
- [x] 5.2 Correr `npm test` completo (10 casos) y `npm run lint`; todo en verde antes de `sdd-verify`. **Resultado**: `npm test` → 784/784 tests, 72/72 archivos, verde (26 tests nuevos/agregados de onboarding-flow, más de los 10 estimados por la Testing Strategy del design, por triangulación estricta TDD). `npm run lint` → 0 errores/warnings en los archivos de producción nuevos/modificados de este cambio; el resto de errores reportados por `eslint .` es una baseline preexistente en TODO el repo (falta `globals.vitest`/`globals.node` en `eslint.config.js` — no se toca, fuera de alcance).

## Orden recomendado

1 → 2 → 3 → 4 → 5. Fase 1 es dependencia de 4. Fase 3 corre en paralelo a 1-2; sus guardas (3.3, 5.1) cierran la capability.
