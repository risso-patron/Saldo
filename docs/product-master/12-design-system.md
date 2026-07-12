# 12 - Design System

Este capítulo se escribe releyendo completos los capítulos 01 a 11. Es el que más trabajo delegado explícito
acumula — cuatro piezas, de cuatro capítulos distintos, todas citadas por origen — y el de mayor riesgo de que algo se
agregue "porque queda lindo" sin una función real detrás. Cap 08 ya dejó la regla que gobierna todo este capítulo:
*"Toda microinteracción responde una función — confirmar, orientar o tranquilizar — nunca es decorativa."* Acá se
extiende de microinteracción a cada token visual: color, espacio, sombra, tipografía. Si un valor no se puede
justificar contra algo ya definido en 01-11, no entra.

## Alcance: sistema de roles, no paleta de marca
Este capítulo resuelve los **roles y las reglas numéricas** que los capítulos anteriores dejaron pendientes
(contraste, duración, foco, iconografía de estado). No fija una paleta de marca con valores hexadecimales exactos —
elegir un color de marca específico es una decisión de identidad visual que ningún capítulo anterior tomó, y
fabricarla acá sin ese trabajo previo sería exactamente el tipo de decisión sin justificación que cap 08 prohíbe.
Cada rol de color se define por su función; el valor exacto es una decisión de implementación posterior, con estas
reglas como restricción obligatoria.

## 1) Color — roles y contraste (delegado por cap 10, cap 11)
Roles, no nombres de color:
- **Texto principal** sobre fondo: mínimo 4.5:1 de contraste (WCAG 2.2 AA, texto normal)
- **Texto grande / componentes de interfaz** (títulos, iconografía funcional, borde de campos): mínimo 3:1
- **Positivo** (el ✓ de cap 09): un solo rol semántico, reutilizado en las 5 confirmaciones activas — cap 09 ya fijó
  "un solo símbolo para toda confirmación positiva"; acá se fija que también comparten un solo rol de color, no cinco
  variantes
- **Atención** (avisos de cap 09: fallo de internet, aviso previo a expiración, expiración): un rol distinto del
  positivo, pero deliberadamente **no rojo de alerta agresiva** — cap 01 exige *"tono humano, sin culpa"*, y un rojo
  de error clásico comunica falla del usuario antes de que se lea una palabra. Más cercano a un tono neutro-informativo
  que a una advertencia.
- **Interactivo** (nuevo — ningún capítulo anterior lo había nombrado): rol para elementos que invitan a la acción,
  no que reportan un estado. Cubre el énfasis de los botones principales (Vamos, Guardar, + Agregar movimiento) y,
  como se resuelve en la sección 7, el anillo de foco de teclado. Se separa de Positivo (algo ya se confirmó) y de
  Atención (algo necesita mirarse) porque significa algo distinto: "esto se puede tocar/activar ahora".
- Regla ya fundacional (cap 10): ningún estado se comunica solo con color — todo rol de color va acompañado de forma
  o ícono.

## 2) Tipografía
- Las tres cifras del Inicio (cap 01, línea 42) son el elemento tipográfico más grande y con más peso de toda la
  interfaz — más que cualquier título de pantalla. Es la aplicación visual directa de la visión de cap 01 (responder
  en menos de 10 segundos): lo primero que el ojo encuentra tiene que ser la respuesta, no el encabezado.
- El título de pantalla (cap 07, cerrado como título accesible en cap 10) es la segunda jerarquía.
- Sin tipografía display ni ornamental — cap 04, *"lenguaje humano por encima de naming técnico"*, aplicado también a
  la forma de las letras: clara, sin adorno, en cualquier peso.

## 3) Espacio
- Escala basada en una unidad simple (no se fija el valor exacto en px de la unidad base — eso es implementación),
  con un piso ya numérico fijado por cap 11: mínimo 8px entre dos objetivos táctiles adyacentes, para evitar el
  mistoque que cap 11 dejó señalado sin número (Paso A del onboarding, dos botones de igual peso).
- El espacio ordena jerarquía, no decora — cap 03, regla 1: si dos elementos están muy cerca, Rosa puede leerlos como
  relacionados cuando no lo están, y eso ya es "hacerla dudar".

## 4) Sombra
Uso mínimo y funcional: una sombra solo se agrega para comunicar que un elemento flota sobre otro con una razón real
(por ejemplo, el botón principal de cap 07 etapa 12 sobre el contenido que se desplaza detrás). Ninguna tarjeta plana
de contenido (presupuesto, gráfico) lleva sombra decorativa — cap 08, principio rector, aplicado literalmente:
sombra sin función de elevación real no se agrega.

## 5) Animación — duración y curvas (delegado por cap 08)
Cap 08 ya dio un rango para la transición de onboarding (200-250ms, sin rebote). Se formaliza en dos duraciones con
nombre, no más:
- **Rápida (~150ms):** aparición/retiro de confirmaciones de cap 09 (✓ Guardado, ✓ Sincronizado, etc.) — eventos
  frecuentes, tienen que sentirse inmediatos, no ceremoniosos.
- **Estándar (~200-250ms):** transiciones de pantalla completa (Paso A→B, B→C de cap 06/08) — el rango que cap 08 ya
  fijó, sin cambiarlo.
- No existe una duración "lenta": cap 01 (bajar ansiedad) no se beneficia de ninguna animación que haga esperar al
  usuario más de un cuarto de segundo para ver el resultado de lo que hizo.
- Curva: entradas con desaceleración (el elemento llega y se asienta — sensación de calma); salidas con aceleración
  (el elemento se va y no reclama atención). Cap 08 ya prohibió explícitamente el rebote ("sin rebote ni efectos
  llamativos") — se mantiene sin excepción en todo el sistema, no solo en el onboarding.

## 6) Iconografía de los estados de cap 09 (delegado por cap 09)
| Estado | Rol de color | Ícono | Duración en pantalla |
|---|---|---|---|
| ✓ Guardado | Positivo | ✓ | Rápida (~150ms entrada, se retira sola ~2-3s) |
| ✓ Sincronizado | Positivo | ✓ | Rápida, igual que Guardado |
| ✓ Presupuesto actualizado | Positivo | ✓ | Rápida, igual que Guardado |
| ✓ Movimiento eliminado | Positivo | ✓ + acción "Deshacer" | Extendida (~5-6s) — tiene que dar tiempo real a decidir y tocar deshacer (cap 11: la ventana debe alcanzar para completarse por teclado y touch, no solo un clic de mouse) |
| ✓ Recuperado | Positivo | ✓ | Rápida, igual que Guardado |
| Fallo de internet | Atención | ícono neutro (no alerta roja) | Persiste mientras dura la desconexión — no tiene duración fija, se retira cuando aparece ✓ Sincronizado (cap 09 ya ató estos dos como una sola historia) |
| Aviso previo a expiración | Atención | mismo ícono neutro que fallo de internet | Persiste hasta que el usuario interactúa o hasta que expira de verdad — no es un toast de segundos |
| Expirar sesión (posterior) | Atención | mismo ícono neutro | Persiste hasta que el usuario vuelve a entrar — requiere acción, no se retira sola |

Los tres avisos comparten un solo ícono ("atención neutra"), igual que las cinco confirmaciones comparten un solo ✓ —
misma lógica de cap 09 aplicada a los dos únicos íconos de todo el sistema de feedback.

## 7) Foco — color y grosor (delegado por cap 10)
Primera versión de este capítulo reusaba el rol "Atención" para el foco. Quedó revisado: el foco aparece en
**cada** Tab, en navegación completamente neutra — reusar el color de "algo necesita tu atención" ahí lo convertiría
en ruido constante (aparece todo el tiempo, sin problema real detrás) y diluiría la señal el día que sí haya un aviso
real. Contradice directamente la misión de cap 01 (bajar ansiedad, no generar alertas falsas todo el tiempo).

No existía tampoco, hasta este capítulo, un rol de "acción principal interactiva" para reusar — los botones definidos
en 05-11 (Vamos, Guardar, + Agregar movimiento) nunca tuvieron un rol de color asignado, solo texto, tamaño y
posición. Se resuelve así: se define el rol **Interactivo** (sección 1) para ambos casos a la vez — énfasis de
botones principales y anillo de foco. Conceptualmente son la misma idea ("esto es interactivo, acá podés actuar"),
no dos usos distintos forzados a compartir color.

- Grosor: 2px mínimo, visible en cualquier fondo definido por la regla de contraste de la sección 1.
- Color: rol Interactivo, no Atención ni Positivo.
- Contraste del contorno de foco contra el fondo inmediato: mismo mínimo de 3:1 de la sección 1 (componentes de
  interfaz).

## 8) Componentes (síntesis de lo ya definido, no piezas nuevas)
Este capítulo no inventa componentes — nombra los que ya existen implícitos en 05-11 y les asigna los tokens de
arriba:
- **Botón primario / secundario de igual peso:** el botón principal usa el rol Interactivo (sección 7) para su
  énfasis. El caso de cap 06 Paso A (excepción a cap 03 regla 2) es el único patrón de "dos botones iguales" del
  sistema — cualquier otro par de botones por defecto necesita jerarquía visual clara (uno primario con rol
  Interactivo, uno secundario sin él), no repetir la excepción sin la misma condición (cap 03: "no usar como
  precedente general").
- **Campo de formulario:** foco visible (sección 7), objetivo táctil 44×44px (cap 11), agrupado como
  radiogroup real cuando corresponde (cap 10, selectores de cap 07).
- **Toast de confirmación / aviso:** los ocho estados de la tabla de la sección 6, con su duración y color ya
  asignados — transitorio, nunca modal (cap 09), zona de aparición coherente con la zona de pulgar (cap 11: algo que
  confirma una acción de la zona fácil aparece cerca de esa zona, no arriba).
- **Encabezado de pantalla:** el texto de "¿Dónde estoy?" de cap 07, tipografía de segunda jerarquía (sección 2),
  título accesible real (cap 10).

## Qué no resuelve este capítulo
- Valores hexadecimales exactos de marca — decisión de identidad visual, no tomada por ningún capítulo anterior;
  este capítulo deja los roles y las reglas de contraste como restricción obligatoria para cuando esa decisión se
  tome
- Breakpoints exactos en píxeles (ya delegado desde cap 11)
- Unidad base exacta del sistema de espacio (se fija solo el piso de 8px entre objetivos táctiles adyacentes)

## Aplicación concreta a Saldo
- Ningún color, sombra o animación de este sistema existe sin una función citada de un capítulo anterior
- Las cifras del Inicio son, tipográficamente, lo más grande de toda la interfaz — antes que cualquier título
- Confirmaciones y avisos comparten un solo ícono cada uno; ningún estado nuevo se inventa un ícono propio sin razón
- El foco reusa el rol Interactivo (el mismo de los botones principales), nunca el de Atención — evita ruido de
  "alerta" en cada Tab y evita diluir la señal de Atención para cuando sí hay un aviso real
- "Deshacer" dura en pantalla lo suficiente para completarse por teclado y por touch, no solo por mouse

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Resuelve los 4 pendientes delegados, citando origen?** Sí. Evidencia: contraste (sección 1, cap 10/11),
      duración y curvas (sección 5, cap 08), color/iconografía/duración de feedback (sección 6, cap 09), foco
      (sección 7, cap 10) — cada uno con cita explícita al capítulo que lo delegó.
- [ ] **¿Cubre colores, espacios, sombras, animaciones, iconografía, tipografía, estados, tokens y componentes?** Sí,
      con alcance explícito: roles y reglas numéricas, no paleta de marca — justificado en la sección "Alcance".
- [ ] **¿Algún valor de este capítulo es decorativo, sin función citada?** No verificado ninguno. Evidencia: cada
      sección cita el capítulo y la regla que justifica el valor (ej. sombra solo para elevación real, sección 4;
      sin duración "lenta", sección 5).
- [ ] **¿Se mantiene "ningún estado solo con color" (cap 10)?** Sí. Evidencia: sección 1, regla explícita; sección 6,
      cada estado tiene ícono además de color.
- [ ] **¿Se aplican decisiones de persona con cita?** Indirectamente, vía las reglas que ya las citaron (cap 09 →
      Rosa en "Movimiento eliminado"/deshacer, cap 11 → Rosa en objetivos táctiles) — este capítulo no repite las
      citas, hereda los valores ya justificados.
- [ ] **Contradicciones abiertas detectadas:** ninguna.
