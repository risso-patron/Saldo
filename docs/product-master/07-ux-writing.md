# 07 - UX Writing

Este capítulo se escribe releyendo completos los capítulos 01 a 06. A diferencia de 05 y 06, acá no hay estructura
nueva que diseñar — hay trabajo pendiente concreto que quedó delegado explícitamente por capítulos anteriores. Este
capítulo lo cierra con texto final, no con ejemplos.

## Reglas heredadas (no se redefinen acá, se aplican)
- Cap 04, reglas de expresión: *"Si un texto puede decirse en 6 palabras, no lo hagas en 12"* y *"si el usuario
  necesita adivinar, el diseño perdió"*
- Cap 04, vocabulario prohibido (línea 17): Analytics, Insights, Planning, Import AI, OCR, CSV, JSON — ninguno de estos
  puede aparecer en el copy de este capítulo
- Cap 03, regla 1: *"Si Rosa duda, el diseño todavía no está listo"* — cada texto de este capítulo se escribe pensando
  primero en Rosa, no en el usuario más avanzado

## 1) Nombre final para "hallazgo IA" (cap 05, etapa 8)
Cap 05 dejó "una idea sobre tu plata" como ejemplo de lenguaje permitido, sin cerrarlo. Queda cerrado así:

**Texto final: "Una idea sobre tu plata"**

Cita, cap 03, regla 7: *"La IA nunca es protagonista. La IA acompaña, sugiere y traduce."* "Una idea" es deliberadamente
chico y de bajo perfil — no "Descubrimos que...", no "Análisis de tus gastos". Es una frase, no un título de sección.

## 2) Texto simple para "onboarding" (cap 06)
Cap 06 sugirió "primeros pasos" sin cerrarlo. Queda cerrado así:

**Texto final: "Primeros pasos"**

Nota de alcance: con el esqueleto de 3 pasos de cap 06 (A/B/C), este texto casi nunca necesita aparecer en pantalla —
el onboarding es demasiado breve para requerir un indicador de progreso con nombre. Queda definido para el único caso
donde podría hacer falta: una etiqueta accesible para lectores de pantalla en el indicador de paso (ej. "Primeros
pasos, paso 2 de 3"), nunca como título visible permanente.

## 3) Copy final del onboarding (cap 06, Paso A / B / C)

### Paso A — Confirmar el porqué
- Mensaje principal: **"Vamos a ver cuánto entró, cuánto salió y cuánto te queda. Empecemos con un movimiento real."**
- Botón principal: **"Vamos"**
- Botón saltear (mismo peso visual, al lado — cap 06: *"saltear no puede sentirse como una opción escondida o
  penalizada"*): **"Ir directo"**

### Paso B — Primera acción guiada
- Título: **"Cargá tu primer movimiento"**
- Ayuda breve (una sola línea, solo si no se saltó el Paso A): **"Puede ser algo que ya tenías anotado en otro lado."**
- Selector de tipo: **"¿Es un ingreso o un gasto?"** — opciones **"Ingreso"** / **"Gasto"**
- Si el usuario eligió en el Registro que separa personal de negocio (cap 05, etapa 2 — nota de persona José): un
  campo más, nunca repreguntado de otra forma: **"¿Es tu plata o la plata del negocio?"** — opciones **"Tu plata"** /
  **"La plata del negocio"** (vocabulario permitido, cap 04, líneas 33-34, textual). Este campo no aparece si el
  usuario eligió "Solo mi plata" en el Registro.
- Botón: **"Guardar"**

### Paso C — Confirmación y entrada al Inicio
Cap 06 ya estableció que no es una pantalla nueva. El único texto que se agrega es una línea que aparece una sola vez,
arriba del trío de cifras de cap 01 (nunca reemplazándolo ni redefiniéndolo):
- **"Ahí tenés. Así se ve tu plata."**

Esta línea se muestra una única vez, en la primera visita al Inicio después del onboarding, y no vuelve a aparecer.

## 4) Las 4 preguntas de cap 04 aplicadas a cada pantalla real
Cap 04 exige que cada pantalla responda, sin esfuerzo, cuatro preguntas (líneas 6-9). Acá se resuelve el texto real
para las 12 etapas ya definidas en cap 05 — no son las únicas pantallas de Saldo, pero son el inventario concreto que
el documento tiene hasta ahora.

| Etapa (cap 05) | ¿Dónde estoy? | ¿Qué puedo hacer? | ¿Qué pasa si aprieto esto? | ¿Qué gano haciendo esto? |
|---|---|---|---|---|
| 1. Landing | "Saldo" | "Empezar" | "Vas a crear tu cuenta en un minuto" | "Vas a saber cuánto tenés, hoy" |
| 2. Registro | "Creá tu cuenta" | "Crear cuenta" | "Podés cambiar esto después" | "Ya podés cargar tus movimientos" |
| 3. Onboarding | ver Paso A/B/C arriba | ver Paso A/B/C arriba | ver Paso A/B/C arriba | ver Paso A/B/C arriba |
| 4. Primer ingreso | "Cargá un ingreso" | "Guardar" | "Se suma a tu Inicio ahora mismo" | "Vas a ver cuánto entró, hoy" |
| 5. Primer gasto | "Cargá un gasto" | "Guardar" | "Se resta de tu Inicio, sin vueltas" | "Vas a ver cuánto te queda, hoy" |
| 6. Primer gráfico | "Cómo se mueve tu plata"¹ | "Cambiar cómo lo agrupás" | "Vas a ver el mismo período, ordenado distinto" | "Vas a entender de un vistazo en qué se te fue" |
| 7. Primer presupuesto | "Tu presupuesto" | "Definir un límite" | "Te avisamos antes de que lo pases, no después"⁴ | "Vas a saber si el mes viene ajustado, con tiempo" |
| 8. Primer hallazgo IA | "Una idea sobre tu plata" | "Ver más" (opcional) | "Te mostramos de dónde sale esta idea" | "Vas a ver algo que capaz no habías notado" |
| 9. Primer objetivo | "Tu meta" | "Crear una meta" | "Vas a ver cuánto te falta, siempre a la vista" | "Vas a tener algo concreto por qué ahorrar" |
| 10. Primer mes cerrado | "Así te fue este mes" | "Entendido" | "Arranca el mes que viene, con lo que aprendiste" | "Vas a cerrar el mes sabiendo, no adivinando" |
| 11. Primer reporte | "Descargá tus movimientos"² | "Descargar" | "Baja un archivo con lo mismo que estás viendo" | "Vas a poder llevarte tus números a donde los necesites" |
| 12. Cliente recurrente | trío de cifras de cap 01³ | "+ Agregar movimiento" | "Se guarda al toque, después lo podés editar" | "Vas a mantener esto tan claro como el primer día" |

¹ Para Luis, cuando agrupa por cliente/origen, "¿Dónde estoy?" se responde con la frase ya acuñada en cap 03/04, textual:
**"Cómo te está yendo con tus clientes"** — no es una frase nueva, es la misma reutilizada en este punto exacto del
recorrido.

² Nunca "Exportar CSV" ni "Descargar PDF" — cap 05, etapa 11, nota de vocabulario: el formato técnico no puede ser el
nombre visible.

³ No es un título nuevo — es literalmente cap 01, línea 42: *"cuánto entró, cuánto salió y cuánto queda hoy"*. Esta
pantalla no tiene "¿Dónde estoy?" propio porque es el Inicio mismo, no una pantalla nueva del recorrido.

⁴ Aplicación textual de la señal anticipatoria definida para Ana y José, cap 05, etapa 7, nota de persona: *"este es el
primer punto del recorrido donde corresponde mostrar una señal anticipatoria en vez de solo un tope numérico — por
ejemplo, avisar que el mes viene más ajustado que otros, antes de que el límite se cruce"*. No es una frase nueva: es
esa decisión convertida en copy real.

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Aparece vocabulario prohibido de cap 04 en algún copy de este capítulo?** No. Evidencia: se revisaron los 12
      renglones de la tabla y el copy de onboarding; el caso de mayor riesgo (etapa 11, formato de archivo) se resuelve
      explícitamente sin nombrar CSV/PDF.
- [ ] **¿"hallazgo IA" y "onboarding" quedan con texto final, no ejemplo?** Sí. Evidencia: secciones 1 y 2, ambas
      marcadas "Texto final", no "por ejemplo".
- [ ] **¿El copy de onboarding contradice la estructura de cap 06?** No. Evidencia: Paso A/B/C de este capítulo sigue
      exactamente el esqueleto aprobado (confirmar salteable / acción guiada / empalme con Inicio), sin agregar un
      cuarto paso ni una pantalla de cierre nueva.
- [ ] **¿Cada pantalla responde las 4 preguntas de cap 04?** Sí. Evidencia: tabla completa, 12 de 12 etapas con las 4
      columnas resueltas (etapa 3 remite a la sección de onboarding para no duplicar texto).
- [ ] **¿Se redefine el trío de cifras de cap 01?** No. Evidencia: etapa 12 cita textual cap 01 línea 42 en vez de
      inventar un título nuevo para el Inicio.
- [ ] **¿Se aplican las decisiones de persona con cita?** Sí. Evidencia: José en el copy del Paso B (campo
      personal/negocio, condicionado a su elección en el Registro); Luis en la nota¹ de la etapa 6, reutilizando la
      frase exacta de cap 03/04.
- [ ] **Contradicciones abiertas detectadas:** ninguna.
