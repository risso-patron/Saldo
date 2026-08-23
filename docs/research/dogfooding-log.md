# Dogfooding Log — SALDO (DOG-001)

**Fase**: DOG-001 — Dogfooding
**Ventana**: 2026-08-18 → 2026-09-17 (30 días)
**Usuario principal**: Luis
**Naturaleza de la evidencia**: n=1, exploratoria, no confirmatoria. Conflicto de interés estructural declarado (evaluador = sujeto) — ver DOG-001, sección "Limitación metodológica". No permite generalizar comportamiento de otros usuarios ni demuestra product-market fit.

Este log es independiente de H1 y no lo sustituye. No debe citarse como evidencia de H1 ni mezclarse con `docs/research/primeros-10-minutos-2026-08/` o `docs/research/dashboard-h2-destino-recurrente-2026-08/`.

---

## Cómo registrar una entrada

Misma disciplina metodológica que H1: separar el hecho de la lectura que se hace de él. Cada entrada debe distinguir, como mínimo, estas tres cosas — no mezclarlas en un solo párrafo:

- **Observación**: qué pasó, en términos verificables (qué se hizo, qué mostró la app, qué resultado hubo). Sin interpretar.
- **Interpretación**: qué cree Luis que significa esa observación. Explícitamente marcado como lectura personal, no como hecho.
- **Preferencia personal**: qué le hubiera gustado que pasara distinto, sin que eso implique que la app está mal — un gusto, no un defecto.

Una observación **no autoriza automáticamente ningún cambio**. Se clasifica después, y solo entonces se decide (DOG-001 regla 6, regla 7, DOG-002 §2).

**Corrección habilitante** (única categoría que DOG-001 permite ejecutar sin nueva evaluación): el usuario no puede completar una tarea financiera real por un comportamiento incorrecto del producto — crash, dato incorrecto, pérdida de datos. Todo lo demás (estética, preferencias, fricciones no bloqueantes, funcionalidades nuevas) se registra como observación y espera clasificación y decisión independiente.

### Plantilla de entrada

```
## AAAA-MM-DD

**Observación**:

**Interpretación**:

**Preferencia personal**:

**¿Corrección habilitante?**: Sí / No / A evaluar
```

---

## Dogfooding Entry State (registrado — no constituye ratificación de nada)

Determinado en DOG-002, ratificado como **Estado Y** el 2026-08-18.

- **Baseline histórico**: `eb6fc28` (cierre roadmap RC-1, Fases 0–6) — sin tocar.
- **HEAD (último commit)**: `2f1afad` — `fix(saldo): close C-08 accessibility contrast correction`.
- **Estado ejecutable real**: working tree actual, no un checkout limpio de `2f1afad`. Vite sirve desde el filesystem, no desde `git HEAD` — por eso el estado ejecutable incluye 3 archivos funcionales no commiteados:
  - `src/components/ds/dsNavItems.js` — rótulo del tab `graficos`: **"Ideas"** (no "Insights"). Corresponde a **C-05, NO RATIFICADO** (ver auditoría dedicada: no existe evidencia de Nivel 1 que autorice "Ideas" como copy oficial; `docs/product-master/00-STATE.md` sigue afirmando lo contrario).
  - `src/components/Shared/Omnibar.jsx` — mismo cambio de rótulo en el quick action del Omnibar. Mismo estado: C-05, no ratificado.
  - `src/features/goals/GoalManager.jsx` — sin confeti ni trofeo al completar una meta. Corresponde a **E2, implementado técnicamente, pendiente de cierre documental** (la fila de `docs/design/integration-debt.md` sigue sin actualizar).

**Aclaración explícita** (DOG-002, ratificación 2026-08-18): que estos tres cambios estén presentes en el estado ejecutable de Dogfooding **no los ratifica ni los cierra institucionalmente**. Son el estado de hecho del disco, no una decisión de producto tomada. Cualquier observación de Dogfooding sobre el tab "Ideas" o sobre el módulo de Metas debe leerse con este contexto.

## Condiciones iniciales del experimento

- **Finalidad** (DOG-001 regla 4): determinar si SALDO resulta suficientemente útil para que Luis lo incorpore voluntariamente a tareas financieras reales.
- **Clasificación de salida al cierre de la ventana** (DOG-001 regla 9): A — señal positiva / B — señal mixta / C — señal negativa. No se decide por un incidente aislado ni por un bug corregible.
- **Fuera de alcance de esta fase** (DOG-001 regla 11): lanzamiento comercial, monetización, nueva investigación externa, expansión funcional general.

## Comprobación técnica mínima previa al inicio (2026-08-18, DOG-003)

Realizada sobre el working tree tal cual está (Estado Y), sin modificarlo:

- **Tests**: 72/72 archivos, 784/784 tests — verde.
- **Build** (`npx vite build`): exitoso, sin errores. Único aviso: `eval` en una dependencia de terceros (`lottie-web`), no bloqueante.
- **Arranque del dev server** (`npx vite`): limpio. Verificado con un navegador headless contra `http://localhost:5183/`:
  - 0 errores de consola, 0 requests fallidos, HTTP 200.
  - La ruta raíz sirve la landing page pública (`LandingPage`) — carga correctamente.
- **No verificado por el agente**: el Dashboard y los flujos financieros reales (alta de movimiento, Historial, Metas, etc.) requieren una sesión autenticada de Luis (Supabase). El agente no tiene credenciales ni las solicitó — verificar esos flujos con una cuenta real es, por diseño, la primera observación que le corresponde registrar a Luis, no algo que deba simularse de antemano.

---

## Evidencia externa (contexto — NO es una observación de Dogfooding)

Esta sección registra evidencia recibida desde fuera del uso de Luis (p.ej. encuestas de experiencia). **No debe mezclarse ni confundirse con las entradas de Dogfooding de la sección siguiente** — son dos fuentes distintas, con distinta naturaleza y distinto peso metodológico. Tampoco constituye evidencia de H1: es una respuesta externa recibida durante la ventana de Dogfooding, no parte de la ronda formal de investigación de H1.

### 2026-08-20 — Respuesta externa a encuesta de experiencia

**Hecho** (respuesta textual del usuario externo, sin editar):
- Comprensión inicial: "Llevar el registro de mis ingresos y egresos diarios." Facilidad 5/5, sin confusión, registró un ingreso sin ayuda.
- Utilidad: "Tener a la mano en donde me gasto el dinero." Entendió mejor sus gastos, "sí, mucho". Si SALDO desapareciera, extrañaría "tener a mano de manera inmediata el monto de mis egresos mensuales y mi saldo actual."
- Confianza: 3/5. "Siempre hay un poco de inseguridad de ingresar datos reales a la web en general. No se trata de algo específico de SALDO." Pediría "más control sobre mis datos".
- Qué mejoraría primero: **"Al realizar un egreso o ingreso de dinero no se puede modificar."**
- Uso futuro: usaría SALDO "todos los días"; preferiría "más que una página web... un app"; consejo: "excelente idea".

**Evidencia**: respuesta cerrada recibida por formulario, transcripta tal cual por el PO. Un solo caso, sin verificación directa por el agente de la sesión donde ocurrió.

**Interpretación (preliminar, no accionable por sí sola con n=1)**: señal positiva fuerte de comprensión, facilidad de uso y utilidad percibida. Señales a observar: confianza media, preferencia por app nativa, y el comentario sobre "no se puede modificar" — investigado técnicamente más abajo.

**Hipótesis**: el comentario sobre "no se puede modificar" no describe necesariamente una ausencia de capacidad — ver investigación técnica a continuación.

**Preferencia personal del usuario externo**: preferencia declarada por una app nativa en vez de una web — registrada como preferencia, no como requisito.

**Decisión**: ninguna tomada a partir de esta respuesta. Un solo caso externo no reabre ni valida H1 (que sigue en pausa por evidencia insuficiente) ni sustituye Dogfooding.

### Investigación técnica — descubribilidad de edición de movimientos (2026-08-20, agente, read-only)

**Hecho verificado en código** (no en runtime — no se ejecutó la app para esto): la edición de movimientos **existe y está completamente implementada e integrada**:
- `Historial.jsx` → clic/tap en una fila (`FilaMovimiento`, un `<button>` real) expande el detalle en línea (desktop) o abre una `Sheet` (mobile/tablet) con `ExpansionDetalle.jsx`, que muestra un botón **"Editar"** (y "Eliminar").
- "Editar" invoca `onEditMovement(movement)` → `App.jsx` → `setEditingMovement` → se abre `NewMovementSheet` en modo edición (`isEditMode = movement != null`), con los campos precargados y el botón "Añadir" reemplazado por **"Guardar"**.
- Al guardar, llama a `onUpdateIncome`/`onUpdateExpense`, ambos conectados a `updateIncome`/`updateExpense` de `useTransactions()` — el mismo hook que persiste todo lo demás. No hay ningún stub ni TODO en esta ruta.
- Rutas alternativas también funcionales: tecla `E` con la fila enfocada (desktop, roving tabindex); gesto de swipe hacia la izquierda en la fila (`FilaDeslizable.jsx`, solo mobile) revela los mismos botones Editar/Eliminar.

**Hecho verificado sobre descubribilidad — ausencia total de affordance visual**:
- `FilaMovimiento.jsx` no tiene ningún ícono, chevron, ni indicador de que la fila es interactiva. El único indicio es `hover:bg-ds-interaction-hover` — **solo existe en desktop** (hover no existe en touch) — y `cursor-pointer`, igualmente inútil en mobile.
- El gesto de swipe (`FilaDeslizable.jsx`) está `aria-hidden` y posicionado fuera de vista hasta que el usuario ya lo está ejecutando — cero peek, cero animación de sugerencia, cero mención en pantalla.
- El atajo `E` no tiene ninguna leyenda visible en la UI (los comentarios de código mencionan "↑↓ recorren filas, Enter expande, E edita, ⌫ elimina, foco visible siempre" como intención de diseño, pero **no se encontró ningún texto de ayuda/leyenda renderizado en pantalla** — es una intención documental, nunca surfaced al usuario).
- **No existe ningún menú de "tres puntos" en el código actual** — se buscó explícitamente (`DotsThree`/`MoreVertical`/`kebab` y equivalentes) y no aparece en ningún componente de `src/`. La hipótesis de Luis ("cartelitos… desde los tres puntos del movimiento") describe un elemento que hoy no existe en la implementación; el mecanismo real es tap-para-expandir, no un menú.

**Clasificación del comentario del usuario externo**: no corresponde a A (no funciona) ni a D (funciona solo en ciertas circunstancias) ni a E (otra limitación) según lo verificado en código — corresponde a **C: la edición existe y funciona, pero su descubribilidad es deficiente**, agravada en mobile por la ausencia total de affordance visual (sin ícono, sin hover, sin peek de swipe, sin leyenda). No puede descartarse B (que el usuario específico no la haya encontrado en su sesión) como causa inmediata, pero C explica por qué B sería esperable dado el diseño actual.

**Sobre la hipótesis de los "cartelitos" (Luis)**: evaluación preliminar, no una decisión. Apunta en la dirección correcta (falta de indicación contextual), pero su formulación literal ("desde los tres puntos") no corresponde a la UI real — cualquier solución tendría que anclarse a lo que existe (la fila entera, o el gesto de swipe), no a un menú inexistente. No se comparan ni se recomiendan alternativas todavía — eso corresponde a un DECISION REQUIRED posterior si se decide actuar sobre esto.

---

## Entradas

### 2026-08-21 — Sesión 1 de uso real en producción (`https://saldo.risso-patron.com`)

Observaciones registradas por Luis usando la cuenta real, sobre el build desplegado en DOG-011 (commit `e72effd`). Clasificación Hecho/Interpretación/Preferencia-Pregunta, tal como fueron reportadas — no se investigó ni se corrigió nada de lo mencionado acá.

#### OBS-001 — Omnibar / navegación

**Hecho**: en producción, el Omnibar muestra y permite navegar a Ver Movimientos, Mis Metas, Planificación, Insights y Herramientas, además de buscar transacciones. En `@budgetRP_v1:dogfooding_events_v1` quedaron registrados eventos reales: `omnibar_open`, `omnibar_navigate → metas`, `omnibar_search_used → transaction`, `omnibar_navigate → herramientas`.

**Interpretación**: la instrumentación de DOG-011 está capturando correctamente eventos de uso real del Omnibar.

**Preferencia / Pregunta**: ninguna por ahora.

**¿Corrección habilitante?**: No aplica — no se reportó ningún bloqueo.

#### OBS-002 — Dashboard / prueba `dashboard_metas_click` (corregida — ver nota de precisión más abajo)

**Hecho**:
1. En la pantalla principal / Dashboard / Resumen, no se encontró un acceso visible a "Mis Metas" durante esta sesión.
2. Para acceder a "Mis Metas" fue necesario abrir el Omnibar.
3. Desde el Omnibar sí se pudo encontrar/navegar a "Mis Metas".
4. Una vez encontrada, la funcionalidad está bloqueada por PRO en la cuenta utilizada.
5. El mismo patrón ocurrió con el cambio de moneda: se realizó desde el Omnibar (ver OBS-003).

**Dos dimensiones distintas, no mezcladas**:
- **A. Descubribilidad** — Dashboard/Resumen: no se encontró acceso visible; el acceso sí se encontró mediante el Omnibar.
- **B. Disponibilidad** — Metas: bloqueada por PRO en la cuenta utilizada, independientemente de cómo se llegó ahí.

**Interpretación**: existe una posible cuestión de descubribilidad de Metas desde el Dashboard/Resumen, independiente del gating PRO. No se afirma todavía que sea un bug, ni que deba existir un acceso en Dashboard — ambas cosas quedan abiertas.

**Contexto ya documentado, no una investigación nueva de esta entrada**: por lectura de código previa (DOG-008/DOG-009), `DashboardHome.jsx` sí tiene un link "Mis metas" ya implementado (`Button variant="link"`, con conteo de metas activas). Que Luis no lo haya encontrado en esta sesión es información nueva y valiosa sobre descubribilidad real — no una contradicción de hechos, y no se investiga más a fondo en esta entrada.

**Relación con el evento `dashboard_metas_click`**: el evento sigue sin ejecutarse, y ahora con precisión sobre por qué: (1) no se encontró un acceso visible a Metas en Dashboard/Resumen durante esta sesión, y (2) el acceso que sí se encontró (vía Omnibar) lleva a una funcionalidad bloqueada por PRO. No se concluye que la instrumentación esté defectuosa — el evento no dispara porque el camino de Dashboard no se usó, no porque el mecanismo falle.

**Preferencia / Pregunta**: ¿la ubicación actual de Metas permite que un usuario que no conoce el Omnibar descubra fácilmente que la funcionalidad existe? Registrada como señal de Dogfooding, no como decisión de producto. Por separado, sigue pendiente determinar cómo verificar `dashboard_metas_click` sin una cuenta PRO o sin tocar el gating.

**¿Corrección habilitante?**: No.

#### OBS-003 — Cambio de moneda

**Hecho**: el selector de moneda permite cambiar de USD a ARS y volver a USD; se registraron correctamente `currency_change → ARS` y `currency_change → USD`. Sin embargo, el cambio de moneda visualizó el símbolo de la nueva moneda pero **no convirtió los importes visibles** de USD a ARS. Existen tasas ya almacenadas en `budget_currency_rates`, incluyendo USD, ARS, EUR, BRL y otras.

**Interpretación**: existe una posible discrepancia entre (1) la moneda de visualización seleccionada, (2) la conversión efectiva de los importes mostrados, y (3) la moneda original de cada movimiento. No se asume todavía si es bug, limitación intencional o gap de producto.

**Contexto ya documentado, no una investigación nueva de esta entrada**: esta observación coincide con un gap ya registrado en `docs/design/integration-debt.md` (fila 2026-07-29, `DEBT-CHARTS-CURRENCY-001`): varios componentes, incluyendo partes de `DashboardHome.jsx`, seguían mostrando importes en USD sin importar la moneda de visualización seleccionada — deuda conocida, pendiente de un ticket propio, no resuelta por `WRITE-DISPLAY-CURRENCY-001`. Se deja la referencia para que no se investigue como si fuera un hallazgo nuevo sin antes revisar esa fila.

**Preferencia / Pregunta**: explorar más adelante cómo debería comportarse SALDO con tenencias simultáneas en varias monedas. Caso real reportado por el usuario: 100 EUR recibidos como regalo, 50 BRL recibidos por un servicio, ahorro existente en ARS, movimientos habituales en USD — registrado como caso de uso multimoneda real para investigación futura.

**¿Corrección habilitante?**: No — no impide completar una tarea financiera real (el movimiento se registra igual, es un problema de presentación).

#### OBS-004 — Importación bancaria exitosa

**Hecho**: se realizó una importación real de un archivo TXT bancario; la importación funcionó y creó movimientos. El evento `import_start` quedó registrado correctamente.

**Interpretación**: la ruta básica de importación funciona en el escenario probado.

**Preferencia / Pregunta**: ¿qué ocurre si el usuario importa accidentalmente un archivo equivocado pero técnicamente válido (de otro período, de otra cuenta, duplicado, o el mismo archivo dos veces)? Registrado como pregunta de producto/UX para investigación posterior — no se hicieron pruebas destructivas sobre los datos actuales para responderla.

**¿Corrección habilitante?**: No aplica — no se observó ningún comportamiento incorrecto, es una pregunta sobre un escenario no probado.

#### OBS-005 — Reversibilidad de importaciones

**Hecho**: no se verificó ningún mecanismo de deshacer/rollback de una importación durante esta sesión.

**Interpretación**: todavía no se sabe si SALDO permite identificar y revertir de forma segura los movimientos introducidos por una importación concreta.

**Preferencia / Pregunta**: investigar más adelante cómo se identifica una importación, si los movimientos importados conservan algún vínculo con ella, si existe undo/rollback, cómo se evita una importación duplicada, y qué ocurre si el archivo es válido pero incorrecto. Sin implementar nada ahora.

**¿Corrección habilitante?**: No — es una pregunta de investigación, no un comportamiento incorrecto observado.

#### OBS-006 — Restricción PRO

**Hecho**: la funcionalidad correspondiente a la prueba de `dashboard_metas_click` (OBS-002) está bloqueada para la cuenta actual por condición PRO.

**Interpretación**: esta restricción debe mantenerse intacta durante la ventana de Dogfooding.

**Preferencia / Pregunta**: ninguna acción durante esta ventana.

**¿Corrección habilitante?**: No.
