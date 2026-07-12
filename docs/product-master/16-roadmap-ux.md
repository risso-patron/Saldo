# 16 - Roadmap UX

Este capítulo se escribe releyendo completos los capítulos 01 a 15. Hereda una pieza explícitamente delegada desde
cap 15: la granularidad diaria de "caja diaria" para José (cap 03, regla 9). Cubre el roadmap a nivel de experiencia
— qué ve el usuario y cuándo — no features técnicas de arquitectura o código, que no son territorio de este
documento.

## Principio de secuenciación (nuevo, justificado por lo ya definido en 01-15)
El orden de este roadmap no sale de preferencia de producto ni de dificultad técnica — sale de requisitos que
capítulos anteriores ya fijaron como condición de confiabilidad, no de gusto: la señal semanal de cap 15 necesita un
mínimo de 4 semanas de historial; "primer presupuesto sostenido" necesita 3 meses. Lanzar cualquiera de las dos antes
de tiempo significaría mostrar una función con un valor sin sentido (una señal calculada sobre 3 días de datos, un
logro de "sostenido" al primer mes) — cap 03, regla 4: *"no mostrar información sin valor todavía"*. El roadmap
sigue esa regla, aplicada a lo largo del tiempo de uso, no solo a una pantalla.

## Base no negociable desde el primer día (no es una fase)
Cap 10 (Accesibilidad), cap 11 (Responsive Philosophy) y cap 12 (Design System) no aparecen en ninguna versión de
abajo porque no son funciones que se agregan — son el piso sobre el que se construye todo lo demás, desde la primera
pantalla. Ponerlas en "V2" implicaría que la V1 es accesible o responsive "a medias", lo cual cap 10 y cap 11 ya
descartaron como aceptable.

## V1 — El recorrido completo, sin nada que dependa de historial de uso
Todo lo que no necesita tiempo acumulado para tener sentido:
- Landing, Registro (**con la separación personal/negocio desde el primer día** — cap 05, etapa 2, ya estableció que
  es una decisión estructural de datos, no un detalle que se pueda agregar después sin migrar información existente),
  Onboarding (los 3 pasos de cap 06/07/08)
- Primer ingreso, Primer gasto, Primer gráfico (**con agrupación por cliente/origen desde V1**, no como mejora
  posterior — cap 05, etapa 6, ya lo marcó como necesidad de Luis desde el primer uso real)
- Primer presupuesto (sin señal anticipatoria todavía — esa pieza es cap 15, y por diseño no puede existir sin
  historial)
- Primer objetivo, Primer mes cerrado, Primer reporte, Cliente recurrente
- Sistema de feedback completo (cap 09): las 5 confirmaciones y los 3 avisos, incluido el aviso previo a expiración
  de sesión agregado en cap 10

## V2 — Cuando existe suficiente historial semanal (a partir de ~4 semanas de uso real)
- Hallazgo IA — señal semanal de Ana (gasto por encima del promedio) y José (ingreso del negocio por debajo del
  promedio), cap 15. No es una fecha de calendario fija: el disparador es que la propia persona acumule 4 semanas de
  uso, tal como cap 15 lo definió como condición de confiabilidad.

## V3 — Cuando existe suficiente historial mensual (a partir de ~3 meses de uso real)
- Gamificación completa (cap 14): los 4 logros, incluido "Primer presupuesto sostenido" — que literalmente no puede
  activarse antes de 3 meses (cap 15) porque el criterio mismo lo exige — y la ventana móvil de constancia (*"12 de
  los últimos 14 días"*), que gana estabilidad con más historial acumulado detrás, aunque no tiene un piso numérico
  tan estricto como el de "sostenido".

## V4 — Bloqueado por diseño pendiente, no por antigüedad de datos
- "Caja diaria" para José (cap 03, regla 9; cap 15 lo dejó explícitamente sin resolver). A diferencia de V2 y V3,
  esto no espera que pase tiempo de uso — espera que alguien defina primero cuántos días de historial hacen falta
  para un promedio diario estable y qué umbral distingue un día flojo real de ruido normal (cap 15: *"un día es mucho
  más volátil que una semana"*). Ponerle una fecha a V4 no tendría sentido todavía: no hay una definición que
  calendarizar. Queda como marcador de posición explícito, no como compromiso de fecha.

## Qué NO es parte de este roadmap
Fechas de calendario reales, estimación de esfuerzo en semanas o sprints, asignación de equipo o prioridad de
negocio — eso es planificación de proyecto, un documento distinto. Este capítulo ordena *qué debe poder mostrarse
honestamente y cuándo*, no cuánto tiempo de trabajo toma construirlo.

## Aplicación por persona
- **Rosa:** todo lo que necesita está en V1 — cap 02 no le asigna ninguna necesidad que dependa de historial
  acumulado (a diferencia de Ana, José o Luis). No hay inferencia acá: simplemente ninguna pieza de V2-V4 la
  menciona.
- **Luis:** su necesidad central (agrupar por cliente/origen, cap 02) está en V1, no diferida — es una decisión
  deliberada de este capítulo, ya que cap 05 etapa 6 nunca sugirió que pudiera esperar.
- **Ana:** su señal anticipatoria llega en V2, no antes — no es una demora arbitraria, es la misma condición de 4
  semanas que cap 15 ya fijó para cualquier persona, aplicada a su caso.
- **José:** es la persona con más piezas repartidas en el tiempo — Registro con separación personal/negocio en V1,
  señal semanal de ingreso en V2, "presupuesto sostenido" en V3, y "caja diaria" en V4 sin fecha. Esto es una
  consecuencia de que cap 03, regla 9, y cap 15 le pidieron más profundidad de señal que a cualquier otra persona —
  no un descuido de este capítulo hacia él.

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Resuelve la pieza delegada por cap 15 (caja diaria)?** Sí, con honestidad: no le asigna una fecha
      inventada — la marca en V4 como bloqueada por diseño pendiente, distinta de V2/V3 que están bloqueadas por
      tiempo de uso. Evidencia: sección V4, cita explícita a cap 15.
- [ ] **¿El roadmap es de experiencia o de arquitectura técnica?** De experiencia. Evidencia: ninguna versión
      menciona stack, base de datos, ni implementación — todas describen qué ve el usuario y bajo qué condición.
- [ ] **¿El orden de versiones está justificado o es arbitrario?** Justificado. Evidencia: V2 y V3 citan los
      requisitos numéricos que cap 15 ya fijó (4 semanas, 3 meses) en vez de inventar un orden de preferencia.
- [ ] **¿Accesibilidad, responsive y design system quedan como fase tardía?** No. Evidencia: sección dedicada
      explícita ("Base no negociable desde el primer día"), citando por qué ponerlas en una versión posterior
      contradiría cap 10/11.
- [ ] **¿Se aplican decisiones de persona con cita, sin inventar?** Sí. Evidencia: los 4 párrafos de "Aplicación por
      persona" citan la razón de por qué cada persona recibe valor en la versión que le toca, sin asignarle una
      necesidad no citada en capítulos anteriores.
- [ ] **¿Se mantiene fuera del alcance la planificación de proyecto (fechas, sprints, equipo)?** Sí. Evidencia:
      sección "Qué NO es parte de este roadmap", explícita.
- [ ] **Contradicciones abiertas detectadas:** ninguna.
