# GOV-001 — Jerarquía de autoridad documental de producto

**Tipo**: documento de análisis y recomendación. **No es una decisión tomada.**
**Fecha**: 2026-08-06
**Origen**: divergencias documentales detectadas durante `metas-exposicion` (cerrada) y el Discovery de `dashboard-claridad` (aprobado, `sdd-propose` pospuesto por el PO).
**Alcance**: gobernanza documental. No contiene código, no modifica ningún archivo existente, no toca `openspec/`, no propone componentes, layouts ni arquitectura técnica.
**Qué requiere**: una decisión del Product Owner sobre la §2 (jerarquía) antes de que las §3 y §4 puedan ejecutarse.

**Regla de verificación aplicada (RETRO-001, ratificada)**: toda afirmación sobre qué dice un documento está verificada contra su texto literal, con cita `archivo:línea`. No se usó ningún resumen previo, comentario de código ni memoria como fuente. Donde no fue posible verificar contra un archivo del repositorio, se dice explícitamente y se marca la cita como **heredada**.

---

## 0. Resumen ejecutivo

Se identificaron **diez contradicciones**: las 4 ya conocidas al abrir este análisis, más 6 detectadas al releer los documentos primarios completos.

El patrón común a las diez no es descuido: es que **SALDO tiene dos tracks de gobernanza que crecieron en paralelo y solo se cruzaron formalmente una vez** — el track de Product Master (21 capítulos, `docs/product-master/`) y el track de diseño (Design Constitution, Experience Constitution, Product Blueprint, Design Review Guide, screen specs). El único cruce formal fue PM-RECON-003 (`docs/product-master/00-STATE.md:482-513`, 2026-07-28), que el propio documento describe como *"nunca cruzados formalmente antes de este ticket"* (`:485`). Ese cruce resolvió 4 puntos; no estableció una regla de precedencia permanente, así que la siguiente divergencia volvió a resolverse ad-hoc.

A eso se suma un tercer track más nuevo y más autoritativo que los dos anteriores — la serie PDP del Product Owner — que **no tiene existencia documental en el repositorio**.

La recomendación central de este documento es que la jerarquía se defina **por dominio, no por antigüedad**, y que una decisión del PO gane siempre sobre el papel pero **no sea implementable hasta que el papel esté normalizado** — extendiendo la política que el propio proyecto ya tiene escrita (Normalización / Corrección / Evolución, `docs/product-master/00-STATE.md:390`) al track de diseño.

---

## 1. Contradicciones identificadas

Las contradicciones marcadas **[conocida]** son las que abrieron este encargo. Las marcadas **[nueva]** aparecieron al releer los documentos primarios completos.

### C-01 — «Metas» no existe en el mapa de superficies, pero existe en producción **[conocida]**

| Documento | Qué dice |
|---|---|
| `Saldo Product Blueprint.dc.html:71` | *"02 · Mapa completo del producto — **todas las superficies** y sus conexiones"* |
| `Saldo Product Blueprint.dc.html:86-121` | Las superficies que el mapa enumera: Onboarding, Permisos, **Dashboard**, **Hoja**, **Historial**, **Insights**, **Perfil y ajustes**, **Importación**, **Suscripción**, **⌘K**. Metas no aparece. |
| `Saldo Product Blueprint.dc.html:236` | Metas sí aparece, pero en §07 (Escalabilidad), como crecimiento admisible: *"Presupuestos y metas — **como contexto del mes** («tu media», «tu límite»), nunca como gamificación."* |
| `Saldo Experience Constitution.dc.html:187` | El único texto de diseño que le da a Metas un derecho propio: *"**No se aplica**: a compromisos que el usuario creó voluntariamente (metas, recordatorios propios): esos sí se muestran, porque son suyos."* |
| `openspec/.../design.md:105` | *"Vista `metas`: **Ratificada como superficie oficial del Blueprint** (PDP-001 §4.4 eleva Metas a módulo principal; el registro formal en Product Master queda para `sdd-archive`…)"* |
| `src/App.jsx:477` | `{activeTab === 'metas' && …<GoalManager … />…}` — la vista existe y está en producción desde `metas-exposicion`. |

**Por qué es contradicción y no omisión**: un documento que se autodeclara *"mapa completo … todas las superficies"* y omite una superficie viva no está incompleto, está **incorrecto**. Si fuera omisión, el Blueprint no reclamaría completitud. Y la ratificación de `design.md:105` afirma un hecho sobre el Blueprint (*"superficie oficial del Blueprint"*) que el Blueprint no dice — el Blueprint no fue tocado. Además, `Saldo Product Blueprint.dc.html:236` no es neutral: escala Metas *"como contexto del mes"*, que es exactamente lo contrario de una superficie propia.

**Agravante no registrado antes**: el mismo mapa omite otras **dos** superficies vivas — `planificacion` y `herramientas`, ambas montadas en `src/App.jsx` y ambas ya documentadas como sin destino de navegación (`docs/design/integration-debt.md:14`, `:31`). Es decir, el mapa "completo" omite tres superficies de producción, no una. Metas es el caso visible, no el caso aislado.

### C-02 — El contenido del Dashboard está definido cuatro veces, de cuatro maneras distintas **[conocida, ampliada]**

| Fuente | Qué fija como contenido del Dashboard |
|---|---|
| `Saldo Design Constitution.dc.html:528` | Tres preguntas: *"**¿cuánto tengo? ¿cómo va el mes? ¿hay algo que atender?** Todo lo que no responde una de las tres, no aparece."* |
| `Saldo Design Constitution.dc.html:532` | Cinco esenciales: *"Saldo total disponible (la cifra protagonista) · gasto del mes frente a lo habitual · movimientos recientes · máximo un aviso accionable · una nota de la IA, si existe."* |
| `Saldo Experience Constitution.dc.html:343` | Cuatro paradas: *"la cifra protagonista (¿cuánto tengo?) → el contexto del mes (¿cómo voy?) → lo reciente (¿está todo registrado?) → lo que atender, si existe."* — la nota de IA **no es una parada del recorrido**. |
| `docs/product-master/01-la-filosofia.md:68` | *"Inicio: mostrar de forma directa **cuánto entró, cuánto salió y cuánto queda hoy**"* — reforzado como fundacional en `00-STATE.md:582`: *"(definido en cap 01, **no redefinir distinto** en cap 05 o 06)"*. |
| `Saldo Dashboard.dc.html:36-152` | Lo que el mockup efectivamente dibuja: saldo disponible, gasto del mes + 6 barras, nota de IA, movimientos recientes. **No dibuja "un aviso accionable"** en ningún estado. |
| PDP-001 §4.2 **[heredada, no verificable en repo]** | Cinco secciones: situación actual, resumen mensual, idea sobre tu plata, **metas activas**, **acciones rápidas** (heredada de `openspec/.../proposal.md:15,29`). |

**Por qué es contradicción y no capas complementarias**:

1. `01-la-filosofia.md:68` exige mostrar **cuánto entró** (ingresos del período) como una de tres cifras directas del Inicio, y `00-STATE.md:582` blinda esa definición con un "no redefinir distinto". La lista de esenciales de la Design Constitution (`:532`) **no contiene ingresos del período** en ninguna forma. Ambos textos definen el mismo objeto — el contenido obligatorio del Inicio — y difieren en un elemento. Eso es una contradicción directa, no un cambio de nivel de abstracción.
2. La Design Constitution declara esencial *"máximo un aviso accionable"* (`:532`, con justificación propia en `:544`), y ninguno de los renders del mockup vigente lo dibuja. Un elemento declarado esencial por la constitución y ausente de la spec visual que la implementa es una divergencia interna del propio track de diseño.
3. La Experience Constitution (`:343`) enumera el recorrido completo del ojo *"sin bifurcaciones"* y no incluye la nota de IA como parada, mientras la Design Constitution la lista como uno de los cinco esenciales. Ambas son constituciones del mismo nivel declarado.

### C-03 — «Una cifra protagonista» vs. «el trío de cifras» **[nueva]**

| Documento | Texto literal |
|---|---|
| `Saldo Design Constitution.dc.html:660` | Regla inquebrantable 02: *"**Una cifra protagonista por vista.** Todo lo demás baja al menos un nivel de jerarquía tipográfica."* |
| `docs/product-master/00-STATE.md:626` | *"Jerarquía del Inicio con el tiempo (cap 17, Hallazgo 3): **el trío de cifras de cap 01 siempre es el elemento más prominente**, ninguna pieza de V2/V3 … puede competir con él ni apilarse con otra al mismo tiempo"* |

**Por qué es contradicción real**: no discuten sobre estética sino sobre la misma regla de jerarquía tipográfica de la misma pantalla, y son mutuamente excluyentes. Si el trío (entró / salió / queda) es *el elemento más prominente* como conjunto, entonces hay tres cifras al mismo nivel superior, y la regla 02 se incumple. Si se cumple la regla 02, dos de las tres cifras del trío bajan de nivel, y la decisión fundacional de `00-STATE.md:626` se incumple. Hoy el código resuelve el empate a favor de la Design Constitution (`DashboardHome.jsx` muestra "Saldo disponible" como única cifra protagonista) — pero esa resolución nunca fue decidida, solo implementada. Y la regla 02 está en la lista de las diez inquebrantables, cuya modificación exige el proceso constitucional (`Saldo Design Review Guide.dc.html:210`).

### C-04 — R-08 (tope duro de 4) vs. «≤ 7 destinos» **[conocida, con corrección importante]**

| Documento | Texto literal |
|---|---|
| `Saldo Design Review Guide.dc.html:144` | R-08: *"Romper el presupuesto de superficie: **5.º destino de navegación**, 2.º FAB, 2.ª capa modal, 2.ª nota."* |
| `Saldo Design Review Guide.dc.html:60` | *"¿Respeta el presupuesto de superficie? **(4 destinos, 1 nota, 1 modal)**"* |
| `Saldo Product Blueprint.dc.html:255` | *"el producto tiene **4 destinos de navegación** y 1 hueco de nota — **para siempre**"* |
| `Saldo Design Constitution.dc.html:562` | Mobile: *"navegación inferior de **4 destinos**"* |
| `Saldo Design Constitution.dc.html:478` | Componente Sidebar: *"Mismo fondo que la página, sin caja propia. **≤ 7 destinos.** La sección activa se marca con peso, no con relleno."* |
| `Saldo Dashboard.dc.html:147` | Notas de construcción del mockup: *"Sidebar sin caja: activo por peso 600, no por relleno. **≤ 7 destinos (4 usados).**"* |

**Corrección al planteo original de este encargo**: el comentario de `src/components/ds/dsNavItems.js` **no inventó** la frase "≤ 7 destinos, 4 usados". Esa frase existe **literalmente** en un documento de diseño vigente: `Saldo Dashboard.dc.html:147`, que es además la fuente de verdad que el propio código declara (`DashboardHome.jsx:16`, `dsNavItems.js:3-4`). El error del comentario fue de **atribución** (se la asignó a R-08, que dice otra cosa), no de invención.

**Por qué es contradicción real, y por qué corregir el comentario no la resolvió**: la Design Constitution admite hasta 7 destinos de sidebar; el Blueprint y el Design Review Guide fijan 4 *"para siempre"* y convierten el 5.º en error crítico bloqueante. El screen spec del Dashboard reconcilia ambos con un *"(4 usados)"* que implica que 5, 6 y 7 son slots disponibles — exactamente lo que R-08 prohíbe. La corrección del comentario de código (aplicada en `metas-exposicion`) alineó **el código** con la interpretación correcta, pero dejó **los tres documentos** contradiciéndose entre sí. La próxima persona que lea `Saldo Design Constitution.dc.html:478` o `Saldo Dashboard.dc.html:147` sin leer el Design Review Guide repetirá la premisa equivocada. La lección de RETRO-001 (`:37`, *"no confiar en comentarios de código como fuente de verdad"*) se cumplió; el problema es que **la fuente de verdad también se contradice a sí misma**.

### C-05 — «Insights» es vocabulario prohibido y a la vez es una etiqueta de navegación en producción **[nueva]**

| Documento | Texto literal |
|---|---|
| `docs/product-master/04-ux-manifesto.md:13-14` | *"## Vocabulario prohibido — Estas palabras **no deben aparecer en la interfaz como nombre de secciones, botones, estados o mensajes centrales**"* |
| `docs/product-master/04-ux-manifesto.md:17,21` | La lista incluye `Insights` y `CSV`. |
| `docs/product-master/00-STATE.md:580` | Decisión fundacional: *"Vocabulario prohibido global UX: Analytics, **Insights**, Planning, Import AI, OCR, **CSV**, JSON"* |
| `docs/product-master/00-STATE.md:601` | *"la etapa de IA … se llama «hallazgo IA», nunca «insight IA» — **«Insights» es vocabulario prohibido** (cap 04, línea 17)"* |
| `Saldo Product Blueprint.dc.html:101` | Superficie del núcleo: *"**Insights** — el espejo"* |
| `Saldo Dashboard.dc.html:50` | Sidebar del mockup desktop: `<span …>Insights</span>` — etiqueta de navegación visible. |
| `Saldo Dashboard.dc.html:235` | Bottom nav del mockup mobile: idem. |
| `src/components/ds/dsNavItems.js:17` | `{ id: 'graficos', label: 'Insights', icon: PieChart }` — **enviado a producción**. |
| `Saldo Product Blueprint.dc.html:113` | Superficie Importación: *"**CSV** / banco…"* |

**Por qué es contradicción real y por qué importa más que las otras**: cap 04 no prohíbe la palabra en documentos internos — prohíbe que aparezca *"en la interfaz como nombre de secciones"*. `Saldo Dashboard.dc.html:50` dibuja literalmente un ítem de navegación rotulado "Insights", y el código lo envía a la pantalla del usuario. Es la única de las diez contradicciones que **ya está incumplida en producción, hoy, de forma visible para el usuario final**, y ninguna revisión la detectó porque los dos tracks nunca se cruzaron en el eje de vocabulario. El proyecto ya demostró que toma la regla en serio: `00-STATE.md:375` registra una *"Corrección de código de `UpgradeModal.jsx`/`PricingPlans.jsx` (vocabulario CSV/PDF…)"* — se corrigió el vocabulario prohibido en una superficie comercial mientras se dejaba intacto en la barra de navegación principal.

### C-06 — El mecanismo por el que el Dashboard puede crecer **[nueva]**

| Documento | Texto literal |
|---|---|
| `Saldo Experience Constitution.dc.html:355` | *"**Cuándo falta algo** — Solo hay **una señal válida**: los usuarios abandonan el dashboard hacia el mismo destino, una y otra vez, nada más llegar… Se promociona esa respuesta — y **idealmente se degrada otra cosa para mantener el peso total**. El dashboard crece por evidencia de uso, **jamás por petición de roadmap**."* |
| `Saldo Product Blueprint.dc.html:255` | Tercer freno anti-ERP: *"cada elemento nuevo en Dashboard debe demostrar que **reduce más ansiedad de la que su presencia añade**. En caso de duda, la respuesta es no — mil noes por cada sí."* |
| `Saldo Design Constitution.dc.html:550` | *"Cada elemento añadido a la portada convierte la apertura en una **auditoría involuntaria**."* |
| PDP-001 §4.2 **[heredada]** | Agrega dos secciones al Dashboard (metas activas, acciones rápidas). |

**Por qué es la contradicción más profunda de la lista**: las demás discuten *qué* dice cada documento. Esta discute *quién puede cambiar el Dashboard y con qué evidencia*. La Experience Constitution no dice "el Dashboard tiene estos elementos"; dice que **el único mecanismo legítimo de crecimiento es la evidencia de uso**, y descarta explícitamente el mecanismo alternativo por su nombre: *"jamás por petición de roadmap"*. PDP-001 es, por construcción, una petición de roadmap. No es que PDP-001 pida elementos que la constitución prohíba — es que pide por una vía que la constitución declara inválida. Resolver C-02 eligiendo qué elementos van en el Dashboard **no resuelve C-06**: quedaría resuelto el *qué* y sin resolver el *cómo se decidió*. Y la constitución agrega un requisito de compensación (*"idealmente se degrada otra cosa para mantener el peso total"*) que ninguna de las fuentes de PDP-001 contempla.

### C-07 — Product Master afirma «sin confeti» mientras el código envía confeti **[nueva]**

| Documento | Texto literal / hecho |
|---|---|
| `docs/product-master/14-gamificacion.md:88-91` | *"**Aclaración de alcance (PM-RECON-003, 2026-07-28):** este capítulo no es gamificación tradicional. **No usa** puntos, rankings, competencia entre usuarios, streak clásico como obligación diaria, presión psicológica **ni confeti** u otros mecanismos de recompensa conductual"* |
| `docs/product-master/00-STATE.md:635` | Registrada como decisión fundacional, misma redacción, *"sin confeti"*. |
| `Saldo Product Blueprint.dc.html:246` | *"Rachas, logros, niveles, **confeti** — la salud financiera no es un juego."* (columna "Jamás debe agregarse") |
| `Saldo Design Review Guide.dc.html:143` | R-07, error crítico: *"Gamificación: rachas, logros, **confeti**, contadores animados, celebraciones."* |
| `src/features/goals/GoalManager.jsx:4` | `import Confetti from 'react-confetti';` |
| `src/features/goals/GoalManager.jsx:65` | `// Meta alcanzada - mostrar confetti` |
| `docs/design/integration-debt.md:38` | Registrado el 2026-08-06 como deuda: *"`GoalManager.jsx` usa `react-confetti`, `TrophyWebP` y animaciones `framer-motion` al completar una meta."* |

**Por qué es contradicción documental y no solo deuda técnica**: la deuda técnica ya está registrada y tiene ticket (`integration-debt.md:38`, PO 2026-08-06). Lo que **no** está registrado es que `14-gamificacion.md:88-91` no formula una prohibición ("no debe usar confeti") sino una **afirmación de hecho sobre el producto** ("no usa … ni confeti"), escrita el 2026-07-28 y elevada a decisión fundacional en `00-STATE.md:635`. Esa afirmación era falsa cuando se escribió: `GoalManager.jsx` ya importaba `react-confetti`. El hecho se registró recién nueve días después, por un ciclo distinto (`sdd-design` de `metas-exposicion`), y **nadie volvió a tocar cap 14**. Hoy el Product Master afirma como cerrado y verificado algo que el log de deuda del track de diseño contradice. Es el caso más claro de por qué una reconciliación documental necesita verificación contra el código, no solo contra otros documentos.

### C-08 — La Constitution contradice a sus propios mockups en contraste tipográfico **[preexistente, ya registrada]**

Registrada en `docs/design/integration-debt.md:24` y no resuelta: la regla de contraste define `text/tertiary` (#9E9E9E) como *"uso permitido solo en >=14px"*, mientras *"los propios mockups de `Saldo Dashboard.dc.html` usan `tertiary` en tamaños menores (10-13px) en los mismos lugares donde este shell lo replica"*. El propio registro la clasifica como *"**Ambigüedad constitucional real**, no un error de implementación"* y su resolución prevista dice *"requiere que el PO/diseño resuelva la contradicción"*. Se incluye acá porque es del mismo tipo estructural que C-04: **una regla transversal de la Constitution contra una spec visual concreta de la misma Constitution**, y porque toca R-09 (`Saldo Design Review Guide.dc.html:145`, *"La accesibilidad no puntúa: bloquea"*), lo que la hace potencialmente bloqueante de revisión.

### C-09 — El Blueprint define arquitecturas objetivo que la aplicación no implementa **[preexistente, patrón relevante]**

Dos filas de `docs/design/integration-debt.md` documentan el mismo patrón que C-01, con la resolución invertida:

- `:31` — Exportar e Importación viven juntas en `herramientas`; el Blueprint (`:108-113`) ya define que Exportar pertenece a "Perfil y ajustes" e Importación es superficie propia. Clasificado como *"Deuda arquitectónica … el Blueprint ya define el destino correcto de cada función, **no requiere una nueva decisión de producto**"*.
- `:32` — Suscripción vive como `UpgradeModal` reactivo; el Blueprint (`:117`) define *"Una página franca en Perfil + una invitación contextual al mes"*. Resuelto documentalmente por PM-RECON-003 ratificando el Blueprint; código pendiente.

**Por qué es relevante para este análisis y no solo deuda**: en C-09 el Blueprint **gana** sobre el código y sobre un documento técnico anterior, sin discusión. En C-01 el Blueprint **pierde** frente a una decisión del PO, también sin discusión. Las dos resoluciones son defendibles por separado; juntas demuestran que **hoy no existe una regla, solo una sucesión de decisiones ad-hoc**. Ese es el problema que la §2 intenta resolver.

### C-10 — La autoridad más alta del producto no existe como documento **[conocida]**

| Hecho | Evidencia |
|---|---|
| `openspec/.../proposal.md:3` declara *"**Autoridad**: PDP-001 (Product Owner, aprobado, v1.0)"*. | Verificado. |
| PDP-001 no existe como archivo en el repositorio. | Verificado por búsqueda exhaustiva en este análisis: `PDP-001` aparece únicamente en `docs/design/integration-debt.md:38`, `docs/release/RETRO-001-metas-exposicion.md:11`, `openspec/.../proposal.md:3,8,12,15,21,70`, `openspec/.../design.md:22,105` y `openspec/.../dashboard-claridad-discovery.md`. Ningún archivo lo contiene íntegro. |
| Ya está registrado como limitación metodológica. | `openspec/.../dashboard-claridad-discovery.md:14`: *"**PDP-001 no existe como archivo en el repositorio** … Es un documento que el PO entregó fuera del repo"*. |

**Por qué es una contradicción y no solo un hueco**: el proyecto tiene una regla explícita y ratificada — verificar toda afirmación contra el texto literal de la fuente (`RETRO-001-metas-exposicion.md:37,54`). PDP-001 es simultáneamente **la fuente de mayor autoridad declarada** y **la única fuente estructuralmente inverificable**. La regla no puede aplicarse a la autoridad que gobierna todo lo demás. Concretamente: `proposal.md:15` compromete *"evolucionar `DashboardHome.jsx` con las 5 secciones de PDP-001 §4.2"* y ningún agente ni persona puede hoy comprobar que esas cinco secciones sean las que PDP-001 pide, ni si su §4.4 dice exactamente *"módulo principal"*. Todo lo que se sabe es una paráfrasis de una paráfrasis.

### Resumen de contradicciones

| # | Contradicción | Estado | Eje |
|---|---|---|---|
| C-01 | Metas (y `planificacion`, `herramientas`) fuera del "mapa completo" | Abierta | Superficies |
| C-02 | Cuatro definiciones del contenido del Dashboard | Abierta | Contenido |
| C-03 | Una cifra protagonista vs. trío de cifras | Abierta, resuelta de facto por el código sin decisión | Jerarquía |
| C-04 | R-08 (4 duro) vs. Sidebar "≤ 7" vs. mockup "(4 usados)" | Abierta en documentos; alineada en código | Navegación |
| C-05 | "Insights"/"CSV" prohibidos vs. etiqueta de nav en producción | **Abierta e incumplida en producción** | Vocabulario |
| C-06 | El Dashboard "crece por evidencia de uso, jamás por petición de roadmap" | Abierta | Proceso |
| C-07 | Cap 14 afirma "sin confeti"; `GoalManager` envía confeti | Abierta (documento desactualizado, deuda con ticket) | Verdad documental |
| C-08 | `tertiary` <14px: Constitution vs. sus mockups | Abierta desde 2026-07-17 | Accesibilidad |
| C-09 | Blueprint define arquitecturas que el código no implementa | Deuda aceptada; precedente inverso a C-01 | Precedencia |
| C-10 | PDP-001: máxima autoridad, sin existencia documental | Abierta | Gobernanza |

---

## 2. Jerarquía de autoridad documental — propuesta

### 2.1 Por qué no alcanza con una lista ordenada

La tentación es ordenar los documentos de 1 a 7 y decir "el de arriba gana". Ese modelo falla acá por dos razones verificables:

1. **Los documentos ya declaran roles distintos, no niveles distintos.** El Blueprint lo dice explícitamente en su propia cabecera (`Saldo Product Blueprint.dc.html:30`): *"La Design Constitution dice **cómo se ve** Saldo. La Experience Constitution dice **cómo se siente**. Este documento dice **cómo se vive**"*. Tres dominios, no tres rangos. Una lista lineal obligaría a decidir, por ejemplo, si "cómo se ve" gana sobre "cómo se vive" — una pregunta sin respuesta útil.
2. **Ya existe una declaración parcial de autoridad, y es de subordinación, no de rango.** El Design Review Guide se autodeclara subordinado en su cabecera (`Saldo Design Review Guide.dc.html:33`): *"**Autoridades**: Design Constitution v1.2 · Experience Constitution v1.1 · Product Blueprint v1.0"*. Pero R-08 (`:144`) es hoy **el único lugar del corpus donde el tope de 4 destinos está escrito como regla bloqueante**, y el Blueprint solo lo enuncia en prosa (`:255`). Un modelo lineal que ponga al Review Guide debajo del Blueprint dejaría a R-08 sin fuerza propia, lo que contradice cómo el proyecto lo usa en la práctica (`src/__tests__/dsNavItems.test.js:4`, guardia de regresión).

Por eso se propone un modelo de **dos capas**: primero *dominio* (qué documento es soberano sobre qué materia), después *desempate* (qué gana cuando el conflicto cruza dominios).

### 2.2 Capa 1 — Soberanía por dominio

Cada documento es la autoridad final **dentro de su materia**. Fuera de ella, es contexto, no norma.

| Dominio | Documento soberano | Fundamento verificado |
|---|---|---|
| Propósito, misión, personas, **vocabulario** de la interfaz, principios de producto, monetización | **Product Master** (`docs/product-master/`, caps 01-21) | `04-ux-manifesto.md:13-22` fija el vocabulario prohibido/permitido; `00-STATE.md:576-641` lo blinda como decisión fundacional. Ningún documento de diseño define vocabulario. |
| Cómo se ve el producto: color, tipografía, espaciado, motion, tokens, componentes, y las **10 reglas inquebrantables** | **Design Constitution v1.2** | `Saldo Design Constitution.dc.html:30`; reglas en `:659-668`, declaradas *"condiciones de entrada"* (`:656`). |
| Cómo se siente: silencio, ritmo, densidad, filosofía de interacción y de IA, **y el mecanismo por el que una superficie puede crecer** | **Experience Constitution v1.1** | `Saldo Experience Constitution.dc.html:29`; el mecanismo de crecimiento del Dashboard en `:350-355` no está en ningún otro documento. |
| **Qué superficies existen** y cómo se conectan; presupuesto de superficie; qué puede y qué jamás puede agregarse al producto | **Product Blueprint v1.0** | `Saldo Product Blueprint.dc.html:71` (mapa completo), `:229-256` (escalabilidad y frenos anti-ERP). |
| Cómo se **aprueba o se rechaza** una pantalla: checklist, errores críticos R-01…R-10, Definition of Done de pantalla, proceso de QA de diseño | **Design Review Guide v1.0** | `Saldo Design Review Guide.dc.html:28` (*"Saldo · Design Governance"*), checklist `:39`, críticos `:137-146`, proceso de QA `:222`, Definition of Done de pantalla `:265`. |
| Cómo se ve **una** pantalla concreta: composición, estados, microcopys canónicos, notas de construcción | **Screen spec** correspondiente (`docs/design/screens/`) y **Flow spec** (`docs/design/flows/`) | `Saldo Dashboard.dc.html:29-31`; el código ya lo trata así (`DashboardHome.jsx:16`, *"Fuente: …"*). |
| Qué se construye ahora y con qué prioridad de negocio | **PDP-serie** (Product Owner) | `openspec/.../proposal.md:3`. Ver 2.4 — hoy este dominio no tiene soporte documental. |

**Fuera de la jerarquía — trazabilidad, no autoridad**: `docs/design/integration-debt.md`, `docs/release/RETRO-*`, `docs/release/RC-*`/`BR-*`, `openspec/changes/**` y el log de tickets de `docs/product-master/00-STATE.md` **registran** decisiones y desvíos; **no los crean**. Una decisión que solo vive en uno de estos archivos no es norma todavía — es una decisión pendiente de normalizar. Esto es exactamente lo que hoy pasa con la ratificación de la vista `metas` (`openspec/.../design.md:105`, ver §3).

**Código y comentarios de código: nunca autoridad, en ningún dominio.** Ya está ratificado (`RETRO-001-metas-exposicion.md:37`) y `docs/design/integration-debt.md:5-8` lo dice desde antes: *"Regla del PO: el diseño gana sobre el código; ninguna carencia técnica se resuelve inventando UX alternativa"*. C-04 muestra el corolario que falta enunciar: **un comentario de código que cita bien un documento equivocado sigue siendo un comentario equivocado**; la cita debe incluir siempre `archivo:línea`.

### 2.3 Capa 2 — Desempate para conflictos entre dominios

Cuando dos documentos soberanos de dominios distintos se contradicen sobre el mismo objeto (C-02, C-03, C-05 son exactamente eso), se propone el siguiente orden. **Es una propuesta, no una decisión**; la justificación de cada escalón es lo que se somete a criterio del PO.

| Nivel | Autoridad | Por qué en ese lugar |
|---|---|---|
| **1** | **Decisión vigente del PO** (PDP-serie y decisiones fechadas de gate) | Es la única fuente que puede cambiar el producto. Pero con el condicionamiento de 2.4: gana el *qué*, no se ejecuta hasta normalizar el *papel*. |
| **2** | **Product Master** — solo en misión, personas, principios y **vocabulario** | Es el único corpus que define para quién y para qué existe el producto. Un documento visual no puede redefinir a quién sirve el producto ni cómo se le habla. C-05 se resuelve acá: la prohibición de "Insights" gana sobre el rótulo del mockup. |
| **3** | **Constituciones de diseño** (Design + Experience) — reglas transversales | Se autodeclaran *"condiciones de entrada"* no negociables (`Saldo Design Constitution.dc.html:656`) y tienen un procedimiento de enmienda propio (`Saldo Design Review Guide.dc.html:210`). Un documento con proceso de enmienda escrito pesa más que uno sin él. |
| **4** | **Product Blueprint** — arquitectura de superficies | Se declara derivado de las dos constituciones — *"Conecta la Design Constitution v1.2 y la Experience Constitution v1.1"* (`Saldo Product Blueprint.dc.html:33`) — pero es soberano sobre qué superficies existen. C-09 ya sentó el precedente de que gana sobre el código y sobre documentos técnicos anteriores. |
| **5** | **Design Review Guide** — reglas operativas (R-01…R-10) | Se autodeclara subordinado (`:33`). **Excepción propuesta**: cuando una regla R- es la única formulación bloqueante de un principio que los niveles 3-4 enuncian solo en prosa (el caso de R-08), la regla R- prevalece sobre la prosa — porque es la forma operativa del mismo principio, no una regla distinta. Sin esta excepción, C-04 se resolvería a favor del "≤ 7 destinos" y rompería el presupuesto de superficie que el Blueprint declara *"para siempre"* (`:255`). |
| **6** | **Screen / Flow specs** | Autoridad total **dentro** de su pantalla, y solo mientras no contradigan 2-5. Un mockup es una *aplicación* de las reglas, no una fuente de reglas: por eso `Saldo Dashboard.dc.html:147` no puede crear un presupuesto de 7 destinos, y `:50` no puede autorizar vocabulario prohibido. |
| **7** | **Código y comentarios** | Nunca autoridad. Es evidencia de qué se implementó, útil para detectar divergencias (C-07), nunca para justificarlas. |

**Regla de resolución sugerida, en una línea**: *ante un conflicto, gana el documento cuyo dominio propio es la materia en disputa; si la materia pertenece a dos dominios, gana el nivel más alto de la tabla; en ambos casos, el perdedor se actualiza — nunca se deja contradiciendo.*

**Aplicación de prueba** (para que el PO evalúe la jerarquía contra casos reales, no en abstracto):

| Caso | Resolución que produce esta jerarquía |
|---|---|
| C-05 ("Insights" en la nav) | Product Master (nivel 2, dominio vocabulario) gana. El screen spec y el código deben cambiar el rótulo. **Implica trabajo funcional.** |
| C-04 (4 vs. 7 destinos) | R-08 gana por la excepción del nivel 5. `Saldo Design Constitution.dc.html:478` y `Saldo Dashboard.dc.html:147` se corrigen. **Solo documentación** (el código ya está en 4). |
| C-03 (cifra protagonista) | Empate real entre niveles 2 y 3: "el trío" es contenido (Product Master) pero "una cifra protagonista" es jerarquía tipográfica (Design Constitution, regla inquebrantable). **La jerarquía no lo resuelve sola → requiere decisión explícita del PO.** Que la jerarquía muestre dónde no alcanza es una propiedad deseable, no una falla. |
| C-01 (Metas como superficie) | Nivel 1 (decisión del PO, ya tomada 2026-08-06) gana sobre el Blueprint (nivel 4) — pero con la obligación de 2.4. |
| C-06 (cómo crece el Dashboard) | Experience Constitution (nivel 3) es soberana sobre el mecanismo. Una decisión del PO puede pasar por encima (nivel 1) pero eso es **Evolución**, y activa el proceso constitucional de `Saldo Design Review Guide.dc.html:210`. |

### 2.4 Qué pasa cuando el PO decide contra un documento existente

Esta es la pregunta central del encargo. **Ajustado por decisión del PO (2026-08-06)**, el principio queda:

> **Una decisión del Product Owner autoriza la evolución del producto, pero solo se convierte en la nueva fuente de verdad cuando queda normalizada en la documentación soberana correspondiente.**

La diferencia con la formulación original de este documento no es cosmética: la decisión del PO no es todavía "verdad" documental por sí sola — es una **autorización a evolucionar** que corre en paralelo a una obligación de normalizar. Mientras esa normalización no ocurre, la fuente de verdad para cualquier lectura posterior sigue siendo el documento soberano vigente (Capa 1), no la decisión sin normalizar — aunque la decisión ya sea vinculante para quien la tomó y ya autorice avanzar. Es la misma distinción que separó, en `metas-exposicion`, la aprobación real del PO (que sí ocurrió y es innegable) de la ratificación del Blueprint (que nunca se escribió, y por eso el Blueprint sigue sin decir la verdad sobre el producto).

El proyecto ya tiene la mitad de este mecanismo escrito y probado. `docs/product-master/00-STATE.md:390` describe *"la política permanente **Normalización / Corrección / Evolución** del producto"*, aplicada de punta a punta por primera vez en PM-RECON-002 y reutilizada en PM-RECON-003 y PM-CAT-001. Lo que se propone acá es **extender esa política al track de diseño** y agregarle una condición de ejecución.

| Carril | Qué es | Qué exige antes de implementar |
|---|---|---|
| **Normalización** | La decisión coincide con lo que los documentos ya dicen; solo faltaba escribirlo o reconocerlo formalmente. | Actualizar el documento afectado en el mismo ciclo. Sin gate adicional. Precedente: PM-RECON-003/C3 (`00-STATE.md:497-500`). |
| **Corrección** | Los documentos se contradicen entre sí, o un documento afirma algo falso sobre el producto. El PO elige cuál es el texto verdadero. | Actualizar **todos** los documentos afectados, no solo el que se leyó. Puede generar deuda de código con ticket propio. Precedente: PM-CAT-001, decisiones 4 y 5 (`00-STATE.md:528-531`). |
| **Evolución** | La decisión contradice un documento vigente y el PO decide igual. | **Gate documental obligatorio antes de `sdd-apply`.** Si toca las 10 reglas inquebrantables o R-01…R-10, aplica el proceso ya escrito: *"propuesta escrita, demostración de que la regla actual **daña al usuario** (no que estorba a una feature), y **versión nueva del documento** — nunca una excepción puntual"* (`Saldo Design Review Guide.dc.html:210`). Si toca el Blueprint, versión nueva del Blueprint. Si toca el Product Master, ticket tipo PM-RECON. |

**Por qué "gana pero no se implementa hasta normalizar", y no "gana y se implementa"**: porque la alternativa ya se probó y produjo C-01. En `metas-exposicion` el PO decidió correctamente, el ciclo se ejecutó correctamente, los tests quedaron en verde, y el resultado neto es que **el Product Blueprint hoy miente sobre el producto**. La decisión fue buena; lo que falló fue que nada obligaba a cerrar el papel. `openspec/.../design.md:105` incluso identificó la obligación (*"el registro formal en Product Master queda para `sdd-archive`"*) y la difirió a una fase que nunca corrió (`openspec/changes/archive/` contiene solo `.gitkeep` — verificado).

**Por qué el gate no debería ser bloqueante en el sentido de frenar al PO**: no lo es. El PO decide en el momento; lo que se difiere no es la decisión sino el `sdd-apply`, y solo por el tiempo de escribir el delta documental — que en los precedentes reales fue del orden de un documento breve (PM-RECON-003 modificó 6 archivos, `00-STATE.md:505-507`). Es el mismo argumento que RETRO-001 usó para volver obligatorio el Implementation Plan (`:39`): *"el costo (un documento breve) es bajo comparado con lo que hubiera costado detectar una desviación de alcance ya en código"*.

### 2.5 Condición previa: PDP-001 debe existir como archivo

La jerarquía propuesta pone la decisión del PO en el nivel 1. Eso es insostenible mientras la fuente del nivel 1 no sea verificable (C-10). Se propone, como requisito de la propia jerarquía:

- Toda PDP se deposita **íntegra** en el repositorio antes de que un `proposal.md` la cite como autoridad. Ubicación sugerida: `docs/product-decisions/PDP-001-claridad-financiera.md` (carpeta nueva; no se crea en este documento porque su contenido es del PO, no derivable).
- Mientras PDP-001 no exista como archivo, **toda cita a PDP-001 se marca explícitamente como heredada y no verificable**, tal como ya hizo el Discovery de `dashboard-claridad` (`:14`). Este documento aplica esa misma marca.
- Consecuencia práctica inmediata: `openspec/.../proposal.md:15` compromete implementar *"las 5 secciones de PDP-001 §4.2"*. Esa lista **no debería ejecutarse** hasta poder leerse en su fuente. Es la recomendación operativa más concreta de este documento.

---

## 3. Documentos que requieren actualización por decisiones ya aprobadas en `metas-exposicion`

Lo que efectivamente se decidió y aprobó en ese ciclo, verificado contra sus artefactos:

| Decisión | Fuente | Estado |
|---|---|---|
| Metas se expone por sección del Dashboard + vista dedicada, sin slot de navegación | `design.md:26-30`, riesgo E1 resuelto `:98` | Implementada (`App.jsx:477`) |
| `metas` es un `activeTab` fuera de `DS_NAV_ITEMS` | `design.md:32-36` | Implementada, con guardia de test |
| **No se enmienda R-08** | `design.md:98,104` | Confirmada |
| `GoalManager` no se modifica; su gamificación va a ticket propio | `design.md:38-40,99` | Registrada (`integration-debt.md:38`) |
| La vista `metas` queda **"ratificada como superficie oficial del Blueprint"**, con registro formal diferido | `design.md:105` | **Diferido y no ejecutado** |
| Product Acceptance otorgada | `metas-exposicion-COMPLETED.md:5` | Otorgada 2026-08-06 |

### D-1 · `docs/design/constitution/Saldo Product Blueprint.dc.html` — §02 Mapa del producto

**Por qué**: C-01. El mapa se autodeclara completo (`:71`) y omite una superficie ratificada y en producción.

**Cómo, sin inventar contenido que el PO no aprobó**: el PO aprobó *que Metas es superficie oficial* y *cómo se llega a ella* — ambas cosas están en `design.md:26-36` con su justificación. Eso es exactamente lo que el mapa necesita: un bloque de superficie con su descripción de acceso. Se propone un bloque en la fila de soporte con contenido derivable **solo** de lo aprobado, por ejemplo: *"Metas — se llega desde el Dashboard y desde ⌘K. Sin destino de navegación propio (R-08)."* Cada afirmación de esa frase tiene respaldo textual en `design.md:28,34`. **Nada más**: no se le asigna posición en el núcleo (el PO no lo decidió), no se le atribuye protagonismo, no se reescribe `:236`.

**Lo que NO se puede completar sin el PO**: el Blueprint tiene una segunda tabla, §03 Arquitectura emocional (`:143-153`), con una fila por superficie y seis columnas (produce / evita / atención / velocidad / al salir deja). Para Metas **ninguna de las seis está decidida en ningún artefacto**. Rellenarlas sería inventar producto. Se recomienda o bien dejar la fila fuera con una nota de pendiente, o bien que el PO defina las seis en una decisión breve. No hay tercera opción honesta.

**Consideración que el PO debería resolver junto con esto**: `:236` dice que metas escalan *"como contexto del mes … nunca como gamificación"*. Agregar Metas como superficie propia no contradice literalmente esa frase (una superficie puede seguir siendo contexto), pero la tensiona. Conviene decidir explícitamente si `:236` se mantiene tal cual, se matiza, o se retira — y no dejar que un lector futuro descubra la tensión por su cuenta, que es cómo empezó este documento.

### D-2 · `docs/design/constitution/Saldo Product Blueprint.dc.html` — §02, superficies `planificacion` y `herramientas`

**Por qué**: C-01, agravante. Si se actualiza el mapa por Metas y se dejan afuera las otras dos superficies vivas, el mapa sigue siendo incorrecto — solo que menos. Ambas ya tienen destino documentado: `integration-debt.md:14` (acceso por ⌘K) y `:31` (arquitectura objetivo del propio Blueprint para Exportar/Importación). **Alternativa igualmente válida**: no agregarlas y en cambio precisar el encabezado `:71` para que deje de reclamar completitud sobre superficies transitorias. Es una decisión del PO; ambas cierran la contradicción.

### D-3 · `docs/product-master/00-STATE.md` (+ `INDEX.md` si corresponde) — registro formal de la ratificación

**Por qué**: es una obligación **explícitamente contraída y no cumplida**. `design.md:105` dice: *"el registro formal en Product Master queda para `sdd-archive`, cuando se sincronizan deltas contra specs/docs oficiales"*. `sdd-archive` no corrió (`openspec/changes/archive/` vacío, verificado) y el change sigue abierto en `openspec/changes/saldo-v1-1-claridad-financiera/`. Mientras eso no se escriba, la ratificación vive únicamente en un artefacto de trazabilidad, que según 2.2 no es norma.

**Cómo**: una entrada de ticket con el formato que el propio archivo ya usa (`00-STATE.md:482-513` como molde), más una línea en "Decisiones fundacionales" si el PO considera que la superficie Metas tiene ese rango. Contenido derivable de `design.md:26-36,98,104-105` y `metas-exposicion-COMPLETED.md`. Sin contenido nuevo.

### D-4 · `docs/design/constitution/Saldo Design Constitution.dc.html:478` y `docs/design/screens/Saldo Dashboard.dc.html:147` — el «≤ 7 destinos»

**Por qué**: C-04. El ciclo `metas-exposicion` decidió explícitamente **no enmendar R-08** (`design.md:98,104`), lo que equivale a ratificar el tope de 4. Esa ratificación alineó el código y dejó los documentos como estaban. Los dos textos citados siguen habilitando hasta 7 destinos, y uno de ellos (`Saldo Dashboard.dc.html:147`) es la fuente de verdad declarada del código (`DashboardHome.jsx:16`) — es decir, la próxima lectura de la fuente correcta vuelve a producir la premisa incorrecta.

**Cómo**: corrección de texto. `:478` pasa a expresar el tope de 4 y deja de ofrecer 7; `:147` deja de decir *"(4 usados)"*, que insinúa slots disponibles. Ninguna decisión de producto nueva: R-08 ya es el texto vigente (`Saldo Design Review Guide.dc.html:60,144`) y el Blueprint ya dice *"para siempre"* (`:255`).

**Es la actualización de mejor relación valor/riesgo de toda esta lista**: costo mínimo, cero impacto funcional, y cierra la ambigüedad exacta que ya produjo una premisa de diseño equivocada una vez (`RETRO-001-metas-exposicion.md:23`).

### D-5 · `docs/design/integration-debt.md` — filas nuevas de trazabilidad

**Por qué**: es el log histórico de divergencias y hoy no contiene C-02, C-03, C-05, C-06 ni C-10. C-07 y C-08 sí están. Registrarlas mantiene el valor del archivo como red de contención: `integration-debt.md:24` es el precedente exacto de cómo se registra *"una ambigüedad constitucional real, no un error de implementación"* sin resolverla.

**Clasificación**: es trazabilidad, no autoridad (2.2). Registrar acá **no resuelve** ninguna contradicción y no debe presentarse como si lo hiciera.

### D-6 · `docs/product-master/14-gamificacion.md:88-91` y `00-STATE.md:635` — la afirmación «no usa … ni confeti»

**Por qué**: C-07. El texto no formula una prohibición sino una afirmación de hecho sobre el producto, y esa afirmación es falsa hoy (`GoalManager.jsx:4,65`). Un capítulo cerrado que afirma algo falso es peor que un capítulo con una deuda anotada, porque cierra la puerta a que alguien la busque.

**Cómo**: el arreglo mínimo y honesto es de redacción, no de fondo — que el texto diga qué **debe** ser el producto y remita a la deuda abierta para el estado real (`integration-debt.md:38`). No requiere reabrir la decisión de PM-RECON-003 ni tocar la doctrina de cap 14.

### D-7 · Documentos que **no** deben tocarse todavía

| Documento | Por qué esperar |
|---|---|
| `Saldo Design Constitution.dc.html:528-550` (Filosofía del Dashboard) | Cambiar la lista de 5 esenciales es modificar una constitución por una decisión que aún no se tomó (C-02 sigue abierta). El disparador actual de Metas en el Dashboard es un placeholder reconocido (`RETRO-001-metas-exposicion.md:47`), no un elemento definitivo — no justifica una enmienda constitucional. |
| `docs/design/screens/Saldo Dashboard.dc.html` (composición) | Dibujar una sección de Metas es diseñar `dashboard-claridad`, expresamente pospuesto por el PO (`dashboard-claridad-discovery.md:138`). Ver §4. La excepción es `:147` (D-4), que es corrección de una nota de construcción, no de la composición. |
| `docs/product-master/01-la-filosofia.md:68` (el trío) | Es fundacional y blindado (`00-STATE.md:582`). Tocarlo requiere decisión explícita del PO sobre C-02/C-03, no un efecto colateral de `metas-exposicion`. |
| Todo lo relativo a C-05 (vocabulario "Insights") | Cambiar el rótulo de un destino de navegación en producción es trabajo funcional con impacto en usuarios y en tests. No pertenece a este cierre documental. Ver §4. |

---

## 4. Clasificación: cambio de documentación vs. trabajo funcional futuro

**(a)** cambio de documentación puro — alinear el papel con una decisión ya tomada, sin código.
**(b)** implica además trabajo funcional futuro.
**(c)** no debe resolverse ahora — queda para el ciclo correspondiente.

| Ítem | Clase | Fundamento |
|---|---|---|
| **D-1** Blueprint §02 — agregar superficie Metas | **(a)** | La decisión existe (`design.md:26-36`), el código ya la implementa (`App.jsx:477`), no hay nada nuevo que construir. |
| **D-1b** Blueprint §03 — fila emocional de Metas | **(c)** + requiere insumo del PO | Las seis columnas no están decididas en ningún artefacto. No es (a) porque no hay decisión que transcribir, ni (b) porque no implica código. Es una decisión de producto pendiente. |
| **D-2** Blueprint §02 — `planificacion`/`herramientas` | **(a)** en cualquiera de sus dos variantes | Ambas ya tienen destino documentado (`integration-debt.md:14,31`). Nada nuevo que decidir ni construir. |
| **D-3** Product Master — registro formal de la ratificación | **(a)** | Obligación contraída en `design.md:105`, contenido íntegramente derivable de artefactos aprobados. |
| **D-4** «≤ 7 destinos» en Constitution y screen spec | **(a)** | El código ya está en 4 y tiene guardia de regresión (`src/__tests__/dsNavItems.test.js:4`). Solo se alinea el texto con lo ya ratificado. |
| **D-5** `integration-debt.md` — filas de C-02/C-03/C-05/C-06/C-10 | **(a)** | Trazabilidad. Explícitamente no resuelve nada. |
| **D-6** Cap 14 / `00-STATE.md:635` — «ni confeti» | **(a)** para el texto; la deuda de código **(b)** ya tiene ticket propio | La corrección de redacción no toca código. La remoción del confeti de `GoalManager` es el ticket E2, ya abierto y sin priorizar (`integration-debt.md:38`). |
| **C-05** «Insights» / «CSV» como rótulos de interfaz | **(b)** | Cambiar `dsNavItems.js:17`, el rótulo del screen spec (`:50,:235`) y probablemente i18n y tests. Requiere decisión del PO sobre el nombre de reemplazo — que es contenido de producto, no derivable. **Recomendación: ticket propio e independiente de `dashboard-claridad`**; es la única contradicción incumplida hoy frente al usuario. |
| **C-02** Contenido definitivo del Dashboard | **(c)** | Es literalmente el objeto de `dashboard-claridad`. Su Discovery ya entregó la tensión al PO sin resolverla (`dashboard-claridad-discovery.md:20-27,138`). Resolverla acá sería tomar por adelantado la decisión que ese ciclo existe para tomar. |
| **C-03** Cifra protagonista vs. trío | **(c)** + requiere decisión del PO | Empate entre niveles 2 y 3 de la jerarquía. Afecta directamente a `dashboard-claridad` y toca una regla inquebrantable. Debería decidirse **antes** de que ese ciclo empiece su `sdd-propose`, no durante. |
| **C-06** Cómo puede crecer el Dashboard | **(c)** + requiere decisión del PO | Es la condición de validez de todo `dashboard-claridad`: si vale *"jamás por petición de roadmap"* (`Saldo Experience Constitution.dc.html:355`), el ciclo necesita evidencia de uso o una enmienda constitucional explícita antes de agregar secciones. Es la pregunta que debería resolverse **primero**. |
| **C-08** `tertiary` <14px | **(c)** | Abierta desde 2026-07-17 con resolución prevista *"requiere que el PO/diseño resuelva la contradicción"* (`integration-debt.md:24`). Toca R-09 (bloqueante). No pertenece a este cierre. |
| **C-09** Exportar / Importación / Suscripción | **(b)** ya aceptada como deuda | Sin cambio documental pendiente: el Blueprint ya define el destino y PM-RECON-003 ya lo ratificó (`00-STATE.md:497-500`). Solo falta código, con deuda registrada. |
| **C-10** PDP-001 como archivo | **(a)** pero **solo el PO puede ejecutarlo** | Nadie más tiene el texto. Es la única acción de esta lista que ningún agente puede hacer. |
| **Adopción de la jerarquía de §2** | **(a)** + cambio de proceso | Si el PO la aprueba, conviene que quede citada desde donde se aplica: `openspec/config.yaml` (`rules.design`/`rules.proposal`) y el Definition of Done del proyecto. **No se propone ejecutarlo acá** — este documento no toca `openspec/`. |

### Secuencia recomendada

1. **Decidir la jerarquía (§2)** — todo lo demás depende de tener una regla.
2. **Depositar PDP-001 en el repositorio (C-10)** — desbloquea la verificabilidad del nivel 1 y de `proposal.md:15`.
3. **Ejecutar el bloque (a)**: D-1, D-2, D-3, D-4, D-5, D-6 en un solo ticket documental, con el molde de PM-RECON-003.
4. **Decidir C-06, luego C-03, luego C-02** — en ese orden: primero si el Dashboard puede crecer por esta vía, después con qué jerarquía de cifras, y solo entonces con qué contenido. Invertir el orden lleva a diseñar contenido cuya legitimidad de origen todavía está en duda.
5. **Abrir ticket propio para C-05** (vocabulario en producción), independiente de `dashboard-claridad`.
6. **Recién entonces retomar `sdd-propose` de `dashboard-claridad`**, con las cuatro fuentes de su Discovery ya reconciliadas en vez de en tensión.

---

## 5. Qué NO propone este documento

- No decide la jerarquía: la propone con su justificación para que el PO decida.
- No resuelve C-02, C-03, C-06 ni C-08: las deja explícitamente para sus ciclos.
- No modifica ningún archivo existente, ni `openspec/`, ni código.
- No propone componentes, layouts ni arquitectura técnica.
- No inventa contenido de producto: donde el insumo del PO es imprescindible (fila emocional de Metas, nombre de reemplazo de "Insights", texto íntegro de PDP-001), lo dice en vez de rellenarlo.

---

**Estado**: documento de análisis y recomendación. Requiere decisión del Product Owner sobre §2 antes de que §3 y §4 sean ejecutables. Insumo directo para el `sdd-propose` de `dashboard-claridad` cuando el PO decida retomarlo.
