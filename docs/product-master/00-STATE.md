# Estado de avance - Saldo UX Edition

## Capitulos
- [x] 01 - La Filosofia (cerrado 2026-07-10)
- [x] 02 - Quien es nuestro usuario (cerrado 2026-07-10)
- [x] 03 - Principios del Producto (cerrado 2026-07-10)
- [x] 04 - UX Manifesto (cerrado 2026-07-10, verificado 2026-07-12)
  - Evidencia: "Vocabulario permitido" (04-ux-manifesto.md, lineas 25-34) incluye las dos frases acunadas en cap 03 —
    "cómo te está yendo con tus clientes" (Luis, linea 32) y "tu plata" / "la plata del negocio" (Jose, lineas 33-34)
  - Evidencia: las 4 preguntas de orientacion ("¿Dónde estoy? ¿Qué puedo hacer? ¿Qué pasa si aprieto esto? ¿Qué gano haciendo esto?",
    lineas 6-9) quedan fijadas como criterio de cierre para toda pantalla de los capitulos siguientes
  - Verificado sin contradicciones contra 01-03 antes de cerrar
- [x] 05 - Arquitectura de Experiencia (cerrado 2026-07-12)
  - Evidencia: recorrido completo de 12 etapas (Landing → Cliente recurrente), cada una con las 4 dimensiones
    (emocional/funcional/visual/psicológica), en 05-arquitectura-de-experiencia.md
  - Evidencia: decisiones fundacionales de Luis, Ana y José aplicadas con cita textual inline en etapas 2, 4, 6, 7, 11 y 12
    (ver sección "Aplicación por persona" del capítulo)
  - Evidencia: contradicción "hallazgo IA" vs "insight IA" detectada y resuelta 2026-07-12 (ver Contradicciones resueltas)
  - Verificado sin contradicciones contra 01-04 antes de cerrar
- [x] 06 - Onboarding (cerrado 2026-07-12)
  - Evidencia: esqueleto de 3 pasos (A confirmar el porqué salteable, B primera acción guiada obligatoria, C empalme
    con el Inicio de cap 01) en 06-onboarding.md, aprobado explícitamente por el usuario
  - Evidencia: no contradice la etapa 3 ya cerrada en cap 05 — las 4 dimensiones de esa etapa se citan textualmente
    como punto de partida antes de desarrollar la estructura
  - Evidencia: decisión fundacional de interrupción/retomado a mitad del Paso B logueada arriba, con costo técnico
    explícito para quien implemente en código (no es solo un detalle de UX)
  - Evidencia: decisiones de persona aplicadas con cita — José (no repreguntar personal/negocio, Paso B), Ana
    (interrupción/retomado, cita cap 02 tiempo en bloques), Rosa y Luis (énfasis en "Onboarding por persona")
  - Verificado sin contradicciones contra 01-05 antes de cerrar
- [x] 07 - UX Writing (cerrado 2026-07-12)
  - Evidencia: texto final cerrado para "hallazgo IA" → "Una idea sobre tu plata" y para "onboarding" → "Primeros
    pasos" (07-ux-writing.md, secciones 1 y 2), ambos citando cap 03 regla 7 y cap 06
  - Evidencia: copy final de los 3 pasos de onboarding (cap 06) resuelto sin agregar pasos ni pantallas nuevas
  - Evidencia: las 4 preguntas de cap 04 resueltas con copy real para las 12 etapas de cap 05, incluida nota⁴ en
    Primer presupuesto trazando "Te avisamos antes de que lo pases, no después" a la señal anticipatoria de Ana/José
    (cap 05, etapa 7) — agregada a pedido del usuario para no dejar excepciones sin trazar
  - Verificado sin contradicciones contra 01-06 antes de cerrar
- [x] 08 - Microinteracciones (cerrado 2026-07-12)
  - Evidencia: resuelve lo delegado por cap 06 (transiciones Paso A→B, B→C, reingreso tras interrupción) citando
    cap 05 etapa 4 y la decisión fundacional de cap 06 (08-microinteracciones.md, sección 1)
  - Evidencia: cubre los 7 casos del recorrido de cap 05 — guardar, borrar, editar, sincronizar, cargar, fallo de
    internet (mecánica), expirar sesión (mecánica) — delegando texto exacto y taxonomía de estados a cap 09
  - Evidencia: decisiones de persona aplicadas con cita — Rosa en "Borrar" (cap 02, miedo a perder información),
    José en "Sincronizar" (cap 02, ventana de 10 minutos)
  - Evidencia: principio rector nuevo ("toda microinteracción responde una función, nunca decorativa") aprobado y
    logueado arriba como decisión fundacional
  - Verificado sin contradicciones contra 01-07 antes de cerrar
- [x] 09 - Sistema de Feedback (cerrado 2026-07-12)
  - Evidencia: texto final de fallo de internet y expiración de sesión, delegado por cap 08, resuelto en sección 2
  - Evidencia: taxonomía completa de la propuesta original evaluada estado por estado contra el principio rector de
    cap 08 — 5 de 6 mantenidos con alcance acotado, 1 ("IA terminó") descartado y justificado con cita a cap 03 regla 7
  - Evidencia: reglas transversales nuevas (transitorio, sin modal, un solo símbolo, sin apilar, avisos ≠
    confirmaciones) logueadas arriba como decisión fundacional
  - Verificado sin contradicciones contra 01-08 antes de cerrar
- [x] 10 - Accesibilidad (cerrado 2026-07-12)
  - Evidencia: resuelve lo delegado por cap 09 (anuncios de lector de pantalla para confirmaciones vs. avisos,
    sección 1 de 10-accesibilidad.md), sin agregar una categoría nueva a la ya establecida
  - Evidencia: foco de teclado aplicado sobre lo ya definido en cap 06/07/08 (Paso A, deshacer, edición en el lugar,
    selectores) sin rediseñar ninguno
  - Evidencia: propuesta de aviso previo a expiración de sesión aprobada y agregada a 09-sistema-de-feedback.md como
    extensión explícita, citando cap 10 y WCAG 2.2 (límite de tiempo)
  - Evidencia: nota honesta de que ninguna persona de cap 02 tiene discapacidad documentada — no se inventó ninguna
  - Verificado sin contradicciones contra 01-09 antes de cerrar
- [x] 11 - Responsive Philosophy (cerrado 2026-07-12)
  - Evidencia: tamaño táctil delegado por cap 10 resuelto — 44×44px mínimo operativo, justificado contra el piso
    legal WCAG (24×24px) citando el miedo de Rosa (cap 02)
  - Evidencia: regla del pulgar (zonas fácil/media/difícil) aplicada sobre elementos ya definidos en cap 05, 07, 08 y
    09, sin pantallas nuevas
  - Evidencia: espaciado entre los dos botones del Paso A (excepción cap 03/06) resuelto explícitamente
  - Evidencia: decisiones de persona con cita — José y Ana por sus ventanas de tiempo (cap 02), Rosa por su miedo a
    equivocarse; Luis marcado explícitamente como el caso que menos presiona este capítulo, sin necesidad inventada
  - Verificado sin contradicciones contra 01-10 antes de cerrar
- [x] 12 - Design System (cerrado 2026-07-12)
  - Evidencia: resuelve los 4 pendientes delegados citando origen — contraste (cap 10/11), duración/curvas (cap 08),
    color/iconografía/duración de los 8 estados de feedback (cap 09), foco (cap 10)
  - Evidencia: revisión en vivo del rol de foco — la primera versión reusaba "Atención" y generaba ruido en cada Tab,
    diluyendo la señal de alerta real; corregido a un tercer rol nuevo, "Interactivo" (compartido con botones
    principales), dejando explícito que no existía un rol previo para reusar en vez de forzar una reutilización
  - Evidencia: alcance acotado a roles y reglas numéricas, sin paleta de marca hexadecimal — justificado en la
    sección "Alcance" del capítulo
  - Verificado sin contradicciones contra 01-11 antes de cerrar
- [x] 13 - Psicologia (cerrado 2026-07-12)
  - Evidencia: principios de color (puntos 1-2) citan los roles Positivo/Atención de cap 12 sin asignar hex, marcados
    explícitamente como guía para una decisión futura
  - Evidencia: 4 mecanismos de enganche nombrados y rechazados con cita a cap 01 (urgencia artificial, culpa por
    inactividad, streaks con vergüenza, felicitación rutinaria)
  - Evidencia: "Aplicación por persona" corregida en vivo para separar cita textual de inferencia en los 4 casos
    (Rosa, José, Ana, Luis) — ninguna afirmación se presenta como ya resuelta en un capítulo anterior sin serlo
  - Evidencia: regla obligatoria para cap 14 (sin streaks con vergüenza al romperse) logueada arriba como decisión
    fundacional, no como sugerencia
  - Verificado sin contradicciones contra 01-12 antes de cerrar
- [x] 14 - Gamificacion (cerrado 2026-07-12)
  - Evidencia: regla obligatoria de cap 13 resuelta de raíz — ventana móvil de constancia en vez de streak clásico
    con punto de ruptura (punto 2 de 14-gamificacion.md)
  - Evidencia: 4 logros, 3 mapeados directo a cap 05, 1 ("sostenido") marcado explícitamente como criterio nuevo sin
    definición numérica, delegado a cap 15/16 — corregido en vivo para no presentarlo como ya resuelto
  - Evidencia: dos rechazos nuevos con justificación propia (comparación social, cap 01; sistema de puntos paralelo,
    cap 03 regla 3), además de los 4 heredados de cap 13
  - Evidencia: "Aplicación por persona" corregida en vivo para no calificar como "no es inferencia" conexiones que sí
    lo son, aunque directas — mismo estándar de rigor que cap 13
  - Verificado sin contradicciones contra 01-13 antes de cerrar
- [x] 15 - IA (cerrado 2026-07-12)
  - Evidencia: señal semanal de Ana/José definida numéricamente (4 semanas de historial, margen 20%, dirección por
    persona, separación de "la plata del negocio" para José) y su cadencia aclarada contra el patrón de dos entradas
    diarias de José (cap 02)
  - Evidencia: "caja diaria" (cap 03, regla 9) marcada explícitamente como NO resuelta, delegada a cap 16 en vez de
    forzar un número sin base — corregido en vivo tras señalarlo el usuario
  - Evidencia: "primer presupuesto sostenido" definido (3 meses, sin tolerancia parcial), justificado contra cap 05,
    cap 07 y cap 13
  - Evidencia: 4 reglas de comportamiento de la IA, cada una citando cap 01/03/04
  - Verificado sin contradicciones contra 01-14 antes de cerrar
- [x] 16 - Roadmap UX (cerrado 2026-07-12)
  - Evidencia: V1-V4 justificadas contra requisitos numéricos ya fijados en cap 15 (4 semanas, 3 meses), no un orden
    de preferencia — V4 marcada explícitamente sin fecha por ser bloqueo de diseño, distinto de V2/V3 (bloqueo de
    antigüedad de datos)
  - Evidencia: accesibilidad/responsive/design system fijados como piso desde V1, con justificación explícita de por
    qué diferirlos contradiría cap 10/11
  - Evidencia: resuelve la pieza delegada por cap 15 (caja diaria) ubicándola en V4 sin inventar una fecha
  - Verificado sin contradicciones contra 01-15 antes de cerrar
- [ ] 17 - QA
- [ ] 18 - Definition of Done
- [ ] 19 - Anti-Patterns
- [ ] 20 - La Regla de Oro

## Decisiones fundacionales (no tocar sin avisar)
- Mision: disminuir ansiedad financiera, no "administrar dinero"
- Vision: responder "donde se fue mi dinero" en menos de 10 segundos
- Personas activas: Rosa (45), Luis (freelancer), Ana (madre), Jose (dueno de negocio)
- Vocabulario prohibido global UX: Analytics, Insights, Planning, Import AI, OCR, CSV, JSON
- Vocabulario permitido base: tus gastos, tus ingresos, tu dinero, tus metas, tus movimientos
- Inicio/Dashboard debe mostrar de forma directa: cuánto entró, cuánto salió y cuánto queda hoy (definido en cap 01, no redefinir distinto en cap 05 o 06)
- La prohibición de "Analytics" es de naming/vocabulario, no de funcionalidad: Luis sí necesita ver patrones de ingresos y clientes, pero en lenguaje simple (ej: "cómo te está yendo con tus clientes")
- Luis necesita agrupar movimientos por cliente/origen, no solo por categoría de gasto; es una dimensión de datos distinta que Arquitectura (05) y Design System (12) no deben ignorar
- Ana necesita señales anticipatorias ("semanas difíciles"), no solo registro histórico; marcar para que IA (15) y/o Roadmap UX (16) lo retomen explícitamente
- José necesita separación clara entre caja personal y caja del negocio; no es una categoría más, es una distinción estructural de datos que debe resolverse explícitamente en arquitectura/categorías/design system más adelante
- A partir de cap 05, releer completos los capítulos 01-04 antes de redactar cualquier capítulo nuevo: 04 pasa a ser fundacional junto con 01-03, porque fija el vocabulario oficial (prohibido/permitido) que rige el resto del documento
- A partir de cap 05, todo cierre de capítulo requiere checklist con evidencia y citas textuales (línea/sección concreta), no alcanza con el tilde
- A partir de cap 06, releer completos los capítulos 01-05 antes de redactar cualquier capítulo nuevo: 05 también pasa a ser fundacional, porque fija el recorrido completo (las 12 etapas) que los capítulos siguientes deben respetar paso a paso, no redefinir distinto
- Vocabulario: la etapa de IA del recorrido de experiencia se llama "hallazgo IA", nunca "insight IA" — "Insights" es vocabulario prohibido (cap 04, línea 17). Aplica a cap 05 y a cualquier capítulo futuro (06+) que nombre esta etapa
- El onboarding debe soportar interrupción y retomado a mitad del Paso B (carga de movimiento) sin reiniciar desde el principio — esto es una decisión de arquitectura con costo técnico real (persistir estado a mitad de formulario), no solo un detalle de UX. Debe tenerse en cuenta quien implemente el onboarding en código, más allá de este documento
- Principio rector de microinteracciones (cap 08): "Toda microinteracción responde una función — confirmar, orientar o tranquilizar — nunca es decorativa." Aplica a todo el documento desde acá en adelante, especialmente relevante para cap 12 (Design System) y cap 14 (Gamificación), donde el riesgo de agregar animación decorativa es mayor
- Reglas transversales del sistema de feedback (cap 09): todo estado es transitorio, ninguno es modal, un solo símbolo (✓) para toda confirmación positiva, nunca se apilan dos estados a la vez, avisos y confirmaciones son familias distintas
- "IA terminó" descartado explícitamente de la taxonomía original (cap 09) por contradecir cap 03 regla 7 (la IA nunca es protagonista) — no reintroducir esta confirmación en capítulos futuros sin volver a discutirlo acá primero
- Excepción documentada a cap 03 regla 2: el Paso A del onboarding (cap 06) usa dos botones de igual peso visual (continuar/saltear) porque llevan al mismo resultado funcional — no es precedente general para otras pantallas sin la misma condición (dos caminos, un mismo resultado)
- Nivel de accesibilidad: WCAG 2.2 AA (no A, no AAA) — justificación completa en cap 10
- Ningún estado se comunica solo con color (cap 10, sección 3) — aplica a todo lo que se diseñe visualmente de acá en adelante, especialmente relevante para cap 12 (Design System)
- El texto de "¿Dónde estoy?" definido en cap 07 (tabla de las 4 preguntas) es también el título accesible real de cada pantalla, no solo texto visual grande
- Tamaño mínimo de objetivos táctiles: 44×44px (por encima del piso legal WCAG de 24×24px), justificado por el miedo de Rosa a equivocarse. Aplica a todo elemento táctil del producto de acá en adelante
- Regla del pulgar / zonas (fácil, media, difícil): fija qué elementos van en cada zona según cap 05-10, relevante para cap 12 (Design System) y cualquier layout futuro
- Roles de color del sistema (cap 12): Positivo (las 5 confirmaciones de cap 09, un solo rol), Atención (los 3 avisos de cap 09, deliberadamente no rojo de alerta agresiva), Interactivo (énfasis de botones principales y anillo de foco — nunca el foco reusa Atención, para no diluir la señal de alerta en cada Tab). Contraste mínimo: 4.5:1 texto normal, 3:1 texto grande/componentes de interfaz. Ningún valor hexadecimal fijado todavía — son roles, no paleta de marca
- Espaciado táctil mínimo entre objetivos adyacentes: 8px (cap 12, resuelve el número que cap 11 dejó sin cerrar)
- Duraciones de animación con nombre: Rápida (~150ms, confirmaciones de cap 09) y Estándar (200-250ms, transiciones de pantalla completa, ya fijado en cap 08) — sin duración "lenta", sin rebote en ningún caso
- Regla obligatoria para cap 14 (Gamificación): ningún streak puede tener mecanismo de vergüenza al romperse (sin reinicio a cero presentado como fracaso, sin mensaje que lo trate como pérdida) — un streak roto tiene que sentirse, como máximo, neutro
- Mecanismos rechazados explícitamente, no reintroducir sin discutirlos de nuevo: urgencia artificial, culpa para reenganchar por inactividad, streaks con vergüenza, felicitación por acciones rutinarias (mismo principio que "IA terminó" en cap 09 — no premiar/narrar lo rutinario), comparación social/tabla de posiciones (cap 14, fuente de vergüenza que cap 01 existe para evitar), sistema de puntos o moneda virtual paralela (cap 14, contradice cap 03 regla 3 — un número que no responde una pregunta real es ruido)
- Mecanismo de constancia (cap 14, resuelve la regla obligatoria de cap 13): ventana móvil (ej. "12 de los últimos 14 días"), nunca streak clásico con punto de ruptura que vuelve a cero
- "Primer presupuesto sostenido" (logro de cap 14) introduce un criterio nuevo no presente en cap 05 etapa 7 (que solo define crear un presupuesto, no mantenerlo) — la definición numérica de "sostenido" (cuántos períodos, con qué tolerancia) queda delegada a cap 15 (IA) o cap 16 (Roadmap UX), mismo patrón que las señales anticipatorias de Ana/José
- Señales anticipatorias (cap 15): comparación contra el promedio histórico propio de cada persona, nunca contra otros usuarios; mínimo 4 semanas de historial antes de calcular cualquier señal; margen de 20% de desviación (propuesta ajustable con datos reales, no constante fija)
- "Primer presupuesto sostenido" (cap 15, resuelve lo delegado por cap 14): 3 meses calendario consecutivos sin superar el límite, sin tolerancia parcial dentro del mes (se evalúa el total del mes cerrado, no día a día)
- Pendiente explícito para cap 16: granularidad diaria de "caja diaria" para José (cap 03, regla 9) — la señal de cap 15 es semanal (recalculada en cada entrada); una señal diaria confiable necesita su propia definición de historial mínimo y umbral, no resuelta todavía
- Roadmap (cap 16): V1 (recorrido completo, sin dependencia de historial de uso) — V2 (≥4 semanas, señal semanal Ana/José) — V3 (≥3 meses, gamificación completa incluido "sostenido") — V4 (caja diaria de José, sin fecha, bloqueada por diseño pendiente, no por antigüedad de datos)
- Accesibilidad (cap 10), Responsive (cap 11) y Design System (cap 12) son piso desde V1, nunca una fase tardía del roadmap

## Contradicciones abiertas (requieren tu decision)
- (vacio)

## Contradicciones resueltas (historial)
- Cap 05 detectó que el mapa original nombraba la etapa 8 como "Primer insight IA", pero "Insights" es vocabulario
  prohibido (cap 04, línea 17). El capítulo se redactó usando "Primer hallazgo IA" y quedó pendiente de confirmación.
  Resuelta 2026-07-12: se usa "hallazgo IA" en vez de "insight IA" en todo el documento, por vocabulario prohibido de
  cap 04. Aplica también al mapa citado en cap 05 y a cualquier capítulo futuro que nombre esta etapa.
- Revisión de consistencia global (2026-07-12, capítulos 01-09) detectó que el Paso A del onboarding (cap 06/07, dos
  botones de igual peso visual: "Vamos" / "Ir directo") tensiona con cap 03 regla 2 ("no competir con múltiples
  llamadas principales") — no detectado en el checklist de cierre original de cap 06. Resuelta: se mantiene el diseño
  aprobado sin cambios, documentado como excepción explícita en cap 03 y cap 06 — ambos botones llevan al mismo
  resultado funcional (avanzar), y despriorizar "saltear" reintroduciría la ansiedad que cap 01 busca evitar. No es
  precedente general para otras pantallas.
- Misma revisión detectó una imprecisión de cita: esta lista parafraseaba el trío de cifras de cap 01 sin la "y" que
  el original sí tiene (cap 01, línea 42). Corregida arriba para citar exacto.

## Notas de continuidad
- Tono: frases cortas, sin jerga, orientado a bajar ansiedad
- Cada capitulo debe terminar con aplicacion concreta a Saldo
- Regla de oro operativa: "?Rosa entenderia esto sin preguntarle a nadie?"
