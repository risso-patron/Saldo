# SALDO — Release Candidate 1 (RC-1)

**Versión objetivo:** v1.0.0-rc1

**Estado:** 🟡 En progreso

**Objetivo del Release**

Cerrar todos los problemas detectados durante la auditoría funcional del Release Candidate sin incorporar nuevas funcionalidades.

Durante este milestone queda prohibido:

- nuevas pantallas
- nuevas funcionalidades
- mejoras no relacionadas con QA
- refactors sin impacto directo en los bugs reportados

Cada incidencia deberá seguir el proceso aprobado:

Diagnóstico → Propuesta → Aprobación → Implementación → Evidencia → Commit

---

# Estado general

| Prioridad | Total | Pendientes | Resueltos |
|-----------|--------|------------|-----------|
| 🔴 Crítica | 1 | 0 | 1 |
| 🟠 Alta | 0 | 0 | 0 |
| 🟡 Media | 6 | 6 | 0 |
| 🔵 Baja | 1 | 0 | 1 |

Nota sobre "Media": RC-1.2, RC-1.3, RC-1.4, RC-1.5, RC-1.6 y RC-1.7 tienen su etapa de auditoría cerrada (ver detalle en cada ticket), pero ninguno cuenta como "Resuelto" en esta tabla porque los seis conservan alcance remanente (RC-1.2: bloqueado por D1, decisión de producto pendiente; RC-1.3: hallazgos M4/M5/M6 pendientes de decisión de diseño; RC-1.4: bloqueado únicamente por D2, decisión de producto pendiente — A3 fue clasificado como deuda de integración, no como decisión de producto, ver `docs/design/integration-debt.md`; RC-1.5: sin decisión de producto pendiente, con la adopción de i18n diferida a una fase posterior al Release Candidate; RC-1.6: hallazgo A4/M3 clasificado como deuda de integración, no como decisión de producto, ver `docs/design/integration-debt.md`; C1 implementado; A1–A3/M1–M6/B1–B4 retirados por pérdida de trazabilidad documental (ver detalle en la sección del ticket); RC-1.7: 4 hallazgos con revisión editorial de clasificación aplicada — todo hallazgo con descripción recuperable ya fue implementado (C1, A1, A3, A4, A5, A6, M1, M2, M3, M4); M6 diferido a Fase 3/RC-1.6 por decisión del PO; B1–B3 sin contenido recuperable en este documento ni en memoria, cerrados sin acción). En los seis, la auditoría está cerrada pero la implementación todavía no fue realizada en su totalidad. RC-1.3/A2 y RC-1.7 (salvo M6/B1–B3, ver detalle) son los que más avanzaron en implementación efectiva.

---

# Bugs críticos

## RC-1.1 — Cambio de tema no aplicado correctamente

Prioridad:
🔴 Crítica

Estado:
✅ Cerrado — implementado, verificado y commiteado.

Área:
Configuración / Tema

Descripción:

El cambio entre modo claro y modo oscuro presenta inconsistencias visuales.
La interfaz no refleja correctamente el tema seleccionado en todos los componentes.

Impacto:

Bloqueaba la experiencia global del usuario.

Criterios de aceptación (todos verificados con evidencia en navegador real antes del commit)

- El cambio debe reflejarse inmediatamente. ✅
- Todos los componentes respetan el tema activo. ✅
- No quedan colores mezclados. ✅
- El estado persiste al refrescar. ✅
- Desktop y Mobile verificados. ✅
- Sin errores de consola. ✅

Commit final

`91ee9ba55c037025faa08ab221d1586b5332e3ed` — fix(theme): corrige sincronización completa del sistema de temas

---

# Decisiones de producto pendientes (fuera del alcance inmediato de RC-1)

## D1 — ¿Debe "description" ser un campo opcional en movimientos?

Origen:
Auditoría técnica completa de RC-1.2 (Nuevo Movimiento). Hallazgo crítico (C1 del informe de auditoría): con un importe válido y una descripción vacía o de menos de 3 caracteres, guardar falla en silencio — sin mensaje de error, sin toast, sin cierre de la hoja. Contradice la Constitución de Diseño ("el único campo obligatorio es la cifra" / "un gasto a medias es un gasto válido").

Estado:
Pendiente de decisión de producto.

Por qué se saca del alcance inmediato de RC-1:
Una investigación de impacto arquitectónico posterior demostró que "description obligatoria" no es una validación aislada de un solo archivo, sino una regla de dominio distribuida en múltiples puntos de enforcement independientes entre sí, y que relajarla sin más introduce un riesgo real de pérdida silenciosa de datos. Por eso C1 deja de tratarse como una corrección puntual de Nuevo Movimiento y pasa a ser una decisión de arquitectura/producto propia.

Puntos de enforcement identificados (deben decidirse en conjunto, no aisladamente):

- **`src/utils/validators.js`** (`validateDescription`, invocada por `validateTransaction`) — validación central usada por crear/editar movimiento (`useTransactions.js`: `addIncome`, `addExpense`, `updateIncome`, `updateExpense`). Exige 3–100 caracteres.
- **Importación masiva** (`src/hooks/useTransactions.js`, función `addBulkTransactions`) — tiene su propia validación hardcodeada e independiente (`if (!description || !amount || amount <= 0)`) que NO pasa por `validators.js`. Relajar la validación central no tiene ningún efecto acá salvo que se toque explícitamente este archivo también.
- **Movimientos recurrentes** (`src/features/recurring/RecurringManager.jsx`, función `validate()`) — misma situación: validación propia, hardcodeada, independiente de `validators.js`.
- **Migración LocalStorage → Supabase** (`src/utils/dataMigration.js` y `src/utils/migrationUtils.js`) — **riesgo de pérdida de datos verificado**: ambos archivos descartan silenciosamente (`.filter(tx => tx.description && ...)`) cualquier transacción con descripción vacía durante la migración de datos anónimos locales hacia la cuenta del usuario. Si se permitieran movimientos sin descripción antes de corregir este filtro, esos movimientos desaparecerían sin aviso al migrar — la migración reportaría éxito con un conteo simplemente más chico.

Impacto secundario identificado (no bloqueante, informativo):
- El gráfico "Top comercios" (`chartHelpers.jsx`, `transformToTopMerchants`) ya agrupa las descripciones vacías bajo un bucket "Sin descripción" — si el campo pasa a ser opcional y de uso común, ese gráfico podría perder utilidad analítica.
- Los tests de `src/__tests__/validators.test.js` afirman literalmente el comportamiento actual (descripción vacía = inválida) y deberían actualizarse como parte de cualquier implementación futura de este cambio.

Decisiones pendientes del PO antes de poder implementar:
1. ¿Se relaja la validación en los 4 puntos a la vez, o solo en creación/edición manual (dejando importación masiva y recurrentes con su propia regla, por decisión explícita y documentada)?
2. ¿Se corrige el filtro de migración antes, junto con, o como condición previa al resto del cambio?
3. ¿Este tema se resuelve en una fase futura dentro de RC-1, o se convierte en un ítem de arquitectura de producto independiente, fuera del ciclo de Release Candidate?

Resolución prevista:
Ninguna todavía. Queda registrada para que el PO decida el alcance real del cambio antes de aprobar cualquier implementación. No bloquea el cierre de RC-1.2 en lo que respecta al resto de sus hallazgos (A1, A2, M1–M4, B1–B4 del informe de auditoría), que siguen en alcance para una futura fase de implementación, sujeta a aprobación separada.

---

## D2 — Gobernanza del catálogo de categorías

Origen:
Estudio de impacto arquitectónico solicitado sobre C2 (informe de auditoría de RC-1.4, Herramientas): el selector de categorías de la revisión de importación (`TransactionPreviewTable.jsx`) ofrece valores ("Comida", "Compras", "Ingresos") que no existen en el catálogo canónico `EXPENSE_CATEGORIES` (`constants/categories.js`: Vivienda, Alimentación, Transporte, Entretenimiento, Salud, Educación, Servicios, Otros).

Estado:
Pendiente de decisión de producto.

Por qué se saca del alcance inmediato de RC-1:
El estudio de impacto demostró que esto no es un picker aislado con una lista desactualizada, sino la ausencia de una única fuente de verdad para el catálogo de categorías en todo el dominio. Existen múltiples vocabularios de categoría mutuamente inconsistentes, ya generando datos no canónicos por al menos dos caminos en producción hoy, con evidencia de que el propio proyecto ya tenía "Comida" como dato de referencia desde etapas tempranas. El propio código ya reconoce este gap internamente (comentario en `src/core/categorizationEngine.js:56-59`, referencias cruzadas `HAL-009`/`HAL-010`, y una exploración previa en `openspec/changes/insights-ia-real/explore.md:33` que lo marca explícitamente "no tocar" pendiente de esta misma decisión). Por eso C2 deja de tratarse como una corrección puntual del picker de importación y pasa a ser una decisión de gobernanza de dominio propia.

Vocabularios de categoría existentes (múltiples fuentes, sin una única fuente de verdad):
- **`EXPENSE_CATEGORIES`** (`src/constants/categories.js`) — 8 valores canónicos, usados por los `<select>` de `NewMovementSheet.jsx`, `Historial.jsx` (filtro) y `RecurringManager.jsx`.
- **Prompt de IA de sugerencia individual** (`src/lib/groqProvider.js:20`, `src/lib/ai-providers.js:207`) — 8 valores, pero con "Comida" en vez de "Alimentación".
- **Motor de reglas de importación masiva** (`src/core/categorizationEngine.js`, `DEFAULT_RULES`) — 10 valores, incluye "Comida", "Compras" e "Ingresos" como categorías de primera clase, deliberadas (no typos).
- **Picker de revisión de importación** (`src/features/import/TransactionPreviewTable.jsx`) — mismo vocabulario de 10 valores que el motor de reglas, el hallazgo original de C2.
- **Detección OCR de recibos** (`src/hooks/useVisionScanner.js`) — vocabulario propio de 6 valores, actualmente inofensivo por construcción (código muerto, no montado).

Puntos de creación identificados (algunos validan, otros no):
- `useTransactions.js` (`addExpense`/`updateExpense`, creación/edición manual) — **sí valida** contra `EXPENSE_CATEGORIES` vía `validateCategory`. Efecto colateral: cuando la IA sugiere "Comida" en `NewMovementSheet.jsx`, el guardado se rechaza en silencio (mismo patrón de falla silenciosa que D1, por una vía distinta).
- `addBulkTransactions` (`useTransactions.js`, importación masiva) — **no valida categoría en absoluto**.
- `categorizeMultiple` (`useTransactions.js`) — tampoco valida, pero sin consumidor de UI en vivo hoy (código dormido).
- `RecurringManager.jsx` — limpio, restringido a `EXPENSE_CATEGORIES` por construcción de su propio formulario.

Puntos de consumo identificados (ninguno falla ante una categoría desconocida; el riesgo es fragmentación, no excepciones):
- `Historial.jsx` — el filtro de categoría solo lista las 8 canónicas; una transacción con categoría no canónica queda invisible vía ese filtro (aunque visible bajo "Todo"). Su buscador de texto no compara contra categoría en absoluto.
- `Omnibar.jsx` (⌘K) — sí compara contra categoría además de descripción, a diferencia de Historial — inconsistencia entre las dos superficies de búsqueda del mismo dato.
- `calculateCategoryAnalysis`/`getCategoryDominance` (`calculations.js`) y todos los gráficos de categoría — agrupan por el string crudo sin cruzar contra el catálogo canónico.
- Exportaciones CSV/PDF — imprimen el valor tal cual, sin validar.

Riesgo de fragmentación de datos:
Cualquier valor no canónico se convierte en su propio bucket en análisis y gráficos, en vez de sumarse al bucket canónico correspondiente (ej. "Alimentación" y "Comida" nunca se combinan), degradando silenciosamente la precisión de insights y estadísticas sin que nada lo señale como error.

Ausencia de normalización histórica:
No existe ningún script SQL, utilidad de backfill, ni lógica de migración que haya normalizado nunca los valores de categoría — confirmado revisando los 6 archivos `.sql` del repositorio (ninguno define un CHECK constraint ni enum sobre la columna `category`) y los scripts de migración LocalStorage→Supabase (`dataMigration.js`, `migrationUtils.js`), que pasan `category` de forma completamente verbatim, sin transformación. No se puede confirmar sin acceso a producción si ya existen datos reales con categorías no canónicas, pero el propio script histórico de configuración del proyecto (`supabase-setup.sql:172`) usa "Comida" como dato de ejemplo/semilla desde etapas tempranas.

Decisiones pendientes del PO antes de poder implementar nada:
1. ¿Cuál es la política única para el catálogo de categorías — se amplía `EXPENSE_CATEGORIES` para absorber "Comida"/"Compras"/"Ingresos", se unifica todo hacia las 8 categorías actuales, o se define una tercera taxonómía?
2. ¿Qué se hace con datos ya persistidos con categorías no canónicas, si los hubiera (backfill, normalización, o convivencia deliberada)?
3. ¿La política se aplica a todos los puntos de creación por igual (incluidos los dormidos, como `categorizeMultiple`), o se prioriza primero a los que ya están activos en producción?
4. ¿Se resuelve también la inconsistencia entre Historial y Omnibar sobre si la búsqueda considera la categoría, como parte de la misma política?

Resolución prevista:
Ninguna todavía. Queda registrada para que el PO defina la política única del catálogo antes de aprobar cualquier implementación. No bloquea el resto de RC-1.4 en lo que respecta a sus otros hallazgos (C1, A1, A2, M1–M5, B1–B6 del informe de auditoría), que siguen en alcance para una futura fase de implementación, sujeta a aprobación separada. (A3 no forma parte de esta lista: fue clasificado como deuda de integración, no como hallazgo pendiente de implementación bajo este proceso — ver `docs/design/integration-debt.md`.)

---

# Bugs medios

## RC-1.2 — Nuevo Movimiento

Estado:
🟡 Auditoría cerrada — implementación pendiente. Hallazgo crítico (C1: falla silenciosa de guardado con descripción inválida) reclasificado y sacado de alcance — ver "D1" en Decisiones de producto pendientes, arriba (bloquea D1 hasta que el PO decida el alcance real del cambio). Resto de hallazgos (A1 — atajo ⌘Z ausente; A2 — orden de categorías sugeridas; M1 — chip "Hoy" visible en estado vacío; M2/M3 — fecha/cuenta no editables en creación, ya documentados como deuda de Fase III; M4 — integration-debt.md desactualizado tras RC-1.1; B1–B4 — code smells menores) permanecen en alcance de RC-1.2 para una futura fase de implementación, pendientes de aprobación separada.

Prioridad:
🟡 Media

---

## RC-1.3 — Historial

Estado:
🟡 Auditoría cerrada — A2 implementado y commiteado (`730d42a`); resto documentado (diferido/descartado/pendiente de decisión, ver detalle). A2 (nombre accesible contextual en FilaMovimiento, sin el cual los lectores de pantalla anunciaban una concatenación de texto sin contexto) — ver commit citado. A1 (virtualización de la lista — sin límite de filas montadas en el DOM) queda explícitamente fuera de alcance de RC-1, documentado como mejora de arquitectura para una versión futura. M1 (recálculo de "Hoy"/"Ayer" a medianoche) no se implementa mientras no exista un bug reproducible — el código no tiene mecanismo dedicado, pero no se confirmó como visible en la práctica. M2 (nota de IA ausente) y M3 (campos "Cuenta"/"Nota" ausentes) sin cambios — ya eran decisiones de alcance documentadas en el propio código, no hallazgos nuevos. M4 (ingresos sin signo "+"), M5 (sin "Exportar" ni título "Movimientos" en el encabezado) y M6 (copy del banner de sincronización difiere del mockup) quedan pendientes de decisión de producto/diseño — ninguno bloquea el resto del checkpoint. B1 (búsqueda no tolerante) y B2 (Backspace elimina sin colchón adicional) sin acción.

Prioridad:
🟡 Media

---

## RC-1.4 — Herramientas

Estado:
🟡 Auditoría cerrada — implementación pendiente. Hallazgo C2 (categorías del picker de revisión de importación inconsistentes con `EXPENSE_CATEGORIES`) reclasificado y sacado de alcance — ver "D2" en Decisiones de producto pendientes, arriba (única decisión de producto pendiente de este ticket). Hallazgo A3 (arquitectura de información de "Herramientas" vs. Product Blueprint) analizado y clasificado: **no constituye una Decisión de Producto** — el Blueprint ya define la arquitectura objetivo (Exportar → Perfil y ajustes; Importación → superficie propia). Se registró como deuda de integración en `docs/design/integration-debt.md` (fila 2026-07-22), no como D3. Resto de hallazgos del informe de auditoría (C1 — colores permanentes rojo/verde en `TransactionPreviewTable.jsx`; A1 — exportar sin confirmación; A2 — importar sin deshacer; M1–M5; B1–B6) permanecen en alcance de RC-1.4 para una futura fase de implementación, pendientes de aprobación separada.

Prioridad:
🟡 Media

---

## RC-1.5 — Internacionalización

Estado:
🟡 Auditoría cerrada. No genera una nueva Decisión de Producto (no hay D3) ni una nueva entrada en `integration-debt.md`. La auditoría concluyó que la infraestructura de i18n (`react-i18next`, `i18next-browser-languagedetector`, los 3 locales `es`/`en`/`fr` estructuralmente idénticos, `LanguageSelector.jsx` con `i18n.changeLanguage()` funcional) ya existe y funciona correctamente — es decir, la decisión de producto de soportar 3 idiomas ya está tomada y ejecutada en la infraestructura, no falta definirla. Lo que queda pendiente es la adopción/migración gradual de las pantallas activas hacia esa infraestructura (hoy solo `ProfilePage.jsx` la usa de verdad, ~90% de cobertura; el resto de la superficie montada — Dashboard, Historial, Nuevo Movimiento, Herramientas, Omnibar, Gráficos, shell del Design System — está en 0%, con texto hardcodeado en español). Esto se registra como **implementación pendiente para una fase posterior al Release Candidate**, no como alcance abierto de RC-1.

Hallazgo funcional real, separado de la migración de textos:
`formatCurrency()` (`src/utils/formatters.js:13`) usa un locale hardcodeado (`'es-419'`), y `src/features/export/exportUtils.js` usa un locale hardcodeado distinto (`'es-ES'`) para fechas en CSV/PDF. Ambos comportamientos impiden que el formato de fechas y montos siga el idioma activo de la aplicación, sin importar qué tan migrada esté la traducción de textos. Este es un **bug funcional real de internacionalización** — distinto de la simple existencia de strings hardcodeados — porque incluso si toda la UI se tradujera perfectamente, las cifras y fechas seguirían mostrándose con formato fijo en español. Queda identificado como hallazgo independiente dentro de RC-1.5, sin proponer solución ni implementación.

Resto de hallazgos de la auditoría (strings hardcodeados por pantalla, uso parcial de `t()`, namespaces huérfanos, pantallas legacy con i18n implementado pero sin consumidor vivo, inconsistencias como `ConfirmDialog`/`dsNavItems.js`, ausencia de tests dedicados) permanecen clasificados como **implementación diferida**, no como decisiones de producto ni deuda de integración — consistente con la conclusión de que la infraestructura ya es suficiente y lo pendiente es ejecución, no definición.

Prioridad:
🟡 Media

---

## RC-1.6 — Paywall

Estado:
🟡 Auditoría cerrada — C1 implementado (ver detalle abajo), A1–A3/M1–M6/B1–B4 retirados por pérdida de trazabilidad documental (ver "Regularización documental" abajo). Hallazgo A4/M3 (divergencia entre el `UpgradeModal` reactivo actual y la experiencia de Suscripción definida por el Product Blueprint — página propia en Perfil vs. modal disparado desde funciones bloqueadas) analizado y clasificado: **no constituye una Decisión de Producto** — el Blueprint ya define la arquitectura objetivo (página propia en Perfil y ajustes, invitación contextual, máximo una vez al mes, sin presión ni urgencia artificial). Se registró como deuda de integración en `docs/design/integration-debt.md` (fila 2026-07-23), no como D3.

**C1 (parcial, pieza 1/3) — gate de tarjetas de crédito implementado y commiteado (`868f840`).** C1 ("gate ausente en tarjetas/metas/gráficos avanzados") bundlea 3 áreas con nivel de definición distinto — se implementó únicamente la pieza sin ambigüedad: `CreditCardManager.jsx` permitía crear tarjetas de crédito sin ningún límite de plan, pese a que la infraestructura de gating (`useSubscription`/`hasFeature`, copy de `UpgradeModal` para `'credit_cards'`) ya existía completa y nunca se conectó — confirmado cruzando `PricingPlans.jsx` ("Sin tarjetas de crédito" en Free / "Gestión de tarjetas de crédito" en PRO) contra el código real. `handleAddCard` ahora verifica `hasFeature('credit_cards')` antes de crear la tarjeta — si falta el plan, abre `UpgradeModal` (`feature="credit_cards"`) en vez de agregarla, mismo patrón ya usado en `ExportManager.jsx`. Gestión de tarjetas ya existentes (editar deuda, eliminar, visualizar) sin cambios — fuera de este hallazgo. Sin tocar `PricingPlans.jsx`, `UpgradeModal.jsx`, `App.jsx` ni `useSubscription.js`. Evidencia: 2 tests nuevos (`CreditCardManager.test.jsx`, no existía archivo dedicado antes), suite completa en verde (60 archivos / 694 tests), build en verde, y validación en navegador real: usuario Free intenta crear una tarjeta → se abre `UpgradeModal` con la copy "💳 Tarjetas de Crédito", la tarjeta no se crea; usuario PRO crea la tarjeta normalmente (visible con su límite y saldo disponible), sin ningún modal, sin errores de consola.

**C1 (parcial, pieza 2/3) — límite de metas para Free implementado y commiteado (`ab32c10`).** `GoalManager.jsx` permitía crear metas financieras sin ningún límite, pese a que la infraestructura de gating (`hasFeature('unlimited_goals')`, copy de `UpgradeModal`: "🎯 Metas Ilimitadas") ya existía completa y nunca se conectó. Regla de negocio confirmada objetivamente en `PricingPlans.jsx` (no inferida): Free = "Hasta 3 metas financieras", PRO = "Metas financieras ilimitadas"; no existe en ningún otro lugar del código una constante o lógica de límite previa. `handleSubmit` ahora verifica `hasFeature('unlimited_goals')` **y** `goals.length >= 3` antes de crear una meta adicional — si el usuario es Free y ya tiene 3 metas, abre `UpgradeModal` (`feature="unlimited_goals"`) en vez de crearla; con menos de 3 metas, o con plan PRO, el comportamiento es exactamente el mismo que antes. Edición de progreso, eliminación, visualización y cálculo de proyección de metas existentes sin cambios — fuera de este hallazgo. Sin tocar `PricingPlans.jsx`, `UpgradeModal.jsx`, `App.jsx`, `useSubscription.js` ni `CreditCardManager.jsx`. Evidencia: 3 tests nuevos (`GoalManager.test.jsx`, no existía archivo dedicado antes: Free con <3 metas crea normalmente, Free con 3 metas bloquea la 4ª con el modal, PRO con 3+ metas crea sin límite), suite completa en verde (61 archivos / 697 tests), build en verde, y validación en navegador real: usuario Free crea 3 metas sin problema, al intentar la 4ª se abre `UpgradeModal` con la copy "🎯 Metas Ilimitadas" y la meta no se crea; usuario PRO crea una 4ª meta sin ningún modal, sin errores de consola.

**C1 (parcial, pieza 3/3, cierra C1) — gate de gráficos avanzados implementado y commiteado (`6216dd7`).** No existía en ningún lugar del código una definición de qué gráficos de `ChartsTab.jsx` correspondían a "básico" (Free) vs "avanzado" (PRO) — se hizo un relevamiento (sin código) de los 4 gráficos existentes, su propósito funcional, y la documentación previa disponible. Se encontró `docs/technical/MONETIZATION_STRATEGY.md` con una clasificación previa, pero contradictoria consigo misma (Balance Donut Chart y Category Bar Chart aparecían nombrados a la vez como "básicos" y dentro de la lista de "Gráficos Avanzados" PRO) y no verificable 1:1 contra el código actual. El Product Owner tomó la decisión de producto explícita: **Free** = `BalanceDonutChart` + `CategoryBarChart` (comprensión de la situación financiera actual); **PRO** = `MonthlyCashFlowChart` + `SpendingByDayChart` (capacidades de análisis de tendencias y patrones temporales) — como fuente de verdad única, independientemente de las inconsistencias detectadas. `ChartsTab.jsx` ahora reemplaza los 2 gráficos PRO por un placeholder "Función PRO" (mismo badge ya usado en `ExportManager.jsx`) cuando `!hasFeature('advanced_charts')`, que abre `UpgradeModal` (`feature="advanced_charts"`) al hacer click en "Actualizar" — sin modificar los componentes de visualización (`MonthlyCashFlowChart.jsx`/`SpendingByDayChart.jsx` intactos), su lógica de cálculo, estilos, ni la estructura del dashboard. `docs/technical/MONETIZATION_STRATEGY.md` actualizado en el mismo commit para eliminar la contradicción y dejar esta clasificación como la única vigente para los 4 gráficos actualmente implementados. Evidencia: 3 tests nuevos en `ChartsTab.test.jsx` (Free ve 2 badges "Función PRO" y ningún gráfico PRO real; click en "Actualizar" abre `UpgradeModal` con la copy "📊 Gráficos Avanzados"; PRO no ve ningún badge y ambos gráficos se muestran), suite completa en verde (61 archivos / 700 tests), build en verde, y validación en navegador real (tab Insights): Free ve "Balance General"/"Top 5 Categorías" normalmente y "Flujo de Caja Mensual"/"Gastos por Día de la Semana" bloqueados con el badge; PRO ve los 4 gráficos sin ningún modal; sin errores de consola en ningún caso.

**Con esta pieza, C1 de RC-1.6 queda completo en sus 3 piezas** (tarjetas de crédito, límite de metas, gráficos avanzados). **RC-1.6 se da por finalizado en lo implementable** — ver "Regularización documental — retiro de A1–A3, M1–M6, B1–B4" a continuación.

---

### Regularización documental — retiro de A1–A3, M1–M6, B1–B4 (RC-1.6)

Un relevamiento documental exhaustivo (búsqueda en `docs/release/RC-1.md`, `docs/technical/*`, `docs/design/*`, `docs/product-master/*`, memoria persistente del proyecto e historial de git completo) confirmó que los identificadores **A1, A2, A3, M1, M2, M3, M4, M5, M6, B1, B2, B3, B4** de RC-1.6 provienen de una auditoría realizada en una conversación de una sesión anterior (2026-07-23), cuyo contenido **nunca fue persistido en el repositorio** — ni como archivo propio, ni como sección de `RC-1.md`, ni como memoria con el detalle completo. Solo quedó registro de que la auditoría se realizó y fue entregada, sin ninguna descripción funcional, evidencia, clasificación, estado o dependencia recuperable para cada ítem individual.

**Decisión de ingeniería (PO):**
- La auditoría original de estos 13 ítems **no es recuperable**.
- Los identificadores **A1–A3, M1–M6 y B1–B4 de RC-1.6 quedan formalmente retirados**.
- Estos identificadores **no deben reutilizarse** como referencia para trabajo futuro, ni reconstruirse por inferencia a partir del estado actual del código.
- Cualquier mejora futura del sistema de Paywall más allá de C1 (ya cerrado, con trazabilidad completa) deberá originarse en una **auditoría nueva, con numeración propia y documentación persistida desde el inicio** — nunca por referencia a estos identificadores retirados.

**Regla vigente a partir de esta decisión, para todo RC-1 (no solo RC-1.6):** ningún hallazgo puede recibir un identificador oficial (`H-001`, `A3`, `M4`, etc.) hasta que su descripción completa haya sido persistida en el repositorio. Un identificador sin documentación no forma parte de la fuente de verdad del proyecto.

Prioridad:
🟡 Media

---

## RC-1.7 — Toasts y sistema de feedback

Estado:
🟡 Auditoría cerrada — implementación pendiente. Revisión editorial de clasificación aplicada sobre 4 hallazgos: **A2** ("eco" en importación masiva — `Alert` banner y panel inline propio de `ImportManager` disparados simultáneamente para el mismo evento) reclasificado de "desviación respecto del Blueprint" a **deuda de integración respecto de la Saldo Experience Constitution (E14)** — la regla "Cada hecho se comunica por un solo canal, una sola vez" (sin eco) pertenece a la Experience Constitution, no al Blueprint; la implementación reproduce exactamente el anti-patrón "El eco" ya nombrado en ese documento; la fuente de verdad ya existe y la implementación aún no migró a ella. **A3** (stacking en `AchievementNotification`, único de los cinco mecanismos de feedback auditados que apila notificaciones) reclasificado de "desviación respecto del Blueprint" a **deuda de integración respecto de la Saldo Design Constitution** — la regla "Uno a la vez; nunca apilan" pertenece a la especificación del componente Toast de la Design Constitution; la arquitectura objetivo ya está definida y el comportamiento actual todavía no migró hacia ella. **M5** (exportación CSV/PDF exitosa sin ningún feedback) reducido de prioridad Media a **Baja** — no existe una obligación documental vigente que exija mostrar confirmación tras una exportación exitosa; la taxonomía oficial del sistema de feedback del proyecto no incluye la exportación entre las confirmaciones requeridas; el hallazgo permanece únicamente como observación de asimetría entre el tratamiento del éxito y del error, sin constituir una regla de producto incumplida. **M7** (ausencia de `AlertProvider`/`AlertContext`) **retirado del listado formal de hallazgos de RC-1.7** — hoy no existe comportamiento observable incorrecto (única instancia de `Alert` en toda la app) ni ninguna regla documental que exija una implementación basada en Context; queda únicamente como observación de arquitectura futura, fuera del alcance de RC-1.

**M6 — diferido a Fase 3 (RC-1.6), sin implementar en esta fase.** No existe en este documento (ni en memoria persistente del proyecto) ninguna descripción del contenido del hallazgo más allá de su ubicación — el propio roadmap (sección "Fase 3 — RC-1.6") ya indicaba que "M6 de RC-1.7 se resuelve en el mismo archivo, `PricingPlans.jsx`", junto con el resto de los hallazgos del Paywall. Se revisó `PricingPlans.jsx` en busca de algún comentario de checkpoint que documentara el gap (mismo método usado para A6/M2/M3) — no hay ninguna referencia a M6 ni a RC-1.7 en el archivo. Dado que (a) no hay comportamiento observable identificable a corregir sin una descripción del hallazgo, y (b) `PricingPlans.jsx` fue explícitamente excluido de alcance en A5 ("queda fuera de alcance, sin tocar"), el PO decidió respetar la secuencia ya planificada: M6 se retoma en la Fase 3 (RC-1.6), junto con el resto del trabajo de Paywall, en vez de implementarse ahora como excepción.

**B1–B3 — sin contenido recuperable, RC-1.7 se da por agotado en lo implementable.** Al igual que M6, B1–B3 no tienen ninguna descripción de contenido en este documento ni en memoria persistente del proyecto — solo aparecían como etiquetas en la lista de "resto de hallazgos pendientes", sin ningún detalle recuperable de qué son. Se confirmó que ningún otro B1/B2/B3 presente en otras secciones de este documento pertenece a RC-1.7 (los únicos con descripción real corresponden a RC-1.2, RC-1.3 y RC-1.8, tickets distintos). El PO decidió no reconstruir estos hallazgos de memoria y cerrar RC-1.7 como agotado en lo implementable: todo hallazgo con descripción recuperable ya fue implementado (C1, A1, A3, A4, A5, A6, M1, M2, M3, M4); M6 queda diferido a Fase 3 (RC-1.6, ver detalle arriba); B1–B3 quedan sin acción por falta de contenido, sin bloquear el cierre de RC-1.7.

**M3 — implementado y commiteado (`52fcf1b`).** `BannerErrorSincronizacion.jsx` no tenía ningún atributo de accesibilidad — al montarse/desmontarse condicionalmente en `Historial.jsx` (`{syncError && <BannerErrorSincronizacion .../>}`) cuando falla la sincronización, un usuario de lector de pantalla no recibía ningún aviso al aparecer. Se agrega `role="status"` (mismo patrón ya usado por `Toast.jsx` y `AIStatusNotice.jsx` para mensajes de estado no urgentes, coherente con el propio spec del componente: "ámbar tenue, nunca rojo" — no `role="alert"`, reservado para errores de validación bloqueantes). Sin cambios de JSX, estilos ni comportamiento; sin `aria-live`/`aria-atomic`/`aria-label` explícitos agregados. Sin tocar `Historial.jsx`, `Toast.jsx` ni ningún otro componente. Evidencia: 4 tests nuevos (`BannerErrorSincronizacion.test.jsx`, no existía archivo dedicado antes), suite completa en verde (59 archivos / 692 tests), build en verde, y validación en navegador real (Movimientos con `syncError` forzado): el banner aparece con `role="status"` y el texto exacto "No pudimos actualizar desde tu banco. Reintentar ahora", conserva el mismo aspecto visual, "Reintentar ahora" sigue disparando el reintento sin errores de consola, y sin `syncError` el banner no aparece.

**M2 — implementado y commiteado (`8fd4e87`).** `ConfirmDialog.jsx` ya tenía `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`, cierre con Escape y foco inicial en "Cancelar" — le faltaba únicamente la trampa de foco (Tab podía escapar del diálogo hacia la página detrás del backdrop, que seguía bloqueado solo visualmente). Se reemplazan el `useEffect` de Escape y el `autoFocus` manuales por `useModalA11y` (mismo hook ya probado en `UpgradeModal`/`AccountSettingsModal`, RC-1.7/A5) — decisión explícita del PO de reutilizar la infraestructura existente en vez de un fix aislado limitado solo al trap, que además agrega focus-restore-on-close y bloqueo de scroll del body (comportamientos ausentes hoy, no nombrados por el título de M2 pero aprobados junto con la reutilización del hook). Sin cambios visuales ni de estructura; sin tocar `Sheet.jsx`, `useModalA11y.js` ni otros diálogos. Evidencia: 10 tests nuevos (`ConfirmDialog.test.jsx`, no existía antes), suite completa en verde (58 archivos / 688 tests), build en verde, y validación en navegador real (Omnibar → "Vaciar datos locales" → diálogo "Limpiar todo"): foco inicial en "Cancelar", Tab → "Sí, eliminar todo" → Tab de nuevo vuelve a "Cancelar" (trampa confirmada), Shift+Tab desde "Cancelar" va a "Sí, eliminar todo", Escape cierra el diálogo.

**A6 — implementado y commiteado (`505d87c`).** `handleSignOut` en `ProfilePage.jsx` descartaba el `{ error }` que `signOut()` (`AuthContext.jsx`) ya devuelve correctamente — único punto de entrada de logout en toda la app (confirmado por grep) — dejando un fallo silencioso sin ningún feedback al usuario si Supabase rechazaba el cierre de sesión. Ahora, si `signOut()` falla, se informa vía `onShowAlert('error', 'Error al cerrar sesión: ' + error)`, reutilizando exactamente el mismo formato de mensaje que `AccountSettingsModal.jsx` ya usa para errores de este dominio (auth) — no el formato usado para errores de sincronización de transacciones. Sin cambios en `AuthContext.jsx` ni en el caso exitoso (no se agrega un toast de éxito nuevo; la navegación a `AuthPage` ya ocurre automáticamente vía `onAuthStateChange`). Evidencia: 2 tests nuevos (6/6 en `ProfilePage.test.jsx`), suite completa en verde (57 archivos / 678 tests), build en verde, y validación en navegador real de ambos casos (Ajustes → Cerrar sesión): fallo simulado muestra "Error al cerrar sesión: Network request failed"; caso exitoso sin ninguna alerta espuria.

**A4 — implementado y commiteado (`e03b866`).** `updateIncome`, `updateExpense`, `addBulkTransactions` y `categorizeMultiple` ganan `options.notification: 'toast'` (mismo patrón ya usado por `addIncome`/`addExpense` desde el Checkpoint IV-C) — reemplaza el `Alert` de éxito por una operación reversible vía `pendingOperation`, con nuevos `kind`s `'update'`, `'bulkCreate'` y `'categorizeMultiple'`, cada uno con su rama de revert + compensación contra Supabase en `undoPendingOperation`, y un `pendingOperationMessage` centralizado para el texto del Toast según el `kind` activo. Único puntos de entrada actualizados: `NewMovementSheet.jsx` (modo edición) y `App.jsx` (importación masiva) — `ImportManager.jsx`, su panel inline y el hallazgo A2 quedan explícitamente fuera de alcance, sin tocar. `categorizeMultiple` se incluyó pese a no tener consumidor de UI en vivo hoy (Checkpoint IV-A) — se intentó con la misma infraestructura sin encontrar ningún bloqueo real que ameritara excluirlo, por decisión explícita del PO. Evidencia: 12 tests nuevos (44/44 en `useTransactions.test.js`), suite completa en verde (57 archivos / 676 tests), build en verde, y validación en navegador real de los tres flujos: edición (Historial → Editar → Guardar muestra "Gasto actualizado" con Deshacer, y Deshacer restaura el valor anterior confirmado contra el store simulado de Supabase), importación masiva (CSV → "1 transacciones importadas" con Deshacer, y Deshacer vacía el store simulado) y creación (sin regresión, ya cubierto desde Checkpoint IV-C).

**A5 — implementado y commiteado (`930bbf1`).** `UpgradeModal.jsx` y `AccountSettingsModal.jsx` tenían cero atributos de accesibilidad — nuevo hook `useModalA11y` (misma lógica ya probada en `Sheet.jsx`, extraída sin tocar ese archivo) les agrega `role="dialog"`, `aria-modal`, `aria-labelledby`, cierre con Escape, trampa de foco (Tab), foco inicial y retorno de foco al cerrar. Sin cambios visuales ni de arquitectura del Paywall — `PricingPlans.jsx` queda fuera de alcance, sin tocar. Evidencia: 18 tests nuevos (9 por modal), suite completa en verde (57 archivos / 664 tests), build en verde, y validación en navegador real de ambos modales (Ajustes de cuenta y Paywall vía Herramientas → Actualizar) confirmando atributos correctos, Escape funcional, foco inicial en el botón de cierre, y comportamiento funcional intacto (navegación de pestañas, transición a PricingPlans, CTAs).

**A1 — implementado y commiteado (`a447fac`).** Nuevo coordinador (`useFeedbackQueue`) garantiza un único slot activo entre los 4 mecanismos de feedback puramente visuales (`Alert`, `DailyOnboardingToast`, `AchievementNotification`, banner de bienvenida), con política FIFO — sin alterar la identidad visual de ninguno. El Toast de Deshacer (`pendingOperation`) no se coordina — conserva su propia autoridad de dominio; el coordinador solo se pausa mientras está activo, dándole prioridad sin absorber su lógica. Cierra en el mismo alcance: **A3** (`AchievementNotifications` ya no apila — opera sobre `achievements[0]`, nunca por índice capturado), **M1** (`FEEDBACK_DURATIONS` centraliza la política de duración, valores actuales sin cambios) y **M4** (se elimina el temporizador duplicado — `Alert.jsx` gana `autoDismiss`, `AchievementNotification` pierde su `onAnimationComplete` redundante). **A2** (eco en `ImportManager`) queda explícitamente fuera de este alcance, sin tocar. Evidencia: 11 tests nuevos, suite completa en verde (55 archivos / 646 tests), build en verde, y validación en navegador real con los 4 mecanismos disparados casi en simultáneo — secuencia FIFO confirmada con timestamps, sin superposición, prioridad del Toast de Deshacer respetada.

**C1 — implementado y commiteado (`ed2342c`).** Fallos de sincronización de escritura (`syncInsert`/`syncUpdate`/`syncDelete`×2/`syncDeleteMultiple`/`syncUpdateMultiple`) ahora revierten el cambio optimista y notifican el error vía `showAlert` — antes solo se logueaban en consola, dejando el estado local divergente del servidor de forma silenciosa. Bug preexistente adicional encontrado y corregido en el mismo alcance: `updateIncome`/`updateExpense`/`categorizeMultiple` nunca llegaban a invocar `syncUpdate`/`syncUpdateMultiple` (lectura de una variable de closure antes de que React invocara el updater de `setState`). Evidencia: 10 tests nuevos (3 con `React.StrictMode`), suite completa en verde (53 archivos / 635 tests), build en verde, y validación en navegador real (Landing/Auth sin errores de consola, más el flujo completo de edición con fallo de red simulado). Durante la implementación se reportó una posible discrepancia de comportamiento en una prueba manual; se investigó con 5 reproducciones independientes (detalle abajo) y se cerró como **No Reproducible** sobre la versión commiteada.

**Nota de investigación — discrepancia reportada durante la implementación de C1 (No Reproducible):** al implementar el revert + notificación de error para C1 (fallos de sincronización de escritura), se reportó una discrepancia de comportamiento observada en una prueba manual (el revert no se aplicaba y se mostraba una confirmación de éxito en vez de un error). Se investigó con 5 reproducciones independientes: la suite de tests automatizados; un probe directo contra el cliente real de `supabase-js` con `fetch` global sobreescrito; una reproducción en navegador con la request de red real abortada (Playwright); el flujo completo de la aplicación real (Historial → Editar → Guardar); y el snippet exacto de `window.fetch` provisto para la prueba manual original, inyectado antes de la carga de la app. Las 5 reproducciones, sobre la versión vigente del código, mostraron el comportamiento correcto (revert exacto al valor previo + alerta de error mostrada). No se encontró una causa en el código. Este hallazgo se cierra como **No Reproducible (N/R)** sobre la versión actual — solo debe reabrirse si aparece evidencia nueva y objetiva (pasos reproducibles, consola, commit exacto, captura u otro elemento verificable).

Prioridad:
🟡 Media

---

# Bugs bajos

## RC-1.8 — Código muerto, componentes huérfanos y deuda de limpieza

Estado:
✅ Cerrado — implementado, tests y build en verde (53 archivos / 625 tests), validado en navegador (Landing/Auth, sin errores de consola) y commiteado (`c9c4168`). Se confirmaron 10 hallazgos de código huérfano/muerto (`src/pages/b_E10dJewJ7UM/`, `ExpenseList.jsx`, `AppHeader.jsx`/`Sidebar.jsx` legacy, `ProfileMenu.jsx`, `ThemeToggle.jsx`, `BudgetForm.jsx`, `ReceiptScanner.jsx`, `MigrationPrompt.jsx`, `TransactionList.jsx`, `AIAlerts.jsx`), todos clasificados como **deuda técnica** de limpieza — ninguno requiere una decisión de producto ni una nueva entrada en `docs/design/integration-debt.md` (ese documento está circunscripto a la deuda de integración de Fase I-C/shell de navegación; `ProfileMenu.jsx`/`ThemeToggle.jsx` ya están documentados ahí, filas 22-23). Revisión editorial aplicada sobre 3 hallazgos: **A1** (`src/pages/b_E10dJewJ7UM/`) — se deja explícito que ya había sido identificado previamente en `docs/technical/DIAGNOSTICO_2026-07-07.md` (sección 4.3), por lo que no constituye un hallazgo nuevo sino una confirmación adicional. **A3** (`AppHeader.jsx` y el `Sidebar` legacy) — se corrige su caracterización: no constituyen un hallazgo nuevo no documentado, sino una precisión sobre la causa raíz ya implícitamente registrada en `docs/design/integration-debt.md` (filas 22-23, que atribuyen la orfandad de `ProfileMenu`/`ThemeToggle` a "el shell viejo, ya desmontado"); se mantiene la clasificación como deuda técnica, sin nuevas referencias ni entradas. **B1** (`AIAlerts.jsx`) — se deja explícito que su condición de componente huérfano responde a una decisión de diseño previamente documentada en `openspec/changes/insights-ia-real/proposal.md` (el patrón de alertas con badge/severidad fue descartado deliberadamente para esta versión, no es un olvido); se mantiene la clasificación como deuda técnica de limpieza.

Prioridad:
🔵 Baja

---

## RC-1.9

Estado:
⚪ Sin alcance definido — fuera del Release Candidate. Búsqueda exhaustiva (grep de todo el repositorio, historial de git, memoria persistente) no encontró ninguna evidencia de un alcance definido para este ticket en ningún documento del proyecto. Se excluye de RC-1.

---

## RC-1.10

Estado:
⚪ Sin alcance definido — fuera del Release Candidate. Misma verificación que RC-1.9, mismo resultado: sin evidencia de alcance definido. Se excluye de RC-1.

---

# Historial de commits

| Ticket | Commit | Estado |
|---------|--------|--------|
| RC-1.1 | `91ee9ba` | ✅ Cerrado |
| RC-1.2 | — (sin commit de implementación; auditoría cerrada, D1 pendiente de decisión de producto) | 🟡 Auditoría cerrada |
| RC-1.3 | `730d42a` (A2 — nombre accesible; A1 fuera de alcance, resto documentado/diferido) | 🟡 Auditoría cerrada — parcial |
| RC-1.4 | — (sin commit de implementación; auditoría cerrada, D2 pendiente de decisión de producto) | 🟡 Auditoría cerrada |
| RC-1.5 | — (sin commit de implementación; auditoría cerrada, sin decisión de producto pendiente) | 🟡 Auditoría cerrada |
| RC-1.6 | `868f840` (C1 pieza 1/3 — tarjetas de crédito), `ab32c10` (C1 pieza 2/3 — límite de metas), `6216dd7` (C1 pieza 3/3 — gráficos avanzados, C1 completo); A4/M3 clasificado como deuda de integración; A1–A3/M1–M6/B1–B4 retirados por pérdida de trazabilidad documental (ver detalle arriba) | ✅ Finalizado en lo implementable |
| RC-1.7 | `ed2342c` (C1), `a447fac` (A1 + A3 + M1 + M4), `930bbf1` (A5), `e03b866` (A4), `505d87c` (A6), `8fd4e87` (M2), `52fcf1b` (M3); M6 diferido a Fase 3/RC-1.6 (ver detalle arriba); resto — B1–B3 — sin commit todavía | 🟡 En progreso |
| RC-1.8 | `c9c4168` (Fase 1 del roadmap — 10 hallazgos de código muerto/huérfano eliminados) | ✅ Cerrado |

---

# Criterios para cerrar RC-1

- Todos los bugs críticos resueltos.
- Todos los bugs altos resueltos.
- Todos los bugs medios resueltos.
- Build en verde.
- Suite completa de tests en verde.
- Sin errores de consola.
- Validación manual Desktop.
- Validación manual Tablet.
- Validación manual Mobile.
- Working Tree limpio.

---

# Roadmap de implementación (orden recomendado)

> El orden responde exclusivamente a dependencias técnicas detectadas durante la auditoría de RC-1. No representa una priorización de valor de negocio, sino una estrategia para minimizar retrabajo y reducir riesgo de implementación.

## Fase 0 — Prerrequisitos administrativos

- Resolver **D1** (¿"description" opcional en movimientos?).
- Resolver **D2** (gobernanza del catálogo de categorías).
- ~~Definir alcance de RC-1.9 y RC-1.10~~ — resuelto: sin evidencia de alcance definido, ambos quedaron excluidos de RC-1 (ver secciones respectivas).

No bloquean el inicio de la Fase 1 — solo desbloquean, respectivamente, RC-1.2/C1 y RC-1.4/C2.

## Fase 1 — RC-1.8

Limpieza de código muerto y componentes huérfanos (los 10 hallazgos confirmados: `src/pages/b_E10dJewJ7UM/`, `ExpenseList.jsx`, `AppHeader.jsx`/`Sidebar.jsx` legacy, `ProfileMenu.jsx`, `ThemeToggle.jsx`, `BudgetForm.jsx`, `ReceiptScanner.jsx`, `MigrationPrompt.jsx`, `TransactionList.jsx`, `AIAlerts.jsx`). Sin dependencias, reduce el ruido de archivos huérfanos antes de tocar áreas adyacentes en las fases siguientes.

## Fase 2 — RC-1.7

Consolidación del sistema de feedback:

- Corrección del bug crítico de sincronización silenciosa (C1 — fallos de escritura en Supabase que no informan al usuario).
- Unificación de Toast/Alert (A1 — cinco mecanismos paralelos hoy; consolidarlos evita que RC-1.4 y RC-1.6 sigan agregando consumidores al sistema fragmentado).
- Undo (A2 — eco en importación; A4 — Undo faltante en editar/categorizar/importar, mismo trabajo técnico que RC-1.4/A2).
- Accesibilidad (A5 — `UpgradeModal`/`AccountSettingsModal` sin atributos ni manejo de teclado, corregido antes de que RC-1.6/C1 agregue nuevos triggers; M2 — focus trap en `ConfirmDialog`; M3 — a11y de `BannerErrorSincronizacion`).
- Resto de hallazgos (A3 — stacking en `AchievementNotification`; A6 — logout silencioso; M1 — duraciones sin política; M4 — temporizador duplicado; M5 — exportación exitosa sin feedback, prioridad baja).

## Fase 3 — RC-1.6

Corrección de bugs y hallazgos del sistema de Paywall **existente** (gate ausente en tarjetas/metas/gráficos avanzados — C1 — y resto de hallazgos A1-A3/M1-M6/B1-B4, incluyendo M6 de RC-1.7 que se resuelve en el mismo archivo, `PricingPlans.jsx`), reutilizando la infraestructura de feedback ya consolidada en la Fase 2 cuando corresponda.

Esta fase **no incluye** la implementación de la nueva arquitectura de Suscripción definida por el Product Blueprint (página propia en Perfil, invitación contextual, etc.) — el hallazgo A4/M3 permanece clasificado como deuda de integración fuera del alcance de RC-1 (ver `docs/design/integration-debt.md`, fila 2026-07-23) y no forma parte de este roadmap.

## Fase 4 — RC-1.4

Herramientas — resto de hallazgos (C1, A1, M1-M5, B1-B6; A2 puede ya estar resuelto como parte de la Fase 2).

Ejecutar únicamente **C2** cuando **D2** esté resuelta.

## Fase 5 — RC-1.2

Nuevo Movimiento — resto de hallazgos (A1, A2, M1, B1-B4).

Ejecutar únicamente **C1** cuando **D1** esté resuelta.

## Fase 6 — RC-1.5

Corrección del bug de locale (`formatCurrency`/`exportUtils` — `es-419` vs `es-ES`). Hallazgo aislado, sin dependencias con el resto del roadmap.

---

# Cierre de la fase de auditoría

La fase de auditoría de RC-1 (RC-1.1 a RC-1.8, incluida la Revisión Final de Consistencia) queda **concluida**. La documentación de `docs/release/RC-1.md` y `docs/design/integration-debt.md` se considera consistente y queda **aprobada como base para iniciar la implementación**.

- **D1** y **D2** permanecen **abiertas como decisiones de producto pendientes** — no bloquean el cierre documental de RC-1, solo bloquean, respectivamente, RC-1.2/C1 y RC-1.4/C2 dentro del roadmap.
- Las **deudas de integración** ya registradas (`docs/design/integration-debt.md`) continúan documentadas como tales y **fuera del alcance de RC-1** en los casos que corresponde (A3 de RC-1.4, A4/M3 de RC-1.6).
- El trabajo posterior a esta fase pasa a ejecutarse siguiendo el **Roadmap de implementación (orden recomendado)** aprobado arriba.