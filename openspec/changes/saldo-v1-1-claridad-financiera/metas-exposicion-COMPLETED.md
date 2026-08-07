# Resumen final: `metas-exposicion` — COMPLETED

**Change**: `saldo-v1-1-claridad-financiera` · **Capability**: `metas-exposicion`
**Fecha de cierre**: 2026-08-06
**Product Acceptance**: otorgada por el PO (Luis), 2026-08-06

## Alcance implementado

Exponer el módulo Metas (`GoalManager`, ya funcional) como superficie alcanzable desde el Dashboard y una vista dedicada, respetando la restricción de navegación R-08 (tope duro de 4 destinos) sin agregar una 5.ª pestaña.

- Nueva vista `metas` (`App.jsx`, `activeTab === 'metas'`) que monta `GoalManager` en solitario, fuera de `DS_NAV_ITEMS`.
- `GoalManager` removido del bloque `planificacion` (que conserva `CreditCardManager`/`BudgetManager`/`RecurringManager`), junto con la prop muerta `currentBalance`.
- Quick action "Mis Metas" del Omnibar corregida: navegaba a `planificacion` (bug real), ahora navega a `metas`.
- `DashboardHome` gana el wiring mínimo (`goals`, `onNavigate`) y un disparador de texto — sin componer la sección visual completa (eso queda para `dashboard-claridad`).
- Comentario erróneo de `dsNavItems.js` corregido (citaba "≤ 7 destinos" como si fuera R-08).

## Requirements verificados: 8/8

Ver detalle completo en [`specs/metas-exposicion/spec.md`](specs/metas-exposicion/spec.md) y [`verify-report.md`](verify-report.md). Los 8 requirements están COMPLIANT, 7 con test en verde y 1 (comentario) con verificación estática directa.

## Evidencia de verificación

- `verify-report.md` — informe completo con Spec Compliance Matrix, TDD Compliance, Coherence contra `design.md`, y alcance real (`git diff`) vs. autorizado.
- `implementation-plan.md` — gate previo a `sdd-apply`, verificado contra código real.

## Tests ejecutados

- `npm test -- --run`: **758/758 tests, 68/68 archivos, en verde** (ejecutado de forma independiente dos veces: una por el orquestador antes de `sdd-verify`, otra por el propio `sdd-verify`).
- 4 archivos de test nuevos: `dsNavItems.test.js`, `App.metasView.test.jsx`, `Omnibar.test.jsx`, `DashboardHome.test.jsx` (9 tests de integración).
- Lint acotado a los 4 archivos de producción tocados: 0 errores.

## Limitaciones conocidas

1. **WARNING de proceso (no bloqueante)**: `docs/design/integration-debt.md` fue modificado fuera de la lista literal de archivos autorizados en `implementation-plan.md`. Es la fila que documenta el hallazgo E2 (ver `design.md`), agregada durante la fase de diseño y ya aprobada por el PO — contenido de trazabilidad, no código.
2. **Issue independiente, fuera del Definition of Done de este change** (por instrucción explícita del PO): `eslint.config.js` no define los globals de Vitest/Node, generando ~3156 errores en `npm run lint` global sobre el 100% de los archivos de test del repo. Preexistente a este cambio, no introducido por él. Requiere su propio ticket de infraestructura.
3. **Deuda ya documentada, no de este change**: `GoalManager` usa gamificación (confetti/trofeo/animaciones) que contradice el Product Blueprint §07 — hallazgo E2, registrado en `docs/design/integration-debt.md` (fila 2026-08-06), ticket propio pendiente de priorización.

## Fuera de alcance (no tocado)

`dashboard-claridad`, `onboarding-flow`, Ideas (`insights-ia-real`), Dinero pendiente, y el modelo de monetización (`useSubscription.js`, límites Free/Pro) — todos intactos, confirmado por `git diff`.

## Estado

**Implementation: Completed. QA: Completed (sdd-verify PASS).**

Las capabilities restantes de `saldo-v1-1-claridad-financiera` (`dashboard-claridad`, `onboarding-flow`, `dinero-pendiente`) siguen pendientes, cada una con su propio ciclo Discovery → Design → Spec → Tasks → Implementación, independiente de esta.
