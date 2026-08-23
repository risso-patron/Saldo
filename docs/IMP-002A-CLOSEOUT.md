# IMP-002A Closeout — Import Batch System

Fecha de cierre técnico: 2026-08-23

## 1. Objetivo

IMP-002A resolvió la falta de trazabilidad persistente en importaciones CSV/TXT de SALDO.

Antes de esta fase, una importación creaba movimientos indistinguibles de movimientos manuales una vez persistidos. El incidente de dogfooding con 612 movimientos importados accidentalmente demostró que, sin concepto de lote, una recuperación requiere análisis forense manual por timestamps, IDs y totales.

El objetivo de IMP-002A fue dejar la base para que toda importación nueva quede asociada a metadata persistente, con relación explícita entre el archivo importado, el lote de importación y los movimientos creados, manteniendo compatibilidad con movimientos existentes y sin introducir todavía rollback, historial UI ni deduplicación avanzada.

## 2. Arquitectura implementada

### Flujo frontend actual para imports con metadata

```text
CSV/TXT
  |
ImportManager
  |
RPC Supabase
  |
import_batches
  |
transactions
```

Flujo implementado:

1. El usuario selecciona un archivo CSV/TXT en `ImportManager`.
2. `ImportManager` parsea el archivo, muestra preview y aplica las validaciones/safety gate existentes.
3. En confirmación de importación, `ImportManager` construye `importMetadata` del archivo:
   - `source`: `csv_import` o `txt_import`
   - `originalFilename`
   - `fileSizeBytes`
   - `fileSha256` cuando el cálculo está disponible; si falla, se envía `null` sin bloquear la importación.
4. `App.jsx` reenvía las transacciones y metadata hacia `addBulkTransactions`.
5. `useTransactions.js` detecta `options.importMetadata` y usa Supabase-first mediante RPC.
6. La RPC `public.create_import_batch_with_transactions(...)` crea atómicamente:
   - un registro en `public.import_batches`
   - los registros correspondientes en `public.transactions`
7. Solo después de una respuesta exitosa de Supabase se actualiza el estado local.

### Database foundation

IMP-002A.1 agregó la entidad `public.import_batches` para representar lotes de importación.

Metadata persistente implementada:

- archivo origen
- source normalizado (`csv_import` / `txt_import`)
- conteos y totales del lote
- status del lote, incluyendo `pending`, `completed`, `failed`, `reverted`
- timestamps de creación/completado
- ownership por `user_id`

Relación con `transactions`:

- `transactions.import_batch_id`
- `transactions.source`
- `transactions.imported_at`

La FK usa `ON DELETE SET NULL` para evitar que borrar metadata del batch elimine movimientos financieros. Las columnas nuevas son compatibles con `NULL` para no romper movimientos históricos.

### RPC

RPC implementada:

```sql
public.create_import_batch_with_transactions(...)
```

Responsabilidades principales:

- validar usuario autenticado
- crear batch y transactions en una operación atómica
- asociar cada transaction al `import_batch_id`
- devolver metadata del batch, incluyendo `completedAt`
- asegurar rollback transaccional ante errores

## 3. Decisiones técnicas

### RPC atómica

Se eligió una RPC Supabase para crear `import_batches` y `transactions` en una única transacción de base de datos.

Motivo:

- evita batches sin movimientos
- evita movimientos importados sin batch
- centraliza validaciones de ownership y consistencia
- garantiza rollback completo si una parte de la operación falla

### No usar `pendingOperation` para imports batch

Los imports con metadata no usan la cola local/background `pendingOperation`.

Motivo:

- la trazabilidad depende de que Supabase cree el batch y los movimientos juntos
- una cola local podría reintentar parcialmente o dejar estados ambiguos
- después del incidente DOGFOODING, las importaciones deben ser persistencia Supabase-first

Regla documentada:

- sin conexión: bloquear importación batch
- no usar `pendingOperation` como cola durable para imports

### Supabase-first para importaciones

La importación batch ahora sigue este orden:

```text
Preview validado
  ↓
RPC Supabase
  ↓
confirmación exitosa
  ↓
actualización estado local
```

Motivo:

- Supabase es el source of truth
- localStorage/estado local no debe adelantarse a una importación que puede fallar
- la app solo refleja movimientos importados después de persistencia confirmada

### Mantener flujo antiguo para movimientos manuales

Los movimientos manuales y bulk imports sin metadata conservan el flujo existente.

Motivo:

- reducir riesgo de regresión
- evitar cambios masivos fuera del alcance de IMP-002A
- mantener compatibilidad con usuarios y datos existentes

### Preservar `type` explícito en CSV/TXT

IMP-002A-H01 corrigió una regresión detectada durante dogfooding: el parser eliminaba `type` durante la normalización y terminaba infiriendo por signo.

Prioridad final de clasificación:

1. `type` explícito del archivo
2. columnas débito/crédito
3. signo del monto

Normalizador implementado:

```js
normalizeTransactionType(value)
```

Soporta, entre otros:

- income: `income`, `ingreso`, `ingresos`, `credit`, `credito`, `crédito`, `abono`, `haber`
- expense: `expense`, `gasto`, `gastos`, `debit`, `debito`, `débito`, `cargo`

## 4. Validaciones realizadas

### IMP-002A.1 — Database Foundation

Validado:

- creación atómica de batch + transactions
- rollback ante error
- metadata persistente
- RLS y protección por ownership
- relación `transactions.import_batch_id` hacia `import_batches`
- FK con `ON DELETE SET NULL`

### IMP-002A.2 — Frontend Integration

Validado:

- import CSV exitoso llama RPC y actualiza estado local solo después del OK
- fallo de RPC no modifica movimientos locales
- movimiento manual continúa funcionando igual
- refresh/carga desde Supabase no rompe por metadata nullable
- imports con metadata no usan `pendingOperation`

Archivos principales validados:

- `src/features/import/ImportManager.jsx`
- `src/App.jsx`
- `src/hooks/useTransactions.js`

### IMP-002A-H01 — Preserve Explicit Transaction Type

Problema validado:

```csv
description,type,amount
Gasto prueba,expense,25
```

Antes del fix podía llegar como:

```text
type = income
```

Causa raíz:

- `ImportManager.jsx` descartaba `type` durante normalización
- luego se aplicaba inferencia por signo: monto positivo => `income`

Validación automatizada ejecutada:

- tests focalizados IMP-002A-H01: `7 passed`
- suite `ImportManager.test.jsx`: `18 passed`
- ESLint focalizado de `ImportManager.jsx`: OK
- `npm run build`: OK

Nota: el build mantiene un warning existente de `lottie-web` sobre uso de `eval`; no está relacionado con IMP-002A.

### Prueba real en Supabase

Prueba real desde localhost:

```csv
description,type,amount,date
Ingreso prueba H01,income,500,2026-08-23
Gasto prueba H01,expense,25,2026-08-23
```

Resultado esperado:

```text
Ingreso prueba H01 | income
Gasto prueba H01   | expense
```

Resultado observado:

```text
Correcto
```

Batch creado:

```text
240f4ddb-640a-4ee2-bd8d-9d5e47974e83
```

Ambos movimientos quedaron con:

- `import_batch_id != null`
- `source = csv_import`
- `imported_at` populated

## 5. Riesgos pendientes / fuera de alcance

IMP-002A deja trazabilidad persistente, pero no implementa todavía:

- rollback/revert de importaciones
- historial UI de importaciones
- acción de revert batch desde UI
- deduplicación avanzada
- migración/backfill de datos antiguos
- eliminación selectiva por batch desde producto
- reconciliación automática de importaciones previas a IMP-002A

Riesgos residuales:

- Los movimientos importados antes de IMP-002A no tendrán `import_batch_id` salvo una futura migración/backfill explícita.
- La reversibilidad completa requiere una fase posterior que use `import_batch_id` para validar y revertir lotes de forma segura.
- La detección de duplicados debe diseñarse antes de permitir importaciones repetidas sin advertencias avanzadas.

## 6. Commits relacionados

- `7a8c23b` / `7a8c23b7f17ed9694c8156ffc0f491efb64b90e5`
  - `feat(import): integrate import batch metadata`
  - Implementa integración frontend con batch metadata y RPC Supabase-first.

- `d9da6e1` / `d9da6e1bc77e969f44bd8f03687f5565161e9090`
  - `fix(import): preserve explicit transaction type`
  - Corrige preservación de `type/tipo` explícito y aliases de clasificación en imports CSV/TXT.

## Cierre

IMP-002A queda cerrado como foundation técnica de trazabilidad para importaciones.

Estado final:

- batch metadata persistente: implementado
- integración frontend Supabase-first: implementada
- preservación de tipo explícito: implementada
- rollback/revert UI: pendiente para fase futura
- deduplicación avanzada: pendiente para fase futura
