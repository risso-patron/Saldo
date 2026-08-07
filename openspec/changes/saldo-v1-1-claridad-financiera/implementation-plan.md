# Implementation Plan: `metas-exposicion`

**Change**: `saldo-v1-1-claridad-financiera` · **Capability**: `metas-exposicion` (única en alcance)
**Gate**: última verificación antes de `sdd-apply`. Verificado contra el código real (no solo contra tasks.md) el 2026-08-06.

## 1. Archivos a modificar

| Archivo | Propósito del cambio |
|---|---|
| `src/components/ds/dsNavItems.js` | Corregir comentario (líneas 6-11): hoy cita R-08 como "≤ 7 destinos, 4 usados" (verificado, línea 6) — mezcla la regla del Sidebar con R-08 (tope duro de 4). `DS_NAV_ITEMS` (4 ítems) NO cambia. |
| `src/App.jsx` | (a) Nuevo bloque `{activeTab === 'metas' && ...}` que monta `GoalManager` solo. (b) Línea 471 (verificada): quitar `<GoalManager goals={goals} onAddGoal={handleAddGoal} onUpdateProgress={handleUpdateGoalProgress} onDeleteGoal={handleDeleteGoal} currentBalance={balance} />` del bloque `planificacion` (conserva `CreditCardManager`/`BudgetManager`/`RecurringManager`). (c) Línea 425-435 (verificada): agregar props `goals={goals}` y `onNavigate={setActiveTab}` a `<DashboardHome>`. |
| `src/components/Shared/Omnibar.jsx` | Línea 56 (verificada): `{ id: 'planificacion', label: 'Mis Metas', ... }` → `{ id: 'metas', label: 'Mis Metas', ... }`. |
| `src/components/Dashboard/DashboardHome.jsx` | Agregar props `goals = []`, `onNavigate` (+ `propTypes`) y un disparador mínimo que invoque `onNavigate('metas')`. Solo wiring — sin componer la sección visual "Mis metas" (eso es `dashboard-claridad`, fuera de alcance). |

**No se toca**: `GoalManager.jsx` (firma verificada: `{ goals, onAddGoal, onUpdateProgress, onDeleteGoal }`, sin `currentBalance` — confirma que la limpieza en `App.jsx` no requiere cambios en el componente), `useSubscription.js`, Supabase, `localStorage`.

## 2. Archivos de test a crear/actualizar

| Archivo | Tipo | Cubre |
|---|---|---|
| `src/__tests__/dsNavItems.test.js` | Nuevo | Guardia R-08: `DS_NAV_ITEMS.length === 4`, ningún `id === 'metas'` |
| `src/__tests__/App.metasView.test.jsx` | Nuevo | Vista `metas` monta solo `GoalManager`; `planificacion` sin `GoalManager`; guardia mobile `DSBottomNav` 4 columnas |
| `src/__tests__/Omnibar.test.jsx` | Nuevo o actualizado (verificar si ya existe antes de crear) | Quick action "Mis Metas" invoca `onNavigate('metas')` |
| `src/__tests__/DashboardHome.test.jsx` | Nuevo o actualizado (verificar si ya existe antes de crear) | Recibe `goals`/`onNavigate`; disparador invoca `onNavigate('metas')` |

TDD estricto: cada test se escribe en RED antes que su código (tasks.md 2.1→2.2, 2.3→2.4, 3.1→3.2, 4.1→4.2). Las guardias 1.1 y 5.1 verifican comportamiento ya existente, entran directo en verde.

## 3. Orden exacto de implementación

```
1.1 (test guardia R-08) → 1.2 (fix comentario)
        ↓
2.1 (RED vista metas) → 2.2 (GREEN App.jsx monta GoalManager) → 2.3 (RED planificacion sin Metas) → 2.4 (GREEN quita GoalManager + currentBalance de planificacion)
        ↓ (en paralelo con Fase 2, ambas dependen solo de 1.1)
3.1 (RED Omnibar) → 3.2 (GREEN Omnibar → 'metas')
        ↓ (depende de 2.2)
4.1 (RED contrato Dashboard) → 4.2 (GREEN props goals/onNavigate) → 4.3 (wiring en App.jsx: goals + onNavigate a DashboardHome)
        ↓ (depende de 1.1 y 2.2)
5.1 (test guardia mobile DSBottomNav 4 columnas)
        ↓ (depende de 2.4, 3.2, 4.3, 5.1)
6.1 (npm test completo) → 6.2 (npm run lint)
```

## 4. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Romper `planificacion` al quitar `GoalManager` (regresión en CreditCard/Budget/Recurring) | Test 2.3 (RED) verifica explícitamente que los 3 managers restantes siguen montados antes de tocar el JSX |
| Regresión de R-08 en un cambio futuro no relacionado | Test 1.1 queda como guardia permanente en la suite, no solo para esta implementación |
| Gating Free/Pro (`hasFeature('unlimited_goals')`) roto al relocalizar `GoalManager` | `GoalManager` no cambia de firma ni de lógica interna — solo cambia dónde se monta; 6.1 corre la suite completa incluyendo tests existentes de `GoalManager`/`useSubscription` |
| Scope creep hacia `dashboard-claridad` al tocar `DashboardHome.jsx` | Tarea 4.2 explícitamente limitada a wiring (props + un disparador mínimo tipo link, mismo patrón que "Ver todos los movimientos" ya existente); ninguna composición visual nueva de la sección "Mis metas" |

## 5. Confirmación de alcance

- ✅ Alcance limitado exclusivamente a `metas-exposicion`.
- ✅ **Sin cambios** en `dashboard-claridad` (solo wiring mínimo de props, sin componer la sección visual), `onboarding-flow`, Ideas (`insights-ia-real` no se toca), ni Dinero pendiente.
- ✅ **Sin cambios** al modelo de monetización: `hasFeature('unlimited_goals')` y los límites Free/Pro permanecen intactos.
- ✅ R-08 preservado: `DS_NAV_ITEMS` sigue en exactamente 4 ítems, verificado por test de regresión (1.1).
- ✅ `GoalManager` preservado sin redefinición funcional: misma firma, mismo comportamiento.
- ⚠️ Única excepción de alcance, ya señalada y aceptada en `tasks.md`: tarea 2.4 elimina la prop muerta `currentBalance` (no declarada por `GoalManager`) — cambio mecánico sin impacto funcional, no una redefinición de comportamiento.

## 6. Definition of Done consolidada

- [ ] Los 8 requirements de `specs/metas-exposicion/spec.md` tienen su escenario cubierto por un test en verde.
- [ ] `npm test` completo pasa, sin regresiones en suites existentes (`GoalManager`, `useSubscription`, `Omnibar`, `DashboardHome`, `dsNavItems`).
- [ ] `npm run lint` sin errores nuevos.
- [ ] `DS_NAV_ITEMS` verificado en exactamente 4 ítems, ninguno `metas`.
- [ ] `planificacion` conserva Tarjetas/Presupuestos/Recurrentes; Metas alcanzable solo vía `activeTab === 'metas'`.
- [ ] Omnibar "Mis Metas" navega a `metas`.
- [ ] Dashboard expone el wiring (`goals`/`onNavigate`) sin sección visual compuesta todavía.
- [ ] Mobile <768px: `DSBottomNav` con 4 columnas, sin ítem Metas.
- [ ] Comentario de `dsNavItems.js` corregido.
- [ ] Ningún archivo fuera de la lista de la sección 1 fue modificado.

## 7. Estado del cambio

```
Discovery → Proposal → Design → Spec → Tasks → Implementation → QA → [Completed]
   ✅          ✅        ✅       ✅      ✅          ✅            ✅      ▶ 2026-08-06
```

**Cerrado**: `metas-exposicion` completó su ciclo con Product Acceptance del PO (2026-08-06). Ver [`metas-exposicion-COMPLETED.md`](metas-exposicion-COMPLETED.md) para el resumen final. `dashboard-claridad`, `onboarding-flow`, `Ideas` (`insights-ia-real`) y `Dinero pendiente` permanecen pendientes, cada una con su propio ciclo Discovery→Design→Spec→Tasks→Implementación, independiente de este.

---

**Conclusión del gate**: el plan es consistente con `proposal.md`, `design.md` y `specs/metas-exposicion/spec.md` — verificado contra el código real, no solo contra los artefactos. No se detectan desvíos de alcance. **Procede `sdd-apply`.**
