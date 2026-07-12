# 19 - Anti-Patterns

Este capítulo se escribe releyendo completos los capítulos 01 a 18. La propuesta original lista 8 anti-patrones
base. En vez de repetirlos como lista suelta, cada uno se conecta acá con la decisión específica que ya lo prohíbe o
resuelve — y donde la revisión mostró que la resolución era solo parcial, se completa en vez de fingir que ya estaba
cerrada.

## Los 8 anti-patrones de la propuesta original

**1. Gráficos vacíos — parcialmente resuelto, completado acá.** Cap 05 (el onboarding fuerza cargar un movimiento
antes de llegar a "Primer gráfico", etapa 6) reduce el caso más obvio, y cap 03, regla 4 (*"no mostrar información
sin valor todavía"*), da el principio. Pero ningún capítulo definía qué reemplaza a un gráfico sin datos en uso
recurrente (ej. filtrar un período sin movimientos). Se completa con el patrón de la sección siguiente.

**2. Tarjetas sin datos — mismo caso que 1, mismo patrón de resolución.** Cap 03, regla 6 (*"toda pantalla explica
por qué existe"*), exige que hasta una tarjeta vacía tenga que justificar su existencia — pero tampoco había un
patrón concreto.

**Patrón de estado vacío (nuevo, resuelve 1 y 2):** cuando una tarjeta, gráfico o lista no tiene datos para el
contexto activo, se reemplaza por un mensaje breve que explica por qué (*"Todavía no cargaste presupuestos"*, *"Sin
movimientos en este período"*) y, cuando corresponde, la misma acción de cap 07, etapa 12 (*"+ Agregar
movimiento"*) — nunca un espacio vacío sin explicación, que es indistinguible de un error. Aplica cap 08 (la función
acá es orientar, no decorar — nada de ilustraciones elaboradas sin propósito) y cap 03, regla 6.

**3. Métricas incomprensibles — ya resuelto, sin completar.** Cap 03, regla 3 (*"todo número responde una
pregunta"*), cap 04 (las 4 preguntas de orientación) y cap 07 (copy real que las responde para las 12 etapas de
cap 05). Ningún número del documento existe sin una pregunta que responda.

**4. IA usada por marketing, no por utilidad — ya resuelto.** Cap 03, regla 7 (*"la IA nunca es protagonista...
no se impone, no complica"*), y cap 15, filtro heredado, que rechaza cualquier mecanismo de IA que "empuje" en vez
de ayudar. La IA de Saldo no tiene una sección propia para lucirse — aparece integrada, cap 05 etapa 8.

**5. Nombres técnicos — ya resuelto.** Cap 04, vocabulario prohibido (Analytics, Insights, Planning, Import AI, OCR,
CSV, JSON) y permitido, aplicado sin excepción en 05-18 — incluida la propia etapa "hallazgo IA" (no "insight IA",
cap 05) y "Primeros pasos" (no "onboarding", cap 07) como ejemplos de la regla funcionando puertas adentro del mismo
documento.

**6. Ocultar acciones importantes — ya resuelto.** Cap 11: *"ninguna acción de la zona fácil se esconde en un menú
colapsado 'para verse más limpio' si eso contradice cap 03 regla 1"*. La acción principal, cap 07 etapa 12, vive en
la zona de pulgar por diseño, no en un menú.

**7. Doble confirmación innecesaria — ya resuelto.** Cap 08, "Borrar": *"en vez de un modal de confirmación previo
(que obliga a pensar antes de poder actuar, cap 03 regla 1), se borra al toque y se ofrece deshacer por una ventana
breve de tiempo"*. Es, textualmente, el ejemplo que la propuesta original nombra.

**8. Modales infinitos — ya resuelto.** Cap 09: *"ninguno es un modal"*, aplicado a los 8 estados de feedback; cap 06,
Paso C: el mensaje de bienvenida se retira solo, nunca bloquea. Ninguna pantalla del documento usa un modal como
mecanismo de confirmación o feedback.

## Anti-patrones nuevos, no nombrados en la propuesta original

**9. Streak con castigo al romperse.** Cap 13 lo identificó como el mecanismo de mayor riesgo del documento; cap 14
lo resolvió reemplazándolo por una ventana móvil sin punto de ruptura, no suavizando el copy de un streak clásico.

**10. Comparación social entre usuarios / tabla de posiciones.** Cap 14: fuente de vergüenza que cap 01 existe para
evitar — Saldo no compara a un usuario contra otros, solo contra su propio historial (cap 15, señales
anticipatorias).

**11. Economía paralela de puntos o moneda virtual.** Cap 14, citando cap 03 regla 3: un número que no representa
plata real no responde ninguna pregunta real, compite con el único sistema numérico que importa.

**12. IA narrando su propio proceso en vez de servir al usuario.** Distinto del anti-patrón 4 (IA como adorno de
marketing): acá el problema es que la IA hable de sí misma ("terminé de analizar...") en vez de hablarle al usuario
de su plata. Cap 09 lo nombró y lo rechazó explícitamente ("IA terminó"), y quedó logueado en 00-STATE.md para no
reintroducirse sin discutirlo de nuevo.

**13. Elemento de interfaz mostrado sin condición de datos reales.** Encontrado en cap 17, Hallazgo 1: el selector de
agrupación por cliente aparecía para cualquier persona, tuviera o no un segundo origen de ingreso. Se resolvió
condicionando su aparición a datos reales, no a una persona asignada — el anti-patrón general es mostrar un control
que no tiene nada que controlar todavía.

**14. Etapa temprana del recorrido sin contenido válido en V1.** Encontrado en cap 17, Hallazgo 2: "Primer hallazgo
IA" estaba ubicado temprano en cap 05, pero su único contenido definido exigía 4 semanas de historial. El anti-patrón
general: nombrar y ubicar una etapa del recorrido antes de garantizar que tiene algo real que mostrar en el momento
en que el nombre promete.

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Los 8 anti-patrones originales están conectados a una resolución específica, no repetidos como lista
      suelta?** Sí. Evidencia: cada uno cita el capítulo y, en la mayoría, la frase textual que lo resuelve.
- [ ] **¿Se detectó alguna resolución incompleta en vez de asumir que los 8 ya estaban cerrados?** Sí. Evidencia:
      anti-patrones 1 y 2 (gráficos y tarjetas vacías) tenían solo el principio (cap 03 regla 4/6) sin patrón
      concreto — completado con el patrón de estado vacío en esta misma sección, no dado por resuelto sin más.
- [ ] **¿Los anti-patrones nuevos vienen de hallazgos reales de 01-18, no inventados para completar una lista?** Sí.
      Evidencia: 6 de 6 citan un capítulo y una decisión concreta (cap 13/14 para 9-11, cap 09 para 12, cap 17 para
      13-14) — dos de ellos (13-14) son, literalmente, los mismos hallazgos que cap 17 ya documentó, formalizados
      acá como patrón general reutilizable.
- [ ] **¿El patrón de estado vacío nuevo es decorativo o funcional?** Funcional. Evidencia: cita cap 08 (nada
      decorativo) explícitamente al proponerlo, y reutiliza el CTA ya existente de cap 07 en vez de inventar uno.
- [ ] **Contradicciones abiertas detectadas:** ninguna.
