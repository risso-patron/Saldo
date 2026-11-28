# IMP-002B Discovery — Import Batch Visibility & Recovery UX

**Estado:** Discovery / no aprobado para implementación  
**Fecha:** 2026-08-23  
**Autor:** Product Engineering  
**Base técnica:** IMP-002A — Import Batch System  
**Archivo relacionado:** `docs/IMP-002A-CLOSEOUT.md`

---

## 1. Contexto

IMP-002A dejó implementada la base técnica para que las importaciones CSV/TXT de SALDO tengan trazabilidad persistente.

El incidente DOGFOODING original obligó a una recuperación forense porque una importación accidental de 612 movimientos quedó mezclada con movimientos existentes y no había concepto de lote visible ni reversible desde producto.

Después de IMP-002A, las importaciones nuevas ya pueden quedar asociadas a un `import_batch_id`, con metadata persistente en Supabase. IMP-002B debe explorar cómo convertir esa base técnica en una experiencia de producto que ayude al usuario a entender qué importó, cuándo lo importó y qué impacto tuvo, sin implementar todavía rollback ni nuevas capacidades destructivas.

---

## 2. Problema de usuario

Cuando un usuario importa un archivo bancario, necesita confianza en tres momentos:

1. **Antes de importar:** entender qué va a entrar.
2. **Después de importar:** confirmar qué entró realmente.
3. **Más adelante:** poder reconocer qué movimientos vinieron de una importación específica.

IMP-001 cubrió el safety gate antes de importar.  
IMP-002A cubrió la trazabilidad técnica persistente.  
IMP-002B debería cerrar la brecha de visibilidad: que el usuario pueda ver y reconocer sus importaciones sin análisis técnico.

Frase de usuario esperada:

> “Quiero saber qué movimientos salieron de ese archivo que subí.”

---

## 3. Estado actual de `import_batches`

### 3.1 Tabla existente

La tabla existente es:

```text
public.import_batches
```

Campos disponibles según la foundation IMP-002A.1:

- `id`
- `user_id`
- `source`
- `original_filename`
- `file_size_bytes`
- `file_sha256`
- `movement_count`
- `income_count`
- `expense_count`
- `income_total`
- `expense_total`
- `net_total`
- `status`
- `created_at`
- `completed_at`

Estados actualmente definidos:

- `pending`
- `completed`
- `failed`
- `reverted`

### 3.2 Relación con `transactions`

Campos existentes en `transactions`:

- `import_batch_id`
- `source`
- `imported_at`

Relación:

```text
transactions.import_batch_id → import_batches.id
```

La FK usa:

```text
ON DELETE SET NULL
```

Implicación de producto:

- un movimiento puede estar asociado a un lote;
- movimientos históricos anteriores a IMP-002A pueden no tener lote;
- si la metadata de un lote desaparece, el movimiento no se elimina automáticamente.

### 3.3 Seguridad y ownership

Estado técnico disponible:

- RLS en `import_batches`.
- Políticas por `auth.uid() = user_id`.
- Trigger de protección para evitar que una transaction apunte a un batch de otro usuario.
- Sin policy de DELETE en IMP-002A.

Implicación de producto:

- IMP-002B puede diseñar lectura segura de lotes propios.
- No debe asumir capacidad de borrado/revert todavía.
- Cualquier acción futura de revert debe pasar por una fase separada.

---

## 4. Datos disponibles para UX

### 4.1 Desde `import_batches`

Se puede mostrar, sin schema nuevo:

- fecha/hora de importación (`created_at` / `completed_at`)
- archivo origen (`original_filename`)
- tipo de archivo (`source`: `csv_import` / `txt_import`)
- tamaño (`file_size_bytes`)
- fingerprint de archivo (`file_sha256`, si existe)
- cantidad total de movimientos (`movement_count`)
- ingresos importados (`income_count`, `income_total`)
- gastos importados (`expense_count`, `expense_total`)
- impacto neto (`net_total`)
- estado (`status`)

### 4.2 Desde `transactions`

`useTransactions.js` ya lee metadata nullable desde Supabase hacia el modelo local:

- `importBatchId`
- `source`
- `importedAt`

Esto permite, sin modificar schema:

- marcar visualmente movimientos importados;
- filtrar o agrupar por lote, si la UI recibe todos los movimientos;
- abrir un detalle de lote desde un movimiento individual;
- comparar conteo de movements visibles vs `movement_count` del batch.

### 4.3 Datos no disponibles hoy

No están disponibles sin nuevas fases:

- nombre amigable editable del lote;
- notas del usuario sobre la importación;
- mapping usado por el parser;
- errores fila por fila persistidos;
- preview original completo;
- archivo original;
- deduplicación histórica;
- rollback seguro desde producto.

Estos datos no deben asumirse en IMP-002B.

---

## 5. Posibles ubicaciones UX

### Opción A — Herramientas / Importar: “Importaciones recientes”

Ubicación:

```text
Herramientas → Importar CSV/TXT → Importaciones recientes
```

Ventajas:

- vive cerca del flujo que crea los lotes;
- menor impacto en navegación principal;
- coherente con que ImportManager ya está en Herramientas;
- buen primer MVP.

Desventajas:

- el usuario puede buscar el historial en “Movimientos”, no en Herramientas;
- si queda muy abajo, puede no descubrirse.

Uso recomendado:

- lista compacta de últimos batches;
- resumen por batch;
- link/CTA “Ver movimientos de este lote”.

### Opción B — Historial de movimientos: filtro/origen “Importados”

Ubicación:

```text
Movimientos / Historial → filtros → origen/importación
```

Ventajas:

- el usuario está mirando movimientos, no herramientas;
- permite responder: “¿cuáles de estos vinieron de un archivo?”;
- reduce ansiedad cuando algo se ve raro en el historial.

Desventajas:

- Historial ya tiene filtros por tipo, categoría, período y búsqueda;
- agregar filtros puede aumentar complejidad visual;
- requiere cuidado para no convertir Historial en una pantalla técnica.

Uso recomendado:

- badge simple “Importado” en filas con `importBatchId`;
- filtro opcional “Importados” / “Manual” solo si no satura la UI;
- detalle contextual bajo una fila expandida: archivo, fecha de importación.

### Opción C — Detalle de movimiento

Ubicación:

```text
Fila expandida en Historial → Metadata de origen
```

Ventajas:

- mínimo ruido visual;
- útil cuando el usuario inspecciona un movimiento específico;
- aprovecha el patrón actual de expansión en Historial.

Desventajas:

- no resuelve por sí sola la pregunta “qué importé en ese lote completo”.

Uso recomendado:

- mostrar “Importado desde [archivo] el [fecha]” cuando exista batch.

### Opción D — Dashboard post-import

Ubicación:

```text
Dashboard → tarjeta temporal después de una importación
```

Ventajas:

- confirma éxito y calma inmediatamente;
- buen momento para mostrar impacto financiero resumido.

Desventajas:

- si es persistente puede competir con el objetivo principal del Dashboard;
- no sirve como historial permanente.

Uso recomendado:

- solo como confirmación reciente, no como centro de administración.

### Opción E — Perfil/Cuenta

No recomendada para MVP.

Motivo:

- la importación es una acción financiera operativa, no una preferencia de cuenta;
- esconderla en cuenta reduce descubrimiento.

---

## 6. Valor para usuario

### Valor principal

IMP-002B convierte una importación de “evento invisible” a “evento entendible”.

Beneficios:

- confianza después de importar;
- menor ansiedad si el balance cambia de golpe;
- explicación clara de por qué aparecieron muchos movimientos;
- capacidad de auditar sin DevTools;
- base UX para una futura reversión segura.

### Valor para SALDO

- reduce soporte manual;
- disminuye riesgo operativo de importaciones masivas;
- aumenta confianza en importación bancaria;
- convierte el aprendizaje DOGFOODING en mejora visible de producto;
- prepara el camino para rollback y deduplicación sin improvisar.

---

## 7. Riesgos

### 7.1 Riesgo de ansiedad

Mostrar “612 movimientos importados” sin contexto puede asustar.

Mitigación:

- copy calmado;
- resumen financiero claro;
- evitar lenguaje de error si el batch está `completed`;
- diferenciar “importación realizada” de “problema detectado”.

### 7.2 Riesgo de acción destructiva prematura

Si la UI muestra batches, el usuario puede esperar un botón “revertir”.

Mitigación:

- IMP-002B no debe incluir revert/delete;
- si se menciona, debe aparecer como “próximamente” o no aparecer;
- una fase futura debe diseñar confirmaciones, backup y validación.

### 7.3 Riesgo de complejidad en Historial

Historial ya es una pantalla de consulta. Agregar metadata técnica puede ensuciar la experiencia.

Mitigación:

- mostrar metadata solo cuando aporte claridad;
- usar badges discretos;
- evitar columnas técnicas permanentes.

### 7.4 Riesgo con datos antiguos

Movimientos importados antes de IMP-002A no tienen `import_batch_id`.

Mitigación:

- no prometer cobertura histórica total;
- usar copy: “Importaciones registradas desde [fecha/versión]” si aplica;
- no hacer backfill en IMP-002B.

### 7.5 Riesgo de checksums mal interpretados

`file_sha256` es útil para auditoría, pero no es lenguaje humano.

Mitigación:

- no mostrar hash completo por defecto;
- si se muestra, ubicarlo en detalle técnico/copiar soporte.

---

## 8. MVP o Pro

### Recomendación: MVP / disponible para todos los usuarios

IMP-002B debe ser MVP core, no Pro.

Razones:

1. La trazabilidad de importaciones es seguridad y confianza, no profundidad premium.
2. Bloquear historial de importaciones detrás de Pro aumentaría ansiedad en el momento equivocado.
3. La promesa Free/Pro de SALDO indica que Free debe permitir comprender la situación financiera completa.
4. El incidente DOGFOODING demostró que visibilidad de importaciones es una necesidad operativa básica.
5. Monetizar esta visibilidad se parecería a vender tranquilidad después de una importación, lo cual contradice los principios de monetización.

### Qué podría ser Pro en el futuro

No para IMP-002B, pero eventualmente podrían evaluarse como Pro si se diseñan sin miedo ni presión:

- deduplicación avanzada asistida;
- análisis inteligente de patrones importados;
- reglas automáticas por banco;
- conciliación avanzada;
- reportes exportables de auditoría.

La línea divisoria recomendada:

```text
Ver qué importé y entenderlo = Core/MVP
Automatizar análisis avanzado = posible Pro futuro
```

---

## 9. Alcance recomendado para IMP-002B

### MVP recomendado

Sin schema nuevo y sin APIs nuevas, IMP-002B debería limitarse a visibilidad:

1. Mostrar importaciones recientes en Herramientas/Importar.
2. Mostrar resumen de cada batch:
   - archivo
   - fecha
   - cantidad de movimientos
   - ingresos/gastos
   - neto
   - status
3. Permitir ver movimientos asociados a un batch usando `import_batch_id` existente.
4. Mostrar badge discreto “Importado” en movimientos con `importBatchId`.
5. Incluir estado vacío claro:
   - “Todavía no hay importaciones registradas.”
6. No ofrecer revert/delete.

### No recomendado para MVP

- nueva pestaña principal;
- nueva tabla;
- nueva RPC;
- rollback;
- edición de batch;
- backfill de importaciones antiguas;
- deduplicación;
- reimportar desde batch;
- mostrar hashes como contenido principal.

---

## 10. Preguntas abiertas

1. ¿La lista de importaciones debe vivir dentro de `ImportManager` o como componente separado dentro de Herramientas?
2. ¿Cuántos batches mostrar inicialmente: últimos 5, últimos 10 o todos con paginación futura?
3. ¿El detalle de batch debe abrir un modal, expandirse inline o navegar a Historial con filtro aplicado?
4. ¿Debe existir un badge “Importado” visible siempre o solo en detalle expandido?
5. ¿Cómo comunicar que importaciones anteriores a IMP-002A pueden no aparecer?
6. ¿Qué copy usar para no prometer rollback todavía?

---

## 11. Criterio de éxito del discovery

IMP-002B debería considerarse válido para pasar a diseño si el equipo acepta que:

- el usuario necesita visibilidad post-importación;
- la funcionalidad debe ser Core/MVP, no Pro;
- el alcance inicial es solo lectura;
- no se requieren cambios de schema;
- no se implementa rollback todavía;
- la ubicación primaria recomendada es Herramientas/Importar, con señales ligeras en Historial.

---

## 12. Decisión recomendada

Recomiendo que IMP-002B sea:

```text
Import History MVP — read-only visibility of import batches
```

Clasificación:

```text
MVP / Core / Free
```

Ubicación primaria:

```text
Herramientas → Importar CSV/TXT → Importaciones recientes
```

Ubicación secundaria:

```text
Historial → badge/detalle de movimiento importado
```

Restricciones para la próxima fase:

- no modificar schema;
- no crear nuevas tablas;
- no crear nuevas RPCs;
- no implementar rollback;
- no implementar deduplicación;
- no ocultar trazabilidad detrás de Pro;
- mantener Supabase como source of truth.
