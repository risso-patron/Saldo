# Spec: `insights-ia-real` — comportamiento observable del MVP de IA real

**Fase**: sdd-spec (requisitos verificables — NO arquitectura ni contratos técnicos)
**Fecha**: 2026-07-14
**Base obligatoria**: `proposal.md` (aprobada, con Ajustes 1/2/3 ya incorporados)
**Sucesor**: sdd-design (resuelve el "cómo" técnico de cada requisito de abajo)

Cada Requirement cita la sección de `proposal.md` de la que se deriva. Formato Given/When/Then y
palabras RFC 2119 en cada uno, por regla del proyecto (`openspec/config.yaml → rules.specs`).

| Área | Título | Trazabilidad |
|---|---|---|
| 1 | Alcance del MVP | Decisión 1 |
| 2 | Retiro del bot falso | Decisión 2 / Q4 |
| 3 | Categorización asistida | Decisión 1, Decisión 4 (cap 15 §3) |
| 4 | Entrada única de IA | Decisión 3 |
| 5 | Sin acceso al feature (4 casos) | Decisión 5 |
| 6 | Consentimiento de privacidad | §7.1 |
| 7 | Minimización de datos por flujo | Decisión 7 |
| 8 | Gate de monetización | Decisión 6 |
| 9 | Rate limit — fuente única | Decisión 8 |
| 10 | Deuda técnica bloqueante | Decisión 9 |
| 11 | Dirección futura de AIChat | §10 |

---

## Requirements

### Área 1 — Alcance del MVP (trazabilidad: Decisión 1)

#### Requirement: La categorización asistida es la única punta de IA visible en el MVP

El sistema MUST exponer únicamente la categorización asistida como funcionalidad de IA visible en esta
versión. El sistema MUST NOT exponer ninguna otra superficie de IA (paneles, gráficos, alertas, estado de
proveedor, chat) como parte visible del MVP.

##### Scenario: Usuario nuevo ve solo categorización asistida

- **GIVEN** un usuario con acceso al feature de IA (plan y consentimiento activos)
- **WHEN** navega por cualquier pantalla de la aplicación
- **THEN** la única interacción de IA disponible es la sugerencia de categoría al cargar/editar un movimiento

#### Requirement: Criterio objetivo de activación de "Una idea sobre tu plata"

El sistema MUST NOT activar "Una idea sobre tu plata" para un usuario hasta que se cumplan **simultáneamente**
dos condiciones objetivas, evaluadas de forma acumulada desde el inicio de su historial (no en una ventana
móvil de 28 días): **(a) al menos 20 gastos con una categoría real asignada, excluyendo explícitamente
"Otros"**, y **(b) al menos 28 días transcurridos desde su primera transacción registrada** (de cualquier
tipo). Ambas condiciones MUST evaluarse de forma independiente entre sí — ninguna sustituye a la otra.

El valor **20** de la condición (a) es un **parámetro de producto**, elegido específicamente para evitar que
el sistema genere una recomendación a partir de una muestra estadísticamente insuficiente por categoría (ver
racional) — no una constante estructural incrustada en el diseño técnico. El sistema MUST tratar este número
como **configurable y recalibrable en el futuro** (por ejemplo, si datos reales de uso muestran que 15 o 25
produce hallazgos más precisos) **sin que ese ajuste implique un cambio de arquitectura**: sdd-design MUST
resolver que el mecanismo lea este valor de un único lugar de configuración de producto, nunca incrustado como
constante fija repetida en el código.

> **Racional (no delegable a sdd-design):** el promedio por categoría que alimenta el hallazgo se calcula por
> categoría, no en agregado total, y una persona típica registra gastos en un puñado de categorías activas
> (no en las 10-15 del catálogo) — por eso "N gastos con categoría real, totales" es el umbral realista, no "N
> por categoría" (que dejaría a la mayoría de los usuarios sin ver el hallazgo nunca). Con ~4-5 categorías
> activas típicas, un piso de 20 gastos con categoría real reparte en promedio ~4-5 datos por categoría activa:
> por debajo del mínimo informal de 3 puntos un promedio es ruido puro; 4-5 da un margen razonable por encima
> de ese piso sin exigir un volumen que retrase el hallazgo indefinidamente. Este es el criterio con el que 20
> se fija como parámetro de producto inicial — no una constante matemática derivada, sino una primera
> calibración razonable, en el mismo espíritu que cap 15 §1 trata su propio margen del 20% ("no es una
> constante matemática... es una primera propuesta razonable, ajustable con datos reales de uso"): el equipo de
> producto puede recalibrar el 20 más adelante sin que eso toque la arquitectura, siempre que el mecanismo lea
> el valor de ese único lugar configurable.
>
> **Por qué excluir "Otros" del conteo:** "Otros" es la categoría fallback/catch-all del motor de
> categorización (hallazgo de auditoría HAL-001) — se asigna cuando la IA o las reglas de categorización
> fallan, o cuando el usuario no especifica. Un gasto en "Otros" no representa un patrón de gasto real: es la
> ausencia de una categoría, no una señal sobre una categoría. Contarlo junto con categorías reales infla
> artificialmente el umbral de 20 sin aportar la estructura por categoría que el hallazgo necesita para
> calcular un promedio honesto — un usuario con 20 gastos categorizados de los cuales 10 son "Otros" en
> realidad solo tiene 10 gastos de señal real, muy por debajo del piso que el párrafo anterior justifica.
> Excluir "Otros" es consistente con la Regla de Oro (cap 20) y con cap 15 §0-1: el hallazgo debe reflejar
> patrones reales por categoría, no datos sin clasificar disfrazados de patrón.
>
> El piso de 28 días (los "≥4 semanas" de la propuesta, cap 15 §1) existe como condición **independiente** del
> conteo precisamente para cubrir el caso de alguien que importa o carga 20+ gastos de golpe el día 1: sin el
> piso de días, ese conteo alto generaría un "promedio" sobre datos de un solo momento (ej. todos los gastos de
> una sola semana de mudanza), no un patrón real de comportamiento a lo largo del tiempo. 20 gastos con
> categoría real en ≥28 días equivale a ~5 por semana, un ritmo de carga compatible con el uso diario que la
> app ya fomenta (recordatorios/hábito diario), no un umbral artificialmente alto.

##### Scenario: Exactamente 19 gastos en categorías reales, historial suficiente — NO se activa

- **GIVEN** un usuario con exactamente 19 gastos asignados a categorías reales (ninguno en "Otros") y 40 días
  desde su primera transacción
- **WHEN** el sistema evalúa si puede mostrar "Una idea sobre tu plata"
- **THEN** el sistema NO la activa

##### Scenario: 20+ gastos en categorías reales cargados de golpe sin historial temporal — NO se activa

- **GIVEN** un usuario con 25 gastos asignados a categorías reales (ninguno en "Otros"), todos cargados el
  mismo día, 2 días desde su primera transacción
- **WHEN** el sistema evalúa si puede mostrar "Una idea sobre tu plata"
- **THEN** el sistema NO la activa, aunque el conteo de gastos en categorías reales ya supere 20

##### Scenario: Ambas condiciones cumplidas con categorías reales — SÍ se activa

- **GIVEN** un usuario con 20 gastos asignados a categorías reales (ninguno en "Otros") y 28 días desde su
  primera transacción
- **WHEN** el sistema evalúa si puede mostrar "Una idea sobre tu plata"
- **THEN** el sistema SÍ la activa

##### Scenario: Días suficientes pero conteo insuficiente en categorías reales — NO se activa

- **GIVEN** un usuario con 8 gastos en categorías reales y 90 días desde su primera transacción
- **WHEN** el sistema evalúa si puede mostrar "Una idea sobre tu plata"
- **THEN** el sistema NO la activa

##### Scenario: "Otros" no cuenta para el umbral, aunque el total general lo supere — NO se activa

- **GIVEN** un usuario con 25 gastos categorizados en total, de los cuales 8 están en "Otros" y 17 en
  categorías reales, con 30 días desde su primera transacción
- **WHEN** el sistema evalúa si puede mostrar "Una idea sobre tu plata"
- **THEN** el sistema NO la activa — 17 gastos en categorías reales es menor a 20, aunque el total de 25 gastos
  categorizados sí superaría el umbral si se contara "Otros"

#### Requirement: El sistema se abstiene de mostrar un hallazgo sin patrón genuino, aunque el umbral se cumpla

El cumplimiento del criterio objetivo del Requirement anterior es condición de **elegibilidad para intentar
generar** el hallazgo — no es garantía de que el hallazgo se muestre. Incluso cuando ambas condiciones (a) y
(b) están cumplidas, si el resultado calculado no constituye una recomendación honesta y útil (por ejemplo:
gasto repartido de forma pareja entre categorías sin ninguna desviación destacable, datos demasiado ruidosos
para sostener una conclusión, o cualquier otro caso donde el sistema no tenga algo genuino que comunicar), el
sistema MUST abstenerse de mostrar cualquier resultado en "Una idea sobre tu plata". El sistema MUST NOT
inventar, forzar o aproximar una conclusión únicamente para tener algo que mostrarle al usuario.

> **Racional (no delegable a sdd-design):** Saldo prefiere la ausencia de IA antes que una IA inventando valor
> donde todavía no lo hay — principio que gobierna todo el capítulo de IA (cap 15 §3) y que cap 03 regla 4 ya
> fijó en términos generales ("no inventar un patrón que los datos no sostienen"), reforzado por la Regla de
> Oro (cap 20: "¿Rosa entendería esto sin preguntarle a nadie?"). El Requirement anterior resuelve cuándo hay
> **suficiente volumen** de datos para intentar el cálculo, pero no garantiza que ese cálculo produzca una
> conclusión genuina: un usuario puede superar 20 gastos en categorías reales y 28 días de historial y aun así
> tener un gasto tan parejo entre categorías que no exista ningún patrón real que comunicar. Mostrar igual una
> "idea" en ese caso sería el mismo falso aviso que cap 15 §1 identifica como riesgo de calcular sobre datos
> insuficientes — solo que acá la insuficiencia es de señal, no de volumen. La abstención es, por diseño, un
> resultado válido y esperado del sistema, nunca una falla a corregir agregando una conclusión igualmente.

##### Scenario: Umbral cumplido pero sin patrón genuino — el sistema se abstiene

- **GIVEN** un usuario con 30 gastos en categorías reales y 60 días de historial, cuyo gasto se reparte de
  forma pareja entre categorías sin ninguna desviación ni concentración destacable
- **WHEN** el sistema evalúa qué mostrar en "Una idea sobre tu plata"
- **THEN** el sistema no muestra ningún hallazgo, aunque ambas condiciones del criterio objetivo del
  Requirement anterior estén cumplidas

##### Scenario: Umbral cumplido y patrón genuino presente — el sistema sí muestra el hallazgo

- **GIVEN** un usuario con 30 gastos en categorías reales y 60 días de historial, con una categoría cuyo gasto
  se desvía de forma clara y sostenida del resto
- **WHEN** el sistema evalúa qué mostrar en "Una idea sobre tu plata"
- **THEN** el sistema muestra el hallazgo correspondiente a ese patrón

#### Requirement: Los componentes de IA excluidos o diferidos no aparecen en la UI

El sistema MUST NOT renderizar, en ningún JSX ni estado de la aplicación, ninguna superficie visual asociada
a los componentes excluidos o diferidos de la propuesta (panel con puntaje/score, estado de proveedor con
nombre de modelo o cifra de "req/min", gráfico de predicción, panel de alertas con severidad, chat
conversacional general).

##### Scenario: Ningún rastro visual de los componentes excluidos, en cualquier viewport

- **GIVEN** cualquier usuario, en cualquier plan, en cualquier pantalla
- **WHEN** se inspecciona el árbol de UI renderizado, incluyendo en viewport < 768px
- **THEN** no existe ningún elemento visible que muestre puntaje/score de IA, nombre de modelo o proveedor,
  cifra de "req/min", gráfico de predicción, o panel de alertas con severidad

---

### Área 2 — Retiro del bot falso (trazabilidad: Decisión 2, Q4)

#### Requirement: El widget de chat falso deja de mostrarse en toda la aplicación

El sistema MUST NOT montar ni mostrar el widget flotante de chat que hoy se presenta como "Asistente IA" sin
serlo (coincidencia de palabras clave sin IA real). Esto MUST cumplirse en toda pantalla y todo estado de
sesión, sin excepción transitoria.

##### Scenario: Ausencia total, incluyendo mobile

- **GIVEN** un usuario autenticado, en cualquier plan
- **WHEN** navega por todas las pestañas de la aplicación, en un viewport de 375px de ancho
- **THEN** no aparece ningún botón flotante de chat ni panel de chat asociado al bot anterior, y ningún
  espacio de la pantalla queda reservado u ocupado por ese widget

---

### Área 3 — Categorización asistida (trazabilidad: Decisión 1, cap 15 §3)

#### Requirement: La sugerencia aparece sin acción explícita adicional del usuario

Mientras el usuario tenga acceso vigente al feature (Área 8), consentimiento activo (Área 6) y no esté en
ninguno de los 4 casos sin acceso (Área 5), el sistema SHOULD ofrecer una sugerencia de categoría a partir de
la descripción que el usuario ya está escribiendo, sin requerir que dispare la sugerencia manualmente.

##### Scenario: Sugerencia visible sin romper el layout en mobile

- **GIVEN** un usuario con acceso vigente, en un viewport de 375px de ancho
- **WHEN** escribe la descripción de un movimiento nuevo
- **THEN** la sugerencia aparece en el mismo flujo de carga, sin tapar el campo de descripción y sin generar
  scroll horizontal

#### Requirement: La sugerencia se confirma o se corrige — nunca se aplica en silencio

El sistema MUST presentar la sugerencia de categoría como una propuesta, nunca como un cambio ya aplicado.
El usuario MUST poder confirmarla con un toque o reemplazarla manualmente en cualquier momento, y la
categoría final del movimiento MUST ser siempre la que el usuario confirmó o eligió — nunca una que la IA
aplicó sin intervención humana.

##### Scenario: Confirmar con un toque

- **GIVEN** una sugerencia de categoría visible para un movimiento
- **WHEN** el usuario toca "confirmar" (o acción equivalente de un solo toque)
- **THEN** el movimiento queda guardado con esa categoría, y esa acción es indistinguible en costo de esfuerzo
  de cualquier otra confirmación de un toque en un viewport < 768px

##### Scenario: Corregir manualmente anula la sugerencia

- **GIVEN** una sugerencia de categoría visible para un movimiento
- **WHEN** el usuario elige una categoría distinta desde el selector manual
- **THEN** el movimiento se guarda con la categoría elegida por el usuario, no con la sugerida

#### Requirement: Sin sugerencia disponible, el selector manual sigue siendo el camino completo

Cuando la sugerencia de IA no está disponible por cualquiera de los 4 casos de la Área 5 (plan free, límite
alcanzado, IA deshabilitada/sin consentimiento, error del proveedor), el sistema MUST mostrar el selector de
categoría manual como medio completo de categorizar el movimiento, en el mismo lugar donde aparecería la
sugerencia, y MUST NOT bloquear el guardado del movimiento por la ausencia de sugerencia.

##### Scenario: Cualquiera de los 4 casos sin acceso no impide cargar el movimiento

- **GIVEN** un usuario en cualquiera de los 4 casos sin acceso de la Área 5
- **WHEN** carga un movimiento nuevo
- **THEN** puede elegir la categoría manualmente y guardar el movimiento sin ninguna interrupción del flujo

---

### Área 4 — Entrada única de IA (trazabilidad: Decisión 3)

#### Requirement: Un único punto de verdad para gate, límite y consentimiento

El sistema MUST exponer un único punto de verdad para el estado de gate de plan, límite de tasa y
consentimiento de IA, sin importar desde qué pantalla se dispare una función de IA. Dos pantallas distintas
que disparan funciones de IA MUST mostrar siempre el mismo estado — nunca inconsistente entre sí en el mismo
instante.

##### Scenario: Dos pantallas, mismo estado en el mismo instante

- **GIVEN** un usuario con un estado de IA determinado (gate, límite, consentimiento)
- **WHEN** se observa simultáneamente la superficie de IA en dos pantallas distintas que disparan IA (por
  ejemplo, categorización en Movimientos y mapeo en Importación)
- **THEN** ambas muestran el mismo estado de acceso — ninguna dice "disponible" mientras la otra dice
  "bloqueado" para el mismo usuario

##### Scenario: Un cambio de consentimiento se refleja en todas las pantallas sin pasos adicionales

- **GIVEN** un usuario que revoca el consentimiento de IA desde el área de cuenta
- **WHEN** vuelve a cualquier pantalla que dispare una función de IA
- **THEN** esa pantalla ya refleja el consentimiento revocado, sin requerir que el usuario repita ninguna
  acción para "sincronizar" el estado

---

### Área 5 — Comportamiento sin acceso al feature: 4 casos (trazabilidad: Decisión 5)

Reglas de copy comunes a los 4 casos (MUST cumplirse en todos): sin jerga técnica, sin código de error crudo,
sin nombrar al proveedor de IA, sin culpar al usuario.

| Caso | Naturaleza | Comportamiento observable |
|---|---|---|
| 1. Plan free | Permanente, frontera de monetización | Muestra que la feature existe + invitación a mejorar de plan |
| 2. Límite alcanzado | Temporal | Copy de "esperá un momento", sin cifra técnica |
| 3. IA deshabilitada / sin consentimiento | Estado elegido, se respeta | Superficie de IA ausente o apagada, sin insistencia |
| 4. Error del proveedor | Falla transitoria | Mensaje calmo de reintento; resto de la app sigue funcionando |

#### Requirement: Caso 1 — Plan free ve invitación honesta, no un vacío

El sistema MUST comunicar, en plan free, que la categorización asistida existe y es parte de un plan pago,
con una invitación a mejorar, cumpliendo las reglas de copy de la tabla.

##### Scenario: Usuario free intenta usar categorización asistida

- **GIVEN** un usuario en plan free
- **WHEN** llega al punto donde aparecería la sugerencia de categoría
- **THEN** ve una indicación de que la función es parte de un plan pago y una invitación a mejorar, sin jerga
  ni código técnico, y puede seguir categorizando manualmente sin obstáculo

#### Requirement: Caso 2 — Límite alcanzado se comunica como espera, no como negación

El sistema MUST comunicar el límite de tasa alcanzado como una espera temporal en lenguaje humano, y MUST NOT
mostrar códigos o cifras técnicas (ej. "429", "rate limit", "req/min").

##### Scenario: Usuario alcanza el límite de solicitudes

- **GIVEN** un usuario que alcanzó el límite de solicitudes de IA del período vigente
- **WHEN** intenta disparar una nueva sugerencia
- **THEN** ve un mensaje de espera en lenguaje humano, sin ninguna cifra técnica visible

#### Requirement: Caso 3 — IA deshabilitada o sin consentimiento se respeta sin insistir

El sistema MUST tratar la ausencia de consentimiento o la IA desactivada como un estado elegido: la
superficie de IA MUST NOT aparecer rota, y el sistema MUST NOT insistir repetidamente para reactivarla.

##### Scenario: Usuario sin consentimiento activo

- **GIVEN** un usuario que no dio o retiró el consentimiento de IA
- **WHEN** navega por pantallas donde normalmente aparecería una sugerencia de IA
- **THEN** esa superficie simplemente no aparece (o aparece apagada), sin mensajes de error ni insistencia
  repetida en la misma sesión

#### Requirement: Caso 4 — Error del proveedor no arrastra el resto de la app

El sistema MUST mostrar un mensaje calmo de reintento cuando el proveedor de IA falla, sin exponer el nombre
del proveedor ni detalles técnicos, y el resto de la aplicación MUST seguir funcionando con normalidad.

##### Scenario: El proveedor de IA falla

- **GIVEN** una falla transitoria del proveedor de IA al pedir una sugerencia
- **WHEN** el usuario está cargando un movimiento
- **THEN** ve un mensaje calmo de "no se pudo esta vez, probá más tarde" (o equivalente), sin nombre de
  proveedor ni stack técnico, y puede seguir cargando y viendo movimientos sin ninguna otra función afectada

---

### Área 6 — Consentimiento de privacidad (trazabilidad: §7.1)

#### Requirement: El consentimiento se pide al primer uso, en contexto, no en onboarding

El sistema MUST NOT pedir el consentimiento de IA durante el onboarding. El sistema MUST pedirlo la primera
vez que un dato del usuario esté por salir del dispositivo hacia el proveedor de IA (ej. al escribir la
primera descripción que dispararía una sugerencia).

##### Scenario: Primer uso dispara el pedido de consentimiento

- **GIVEN** un usuario que nunca dio ni negó consentimiento de IA
- **WHEN** escribe por primera vez una descripción que activaría la sugerencia de categoría
- **THEN** el sistema le pide consentimiento en ese momento, no antes (no durante el onboarding)

#### Requirement: El consentimiento es global, no por funcionalidad

El sistema MUST tratar el consentimiento de IA como una única decisión que cubre toda la IA de Saldo. El
sistema MUST NOT pedir un consentimiento separado por cada función de IA.

##### Scenario: Un solo consentimiento cubre toda punta de IA presente y futura

- **GIVEN** un usuario que ya dio consentimiento de IA la primera vez que se le pidió
- **WHEN** llega a cualquier otra función de IA existente (mapeo en importación) o futura
- **THEN** no se le vuelve a pedir consentimiento para esa función

#### Requirement: La revocación es inmediata, sin justificación, desde el área de cuenta

El sistema MUST ofrecer un control en el área de cuenta del usuario para revocar el consentimiento de IA en
cualquier momento, sin pedir justificación, con efecto inmediato.

##### Scenario: Revocar el consentimiento desde la cuenta

- **GIVEN** un usuario con consentimiento de IA activo
- **WHEN** apaga el interruptor de "usar la IA de Saldo" en su área de cuenta
- **THEN** el consentimiento queda revocado de inmediato, sin pedirle un motivo ni una confirmación adicional

#### Requirement: Sin consentimiento activo, la superficie de IA desaparece sin romper el flujo central

Cuando no hay consentimiento activo, el sistema MUST ocultar la superficie de IA, MUST mantener el selector
de categoría manual y el flujo de carga de movimientos completamente funcionales, y MUST NOT mostrar UI rota
ni insistencia repetida (MAY mostrar, como máximo, una invitación de una línea, ignorable sin costo).

##### Scenario: Selector manual intacto sin consentimiento, en mobile

- **GIVEN** un usuario sin consentimiento activo, en un viewport de 375px de ancho
- **WHEN** carga un movimiento nuevo
- **THEN** el selector de categoría manual funciona igual que para cualquier usuario, sin espacios vacíos
  rotos ni elementos de IA a medio renderizar

#### Requirement: Ningún dato viaja al proveedor de IA antes de que exista consentimiento activo

El sistema MUST NOT enviar ningún dato del usuario al proveedor de IA mientras no exista un consentimiento
activo y vigente. Esta es una garantía dura, sin excepciones por tipo de flujo.

##### Scenario: Sin consentimiento, cero llamadas salientes

- **GIVEN** un usuario sin consentimiento de IA activo (nunca lo dio, o lo retiró)
- **WHEN** interactúa con cualquier pantalla que en otro estado dispararía una llamada de IA
- **THEN** el sistema no envía ningún dato del usuario al proveedor de IA en ningún momento de esa sesión

---

### Área 7 — Minimización de datos por flujo (trazabilidad: Decisión 7)

#### Requirement: Categorización — solo la descripción del movimiento

El sistema MUST enviar, para la categorización asistida, únicamente la descripción del movimiento. El
sistema MUST NOT incluir monto, fecha, categoría ni ninguna otra transacción del usuario en ese envío.

##### Scenario: Payload mínimo de categorización

- **GIVEN** un usuario con consentimiento activo escribiendo la descripción de un movimiento
- **WHEN** el sistema pide una sugerencia de categoría
- **THEN** el envío al proveedor de IA contiene solo esa descripción, sin monto, fecha ni otras transacciones

#### Requirement: "Una idea sobre tu plata" — solo totales agregados por categoría/período

El sistema MUST enviar, para este flujo, únicamente totales agregados por categoría y período. El sistema
MUST NOT enviar descripciones, fechas exactas ni transacciones individuales.

##### Scenario: Payload agregado, no transaccional

- **GIVEN** un usuario que cumple el criterio objetivo de la Área 1 para ver "Una idea sobre tu plata"
- **WHEN** el sistema genera el hallazgo
- **THEN** el envío al proveedor de IA contiene solo totales por categoría/período, sin ninguna transacción
  individual ni descripción

#### Requirement: Mirada a futuro (predicción) — solo totales agregados por categoría/mes

El sistema MUST enviar, cuando este flujo exista, únicamente totales agregados por categoría y mes. El
sistema MUST NOT enviar transacciones individuales.

##### Scenario: Payload agregado para mirada a futuro

- **GIVEN** el flujo de mirada a futuro activo para un usuario con acceso
- **WHEN** el sistema genera la señal
- **THEN** el envío al proveedor de IA contiene solo totales agregados por categoría/mes

#### Requirement: Anomalías — preferentemente local; si va al proveedor, sin descripción

El sistema SHOULD calcular la detección de anomalías localmente, sin enviar datos a un proveedor externo. Si
el sistema envía datos a un proveedor de IA para este flujo, MUST limitarlos a categoría y monto, y MUST NOT
incluir la descripción del movimiento.

##### Scenario: Si hay envío externo, va sin descripción

- **GIVEN** un caso de detección de anomalías que requiere consulta a un proveedor de IA
- **WHEN** el sistema arma ese envío
- **THEN** incluye categoría y monto, y no incluye la descripción del movimiento

#### Requirement: Chat futuro — agregados más solo lo que la pregunta referencia

El sistema MUST limitar el envío del chat futuro a totales agregados y a los datos puntuales que la pregunta
del usuario referencia explícitamente. El sistema MUST NOT enviar un volcado ciego de transacciones
individuales en cada pregunta.

##### Scenario: La pregunta acota el dato enviado

- **GIVEN** el chat futuro activo y un usuario con consentimiento
- **WHEN** pregunta "¿cuánto gasté en Comida este mes?"
- **THEN** el envío al proveedor de IA se limita a lo relativo a esa categoría/período, no a todas las
  transacciones del usuario

#### Requirement: Mapeo de columnas CSV — encabezados, sin filas completas sin enmascarar

El sistema MUST enviar, para el mapeo de columnas de importación, los encabezados del archivo. El sistema
MUST NOT enviar filas de muestra completas sin enmascarar; si necesita muestras de valores, MAY enviarlas
enmascaradas.

##### Scenario: Mapeo sin exponer datos sensibles del extracto

- **GIVEN** un usuario importando un archivo CSV bancario
- **WHEN** el sistema pide ayuda de IA para mapear columnas
- **THEN** el envío contiene los encabezados y, como máximo, valores de muestra enmascarados — nunca números
  de cuenta u otros datos identificables en texto plano

---

### Área 8 — Gate de monetización (trazabilidad: Decisión 6)

#### Requirement: Ninguna función de IA se ejecuta sin pasar el gate de plan

El sistema MUST verificar el acceso por plan (`ai_analysis` / `ai_predictions`, según corresponda) antes de
ejecutar cualquier función de IA. El sistema MUST NOT ejecutar una función de IA para un usuario cuyo plan no
la incluye.

##### Scenario: Usuario free no dispara la función de IA subyacente

- **GIVEN** un usuario en plan free
- **WHEN** interactúa en un punto que para un usuario pro dispararía una función de IA
- **THEN** el sistema no ejecuta esa función, y en su lugar muestra el caso 1 de la Área 5 (invitación a
  mejorar de plan)

##### Scenario: Usuario pro/lifetime accede con normalidad

- **GIVEN** un usuario en plan pro o lifetime
- **WHEN** interactúa en el mismo punto
- **THEN** el sistema ejecuta la función de IA correspondiente con normalidad

---

### Área 9 — Rate limit de fuente única (trazabilidad: Decisión 8)

#### Requirement: La UI refleja únicamente el límite real aplicado del lado servidor

El sistema MUST reflejar, en cualquier estado de UI relacionado a límite de uso, únicamente el límite
realmente aplicado del lado servidor. El sistema MUST NOT mostrar ni derivar su comportamiento de una cifra
distinta o hardcodeada del lado cliente que pueda desincronizarse del límite real.

##### Scenario: El estado de "límite alcanzado" coincide siempre con el límite real

- **GIVEN** el límite real aplicado del lado servidor
- **WHEN** un usuario alcanza ese límite
- **THEN** el estado de "límite alcanzado" que ve en la UI (caso 2 de la Área 5) se activa exactamente en ese
  punto — nunca antes ni después, por una cifra distinta mostrada en otro lugar del cliente

---

### Área 10 — Deuda técnica bloqueante, como estados verificables (trazabilidad: Decisión 9)

#### Requirement: Toda sugerencia de categoría MUST tener una etiqueta de confianza válida

El sistema MUST asociar una etiqueta de confianza válida y no vacía, perteneciente a un conjunto cerrado y
reconocido de valores, a toda sugerencia de categoría antes de mostrarla al usuario. El sistema MUST NOT
mostrar una sugerencia con una etiqueta de confianza no reconocida, vacía, o con apariencia rota (sin color
ni texto).

##### Scenario: Confianza fuera del conjunto reconocido no se muestra rota

- **GIVEN** una sugerencia de categoría cuya confianza no pertenece al conjunto de valores reconocidos
- **WHEN** el sistema está por mostrarla al usuario
- **THEN** no la muestra con apariencia rota (sin color/etiqueta); la trata como no disponible en ese momento

#### Requirement: Las precondiciones de confianza del MVP MUST cumplirse todas antes de exponer la primera punta

El sistema MUST NOT exponer la categorización asistida a ningún usuario mientras no se cumplan
simultáneamente: (a) etiqueta de confianza siempre válida (arriba), (b) estado único de IA activo (Área 4),
(c) consentimiento de privacidad operativo (Área 6), y (d) límite de tasa de fuente única activo (Área 9).
Ninguna de estas cuatro condiciones MUST diferirse a una iteración posterior del MVP.

##### Scenario: Falta una precondición, la punta no se expone

- **GIVEN** que cualquiera de las cuatro condiciones (a)-(d) no está resuelta
- **WHEN** se evalúa si mostrar la categorización asistida
- **THEN** el sistema no la expone a ningún usuario, independientemente del plan o del consentimiento
  individual

---

### Área 11 — Dirección futura de AIChat: restricciones de diseño, no implementación (trazabilidad: §10)

Los siguientes Requirements no se implementan en este cambio (`AIChat` queda diferido, Decisión 2). Fijan el
contrato de producto que cualquier implementación futura MUST cumplir.

#### Requirement: El futuro AIChat responde exclusivamente sobre las finanzas del usuario en Saldo

El futuro AIChat MUST limitar sus respuestas al dominio de las finanzas del usuario dentro de Saldo. El
futuro AIChat MUST NOT comportarse como asistente de propósito general (cultura general, temas ajenos a la
plata del usuario).

##### Scenario: Pregunta dentro del dominio

- **GIVEN** el futuro AIChat activo
- **WHEN** el usuario pregunta "¿cuánto gasté en Comida este mes?"
- **THEN** responde con información derivada de los datos financieros del usuario en Saldo

#### Requirement: El futuro AIChat no reemplaza la navegación ni ejecuta acciones por el usuario

El futuro AIChat MUST NOT ejecutar acciones sobre la aplicación en nombre del usuario (crear movimientos,
cambiar configuraciones, u otra acción equivalente a un comando).

##### Scenario: Pedido de acción se redirige, no se ejecuta

- **GIVEN** el futuro AIChat activo
- **WHEN** el usuario le pide "cargá un gasto de $500 en Comida"
- **THEN** el chat no ejecuta esa acción por sí mismo; como máximo orienta al usuario hacia dónde cargarla

#### Requirement: El futuro AIChat no genera contenido arbitrario fuera de finanzas

El futuro AIChat MUST NOT generar contenido de texto libre ajeno al dominio financiero del usuario en Saldo
(por ejemplo, redacción creativa o respuestas de cultura general).

##### Scenario: Pedido fuera de dominio no genera contenido libre

- **GIVEN** el futuro AIChat activo
- **WHEN** el usuario le pide "escribime un poema"
- **THEN** el chat no genera ese contenido

#### Requirement: El futuro AIChat reconoce su límite con naturalidad, sin error frío

Cuando una pregunta cae fuera del dominio financiero de Saldo, el futuro AIChat MUST reconocer el límite en
tono humano y reorientar hacia lo que sí puede hacer. El futuro AIChat MUST NOT responder con un mensaje de
error técnico o genérico.

##### Scenario: Reconocimiento del límite sin error frío

- **GIVEN** el futuro AIChat activo
- **WHEN** el usuario pregunta algo fuera del dominio financiero de Saldo
- **THEN** el chat reconoce el límite en tono cálido y ofrece una alternativa dentro de su dominio, sin
  mostrar un mensaje de error técnico

#### Requirement: El tono del futuro AIChat sigue las mismas reglas que el resto de la IA de Saldo

El futuro AIChat MUST mantener el mismo tono que el resto de la IA de Saldo: sin jerga técnica, sin urgencia
ni culpa, sin sermonear, con respuestas breves.

##### Scenario: Respuesta breve y sin jerga

- **GIVEN** el futuro AIChat activo
- **WHEN** responde cualquier pregunta dentro de su dominio
- **THEN** la respuesta es breve, sin jerga técnica ni nombre de proveedor/modelo, sin tono de urgencia ni
  culpa
