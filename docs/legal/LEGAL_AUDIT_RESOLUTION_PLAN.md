# Legal Audit Resolution Plan

## Objetivo

Este documento clasifica y planifica la resolución de los 6 hallazgos registrados en `LEGAL_AUDIT_REPORT.md`. **No corrige ningún documento, no resuelve ninguna decisión del Product Owner y no modifica código ni arquitectura.** Es exclusivamente una capa de planificación: para cada hallazgo, determina qué tipo de trabajo requiere, quién debería resolverlo, si bloquea la redacción legal, y en qué momento del flujo (`LEGAL_IMPLEMENTATION_PLAN.md`) conviene atenderlo.

## Hallazgos pendientes

| ID | Hallazgo | Tipo | Responsable | Bloquea redacción legal | Acción requerida |
|---|---|---|---|---|---|
| **AUDIT-001** | PO-LEGAL-003 formulada como pregunta de hecho técnico en `LEGAL_DECISIONS_PENDING.md` pero como decisión estratégica de 3 opciones en `LEGAL_PO_DECISION_GATE.md` | Documentation Update | Equipo de documentación legal | **Sí** | Reconciliar la formulación de PO-LEGAL-003 en ambos documentos (una sola redacción, o dos IDs distintos) antes de que el Product Owner la dé por resuelta |
| **AUDIT-002** | El índice de `README.md` solo lista 4 de los 8 archivos reales de la carpeta (faltan `AI_DATA_FLOW.md`, `BILLING_MODEL.md`, `LEGAL_PO_DECISION_GATE.md`, `LEGAL_IMPLEMENTATION_PLAN.md`) | Documentation Update | Equipo de documentación legal | No | Actualizar la tabla "Archivos de esta carpeta" de `README.md` con el listado completo y vigente |
| **AUDIT-003** | "Derechos del usuario" figura en `LEGAL_DOCUMENT_CATALOG.md` con prioridad Alta, pero no aparece como ítem propio en el orden de redacción de la Fase C de `LEGAL_IMPLEMENTATION_PLAN.md` | Documentation Update | Equipo de documentación legal | **Sí** (antes de completar la Fase C) | Aclarar en `LEGAL_IMPLEMENTATION_PLAN.md` si "Derechos del usuario" se redacta como paso propio o como parte del paso de Privacy Policy |
| **AUDIT-004** | El diagrama del "Modelo legal del producto" en `LEGAL_ARCHITECTURE.md §4` describe al proveedor de IA como "sin confirmar", sin reflejar el hallazgo posterior de `AI_DATA_FLOW.md`/LEG-005 (Groq confirmado; Gemini/Anthropic no) | Documentation Update | Equipo de documentación legal | No | Actualizar la cita de `LEGAL_ARCHITECTURE.md §4` para incorporar LEG-005 junto a LEG-002 |
| **AUDIT-005** | Ningún documento de `docs/legal/` aclara que esta arquitectura no reemplaza asesoramiento jurídico profesional ni constituye una certificación de cumplimiento | Governance Improvement | Product Owner / Equipo de documentación legal | **Sí** | Definir e incorporar una nota de alcance explícita (dónde vive, qué dice) antes de que se inicie la Fase C (redacción legal) |
| **AUDIT-006** | La fila de Privacy Policy en `LEGAL_DOCUMENT_CATALOG.md` no lista PO-LEGAL-002 (titular jurídico) como dependencia, aunque `LEGAL_IMPLEMENTATION_PLAN.md` indica que el titular afecta a todos los documentos públicos | Documentation Update | Equipo de documentación legal | No (ya cubierto como criterio de entrada global en `LEGAL_IMPLEMENTATION_PLAN.md §6`) | Agregar PO-LEGAL-002 a la columna de dependencias de la fila Privacy Policy en el catálogo |

**Clasificación por tipo:**
- **Documentation Update** (5): AUDIT-001, AUDIT-002, AUDIT-003, AUDIT-004, AUDIT-006 — todos requieren editar texto ya existente en `docs/legal/` para restaurar coherencia interna, sin necesidad de nueva información técnica ni de una decisión de negocio nueva.
- **Governance Improvement** (1): AUDIT-005 — requiere definir una salvaguarda de proceso (el alcance y límite de esta documentación) que hoy no existe en ningún archivo.
- **Product Owner Decision** (0): ninguno de los 6 hallazgos es en sí mismo una decisión de negocio nueva — todos son inconsistencias o vacíos dentro de la documentación ya existente. (Distinto de las decisiones PO-LEGAL-001 a 006, que siguen abiertas por su cuenta en `LEGAL_PO_DECISION_GATE.md` y no forman parte de este informe de auditoría.)
- **Technical Validation** (0): ningún hallazgo requiere nueva verificación técnica — toda la evidencia citada ya proviene de descubrimiento técnico previamente completado (`AI_DATA_FLOW.md`, `BILLING_MODEL.md`).

## Orden recomendado

**Antes de redacción legal** (deben resolverse antes de iniciar la Fase C de `LEGAL_IMPLEMENTATION_PLAN.md`):
- AUDIT-001 — de lo contrario, PO-LEGAL-003 podría darse por resuelto de forma incompleta, y esa decisión es uno de los criterios de entrada explícitos a la Fase C.
- AUDIT-003 — de lo contrario, no queda claro si "Derechos del usuario" es un entregable de la Fase C o no.
- AUDIT-005 — es una salvaguarda de proceso que debería existir antes de que arranque cualquier redacción legal, no después.

**Antes de implementación:**
- Ninguno de los 6 hallazgos requiere resolución específicamente en esta ventana. Todos son internos a `docs/legal/` y no involucran código, flujos de producto ni la Fase D de `LEGAL_IMPLEMENTATION_PLAN.md`.

**Puede resolverse posteriormente:**
- AUDIT-002 — es un problema de navegación/índice, no de contenido sustantivo.
- AUDIT-004 — es una referencia desactualizada de bajo impacto; la información correcta ya existe en otro documento (`AI_DATA_FLOW.md`).
- AUDIT-006 — ya está cubierto en la práctica por el criterio de entrada global de `LEGAL_IMPLEMENTATION_PLAN.md §6`; es una omisión de completitud, no un vacío real de cobertura.

---

*Este plan no cierra ningún hallazgo ni ninguna decisión. El campo "Estado" de cada AUDIT-ID se actualiza en `LEGAL_AUDIT_REPORT.md` únicamente cuando el trabajo correspondiente se haya hecho, en un ciclo posterior con aprobación explícita.*
