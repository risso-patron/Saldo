# PROP-003 — GOV-002: OpenSpec Change Registry

**Tipo**: propuesta metodológica para revisión. **No crea el Registry. No modifica convenciones. No crea `state.yaml`. No es una decisión tomada.**
**Fecha**: 2026-08-07
**Depende de**: Discovery de `GOV-002` (aceptado, sin archivo persistido — entregado inline en conversación), `docs/governance/GOV-001-jerarquia-documental-de-producto.md` (principio de trazabilidad-vs-autoridad, §2.2), `docs/product-master/INDEX.md` (precedente de formato).

---

## 1. Problema

El repositorio no puede responder hoy, sin reconstrucción manual, preguntas básicas sobre el track OpenSpec/SDC: qué changes/capabilities existen, cuál es su estado, qué bloquea a las que están en espera, y dónde está su evidencia. La causa es fragmentación entre cuatro tracks de gobernanza (Product Master, Release/QA, Research, OpenSpec/SDC) que nunca se cruzan formalmente — mismo patrón que `GOV-001` ya diagnosticó entre Product Master y Design, ahora confirmado también entre OpenSpec/SDC y los otros tres.

## 2. Objetivo

Crear un índice central, acotado y consultable del estado de los changes/capabilities del track OpenSpec/SDC.

## 3. Alcance

### En alcance
El Registry debe permitir responder, de un vistazo:
- Qué changes/capabilities existen.
- Estado actual de cada uno.
- Cuál fue el último movimiento relevante (fecha).
- Cuál es la evidencia primaria (link al artefacto SDC correspondiente).
- Qué bloquea un change cuando está en `WAITING`.

### Fuera de alcance (explícito)
- Contenido de producto o filosofía (Product Master).
- Detalle de QA (Release/RC-*).
- Diseño de investigación con usuarios (`docs/research/`, `BR-2.md` — superposición entre ambos ya señalada en el Discovery de `GOV-002`, permanece sin resolver, no es parte de esta propuesta).
- Decisiones de producto (eso sigue viviendo en el Decision Gate / PDP-serie, `PROP-001`).
- Detalles de implementación.
- Contenido duplicado de Specs, Designs, Verify Reports o `*-COMPLETED.md` — el Registry enlaza, no copia.
- `state.yaml` — mantenido completamente fuera de este alcance (ver §8 hallazgo separado).

## 4. Alternativas consideradas

| Alternativa | Evaluación |
|---|---|
| `openspec/changes/00-STATE.md` | **Rechazada.** Colisión semántica directa con `docs/product-master/00-STATE.md` — repetiría el mismo error que originó este Discovery. |
| `openspec/changes/INDEX.md` | **Recomendada** (evaluación en §5). |
| `openspec/changes/REGISTRY.md` o similar, nombre nuevo sin precedente | Descartada por preferencia: no sigue ningún patrón ya usado en el proyecto; `INDEX.md` ya es un nombre validado para esta función exacta (checklist de estado) en `docs/product-master/`. Introducir un nombre nuevo sin necesidad agrega una convención más a mantener. |
| Un archivo de estado por change/capability, sin índice central (ej. `openspec/changes/{change}/STATUS.md`) | **Rechazada.** No resuelve el problema — seguiría exigiendo abrir N carpetas para tener la vista consolidada que es el objetivo mismo de esta propuesta. |
| Extender `state.yaml` para que cumpla función de registry humano-legible | **Rechazada.** Mezclaría un artefacto técnico interno (YAML, propiedad del orquestador, por-change, pensado para recuperación tras compactación) con un documento de lectura humana cross-change. El PO pidió explícitamente mantenerlos separados (§8). |

## 5. Propuesta recomendada

**Ubicación y nombre**: `openspec/changes/INDEX.md`.

**Justificación de `INDEX.md` sobre otras opciones**: reusa un patrón de nombre ya validado en este mismo proyecto (`docs/product-master/INDEX.md` cumple función análoga — checklist con estado — para otro track). No colisiona en ruta (carpetas distintas). El riesgo de ambigüedad si alguien lo menciona sin ruta completa ("¿cuál INDEX.md?") es menor que el de reusar "00-STATE" — "índice" es un nombre genérico esperable en más de un lugar de un repositorio (como un `README`), mientras que "00-STATE" ya "pertenece" conceptualmente a Product Master en este proyecto específico.

**Granularidad**: por **capability**, no por change-como-bloque. Si se registrara solo a nivel de change, `saldo-v1-1-claridad-financiera` sería una sola fila y no respondería "qué capabilities existen" — que es parte explícita del alcance (§3). Cada capability (`metas-exposicion`, `onboarding-flow`, `dashboard-claridad`, `dinero-pendiente`, y `insights-ia-real` como change hermano) es su propia fila, agrupada visualmente por change cuando un change tiene más de una.

**Columnas mínimas**: Change | Capability | Estado | Último movimiento (fecha) | Evidencia primaria (link) | Bloqueado por (solo si `WAITING`).

## 6. Reglas de autoridad

**Si el Registry contradice una fuente primaria, la fuente primaria tiene autoridad y el Registry se considera desactualizado/inconsistente** — no al revés. Mismo principio de trazabilidad-vs-autoridad ya establecido en `GOV-001` §2.2: los artefactos SDC (`proposal.md`, `spec.md`, `design.md`, `tasks.md`, `*-verify-report.md`, `*-COMPLETED.md`) son la fuente soberana de estado real; el Registry es puramente derivado, nunca autoritativo. Consecuencia operativa: **el Registry no se cita como evidencia en un Decision Gate ni en un PDP** — solo orienta hacia dónde mirar la evidencia real.

## 7. Política de actualización

El Registry se actualiza en estas transiciones:

| Transición | Actualización |
|---|---|
| Creación del change/capability | Nueva fila, estado inicial (Discovery o Proposal según corresponda) |
| Cambio de fase (Proposal→Spec→Design→Tasks→Implementation→QA) | Columna "Estado" actualizada |
| `WAITING` | Estado + columna "Bloqueado por" con la razón/dependencia |
| Product Acceptance | Estado actualizado |
| `Completed` | Estado final + link a `*-COMPLETED.md` |
| Archive (si corresponde) | Fila movida a una sección "Archivadas" o removida, referenciando `openspec/changes/archive/` |

**Quién actualiza y cuándo**: como parte del mismo gate que ya cierra cada fase — no un paso separado que alguien deba recordar hacer aparte. Ejemplo concreto: al escribir un `*-COMPLETED.md` (como se hizo con `onboarding-flow-COMPLETED.md`), actualizar la fila correspondiente del Registry en el mismo momento, igual que ya se actualiza `docs/product-master/00-STATE.md` cuando corresponde al track de Product Master.

## 8. Hallazgo separado: `state.yaml`

Mantenido completamente fuera del alcance de `GOV-002`, registrado únicamente como hallazgo/deuda distinta:
- Es **por-change**, no cross-change.
- Es estado **interno del orquestador** (recuperación tras compactación), no un documento de lectura humana.
- **No sustituye al Registry** ni el Registry lo sustituye a él — resuelven problemas distintos, en granularidades distintas.
- Nunca se creó en este proyecto pese a estar en `openspec-convention.md` — gap previo y separado, no se resuelve acá.

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Desactualización silenciosa (el Registry queda mintiendo si no se actualiza) | Regla de autoridad (§6: la fuente primaria siempre gana) + integrarlo al mismo flujo de cierre de cada fase, no como paso opcional aparte (§7). |
| Que termine citándose como fuente de verdad en un Decision Gate | Documentar la regla de autoridad (§6) dentro del propio Registry, no solo en esta propuesta. |
| Granularidad incorrecta (por change en vez de por capability) | Resuelto en la propuesta recomendada (§5) — granularidad explícita por capability. |
| Colisión de nombre `INDEX.md` con el de Product Master | Riesgo menor — carpetas distintas, ambos con precedente de convención idéntico (checklist de estado); aceptado conscientemente en §5. |

## 10. Impacto sobre el SDC existente

- No modifica ninguno de los 8 principios ya ratificados del SDC — es una herramienta operativa, no un principio nuevo.
- Agrega un paso más a los gates de cierre existentes (Product Acceptance, Completed): actualizar el Registry, igual que ya se actualiza `00-STATE.md` cuando corresponde a Product Master.
- Implica trabajo de puesta al día inicial (fuera de esta propuesta, sería la fase de creación): poblar retroactivamente el estado real de `metas-exposicion` (Completed), `onboarding-flow` (Completed), `dashboard-claridad` (Waiting), `insights-ia-real` (estado a confirmar), `dinero-pendiente` (no iniciada).

## 11. Qué NO hace esta propuesta

- No crea `openspec/changes/INDEX.md` ni ningún archivo del Registry todavía.
- No modifica `openspec-convention.md` ni ninguna otra convención.
- No crea `state.yaml`.
- No resuelve la superposición `BR-2.md` vs. `docs/research/` — permanece como hallazgo separado.

## 12. Decisión requerida del Product Owner

1. ¿Aprobás `openspec/changes/INDEX.md` como nombre y ubicación, o preferís otro?
2. ¿Aprobás la granularidad por capability (no por change-como-bloque)?
3. ¿Aprobás la política de actualización integrada a cada gate de cierre, en vez de un proceso separado?
4. ¿Autorizás avanzar a la creación del Registry (poblado con el estado actual real), o preferís mantener esto en pausa?

---

**Estado**: **aprobada y completamente cerrada**. Ver [`GOV-002-COMPLETED.md`](GOV-002-COMPLETED.md) para el resumen final de cierre.
