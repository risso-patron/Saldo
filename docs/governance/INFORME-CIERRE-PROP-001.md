# INFORME-CIERRE-PROP-001

**Tipo**: informe de cierre de institucionalización.
**Fecha**: 2026-08-06
**Estado**: PROP-001 (Decision Gate) queda **institucionalizada** como parte oficial del framework metodológico del SDC.

---

## 1. Qué se ejecutó

| # | Acción | Archivo |
|---|---|---|
| 1 | Ajuste editorial: definición del Decision Gate reescrita en forma normativa. | `docs/governance/PROP-001-etapa-product-decision.md` §1 |
| 2 | Estado de PROP-001 actualizado de "propuesta" a "institucionalizada". | `docs/governance/PROP-001-etapa-product-decision.md` (header + cierre) |
| 3 | `README.md` del paquete de investigación actualizado: pipeline con Decision Gate insertado entre Investigación y `sdd-explore`/`sdd-propose`; estructura de carpetas con `decision.md`; reglas actualizadas (separación evidencia/decisión, qué se cita aguas abajo). | `docs/research/README.md` |
| 4 | Plantilla nueva del Decision Gate creada. | `docs/research/templates/decision.md` |
| 5 | Principio 6 del SDC ratificado en memoria persistente entre sesiones; corregida una referencia obsoleta en el principio 5 (ya no es `sintesis.md` lo citable aguas abajo, es `decision.md`). | memoria persistente del proyecto (`feedback_sdc_methodology.md`) |
| 6 | Registrado en memoria del proyecto (engram), mismo topic que los principios 1-5. | engram, `sdd/sdc-methodology-ratified` |

**Verificación independiente**: `git status` confirma que solo se tocaron/crearon los archivos listados arriba — ninguna capacidad funcional, ningún archivo de código, ningún `openspec/changes/` nuevo o modificado.

## 2. Qué NO se ejecutó (fuera de alcance de esta institucionalización, por instrucción explícita)

- No se decidió si el Decision Gate aplica retroactivamente al ciclo de `dashboard-claridad` ya en curso.
- No se abrió ningún ciclo `openspec/` nuevo.
- No se modificó ninguna capacidad funcional del producto.

## 3. El framework metodológico del SDC, tal como queda

```
PDP-001 (dirección estratégica) — u otro origen de un Decision Gate
   │
   ▼
Product Evidence (hipótesis falsables)         ── docs/governance/GOV-001 §2.4 (principio de autoridad del PO)
   │
   ▼
Investigación (docs/research/) → sintesis.md (evidencia pura)
   │
   ▼
Decision Gate → decision.md (registro, cualquiera sea el resultado)
   │            ── docs/governance/PROP-001-etapa-product-decision.md
   ├── Rechazado / Solicitar más evidencia / Pospuesto ──► sin PDP
   └── Aprobado + evolución relevante ──► PDP-00N
   │
   ▼
Discovery (sdd-explore) → sdd-propose → sdd-spec → sdd-design → sdd-tasks
   → Implementation Plan → sdd-apply → sdd-verify → Product Acceptance
```

**Seis principios ratificados del SDC** (RETRO-001 + esta sesión):
1. Verificar siempre contra la fuente primaria, nunca contra un comentario de código.
2. Implementation Plan es gate obligatorio antes de `sdd-apply`.
3. Una capability por ciclo.
4. Verificación independiente del orquestador antes de Product Acceptance.
5. Investigación con usuarios como entrada formal antes de `sdd-propose` en superficies núcleo motivadas por roadmap.
6. Decision Gate obligatorio para toda evolución que module comportamiento, alcance, estrategia o dirección del producto — con `decision.md` como registro y PDP como artefacto condicional.

---

**Próximo paso**: a tu criterio — decidir si el Decision Gate aplica al ciclo de `dashboard-claridad` en curso, o iniciar la primera ronda real de investigación usando el paquete ya institucionalizado.
