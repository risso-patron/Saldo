# PLAN-NORM-001 — Plan de Normalización Documental

**Tipo**: plan de acción para aprobación. **No ejecuta nada por sí mismo.**
**Fecha**: 2026-08-06
**Depende de**: `docs/governance/GOV-001-jerarquia-documental-de-producto.md` (aprobado conceptualmente, con el ajuste de §2.4 ya incorporado).
**Alcance**: exclusivamente cambios de documentación. Ningún ítem de este plan modifica código, tests, ni abre un ciclo `openspec/`.
**Qué requiere**: aprobación explícita del Product Owner, ítem por ítem o en bloque, antes de ejecutar cualquier edición.

## Principio rector

> **Una decisión del Product Owner autoriza la evolución del producto, pero solo se convierte en la nueva fuente de verdad cuando queda normalizada en la documentación soberana correspondiente.** (GOV-001 §2.4, ajustado)

Este plan es el mecanismo de esa normalización para las decisiones ya autorizadas por el PO durante `metas-exposicion` y durante la revisión de GOV-001. No autoriza nada nuevo — transcribe a los documentos soberanos lo que el PO ya decidió.

---

## Bloque 1 — Normalización documental

Transcribir a la documentación soberana decisiones **ya tomadas y aprobadas**, sin contenido nuevo. Cada ítem cita su fuente de autorización.

| # | Documento a editar | Qué se agrega/corrige | Fuente de autorización |
|---|---|---|---|
| **N-1** | *(nuevo)* `docs/product-decisions/PDP-001-claridad-financiera.md` | Depositar el texto íntegro de PDP-001 como documento institucional — verbatim, tal como lo entregó el PO en esta conversación, con metadata de estado/versión/fecha de incorporación. | El PO ya lo entregó completo; esta acción solo lo deposita, no lo redacta. |
| **N-2** | `Saldo Product Blueprint.dc.html` §02 (mapa de superficies) | Agregar Metas con su descripción de acceso: *"se llega desde el Dashboard y desde ⌘K, sin destino de navegación propio (R-08)"*. | `design.md:26-36` (aprobado, PO 2026-08-06) |
| **N-3** | `Saldo Product Blueprint.dc.html` §02 | Agregar `planificacion` y `herramientas` con su acceso ya documentado, o precisar el encabezado `:71` para que no reclame completitud sobre superficies transitorias — el PO elige cuál de las dos variantes. | `integration-debt.md:14,31` (ya documentado, sin decisión nueva) |
| **N-4** | `docs/product-master/00-STATE.md` | Entrada tipo PM-RECON con la ratificación de la vista `metas` como superficie oficial, molde de PM-RECON-003. | `design.md:105` (obligación contraída y no cumplida) |
| **N-5** | `Saldo Design Constitution.dc.html:478` y `Saldo Dashboard.dc.html:147` | Corregir "≤ 7 destinos" para que ambos textos digan el tope real de 4 (R-08), sin ofrecer slots inexistentes. | `design.md:98,104` — el ciclo ya decidió no enmendar R-08; esto solo alinea el texto con esa decisión. |
| **N-6** | `docs/design/integration-debt.md` | Filas nuevas de trazabilidad para C-02, C-03, C-05, C-06, C-10 (GOV-001 §1) — registrar, no resolver. | Rol ya establecido del archivo (`:5-8`) |
| **N-7** | `docs/product-master/14-gamificacion.md:88-91` y `00-STATE.md:635` | Corregir la redacción de "no usa… ni confeti" (afirmación de hecho, hoy falsa) a una declaración normativa que remita a la deuda abierta (`integration-debt.md:38`). No reabre la doctrina de PM-RECON-003. | `GoalManager.jsx:4,65` (hecho verificado) + ticket E2 ya existente |

**N-1 es prerrequisito de N-2 a N-7 solo en el sentido de trazabilidad** (una vez depositado, las demás entradas pueden citarlo por archivo:línea en vez de "heredado, no verificable") — no bloquea técnicamente al resto.

## Bloque 2 — Correcciones de vocabulario (documentación únicamente)

Los documentos de diseño usan hoy palabras del vocabulario prohibido (`docs/product-master/04-ux-manifesto.md:16-22`: Analytics, Insights, Planning, Import AI, OCR, CSV, JSON) como nombres de superficie. Este bloque corrige **el texto de los documentos de diseño**, no el código ni la interfaz visible al usuario — eso es Bloque 3.

| # | Documento a editar | Qué dice hoy | Corrección propuesta | Origen del término de reemplazo |
|---|---|---|---|---|
| **V-1** | `Saldo Dashboard.dc.html:50,235` (rótulo de navegación en el mockup) | `Insights` | `Ideas` (o *"Ideas sobre tu plata"* en contextos donde el copy completo aplica) | **No es un término inventado en este plan.** Ya está en PDP-001 §4.3 (*"se mantiene el concepto 'Ideas sobre tu plata'"*, pendiente de verificarse contra N-1 una vez depositado) y en el documento de roadmap que el PO entregó antes de PDP-001 (*"Renombrar conceptual o visualmente 'Insights'... SALDO utiliza lenguaje humano"*). |
| **V-2** | `Saldo Product Blueprint.dc.html:101` (nombre de superficie del núcleo) | *"Insights — el espejo"* | *"Ideas — el espejo"* (se conserva el subtítulo poético, solo cambia el nombre prohibido) | Mismo origen que V-1. |
| **V-3** | `Saldo Product Blueprint.dc.html:113` (superficie Importación) | *"CSV / banco…"* | A definir — no es un rótulo visible al usuario en navegación (es nombre interno de sección del Blueprint), prioridad menor. Requiere que el PO confirme si aplica la misma sustitución conceptual o si el uso técnico interno de "CSV" en este contexto está permitido. | Sin candidato ya aprobado — **requiere decisión del PO**, a diferencia de V-1/V-2. |

**Explícitamente fuera de este bloque**: el rótulo real en `src/components/ds/dsNavItems.js:17` (`label: 'Insights'`) sigue siendo "Insights" en el producto hasta que se ejecute el Bloque 3 — corregir el documento de diseño primero evita que trabajo futuro (incluido `dashboard-claridad`, que va a tocar navegación) siga heredando el nombre incorrecto de su propia fuente de verdad.

## Bloque 3 — Futuras evoluciones funcionales (NO se ejecutan en este plan)

Se listan para que la secuencia sea visible y nada se pierda — **ningún ítem de este bloque se toca ahora**. Todos requieren su propio ciclo (ticket, `sdd-propose`, o ambos).

| # | Qué implica | Por qué no ahora |
|---|---|---|
| **F-1** | Cambiar el rótulo real en `dsNavItems.js`, más cualquier i18n/copy asociado y sus tests. | Consecuencia funcional de V-1/V-2. Ticket propio, independiente de `dashboard-claridad` (ya recomendado en GOV-001 §4). |
| **F-2** | Quitar `react-confetti`/`TrophyWebP` de `GoalManager` (ticket E2). | Ya registrado como deuda con ticket propio, sin priorizar (`integration-debt.md:38`). |
| **F-3** | Decidir si el Dashboard puede crecer por PDP-001 o solo por evidencia de uso (C-06). | Es la pregunta de más alto nivel para `dashboard-claridad` — GOV-001 recomienda decidirla primero, antes de C-03 y C-02. |
| **F-4** | Decidir cifra protagonista vs. trío de cifras (C-03). | Toca una regla inquebrantable; requiere decisión explícita, no se resuelve por default de código. |
| **F-5** | Decidir contenido definitivo del Dashboard (C-02). | Es el objeto mismo del `sdd-propose` de `dashboard-claridad`, explícitamente pospuesto por el PO. |
| **F-6** | Resolver la contradicción de contraste `tertiary` <14px (C-08). | Abierta desde 2026-07-17, toca una regla potencialmente bloqueante (R-09), sin relación directa con este cierre. |
| **F-7** | Completar la fila de "arquitectura emocional" de Metas en el Blueprint §03 (6 columnas). | Ninguna de las seis columnas está decidida en ningún artefacto — rellenarlas sería inventar producto (GOV-001 §3, D-1). |

---

## Qué NO hace este plan

- No modifica ningún documento todavía — cada ítem de los Bloques 1 y 2 queda pendiente de aprobación.
- No decide V-3 (nombre de reemplazo de "CSV") — lo deja explícitamente para el PO.
- No ejecuta ningún ítem del Bloque 3.
- No abre `openspec/` ni propone diseño técnico de `dashboard-claridad`.

## Secuencia de ejecución propuesta, una vez aprobado

1. N-1 (depositar PDP-001) — desbloquea que N-2 a N-7 y V-1/V-2 citen su fuente con archivo:línea real en vez de "heredado".
2. N-2 a N-7 en un solo ticket documental (molde PM-RECON-003).
3. V-1, V-2 (vocabulario en documentos de diseño) — puede ir en el mismo ticket que el Bloque 1, o separado; ambas variantes son razonables.
4. V-3 — pendiente de la decisión del PO sobre el reemplazo de "CSV".
5. Bloque 3 queda fuera de este cierre — cada ítem se retoma en su propio momento (F-3/F-4/F-5 son, en ese orden, la secuencia que GOV-001 recomienda antes de retomar `sdd-propose` de `dashboard-claridad`).

---

**Estado**: pendiente de aprobación del Product Owner. Ningún documento fuente (Constitution, Blueprint, Product Master, screen specs) fue modificado para preparar este plan.
