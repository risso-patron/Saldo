# Propuesta: `insights-ia-real` — alcance del MVP de IA real

**Fase**: sdd-propose (producto: intención y alcance — NO diseño técnico)
**Fecha**: 2026-07-14
**Base obligatoria**: `explore.md` (sdd-explore, cerrada) + `docs/product-master/` (cap 02, 15, 20)
**Sucesor**: sdd-design (arquitectura técnica) — esta propuesta NO define firmas de hooks, contratos ni código.

---

## Marco de la propuesta

La exploración confirmó un problema de integridad de producto (P0): el usuario ve un `FloatingChatWidget`
presentado como "Asistente IA" que en realidad es keyword-matching sin red, mientras existe IA real, terminada,
sin montar (6 componentes huérfanos + `ai-proxy.js` funcionando).

**Principio rector (no negociable):** no se trata de "encender" los 6 componentes porque ya están construidos.
El objetivo es una experiencia coherente, confiable y sostenible. Cada componente debe *ganarse* su lugar contra
dos filtros:

1. **La Regla de Oro (cap 20):** *"¿Rosa entendería esto sin preguntarle a nadie?"*
2. **La IA nunca es protagonista (cap 03 regla 7, reafirmada en cap 15):** *"acompaña, sugiere y traduce. No se
   impone, no complica, no habla en difícil."*

**Hallazgo central de esta propuesta:** los 6 componentes construidos reflejan una visión de producto
distinta —y anterior— a la que el Product Master cerró. Fueron pensados como un *dashboard de IA protagonista*
(score, paneles de patrones, alertas con severidad, chart de "predicción", estado del proveedor con nombre del
modelo). El Product Master, en cambio, cerró una IA *humilde y única*: una sola "idea sobre tu plata" (cap 07,
cap 15 §0-1) y una categorización que *sugiere, no impone* (cap 15 §3). Por eso la mayoría de los componentes
no entran tal cual: no es un problema de tiempo, es que encarnan un producto que ya decidimos no construir.

---

## Las decisiones

### 1. ¿Cuál es el MVP de IA de la primera versión pública?

**Recomendación: un MVP angosto y honesto, anclado en un solo componente real + el andamiaje de confianza.**

El MVP visible es **la categorización asistida** (`SmartCategorySelector`): cuando la persona escribe la
descripción de un movimiento, la IA *sugiere* una categoría que el usuario confirma o corrige con un toque.
Es el único componente que mapea 1:1 con una decisión ya cerrada del Product Master (cap 15 §3, "sugerir, no
imponer") y el de menor superficie de datos (solo una descripción, no la lista de transacciones).

Alrededor de esa única punta visible, el MVP incluye el andamiaje que hace que *cualquier* IA en Saldo sea
confiable: una sola entrada coherente (Q3), el gate de plan conectado (Q6), el aviso de privacidad (Q7), una
única cifra de rate limit honesta (Q8) y el retiro del bot falso (Q2/Q4).

| Pieza | Nivel |
|---|---|
| Categorización asistida (`SmartCategorySelector`, tras fix de `confidence`) | **Obligatorio** |
| Retirar el "Asistente IA" falso (`FloatingChatWidget`) | **Obligatorio** |
| Aviso/consentimiento de privacidad antes de enviar datos a Groq | **Obligatorio** |
| Entrada única de IA (un solo estado compartido) | **Obligatorio** |
| Gate de plan (`hasFeature`) conectado | **Obligatorio** |
| Cifra única de rate limit (alineada a la real) | **Obligatorio** |
| "Una idea sobre tu plata" (hallazgo IA real, cap 15) | **Recomendado** (se activa con historial) |
| Chat conversacional real (`AIChat`) | **Puede esperar** |

**Criterio de cierre del alcance ("ah, esto me ayuda" en menos de 30 segundos).** El MVP visible se mantiene en
*una sola punta*: la categorización asistida. La razón no es solo la Regla de Oro — es que la primera
experiencia de IA tiene que producir un *"ah, esto me ayuda"* en menos de 30 segundos, y la categorización lo
cumple literalmente: apenas Rosa escribe la descripción de su *primer* movimiento —día 1, sin historial— la IA
sugiere la categoría y ella confirma con un toque. El valor llega en la primera pulsación, sin datos previos.

Se evaluó explícitamente subir **"Una idea sobre tu plata"** al MVP junto con la categorización, con datos
agregados, una sola recomendación, sin scores, sin nombrar el modelo y sin jerga (las condiciones correctas por
Q7 y por el Product Master). La conclusión es que **no entra todavía**, y por una razón honesta, no de tiempo:
la versión con valor real de ese hallazgo —la que produce el *"ah, esto me ayuda"*— se calcula sobre agregados
por categoría/período y exige **≥4 semanas de historial** (cap 15 §1). Con menos datos, el promedio no es
confiable y mostrar una idea generaría un falso aviso, que es exactamente la ansiedad que cap 01 existe para
bajar. Un usuario nuevo no tiene ese historial el día 1, así que el MVP **no puede *garantizar* una idea honesta
para la mayoría de quienes recién instalan** — el agregado por categoría necesita un volumen de datos que el
primer release no puede asegurar. El Product Master ya previó este hueco: lo único que este hallazgo puede
mostrar el día 1 (cap 15 §0) es una línea de onboarding con plantilla (*"Este es tu primer gasto en [categoría]
— cuando cargues un par más, te vamos a poder mostrar patrones"*), que *deliberadamente no es un análisis de IA*
sobre agregados, sino una promesa de que la app se vuelve útil con uso. Forzar la versión analítica antes de
tener datos sería inventar un patrón que los datos no sostienen (cap 03 regla 4). Por eso "Una idea sobre tu
plata" queda como **Recomendado**, se activa cuando hay historial suficiente: su motor (`analyzeFinances`) está
listo, pero el dato honesto que necesita no lo está el día 1. La categorización no depende de historial, así que
es la única punta que cumple el criterio de <30s desde el primer uso.

**Por qué angosto:** el encargo original de este cambio era "reemplazar el bot falso por IA real", no "lanzar
un dashboard de IA". Un MVP de una sola punta, bien resuelta y confiable, cumple la Regla de Oro; cinco
componentes de golpe la rompen (ver Q2).

---

### 2. ¿Qué queda fuera deliberadamente, aunque ya esté desarrollado? (razón de producto, no "por tiempo")

- **`AIProviderStatus` — Excluido (Obligatorio dejarlo fuera).** Muestra "⚡ Groq — Llama 3.3 70B", "vía proxy
  seguro", "Gratis · 30 req/min". Es la IA como protagonista hablando en jerga técnica: Rosa no sabe qué es
  "Llama 3.3" ni "req/min", y no debería tener que saberlo (cap 03 regla 7; cap 04 vocabulario prohibido;
  Regla de Oro). El usuario no necesita conocer el motor para confiar en el resultado.

- **`PredictiveChart` — Excluido esta versión / rediseñar.** Tres razones de producto: (a) "predicción" es
  vocabulario prohibido (cap 04); (b) una señal anticipatoria confiable exige ≥4 semanas de historial (cap 15
  §1) — mostrarla antes sería inventar un patrón que los datos no sostienen (cap 03 regla 4); (c) el Product
  Master ya decidió entregar las señales como un texto humilde ("Una idea sobre tu plata"), no como un chart
  con banda de confianza ±15%. No es que "no dé tiempo": es que este formato ya fue descartado.

- **`AIAlerts` — Excluido esta versión / rediseñar.** El modelo "alertas + badge con contador + severidad"
  fabrica exactamente la ansiedad que Saldo existe para bajar (cap 01; cap 13 rechaza urgencia y miedo para
  reenganchar). Además, las señales anticipatorias ya se decidieron entregar como "Una idea sobre tu plata"
  (cap 15 §1), no como un dropdown rojo. Requiere historial + rediseño de fondo.

- **`AIChat` — Diferido (no MVP).** Un chat conversacional general es lo *menos* alineado con "la IA acompaña,
  no protagoniza": invita interacción abierta difícil de mantener en tono (sin jerga, respuestas cortas) y es
  el flujo que más datos envía (últimas 10 transacciones completas). Se gana su lugar más adelante, con
  privacidad y tono resueltos — pero diferido no es indefinido: su dirección de producto ya queda fijada en Q10.
  **Ojo:** diferir el chat real NO significa dejar el bot falso — retirarlo es Obligatorio (Q4).

- **`AIInsightsPanel` — Rediseñar antes de incluir.** Su "score" (una nota/calificación) puede leerse como
  juicio sobre la persona, y su footer de tokens/costo *narra el proceso del sistema* — el mismo patrón que
  cap 09 y cap 15 rechazaron con "IA terminó". El motor de análisis que hay detrás (`analyzeFinances`) sí
  puede alimentar la humilde "Una idea sobre tu plata", pero el panel-dashboard como tal no entra.

---

### 3. Flujo de entrada a la IA — una sola puerta

**Recomendación (Obligatorio): una única entrada coherente de IA para toda la app.**

La exploración encontró dos instancias independientes y desconectadas de `useAIInsights` (`App.jsx:125`,
descartada; `ImportManager.jsx:138`, usada solo para mapeo de columnas). Montar los componentes huérfanos hoy
crearía una *tercera* copia de estado aislada. No queremos una tercera puerta.

A nivel de producto, la persona debe experimentar **"la IA de Saldo" como una sola cosa**, no como features
sueltas repartidas por pantallas. Eso implica un único estado de IA compartido que alimenta todas las puntas
(categorización en Movimientos, mapeo en Importación, la idea sobre tu plata) y que aplica *en un solo lugar*
el gate de plan, la conciencia de rate limit y el consentimiento de privacidad. La categorización asistida es
la primera punta que consume esa entrada única. *(El "cómo" — contexto, hook consolidado — es sdd-design.)*

---

### 4. Integración con el Product Master ("¿Rosa entendería esto sin preguntarle a nadie?")

Qué aplica, citado:

- **Cap 15 §3 — "sugerir, no imponer":** *"cuando la IA tiene una duda razonable (categorizar un movimiento
  ambiguo), ofrece una sugerencia que el usuario confirma o corrige con un toque — nunca aplica un cambio en
  silencio."* Es literalmente el contrato de la categorización asistida (MVP). Diseña su comportamiento entero.

- **Cap 03 regla 7 — "la IA nunca es protagonista":** descarta `AIProviderStatus` (nombre del modelo) y el
  `AIInsightsPanel`-dashboard (score). La IA acompaña; no se pone en el centro.

- **Cap 04 — vocabulario prohibido:** descarta "predicción" (`PredictiveChart`) y "análisis/Analytics" como
  naming visible. El copy correcto ya está cerrado: **"Una idea sobre tu plata"** (cap 07/15).

- **Cap 09 + cap 15 filtro heredado — rechazo de "IA terminó":** ningún mensaje puede narrar el proceso del
  sistema ("la IA analizó tus datos", footer de tokens/costo). El resultado se muestra; el proceso no se cuenta.

- **Cap 13 + cap 01 — sin urgencia, sin culpa, sin sermón:** descarta el modelo de `AIAlerts` (severidad,
  badge). Una señal *describe un patrón, no instruye ni regaña* (cap 15 §3).

- **Cap 20 — la Regla de Oro como filtro de cierre:** toda punta de IA debe pasar "¿Rosa entendería esto sin
  preguntarle a nadie?". "Llama 3.3 70B", "30 req/min" y un "score" fallan el filtro de entrada. La
  categorización asistida ("¿esto es Comida?", un toque para confirmar) lo pasa.

---

### 5. Comportamiento sin acceso al feature — los 4 casos son distintos

**Recomendación (Obligatorio): tratar los 4 como estados separados, con copy y acción propios. Nunca exponer
jerga técnica ni códigos de error, y la IA nunca puede romper el flujo central (no es protagonista).**

1. **Plan gratuito (no tiene la feature) — frontera de monetización, permanente.** Mostrar que la feature
   *existe* y explicar en lenguaje humano que es parte del plan pagado, con una invitación a mejorar. Sin
   jerga, sin vergüenza, sin castigar. Rosa debe entender *por qué* no puede usarla sin preguntarle a nadie.

2. **Límite alcanzado (rate limit) — temporal, no es culpa del usuario.** Copy calmo y humano ("en un
   momentito podés volver a pedirlo"). Nunca mostrar "429" ni "rate limit exceeded". Es un "esperá", no un "no".

3. **IA deshabilitada (config / consentimiento no dado) — estado elegido, se respeta.** Si la persona no dio
   consentimiento de privacidad o apagó la IA, la superficie de IA simplemente no aparece o se muestra apagada.
   Sin UI rota, sin insistir (cap 13: no reenganchar por presión).

4. **Error del proveedor (Groq caído) — falla transitoria del sistema.** Mensaje honesto y calmo ("no pudimos
   generar tu idea ahora, probá más tarde"), sin exponer el nombre del proveedor ni el stack. **El resto de la
   app sigue funcionando** — la IA cae sola, nunca arrastra el flujo central de cargar/ver movimientos.

Diferencias clave: (1) es permanente y requiere upsell; (2) es "esperá un minuto"; (3) es un estado respetado
sin nagging; (4) es reintento transitorio. Copys y acciones distintas para cada uno.

---

### 6. Estrategia de monetización con los gates existentes

**Recomendación (Obligatorio para el MVP): usar los gates ya definidos, sin inventar nuevos.**

La exploración confirmó que `hasFeature('ai_analysis')` y `hasFeature('ai_predictions')` existen en el modelo
(`useSubscription.js`, solo planes pro/lifetime) pero **se invocan cero veces**. Hoy cualquier usuario
autenticado —incluso `free`— tendría acceso completo si se montara la IA.

Decisión de producto: **la IA es un diferenciador pago.** Mapeo:
- Categorización asistida + "Una idea sobre tu plata" → `ai_analysis`.
- Señales anticipatorias / mirada a futuro (cuando lleguen) → `ai_predictions`.

El gate se aplica en la entrada única (Q3), de modo que el usuario `free` cae en el caso 1 de Q5 (invitación
honesta, no un no-op silencioso ni un crash). No se crean flags nuevos: se conecta lo que ya existe. *(La
enforcement server-side del plan, hoy solo autenticación en el proxy, es una preocupación de sdd-design.)*

---

### 7. Minimización de datos — qué sí y qué no debe salir del dispositivo

**Recomendación (Obligatorio): asumir que toda información innecesaria NO sale del dispositivo. Enviar texto
crudo solo cuando el texto *es* la señal; para todo lo demás, agregar antes de enviar.**

La exploración encontró que 4 de 6 flujos mandan transacciones completas (descripción, monto, fecha) en texto
plano a Groq, sin anonimizar. Propuesta explícita por flujo:

| Flujo | Hoy envía | Debe enviar | Justificación |
|---|---|---|---|
| Categorización | (solo la descripción) | **Solo la descripción del movimiento** | El texto *es* la señal; no necesita monto, fecha ni otras transacciones. |
| "Una idea sobre tu plata" (análisis) | 50 transacciones completas | **Totales agregados por categoría/período** | El patrón se calcula sobre agregados; descripciones y fechas exactas no aportan y son PII. |
| Mirada a futuro (predicción) | 100 transacciones completas | **Totales agregados por categoría/mes** | Igual que arriba: no requiere transacciones individuales. |
| Anomalías | 50 transacciones completas | **Preferible: cálculo local; si va al LLM, categoría+monto sin descripción** | Detectar "esta categoría está 2× su promedio" no necesita descripciones. |
| Chat (si llega) | 10 transacciones completas | **Agregados + solo lo que la pregunta referencia** | Es el flujo más expuesto; nunca un volcado ciego de transacciones. |
| Mapeo de CSV | headers + 3 filas completas | **Headers; muestras enmascaradas si hacen falta** | Puede incluir números de cuenta; el mapeo se resuelve con los headers. |

**Regla de fondo:** monto, fecha y la lista completa de transacciones **no salen del dispositivo** para
análisis/predicción — esos flujos trabajan sobre agregados a nivel categoría. El único texto libre que sale es
la descripción de *un* movimiento para categorizarlo, y solo tras consentimiento explícito (Q5 caso 3). Esto
además es condición de la Regla de Oro: Rosa teme "quedar expuesta" (cap 02) — la app no puede exponerla a un
tercero sin que lo entienda y lo acepte.

#### 7.1 Mecanismo de consentimiento (resuelto a nivel de producto, no delegado a sdd-design)

El consentimiento no es una casilla legal ni un detalle técnico: es cómo Saldo le pide permiso a Rosa para
mostrarle la descripción de su movimiento a un tercero. Esta fase de producto lo resuelve completo. sdd-design
solo decidirá el "cómo" técnico (dónde se persiste el flag, cómo lo lee la entrada única de Q3), nunca el
qué/cuándo/copy.

- **Cuándo aparece por primera vez — al primer uso de la IA, en contexto, no en el onboarding.** No se pide
  consentimiento por adelantado en una pantalla de bienvenida: eso agregaría tensión antes de que la persona
  vea valor (cap 01) y sería un paso más antes de empezar (cap 03 regla 5, cap 02: Rosa rechaza "pasos
  innecesarios"). El pedido aparece *justo en el momento* en que el primer dato saldría del dispositivo — la
  primera vez que Rosa escribe una descripción y la IA está por sugerir una categoría. Just-in-time: se pide
  cuando importa, no antes.

- **Global, no por funcionalidad.** Un solo consentimiento cubre toda la IA de Saldo. La persona debe
  experimentar "la IA de Saldo" como una sola cosa (Q3, entrada única), no como una colección de features que
  cada una pide permiso por su lado — pedir consentimiento punta por punta fragmentaría esa unidad y repetiría
  fricción (cap 02, "pasos innecesarios"). Como el MVP tiene una sola punta visible, un consentimiento global es
  además a prueba de futuro: cuando lleguen más puntas, ya están cubiertas por la misma decisión que Rosa tomó
  una vez.

- **Cómo se revoca — desde su cuenta, con un control simple, cuando quiera.** El interruptor de "usar la IA de
  Saldo" vive en el área de cuenta (`ProfilePage`, el mismo lugar donde ya se gestiona el plan — explore §7), no
  escondido en una configuración técnica. Apagarlo es inmediato y no pide justificación. El consentimiento es un
  estado elegido que se respeta en ambas direcciones (Q5 caso 3): se puede dar y se puede retirar con el mismo
  toque.

- **Qué pasa sin consentimiento — la superficie de IA no aparece, el flujo central sigue entero.** Si Rosa no
  dio (o retiró) el consentimiento, la sugerencia de IA simplemente no se muestra; el selector de categoría
  manual funciona igual de bien y ella carga su movimiento sin obstáculo. La IA cae sola, nunca arrastra el
  flujo central (mismo principio que Q5 caso 4). No hay UI rota ni insistencia (cap 13: no reenganchar por
  presión); como mucho, una invitación calma y de una línea a activarla, que se puede ignorar sin costo.

- **Qué copy vería Rosa (ejemplo, no diseño visual).** En el momento del primer uso, en el tono ya establecido
  —sin jerga, sin miedo, nombrando exactamente qué sale del dispositivo y dejando la decisión en sus manos (cap
  02, teme "quedar expuesta"):

  > **"Para sugerirte la categoría, Saldo le muestra la descripción de este movimiento a un servicio que nos
  > ayuda con eso. Vos decidís."**
  > Opciones: **"Activar"** · **"Ahora no"**

  Y en el control de cuenta para revocar, una línea que devuelve control sin dramatizar: **"Usar la IA de Saldo
  — podés apagarla cuando quieras."** Ninguno nombra al proveedor (Q2/Q7), ninguno usa "IA/datos/tercero" como
  jerga técnica, y ninguno castiga ni asusta si elige que no.

---

### 8. Rate limit — una única fuente de verdad

**Recomendación (Obligatorio): una sola cifra, la que el servidor realmente aplica; y no mostrársela a Rosa
como jerga.**

La exploración documentó tres cifras contradictorias: UI dice 30/min (`AIProviderStatus.jsx:74`), limiter
cliente aplica 20/min (`ai-providers.js:35`), servidor enforcea 10/min (`ai-proxy.js:26`) — la UI miente sobre
el límite real. Decisión:

- **La verdad es el límite server-side (10/min):** es el único que realmente se aplica. Todo lo demás se alinea
  a ese valor desde una sola definición de configuración.
- **El limiter cliente** existe solo como cortesía anti-spam de clicks; debe igualar o quedar por debajo del
  server, nunca prometer más.
- **La UI no le muestra "req/min" a Rosa** (jerga que falla la Regla de Oro). Cuando se alcanza el límite, se
  usa el copy humano del caso 2 de Q5, no un número técnico. La cifra vive en la config, no en la cara del
  usuario. *(La mecánica de fuente única compartida es sdd-design.)*

---

### 9. Deuda técnica — qué es obligatorio resolver antes del primer componente y qué puede esperar

**Obligatorio antes de montar la primera punta (bloquean el MVP):**
- **Shape mismatch de `SmartCategorySelector` (`confidence` número vs string).** Es el componente del MVP y es
  un bug real (siempre cae al `default`, sin color ni etiqueta). Bloquea.
- **Duplicación de `useAIInsights` → entrada única (Q3).** Montar hoy crearía una tercera copia de estado
  aislada. Bloquea la coherencia del MVP.
- **Rate limit a fuente única (Q8) + aviso de privacidad (Q7).** Precondiciones de confianza antes de que
  cualquier dato real salga del dispositivo.

**Puede esperar (atado a componentes diferidos):**
- **Shape mismatch de `PredictiveChart` (`totalEstimado` / objetos `{razon,confianza,monto}`).**
- **Shape mismatch de `AIAlerts` (`categoria`/`mensaje`/`accionSugerida`).**

Razón: ambos componentes están excluidos esta versión (Q2). Arreglar el shape de algo que no vamos a montar es
trabajo sin retorno; su deuda se difiere *junto con* el componente. Solo se paga la deuda que habilita la
superficie del MVP.

---

### 10. Filosofía del futuro AIChat — dirección fijada, no implementación

`AIChat` está **diferido** (Q2): no se implementa en este release. Pero para que cuando llegue no se construya el
chatbot equivocado, esta propuesta fija su dirección de producto como decisión ya tomada —no como un detalle que
sdd-design o una versión futura decidan sobre la marcha:

- **No es un chatbot generalista.** No escribe poemas, no responde preguntas de cultura general, no conversa
  sobre cualquier tema. Su único dominio es la plata de la persona dentro de Saldo.
- **Responde exclusivamente sobre las finanzas del usuario en Saldo.** Su materia es *"¿en qué se me fue?"*,
  *"¿cómo vengo este mes?"*, *"¿cuánto gasté en [categoría]?"* — nunca un asistente de propósito general.
- **No reemplaza la navegación de la app.** No es un comando universal para "hacer cosas" (crear movimientos,
  cambiar configuraciones, ejecutar acciones por el usuario). Acompaña la lectura de la plata; no es una capa de
  control sobre la aplicación. Esa distinción importa: un chat que "hace cosas" empujaría a la IA al centro del
  flujo, y la IA nunca es protagonista (cap 03 regla 7).
- **No genera contenido arbitrario.** Nada de texto libre fuera de finanzas.
- **Su personalidad la gobierna el Product Master, igual que el resto de la IA.** Mismo tono sin jerga (cap 04,
  vocabulario prohibido — nunca "análisis", "predicción", ni el nombre del modelo), sin urgencia ni culpa (cap
  13), sin sermonear (cap 15 §3: describe un patrón, no instruye ni regaña), respuestas cortas (cap 04: *"si un
  texto puede decirse en 6 palabras, no lo hagas en 12"*), al servicio de bajar ansiedad (cap 01). El chat no es
  una excepción al tono: es una punta más de "la IA de Saldo", que la persona debe sentir como una sola cosa
  (Q3).
- **Reconoce su límite con naturalidad.** Si una pregunta cae fuera del dominio financiero de Saldo, el chat no
  responde con un error genérico y frío ("no puedo ayudarte con eso" falla cap 09 —error sin salida— y cap 01
  —agrega fricción, no calma). Reconoce el límite en el mismo tono humano y reorienta hacia lo que sí puede
  hacer. Ejemplo de copy dentro del tono ya establecido:

  > **"Eso se me escapa — yo te ayudo con tu plata acá en Saldo. ¿Querés que miremos en qué se te fue este mes?"**

  Es un límite dicho sin culpa y con salida clara (cap 01, cap 09: orientar en vez de castigar la acción), no una
  pared.

Esta dirección es coherente con lo que el código ya insinúa —el `AIChat` construido es "de propósito general
acotado a finanzas", con un system-prompt que ya pide respuestas cortas en español (explore §2)— pero acá se
fija como **decisión de producto**, no como un detalle heredado de la implementación previa. El "cómo" (qué
contexto financiero recibe, con qué minimización de datos — ya acotada en Q7 a agregados + solo lo que la
pregunta referencia) es sdd-design, cuando el chat entre al roadmap.

---

## Resumen: destino de los 6 componentes huérfanos

| Componente | Destino | Razón de producto |
|---|---|---|
| `SmartCategorySelector` | **MVP** (tras fix de `confidence`) | Encarna "sugerir, no imponer" (cap 15 §3); superficie de datos mínima (solo la descripción). Requiere corregir `confidence` (número→etiqueta) antes de montar. |
| `AIInsightsPanel` | **Rediseñar antes de incluir** | El "score" puede leerse como juicio; el footer de tokens/costo narra el proceso del sistema (cap 09/15 lo rechazan). Su motor puede alimentar "Una idea sobre tu plata", pero el panel-dashboard no entra. |
| `AIProviderStatus` | **Excluido** | Jerga técnica (modelo, proveedor, req/min) e IA protagonista; Rosa no entiende "Llama 3.3" y no debería tener que hacerlo. Falla la Regla de Oro (cap 20) y cap 03 regla 7. |
| `PredictiveChart` | **Excluido esta versión / rediseñar** | "Predicción" es palabra prohibida (cap 04); necesita ≥4 semanas de historial para no inventar patrón (cap 15 §1); el formato chart ya fue descartado a favor de un texto humilde. |
| `AIAlerts` | **Excluido esta versión / rediseñar** | Alertas + severidad fabrican ansiedad (cap 01, cap 13); las señales ya se decidieron entregar como "Una idea sobre tu plata", no como badge rojo. Requiere historial + rediseño. |
| `AIChat` | **Diferido — con dirección de producto fijada (Q10)** | Diferido, no indefinido: Q10 fija que el chat real será acotado a las finanzas del usuario en Saldo (no chatbot generalista, no comando de navegación, no genera contenido arbitrario), con la personalidad del Product Master (sin jerga/urgencia/culpa; cap 03/04/13/15) y reconociendo su límite sin errores fríos. El `FloatingChatWidget` falso debe retirarse por honestidad (cap 09/20); el chat real se gana su lugar después, construido según esa dirección. |

---

## Estado

**Listo para sdd-spec.** Esta propuesta fija intención y alcance de producto. El **mecanismo de consentimiento
de privacidad ya está resuelto a nivel de producto en esta propuesta (Q7.1)**: el qué, el cuándo (primer uso, en
contexto), si es global o por feature (global), cómo se revoca (control en la cuenta), qué pasa sin
consentimiento (la superficie de IA no aparece, el flujo central sigue) y el copy que ve Rosa son decisiones de
producto tomadas acá — no quedan delegadas. La fase de diseño técnico (sdd-design) resolverá solo el "cómo":
consolidación del hook en una entrada única, mecánica de agregación de datos antes del envío, fuente única de
configuración del rate limit, punto de enforcement del gate de plan, forma de retiro del `FloatingChatWidget`, y
—sobre el consentimiento— únicamente su parte técnica (dónde se persiste el flag, cómo lo lee la entrada única),
nunca el qué/cuándo/copy, que ya están fijados.
