# BR-2 — Execution Preparation Record

**Estado:** BR-2 — READY FOR EXECUTION. "BR-2 START" fue aprobado administrativamente (autorización del Product Owner) — esto habilita el arranque operativo, pero **no equivale a estar "EN EJECUCIÓN"**.

**Condición de transición a "EN EJECUCIÓN":** el estado cambia únicamente cuando se cumplen, de forma simultánea:
- existe al menos un participante confirmado;
- existe una fecha oficial de Día 1 definida para ese participante;
- se inició la observación real (Día 1 ya ocurrió).

Hasta que esas 3 condiciones se cumplan, BR-2 permanece en "READY FOR EXECUTION" — los materiales están listos, pero no hay todavía ningún participante real bajo observación.

---

## 1. Versión candidata a validar

**Último commit incluido:** `2eeea0f`

**Commits que forman la base de BR-2** (orden cronológico, todos en `main`):

| Commit | Descripción |
|---|---|
| `42b3e76` | PRE-RC-001-02 — reconciliación de gamificación con cap14 (4 hitos, sin puntos/niveles, ventana móvil de constancia) |
| `df9fe6d` | PRE-RC-001-01 — alineación de copy de monetización con cap04/cap21 (vocabulario, badges de urgencia, cálculo de descuento) |
| `1efa0bc` | PRE-BR-2 — higiene documental (PM-RECON-003-WRITE + PM-CAT-001-WRITE) |
| `2eeea0f` | MON-VERIFY-001 — eliminación de promesas de monetización sin respaldo verificable |

**Estado actual del repositorio:** working tree limpio de código — `git status` solo reporta 3 elementos untracked, todos ya clasificados en revisiones previas como fuera de alcance de este workstream (`docs/legal/`, `docs/release/BR-2.md`, `docs/release/PRE-BR-1.md`). Suite de tests 749/749 en verde, build verde, sin errores de lint nuevos — validado por última vez en el cierre de MON-VERIFY-001.

---

## 2. Alcance de validación

**Qué se valida** (mapea directamente a H1-H7 de `BR-2.md`, sin agregar ni quitar hipótesis):
- Comprensión inicial (H1).
- Registro de movimientos — hábito de uso (H2).
- Historial — valor de consulta (H3).
- Categorización — comprensión y confianza (H4).
- Confianza en el número mostrado (H5).
- Retorno espontáneo (H6).
- Utilidad percibida vs. registro pasivo (H7).

**Qué NO se valida:**
- Nuevas features.
- Monetización avanzada (el flujo de planes ya fue corregido en MON-VERIFY-001, pero BR-2 no mide conversión ni pricing).
- IA futura (señales anticipatorias de cap15 requieren 4+ semanas de historial, fuera de la ventana de 14 días de BR-2).
- Arquitectura.
- Performance.

---

## 3. Congelamiento previo

Durante la ejecución de BR-2:
- **No se aplican cambios funcionales** al producto.
- **No se agregan nuevas features.**
- **No se aplican correcciones de UX**, salvo un bloqueo crítico que impida a un usuario de prueba completar el flujo mínimo (registrar un movimiento, ver su historial).
- **Todo hallazgo se registra** en la ficha de usuario correspondiente (`BR-2.md`, sección 6) — no se implementa automáticamente ninguna corrección durante la ventana de 14 días, sin importar cuán obvia parezca. La decisión de qué hacer con cada hallazgo se toma después del cierre, con el conjunto completo de evidencia.

Esto opera el principio ya establecido en `BR-2.md`: "no se retoma la construcción de nuevas funcionalidades hasta que se cumplan estos criterios... si no se cumplen, el paso siguiente es investigar por qué, no seguir agregando funciones a ciegas."

---

## 4. Protocolo operativo confirmado

| Elemento | Decisión |
|---|---|
| Responsable de ejecución | Product Owner — moderación, seguimiento y consolidación |
| Mecanismo de reclutamiento | Red personal controlada del Product Owner |
| Canal de seguimiento (Día 1/3/7/14) | WhatsApp |
| Regla de falla de contacto | Una falla de seguimiento (mensaje no entregado o sin ninguna confirmación de lectura) se clasifica como **"Dato inválido — falla de seguimiento"** y se excluye del cálculo de métricas de retención — nunca se cuenta como abandono del producto |

---

## 5. Criterios de cierre

Exactamente los 6 ya definidos en `docs/release/BR-2.md`, sección 7 — sin agregar métricas nuevas:

| Criterio | Umbral |
|---|---|
| Retención D7 | ≥ 50% de los usuarios |
| Tiempo al primer gasto | ≥ 70% lo registra en menos de 5 minutos |
| Uso espontáneo del Historial | ≥ 60% lo abre al menos una vez sin que se le pregunte |
| Patrón de confusión repetido | Ningún punto de confusión en más del 30% de las entrevistas |
| Sostenimiento del hábito | ≥ 50% sigue registrando movimientos al día 14 |
| NPS promedio | ≥ 30 |

Si los seis se cumplen: el roadmap técnico puede retomarse con esa base. Si alguno no se cumple: se prioriza entender la causa raíz antes de decidir cualquier próximo paso.

---

**Este documento deja BR-2 preparado administrativamente. No autoriza el inicio de usuarios reales.**
