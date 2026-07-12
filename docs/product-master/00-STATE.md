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
- [ ] 05 - Arquitectura de Experiencia
- [ ] 06 - Onboarding
- [ ] 07 - UX Writing
- [ ] 08 - Microinteracciones
- [ ] 09 - Sistema de Feedback
- [ ] 10 - Accesibilidad
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
- Inicio/Dashboard debe mostrar de forma directa: cuánto entró, cuánto salió, cuánto queda hoy (definido en cap 01, no redefinir distinto en cap 05 o 06)
- La prohibición de "Analytics" es de naming/vocabulario, no de funcionalidad: Luis sí necesita ver patrones de ingresos y clientes, pero en lenguaje simple (ej: "cómo te está yendo con tus clientes")
- Luis necesita agrupar movimientos por cliente/origen, no solo por categoría de gasto; es una dimensión de datos distinta que Arquitectura (05) y Design System (12) no deben ignorar
- Ana necesita señales anticipatorias ("semanas difíciles"), no solo registro histórico; marcar para que IA (15) y/o Roadmap UX (16) lo retomen explícitamente
- José necesita separación clara entre caja personal y caja del negocio; no es una categoría más, es una distinción estructural de datos que debe resolverse explícitamente en arquitectura/categorías/design system más adelante
- A partir de cap 05, releer completos los capítulos 01-04 antes de redactar cualquier capítulo nuevo: 04 pasa a ser fundacional junto con 01-03, porque fija el vocabulario oficial (prohibido/permitido) que rige el resto del documento
- A partir de cap 05, todo cierre de capítulo requiere checklist con evidencia y citas textuales (línea/sección concreta), no alcanza con el tilde

## Contradicciones abiertas (requieren tu decision)
- (vacio)

## Notas de continuidad
- Tono: frases cortas, sin jerga, orientado a bajar ansiedad
- Cada capitulo debe terminar con aplicacion concreta a Saldo
- Regla de oro operativa: "?Rosa entenderia esto sin preguntarle a nadie?"
