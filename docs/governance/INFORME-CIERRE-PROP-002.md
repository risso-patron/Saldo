# INFORME-CIERRE-PROP-002

**Tipo**: informe de cierre de institucionalización.
**Fecha**: 2026-08-07
**Estado**: PROP-002 (modelo de niveles de evidencia basado en riesgo) queda **institucionalizado y completamente cerrado** como parte oficial del framework metodológico del SDC.

---

## 1. Archivos modificados

| # | Archivo | Cambio |
|---|---|---|
| 1 | `docs/research/templates/decision.md` | Bloque nuevo "Evaluación de riesgo (PROP-002)" — Nivel de evidencia disponible, Reversibilidad, Costo de corrección, Impacto sobre la experiencia del usuario, Riesgo compuesto, Resultado según matriz. Obligatorio solo cuando el nivel de evidencia no es A. |
| 2 | `docs/governance/PROP-001-etapa-product-decision.md` | Una referencia cruzada mínima en §2 (salida "Solicitar más evidencia"), señalando que el criterio de suficiencia de evidencia para evoluciones de producto es la matriz de PROP-002. Sin reescribir el modelo — solo el puntero, tal como preveía PROP-002 §11 ("documentar el modelo... en PROP-001 o en este mismo documento"). |
| 3 | `docs/governance/PROP-002-niveles-de-evidencia.md` | Estado actualizado de "versión candidata" a "institucionalizado y completamente cerrado". |
| 4 | Memoria persistente del SDC (`feedback_sdc_methodology.md` + índice `MEMORY.md`) | Principio 8 ratificado: modelo de niveles A/B/C + 4 dimensiones + regla de veto + matriz, con el límite de alcance explícito (no aplica a incidencias/defectos/seguridad/cumplimiento). |

**Verificación**: `git status` confirma que ningún otro archivo fue tocado — cero código, cero `openspec/`, cero capacidad funcional.

## 2. Alcance de la institucionalización

Exactamente lo previsto en `PROP-002` §11, sin agregados:

- Modelo de niveles A/B/C: sin cambios desde su aprobación conceptual (turno anterior).
- Cuatro dimensiones (Nivel de evidencia, Reversibilidad, Costo de corrección, Impacto): sin cambios.
- Regla de veto y matriz de decisión: sin cambios.
- Aclaración de alcance (PROP-002 no aplica a incidencias/defectos/seguridad/cumplimiento normativo): incorporada en el turno anterior, preservada intacta.
- Compatibilidad con Product Evidence y Decision Gate: confirmada — el bloque nuevo de `decision.md` es aditivo, no reemplaza ningún campo existente ni cambia las 4 salidas del gate (Aprobado/Rechazado/Pospuesto/Solicitar más evidencia).

## 3. Confirmación: sin cambios metodológicos adicionales a los aprobados

No se modificó ningún otro documento del SDC (`docs/research/README.md`, `docs/research/templates/entrevista.md`, `hallazgos.md`, `sintesis.md`, `clasificacion-de-evidencia.md`, `GOV-001`, `PLAN-NORM-001` permanecen exactamente como estaban). No se abrió ninguna PROP nueva. No se inició ningún ciclo Discovery/Proposal/Design/Spec/Tasks. El estado `WAITING FOR PRODUCT EVIDENCE` del proyecto no cambia por esta institucionalización.

## 4. El SDC queda con 8 principios ratificados

Verificación contra fuente primaria · Implementation Plan obligatorio · una capability por ciclo · verificación independiente antes de Product Acceptance · investigación con usuarios como entrada formal · Decision Gate para toda evolución de producto · no-retroactividad por defecto · **modelo de niveles de evidencia basado en riesgo (A/B/C + matriz), acotado a decisiones de evolución de producto**.

---

**Próximo paso**: ninguno de mi parte. El proyecto vuelve a foco de producto y obtención de evidencia con usuarios — sin nuevas iniciativas metodológicas por iniciativa propia, según instrucción del PO.
