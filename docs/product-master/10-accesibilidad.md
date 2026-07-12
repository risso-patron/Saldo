# 10 - Accesibilidad

Este capítulo se escribe releyendo completos los capítulos 01 a 09. No define pantallas nuevas — aplica un estándar
técnico concreto (WCAG 2.2 AA) sobre lo que ya existe: los 12 momentos de cap 05, el copy de cap 07, las
microinteracciones de cap 08 y los 8 estados de cap 09. Cap 09 dejó una pieza explícitamente pendiente para acá:
*"cómo se ve cada estado en accesibilidad (anuncios de lector de pantalla, contraste)"*. Se resuelve primero.

## Por qué WCAG 2.2 AA
No es un nivel arbitrario. A es insuficiente para un producto que maneja información financiera personal; AAA es
sobre-ingeniería para el tamaño actual de Saldo y varios de sus criterios (contraste 7:1, sin excepciones de
interpretación de lenguaje) exceden lo que el resto de este documento pide en otras áreas. AA es el nivel donde
"claridad antes que completa" (cap 04) y "accesible" dejan de ser objetivos distintos y se vuelven el mismo objetivo.

## Nota honesta sobre las personas
Ninguna de las cuatro personas de cap 02 (Rosa, Luis, Ana, José) tiene una discapacidad documentada. Este capítulo no
inventa una para justificarse. La base de este capítulo es más simple y ya está en el documento: cap 03, regla 1
(*"Si Rosa duda, el diseño todavía no está listo"*) exige claridad universal — la misma claridad que necesita un
usuario de lector de pantalla o de teclado. Accesibilidad acá no es una capa aparte para "otro tipo de usuario": es
la regla 1 de cap 03, aplicada con rigor técnico.

## 1) Estados de cap 09 en accesibilidad (trabajo delegado, resuelto acá)
Los 6 estados de confirmación y los 2 avisos de cap 09 son visualmente transitorios — aparecen y se retiran solos. Esa
decisión de UX no puede traducirse en "invisible para lector de pantalla": un anuncio de lector de pantalla ocurre una
vez, al aparecer el contenido, y no depende de cuánto tiempo siga visible en pantalla. Con esa base:

- **Confirmaciones** (✓ Guardado, ✓ Sincronizado, ✓ Presupuesto actualizado, ✓ Movimiento eliminado, ✓ Recuperado):
  se anuncian de forma que no interrumpe lo que el usuario esté haciendo — no cortan una lectura en curso.
- **Avisos** (fallo de internet, expiración de sesión): se anuncian de forma que si requieren atención, no permite que
  pasen inadvertidos — a diferencia de las confirmaciones, el usuario necesita enterarse aunque esté en medio de otra
  tarea.

Esta distinción no es nueva: es la misma que cap 09 ya estableció entre confirmaciones y avisos ("los avisos... no
llevan ✓, porque no confirman algo que salió bien — orientan"). Este capítulo la extiende del canal visual al canal
de lector de pantalla, sin agregar una tercera categoría.

## 2) Foco de teclado sobre lo ya definido
No se rediseña nada de cap 06 o cap 08 — se agrega el requisito de teclado a lo que ya existe:

- **Paso A del onboarding** (cap 06, excepción documentada a cap 03 regla 2): los dos botones de igual peso visual
  deben tener el mismo tratamiento en teclado — ambos alcanzables por Tab en el mismo orden que su orden visual,
  ambos con indicador de foco visible. La excepción a la regla 2 fue sobre jerarquía visual, no sobre alcance por
  teclado — acá no hay excepción posible: los dos caminos tienen que ser igual de fáciles de alcanzar sin mouse.
- **Deshacer** (cap 08, "Borrar"): la ventana de tiempo para deshacer tiene que alcanzar para completarse por
  teclado, no solo para un clic de mouse. Cap 08 ya citó el miedo de Rosa a perder información (cap 02) como
  justificación del deshacer — una ventana calibrada solo para velocidad de mouse le fallaría a cualquier usuario de
  teclado o lector de pantalla, incluida Rosa si en algún momento usa asistencia.
- **Edición en el lugar** (cap 08, "Editar"): al volverse editable un campo, el foco se mueve ahí automáticamente. Si
  el campo no recibe foco, la interacción es invisible para quien no usa mouse.
- **Selectores de cap 07** (¿ingreso o gasto?, ¿tu plata o la plata del negocio?): se implementan como grupo de
  opciones real (no solo agrupación visual), navegable con flechas y anunciado como grupo, no como botones sueltos.

## 3) Contraste y no depender solo del color
El símbolo ✓ de cap 09 ya cumple esto por diseño: tiene forma reconocible, no depende solo de un color de fondo verde
para comunicar "confirmado". Se fija como regla para todo lo que venga después (presupuestos con estado, gráficos de
cap 05 etapa 6): ningún estado se comunica solo con color. Siempre color más forma, ícono o texto.

## 4) "¿Dónde estoy?" también para lector de pantalla
Cap 04 exige que cada pantalla responda "¿Dónde estoy?" sin esfuerzo. Cap 07 ya resolvió el texto exacto para las 12
etapas de cap 05 (tabla completa). Este capítulo cierra el círculo técnico: ese texto tiene que ser el título
accesible real de cada pantalla (encabezado principal, foco inicial al navegar a ella), no solo un texto grande
visualmente. Sin esto, cap 04 se cumple para quien ve la pantalla y falla para quien la escucha.

## Propuesta pendiente de tu confirmación: aviso antes de expirar sesión
Cap 09 resolvió el mensaje de después de expirar la sesión (*"Pasó un rato. Volvé a entrar para seguir"*) y garantiza
que nada se pierde. WCAG 2.2 AA, en su principio de límites de tiempo, pide además avisar *antes* de que el límite se
cumpla, con oportunidad de extenderlo — salvo que el límite sea esencial. El límite de sesión de Saldo no es esencial
en ese sentido (es una medida de seguridad, no una subasta), y la garantía de que no se pierde nada (cap 06, cap 09)
ya mitiga buena parte del daño que esa regla busca evitar. Aun así, un corte inesperado genera la ansiedad que cap 01
existe para evitar, avisado o no.

Se propone agregar un tercer texto, previo al de cap 09, sin modificar los dos ya cerrados:

**"Seguís ahí? En unos minutos te vamos a pedir que vuelvas a entrar."**

Transitorio, mismo tratamiento que los avisos de cap 09 (sin ✓, con anuncio de lector de pantalla que no interrumpe).
Esto es una extensión propuesta a cap 09, no una decisión tomada — queda para tu confirmación antes de loguearla en
00-STATE.md.

## Qué no resuelve este capítulo (delegado)
- Valores exactos de contraste (ratios numéricos) y tamaño mínimo de objetivos táctiles → cap 11, Responsive
  Philosophy, y cap 12, Design System
- Tokens visuales de foco (color, grosor de borde) → cap 12, Design System

## Aplicación concreta a Saldo
- Todo estado transitorio de cap 09 se anuncia una vez a lectores de pantalla, sin depender de cuánto dure visible
- Confirmaciones no interrumpen; avisos si requieren atención, sí se hacen notar
- Los dos botones del Paso A son igual de alcanzables por teclado, no solo iguales visualmente
- Deshacer, edición en el lugar y selectores de cap 07 funcionan sin mouse
- Ningún estado se comunica solo con color
- El texto de "¿Dónde estoy?" de cap 07 es el título accesible real de cada pantalla

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Resuelve lo delegado por cap 09?** Sí. Evidencia: sección 1 completa, distinción confirmaciones/avisos
      extendida a lector de pantalla sin agregar categoría nueva.
- [ ] **¿Aplica accesibilidad a elementos ya definidos, sin rediseñar?** Sí. Evidencia: secciones 2, 3 y 4 citan cap
      06, cap 07, cap 08 y cap 09 explícitamente, sin proponer pantallas o copy nuevos (salvo la propuesta marcada
      como pendiente).
- [ ] **¿La excepción de cap 03 regla 2 (Paso A) se mantiene también en teclado?** Sí, con precisión: la excepción es
      sobre jerarquía visual, no sobre alcance por teclado — ambos caminos deben ser igual de accesibles sin mouse,
      sin excepción ahí.
- [ ] **¿Algún estado depende solo del color?** No. Evidencia: sección 3, regla explícita citando el ✓ de cap 09 como
      ejemplo ya conforme.
- [ ] **¿Se aplican decisiones de persona con cita?** Sí, con honestidad. Evidencia: nota explícita de que ninguna
      persona tiene discapacidad documentada; Rosa se cita en "Deshacer" por su miedo a perder información (cap 02),
      no por una necesidad de accesibilidad inventada.
- [ ] **¿Invade cap 11 o cap 12?** No. Evidencia: sección "Qué no resuelve este capítulo" delega valores numéricos y
      tokens visuales explícitamente.
- [ ] **Contradicciones abiertas detectadas:** ninguna nueva. Una propuesta pendiente (aviso previo a expiración de
      sesión) queda marcada como tal, no como decisión tomada.
