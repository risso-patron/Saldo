# 11 - Responsive Philosophy

Este capítulo se escribe releyendo completos los capítulos 01 a 10. Cap 10 delegó explícitamente acá el *"tamaño
mínimo de objetivos táctiles"* — se resuelve primero. Los ratios numéricos de contraste, también delegados por cap
10, quedan para cap 12 (Design System), donde vive el resto de la paleta.

## Por qué mobile-first no es una preferencia técnica
Ninguna persona de cap 02 se describe usando Saldo en un escritorio. Al contrario: sus ventanas de tiempo son,
literalmente, momentos de teléfono en la mano. Rosa dispone de *"10 a 15 minutos al día"*; Ana, *"5 a 10 minutos por
bloque, en distintos momentos del día"*; José, *"10 minutos antes de abrir y 10 minutos al cerrar"*. Ninguno de esos
patrones describe a alguien sentado frente a una computadora — describen a alguien revisando el teléfono entre otras
cosas. Mobile-first en Saldo no es una decisión de arquitectura de software: es la traducción directa de cómo cap 02
ya describió a estas cuatro personas.

## La regla del pulgar (una mano)
Todo el recorrido de cap 05, el copy de cap 07 y las microinteracciones de cap 08 se reparten en tres zonas según qué
tan fácil es alcanzarlas con el pulgar en un uso de una sola mano:

- **Zona fácil (inferior, alcance directo del pulgar):** la acción principal de cap 07, etapa 12 (*"+ Agregar
  movimiento"*), la navegación principal, y "Deshacer" (cap 08/09, *"Se borró. Deshacer"*). Este último no es
  arbitrario: cap 08 ya definió una ventana de tiempo corta para deshacer, y cap 10 ya exigió que esa ventana alcance
  para completarse por teclado — acá se agrega la condición equivalente en touch: si el botón de deshacer no está en
  la zona fácil, la ventana de tiempo se acorta en la práctica para cualquiera que use el teléfono con una mano.
- **Zona media (alcanzable estirando el pulgar, no ideal para acción frecuente):** contenido de lectura — el gráfico
  de cap 05 etapa 6, el estado del presupuesto de etapa 7, el "hallazgo IA" de etapa 8. Se leen más de lo que se
  tocan, así que no compiten por la zona fácil.
- **Zona difícil (arriba, requiere cambiar de agarre):** el título de pantalla que responde "¿Dónde estoy?" (cap 07,
  cerrado como título accesible real en cap 10) y acciones poco frecuentes (cerrar sesión, configuración). Que estén
  arriba no es un descuido — es correcto: cap 03 regla 4 dice que lo que no ayuda a decidir hoy no compite por el
  espacio más valioso, y el título de pantalla se lee, no se toca repetidamente.

## Tamaño mínimo de objetivos táctiles (delegado por cap 10, resuelto acá)
WCAG 2.2 AA fija un piso legal de 24×24px CSS para cualquier objetivo táctil. Saldo no se queda en el piso legal: fija
**44×44px como mínimo operativo** para todo botón definido hasta ahora (Vamos / Ir directo de cap 06-07, Guardar,
Deshacer, + Agregar movimiento). La justificación no es estética: cap 02 describe el miedo central de Rosa como
*"equivocarse en números"* — un objetivo táctil chico aumenta directamente el riesgo de tocar mal, que es exactamente
lo que ella teme. 24px cumple la ley; 44px cumple la misión de cap 01.

**Espaciado entre objetivos adyacentes:** el Paso A del onboarding (cap 06, excepción documentada a cap 03 regla 2)
tiene dos botones de igual peso, uno al lado del otro. Acá se agrega la condición que faltaba: tienen que tener
espacio suficiente entre sí para no generar un toque accidental del botón equivocado. El riesgo real es bajo (ambos
llevan al mismo resultado funcional, "avanzar" — ya establecido en cap 03/06), pero el espaciado se define igual,
porque un mistoque que sí genera fricción en cualquier par de botones futuro con resultados distintos no puede
depender de que alguien se acuerde de este caso particular.

## Principio rector de cap 08 aplicado al layout
Cap 08: *"Toda microinteracción responde una función — confirmar, orientar o tranquilizar — nunca es decorativa."*
Extendido a layout responsive:
- Ningún reflow o transición de tamaño de pantalla se anima "porque se ve prolijo" — solo si ayuda a que el usuario
  entienda que sigue en el mismo lugar.
- Ninguna acción de la zona fácil (arriba) se esconde en un menú colapsado "para verse más limpio" si eso contradice
  cap 03 regla 1 (Rosa no puede dudar dónde está la acción). Ocultar información en un menú es una decisión de
  arquitectura de información, no una decisión estética — y tiene que justificarse igual que cualquier otra.

## Aplicación por persona
- **José:** sus 10 minutos antes de abrir y 10 al cerrar (cap 02) son, con altísima probabilidad, con el teléfono en
  una mano mientras hace otra cosa. La zona fácil no es una mejora para él — es la diferencia entre que use Saldo en
  esos minutos o no.
- **Ana:** sus bloques de 5 a 10 minutos "en distintos momentos del día" (cap 02) describen exactamente el patrón de
  uso de una mano, interrumpible, que este capítulo diseña. Conecta directo con la decisión fundacional de cap 06
  (onboarding interrumpible) — la misma lógica aplica a cualquier pantalla, no solo al onboarding.
- **Rosa:** el mínimo de 44px y el espaciado entre objetivos responden directamente a su miedo de cap 02
  ("equivocarse en números, perder información") trasladado a touch: menos mistoques, menos motivos para dudar.
- **Luis:** cap 02 no lo describe con las mismas restricciones de tiempo en bloques — su necesidad es rapidez, no
  alcance de pulgar. Igual se beneficia de la zona fácil (menos pasos para llegar a cargar un movimiento rápido,
  cap 06 Paso B), pero no es el caso que más presiona este capítulo.

## Qué no resuelve este capítulo (delegado a cap 12, Design System)
- Breakpoints exactos en píxeles
- Ratios numéricos de contraste (delegado ya desde cap 10)
- Tokens visuales de espaciado exacto (más allá del principio de "suficiente para evitar mistoque" fijado acá)

## Aplicación concreta a Saldo
- La acción principal, la navegación y "Deshacer" viven en la zona fácil del pulgar, no arriba
- Ningún botón definido hasta ahora mide menos de 44×44px
- El Paso A del onboarding mantiene sus dos botones de igual peso, ahora con espaciado explícito entre ellos
- Ninguna animación de layout es decorativa; ninguna acción clave se esconde en un menú por estética

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Resuelve el tamaño táctil delegado por cap 10?** Sí. Evidencia: mínimo de 44×44px fijado y justificado contra
      el mínimo legal de WCAG (24×24px), citando el miedo de Rosa (cap 02).
- [ ] **¿Deja los ratios de contraste para cap 12?** Sí. Evidencia: sección "Qué no resuelve este capítulo", explícita.
- [ ] **¿Aplica la regla de pulgar sobre elementos ya definidos, sin inventar pantallas?** Sí. Evidencia: zona fácil,
      media y difícil citan elementos concretos de cap 05, 07, 08 y 09 — ningún elemento nuevo.
- [ ] **¿Aplica el principio rector de cap 08 al layout?** Sí. Evidencia: sección dedicada, sin animación decorativa
      de reflow ni ocultamiento estético de acciones clave.
- [ ] **¿Resuelve el espaciado que faltaba en la excepción de cap 03/06 (Paso A)?** Sí. Evidencia: sección de tamaño
      táctil, párrafo de espaciado entre objetivos adyacentes.
- [ ] **¿Se aplican decisiones de persona con cita?** Sí. Evidencia: José y Ana citados por sus ventanas de tiempo
      (cap 02); Rosa por su miedo a equivocarse; Luis explícitamente marcado como el caso que menos presiona este
      capítulo, sin inventarle una necesidad que cap 02 no describe.
- [ ] **Contradicciones abiertas detectadas:** ninguna.
