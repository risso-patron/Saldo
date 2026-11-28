# IMP-002B Technical Design — Basic Import Traceability

**Estado:** Diseño técnico / no aprobado para implementación  
**Fecha:** 2026-08-23  
**Base:** `docs/product-decisions/IMP-002B-DISCOVERY.md`  
**Alcance:** frontend read-only sobre entidades existentes  

---

## 1. Objetivo

Mostrar trazabilidad básica de importaciones dentro del flujo existente de SALDO, usando la foundation implementada en IMP-002A.

El usuario debe poder responder, sin DevTools ni soporte técnico:

- qué archivos importó;
- cuándo se importaron;
- cuántos movimientos creó cada importación;
- cuál fue el impacto financiero del lote;
- qué movimientos del historial vinieron de una importación.

Este diseño **no implementa rollback**, **no crea nuevas entidades** y **no cambia el schema**.

---

## 2. Restricciones de diseño

Obligatorio:

- no crear tablas nuevas;
- no crear RPC nuevas;
- no modificar `import_batches`;
- no modificar schema de `transactions`;
- no implementar rollback/revert/delete de batch;
- no crear una nueva sección principal de navegación;
- mantener Supabase como source of truth;
- mantener compatibilidad con movimientos históricos sin `import_batch_id`.

Permitido en futura implementación:

- consultas `SELECT` contra tablas existentes;
- componentes frontend read-only;
- props nuevas entre `App.jsx`, `ImportManager.jsx` e `Historial.jsx`;
- filtros UI locales usando `importBatchId` ya presente en movimientos;
- badges/labels de origen importado.

---

## 3. Arquitectura propuesta

### 3.1 Ubicación primaria

```text
Herramientas
  └─ Importar Transacciones
       └─ Importaciones recientes
```

La lista de importaciones recientes debe vivir en el flujo existente de importación, no como navegación principal nueva.

Motivo:

- `ImportManager` ya es el punto de entrada del usuario para CSV/TXT;
- el usuario que acaba de importar sigue en ese contexto;
- se evita aumentar la navegación principal;
- mantiene IMP-002B como MVP read-only.

### 3.2 Ubicación secundaria

```text
Movimientos / Historial
  └─ fila de movimiento
       └─ badge/detalle: Importado
```

La metadata de importación en Historial debe ser discreta. El objetivo no es convertir Historial en una pantalla técnica, sino dar contexto cuando el usuario revisa movimientos.

### 3.3 Diagrama de datos

```text
ImportManager
  |
  | SELECT import_batches
  v
Importaciones recientes
  |
  | seleccionar/ver lote
  v
App state: selectedImportBatchId
  |
  v
Historial
  |
  | filtra allTransactions por importBatchId existente
  v
Movimientos del lote
```

Alternativa para detalle local:

```text
ImportManager
  |
  | SELECT transactions WHERE import_batch_id = batch.id
  v
Detalle read-only del batch
```

Recomendación MVP: preferir navegación a Historial con filtro local si App ya tiene `allTransactions` cargado. Usar query directa a `transactions` solo si el detalle del batch necesita mostrar movimientos sin depender del filtro global de período.

---

## 4. Archivos frontend afectados

### 4.1 `src/features/import/ImportManager.jsx`

Cambios esperados:

- renderizar sección read-only “Importaciones recientes” debajo o después del flujo actual de importación;
- recibir por props, o consultar mediante hook, la lista de batches recientes;
- mostrar estado loading/error/empty;
- mostrar cards/resumen de batch;
- disparar callback `onViewImportBatch(batchId)` al seleccionar “Ver movimientos”.

No debe:

- borrar batches;
- revertir movimientos;
- modificar `import_batches`;
- agregar lógica de recuperación destructiva;
- bloquear el flujo actual de importación si falla la carga del historial de imports.

### 4.2 `src/App.jsx`

Cambios esperados:

- mantener estado UI del batch seleccionado, por ejemplo `selectedImportBatchId`;
- pasar `onViewImportBatch` a `ImportManager`;
- al seleccionar un batch:
  - setear filtro de batch;
  - navegar a `activeTab = 'movimientos'`;
  - opcionalmente limpiar filtro de período para evitar que el lote parezca incompleto por estar fuera del mes seleccionado.

No debe:

- crear nueva pestaña principal;
- cambiar el modelo de source of truth;
- duplicar estado financiero.

### 4.3 `src/components/Historial/Historial.jsx`

Cambios esperados:

- aceptar un filtro opcional `initialImportBatchFilter` o `importBatchFilter`;
- filtrar movimientos por `item.importBatchId === selectedImportBatchId` cuando aplique;
- mostrar chip/filtro activo: “Importación seleccionada”;
- permitir limpiar ese filtro;
- pasar metadata mínima a `ExpansionDetalle`.

Cuidado:

- Historial recibe actualmente `filteredIncomes`/`filteredExpenses` desde App, ya filtrados por período.
- Si el objetivo es ver todos los movimientos de un batch, App debería pasar una variante no recortada por período cuando el filtro de import batch esté activo, o limpiar el período antes de navegar.
- Para MVP, la opción más simple es limpiar `selectedYear`/`selectedMonth` al abrir un batch desde ImportManager.

### 4.4 `src/components/Historial/ExpansionDetalle.jsx`

Cambios esperados:

- mostrar metadata ligera si `movement.importBatchId` existe:
  - “Importado desde archivo” si se puede resolver batch;
  - fecha `importedAt`;
  - source legible: CSV/TXT.

Si no se dispone del nombre del archivo en Historial, mostrar solo:

```text
Importado el [fecha]
```

No debe mostrar hash completo ni información técnica por defecto.

### 4.5 `src/components/ds/FilaMovimiento.jsx`

Opción A — no tocar para MVP:

- mantener el badge “Importado” en `ExpansionDetalle`, no en la fila principal.

Opción B — cambio aditivo si UX lo aprueba:

- agregar prop opcional `badge` o `originLabel`;
- renderizar texto corto en columna media sin romper `category`/fecha.

Recomendación: **no tocar `FilaMovimiento.jsx` en el primer MVP** para reducir riesgo visual y mantener la trazabilidad en la expansión.

### 4.6 Nuevo hook o servicio frontend opcional

Archivo propuesto:

```text
src/hooks/useImportBatches.js
```

Responsabilidad:

- ejecutar consulta read-only a `public.import_batches`;
- exponer `{ batches, loading, error, refresh }`;
- mapear snake_case → camelCase;
- no mutar datos.

Este archivo sería nuevo, pero no crea API nueva; solo encapsula SELECT Supabase existente.

Alternativa:

- consultar dentro de `ImportManager.jsx`.

Recomendación: crear hook separado en futura implementación para testabilidad y separación de responsabilidades.

### 4.7 Tests afectados/propuestos

- `src/features/import/ImportManager.test.jsx`
- `src/components/Historial/Historial.test.jsx`
- `src/components/Historial/ExpansionDetalle.test.jsx` si no existe o si se decide aislarlo
- `src/hooks/useImportBatches.test.js` si se crea hook separado
- `src/App.test.jsx` solo si ya existe infraestructura práctica para navegación entre tabs; si no, cubrir el contrato en componentes más pequeños.

---

## 5. Componentes existentes reutilizables

### Design system

- `src/components/ds/Button.jsx`
  - CTA “Ver movimientos”.
- `src/components/ds/Card.jsx`
  - contenedor de card de import batch si encaja con estilo actual.
- `src/components/ds/SkeletonBlock.jsx`
  - loading state de importaciones recientes.
- `src/components/ds/Sheet.jsx`
  - solo si se elige detalle de batch en sheet/modal; no requerido para MVP.
- `src/components/ds/Tabs.jsx`
  - no recomendado inicialmente; puede agregar complejidad innecesaria.

### Importación

- `ImportManager.jsx`
  - punto de montaje de “Importaciones recientes”.
  - ya conoce `importStats` e `importFileMeta`, pero la nueva sección debe leer desde Supabase para reflejar source of truth.

### Historial

- `Historial.jsx`
  - pantalla existente para movimientos.
- `ExpansionDetalle.jsx`
  - lugar natural para metadata del origen importado.
- `FilaDeslizable.jsx`
  - no requiere cambios para IMP-002B.
- `EstadoSinResultados.jsx`
  - reutilizable cuando un filtro de batch no encuentre movimientos.

### Utilidades

- `src/utils/formatters.js`
  - `formatCurrency` para totales del batch.
- `src/utils/movementGrouping.js`
  - fecha relativa si aplica.
- helpers locales simples para formatear:
  - source: `csv_import → CSV`, `txt_import → TXT`;
  - status: `completed → Importación completada`.

---

## 6. Flujo de datos actual

### 6.1 Importación actual post IMP-002A

```text
CSV/TXT seleccionado
  ↓
ImportManager parsea + preview
  ↓
ImportManager construye importMetadata
  ↓
App.jsx reenvía a addBulkTransactions
  ↓
useTransactions.addBulkTransactions detecta importMetadata
  ↓
Supabase RPC create_import_batch_with_transactions
  ↓
Supabase crea import_batches + transactions atómicamente
  ↓
useTransactions actualiza incomes/expenses locales con:
  - importBatchId
  - source
  - importedAt
```

### 6.2 Carga actual de movimientos

`useTransactions.js` ya mapea desde Supabase:

```js
importBatchId: row.import_batch_id || null
source: row.source || null
importedAt: row.imported_at || null
```

Por lo tanto, Historial puede distinguir movimientos importados sin query adicional, siempre que reciba los movimientos adecuados desde App.

### 6.3 Nueva lectura requerida para batch summaries

La UI de “Importaciones recientes” necesita leer `import_batches` directamente, porque esa metadata no viaja dentro de cada movement individual.

La lectura debe ser:

- read-only;
- limitada por usuario vía RLS y, opcionalmente, `.eq('user_id', user.id)`;
- ordenada por fecha descendente;
- acotada para MVP.

---

## 7. Consultas Supabase necesarias

### 7.1 Listar importaciones recientes

Consulta propuesta:

```js
supabase
  .from('import_batches')
  .select(`
    id,
    source,
    original_filename,
    file_size_bytes,
    file_sha256,
    movement_count,
    income_count,
    expense_count,
    income_total,
    expense_total,
    net_total,
    status,
    created_at,
    completed_at
  `)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(10)
```

Notas:

- RLS ya protege ownership, pero `.eq('user_id', user.id)` reduce ambigüedad y costo.
- No usar `.delete()`, `.update()`, `.upsert()`.
- No crear RPC para esto.

### 7.2 Obtener detalle de movimientos de un batch

Opción recomendada para MVP:

- no hacer query adicional;
- usar `allTransactions` ya cargadas en App/useTransactions;
- filtrar localmente por `importBatchId`.

Filtro:

```js
allTransactions.filter(tx => tx.importBatchId === selectedImportBatchId)
```

Opción alternativa si se decide mostrar detalle dentro de ImportManager:

```js
supabase
  .from('transactions')
  .select(`
    id,
    description,
    amount,
    currency,
    type,
    category,
    date,
    created_at,
    import_batch_id,
    source,
    imported_at
  `)
  .eq('user_id', user.id)
  .eq('import_batch_id', batchId)
  .order('date', { ascending: false })
```

Usar esta alternativa solo si la navegación a Historial no resuelve bien el caso.

### 7.3 Refresh después de importación exitosa

Después de una importación exitosa:

- `useTransactions` ya actualiza movimientos locales;
- la lista de batches debería refrescarse para mostrar el batch recién creado.

Opciones:

1. `ImportManager` llama `refreshImportBatches()` al completar `executeImport` exitoso.
2. `useImportBatches` escucha una prop `refreshKey` incrementada por App/ImportManager.
3. En MVP, llamar refresh explícito dentro del componente donde vive la lista.

No usar realtime todavía; sería complejidad fuera del alcance.

---

## 8. Diseño de componentes propuesto

### 8.1 `ImportBatchList`

Archivo sugerido:

```text
src/features/import/ImportBatchList.jsx
```

Props:

```ts
type ImportBatchListProps = {
  batches: ImportBatch[]
  loading: boolean
  error: Error | null
  onRetry: () => void
  onViewBatch: (batchId: string) => void
}
```

Responsabilidad:

- renderizar sección “Importaciones recientes”;
- manejar estados loading/error/empty;
- delegar card individual.

### 8.2 `ImportBatchCard`

Archivo sugerido:

```text
src/features/import/ImportBatchCard.jsx
```

Props principales:

```ts
type ImportBatchCardProps = {
  batch: ImportBatch
  onViewBatch: (batchId: string) => void
}
```

Contenido:

- archivo: `originalFilename || 'Archivo importado'`;
- fecha completada: `completedAt || createdAt`;
- movimientos: `movementCount`;
- composición: `${incomeCount} ingresos · ${expenseCount} gastos`;
- totales: ingresos, gastos, neto;
- status legible;
- CTA: “Ver movimientos”.

No incluir:

- botón “Revertir”;
- botón “Eliminar”;
- hash completo visible por defecto.

### 8.3 `useImportBatches`

Archivo sugerido:

```text
src/hooks/useImportBatches.js
```

Contrato:

```ts
type UseImportBatchesResult = {
  batches: ImportBatch[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}
```

Mapper:

```text
id → id
source → source
original_filename → originalFilename
file_size_bytes → fileSizeBytes
file_sha256 → fileSha256
movement_count → movementCount
income_count → incomeCount
expense_count → expenseCount
income_total → incomeTotal
expense_total → expenseTotal
net_total → netTotal
status → status
created_at → createdAt
completed_at → completedAt
```

### 8.4 Historial filter contract

Props posibles en `Historial`:

```ts
importBatchFilter?: string | null
onClearImportBatchFilter?: () => void
importBatchLabel?: string | null
```

Comportamiento:

- si `importBatchFilter` existe, filtrar incomes/expenses por `importBatchId`;
- mostrar chip: `Importación: [archivo o fecha]`;
- botón para limpiar filtro;
- estado sin resultados reutiliza `EstadoSinResultados` o una variante simple.

### 8.5 Metadata en `ExpansionDetalle`

Props adicionales posibles:

```ts
importBatch?: {
  id: string
  originalFilename: string | null
  source: string
  completedAt: string | null
} | null
```

Alternativa mínima:

- no pasar objeto batch;
- usar `movement.source` y `movement.importedAt`.

Copy sugerido:

```text
Origen: importado desde CSV el 23 ago 2026
```

Si existe filename:

```text
Origen: importado desde extracto.csv el 23 ago 2026
```

---

## 9. Estrategia de implementación incremental propuesta

### Paso 1 — Hook read-only

Crear `useImportBatches` con SELECT limitado a 10 batches recientes.

Criterio:

- loading/empty/error correcto;
- no mutaciones Supabase.

### Paso 2 — Lista en ImportManager

Agregar `ImportBatchList` debajo del bloque de importación.

Criterio:

- si no hay batches: “Todavía no hay importaciones registradas.”
- si hay batches: cards con resumen financiero.

### Paso 3 — Navegar a Historial con filtro

Desde card:

```text
Ver movimientos
  ↓
App set selectedImportBatchId
  ↓
activeTab = movimientos
  ↓
Historial filtra por importBatchId
```

Criterio:

- no nueva sección principal;
- se puede limpiar filtro;
- el usuario vuelve al historial normal.

### Paso 4 — Metadata ligera en detalle de movimiento

En `ExpansionDetalle`, mostrar origen importado si existe.

Criterio:

- movimientos manuales no muestran nada extra;
- movimientos importados muestran copy calmado.

---

## 10. Riesgos técnicos

### 10.1 Filtro por período en Historial

Riesgo:

- App pasa `filteredIncomes`/`filteredExpenses` según período global.
- Un batch con movimientos de otros meses puede verse incompleto.

Mitigación recomendada:

- al abrir un batch desde ImportManager, limpiar `selectedYear` y `selectedMonth`;
- mostrar chip de importación activa;
- no mezclar filtro de batch con filtro de mes en MVP.

### 10.2 Batches sin movimientos visibles localmente

Riesgo:

- batch existe en Supabase pero `allTransactions` local no tiene movimientos por carga parcial, error sync o datos antiguos.

Mitigación:

- mostrar estado “No encontramos movimientos visibles para este lote. Reintenta sincronizar.”;
- ofrecer `onRetrySync` existente si está disponible en Historial;
- no declarar pérdida de datos desde UI.

### 10.3 Movimientos antiguos sin metadata

Riesgo:

- usuarios esperan que importaciones previas aparezcan.

Mitigación:

- copy claro: “Se muestran importaciones registradas por SALDO desde la activación de trazabilidad.”
- no backfill en IMP-002B.

### 10.4 Exponer demasiado detalle técnico

Riesgo:

- hash, UUIDs y status internos pueden aumentar confusión.

Mitigación:

- UI principal humana;
- IDs/hash solo en detalle técnico colapsado o no visible en MVP.

### 10.5 Expectativa de rollback

Riesgo:

- ver un lote puede llevar al usuario a esperar “deshacer”.

Mitigación:

- no mostrar botón disabled “Revertir”;
- no prometer rollback en copy principal;
- documentar que rollback es IMP posterior.

### 10.6 Doble fuente visual

Riesgo:

- batches se leen por hook y movimientos por `useTransactions`; temporalmente pueden quedar desincronizados.

Mitigación:

- refrescar batches después de importación exitosa;
- permitir retry manual en la sección;
- no derivar totales financieros de movimientos locales para contradecir `import_batches`.

---

## 11. Estrategia de tests

### 11.1 Hook `useImportBatches`

Tests:

1. consulta `import_batches` con columnas esperadas, `.eq('user_id', user.id)`, orden descendente y `limit(10)`;
2. mapea snake_case a camelCase;
3. estado empty cuando Supabase devuelve `[]`;
4. estado error cuando Supabase falla;
5. no consulta si no hay user autenticado.

### 11.2 `ImportBatchList` / `ImportBatchCard`

Tests:

1. renderiza estado empty;
2. renderiza loading skeleton;
3. renderiza error + retry;
4. muestra filename, fecha, counts y totales;
5. “Ver movimientos” llama `onViewBatch(batch.id)`;
6. no existe botón “Revertir”, “Eliminar” ni acciones destructivas.

### 11.3 `ImportManager.jsx`

Tests:

1. muestra sección “Importaciones recientes” sin romper flujo de preview/import;
2. tras import exitoso dispara refresh de batches;
3. si falla carga de batches, importación CSV sigue disponible;
4. selección de batch llama callback provisto por App.

### 11.4 `Historial.jsx`

Tests:

1. con `importBatchFilter`, muestra solo movimientos del batch;
2. movimientos manuales quedan fuera cuando el filtro está activo;
3. limpiar filtro restaura lista normal;
4. chip de importación activa se muestra;
5. estado sin resultados no borra ni modifica datos.

### 11.5 `ExpansionDetalle.jsx`

Tests:

1. movimiento manual mantiene UI actual;
2. movimiento importado muestra `source/importedAt` en copy humano;
3. no muestra hash/UUID por defecto;
4. sigue mostrando Editar/Eliminar según props existentes sin cambios de contrato.

### 11.6 Integración App-level

Si existe infraestructura estable para `App.jsx`:

1. click en “Ver movimientos” dentro de Herramientas navega a Movimientos;
2. se aplica filtro de `importBatchId`;
3. se puede limpiar filtro;
4. no se crea nueva navegación principal.

Si App-level es costoso/inestable, cubrir el contrato con tests de `ImportManager` + `Historial` y dejar una prueba manual documentada.

### 11.7 Validación manual recomendada

Escenario:

1. crear/importar un CSV pequeño desde localhost;
2. confirmar que aparece en “Importaciones recientes”;
3. verificar resumen del batch;
4. click en “Ver movimientos”;
5. confirmar que Historial muestra únicamente esos movimientos;
6. limpiar filtro;
7. confirmar que Historial vuelve al estado normal;
8. confirmar que no existe acción de rollback/delete.

---

## 12. Implementation Constraints

Esta revisión final define restricciones obligatorias para la implementación MVP de IMP-002B. Si alguna sección anterior de este documento describe una alternativa más amplia, esta sección prevalece para el primer corte.

### 12.1 Evitar N+1 queries en Historial

Decisión:

```text
Historial NO debe ejecutar queries por fila ni por batch durante el render.
```

Reglas explícitas:

- no hacer `SELECT import_batches` desde `ExpansionDetalle` por cada movimiento;
- no hacer `SELECT transactions` por cada batch listado;
- no resolver `original_filename` con una query individual por movimiento;
- no disparar queries desde el map de `groups.map(...items.map(...))` en `Historial.jsx`;
- no usar effects por fila para enriquecer metadata.

Estrategia permitida:

- una sola query agregada para listar importaciones recientes en el área de Importar;
- filtro local de movimientos usando `importBatchId` ya presente en `useTransactions`;
- si se necesita metadata de un batch seleccionado, pasar el objeto batch desde el CTA “Ver movimientos” hacia App/Historial;
- para movimientos importados no seleccionados, mostrar metadata disponible en el movimiento (`source`, `importedAt`) sin consultar batch.

Motivo:

Historial puede contener cientos de movimientos. Cualquier consulta por fila reintroduce riesgo de latencia, parpadeos, fallos parciales y costos innecesarios. La trazabilidad básica debe ser O(1) en queries por pantalla, no O(n) por cantidad de movimientos visibles.

### 12.2 No crear `useImportBatches.js` en el MVP salvo necesidad demostrada

Decisión MVP:

```text
No crear `src/hooks/useImportBatches.js` en el primer corte si la lectura se usa solo dentro de ImportManager.
```

Implementación mínima recomendada:

- cargar importaciones recientes dentro de `ImportManager.jsx` o en un subcomponente local de importación;
- mantener la query encapsulada en una función pequeña read-only;
- refrescar esa lista al montar la sección y después de una importación exitosa;
- extraer a `useImportBatches.js` solo si una segunda superficie necesita la misma lista de batches de forma independiente.

Motivo:

Crear un hook global antes de tener reutilización real aumenta superficie de API interna, tests y estados compartidos. Para MVP, la lista de importaciones recientes pertenece al contexto de Importar.

Excepción aceptada:

Si durante la implementación se decide que App debe poseer la lista completa de batches para evitar prop drilling o para enriquecer Historial sin queries adicionales, entonces sí puede extraerse un hook. Esa extracción debe seguir siendo read-only y no modificar `useTransactions`.

### 12.3 Mantener `useTransactions` como única fuente de verdad de movimientos

Decisión:

```text
`useTransactions` sigue siendo la única fuente de verdad frontend para incomes/expenses/allTransactions.
```

Reglas explícitas:

- no crear un segundo store de movimientos por batch;
- no duplicar movimientos obtenidos desde `transactions` en estado paralelo de ImportManager;
- no recalcular balance global desde `import_batches`;
- no usar los totales del batch para modificar totales de dashboard/historial;
- no modificar `addBulkTransactions` para IMP-002B.

Separación de responsabilidades:

- `useTransactions`: movimientos actuales, balance, filtros existentes, sync y metadata nullable de cada movimiento;
- `import_batches` read-only: resumen/auditoría del lote importado;
- `App.jsx`: estado UI transitorio del batch seleccionado para filtrar Historial;
- `Historial.jsx`: presentación y filtro local sobre movimientos que ya recibió.

Regla de consistencia:

```text
Para mostrar movimientos de un lote, filtrar `allTransactions`/incomes/expenses existentes por `importBatchId`.
Para mostrar resumen del lote, leer `import_batches`.
Nunca mezclar ambos para recalcular y sobrescribir datos financieros.
```

### 12.4 Experiencia mínima del MVP

Decisión MVP:

```text
IMP-002B debe entregar visibilidad básica, no administración de importaciones.
```

La experiencia mínima aprobada debe incluir solamente:

1. sección “Importaciones recientes” dentro de Herramientas/Importar;
2. lectura read-only de últimos batches existentes;
3. estado vacío: “Todavía no hay importaciones registradas.”;
4. card compacta por batch con:
   - nombre del archivo o fallback humano;
   - fecha de importación;
   - cantidad de movimientos;
   - ingresos/gastos;
   - neto;
   - status legible;
5. CTA “Ver movimientos”;
6. navegación a Historial existente con filtro por `importBatchId`;
7. chip de filtro activo y acción para limpiar filtro;
8. metadata mínima en detalle expandido del movimiento si `source/importedAt` existe.

No es parte del MVP:

- badge visible en cada fila si requiere tocar `FilaMovimiento.jsx`;
- modal de detalle completo del batch;
- búsqueda/paginación avanzada de batches;
- hash visible;
- export;
- rollback/revert;
- deduplicación;
- backfill.

### 12.5 Query budget del MVP

Presupuesto máximo recomendado por interacción:

- al montar ImportManager: 1 query `SELECT import_batches ... LIMIT 10`;
- después de importación exitosa: 1 refresh de esa misma query;
- al hacer click en “Ver movimientos”: 0 queries nuevas;
- al renderizar Historial filtrado: 0 queries nuevas;
- al expandir una fila: 0 queries nuevas.

Cualquier implementación que exceda este presupuesto debe documentar por qué y considerarse fuera del MVP salvo aprobación explícita.

### 12.6 Ajuste a estrategia de tests por esta revisión

Como el MVP no debe crear `useImportBatches.js` por defecto, los tests del hook pasan a ser condicionales. La estrategia base queda así:

1. `ImportManager.test.jsx`: mock de Supabase para validar query read-only, estados loading/empty/error, render de batches y refresh post-import.
2. `Historial.test.jsx`: filtro local por `importBatchId`, chip activo, limpiar filtro y cero mutaciones.
3. `ExpansionDetalle` o tests de Historial: metadata importada usando solo datos ya presentes en movement.
4. Prueba negativa: no se llama Supabase al hacer click en “Ver movimientos”, al renderizar Historial ni al expandir filas.
5. Tests de `useImportBatches` solo si se crea el hook por una necesidad real de reutilización.

---

## 13. No hacer en IMP-002B

No implementar:

- rollback/revert batch;
- delete/update de `import_batches`;
- nuevas RPCs;
- nuevas tablas;
- cambios de schema;
- backfill de movimientos antiguos;
- deduplicación;
- historial como sección principal nueva;
- realtime;
- edición de metadata del batch;
- export técnico del batch;
- mostrar checksums como información principal.

---

## 14. Decisión técnica recomendada

Implementar IMP-002B como MVP read-only en dos superficies existentes:

1. **Herramientas / Importar**
   - lista de importaciones recientes desde `import_batches`;
   - resumen financiero por batch;
   - CTA “Ver movimientos”.

2. **Historial**
   - filtro local por `importBatchId`;
   - chip de filtro activo;
   - metadata ligera en detalle expandido.

No se requieren cambios de base de datos ni RPCs nuevas.

La implementación debe tratar `import_batches` como source of truth para resumen del lote y `transactions.import_batch_id` como vínculo para mostrar los movimientos asociados.
