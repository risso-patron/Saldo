# Resumen final: GOV-002 — OpenSpec Change Registry — COMPLETED

**Tema**: `GOV-002` (change registry para el track OpenSpec/SDC) · **Proposal**: `PROP-003`
**Fecha de cierre**: 2026-08-07
**Product Acceptance**: otorgada por el PO (Luis), 2026-08-07 — **Verification PASS**

## Alcance implementado

Índice central y acotado del estado de los changes/capabilities del track OpenSpec/SDC, en `openspec/changes/INDEX.md`:

- Vocabulario de 5 estados cerrado (`No iniciada` / `En progreso` / `Waiting` / `Completed` / `Archivada`), colapsando deliberadamente las fases internas del DAG SDC (Discovery a QA) en `En progreso`.
- Estructura mínima por entrada: Change, Capability, Estado, Último movimiento, Evidencia primaria (link), Bloqueado por (solo si `Waiting`).
- Poblado con el estado real de 4 capabilities, verificado contra fuente primaria: `metas-exposicion` (Completed), `onboarding-flow` (Completed), `dashboard-claridad` (Waiting), `insights-ia-real` (En progreso).
- `dinero-pendiente` excluida por decisión explícita del PO — existe como prioridad de Product Master/PDP-001 pero no tiene todavía ningún artefacto dentro del track OpenSpec/SDC.

## Requirements verificados: 10/10 + 1 no aplicable a verificación puntual

Ver detalle completo en [`GOV-002-verify-report.md`](GOV-002-verify-report.md). Los 12 requirements de [`GOV-002-spec.md`](GOV-002-spec.md) se evaluaron; 10 con evidencia directa PASS, 1 (comportamiento para `Completed`/`Waiting`, contabilizados por separado en el detalle) y 1 (eventos que obligan a actualizar) marcado como no verificable contra una foto estática — es una obligación de proceso futuro, no una propiedad del archivo en un instante dado.

## Evidencia de verificación

- [`PROP-003-openspec-change-registry.md`](PROP-003-openspec-change-registry.md) — proposal, aprobada (nombre, ubicación, granularidad, autoridad, actualización, exclusión de `state.yaml`).
- [`GOV-002-spec.md`](GOV-002-spec.md) — spec, ratificada sin cambios (12 requirements).
- [`GOV-002-verify-report.md`](GOV-002-verify-report.md) — verificación formal, PASS.
- [`../../openspec/changes/INDEX.md`](../../openspec/changes/INDEX.md) — el Registry mismo.

## Declaraciones de cierre (vigentes hacia adelante)

- `openspec/changes/INDEX.md` **es un índice de capabilities, no una autoridad de producto**.
- La **fuente primaria siempre prevalece** sobre el Registry — si contradice a un artefacto SDC real, el Registry es el que está desactualizado.
- El Registry **no constituye evidencia** para Decision Gates ni PDPs.
- Los estados del Registry son **deliberadamente colapsados** — no reproducen el DAG interno del SDC.
- `state.yaml` (mencionado en `openspec-convention.md`) **queda como hallazgo separado, no forma parte de GOV-002** — es por-change, interno del orquestador, no sustituye ni es sustituido por el Registry.
- `BR-2.md`, `docs/research/`, `dashboard-claridad`, `insights-ia-real`, y cualquier otra iniciativa de producto o investigación **quedan fuera del alcance de GOV-002** — ninguna se tocó, modificó, ni resolvió como parte de este cierre.
- La **actualización del Registry queda integrada al flujo de cierre/gate existente** de cada capability — no es una tarea administrativa independiente que alguien deba recordar hacer aparte.

## Limitaciones conocidas

- El Registry es de mantenimiento manual — su vigencia depende de que cada gate de cierre futuro efectivamente lo actualice, tal como define la política de `GOV-002-spec.md`.
- El caso límite de una capability sin ningún artefacto SDC (como `dinero-pendiente`) queda resuelto por interpretación de alcance de esta ronda (no incluir), no por una regla explícita nueva en la spec — no se modificó la spec para esto, por instrucción del PO.

## Fuera de alcance (no tocado)

`state.yaml`, `openspec-convention.md`, `BR-2.md`, `docs/research/`, `dashboard-claridad`, `insights-ia-real`, `dinero-pendiente`, y cualquier otra capability — todos intactos, confirmado por `git status` en cada paso de este ciclo.

## Estado

**Spec: Completed. Implementation: Completed (`openspec/changes/INDEX.md`). Verification: Completed (PASS). Product Acceptance: Completed.**

`GOV-002` queda cerrado. El SDC mantiene sus 8 principios ratificados sin cambios — `GOV-002` no agrega un principio nuevo a esa lista, es una herramienta operativa derivada de ellos.
