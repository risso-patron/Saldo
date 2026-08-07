# Tasks: SALDO v1.1 — Exposición de Metas (`metas-exposicion`)

**Alcance**: solo `metas-exposicion`. TDD estricto (RED→GREEN), `npm test`. UI-first (sin Supabase/localStorage/lógica de negocio) salvo **[Nota funcional]**.

**Orden**: 1 → (2 y 3 en paralelo) → 4 → 5 → 6. Fase 1 prerrequisito de todas. Fase 4 depende de 2.2. Fase 5 depende de 1 y 2.

## Phase 1: Fundación — guardia de regresión y comentario

- [x] 1.1 [TEST] Crear `src/__tests__/dsNavItems.test.js`: `DS_NAV_ITEMS.length === 4` y ningún `id === 'metas'`. Dep: ninguna. DoD: pasa en verde de inmediato (guarda R-08, no cambia código).
- [x] 1.2 Corregir comentario en `src/components/ds/dsNavItems.js` (líneas 6-11): quitar cita errónea "≤ 7 destinos, 4 usados" atribuida a R-08 (es la regla del Sidebar de la Constitution); citar R-08 como tope duro de 4. Dep: 1.1. DoD: sin "≤ 7 destinos"; `npm run lint` limpio.

## Phase 2: TDD — Vista `metas` en App.jsx

- [x] 2.1 [RED] Crear `src/__tests__/App.metasView.test.jsx`: test "`activeTab='metas'` monta `GoalManager` solo, sin `CreditCardManager`/`BudgetManager`/`RecurringManager`" — falla (branch no existe). Dep: 1.1.
- [x] 2.2 [GREEN] `src/App.jsx`: agregar `{activeTab === 'metas' && <Suspense fallback={<TabLoader />}><GoalManager goals={goals} onAddGoal={handleAddGoal} onUpdateProgress={handleUpdateGoalProgress} onDeleteGoal={handleDeleteGoal} /></Suspense>}`. Dep: 2.1. DoD: test 2.1 en verde.
- [x] 2.3 [RED] Mismo archivo: test "`activeTab='planificacion'` renderiza los 3 managers restantes y NO `GoalManager`" — falla contra código actual. Dep: 2.2.
- [x] 2.4 [GREEN] `src/App.jsx:471`: quitar `<GoalManager .../>` y prop `currentBalance={balance}` del bloque `planificacion`. **[Nota funcional menor]**: `GoalManager` no declara `currentBalance` (prop muerta, sin lógica); solo se relocaliza el componente. Dep: 2.3. DoD: test 2.3 en verde; otros 3 managers sin cambios de props.

## Phase 3: TDD — Omnibar navega a `metas`

- [x] 3.1 [RED] Crear `src/__tests__/Omnibar.test.jsx`: test "quick action 'Mis Metas' invoca `onNavigate('metas')` y cierra el Omnibar" — falla (hoy navega a `planificacion`). Dep: 1.1.
- [x] 3.2 [GREEN] `src/components/Shared/Omnibar.jsx:56`: `{ id: 'planificacion', ... }` → `{ id: 'metas', ... }`. Dep: 3.1. DoD: test 3.1 en verde; resto de quick actions intactas.

## Phase 4: TDD — Contrato `DashboardHome`

- [x] 4.1 [RED] Crear `src/__tests__/DashboardHome.test.jsx`: test "recibe `goals`/`onNavigate`; acción de Metas invoca `onNavigate('metas')`" — falla (props no existen). Dep: 1.1.
- [x] 4.2 [GREEN] `src/components/Dashboard/DashboardHome.jsx`: agregar props `goals = []`, `onNavigate` (+ `propTypes`) y un disparador mínimo (patrón `Button variant="link"`, como "Ver todos los movimientos") que llame `onNavigate('metas')`. Solo wiring — la composición visual de "Mis metas" es de `dashboard-claridad`. Dep: 4.1. DoD: test 4.1 en verde.
- [x] 4.3 `src/App.jsx` (bloque `resumen`): pasar `goals={goals}` y `onNavigate={setActiveTab}` a `<DashboardHome>`. Dep: 2.2, 4.2. DoD: smoke manual — click en Dashboard cambia `activeTab` a `metas`.

## Phase 5: TDD — Guardia mobile

- [x] 5.1 [TEST] En `App.metasView.test.jsx`: test "viewport <768px: `DSBottomNav` con exactamente 4 columnas, ninguna `id='metas'`" (mock `matchMedia`). Dep: 1.1, 2.2. DoD: pasa en verde (reusa `DS_NAV_ITEMS`, sin código nuevo).

## Phase 6: Verificación final

- [x] 6.1 `npm test` completo: fases 1-5 en verde, sin regresiones (incluye gating `hasFeature('unlimited_goals')` en `GoalManager`, sin tocar). Dep: 2.4, 3.2, 4.3, 5.1. **Resultado**: 68 archivos / 758 tests, 100% verde.
- [x] 6.2 `npm run lint` sin errores nuevos. Dep: 6.1. **Resultado**: los 4 archivos de producción en alcance (dsNavItems.js, App.jsx, Omnibar.jsx, DashboardHome.jsx) sin errores nuevos (App.jsx conserva 3 warnings preexistentes no relacionados). El comando global sigue en rojo por un gap preexistente y ajeno a este alcance: `eslint.config.js` nunca definió los globals de vitest (`describe`/`it`/`expect`/`vi`), afectando el 100% de los archivos de test del repo (confirmado también en archivos no tocados hoy, p.ej. `AIContext.test.jsx`, `ProfilePage.test.jsx`). Ver reporte de blocker.
