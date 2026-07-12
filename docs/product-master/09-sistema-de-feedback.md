# 09 - Sistema de Feedback

Este capítulo se escribe releyendo completos los capítulos 01 a 08. Tiene tres piezas de trabajo pendiente delegado
explícitamente: el texto exacto de fallo de internet y expiración de sesión (cap 08), la taxonomía completa de
estados de feedback (de la propuesta original), y la aplicación estricta del principio rector de cap 08 a cada uno.

## Principio aplicado a cada estado (cap 08, no se redefine)
Cap 08: *"Toda microinteracción responde una función — confirmar, orientar o tranquilizar — nunca es decorativa."*
Este capítulo trata cada ✓ de la taxonomía original como candidato, no como decisión tomada. Si un estado no pasa el
filtro, se corta o se reescribe — igual que el documento ya descartó ideas antes cuando no pasaban un filtro
equivalente.

## Reglas transversales del sistema de feedback (nuevas — se proponen como decisión fundacional al cerrar)
- Todo estado de esta taxonomía es transitorio: aparece y se retira solo, nunca requiere que el usuario lo cierre
  (mismo patrón que la línea de cierre del onboarding, cap 07/08).
- Ninguno es un modal.
- Un solo símbolo, ✓, para toda confirmación positiva — la consistencia visual reduce carga cognitiva (cap 03,
  regla 1).
- Nunca se apilan dos estados a la vez. Si dos ocurren casi juntos, se funden en uno solo o se secuencian — apilarlos
  sería ruido visual (cap 03, regla 4: *"no mostrar información sin valor todavía"*).
- Los avisos (fallo de internet, sesión expirada) son una familia distinta de las confirmaciones: no llevan ✓, porque
  no confirman algo que salió bien — orientan sobre algo que el usuario necesita saber, sin culpa.

## 1) Confirmaciones

### ✓ Guardado
Se mantiene, con alcance acotado. Cap 08 ya estableció que guardar un movimiento se confirma con el número apareciendo
en el lugar correcto al instante — esa aparición ya es la confirmación funcional. El ✓ "Guardado" solo se agrega
cuando el lugar donde se guardó no es visible en el momento de guardar (por ejemplo, carga rápida desde una pantalla
que se cierra sola). Si el usuario ya está viendo el número cambiar en pantalla, no se agrega un ✓ encima — sería
decorativo, y el principio rector de cap 08 lo descarta.

### ✓ Sincronizado
Se mantiene, con una condición estricta: solo aparece como resolución de un aviso de "sin conexión" previamente
visible (ver sección 2). Cap 08 ya fijó que la sincronización de rutina es invisible cuando funciona bien — mostrar
"✓ Sincronizado" todo el tiempo contradiría eso directamente. Este ✓ existe para cerrar el círculo que abrió un aviso,
no para narrar cada sincronización de fondo.

### ✓ Presupuesto actualizado
Se mantiene, acotado a edición de un presupuesto ya existente (no a la creación del primer presupuesto, que ya tiene
su propio momento en cap 05 etapa 7 / cap 07). Cumple función de tranquilizar: cap 05 etapa 7 pide que el presupuesto
se sienta como ayuda, no restricción, y confirmar el cambio con un ✓ breve refuerza que el límite está trabajando
para el usuario, no vigilándolo.

### "✓ IA terminó" — descartado
No se agrega. Este estado narra un proceso del sistema ("la IA hizo algo"), no un beneficio para el usuario — y eso
contradice dos reglas ya establecidas: cap 03, regla 7 (*"la IA nunca es protagonista"*) y el principio rector de
cap 08 (la función tiene que ser confirmar, orientar o tranquilizar *al usuario*, no reportar el estado interno del
sistema). La aparición misma de "Una idea sobre tu plata" (cap 07) ya es el evento de feedback — no hace falta
anunciar antes que la IA "terminó" de generarla. Agregar este ✓ sería, además, el tipo exacto de protagonismo de IA
que cap 03 prohíbe.

### ✓ Movimiento eliminado
Se mantiene, con el texto ya anticipado en cap 08: **"Se borró. Deshacer"**. No es una confirmación pasiva — es la
superficie misma de la mecánica de deshacer que cap 08 definió para "Borrar" (ventana breve de tiempo, sin modal de
confirmación previo). El ✓ y la acción de deshacer viven en el mismo lugar, no en dos pasos separados.

### ✓ Recuperado
Se mantiene. Es el cierre del círculo que abre "Se borró. Deshacer": al tocar deshacer, el sistema confirma
**"Recuperado"**. Cumple función de tranquilizar de forma directa — especialmente para Rosa, cuyo miedo central (cap
02) es *"perder información"*: este ✓ es la prueba de que no perdió nada, incluso después de haber tocado borrar.

## 2) Avisos (no llevan ✓ — orientan, no confirman)

### Fallo de internet
Mecánica ya resuelta en cap 08 (sigue viendo lo que tenía, no bloquea, guarda localmente y reintenta solo). Texto
final:

**"No tenés conexión. Guardamos esto acá y lo subimos en cuanto vuelva."**

Aparece como aviso chico, no bloqueante (cap 08: *"nunca una pantalla bloqueada"*). Cuando vuelve la conexión y se
sube lo pendiente, se resuelve con el ✓ "Sincronizado" de la sección 1 — el aviso y la confirmación son las dos mitades
de la misma historia, nunca aparecen sueltas.

### Expirar sesión
Mecánica ya resuelta en cap 08 (si había algo a mitad de cargar, se guarda antes de pedir reingreso — misma decisión
fundacional de cap 06, extendida). Texto final:

**"Pasó un rato. Volvé a entrar para seguir."**
Botón: **"Entrar de nuevo"**

Si había un movimiento a mitad de cargar, se agrega una segunda línea, porque es el momento de mayor ansiedad
potencial de todo este sistema y necesita tranquilizar explícitamente, no solo orientar:

**"Lo que estabas cargando lo guardamos."**

Ninguna de las dos líneas usa la palabra "sesión" como excusa técnica ni "expiró por seguridad" — cap 01: *"Mensajes
de error: tono humano, sin culpa, con salida clara"*, y expirar sesión no es un error del usuario.

## Qué no resuelve este capítulo (delegado a capítulos siguientes)
- Color, iconografía exacta y duración en pantalla de cada estado → cap 12, Design System (aplicando el principio
  rector de cap 08, que ya es decisión fundacional)
- Cómo se ve cada estado en accesibilidad (anuncios de lector de pantalla, contraste) → cap 10, Accesibilidad

## Aplicación concreta a Saldo
- Cinco confirmaciones activas (Guardado acotado, Sincronizado acotado, Presupuesto actualizado, Movimiento eliminado,
  Recuperado); una descartada explícitamente ("IA terminó") con justificación registrada, no simplemente omitida
- Dos avisos con texto final cerrado (fallo de internet, expiración de sesión), ambos sin culpa y con salida clara
- Ningún estado de este sistema es un modal ni requiere que el usuario lo cierre a mano
- Aviso y confirmación de sincronización están explícitamente atados como una sola historia, no dos eventos sueltos

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Resuelve el texto delegado por cap 08?** Sí. Evidencia: sección 2 completa, fallo de internet y expiración
      de sesión con texto final, no mecánica repetida.
- [ ] **¿Cubre la taxonomía completa de la propuesta original?** Sí, con una excepción justificada. Evidencia: 6 de 6
      estados evaluados; 5 mantenidos con alcance acotado, 1 ("IA terminó") descartado con cita a cap 03 regla 7 y al
      principio rector de cap 08 — no se cortó en silencio, quedó documentado por qué.
- [ ] **¿Se aplicó el principio rector de cap 08 a cada estado, no solo en general?** Sí. Evidencia: cada uno de los 6
      estados tiene su propia justificación de función (confirmar/orientar/tranquilizar) o su propio rechazo
      justificado — no hay ningún ✓ sin argumento.
- [ ] **¿Algún estado se apila o bloquea?** No. Evidencia: regla transversal explícita ("nunca se apilan dos estados a
      la vez") y ninguno de los 8 estados definidos (6 confirmaciones + 2 avisos) es modal.
- [ ] **¿Se aplican decisiones de persona con cita?** Sí. Evidencia: Rosa en "✓ Recuperado" (cita cap 02, miedo a
      perder información).
- [ ] **¿Invade el territorio de cap 10 o cap 12?** No. Evidencia: sección "Qué no resuelve este capítulo" delega
      explícitamente color/iconografía/duración (cap 12) y accesibilidad (cap 10).
- [ ] **Contradicciones abiertas detectadas:** ninguna.
