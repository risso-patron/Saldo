# GOV-002 Specification — OpenSpec Change Registry

**Alcance de este documento**: especifica el comportamiento verificable del Registry (`openspec/changes/INDEX.md`, todavía no creado). No modifica convenciones existentes, no resuelve `state.yaml`, no crea el archivo del Registry — eso queda para la fase de creación, posterior a esta spec.
**Depende de**: `docs/governance/PROP-003-openspec-change-registry.md` (proposal, aprobado — nombre, ubicación, granularidad, autoridad, actualización y exclusión de `state.yaml` ya ratificados; esta spec no los vuelve a decidir, los traduce a comportamiento verificable).

**Regla aplicada (RETRO-001, ratificada)**: RFC 2119 (MUST/MUST NOT/SHOULD/MAY) + Given/When/Then por requirement, mismo formato que se usa para specs de capabilities de producto — un documento manualmente mantenido también tiene comportamiento auditable (¿se actualizó cuando correspondía? ¿tiene los campos obligatorios?), aunque no sea código ejecutable.

## Purpose

Definir qué debe contener cada entrada del Registry, qué estados representa (y cuáles deliberadamente no), cómo se relaciona con los artefactos SDC primarios, y en qué transiciones exactas debe actualizarse — de forma que "actualizar el Registry" sea una acción verificable en cada gate, no una intención vaga.

## Requirements

### Requirement: Propósito exacto del Registry

El Registry MUST funcionar exclusivamente como índice de visibilidad operativa cross-capability. El Registry MUST NOT contener contenido de producto, filosofía, detalle de QA, diseño de investigación, decisiones de producto, ni detalles de implementación (heredado de `PROP-003` §3, sin cambios).

#### Scenario: Consulta rápida de estado
- GIVEN el Registry existe y está actualizado
- WHEN alguien necesita saber qué capabilities existen y su estado
- THEN encuentra la respuesta en un único archivo, sin abrir artefactos individuales

### Requirement: Estructura mínima de cada entrada

Cada entrada del Registry MUST tener, como mínimo, estas columnas: **Change**, **Capability**, **Estado**, **Último movimiento** (fecha), **Evidencia primaria** (link a un artefacto SDC real). La columna **Bloqueado por** MUST estar presente únicamente cuando el Estado es `Waiting` (ver Requirement "Comportamiento para WAITING") — MAY omitirse o quedar vacía en cualquier otro estado.

#### Scenario: Entrada completa para una capability activa
- GIVEN una capability con artefactos SDC existentes
- WHEN se agrega o actualiza su entrada en el Registry
- THEN la fila tiene Change, Capability, Estado, fecha del último movimiento, y un link funcional a su evidencia primaria

### Requirement: Estados que el Registry debe representar

El Registry MUST usar exclusivamente este vocabulario de estados, y ninguno fuera de él: **No iniciada**, **En progreso**, **Waiting**, **Completed**, **Archivada**.

#### Scenario: Vocabulario cerrado
- GIVEN cualquier entrada del Registry
- WHEN se le asigna un Estado
- THEN ese Estado es uno de los cinco valores definidos — no una fase interna del SDC citada directamente (ej. nunca "Spec" o "Design" como valor de Estado)

### Requirement: Fases/estados que NO necesitan representación

El Registry MUST NOT representar las fases internas del DAG SDC (Discovery, Proposal, Spec, Design, Tasks, Implementation, QA) como estados distinguibles entre sí. Todas colapsan al valor único **En progreso**. El objetivo es visibilidad operativa — "¿está en marcha, bloqueada, o terminada?" — no replicar el DAG completo, que ya vive en los artefactos SDC mismos y, si se adopta, en `state.yaml` por-change.

#### Scenario: Una capability en Design no se distingue de una en Tasks
- GIVEN dos capabilities, una en fase Design y otra en fase Tasks, ninguna bloqueada
- WHEN se consulta el Registry
- THEN ambas muestran Estado `En progreso` — el Registry no distingue en qué fase interna exacta está cada una

### Requirement: Relación entre el Registry y el artefacto SDC primario

El campo "Evidencia primaria" MUST enlazar siempre al artefacto SDC más avanzado que exista para esa capability en el momento de la actualización (ej. si solo existe un Discovery, enlaza al Discovery; si ya existe un `*-COMPLETED.md`, enlaza a ese). El Registry MUST NOT copiar ni resumir el contenido de esos artefactos — solo enlazarlos (heredado de `PROP-003` §1, sin cambios).

#### Scenario: La evidencia primaria avanza junto con la capability
- GIVEN una capability que pasa de tener solo un Discovery a tener también un Proposal
- WHEN se actualiza su entrada
- THEN el link de "Evidencia primaria" pasa a apuntar al artefacto más nuevo, no al Discovery

### Requirement: Regla de precedencia ante inconsistencia

Si el Registry contradice a un artefacto SDC primario, el artefacto primario MUST prevalecer, y el Registry MUST considerarse desactualizado — nunca al revés. El Registry MUST NOT citarse como evidencia de estado en un Decision Gate ni en un PDP (heredado de `PROP-003` §6, sin cambios).

#### Scenario: Desacuerdo entre el Registry y un COMPLETED
- GIVEN el Registry muestra `En progreso` para una capability que ya tiene `*-COMPLETED.md`
- WHEN alguien detecta la discrepancia
- THEN el `*-COMPLETED.md` es la verdad, y el Registry se corrige — la discrepancia no es motivo para dudar del `*-COMPLETED.md`

### Requirement: Eventos que obligan a actualizar el Registry

El Registry MUST actualizarse en, y únicamente en, estas transiciones: creación de una capability nueva (primera entrada), primer artefacto SDC de una capability antes sin ninguno (pasa de no existir a `No iniciada`/`En progreso`), entrada a `Waiting`, salida de `Waiting`, Product Acceptance, `Completed`, y Archive. El Registry MUST NOT requerir actualización en cada micro-transición interna del DAG (Proposal→Spec, Spec→Design, etc. — cubiertas por el Requirement anterior).

#### Scenario: Cierre de una capability dispara la actualización
- GIVEN una capability recibe Product Acceptance
- WHEN se escribe su `*-COMPLETED.md`
- THEN la actualización del Registry ocurre como parte del mismo gate, no como una tarea aparte agendada para después

### Requirement: Comportamiento para `Waiting`

Cuando el Estado es `Waiting`, la entrada MUST incluir la columna "Bloqueado por" con una referencia concreta y verificable (link al artefacto o decisión que la bloquea — ej. un Product Evidence sin Decision Gate resuelto, o una decisión pendiente del PO). El Registry MUST NOT usar `Waiting` como estado genérico de "no sé en qué está" — solo cuando existe un bloqueo identificable y citable.

#### Scenario: Waiting con bloqueo citable
- GIVEN una capability en `Waiting` por falta de evidencia de usuarios
- WHEN se consulta su entrada
- THEN "Bloqueado por" enlaza al Product Evidence o a la síntesis de investigación pendiente, no queda como texto libre sin referencia

### Requirement: Comportamiento para `Completed`

Cuando el Estado es `Completed`, "Evidencia primaria" MUST enlazar al `*-COMPLETED.md` de esa capability (o equivalente de cierre formal). El Registry MUST NOT conservar en esa fila referencias a artefactos de fases intermedias ya superadas (Discovery, Proposal, etc.) como si fueran la evidencia vigente — el link apunta al cierre, no al recorrido.

#### Scenario: Entrada Completed apunta al cierre, no al historial
- GIVEN una capability con Product Acceptance otorgada
- WHEN se consulta su entrada
- THEN "Evidencia primaria" es el `*-COMPLETED.md`, no el `*-discovery.md` ni el `*-proposal.md` de esa misma capability

### Requirement: Capabilities sin todos los artefactos SDC todavía

Una capability con artefactos parciales (ej. solo Discovery, sin Proposal todavía) MUST tener entrada en el Registry igual que cualquier otra — el Estado es `En progreso` o `Waiting` según corresponda, y "Evidencia primaria" enlaza al artefacto más avanzado que exista, sin inventar ni proyectar los artefactos faltantes.

#### Scenario: Capability con solo Discovery y Product Evidence
- GIVEN una capability que tiene Discovery y Product Evidence pero no Proposal
- WHEN se consulta su entrada
- THEN el Estado refleja su situación real (`Waiting`, si depende de evidencia pendiente) y "Evidencia primaria" enlaza al artefacto más reciente — no aparece como si tuviera un Proposal que no existe

### Requirement: Changes archivados

Cuando un change se archive (`openspec/changes/{change}/` → `openspec/changes/archive/YYYY-MM-DD-{change}/`, según `openspec-convention.md`), su entrada MUST pasar a Estado `Archivada`, con el link de "Evidencia primaria" actualizado a la nueva ruta dentro de `archive/`. El Registry MAY agrupar las entradas archivadas en su propia sección, separada de las activas, para no diluir la vista operativa del trabajo en curso.

#### Scenario: Archivado actualiza ruta y estado
- GIVEN una capability `Completed` cuyo change se archiva
- WHEN el archivado ocurre
- THEN la entrada pasa a `Archivada` y su link apunta a la ruta dentro de `openspec/changes/archive/`, no a la ruta activa original

---

**Estado**: **ratificada e implementada**. `openspec/changes/INDEX.md` creado y verificado (PASS). Ver [`GOV-002-verify-report.md`](GOV-002-verify-report.md) y [`GOV-002-COMPLETED.md`](GOV-002-COMPLETED.md).
