# OpenSpec Change Registry

**Qué es**: índice de estado operativo de los changes/capabilities del track OpenSpec/SDC. **No es una fuente de verdad** — es un derivado. Definido en `docs/governance/PROP-003-openspec-change-registry.md` (proposal, aprobada) y `docs/governance/GOV-002-spec.md` (spec, ratificada).

**Regla de autoridad (no negociable)**: si esta tabla contradice un artefacto SDC primario (proposal/spec/design/tasks/verify-report/`*-COMPLETED.md`), **el artefacto primario tiene razón y este Registry está desactualizado**. Nunca al revés. Este Registry **nunca** se cita como evidencia en un Decision Gate ni en un PDP — solo orienta hacia dónde mirar la evidencia real.

**Vocabulario de estados** (cerrado, cinco valores — las fases internas del DAG SDC, Discovery a QA, colapsan todas en `En progreso`): `No iniciada` · `En progreso` · `Waiting` · `Completed` · `Archivada`.

**Última actualización**: 2026-08-07.

---

## Capabilities activas

| Change | Capability | Estado | Último movimiento | Evidencia primaria | Bloqueado por |
|---|---|---|---|---|---|
| `saldo-v1-1-claridad-financiera` | `metas-exposicion` | Completed | 2026-08-06 | [`metas-exposicion-COMPLETED.md`](saldo-v1-1-claridad-financiera/metas-exposicion-COMPLETED.md) | — |
| `saldo-v1-1-claridad-financiera` | `onboarding-flow` | Completed | 2026-08-07 | [`onboarding-flow-COMPLETED.md`](saldo-v1-1-claridad-financiera/onboarding-flow-COMPLETED.md) | — |
| `saldo-v1-1-claridad-financiera` | `dashboard-claridad` | Waiting | 2026-08-06 | [`dashboard-claridad-product-evidence.md`](saldo-v1-1-claridad-financiera/dashboard-claridad-product-evidence.md) | Sin evidencia Nivel A todavía — `docs/research/primeros-10-minutos-2026-08/` abierta, sin entrevistas registradas. `sdd-propose` pospuesto hasta que exista. |
| `insights-ia-real` | `insights-ia-real` | En progreso | 2026-07-15 | [`tasks.md`](insights-ia-real/tasks.md) | — |

## Capabilities archivadas

Ninguna todavía.
