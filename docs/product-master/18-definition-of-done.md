# 18 - Definition of Done

Este capítulo se escribe releyendo completos los capítulos 01 a 17. Convierte los 10 criterios de la propuesta
original en una checklist verificable — cada uno con cita a un capítulo específico, no una reformulación genérica de
"buenas prácticas". El objetivo es que cualquier pantalla o función futura de Saldo pueda pasar por estos 10 puntos
y decir, con evidencia, si está terminada.

## Los 10 criterios, con cita de origen

**1. Funciona.** Hace lo que dice que hace, sin depender de que el usuario adivine (cap 03, regla 1). No es un
criterio de UX exclusivamente, pero sin él ningún otro criterio importa — una pantalla accesible que hace lo
incorrecto sigue sin estar terminada.

**2. Es responsive.** Cumple la regla del pulgar de cap 11: objetivo táctil mínimo 44×44px, elementos frecuentes en
zona fácil, ningún reflow decorativo (cap 08, principio rector, aplicado al layout en cap 11).

**3. Tiene accesibilidad.** WCAG 2.2 AA (cap 10): contraste 4.5:1 texto / 3:1 componentes (cap 12), foco visible con
el rol Interactivo (cap 12, corregido en vivo), ningún estado solo con color, alcanzable por teclado.

**4. Tiene microcopy.** Responde las 4 preguntas de cap 04 (¿dónde estoy? ¿qué puedo hacer? ¿qué pasa si aprieto
esto? ¿qué gano haciendo esto?), en vocabulario permitido, sin las palabras prohibidas de cap 04, línea 17. Sigue las
reglas de expresión de cap 04 (breve, sin adivinanzas).

**5. Tiene feedback.** Si la acción lo justifica, usa un estado ya definido en cap 09 (confirmación o aviso), con
los tokens de color/ícono/duración de cap 12 — nunca un mecanismo de feedback inventado para esa pantalla en
particular.

**6. Tiene tests.** No en el sentido de código — en el sentido que cap 17 ya estableció: simulación real de la
etapa para al menos una persona concreta, citando contra qué se verificó, no un repaso abstracto de reglas. Si cap 17
encontró 3 hallazgos reales simulando en vez de repasar, cualquier función nueva merece el mismo método antes de
darse por terminada.

**7. Rosa la entiende.** Cita literal, 00-STATE.md, notas de continuidad: *"Regla de oro operativa: ¿Rosa entendería
esto sin preguntarle a nadie?"* Este criterio ya tenía nombre propio antes de este capítulo — es, de hecho, la
semilla de cap 20 (La Regla de Oro), todavía no escrito. Acá se usa como uno de los diez, no se desarrolla más.

**8. Luis la usa.** No alcanza con que Luis pueda usarla — tiene que preferirla a no usarla. Cap 02: *"Qué espera de
Saldo: respuestas rápidas para decidir hoy, no un reporte eterno"*. Si la función le hace perder tiempo operativo o
no respeta su necesidad de agrupar por cliente/origen (cap 05, etapa 6), no pasa este criterio aunque técnicamente
"funcione" para él.

**9. La IA puede explicarla.** Si hay un número o una función que la IA (cap 15) no puede describir en una frase de
vocabulario permitido, sin hablar difícil y sin responder de más (cap 15, sección 3), es señal de que la función no
tiene un propósito lo bastante claro — cap 03, regla 3: *"todo número responde una pregunta"*. Si no se puede
explicar simple, probablemente no responde una pregunta real todavía.

**10. No genera ansiedad.** El filtro final, por encima de los otros nueve. Cap 01, principio emocional base: *"cada
interacción debe responder una pregunta silenciosa del usuario: ¿Estoy mejor que hace un momento?"* Una función puede
cumplir los otros 9 criterios y seguir sin pasar este — en ese caso, no está terminada, está pendiente de rediseño.

## Ejemplo aplicado: "Primer hallazgo IA" (cap 05, etapa 8) contra los 10 criterios
Para probar que esta checklist es verificable y no solo una lista de buenas intenciones, se aplica a la etapa que
cap 17 acaba de corregir — es la más reciente y la que más capítulos toca a la vez.

1. **Funciona** — sí: tiene contenido real en V1 (observación sobre el primer movimiento) y en V2 (señal semanal),
   sin depender de un dato que no existe (cap 15, sección 0 y 1).
2. **Es responsive** — sí: se integra al flujo, no es pantalla propia (cap 05, etapa 8, objetivo visual); no se
   definió como elemento de tamaño fijo, hereda el sistema de cap 11.
3. **Tiene accesibilidad** — sí: es un "hallazgo IA" (cap 05/07), que sigue las reglas de aviso/confirmación de
   cap 10, sección 1 (anuncio de lector de pantalla que no interrumpe).
4. **Tiene microcopy** — sí: *"Una idea sobre tu plata"* (cap 07) más el texto específico de V1 o V2 (cap 15),
   ambos dentro de las 6 palabras que cap 04 pide como techo razonable.
5. **Tiene feedback** — sí: usa el rol Positivo/tokens de cap 12 ya asignados a "hallazgo IA" en la tabla de
   iconografía.
6. **Tiene tests** — sí, literalmente: cap 17 lo simuló para Rosa y Luis y encontró que fallaba (Hallazgo 2) antes
   de corregirlo — es el caso de uso real de este criterio, no un ejemplo hipotético.
7. **Rosa la entiende** — sí: el texto de V1 (*"Este es tu primer gasto en [categoría]..."*) no requiere que sepa
   qué es una predicción o un patrón — describe algo que ya hizo.
8. **Luis la usa** — sí, con matiz: en V1 es la misma observación simple que Rosa; en V2, cap 15 no definió
   contenido específico para Luis (solo Ana/José) — sigue siendo el mismo hueco que cap 17 dejó marcado como
   ambigüedad menor para gamificación, aplicado acá a un caso distinto. No bloquea el criterio (Luis sí tiene V1),
   pero es honesto marcarlo: su V2 todavía no tiene contenido propio, más allá de heredar el de V1 indefinidamente.
9. **La IA puede explicarla** — sí: cap 15, sección 3, ya exige que cualquier señal se explique en una frase sin
   jerga — la etapa 8 completa cumple esa regla por diseño, no por excepción.
10. **No genera ansiedad** — sí: cap 15 excluye explícitamente lenguaje predictivo o alarmante ("no finge un patrón
    que los datos todavía no permiten"), y cap 03 regla 7 mantiene a la IA fuera de un rol de protagonista o juez.

## Cómo usar este capítulo
Para cualquier pantalla o función nueva de Saldo, antes de darla por terminada: correr los 10 criterios citando
evidencia concreta contra un capítulo, no marcar tildes sin respaldo — mismo estándar de estos 18 capítulos. Si un
criterio no tiene cita posible, es señal de que falta definición en algún capítulo anterior, no de que el criterio
no aplica.

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Los 10 criterios tienen cita de origen, no una reformulación genérica?** Sí. Evidencia: cada uno de los 10
      cita un capítulo y, en la mayoría, una frase textual.
- [ ] **¿Se demuestra que la checklist es verificable en la práctica, no solo teórica?** Sí. Evidencia: sección de
      ejemplo aplicado, 10 de 10 criterios evaluados contra un caso real (cap 05, etapa 8), incluida una honestidad
      explícita en el criterio 8 (hueco de contenido V2 para Luis, no escondido).
- [ ] **¿"Rosa la entiende" se desarrolla de más, invadiendo cap 20?** No. Evidencia: se usa la cita ya existente de
      00-STATE.md y se marca explícitamente como semilla de cap 20, sin desarrollar el concepto más de lo necesario
      acá.
- [ ] **¿Algún criterio contradice una regla ya fijada en 01-17?** No. Evidencia: los 10 criterios son síntesis de
      reglas existentes (cap 01, 03, 04, 09, 10, 11, 12, 15, 17), ninguno introduce un principio nuevo no derivado.
- [ ] **Contradicciones abiertas detectadas:** ninguna.
