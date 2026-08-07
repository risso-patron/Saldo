# Resumen final: `onboarding-flow` — COMPLETED

**Change**: `saldo-v1-1-claridad-financiera` · **Capability**: `onboarding-flow`
**Fecha de cierre**: 2026-08-07
**Product Acceptance**: otorgada por el PO (Luis), 2026-08-07 — **PASS WITH WARNINGS aceptado**

## Alcance implementado

Flujo de primer uso de 3 pasos según `docs/product-master/06-onboarding.md`, autorizado por `PDP-001` §4.1:

- **Paso A** (opcional, salteable con el mismo peso que continuar): `OnboardingStepA.jsx`, nuevo.
- **Paso B** (obligatorio, carga real de ingreso o gasto): reutiliza la única instancia existente de `NewMovementSheet` — sin crear un segundo overlay, sin tocar ese componente.
- **Paso C** (aterrizaje en Inicio): cero código — el Dashboard se muestra tal cual existe hoy.
- Detección de "onboarding pendiente" (concepto funcional, no "usuario nuevo"), persistencia en `localStorage`, reanudación exacta en Paso B tras interrupción, continuidad tras abandono, finalización por primer movimiento propio, idempotencia (estado terminal), y 4 eventos de dominio observables sin infraestructura de analítica.
- D-2 (paridad ingreso/gasto en el `EmptyState` del Dashboard): segundo CTA agregado, delimitado estrictamente a ese bloque.

## Requirements verificados: 9/9 + D-1

Ver detalle completo en [`specs/onboarding-flow/spec.md`](specs/onboarding-flow/spec.md) y [`onboarding-flow-verify-report.md`](onboarding-flow-verify-report.md). 8/9 + D-1 COMPLIANT con evidencia de test pasante; 2/9 (Continuidad tras abandono, Idempotencia) con el comportamiento central probado pero cobertura parcial en una sub-variante cada uno — ver Limitaciones.

## Evidencia de verificación

- `onboarding-flow-verify-report.md` — informe completo: matriz Requirement→Task→Implementación→Evidencia, alcance verificado en 3 partes, decisiones preservadas, veredicto PASS WITH WARNINGS.
- `onboarding-flow-design.md` — diseño técnico, con la resolución ratificada de E-1.

## Tests ejecutados

- `npm test -- --run`: **784/784 tests, 72/72 archivos, verde** — **+26 sobre el baseline de 758** (previo a esta capability). Verificado de forma independiente por el orquestador y por `sdd-verify`, en corridas separadas.
- Lint: 0 errores en los 5 archivos de producción tocados/creados. 3 warnings de `react-hooks/exhaustive-deps` (`feedbackQueue`, `App.jsx`) confirmados preexistentes — comparación directa contra `git show HEAD:src/App.jsx` (versión previa) produjo los mismos 3 warnings.

## Limitaciones conocidas

1. **Deuda de cobertura de test (no funcional), aceptada por el PO** — registrada en `docs/design/integration-debt.md` (filas 2026-08-07): falta un caso de integración dedicado para abandono a mitad del Paso A, y otro para remontaje fresco post-completado (Idempotencia). Ambos mecanismos están garantizados estructuralmente y comparten código ya probado en otros casos — no son defectos, son huecos de cobertura. Candidatos a una iteración futura, sin ciclo de implementación abierto por esto.
2. **E-1 (heredada, ratificada)**: `transactionCount > 0` es un proxy temporal para la siembra retroactiva de usuarios existentes — no distingue movimientos manuales de importados/futuras fuentes automáticas. No se incorporó ningún concepto de `source`/identidad histórica al dominio de Movimientos; esa evolución, si se necesita, es un ciclo independiente.
3. **D-1 (heredada, no resuelta)**: el Paso C no muestra "el trío de cifras" que `06-onboarding.md` pide — el Dashboard actual solo tiene una cifra protagonista. Depende de la evolución de `dashboard-claridad` (misma tensión que C-03), explícitamente fuera del alcance de esta capability.

## Fuera de alcance (no tocado)

`dashboard-claridad` (arquitectura y contenido), `insights-ia-real`, `dinero-pendiente`, copy exacto (cap 07), animaciones (cap 08), infraestructura de telemetría/analítica, y el modelo de monetización — todos intactos, confirmado por `git diff` en cada gate de este ciclo.

## Estado

**Implementation: Completed. QA: Completed (`sdd-verify` PASS WITH WARNINGS). Product Acceptance: Completed.**

Las capabilities restantes de `saldo-v1-1-claridad-financiera` (`dashboard-claridad` — en `WAITING FOR PRODUCT EVIDENCE`, `dinero-pendiente`) siguen pendientes, cada una con su propio ciclo.
