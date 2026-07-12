# 06 - Onboarding

Este capítulo se escribe releyendo completos los capítulos 01 a 05. A partir de acá, 05 también es fundacional
(00-STATE.md: "05 también pasa a ser fundacional, porque fija el recorrido completo que los capítulos siguientes deben
respetar paso a paso"). El onboarding no es un capítulo nuevo que empieza de cero: es el desarrollo concreto de la
etapa 3 que cap 05 ya definió y cerró.

## Punto de partida (cap 05, etapa 3 — no se redefine, se desarrolla)
Cap 05 ya fijó los cuatro objetivos de esta etapa, y este capítulo no puede contradecirlos:
- Emocional: *"dar sensación de acompañamiento, no de instrucción pesada"*
- Funcional: *"llevar a la primera acción real (cargar un movimiento) sin explicación previa larga"*
- Visual: *"pantallas breves, progresivas, con una sola idea por pantalla"*
- Psicológico: *"instalar confianza desde el inicio; primera pequeña victoria rápida"*

Cap 05 ya citó también el principio que rige todo este capítulo (cap 03, regla 5): *"Si hace falta tutorial, el diseño
falló."* Este capítulo diseña el onboarding para que la acción reemplace al tutorial, no para agregarle explicación.

## Estructura concreta del onboarding
Tres pasos, no más. Más de tres pasos ya es un tutorial disfrazado, y contradice cap 05 ("pantallas breves,
progresivas, con una sola idea por pantalla").

### Paso A — Confirmar el porqué (opcional, salteable en un toque)
Una sola frase que conecta con la promesa de Landing (cap 05, etapa 1), no una serie de slides explicativos.
Ejemplo de intención, no de copy final (el texto exacto es cap 07): algo del orden de "vamos a ver cuánto entró, cuánto
salió y cuánto te queda — empecemos con un movimiento real". Siempre visible un botón para saltear, del mismo tamaño
visual que la acción de continuar — saltear no puede sentirse como una opción escondida o penalizada.

### Paso B — Primera acción guiada (obligatoria, es el corazón del onboarding)
Cargar un movimiento real: un ingreso o un gasto, lo que el usuario tenga a mano. Esta es la acción que reemplaza al
tutorial (cap 03, regla 5, citada arriba). No hay pantalla de "así se carga un movimiento" antes de esto: la primera
vez que el usuario ve el formulario de carga, ya lo está usando para cargar algo real.
- **Nota de persona (José):** si en el Registro (cap 05, etapa 2) ya definió que separa "tu plata" personal de "la
  plata del negocio", el Paso B tiene que reflejar esa elección, no volver a preguntarla. Cita, cap 05, etapa 4: *"si en
  el registro ya definió que separa personal de negocio, el ingreso debe preguntar (sin fricción, en el mismo paso) a
  cuál 'plata' pertenece — nunca asumir."* Nunca asumir tampoco significa nunca repreguntar lo ya elegido.

### Paso C — Confirmación y entrada al Inicio (empalme, no una pantalla nueva)
El onboarding no termina en una pantalla de "¡listo!" separada. Termina en el mismo lugar donde cap 05 ubica la etapa
4 (Primer ingreso) o la etapa 5 (Primer gasto), según qué haya cargado el usuario en el Paso B. El Inicio muestra de
inmediato el trío de cifras de cap 01, línea 42: *"cuánto entró, cuánto salió y cuánto queda hoy"*, con el dato recién
cargado ya reflejado ahí. No existe una "pantalla de bienvenida final" distinta al Inicio real — crearla sería
redefinir el Inicio, algo que 00-STATE.md prohíbe explícitamente para este capítulo.

## Criterio de "onboarding completo"
El onboarding se considera completo cuando el usuario ve el Inicio con al menos un movimiento cargado por sí mismo —
no cuando "completó todos los pasos". Es una diferencia importante: si alguien saltea el Paso A y carga un movimiento
real en el Paso B, ya completó el onboarding. El criterio es la acción real (cap 03, regla 5), no el recorrido de
pantallas.

## Onboarding interrumpido y retomado
Si el usuario cierra la app a mitad del Paso B, Saldo tiene que retomar exactamente ahí al volver — no reiniciar desde
el Paso A. Esto es una decisión de arquitectura, no un detalle menor.
- **Nota de persona (Ana):** cap 02 define su tiempo disponible como *"5 a 10 minutos por bloque, en distintos momentos
  del día"*. Un onboarding que no soporta interrupción y retomado la obliga a "empezar de nuevo" varias veces al día,
  lo que contradice directamente la misión de cap 01 (disminuir ansiedad financiera, no agregarla).

## Onboarding por persona
El esqueleto de tres pasos es el mismo para las cuatro personas — no se crean cuatro flujos distintos, eso
contradiría "una pantalla = una acción principal" (cap 03, regla 2) multiplicado por variantes innecesarias. Lo que
cambia es el énfasis:
- **Rosa:** no salteá el Paso A por defecto — cap 02 dice que *"qué nunca haría: configurar reglas avanzadas o estudiar
  un tutorial largo"*, lo cual confirma que necesita el contexto breve, no que lo evite. El guiado del Paso B es
  explícito, un campo a la vez.
- **Luis:** el botón de saltear el Paso A tiene que ser lo primero que vea con claridad. Cita, cap 02: *"no quiere
  perder tiempo operativo"* y *"tiempo disponible: 15 a 20 minutos al día"*. Prioridad total en llegar al Paso B rápido.
- **Ana:** ver "Onboarding interrumpido y retomado" arriba — la prioridad es que el onboarding sobreviva la
  interrupción, no que sea más corto en sí mismo.
- **José:** el Paso B ya refleja la separación personal/negocio definida en el Registro, nunca la repregunta (ver nota
  de persona en Paso B). Cita, cap 02: *"tiempo disponible: 10 minutos antes de abrir y 10 minutos al cerrar"* — el
  onboarding de José compite directamente con su rutina operativa real, no puede tomar más de eso.

## Nota de vocabulario
"Onboarding" es el nombre interno de este capítulo, igual que "hallazgo IA" en cap 05 — no es necesariamente una
palabra para mostrar en pantalla. No está en la lista explícita de vocabulario prohibido (cap 04, línea 17), pero
contradice el espíritu de cap 04: *"Lenguaje humano por encima de naming técnico"*. Si en algún punto del onboarding
hace falta un indicador de progreso o un texto visible, debe usar vocabulario permitido o lenguaje simple equivalente
(ej. "primeros pasos" en vez de "onboarding"), no el anglicismo técnico. El texto exacto se resuelve en cap 07.

## Qué no resuelve este capítulo (delegado a capítulos siguientes)
Mismo patrón que cap 05 usó para señales anticipatorias (delegadas a 15 y 16, por cap 03 regla 9): este capítulo fija
la estructura y el criterio de cierre del onboarding, pero no resuelve:
- El texto exacto de cada paso (Paso A, botones, mensajes) → cap 07, UX Writing
- Las transiciones y animaciones entre pasos → cap 08, Microinteracciones
- Qué pasa visualmente si el Paso B falla (error de carga, campo inválido) → cap 09, Sistema de Feedback

## Aplicación concreta a Saldo
- El onboarding empieza inmediatamente después del Registro (cap 05, etapa 2), sin pantalla intermedia
- Paso A es una frase, no una serie de slides, y su botón de saltear pesa visualmente igual que el de continuar
- Paso B carga un movimiento real; si el usuario ya definió personal/negocio en el Registro, no se le repregunta
- Paso C es el Inicio real de cap 01, con el trío de cifras y el dato recién cargado — no una pantalla de cierre aparte
- El onboarding sobrevive el cierre de la app a mitad de camino y retoma en el mismo Paso B, no reinicia

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Requiere tutorial para completarse?** No. Evidencia: el Paso B es la acción real de carga, no una explicación
      previa; cap 03 regla 5 citada como principio rector desde el punto de partida del capítulo.
- [ ] **¿Redefine el Inicio distinto a cap 01?** No. Evidencia: el Paso C cita textualmente cap 01, línea 42, y
      explicita que no existe una pantalla de cierre separada del Inicio real.
- [ ] **¿Contradice la etapa 3 ya cerrada en cap 05?** No. Evidencia: las cuatro dimensiones de cap 05 etapa 3 se citan
      textualmente al inicio del capítulo como punto de partida, y ningún paso las contradice.
- [ ] **¿Se aplican las decisiones fundacionales de persona?** Sí. Evidencia: José en Paso B (no repreguntar
      personal/negocio, cita cap 05 etapa 4); Ana en "Onboarding interrumpido y retomado" (cita cap 02, tiempo en
      bloques); Rosa y Luis en "Onboarding por persona" (citas cap 02 inline).
- [ ] **¿Aparece vocabulario prohibido o naming técnico como texto de interfaz?** No verificable en este capítulo
      porque no define copy exacto (delegado a cap 07) — evidencia: se deja nota de vocabulario explícita advirtiendo
      que "Onboarding" es nombre interno, no texto de pantalla, para que cap 07 no lo herede por descuido.
- [ ] **Contradicciones abiertas detectadas:** ninguna.
