# 08 - Microinteracciones

Este capítulo se escribe releyendo completos los capítulos 01 a 07. Ninguno de esos capítulos definió todavía cómo se
*mueve* Saldo — solo qué dice y qué estructura tiene. Cap 06 dejó dos piezas explícitamente pendientes para acá: *"las
transiciones y animaciones entre pasos [del onboarding]"*. Se resuelven primero, y después se cubre el resto del
recorrido de cap 05.

## Principio rector de este capítulo (nuevo — se propone como decisión fundacional al cerrar)
Ningún capítulo anterior fijó una regla sobre animación. Se deriva una, en línea directa con lo ya establecido:
cap 01 (misión: disminuir ansiedad financiera) y cap 03, regla 4 (*"no mostrar información sin valor todavía"*),
extendida a movimiento:

**Toda microinteracción responde una función — confirmar, orientar o tranquilizar — nunca es decorativa.**

Si una animación no cumple una de esas tres funciones, no se agrega, sin importar cuánto "pula" la interfaz.

## 1) Transiciones del onboarding (cap 06 — resuelto acá)

### Paso A → Paso B
Al tocar "Vamos" o "Ir directo" (cap 07), la transición tiene que sentirse como *avanzar*, no como recargar. Un
desplazamiento simple, corto (200-250ms aprox.), sin rebote ni efectos llamativos. Nunca un ícono de carga en este
punto — no hay nada que cargar todavía, y mostrar uno sugeriría lo contrario.

### Paso B → Paso C
Al tocar "Guardar", no hay salto a una pantalla nueva — el formulario se resuelve en el mismo lugar donde aparece el
Inicio, y el número recién cargado entra reflejado ahí. Esto no es una preferencia visual: es la aplicación directa de
la nota de continuidad de cap 05, etapa 4: *"cargar el primer ingreso debe verse reflejado ahí mismo, sin ir a otra
pantalla a 'confirmar'"*. La transición confirma (función 1 del principio rector): el usuario tiene que *ver* que su
movimiento ya está contado, no que tiene que creerlo.

La línea de cap 07 ("Ahí tenés. Así se ve tu plata.") entra con un fundido breve y se retira sola — por tiempo o al
primer toque en cualquier otro lado. Nunca un modal que bloquee: bloquear acá contradice la función de tranquilizar
(principio rector) convirtiendo un mensaje de bienvenida en un obstáculo.

### Reingreso tras interrupción
Cap 06 fijó que el onboarding debe soportar interrupción y retomado a mitad del Paso B sin reiniciar (00-STATE.md,
decisión fundacional con costo técnico). La microinteracción de reingreso es deliberadamente sin ceremonia: directo al
Paso B, con lo que ya estaba completado, sin animación de "bienvenida de nuevo". Cualquier transición vistosa acá se
sentiría como fricción, no como bienvenida — para alguien que volvió a mitad de algo, lo que tranquiliza es no notar
que hubo una interrupción.

## 2) Microinteracciones del recorrido completo (cap 05)

### Guardar
Feedback inmediato y local: el dato aparece en el lugar correcto (lista, Inicio) al instante, sin esperar
confirmación del servidor antes de mostrarlo. Si la sincronización de fondo falla después, se corrige de forma
discreta, nunca revirtiendo de golpe sin avisar — revertir sin explicar generaría exactamente la ansiedad que cap 01
existe para evitar.

### Borrar
Nunca inmediato e irreversible sin salida. En vez de un modal de confirmación previo (que obliga a pensar antes de
poder actuar, cap 03 regla 1), se borra al toque y se ofrece deshacer por una ventana breve de tiempo.
- **Nota de persona (Rosa):** cap 02 marca su miedo central: *"equivocarse en números, perder información"*. El
  deshacer con ventana de tiempo es, para ella, más tranquilizador que un modal — un modal pide una decisión bajo
  presión antes de actuar; deshacer permite corregir después de ver el resultado, sin haber tenido que decidir bien a
  la primera.

### Editar
Edición en el lugar, cuando es posible: tocar un monto lo vuelve editable ahí mismo, en vez de abrir una pantalla
nueva. Menos pasos, menos "salir y volver" — coherente con cap 03, regla 2 (*"una pantalla = una acción principal"*):
editar sigue siendo la misma pantalla, no una nueva.

### Sincronizar
Invisible cuando funciona. Sin indicador de "sincronizando…" permanente — un ícono parpadeando todo el tiempo genera
la pregunta silenciosa *"¿se está guardando bien?"*, que es exactamente la ansiedad que cap 01 busca bajar. Solo se
hace visible cuando hay un problema real que el usuario necesita saber.
- **Nota de persona (José):** cap 02 describe su ventana de uso como *"10 minutos antes de abrir y 10 minutos al
  cerrar"* — no tiene margen para quedarse dudando si algo sincronizó. Sincronización invisible cuando todo va bien es,
  para él, directamente tiempo operativo recuperado.

### Cargar
Nunca una pantalla vacía con un ícono de carga genérico en puntos clave (Inicio). Se muestra la última información
conocida mientras llega la nueva, para que el usuario nunca vea una pantalla en blanco que sugiera *"¿perdí mis
datos?"* — un vacío momentáneo ahí contradice directamente la visión de cap 01 (responder en menos de 10 segundos).

### Fallo de internet (mecánica — el copy exacto se resuelve en cap 09)
La mecánica se resuelve acá, el texto no: sin conexión, el usuario sigue viendo los datos que ya tenía cargados —
nunca una pantalla bloqueada. Lo que estaba haciendo (por ejemplo, a mitad de cargar un movimiento) no se pierde;
se guarda localmente y se reintenta solo cuando vuelve la conexión, sin que el usuario tenga que repetir la acción.
Mismo principio de cap 01 aplicado acá: *"Mensajes de error: tono humano, sin culpa, con salida clara"* — el texto
final de ese mensaje es trabajo de cap 09, Sistema de Feedback.

### Expirar sesión (mecánica — el copy exacto se resuelve en cap 09)
Nunca se ve como un error o un castigo. Si el usuario estaba a mitad de cargar un movimiento cuando la sesión expira,
ese estado se guarda localmente antes de pedir que vuelva a entrar — es la misma decisión fundacional de cap 06
(persistencia de estado a mitad de formulario), extendida de "cierre de la app" a "expiración de sesión". No son dos
mecánicas distintas: es la misma garantía, con un disparador distinto.

## Qué no resuelve este capítulo (delegado a capítulos siguientes)
- El texto exacto de los mensajes de fallo de internet y expiración de sesión → cap 09, Sistema de Feedback
- La taxonomía completa de estados (éxito, alerta, error, vacío) más allá de los casos ya cubiertos acá → cap 09
- Duración exacta en milisegundos y curvas de animación específicas por plataforma → cap 12, Design System

## Aplicación concreta a Saldo
- Ninguna transición dura más de lo necesario para cumplir su función (confirmar, orientar o tranquilizar)
- Guardar y editar se sienten inmediatos; borrar se resuelve con deshacer, no con confirmación previa
- Sincronizar es invisible cuando funciona; solo se hace notar cuando hay algo real que resolver
- La app nunca muestra una pantalla vacía en un punto clave mientras carga — se ve lo último conocido
- Interrupciones (cierre de la app, expiración de sesión) nunca hacen perder lo que el usuario ya había hecho

## Checklist de cierre (evidencia, no tildes)
- [ ] **¿Resuelve lo delegado explícitamente por cap 06?** Sí. Evidencia: sección 1 completa (Paso A→B, B→C, reingreso
      tras interrupción), citando la nota de continuidad de cap 05 etapa 4 y la decisión fundacional de cap 06.
- [ ] **¿Cubre el recorrido completo de cap 05, no solo el onboarding?** Sí. Evidencia: guardar, borrar, editar,
      sincronizar, cargar, fallo de internet y expirar sesión, los 7 casos pedidos, cada uno resuelto.
- [ ] **¿Alguna microinteracción es decorativa sin función?** No. Evidencia: principio rector explícito al inicio del
      capítulo, y cada mecánica se justifica citando una de las tres funciones (confirmar/orientar/tranquilizar).
- [ ] **¿Se aplican decisiones de persona con cita?** Sí. Evidencia: Rosa en "Borrar" (cita cap 02, miedo a perder
      información); José en "Sincronizar" (cita cap 02, ventana de 10 minutos).
- [ ] **¿Invade el territorio de cap 09 (copy) o cap 12 (design tokens)?** No. Evidencia: "Fallo de internet" y
      "Expirar sesión" resuelven mecánica, no texto; sección "Qué no resuelve este capítulo" delega explícitamente.
- [ ] **Decisión nueva a registrar en 00-STATE.md al cerrar:** el principio rector de este capítulo (*"toda
      microinteracción responde una función — confirmar, orientar o tranquilizar — nunca es decorativa"*) no existía
      en capítulos anteriores; se propone como decisión fundacional, no solo como regla local de este capítulo.
- [ ] **Contradicciones abiertas detectadas:** ninguna.
