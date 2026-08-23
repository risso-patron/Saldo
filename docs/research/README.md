# Investigación con usuarios — SALDO Development Cycle (SDC)

**Qué es esta carpeta**: el proceso y las plantillas reutilizables para investigar con usuarios reales de SALDO, institucionalizado como entrada formal del SDC.
**Por qué existe**: `docs/design/constitution/Saldo Experience Constitution.dc.html:355` fija que el Dashboard —y, por el mismo principio, cualquier superficie central del producto— *"crece por evidencia de uso, jamás por petición de roadmap"*. Sin un proceso repetible de investigación, esa regla es imposible de cumplir en la práctica: cada ciclo terminaría inventando su propia evidencia ad-hoc, o simplemente citando feedback resumido sin verificar. Este proceso es la respuesta institucional a eso.
**Origen**: `openspec/changes/saldo-v1-1-claridad-financiera/dashboard-claridad-product-evidence.md` (aprobado por el PO, 2026-08-06) fue la primera aplicación de este proceso, antes de que existiera formalizado. Esta carpeta lo convierte en estándar para toda capability futura.

---

## Cuándo se usa

**Obligatorio** antes del `sdd-propose` de cualquier capability que afecte una superficie central del producto (Dashboard, Movimientos/Hoja, Onboarding — las superficies "núcleo" de `Saldo Product Blueprint.dc.html` §02) cuando la motivación de esa capability es, total o parcialmente, una petición de roadmap (un PDP, un pedido del PO) y no una deuda técnica o una corrección de comportamiento ya decidido.

**No obligatorio** para: correcciones de bugs, deuda técnica ya registrada (`docs/design/integration-debt.md`), cambios puramente de documentación (`docs/governance/PLAN-NORM-001-normalizacion-documental.md` es un ejemplo de lo que NO necesita este proceso), o capabilities cuyo alcance ya viene dado por una decisión de producto cerrada sin ambigüedad (como fue `metas-exposicion`: GoalManager ya existía, solo se decidía cómo exponerlo).

## Cómo encaja en el SDC

```
PDP (decisión de negocio del PO) — u otro origen legítimo de un Decision Gate
   │                                  (deuda técnica, seguridad, regulación, negocio — ver PROP-001)
   ▼
Product Evidence (hipótesis falsables + preguntas de investigación)
   │              ── ver dashboard-claridad-product-evidence.md como ejemplo de esta pieza
   ▼
Investigación con usuarios ←── ESTA CARPETA
   │  entrevistas (templates/entrevista.md)
   │  hallazgos por entrevista (templates/hallazgos.md)
   │  síntesis cruzada, evidencia pura, sin decisión (templates/sintesis.md)
   │  clasificación de evidencia (templates/clasificacion-de-evidencia.md)
   ▼
Decision Gate (docs/governance/PROP-001-etapa-product-decision.md) → templates/decision.md
   │  Aprobado / Rechazado / Pospuesto / Solicitar más evidencia
   │  PDP nuevo SOLO si Aprobado + evolución relevante (superficie núcleo, cambia un PDP anterior,
   │  o compromete roadmap citable por otro ciclo)
   ▼
sdd-explore / sdd-propose (respaldado por decision.md + evidencia, nunca solo por hipótesis internas)
   │
   ▼
sdd-spec → sdd-design → sdd-tasks → Implementation Plan → sdd-apply → sdd-verify → Product Acceptance
```

El Decision Gate es más amplio que esta carpeta — aplica a cualquier evolución de producto que pueda modificar comportamiento, alcance, estrategia o dirección, sin importar si el origen es investigación. Su definición completa y sus reglas viven en `docs/governance/PROP-001-etapa-product-decision.md`; acá solo se documenta cómo se aplica cuando el origen es una ronda de investigación con usuarios.

## Estructura de esta carpeta

```
docs/research/
├── README.md                              — este archivo
├── templates/
│   ├── entrevista.md                      — guía de entrevista, 20-30 min, foco en comportamiento
│   ├── hallazgos.md                       — registro por entrevista individual
│   ├── sintesis.md                        — modelo para cruzar N entrevistas en evidencia accionable
│   ├── clasificacion-de-evidencia.md      — criterios de impacto / frecuencia / confianza
│   └── decision.md                        — registro del Decision Gate, separado de la evidencia
└── {tema}-{AAAA-MM}/                      — una carpeta por ronda de investigación (instancia, no template)
    ├── entrevistas/
    │   ├── entrevista-01.md               — copia de templates/entrevista.md + hallazgos.md, completada
    │   └── ...
    ├── sintesis.md                        — copia de templates/sintesis.md, completada — solo evidencia
    └── decision.md                        — copia de templates/decision.md, completada tras el Decision Gate
```

Cada ronda de investigación (por ejemplo, `dashboard-claridad-2026-08/`) es una **instancia**: copia las plantillas, no las edites en el lugar — así el próximo ciclo no hereda respuestas de un ciclo anterior.

## Reglas de esta carpeta

- Las entrevistas se diseñan a partir de las hipótesis de un documento **Product Evidence** ya aprobado — no se investiga sin hipótesis falsables previas (evita la "pesca" sin foco).
- Ninguna entrevista se cierra sin pasar por `hallazgos.md` — la síntesis nunca se hace directamente sobre notas sueltas.
- `sintesis.md` **nunca** contiene el resultado de un Decision Gate, aunque el origen de ese gate sea esta misma ronda — el resultado vive siempre en `decision.md` (`docs/governance/PROP-001-etapa-product-decision.md` §5). Mezclarlos rompe la separación entre evidencia e interpretación que esa propuesta institucionalizó.
- `decision.md` (y el PDP, si el gate lo generó) es lo que se cita como autorización en `sdd-explore`/`sdd-propose` — nunca `sintesis.md` directamente ni las entrevistas individuales sueltas. `sintesis.md` sigue siendo consultable como respaldo, citado desde `decision.md`.
- Toda cita textual en `hallazgos.md` se marca como tal (comillas, con quién y cuándo) — nunca se parafrasea como si fuera literal.
