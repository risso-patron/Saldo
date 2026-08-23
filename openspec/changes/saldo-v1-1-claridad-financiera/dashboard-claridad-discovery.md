# Discovery — `dashboard-claridad`

**Fase**: sdd-explore (Discovery de PRODUCTO, no técnico)
**Change**: `saldo-v1-1-claridad-financiera` — capability `dashboard-claridad` (siguiente tras `metas-exposicion`, ya cerrada, commit `8de52e5`)
**Fecha**: 2026-08-06
**Alcance de este documento**: responde las 5 preguntas de producto que el PO pidió, con cita `archivo:línea` a la fuente primaria en cada afirmación sobre Constitution/Blueprint/Product Master. **No propone componentes, layouts ni arquitectura técnica** — eso es `sdd-propose`/`sdd-design`, explícitamente pospuesto por el PO.

**Regla aplicada (RETRO-001, ratificada)**: toda cita a la Design Constitution, el Product Blueprint o el Product Master está verificada contra el texto literal del documento fuente, no contra comentarios de código ni memoria. Donde no fue posible verificar contra un archivo del repo, se dice explícitamente.

---

## Nota metodológica previa — un documento que no pude verificar

**PDP-001 no existe como archivo en el repositorio.** Busqué `PDP-001` en todo el repo — aparece citado en `docs/release/RETRO-001-metas-exposicion.md`, `docs/design/integration-debt.md`, `openspec/changes/saldo-v1-1-claridad-financiera/proposal.md` y `design.md`, pero ningún archivo se llama así ni lo contiene íntegro. Es un documento que el PO entregó fuera del repo (registrado en engram, observación #218/#219 de la sesión anterior). Esto significa que **la cita "PDP-001 §4.2: situación actual · resumen mensual · una idea sobre tu plata · metas activas · acciones rápidas"** que este ciclo trae como contexto ya establecido **no pude re-verificarla contra un archivo fuente primario** — la heredo del `proposal.md` ya aprobado (línea 8, 29), no de una lectura directa de PDP-001. Se las diferencio explícitamente de las citas que sí pude verificar línea por línea contra la Constitution/Blueprint/Product Master.

---

## Resumen ejecutivo

Hay una **tensión real, no resuelta, entre tres fuentes**, y este Discovery la deja documentada en vez de elegir un lado (eso es diseño, no descubrimiento):

1. **PDP-001 §4.2** (heredado, no re-verificable en repo) pide 5 secciones progresivas: situación actual, resumen mensual, idea sobre tu plata, **metas activas**, **acciones rápidas**.
2. **La Design Constitution** ("Filosofía del Dashboard", `Saldo Design Constitution.dc.html:528,531-537`) fija que el Dashboard responde exactamente 3 preguntas y lista qué "merece aparecer": saldo total, gasto del mes, movimientos recientes, **máximo un aviso accionable**, una nota de IA — y dice explícitamente que "veinte widgets configurables" **no merece aparecer**.
3. **El mockup de pantalla vigente** (`Saldo Dashboard.dc.html`, estados Desktop/Tablet/Mobile, líneas 70-116, 177-194, 208-229) — la fuente de verdad que ya rige el código de `DashboardHome.jsx` (comentario `DashboardHome.jsx:16`) — **no dibuja ninguna sección de Metas ni de "acciones rápidas"** en ningún breakpoint ni estado. Muestra: saldo, gasto del mes + mini-gráfico de barras, una nota de IA, movimientos recientes. Nada más.
4. El **Product Blueprint**, en su "Mapa completo del producto" (`Saldo Product Blueprint.dc.html:70-136`), que enumera *todas* las superficies del producto, **no incluye "Metas" como superficie en absoluto** — ni en el núcleo ni en el soporte. Esto ya lo había detectado `metas-exposicion` (`RETRO-001-metas-exposicion.md:24`, hallazgo H3).

Ningún documento contradice a otro por error — son capas distintas (visión de producto vs. reglas de superficie vs. mockup construido vs. mapa arquitectónico) que todavía no convergieron. Este Discovery no lo resuelve: lo deja visible para que `sdd-propose` decida con la información completa, igual que `metas-exposicion` escaló su propia tensión de R-08 en vez de forzar una respuesta (`RETRO-001-metas-exposicion.md:12`).

---

## 1. ¿Qué preguntas debe poder responder el Dashboard en menos de 10 segundos?

Verificado contra fuente primaria — la Constitution es explícita y textual:

> "El dashboard responde tres preguntas, en este orden: **¿cuánto tengo? ¿cómo va el mes? ¿hay algo que atender?** Todo lo que no responde una de las tres, no aparece. No es un centro de mando: es un parte de tranquilidad." (`Saldo Design Constitution.dc.html:528`)

El mockup de pantalla (`Saldo Dashboard.dc.html:31`) lo confirma en su propio copy de cabecera: *"la cifra protagonista responde «¿cuánto tengo?» antes de que dé tiempo a preguntarlo; el resto de la frase — cómo va el mes, si hay algo que atender — se lee en un solo recorrido descendente."*

El Product Blueprint agrega una cuarta dimensión, no una cuarta pregunta: qué **emoción** debe producir la respuesta. Tabla "Arquitectura emocional" (`Saldo Product Blueprint.dc.html:146`): Dashboard produce *"Alivio — «todo está bien» o «ya sé qué mirar»"*, evita *"Urgencia, tareas pendientes"*, atención *"Mínima"*, velocidad *"Un vistazo"*, y al salir deja *"Permiso para cerrar sin culpa"*. El "menos de 10 segundos" del PO es coherente con esto — de hecho el mockup pide algo aún más rápido para la cifra protagonista ("antes de que dé tiempo a preguntarlo").

El footer del mockup (`Saldo Dashboard.dc.html:329-330`) da el criterio de aceptación explícito: *"la sesión completa — abrir, entender, cerrar — cabe en menos de un minuto."*

**No hay una cuarta pregunta funcional documentada en la fuente de diseño** ("¿tengo metas activas?" o "¿qué acción rápida hago?" no aparecen ni en la Constitution ni en el mockup). Esa ausencia es justo la tensión descrita en el resumen ejecutivo.

## 2. ¿Qué información es esencial y cuál es secundaria?

**Esencial, según la Constitution** (`Saldo Design Constitution.dc.html:531-532`, columna "Merece aparecer"):
- Saldo total disponible (la cifra protagonista)
- Gasto del mes frente a lo habitual
- Movimientos recientes
- Máximo un aviso accionable
- Una nota de la IA, si existe

Cada una tiene su justificación citada textualmente en la propia Constitution (`:541-545`, tabla "Por qué exactamente estas cinco cosas") — por ejemplo, sobre movimientos recientes: *"No están para leerse: están para reconocerse... es la fuente de confianza en todo lo demás"* (`:543`); sobre el aviso único: *"Si todo es importante, nada lo es... cuando Saldo señala algo, es verdad que hay que mirarlo"* (`:544`).

**Explícitamente NO esencial / no debe aparecer** (`:535-536`, columna "No merece aparecer"): *"Gráficos históricos por defecto · desgloses por categoría · veinte widgets configurables · métricas vanidosas («llevas 12 días registrando») · noticias, cotizaciones o cualquier dato ajeno al usuario."* Y el cierre de la sección (`:550`): *"Cada elemento añadido a la portada convierte la apertura en una auditoría involuntaria... La portada de Saldo no es un centro de mando; es un parte de tranquilidad."*

**Estado actual de `DashboardHome.jsx`** frente a esa lista de 5 esenciales — verificado contra el código real, no contra lo que debería estar:
| Elemento esencial (Constitution) | ¿Implementado hoy? |
|---|---|
| Saldo disponible | Sí (`DashboardHome.jsx:105-113`) |
| Gasto del mes vs. lo habitual | Sí, con mini-gráfico de 6 barras (`:115-143`) |
| Movimientos recientes | Sí (`:160-177`) |
| Máximo un aviso accionable | **No implementado** — no existe ningún componente de "aviso" en el código hoy |
| Una nota de la IA, si existe | **No montada** — comentario explícito en el código: *"Punto de integración futura: AIInsightCard... cuando exista un motor de IA funcional. Constitución: 'Sin IA' = sin nota, sin hueco reservado"* (`DashboardHome.jsx:145-147`) |

Es decir: de las 5 cosas que la Constitution declara esenciales para el Dashboard, **3 están construidas y 2 no existen todavía** en ningún estado (ni siquiera como placeholder) — el "aviso accionable" no tiene ni componente ni mención en el código, y la nota de IA tiene el punto de integración marcado pero vacío por decisión constitucional ("Sin IA" = silencio total, no un hueco reservado).

**"Mis metas"** hoy es solo un link de texto de wiring mínimo (`DashboardHome.jsx:152-158`), documentado explícitamente como *"solo el wiring de navegación... la composición visual de la sección 'Mis metas' (cards, progreso) queda para `dashboard-claridad`"* (`:149-151`) y confirmado como placeholder no-final en `RETRO-001-metas-exposicion.md:47`. No aparece en ningún lugar de la Constitution como elemento "esencial" del Dashboard — su presencia hoy es un contrato de navegación dejado por la capability anterior, no una decisión de qué es esencial mostrar.

## 3. ¿Qué capacidades existentes ya pueden reutilizarse?

Inventario verificado contra código real (sin proponer cómo integrarlas):

- **`GoalManager`** (`src/features/goals/GoalManager.jsx`) — módulo de Metas completo y funcional: crear/editar/eliminar metas, progreso, gate Free/Pro ya conectado (`FREE_GOALS_LIMIT = 3`, `hasFeature('unlimited_goals')`, `GoalManager.jsx:14,38`). Tiene una violación preexistente y ya documentada del Product Blueprint (gamificación: `react-confetti`, `TrophyWebP`, `GoalManager.jsx:3,8,26`) — ticket abierto, sin priorizar (`integration-debt.md:38`, fila 2026-08-06). El contrato de navegación hacia la vista `metas` (props `goals`/`onNavigate` en `DashboardHome.jsx:182-190,218-222`) ya existe, dejado por `metas-exposicion`.

- **`AIInsightCard`** (`src/components/AI/AIInsightCard.jsx`) — componente ya construido, específicamente para "Una idea sobre tu plata" en el Dashboard: *"contenedor DEFINITIVO de 'Una idea sobre tu plata'... Checkpoint 4 de `insights-ia-real`... Reutilizable: sin imports ni asunciones de dónde se monta (Dashboard, pantalla dedicada, etc.). Presentacional puro"* (`AIInsightCard.jsx:5-13`). Cubre 6 estados por props (`insufficient_history`, `loading`, `idea_available`, `ai_disabled`, `no_plan`, `error`, `:15-30`), con copy ya escrito para cada uno (`:50-57`). **No está montado en ningún componente hoy** — verificado por grep: solo aparece referenciado en su propio archivo, su test, y como comentario de intención en `DashboardHome.jsx:145`.

- **`analyzeFinances`** (motor de análisis, `src/lib/ai-providers.js`, consumido hoy solo por `src/hooks/useAIInsightsMulti.js`) — existe y calcula, pero **no está conectado a `AIInsightCard`**. El criterio de elegibilidad ya está especificado con números concretos en `openspec/changes/insights-ia-real/spec.md:47-48`: mínimo 20 gastos con categoría real (excluyendo "Otros") y 28 días desde la primera transacción — la propia especificación explica por qué esos dos números, no son arbitrarios (`spec.md:63,77-86`). El *wiring* real entre `analyzeFinances`/elegibilidad y `AIInsightCard` no aparece en ningún checkpoint completado de `insights-ia-real/tasks.md` (Fases 1-6 revisadas; la Fase 6 solo cubre logging/observabilidad, `tasks.md:298-316`) — es una pieza construida pero **sin consumidor todavía**, ni en Dashboard ni en ningún otro lugar.

- **`dashboardCalculations.js`** (`src/utils/dashboardCalculations.js`) — lógica pura ya usada por `DashboardHome.jsx`: `calculateSpendingPaceComparison` (compara gasto acumulado del mes contra la media histórica, devuelve `null` si no hay base — "nunca fabricar conocimiento", `:26-27`), `getMonthlySeries`, `getRecentTransactions`, `splitAmountForDisplay`. Disponible para cualquier sección nueva que necesite cifras derivadas sin duplicar cálculo.

- **`useSubscription().hasFeature()`** — gates ya conectados y reutilizables para decidir qué ve Free vs. Pro: `unlimited_goals`, `ai_analysis`, `ai_predictions`, `advanced_charts`, `credit_cards`, `export_csv`/`export_pdf` (`src/hooks/useSubscription.js:102-104`).

- **Componentes de estado de IA ya construidos** (`src/components/AI/AIStatusNotice.jsx`, `AIConsentPrompt.jsx`) — mismo patrón presentacional puro que `AIInsightCard`, del mismo change `insights-ia-real`, disponibles si `dashboard-claridad` necesita mostrar estados de consentimiento/gate en el Dashboard.

- **No reutilizable / descartado por decisión de producto ya tomada:** `AIInsightsPanel`, `AIProviderStatus`, `PredictiveChart`, `AIAlerts` — los 4 componentes huérfanos de IA que `insights-ia-real` evaluó y excluyó explícitamente del MVP por chocar con el Product Master (score que juzga, jerga técnica, "predicción" como palabra prohibida, alertas que fabrican ansiedad) — ver tabla resumen en `openspec/changes/insights-ia-real/proposal.md:352-361`. No corresponde reconsiderarlos para `dashboard-claridad`; esa decisión ya está cerrada por el change hermano.

## 4. ¿Qué dependencias existen con Metas, Ideas, Onboarding y otras iniciativas abiertas?

- **Con `metas-exposicion` (ya cerrada, dentro del mismo change):** `dashboard-claridad` hereda el contrato `goals`/`onNavigate` de `DashboardHome.jsx` como **dado, no a renegociar salvo necesidad real** — recomendación explícita de la propia retrospectiva (`RETRO-001-metas-exposicion.md:56`, punto 4). El disparador actual ("Mis metas" como link de texto) es un placeholder que `dashboard-claridad` debe **reemplazar**, no duplicar con un segundo punto de entrada (`RETRO-001-metas-exposicion.md:47`).

- **Con `insights-ia-real` (hermano, "Listo para sdd-spec" en su propio estado, con implementación parcial ya en curso vía tasks.md Fases 1-5 marcadas `[x]`):** coordina la pieza "una idea sobre tu plata". La propuesta de `saldo-v1-1-claridad-financiera` ya fijó el criterio de herencia: *"Ninguna recomendación auto-generada se muestra sin ≥4 semanas de historial (mismo criterio ya fijado ahí)"* (`proposal.md:16`) — `insights-ia-real` decidió esto con más precisión (20 gastos + 28 días, no solo "4 semanas", `spec.md:47-48`). `dashboard-claridad` no debe re-decidir este criterio, solo heredarlo. El componente que consumirá esa decisión (`AIInsightCard`) ya existe y ya está pensado para vivir en el Dashboard — ver sección 3.

- **Con `onboarding-flow` (mismo change, aún no iniciado):** dependencia de secuencia, no de contrato de datos. El onboarding (`docs/product-master/06-onboarding.md:39-44`, Paso C) termina explícitamente *"en el mismo lugar donde cap 05 ubica la etapa 4 (Primer ingreso) o la etapa 5 (Primer gasto)... No existe una 'pantalla de bienvenida final' distinta al Inicio real."* Esto significa que el Dashboard es el punto de aterrizaje del onboarding — cualquier decisión sobre qué se ve en el Dashboard con historial mínimo (0 o 1 movimiento) afecta directamente la primera impresión post-onboarding. El estado "Vacío" ya implementado en `DashboardHome.jsx` (`EmptyState`, `:51-69`) y el estado documentado en el mockup (`Saldo Dashboard.dc.html:248-266`) son la superficie relevante para esa continuidad — pero **el mockup Vacío incluye "Conectar mi banco"**, explícitamente NO implementado por excepción constitucional documentada (no existe integración bancaria real, `integration-debt.md:27`, fila "Dashboard — estado Vacío").

- **Con el Product Master, cap 05 etapa 8 / cap 15 (Primer hallazgo IA):** el Dashboard es literalmente donde vive esta etapa. Cap 05 ya cerró que la etapa 8 tiene contenido **desde V1** (una observación simple sobre el primer movimiento, sin pretensión de patrón) y que la señal semanal de Ana/José (cap 15, con umbral de 4 semanas) es *"la misma etapa 8, evolucionada... no una etapa distinta"* (`05-arquitectura-de-experiencia.md:97-104`, `15-ia.md:34-38`). Esto es relevante como dependencia funcional: si el Dashboard va a mostrar "una idea sobre tu plata", el contenido de día-1 (sin historial) ya tiene copy definido en cap 15: *"Este es tu primer gasto en [categoría] — cuando cargues un par más, te vamos a poder mostrar patrones"* (`15-ia.md:25`) — que coincide textualmente con el estado `insufficient_history` ya implementado en `AIInsightCard.jsx:52`.

- **Con la Regla de Oro (cap 20) y el resto del Product Master:** no es una dependencia de una capability específica sino el filtro de cierre transversal — *"¿Rosa entendería esto sin preguntarle a nadie?"* (`20-la-regla-de-oro.md:9`) aplica a cualquier elemento nuevo que termine en el Dashboard.

- **Con los principios de monetización (cap 21):** si "metas activas" o "acciones rápidas" terminan mostrando algo distinto para Free vs. Pro, aplican los 10 principios obligatorios — en particular el 8 (*"Ningún paywall debe aparecer en un momento de máxima ansiedad financiera"*, `21-principios-de-monetizacion.md:38`) y el 2 (*"Nunca ocultar información"*, `:13-15`). El Dashboard es, por diseño, la superficie de menor tolerancia a fricción de todo el producto (`Saldo Product Blueprint.dc.html:146`, atención "Mínima") — cualquier gate ahí tiene el estándar más alto de justificación.

## 5. ¿Qué restricciones impone la Design Constitution sobre esta pantalla?

**Las "Diez reglas inquebrantables"** (`Saldo Design Constitution.dc.html:655-669`) aplican a toda pantalla nueva, con especial peso en estas para el Dashboard:
- Regla 01: *"Toda pantalla nueva declara qué pregunta del usuario responde. Si no puede escribirse en una frase, la pantalla no se diseña."* (`:659`) — ya respondida en la pregunta 1 de este documento.
- Regla 02: *"Una cifra protagonista por vista. Todo lo demás baja al menos un nivel de jerarquía tipográfica."* (`:660`) — hoy es "Saldo disponible" (`DashboardHome.jsx:106-112`); cualquier sección nueva no puede competir con esa cifra.
- Regla 05: *"Un botón primario por vista y ninguna sombra en reposo."* (`:663`) — el mockup ya designa ese único primario: "Nuevo movimiento" (`Saldo Dashboard.dc.html:66`). Cualquier "acción rápida" adicional entraría en tensión directa con esta regla si aspira a ser un botón primario más.
- Regla 04: *"El rojo solo existe en errores reales y confirmaciones destructivas. Un saldo negativo lleva signo '−', no color."* (`:662`) — ya aplicado en el código (`MINUS_SIGN` en `dashboardCalculations.js:9`).
- Regla 09: *"La IA sugiere en una nota descartable y nada más. Nunca interrumpe, nunca abre ventanas, nunca ejecuta acciones con dinero."* (`:667`) — restricción directa sobre cómo puede verse "una idea sobre tu plata".
- Regla 10: *"Ante la duda, elimina. Lo eliminado puede volver mañana con mejores argumentos; la confusión, una vez enviada, no se va sola."* (`:668`) — principio rector para resolver la tensión del resumen ejecutivo cuando llegue el momento de decidir.

**Anti-patrones nombrados explícitamente aplicables** (`Saldo Design Constitution.dc.html:641-648`):
- *"La cabina de mando"* — *"Un dashboard de veinte widgets configurables donde todo compite... Elegir es nuestro trabajo, no el suyo."* (`:641`) — el riesgo más directo si se agregan 2 secciones nuevas (metas + acciones rápidas) sin filtro.
- *"Las tarjetas rusas"* — *"Tarjetas gigantes dentro de tarjetas... Cuando la caja pesa más que el dato, la jerarquía ha muerto."* (`:643`) — relevante si "Mis metas" se compone como cards con progreso, como sugiere el placeholder actual.
- *"El casino"* — *"Rachas, niveles, confetti y medallas..."* (`:644`) — directamente relevante porque `GoalManager` ya tiene esa violación (confetti/trofeo) documentada como deuda (`integration-debt.md:38`); exponer Metas más prominentemente en el Dashboard **aumenta la visibilidad de esa violación existente**, tal como ya advirtió la retrospectiva (`RETRO-001-metas-exposicion.md:49`, riesgo "Mayor visibilidad de la deuda de gamificación (E2)").

**Presupuesto de superficie — R-08 y reglas asociadas**, verificado contra `docs/design/review/Saldo Design Review Guide.dc.html`, no contra comentarios de código (lección de RETRO-001 aplicada aquí explícitamente):
- Checklist de revisión: *"¿Respeta el presupuesto de superficie? (4 destinos, 1 nota, 1 modal)"* (`Saldo Design Review Guide.dc.html:60`).
- R-08 en sí: *"Romper el presupuesto de superficie: 5.º destino de navegación, 2.º FAB, 2.ª capa modal, 2.ª nota."* (`:144`).
- Traducido al Dashboard: el presupuesto de **1 nota** (de IA) ya está fijado como tope duro a nivel de todo el producto, no solo del Dashboard — coincide con la Constitution ("una nota de la IA, si existe", singular) y con el Blueprint ("una nota máximo en Dashboard/Ideas", `Saldo Product Blueprint.dc.html:216`). Cualquier "aviso accionable" adicional (el otro elemento "esencial" listado en la Constitution, sección 2 de este documento) tendría que convivir con ese tope sin convertirse en una segunda nota de facto.

**Restricción ya resuelta (C-08, 2026-08-07):** el propio `integration-debt.md:24` había registrado que el mockup del Dashboard usaba el color `tertiary` (`#9E9E9E`) en tamaños de 10-13px (labels de fecha, overlines) contradiciendo la entonces regla de contraste de la Constitution ("uso permitido solo en ≥14px"). Esa regla quedó corregida: `tertiary` no cumple AA como texto a ningún tamaño y ya no se usa para texto/íconos informativos en la Constitution, sus mockups ni el código de producción — `secondary` es el token AA vigente. No exclusiva de esta capability, pero ya no está presente en la pantalla que `dashboard-claridad` va a tocar.

**Restricción del mockup mismo, no solo de la Constitution en abstracto:** el mockup vigente (`Saldo Dashboard.dc.html`) ya construyó una versión completa del Dashboard con estados Desktop/Tablet/Mobile/Vacío/Cargando/Error/Sin IA — y **ninguno de esos 7 estados contiene una sección de Metas ni de acciones rápidas**. Esto no es una restricción explícita redactada como regla, pero es una restricción de facto: la fuente de verdad visual que ya rige el código (`DashboardHome.jsx:16`, "Fuente: docs/design/screens/Saldo Dashboard.dc.html") no contempla hoy los dos elementos que PDP-001 pide agregar. Es el mismo patrón de brecha que `metas-exposicion` ya encontró con el Product Blueprint (`RETRO-001-metas-exposicion.md:24`, H3) — aquí se repite con el mockup de pantalla, tal como la propia retrospectiva anticipó como riesgo (`RETRO-001-metas-exposicion.md:48`, "La brecha 'Blueprint no contempla X' puede repetirse").

---

## Riesgos para `sdd-propose` (a considerar, no a resolver acá)

- La tensión de las 4 fuentes descrita en el resumen ejecutivo es el riesgo central — cualquier propuesta que ignore una de las 4 fuentes en vez de reconciliarlas conscientemente repite el patrón que ya generó una escalación en `metas-exposicion` (R-08).
- La deuda de gamificación de `GoalManager` (E2, `integration-debt.md:38`) queda sin decisión de prioridad — la propia retrospectiva recomendó decidirla *"antes de que `dashboard-claridad` le dé más visibilidad al Dashboard"* (`RETRO-001-metas-exposicion.md:58`, recomendación 6). Sigue sin decidirse a la fecha de este Discovery.
- El "aviso accionable" (elemento esencial de la Constitution, sección 2) no tiene ningún componente ni especificación funcional en ningún documento revisado — es un vacío de definición, no solo de implementación.
- `AIInsightCard` está listo para montarse pero su fuente de datos real (`analyzeFinances` + criterio de elegibilidad) no tiene wiring — montarlo en el Dashboard depende de una pieza de `insights-ia-real` que no es de esta capability ni de este change en el sentido estricto (coordinación entre changes hermanos).

## Ready for Proposal

**Sí, con la tensión del resumen ejecutivo explícitamente entregada al PO/sdd-propose para decisión — no para que este Discovery la resuelva.** El PO pidió expresamente posponer `sdd-propose` en este ciclo; este documento queda como su insumo directo cuando decida retomarlo.
