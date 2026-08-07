# Proposal: `onboarding-flow` (revisión final, previa a `sdd-spec`)

**Base obligatoria**: `onboarding-flow-discovery.md` (Discovery, aceptado por el PO 2026-08-07) + `docs/product-master/06-onboarding.md` (spec fuente, cerrado) + `PDP-001` §4.1 (autorización).
**Evaluación PROP-002 heredada del Discovery**: Nivel de evidencia B, Riesgo compuesto Medio → Avanza. No requiere Product Evidence adicional.
**Revisión**: incorpora 3 precisiones funcionales pedidas por el PO (concepto de "usuario nuevo", idempotencia, independencia de `dashboard-claridad`) — todas editoriales, ninguna requirió escalar una decisión nueva. Ver sección dedicada abajo.

## Intent

Implementar el flujo de primer uso ya especificado y cerrado en `06-onboarding.md` (Paso A opcional → Paso B obligatorio → Paso C aterrizaje en Inicio). No es una hipótesis de producto nueva — es la ejecución de una decisión ya tomada (cap 06 + PDP-001 §4.1). El Discovery no encontró incompatibilidad técnica que justifique un diseño distinto.

## Precisiones funcionales (incorporadas en esta revisión, previas a `sdd-spec`)

Las tres son editoriales — derivadas de decisiones ya cerradas en `06-onboarding.md`, ninguna requiere una decisión de producto nueva.

### 1. Concepto funcional de "usuario nuevo"

Un usuario está en estado **"onboarding pendiente"** desde un registro exitoso (`06-onboarding.md:89`, "el onboarding empieza inmediatamente después del Registro... sin pantalla intermedia") hasta que carga su primer movimiento por sí mismo (`:47-50`, mismo criterio ya usado para "onboarding completo"). Condición única, sin depender del tiempo transcurrido ni de cuántas sesiones tuvo: un usuario registrado hace tiempo que nunca cargó un movimiento sigue en "onboarding pendiente" bajo esta misma regla, sin excepción nueva. **No resuelve la implementación** (de dónde sale ese estado — Supabase, localStorage, o ambos — queda para `sdd-design`); solo fija la condición funcional que ese diseño debe satisfacer.

### 2. Idempotencia del flujo

Consecuencia directa del punto 1: una vez que un usuario transiciona a "onboarding completo", esa condición es permanente — no se revierte por cargar menos movimientos después, ni por ningún otro evento dentro de este alcance. **`onboarding-flow` no debe volver a dispararse automáticamente una vez completado**, salvo una decisión de producto futura y explícita (ej. un "reiniciar onboarding" en Ajustes) — fuera de este alcance, no se diseña acá.

### 3. Independencia de `dashboard-claridad`

Ya implícita en el Alcance excluido original; queda ahora explícita como principio: **`onboarding-flow` se considera terminado con éxito usando el Dashboard exactamente como existe hoy.** Ninguna decisión o resultado futuro de `dashboard-claridad` es condición de éxito de esta capability, ni al revés — son ciclos independientes. La única conexión es la dependencia ya documentada (D-1, ver `Dependencies`), que describe una tensión a futuro, no un acoplamiento de alcance presente.

## Scope

### In Scope
- Detección de "usuario nuevo" — condición funcional fijada arriba (Precisión 1); implementación a resolver en diseño técnico.
- Paso A: confirmación del "porqué", salteable con el mismo peso visual que continuar.
- Paso B: carga guiada del primer movimiento real, **ingreso o gasto con el mismo peso** (corrige D-2 del Discovery: hoy el `EmptyState` solo ofrece gasto).
- Interrupción y retomado del Paso B sin reiniciar (evaluar reuso de la persistencia de borrador ya existente en `NewMovementSheet`).
- Criterio de cierre: Inicio visible con ≥1 movimiento cargado por el usuario — no "completar todos los pasos".
- Paso C: aterrizaje en el Dashboard **tal como existe hoy**, sin alterar su contenido.

### Out of Scope
- Cualquier trabajo de `dashboard-claridad` — capability separada, en `WAITING FOR PRODUCT EVIDENCE`.
- Resolver D-1 (trío de cifras vs. cifra protagonista, misma tensión que `C-03`) — se documenta como dependencia, no se resuelve acá.
- Modificar arquitectura, contenido o composición visual del Dashboard.
- Copy exacto (cap 07), transiciones/animaciones (cap 08), estados de error del Paso B (cap 09) — implementación mínima funcional, sin diseño de microinteracciones nuevo.

## Capabilities

### New
- `onboarding-flow`: flujo de 3 pasos según `06-onboarding.md`, con detección de usuario nuevo y criterio de cierre por primer movimiento real.

### Modified
- Ninguna en spec. El único punto de contacto con `dashboard-claridad` es el `EmptyState` del Dashboard (agregar CTA de ingreso, D-2) — se trata como parte del contrato de `onboarding-flow` (Paso B), no como evolución de contenido del Dashboard. `sdd-design` debe dejarlo explícito, mismo deslinde que ya se usó con `metas-exposicion`.

## Approach

UI-first, sin tocar Supabase ni el modelo de datos si la detección de "usuario nuevo" puede resolverse con un campo ya existente (fecha de registro). Reutilizar `NewMovementSheet` para el Paso B en vez de un formulario nuevo. Paso C aterriza en el Dashboard existente sin tocarlo.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/App.jsx` | Modified | Disparo del flujo para usuario nuevo |
| Componente(s) Paso A | New | Pantalla de confirmación, salteable |
| `NewMovement/NewMovementSheet.jsx` | Posiblemente modified | Reuso para Paso B; confirmar si ya cubre interrupción/retomado |
| `Dashboard/DashboardHome.jsx` (`EmptyState`) | Modified, menor | CTA de ingreso junto al de gasto (D-2) — dentro de este contrato, no de `dashboard-claridad` |
| `contexts/AuthContext.jsx` | Posiblemente modified | Fuente de la detección "usuario nuevo" |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Confundir el ajuste del `EmptyState` con trabajo de `dashboard-claridad` | Med | `design.md` delimita explícitamente el contrato — solo el CTA de ingreso, nada de composición visual nueva |
| La persistencia de borrador de `NewMovementSheet` no cubre exactamente el caso de interrupción del onboarding | Low-Med | Verificar en `sdd-design`, no asumir reuso completo |
| D-1 se filtra implícitamente al diseño técnico | Low | `design.md` cita la dependencia documentada (abajo) como gate explícito, no la resuelve |

## Rollback Plan

Sin cambio de schema si la detección de "usuario nuevo" usa un campo ya existente — revertir es revertir código. Si el diseño técnico requiere un campo nuevo, define su propio plan de rollback antes de `sdd-apply` (regla del proyecto).

## Dependencies

- `docs/product-master/06-onboarding.md`, `PDP-001` §4.1, `onboarding-flow-discovery.md`.
- **Dependencia documentada, no resuelta** (texto del PO): *"El Paso C del onboarding requiere una experiencia de llegada a Inicio compatible con la evolución futura del Dashboard, pero esta capability no define esa evolución."*

## Success Criteria

- [ ] Usuario nuevo ve el Paso A (salteable) tras el registro
- [ ] Paso B permite cargar un ingreso o un gasto con el mismo peso
- [ ] El flujo sobrevive el cierre/reapertura de la app a mitad del Paso B
- [ ] Onboarding se considera completo con ≥1 movimiento propio, sin exigir todos los pasos
- [ ] Paso C aterriza en el Dashboard existente, sin ninguna modificación a su contenido o arquitectura
- [ ] D-1 queda citada como dependencia en el artefacto, no resuelta ni ocultada
- [ ] Una vez completado, el flujo no vuelve a dispararse automáticamente (idempotencia, Precisión 2)
- [ ] Ningún archivo ni comportamiento de `dashboard-claridad` fue tocado (independencia, Precisión 3)
