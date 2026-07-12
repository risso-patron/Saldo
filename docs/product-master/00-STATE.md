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
- [ ] 11 - Responsive Philosophy
- [ ] 12 - Design System
- [ ] 13 - Psicologia
- [ ] 14 - Gamificacion
- [ ] 15 - IA
- [ ] 16 - Roadmap UX
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
