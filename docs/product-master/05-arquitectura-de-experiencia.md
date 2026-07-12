# 05 - Arquitectura de Experiencia

La arquitectura de experiencia de Saldo es el recorrido que transforma duda en claridad.
No se mide por cantidad de pantallas, sino por la sensación del usuario al avanzar.

La regla base es simple:
cada etapa debe llevar a la siguiente sin hacerle perder confianza al usuario.

Este capítulo se escribe releyendo completos los capítulos 01 a 04, porque a partir de acá 04 también es fundacional
(00-STATE.md: "04 pasa a ser fundacional junto con 01-03, porque fija el vocabulario oficial"). Ninguna etapa de este
recorrido puede contradecir la misión de cap 01, los principios de cap 03 ni el vocabulario de cap 04.

## Cómo leer este capítulo
Cada etapa se define en 4 dimensiones: emocional, funcional, visual, psicológica.
Cuando una etapa aplica una decisión fundacional de persona (Luis, Ana o José), se marca con **Nota de persona**
y se cita el texto exacto de 00-STATE.md o del capítulo de origen. No se aplican decisiones de persona por intuición:
si no hay cita, no se asume.

## Recorrido completo

### 1) Landing
- Objetivo emocional: que la persona sienta alivio y curiosidad, no presión
- Objetivo funcional: entender en segundos qué resuelve Saldo, sin necesitar registro para entenderlo
- Objetivo visual: mensaje corto, una promesa clara, una sola acción principal
- Objetivo psicológico: reducir el miedo a empezar y mostrar que no hace falta saber de finanzas para entrar

### 2) Registro
- Objetivo emocional: que registrarse se sienta liviano y seguro, no un compromiso grande
- Objetivo funcional: crear la cuenta sin fricción ni pasos innecesarios
- Objetivo visual: formulario corto, jerarquía limpia, pocos campos
- Objetivo psicológico: bajar la barrera de entrada y evitar que el usuario crea que necesita "prepararse" antes de usar la app
- **Nota de persona (José):** este es el paso donde se define, sin fricción, si la cuenta va a separar "tu plata" personal
  de "la plata del negocio" (vocabulario cap 04, líneas 33-34). La distinción se resuelve acá, no se agrega después como
  parche. Cita, 00-STATE.md: *"José necesita separación clara entre caja personal y caja del negocio; no es una categoría
  más, es una distinción estructural de datos que debe resolverse explícitamente en arquitectura/categorías/design system
  más adelante."*

### 3) Onboarding
- Objetivo emocional: dar sensación de acompañamiento, no de instrucción pesada
- Objetivo funcional: llevar a la primera acción real (cargar un movimiento) sin explicación previa larga
- Objetivo visual: pantallas breves, progresivas, con una sola idea por pantalla
- Objetivo psicológico: instalar confianza desde el inicio; primera pequeña victoria rápida
- **Nota de principio (cap 03, regla 5):** *"Si hace falta tutorial, el diseño falló."* El onboarding de Saldo no puede ser
  una explicación previa a la acción — tiene que ser la acción misma, guiada. Si en algún momento se necesita un tutorial
  para completar el onboarding, esta etapa está mal diseñada, no falta contenido de ayuda.

### 4) Primer ingreso
- Objetivo emocional: generar alivio inmediato al ver el primer dato cargado
- Objetivo funcional: registrar cuánto entró de forma simple y directa
- Objetivo visual: acción principal clara, confirmación visible, lenguaje humano
- Objetivo psicológico: enseñar que el sistema no castiga y que el progreso empieza con un solo movimiento
- **Nota de continuidad (cap 01):** el Inicio debe reflejar de inmediato el mismo trío de cifras definido en cap 01 y no
  redefinido distinto acá: *"cuánto entró, cuánto salió y cuánto queda hoy"* (01-la-filosofia.md, línea 42). Cargar el
  primer ingreso debe verse reflejado ahí mismo, sin ir a otra pantalla a "confirmar".
- **Nota de persona (José):** si en el registro ya definió que separa personal de negocio, el ingreso debe preguntar
  (sin fricción, en el mismo paso) a cuál "plata" pertenece — nunca asumir. Misma cita fundacional que en Registro.

### 5) Primer gasto
- Objetivo emocional: normalizar el gasto sin culpa
- Objetivo funcional: registrar una salida de dinero de manera rápida
- Objetivo visual: etiqueta clara, campo simple, feedback inmediato — nada de rojo agresivo ni alerta grande por un gasto único
- Objetivo psicológico: reemplazar vergüenza por orden; el usuario entiende que registrar no es juzgar
- **Nota de continuidad (cap 01):** mismo trío de cifras — el Inicio actualiza "cuánto salió" y "cuánto queda hoy" con el
  mismo lenguaje exacto de cap 01, línea 42. Cita reforzada por el principio emocional base de cap 01: *"Cada interacción
  debe responder una pregunta silenciosa del usuario: ¿Estoy mejor que hace un momento?"* — un gasto registrado no puede
  hacer sentir al usuario peor por el solo hecho de registrarlo.

### 6) Primer gráfico
- Objetivo emocional: dar una primera sensación de comprensión global
- Objetivo funcional: mostrar patrones básicos sin exigir interpretación técnica
- Objetivo visual: gráfico simple, sin saturación, con un mensaje que lo traduzca
- Objetivo psicológico: evitar que el gráfico parezca decoración y convertirlo en una respuesta concreta
- **Nota de persona (Luis):** para Luis, este gráfico ya tiene que poder agruparse por cliente u origen, no solo por
  categoría de gasto genérica. Cita, 00-STATE.md: *"Luis necesita agrupar movimientos por cliente/origen, no solo por
  categoría de gasto; es una dimensión de datos distinta que Arquitectura (05) y Design System (12) no deben ignorar."*
  Esta es la primera etapa del recorrido donde esa dimensión de datos tiene que estar disponible, no una etapa futura.

### 7) Primer presupuesto
- Objetivo emocional: que el presupuesto se sienta como una ayuda, no como una restricción
- Objetivo funcional: definir límites simples y útiles para decidir mejor
- Objetivo visual: pocas categorías, número grande, estados entendibles
- Objetivo psicológico: evitar culpa y reforzar control; el presupuesto existe para bajar ansiedad, no para controlar al usuario
- **Nota de persona (Ana y José):** este es el primer punto del recorrido donde corresponde mostrar una señal anticipatoria
  en vez de solo un tope numérico — por ejemplo, avisar que el mes viene más ajustado que otros, antes de que el límite se
  cruce. Cita, 00-STATE.md: *"Ana necesita señales anticipatorias ('semanas difíciles'), no solo registro histórico"* y
  *"José necesita separación clara entre caja personal y caja del negocio"* combinada con la regla de cap 03: *"José
  necesita señales tempranas para detectar semanas flojas de ventas o caja diaria en su negocio pequeño."* La
  profundidad de esta señal (cómo se calcula, con qué anticipación) se define en los capítulos 15 (IA) y 16 (Roadmap UX),
  tal como cap 03 lo marca explícitamente en su regla 9 — este capítulo solo fija que el presupuesto es el primer lugar
  del recorrido donde la señal debe aparecer.

### 8) Primer hallazgo IA
- Objetivo emocional: sorprender con utilidad, no con complejidad
- Objetivo funcional: mostrar una observación clara que ayude a decidir
- Objetivo visual: mensaje breve, integrado al flujo (por ejemplo junto al gráfico o al cierre del día), nunca como
  notificación agresiva o pantalla propia
- Objetivo psicológico: hacer visible que la IA acompaña sin protagonismo y sin lenguaje difícil
- **Nota de nombre:** esta etapa se llama "hallazgo IA" y no "insight IA" a propósito. "Insights" está en el vocabulario
  prohibido de cap 04 (línea 17). Si el nombre interno del paso usa la palabra prohibida, tarde o temprano se filtra a la
  interfaz. En pantalla, esto nunca debe decir "insight": se dice en lenguaje permitido, por ejemplo "una idea sobre tu
  plata" o equivalente (cap 04, vocabulario permitido).
- **Nota de principio (cap 03, regla 7):** *"La IA nunca es protagonista. La IA acompaña, sugiere y traduce. No se
  impone, no complica, no habla en difícil."* Esta etapa no puede convertirse en una sección o pantalla dominante — es
  un mensaje que aparece, ayuda y se retira.
- **Nota de contenido por versión (agregada en la revisión de cap 17 — QA, Hallazgo 2):** esta etapa está temprano en
  el recorrido (junto a Primer ingreso, Primer gasto, Primer gráfico), pero el único contenido con definición
  numérica hasta cap 15 era la señal semanal de Ana/José, que requiere 4 semanas de historial (V2, cap 16) — es
  decir, nadie tenía nada real que ver acá el día 1. Se resuelve así: la etapa 8 tiene contenido **desde V1**, básico
  y sin pretensión predictiva (una observación sobre el primer movimiento cargado, no un patrón), aplicable a las 4
  personas por igual. La señal semanal de Ana/José (cap 15) **no es una etapa distinta ni un contenido nuevo — es la
  misma etapa 8, evolucionada**, una vez que hay suficiente historial. Mismo lugar en pantalla, mismo nombre visible
  ("Una idea sobre tu plata", cap 07), más profundidad cuando los datos lo permiten. Definición completa en cap 15.

### 9) Primer objetivo
- Objetivo emocional: convertir la motivación en una meta concreta
- Objetivo funcional: crear una meta clara y medible
- Objetivo visual: estado simple, avance visible, expectativa entendible
- Objetivo psicológico: instalar propósito; el usuario entiende para qué está usando Saldo hoy

### 10) Primer mes cerrado
- Objetivo emocional: dar cierre, aprendizaje y calma
- Objetivo funcional: revisar el mes sin esconder nada importante
- Objetivo visual: resumen claro, sin ruido, con lectura rápida
- Objetivo psicológico: construir la idea de que cerrar un mes no es fallar, es comprender
- **Nota de continuidad (cap 01):** el resumen de cierre de mes usa el mismo trío de cifras de siempre —cuánto entró,
  cuánto salió, cuánto queda— en formato mensual, no una métrica nueva. Cita, cap 01: *"Cierre diario: mensaje corto que
  confirme avance real, no perfección."* El cierre de mes es la misma lógica, escalada a un mes: confirma avance real,
  no exige un mes perfecto para sentirse bien.

### 11) Primer reporte
- Objetivo emocional: que el reporte se sienta útil, no pesado
- Objetivo funcional: resumir información relevante para tomar decisiones
- Objetivo visual: estructura simple, títulos claros, prioridad visual fuerte
- Objetivo psicológico: demostrar que el reporte existe para actuar, no para acumular datos
- **Nota de persona (Luis):** el reporte tiene que respetar exactamente lo que Luis ya venía viendo en pantalla — si
  estaba agrupando por cliente/origen (etapa 6), el reporte se exporta agrupado igual, no en un formato genérico distinto.
  Misma cita fundacional que en Primer gráfico.
- **Nota de vocabulario (cap 04):** el archivo puede ser técnicamente un CSV o un PDF por dentro, pero esas palabras
  —igual que "JSON"— están en el vocabulario prohibido (línea 17-22) y no pueden aparecer como texto de interfaz. El
  reporte se nombra y se explica en lenguaje humano ("descargá tus movimientos"), nunca por su formato técnico.

### 12) Cliente recurrente
- Objetivo emocional: consolidar confianza y hábito
- Objetivo funcional: reconocer patrones repetidos en clientes, movimientos o decisiones
- Objetivo visual: continuidad clara, señales de consistencia, menor fricción; nada de pantallas de bienvenida repetidas
- Objetivo psicológico: mostrar que Saldo acompaña el día a día real y no solo momentos aislados
- **Nota de persona (Ana y José):** acá las señales anticipatorias de la etapa 7 ya deben sentirse naturales y
  recurrentes, no como una función nueva cada vez que el usuario vuelve. Es la maduración de la misma cita fundacional
  de Primer presupuesto, no una decisión distinta.
- **Nota de continuidad (cap 01):** al volver, Saldo retoma con el mismo trío de cifras de siempre, ahora con historia
  detrás. El regreso nunca se siente como "primera vez" otra vez.

## Principios transversales de este recorrido
- Cada etapa debe poder responder, sin esfuerzo extra, las cuatro preguntas de cap 04 (líneas 6-9): *"¿Dónde estoy? ¿Qué
  puedo hacer? ¿Qué pasa si aprieto esto? ¿Qué gano haciendo esto?"*
- Ninguna etapa puede requerir tutorial para completarse (cap 03, regla 5) — la etapa 3 (Onboarding) es la más expuesta a
  este riesgo y se resuelve explícitamente arriba.
- El Inicio no se redefine distinto en ningún punto de este recorrido — mismo trío de cifras de cap 01 en las etapas 4, 5,
  10 y 12 (00-STATE.md: *"Inicio/Dashboard debe mostrar de forma directa: cuánto entró, cuánto salió, cuánto queda hoy...
  no redefinir distinto en cap 05 o 06"*).
- El vocabulario prohibido de cap 04 aplica a todo el recorrido, no solo a la etapa 8 o 11 donde se lo señala
  explícitamente — esas dos son los puntos de mayor riesgo, no los únicos.

## Aplicación por persona (con cita de origen)
- **Rosa:** cada etapa se diseñó para sentirse obvia, corta y sin jerga — es el caso base de las 12 etapas, no requiere
  una nota aparte en ninguna.
- **Luis:** agrupación por cliente/origen aplicada en Primer gráfico (etapa 6) y Primer reporte (etapa 11). Cita,
  00-STATE.md: *"Luis necesita agrupar movimientos por cliente/origen, no solo por categoría de gasto."*
- **Ana:** señales anticipatorias aplicadas en Primer presupuesto (etapa 7) y maduradas en Cliente recurrente (etapa 12).
  Cita, 00-STATE.md: *"Ana necesita señales anticipatorias ('semanas difíciles'), no solo registro histórico."* Profundidad
  técnica de la señal: pendiente de caps 15 y 16, tal como cap 03 regla 9 lo marca.
- **José:** separación caja personal/negocio aplicada en Registro (etapa 2) y Primer ingreso (etapa 4); señales
  anticipatorias aplicadas en Primer presupuesto (etapa 7) y Cliente recurrente (etapa 12). Cita, 00-STATE.md: *"José
  necesita separación clara entre caja personal y caja del negocio"* y cap 03 regla 9: *"José necesita señales tempranas
  para detectar semanas flojas de ventas o caja diaria en su negocio pequeño."*

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Redefine "Inicio" distinto a cap 01?** No. Evidencia: etapas 4, 5, 10 y 12 citan textualmente cap 01, línea 42
      ("cuánto entró, cuánto salió y cuánto queda hoy").
- [ ] **¿Aparece vocabulario prohibido de cap 04 como texto de interfaz?** No. Evidencia: etapa 8 usa "hallazgo IA" en vez
      de "insight" (nota de nombre incluida); etapa 11 marca explícitamente que CSV/JSON no pueden ser texto de interfaz.
- [ ] **¿Se aplican las 3 decisiones fundacionales de 00-STATE.md?** Sí. Evidencia: Luis en etapas 6 y 11; Ana en etapas 7
      y 12; José en etapas 2, 4, 7 y 12 — todas con cita textual inline, no por intuición.
- [ ] **¿Alguna etapa exige tutorial para completarse?** No. Evidencia: etapa 3 (Onboarding) resuelto explícitamente contra
      cap 03 regla 5, citada inline.
- [ ] **¿La IA aparece como protagonista en algún punto?** No. Evidencia: etapa 8 la limita a mensaje breve integrado al
      flujo, nunca pantalla propia; cap 03 regla 7 citada inline.
- [ ] **Contradicciones abiertas detectadas:** una. El mapa original nombraba esta etapa "Primer insight IA"; este
      capítulo la redactó como "Primer hallazgo IA" por el vocabulario prohibido de cap 04. Queda pendiente tu
      confirmación — si preferís mantener "insight" como nombre interno de etapa (no de UI), se ajusta sin tocar el resto
      del capítulo.

**Addendum (cap 17, QA — Hallazgo 2, 2026-07-12):** la etapa 8 no tenía contenido real para ningún día 1 — el único
contenido definido (cap 15) requería 4 semanas de historial. Corregido: ver "Nota de contenido por versión" al final
de la etapa 8, arriba. No se reabre el resto del capítulo, solo esa etapa.
