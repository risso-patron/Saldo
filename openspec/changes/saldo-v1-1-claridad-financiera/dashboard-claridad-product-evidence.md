# Product Evidence — `dashboard-claridad`

**Fase**: previa a `sdd-explore`/`sdd-propose`. **No es Discovery técnico ni de producto — es recopilación de evidencia.**
**Change**: `saldo-v1-1-claridad-financiera` — capability `dashboard-claridad` (Discovery funcional ya entregado y aprobado; `sdd-propose` pospuesto por el PO hasta esta etapa).
**Fecha**: 2026-08-06
**Alcance de este documento**: hipótesis, preguntas de investigación, señales de validación, decisiones que dependen de esa evidencia, e inventario de evidencia existente vs. faltante. **No propone UX, arquitectura ni abre `openspec/`.**

**Regla aplicada (RETRO-001, ratificada)**: toda cita a documentación de producto está verificada contra su texto literal, con archivo:línea.

---

## 0. Por qué existe esta etapa

`docs/governance/GOV-001-jerarquia-documental-de-producto.md` §1, hallazgo C-06, identificó la contradicción de proceso más profunda de las diez detectadas: la Experience Constitution fija el único mecanismo legítimo por el que el Dashboard puede crecer, y no es una lista de secciones deseadas:

> "Cuándo falta algo — Solo hay una señal válida: los usuarios abandonan el dashboard hacia el mismo destino, una y otra vez, nada más llegar. Ese camino repetido es una pregunta dolorosa sin respuesta en la portada. Se promociona esa respuesta — y idealmente se degrada otra cosa para mantener el peso total. **El dashboard crece por evidencia de uso, jamás por petición de roadmap.**" (`Saldo Experience Constitution.dc.html:355`)

PDP-001 §4.2 es, textualmente, una petición de roadmap: pide agregar "metas activas" y "acciones rápidas" al Dashboard. Esta etapa no resuelve si una decisión del PO puede autorizar esa vía de todos modos (esa es la pregunta de gobernanza que GOV-001 §2.4 deja para el PO). Lo que sí hace es proveer, para las hipótesis que PDP-001 ya adelantó, el tipo de evidencia que la propia Constitution exige — de modo que cuando `dashboard-claridad` retome su `sdd-propose`, no dependa únicamente de hipótesis internas. Es el mismo principio que ya aplicaste en `metas-exposicion`: escalar antes que forzar una respuesta.

---

## 1. Hipótesis actuales a validar sobre el Dashboard

Derivadas de PDP-001 §4.2 y de las tensiones que el Discovery de `dashboard-claridad` ya dejó documentadas (`dashboard-claridad-discovery.md`, resumen ejecutivo). Cada hipótesis se formula de manera falsable — con una versión que la evidencia podría refutar, no solo confirmar.

| # | Hipótesis | Origen | Se refuta si… |
|---|---|---|---|
| **H1** | Los usuarios nuevos no entienden qué hacer al abrir SALDO por primera vez, y eso frena la activación. | Feedback citado en PDP-001 §1: "no entiendo cómo usarla". | Los usuarios completan su primera acción sin ayuda externa y sin abandonar antes del primer movimiento registrado. |
| **H2** | Los usuarios abren el Dashboard buscando algo específico que hoy no está ahí, y navegan repetidamente al mismo destino para encontrarlo. | Es el criterio explícito de la Experience Constitution (`:355`) — la única señal que legitima agregar algo. | No existe un destino recurrente único; la navegación post-Dashboard es dispersa o va directo a "Nuevo movimiento" (que ya es el botón primario). |
| **H3** | Los usuarios quieren ver el progreso de sus Metas sin salir del Dashboard. | PDP-001 §4.2 ("metas activas"); coincide con H2 si Metas es el destino recurrente. | Los usuarios que crean una meta rara vez vuelven a consultar su progreso, o lo hacen con tan poca frecuencia que no justifica espacio permanente en la portada. |
| **H4** | Los usuarios necesitan accesos directos a acciones más allá de "Nuevo movimiento" (el único botón primario hoy, `Saldo Dashboard.dc.html:66`) para sentir que el Dashboard resuelve algo, no solo informa. | PDP-001 §4.2 ("acciones rápidas"). | Los usuarios usan casi exclusivamente "Nuevo movimiento" y no reportan fricción para llegar a otras acciones (Historial, Metas, Ajustes) desde donde ya están. |
| **H5** | El trío de cifras (entró / salió / queda) es lo que los usuarios realmente escanean primero, no una única cifra protagonista. | Tensión C-03 (GOV-001): `00-STATE.md:626` fija el trío como fundacional; la Design Constitution (regla 02) exige una sola cifra protagonista. | Los usuarios miran primero "Saldo disponible" y tratan ingresos/gastos del período como contexto secundario — validaría la implementación actual, no el trío. |
| **H6** | Cuando exista, "una idea sobre tu plata" sería percibida como útil y no como ruido — incluso en los primeros días, sin historial suficiente. | PDP-001 §4.3; ya resuelto en parte por `insights-ia-real` (no mostrar nada sin ≥20 gastos / 28 días, `spec.md:47-48`). | Los usuarios ignoran sistemáticamente la nota de IA, o la interpretan como intrusiva/técnica pese al tono ya definido por el Product Master. |
| **H7** | "Me gusta, pero le faltan cosas" (PDP-001 §1) se refiere específicamente a Metas/acciones rápidas — no a otra carencia no contemplada en PDP-001. | Feedback citado en PDP-001 §1, sin desglose. | Al indagar, "le faltan cosas" apunta a algo distinto (p. ej. Dinero pendiente, categorías, exportación) — invalidaría el vínculo directo entre este feedback y el contenido específico que PDP-001 §4.2 propone agregar al Dashboard. |

**Nota sobre H7**: es la hipótesis más frágil de las siete. PDP-001 §1 resume el feedback en tres frases; no hay forma de verificar, sin volver a los usuarios, si "le faltan cosas" efectivamente apunta al Dashboard o a otra parte del producto. Tratarla como evidencia de que el Dashboard necesita crecer sería exactamente el salto que la Experience Constitution prohíbe.

---

## 2. Preguntas para usuarios reales

Organizadas por hipótesis. Preguntas de comportamiento («qué hacés», «qué buscaste») antes que de opinión («¿te gustaría que…»), porque las de opinión casi siempre confirman lo que ya se les sugiere — el propio riesgo que corre este documento si no se cuida el fraseo.

| Hipótesis | Preguntas candidatas |
|---|---|
| H1 | "Contame qué hiciste la primera vez que abriste SALDO, paso a paso." · "¿Hubo un momento en que no supiste qué tocar a continuación? ¿Cuál?" |
| H2 | "La última vez que abriste SALDO, ¿qué buscabas encontrar?" · "¿Hay algo que revisás seguido y que te obliga a tocar varias pantallas para llegar?" |
| H3 | (Solo a quienes ya crearon una meta) "¿Cuándo fue la última vez que revisaste el progreso de tu meta? ¿Qué te hizo entrar a mirarla?" |
| H4 | "Además de cargar un gasto o ingreso, ¿qué otra cosa hacés seguido en SALDO?" · "¿Alguna vez quisiste hacer algo rápido y te tomó más pasos de los que esperabas?" |
| H5 | (Mostrando el Dashboard actual) "¿Qué es lo primero que mirás acá? ¿Y después?" — sin nombrar "saldo" ni "trío" para no inducir la respuesta. |
| H6 | Solo aplicable una vez que exista una versión de "una idea sobre tu plata" para mostrar — no hay pregunta útil hoy sin el estímulo real. |
| H7 | "Dijiste que te gusta SALDO pero que le faltan cosas — ¿qué le agregarías primero?" (pregunta abierta, sin ofrecer opciones de la lista de PDP-001, para no contaminar la respuesta). |

**Por persona** (`docs/product-master/02-quien-es-nuestro-usuario.md:6-44`), vale la pena priorizar entrevistas que cubran al menos un perfil con miedo a "perder el control" (José, Ana) y uno con miedo a "no ver la foto completa" (Luis) — son los dos miedos más directamente relacionados con qué debería protagonizar el Dashboard.

---

## 3. Señales que confirmarían o refutarían cada hipótesis

| Hipótesis | Señal de comportamiento (observable) | Señal declarada (entrevista/encuesta) |
|---|---|---|
| H1 | % de usuarios nuevos que registran su primer movimiento sin abandonar antes. **Hoy no medible** — no existe instrumentación (ver §5). | El usuario relata haber dudado o buscado ayuda externa. |
| H2 | Secuencia de navegación repetida Dashboard → mismo destino, en múltiples sesiones. **Hoy no medible.** | El usuario nombra espontáneamente un destino que busca seguido. |
| H3 | Frecuencia de visitas a la vista `metas` tras crear una meta. **Hoy no medible** (la vista existe desde `metas-exposicion`, pero no hay registro de visitas). | El usuario dice consultar el progreso de su meta con regularidad. |
| H4 | Uso de accesos alternativos a "Nuevo movimiento" (Omnibar, navegación directa) vs. fricción reportada. Parcialmente inferible de patrones de uso del Omnibar si se instrumentara. | El usuario describe una acción que le costó más pasos de lo esperado. |
| H5 | Dónde mira primero el usuario en una prueba de primer vistazo (5 segundos) — requiere sesión moderada, no analítica pasiva. | El usuario, al describir el Dashboard de memoria, nombra el trío completo o solo el saldo. |
| H6 | Interacción con la nota de IA cuando exista (click, descarte, ignorada). No medible hoy porque el componente no está montado. | El usuario describe la nota como útil, irrelevante o confusa. |
| H7 | No aplica — es inherentemente una señal declarada. | Respuesta abierta a "¿qué le agregarías primero?", codificada después sin ofrecer las opciones de PDP-001 §4.2 como menú. |

**Hallazgo transversal**: de las siete hipótesis, **ninguna tiene hoy una señal de comportamiento medible** — SALDO no tiene instrumentación de analítica ni telemetría de uso (verificado: no hay ningún proveedor de analytics/telemetría integrado en `src/`). Esto significa que, en el estado actual del producto, **toda la evidencia que puede recolectarse en el corto plazo es cualitativa** (entrevistas, no comportamiento agregado) — la señal que la Experience Constitution describe como "válida" ("los usuarios abandonan el dashboard hacia el mismo destino, una y otra vez") es, tal como está escrita, una señal de comportamiento agregado que hoy no se puede medir directamente. Instrumentar analítica de uso no es parte de este documento (sería una decisión de arquitectura), pero es una dependencia que vale la pena que el PO conozca antes de asumir que "evidencia de uso" es alcanzable sin construir nada nuevo.

---

## 4. Qué decisiones de producto dependen de esta evidencia

| Decisión pendiente | Depende de |
|---|---|
| **C-02** — contenido definitivo del Dashboard (`docs/governance/GOV-001...md` §1) | H1 a H6, en conjunto. Es la decisión que este documento existe para informar. |
| **C-03** — cifra protagonista vs. trío de cifras | H5, directamente. |
| **Prioridad relativa de "metas activas" vs. "acciones rápidas"** dentro de PDP-001 §4.2 (hoy ambas en el mismo nivel de prioridad Alta, §7) | H3 vs. H4 — si solo una de las dos hipótesis se confirma con evidencia real, la otra podría bajar de prioridad sin violar PDP-001 §7 (que no distingue entre ambas). |
| **Si corresponde instrumentar analítica de uso antes de decidir C-02** | El hallazgo transversal de §3 — sin eso, la Experience Constitution (`:355`) no puede aplicarse literalmente, solo por aproximación cualitativa. |
| **C-06** (¿puede el Dashboard crecer por PDP-001 sin la señal de comportamiento que la Constitution exige?) | No se resuelve con evidencia — es una decisión de gobernanza (GOV-001 §2.4). Pero evidencia cualitativa fuerte en la misma dirección que PDP-001 reduce el costo de decidir a favor, y evidencia en contra lo eleva. |

---

## 5. Evidencia que ya existe vs. evidencia que falta

### Ya existe

- **Tres citas de feedback, resumidas y sin cuantificar** (PDP-001 §1): "no entiendo cómo usarla", "me gusta, pero le faltan cosas", "me ayudó a ver mis gastos". **Limitación importante, no menor**: es un resumen del PO, no transcripciones ni datos crudos — no se sabe cuántos usuarios dijeron cada cosa, en qué contexto, ni si son representativos del conjunto de usuarios activos. Tratarlas como si fueran evidencia cuantitativa sería sobre-interpretarlas.
- **Las cuatro personas ya definidas** (`02-quien-es-nuestro-usuario.md`), con miedos específicos citables — útiles para diseñar las entrevistas de §2, no evidencia de comportamiento en sí mismas.
- **El criterio de elegibilidad de "una idea sobre tu plata"** (`insights-ia-real/spec.md:47-48`, ≥20 gastos/28 días) — no es evidencia de usuario, pero acota qué parte de H6 es evaluable hoy (ninguna, porque el componente no está montado).

### Falta

- **Transcripciones o notas de las conversaciones que originaron el feedback de PDP-001 §1** — si existen fuera del repositorio, valdría la pena que el PO las comparta antes de diseñar entrevistas nuevas, en vez de partir de cero.
- **Entrevistas o encuestas estructuradas** dirigidas específicamente a las 7 hipótesis de §1 — no hay ninguna registrada en el repositorio ni en la memoria del proyecto.
- **Cualquier dato de comportamiento agregado** (qué se mira primero, a qué se navega después del Dashboard, frecuencia de visita a Metas) — requiere instrumentación que no existe hoy (§3).
- **Evidencia específica sobre "acciones rápidas"** — de las 7 hipótesis, H4 es la que menos apoyo tiene incluso en el feedback ya citado; ninguna de las tres frases de PDP-001 §1 la menciona directamente.

---

## 6. Qué NO hace este documento

- No propone qué debería mostrar el Dashboard (eso es C-02, y depende de la evidencia que este documento organiza, no la reemplaza).
- No decide si el trío de cifras o una sola cifra protagonista es la resolución correcta (C-03).
- No decide C-06 (si PDP-001 alcanza para autorizar crecimiento sin la señal de comportamiento de la Constitution).
- No propone instrumentar analítica ni ningún cambio técnico — solo señala que, sin ella, parte de la evidencia relevante queda fuera de alcance en el corto plazo.
- No abre `openspec/` ni continúa hacia `sdd-propose`.

---

**Estado**: documento de recopilación de evidencia, no de decisión. Insumo directo para cuando el PO decida cómo obtener las respuestas a §2 (entrevistas, encuesta, u otro método) y, después, para el Discovery/`sdd-propose` de `dashboard-claridad`.
