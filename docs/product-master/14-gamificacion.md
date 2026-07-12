# 14 - Gamificación

Este capítulo se escribe releyendo completos los capítulos 01 a 13. Hereda de cap 13 una regla obligatoria (no una
sugerencia) y cuatro mecanismos ya rechazados que no se reintroducen sin volver a discutirlos acá. Después de la
corrección que el usuario pidió en cap 13, este capítulo separa cita textual de inferencia en cada afirmación, no
solo en la sección de personas.

## Filtro heredado de cap 13 (no se redefine)
- Regla obligatoria: *"ningún streak puede tener mecanismo de vergüenza al romperse... un streak roto en Saldo tiene
  que sentirse, como máximo, neutro"* (00-STATE.md, decisión fundacional de cap 13).
- Cuatro mecanismos rechazados, no reintroducibles sin discusión: urgencia artificial, culpa para reenganchar,
  streaks con vergüenza, felicitación por acciones rutinarias.
- Cap 08: *"toda microinteracción responde una función... nunca es decorativa"* — este capítulo es, de todo el
  documento, el que más presión decorativa va a sentir (confetti, medallas, sonidos) sin que nada de eso pase el
  filtro por sí solo.

## 1) Reconocimiento de hitos reales (no acciones rutinarias)
Cap 13, punto 3, ya fijó el principio: *"felicitar poco y en el momento correcto vale más que felicitar seguido"*,
reservado para cap 05, etapa 9 (Primer objetivo cumplido) y etapa 10 (Primer mes cerrado). Este capítulo resuelve la
mecánica que cap 13 delegó:

- El reconocimiento de un hito **no reusa el mismo patrón visual que las confirmaciones rutinarias de cap 09** (✓
  Guardado, etc.) — mezclar ambos vaciaría la distinción que cap 13 pidió explícitamente. Tiene más presencia en
  pantalla que un toast, pero sigue sin ser un modal bloqueante (cap 09: *"ninguno es un modal"*, principio que se
  mantiene también para hitos grandes, no solo para los rutinarios).
- El texto cita el número real del hito (cuánto ahorró, qué meta cumplió), nunca un genérico "¡Felicidades!" sin
  contenido — cap 04, reglas de expresión: *"si un texto puede decirse en 6 palabras, no lo hagas en 12"*, y cap 03,
  regla 3: *"todo número responde una pregunta"* — un hito sin el número real es la misma falla que un ✓ decorativo.
- Usa los tokens ya definidos en cap 12 (rol Positivo, duración con nombre) — no se inventa un color o una animación
  nueva para "que se sienta especial". Sentirse especial viene de la rareza (una vez al mes, no todos los días), no
  de un efecto visual nuevo.

## 2) Constancia sin castigo (resuelve la regla obligatoria de cap 13)
Un streak clásico (racha de días consecutivos que se reinicia a cero al romperse) es, por diseño, un mecanismo de
pérdida — cap 13 ya lo marcó como el de mayor riesgo del documento. Este capítulo no intenta suavizar un streak
clásico con mejor copy: **propone reemplazarlo** por una señal de constancia sin punto de ruptura.

En vez de "llevás 12 días seguidos" (que se rompe y vuelve a 0), una ventana móvil: **"cargaste movimientos 12 de los
últimos 14 días"**. No hay un número que vuelva a cero — un mal día simplemente baja el número uno, no lo destruye.
Esto no es una interpretación más suave de la regla de cap 13: es una mecánica distinta que no tiene el momento de
ruptura que la regla existe para prevenir. Resuelve directamente el riesgo que cap 13 marcó para Ana (uso
interrumpible por diseño, cap 06) y Luis (prioriza velocidad, cap 02) sin necesitar una excepción para ninguno de
los dos.

## 3) Logros: solo los que cap 05 ya definió
Tres de cuatro logros de este capítulo mapean 1 a 1 a una etapa ya cerrada de cap 05, sin inventar hitos para tener
más contenido de gamificación. El cuarto necesita una aclaración honesta:

| Logro | Etapa de origen (cap 05) |
|---|---|
| Primer movimiento cargado | Etapa 4/5 (Primer ingreso / Primer gasto), cierre del onboarding (cap 06/07) |
| Primer mes cerrado | Etapa 10 |
| Primer objetivo cumplido | Etapa 9 |
| Primer presupuesto sostenido | Etapa 7, con un criterio nuevo no presente ahí (ver abajo) |

**"Primer presupuesto sostenido" no es un mapeo directo.** Cap 05, etapa 7, define *crear* un primer presupuesto — no
dice nada sobre mantenerlo en el tiempo. "Sostenido" es un criterio que este capítulo introduce, y queda
explícitamente sin definición numérica: ¿cuántos períodos seguidos cuentan como "sostenido"? ¿con qué tolerancia (un
gasto que lo pasa por poco un día, cuenta como ruptura)? Mismo patrón que cap 05 usó para las señales anticipatorias
de Ana y José (*"la profundidad de esta señal... se define en los capítulos 15 y 16"*): la definición numérica exacta
de "sostenido" queda delegada a cap 15 (IA) o cap 16 (Roadmap UX), no resuelta acá.

Cuatro logros, no una lista abierta — un sistema de logros que crece sin límite se vuelve ruido (cap 03, regla 4: *"no
mostrar información sin valor todavía"*), y cada logro nuevo que no venga de una etapa ya definida sería exactamente
el tipo de decisión sin justificación que cap 08 prohíbe.

## 4) Qué NO hacer
**Heredado de cap 13, no reabierto:**
- Urgencia artificial, culpa para reenganchar, streaks con vergüenza, felicitación por acciones rutinarias.

**Nuevo en este capítulo, con justificación propia:**
- **Comparación social o tabla de posiciones:** Saldo maneja información financiera personal. Cap 01 ya establece que
  Saldo no es *"una app que castiga errores del usuario"* — una tabla que compara el ahorro o el gasto de un usuario
  contra otros introduce una fuente de vergüenza que ningún capítulo anterior pidió y que cap 01 existe para evitar.
  Se descarta.
- **Sistema de puntos o moneda virtual paralela:** cap 03, regla 3, exige que todo número responda una pregunta real
  (cuánto entró, cuánto salió, etc.). Puntos que no representan plata real no responden ninguna de esas preguntas —
  son un segundo sistema numérico compitiendo con el único que cap 01 quiere que el usuario entienda en menos de 10
  segundos. Se descarta.

## 5) Cómo motivar sin generar ansiedad (síntesis)
No hay una técnica nueva acá — es la combinación de lo que 13 y este capítulo ya resolvieron: celebrar poco y con
número real (punto 1), medir constancia sin punto de ruptura (punto 2), reconocer solo hitos ya definidos en el
recorrido (punto 3), y no introducir comparación social ni una economía paralela de puntos (punto 4).

## Aplicación por persona (cita separada de inferencia)
- **Rosa:** cap 02, cita exacta: *"Qué nunca haría: configurar reglas avanzadas o estudiar un tutorial largo"*. Que
  ninguno de los 4 logros ni la señal de constancia requiera configuración es un hecho de diseño de este capítulo,
  no algo que cap 02 describa — la cita solo establece qué evitar. Conectar ambas cosas (cero configuración cumple lo
  que Rosa nunca haría) es una inferencia de este capítulo, aplicada de forma directa sobre la cita, no una extensión
  forzada como en otros casos de cap 13.
- **Luis:** cap 02, cita exacta: *"Qué espera de Saldo: respuestas rápidas para decidir hoy, no un reporte eterno"*.
  Que el reconocimiento de hitos (punto 1) no interrumpa su flujo de carga rápida (cap 06, Paso B) es una inferencia
  directa de esa cita — no hay un texto previo sobre gamificación para Luis.
- **Ana:** cap 02, cita exacta: *"Tiempo disponible: 5 a 10 minutos por bloque, en distintos momentos del día"*. Cap
  13 ya usó esta misma cita para marcar el riesgo de un streak clásico para Ana — eso sí viene citado. Que la ventana
  móvil de este capítulo (punto 2) sea la solución a ese riesgo específico es una inferencia nueva de cap 14: cap 13
  identificó el problema, no propuso este mecanismo ni ningún otro.
- **José:** cap 02, cita exacta: *"Objetivos: ver salud diaria del negocio y detectar desvíos temprano"*. Que el
  logro "Primer presupuesto sostenido" conecte con esa cita (seguimiento continuo, no puntual) es una inferencia de
  este capítulo — y una parcial, dado que "sostenido" todavía no tiene definición numérica (ver punto 3). No se
  repite acá la comparación entre personas que cap 13 marcó como inferencia sin respaldo — este capítulo no afirma
  que le importe más a José que al resto.

## Qué no resuelve este capítulo (delegado)
- Cuándo se lanza gamificación dentro del roadmap general del producto → cap 16, Roadmap UX
- Especificación visual exacta de la pantalla de reconocimiento de hitos (más allá de "reusa los tokens de cap 12,
  no inventa nuevos") → implementación, no este documento

## Aplicación concreta a Saldo
- 4 logros: 3 mapeados directo a etapas de cap 05, 1 ("sostenido") con criterio nuevo delegado a cap 15/16 con
  definición numérica pendiente — ninguno inventado sin trazabilidad
- La constancia se mide en ventana móvil (12 de los últimos 14 días), nunca como racha que vuelve a cero
- El reconocimiento de hitos usa los tokens de cap 12 sin inventar color o animación nueva
- Sin comparación social, sin sistema de puntos paralelo

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Respeta la regla obligatoria de cap 13 (sin streak con vergüenza)?** Sí, y no solo por cumplimiento mínimo:
      el punto 2 reemplaza el mecanismo de raíz en vez de suavizar el copy de un streak clásico.
- [ ] **¿Reintroduce alguno de los 4 mecanismos ya rechazados?** No. Evidencia: sección 4, listados explícitamente
      como heredados, no reabiertos.
- [ ] **¿Los logros son hitos nuevos o ya existentes?** 3 de 4 ya existentes en cap 05; el cuarto ("sostenido")
      introduce un criterio nuevo, marcado explícitamente como tal y delegado a cap 15/16 con definición numérica
      pendiente — no presentado como si ya viniera resuelto de cap 05.
- [ ] **¿Algo es decorativo sin función citada?** No. Evidencia: punto 1 cita cap 04/03 para el texto del
      reconocimiento; ningún color o animación nuevos, reusa cap 12.
- [ ] **¿Se aplican decisiones de persona con cita exacta separada de inferencia?** Sí. Evidencia: los 4 párrafos de
      "Aplicación por persona" citan textual de cap 02 y marcan explícitamente qué es cita y qué es inferencia,
      mismo estándar que cap 13 corrigió.
- [ ] **¿Se agregan rechazos nuevos con justificación propia, no solo heredada?** Sí. Evidencia: sección 4,
      comparación social y sistema de puntos, cada uno con cita a un capítulo distinto (cap 01 y cap 03
      respectivamente).
- [ ] **Contradicciones abiertas detectadas:** ninguna.
