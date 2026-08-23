# Legal Documentation Audit Report

## Resultado general

**Estado:** NEEDS REVIEW

Se auditaron los 8 documentos existentes en `docs/legal/` en el momento de esta revisión (`README.md`, `LEGAL_ARCHITECTURE.md`, `LEGAL_DOCUMENT_CATALOG.md`, `LEGAL_CONTRADICTIONS.md`, `LEGAL_DECISIONS_PENDING.md`, `AI_DATA_FLOW.md`, `BILLING_MODEL.md`, `LEGAL_PO_DECISION_GATE.md`, `LEGAL_IMPLEMENTATION_PLAN.md`). Se encontraron 6 hallazgos de consistencia documental. Ninguno modifica código, términos públicos, ni resuelve decisiones — este informe solo registra lo encontrado.

## Hallazgos

### AUDIT-001

**Documento:** `LEGAL_DECISIONS_PENDING.md` vs. `LEGAL_PO_DECISION_GATE.md`

**Hallazgo:** La decisión PO-LEGAL-003 está descrita de forma distinta en cada documento. En `LEGAL_DECISIONS_PENDING.md` se presenta como una pregunta de hecho técnico sin opciones ("¿Cuál es el proveedor real?"), a resolver por confirmación directa del equipo técnico. En `LEGAL_PO_DECISION_GATE.md` la misma decisión se reformula como una elección estratégica de negocio con 3 opciones (mantener solo Groq / arquitectura multi-proveedor / proveedores preparados pero no activos).

**Evidencia:**
- `LEGAL_DECISIONS_PENDING.md:47`: *"Opciones: No se listan opciones — es una pregunta de hecho técnico, no de decisión de negocio."*
- `LEGAL_PO_DECISION_GATE.md`, sección "Decisión PO-LEGAL-003 — Arquitectura de IA definitiva", tabla de opciones con 3 alternativas estratégicas.
- `LEGAL_DOCUMENT_CATALOG.md:10` refuerza la lectura de `LEGAL_DECISIONS_PENDING.md`: lista la dependencia de Privacy Policy como "PO-LEGAL-003 (proveedor IA)", en singular y como dato a confirmar, no como decisión de arquitectura.

**Impacto:** Si el Product Owner resuelve PO-LEGAL-003 leyendo un solo documento, puede quedar sin resolver la pregunta planteada en el otro. Esta decisión es uno de los criterios de entrada a la Fase C de `LEGAL_IMPLEMENTATION_PLAN.md §6` — una resolución parcial (solo el hecho técnico, sin la decisión de arquitectura, o viceversa) podría dar por cerrado el criterio de entrada sin que realmente lo esté.

**Acción recomendada:** Reconciliar ambos documentos para que PO-LEGAL-003 tenga una única formulación (hecho + decisión de arquitectura, o separarla en dos IDs distintos) antes de que el PO la resuelva.

---

### AUDIT-002

**Documento:** `README.md`

**Hallazgo:** La tabla "Archivos de esta carpeta" de `README.md` solo lista 4 de los 8 documentos que existen hoy en `docs/legal/`. No menciona `AI_DATA_FLOW.md`, `BILLING_MODEL.md`, `LEGAL_PO_DECISION_GATE.md` ni `LEGAL_IMPLEMENTATION_PLAN.md`.

**Evidencia:** `README.md:16-21` — la tabla incluye únicamente `LEGAL_ARCHITECTURE.md`, `LEGAL_DOCUMENT_CATALOG.md`, `LEGAL_CONTRADICTIONS.md` y `LEGAL_DECISIONS_PENDING.md`. Contraste: listado real de archivos en `docs/legal/` al momento de esta auditoría (9 archivos, incluyendo este informe).

**Impacto:** `README.md` se presenta a sí mismo como el mapa de la carpeta ("propósito de esta carpeta"), pero describe menos de la mitad de su contenido actual. Alguien que llegue a la carpeta guiándose solo por el README no se enteraría de que existen el Decision Gate, el Implementation Plan, ni los dos documentos de descubrimiento técnico.

**Acción recomendada:** Actualizar la tabla de `README.md` para reflejar los 9 archivos actuales (incluyendo este informe de auditoría).

---

### AUDIT-003

**Documento:** `LEGAL_DOCUMENT_CATALOG.md` vs. `LEGAL_IMPLEMENTATION_PLAN.md`

**Hallazgo:** `LEGAL_DOCUMENT_CATALOG.md` registra "Derechos del usuario" como una fila propia del catálogo, con prioridad 🟠 Alta y dependencia de PO-LEGAL-001. Sin embargo, el orden de redacción de la Fase C en `LEGAL_IMPLEMENTATION_PLAN.md` no la incluye como entregable — la lista de 6 documentos a redactar salta de Retention & Deletion Policy a "Ajustes de descargo financiero" sin mencionar Derechos del usuario.

**Evidencia:**
- `LEGAL_DOCUMENT_CATALOG.md:18`: fila "Derechos del usuario", 🟠 Alta, dependencia PO-LEGAL-001.
- `LEGAL_IMPLEMENTATION_PLAN.md`, sección "4. Orden previsto de implementación → Fase C", lista de 6 ítems que no incluye "Derechos del usuario" como ítem propio.

**Impacto:** No queda trazable si "Derechos del usuario" se redacta como documento/sección independiente o si su contenido se asume implícitamente dentro de la actualización de Privacy Policy (el catálogo la describe como "Parcial — existe como sección dentro de `privacy.html §6`", lo que sugiere esto último, pero `LEGAL_IMPLEMENTATION_PLAN.md` no lo dice explícitamente).

**Acción recomendada:** Aclarar en `LEGAL_IMPLEMENTATION_PLAN.md` si "Derechos del usuario" se produce como parte del paso 2 (Privacy Policy) de la Fase C, o si merece un paso propio.

---

### AUDIT-004

**Documento:** `LEGAL_ARCHITECTURE.md`

**Hallazgo:** El diagrama del "Modelo legal del producto" describe al proveedor de IA como "proveedor exacto sin confirmar, ver LEG-002" — una formulación que quedó desactualizada después del descubrimiento técnico posterior (`AI_DATA_FLOW.md`, `LEG-005`), que sí confirmó una llamada real a Groq y descartó Gemini/Anthropic/OpenAI como proveedores activos verificados.

**Evidencia:**
- `LEGAL_ARCHITECTURE.md:59-61`: *"Proveedor(es) de IA (categorización opcional, bajo consentimiento just-in-time — proveedor exacto sin confirmar, ver LEG-002)"*.
- `AI_DATA_FLOW.md §4` y `LEGAL_CONTRADICTIONS.md` LEG-005: Groq confirmado mediante llamada real; Gemini/Anthropic sin llamada real verificada.

**Impacto:** Bajo — no bloquea ninguna decisión, pero el documento de arquitectura ya no refleja el estado de conocimiento más preciso disponible en el propio `docs/legal/`.

**Acción recomendada:** Actualizar la referencia de `LEGAL_ARCHITECTURE.md §4` para citar LEG-005 junto a LEG-002, y precisar que existe confirmación parcial (Groq) aunque la decisión de arquitectura definitiva (PO-LEGAL-003) siga pendiente.

---

### AUDIT-005

**Documento:** Todos los documentos de `docs/legal/`

**Hallazgo:** Ningún documento del conjunto incluye una nota que aclare que esta documentación es un trabajo de arquitectura/descubrimiento interno, no un dictamen legal, y que no reemplaza la revisión de un abogado matriculado antes de publicar cualquier documento legal final. El objetivo de auditoría #3 de esta tarea pide expresamente verificar que la documentación "no reemplaza asesoramiento jurídico profesional" — no se encontró ningún texto que lo declare.

**Evidencia:** Búsqueda de esa aclaración en los 8 documentos auditados: sin resultados. `README.md` distingue "arquitectura legal" de "documentos legales finales" (líneas 7-12), pero en términos de proceso interno (qué es vinculante para el usuario), no en términos de quién debe validar el contenido jurídico antes de publicarlo.

**Impacto:** Si estos documentos (en particular `LEGAL_PO_DECISION_GATE.md` o `LEGAL_IMPLEMENTATION_PLAN.md`) se comparten o se usan como base directa de redacción sin que quede explícito este límite, existe riesgo de que se interprete el análisis como suficiente por sí solo para publicar contenido legal vinculante, sin revisión profesional adicional.

**Acción recomendada:** Agregar una nota explícita (por ejemplo, en `README.md` o en `LEGAL_ARCHITECTURE.md`) aclarando que esta documentación es un insumo de arquitectura/descubrimiento y que la redacción final de cualquier documento vinculante debe validarse con asesoría legal profesional antes de publicarse.

---

### AUDIT-006

**Documento:** `LEGAL_DOCUMENT_CATALOG.md` vs. `LEGAL_IMPLEMENTATION_PLAN.md`

**Hallazgo:** La fila de Privacy Policy en `LEGAL_DOCUMENT_CATALOG.md` lista como dependencias "PO-LEGAL-001 (mercado), PO-LEGAL-003 (proveedor IA), LEG-002, LEG-003", pero no incluye PO-LEGAL-002 (titular jurídico) — pese a que `LEGAL_IMPLEMENTATION_PLAN.md §3` declara que la decisión de titular jurídico afecta a "todos los documentos públicos", lo que incluiría a Privacy Policy.

**Evidencia:**
- `LEGAL_DOCUMENT_CATALOG.md:10` (fila Privacy Policy, columna Dependencias).
- `LEGAL_IMPLEMENTATION_PLAN.md`, tabla de la sección 3: fila "Titular jurídico → Todos los documentos públicos".

**Impacto:** Bajo — PO-LEGAL-002 ya figura como criterio de entrada global a la Fase C en `LEGAL_IMPLEMENTATION_PLAN.md §6`, por lo que su ausencia puntual en esa fila del catálogo no deja ningún documento sin cubrir en la práctica. Es una omisión de completitud, no un vacío de cobertura real.

**Acción recomendada:** Agregar PO-LEGAL-002 a la lista de dependencias de la fila Privacy Policy en `LEGAL_DOCUMENT_CATALOG.md` para que sea coherente con `LEGAL_IMPLEMENTATION_PLAN.md`.

---

*Este informe no corrige ninguno de los hallazgos listados. Corresponde a un ciclo de revisión posterior, con aprobación explícita, decidir si y cómo se resuelven.*
