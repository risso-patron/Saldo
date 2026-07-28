# 21 - Principios de Monetización

Este capítulo se escribe releyendo el capítulo 01, sección "Filosofía Free/Pro" — no la repite, la opera. Hereda de
ahí una regla obligatoria, no una sugerencia: la versión gratuita cumple la promesa completa del producto; la
versión Pro amplía, acelera y profundiza, nunca repara una experiencia incompleta.

## Principios obligatorios

### 1) Nunca vender miedo
Ninguna comunicación de Saldo genera temor para motivar una compra. La ansiedad financiera es el problema que Saldo
existe para resolver (cap 01) — nunca una herramienta de venta.

### 2) Nunca ocultar información
El usuario Free ve su situación financiera completa, sin datos parciales ni cifras incompletas que lo empujen a
pagar para "ver el resto".

### 3) Nunca mentir con proyecciones
Ninguna proyección, alerta o estimación exagera un riesgo para presionar una decisión de compra. Si Saldo proyecta
algo, es porque es real y verificable — no un recurso de persuasión.

### 4) Nunca castigar al usuario Free
Ninguna función gratuita empeora, se vuelve más lenta o más incómoda de usar como estrategia para incentivar el
upgrade. La versión Free no es una versión deliberadamente degradada.

### 5) La versión Free debe cumplir la promesa del producto
La promesa definida en el capítulo 01 debe cumplirse íntegramente para cualquier usuario. La versión Pro amplía la
experiencia, nunca corrige una experiencia incompleta.

### 6) La versión Pro debe sentirse como una evolución natural, no como una obligación
Pro sirve a quien quiere ir más rápido, más profundo o automatizar — no a quien necesita lo básico para no sentir
ansiedad. Si un usuario Free siente que "necesita" Pro para estar tranquilo, el principio ya se rompió.

### 7) Toda decisión de monetización debe poder explicarse honestamente
Si una función pertenece al plan Pro, debemos poder explicar con honestidad por qué aporta un valor adicional al
usuario. Si la única explicación es "para vender más", entonces probablemente esa decisión está en el lugar
equivocado.

### 8) Ningún paywall debe aparecer en un momento de máxima ansiedad financiera
El momento en que un usuario más necesita claridad y calma no puede ser el mismo momento en que se le presenta un
muro de pago. Un gate de plan nunca interrumpe una crisis financiera del usuario.

### 9) Toda invitación a Pro debe sentirse como una ayuda, nunca como presión comercial
El tono de cualquier invitación a upgrade es el mismo tono que el resto de Saldo: calma, directo, sin urgencia
artificial ni comparación social.

### 10) Toda limitación debe ser honesta
Si una función pertenece al plan Pro, el usuario debe saber exactamente por qué. Nunca ocultamos funciones, nunca
simulamos restricciones y nunca utilizamos límites artificiales para manipular una compra.

## Qué nunca monetizamos

Estas capacidades son las líneas rojas del producto — nunca se limitan, degradan ni condicionan a un plan superior,
porque son la promesa misma de Saldo (cap 01, "Filosofía Free/Pro"):

- Comprender su economía: ver su situación financiera real, sin datos ocultos ni parciales.
- Registrar ingresos y gastos: sin límite de cantidad, sin límite de tiempo, sin fricción agregada a propósito.
- Conocer en qué gasta: categorización y visibilidad básica de patrones de gasto.
- Organizar su dinero: toda persona debe poder planificar su economía. Las herramientas avanzadas podrán pertenecer
  a Pro, pero nunca la posibilidad de organizarse.
- Disminuir su ansiedad financiera: ningún mecanismo de producto — incluida la monetización misma — puede
  incrementarla.

## Filosofía comercial: Lifetime, Trial y cancelación

### Lifetime no significa todo de por vida

La IA es el corazón de Saldo Pro y representa un costo operativo que crece con el tiempo y con el
uso, no un costo fijo. Comprometerla de por vida a cambio de un único pago pondría en riesgo la
sostenibilidad del producto y, eventualmente, obligaría a romper alguno de los principios de este
capítulo para sobrevivir como negocio.

Lifetime da acceso de por vida a todas las funciones cuyo costo operativo sea sostenible en un
modelo de pago único. Las capacidades que impliquen un costo recurrente para Saldo podrán requerir
un modelo comercial diferente. La implementación concreta se decidirá cuando corresponda.

El acceso que otorga Lifetime y el estado operativo de un recurso de costo variable son conceptos
distintos: alcanzar un límite de uso nunca pone en duda lo que el usuario ya compró,
independientemente de cómo ese recurso sea administrado en el futuro.

### Ayuda temporal contextual (principio de experiencia, independiente del mecanismo)

Este capítulo ya materializa, en la subsección siguiente, un principio de experiencia mediante una implementación
concreta llamada Trial contextual. UX-MON-001 abstrae ese comportamiento para dejarlo escrito como principio,
independiente de cualquier mecanismo comercial con el que se implemente hoy o en el futuro.

El principio: cuando el uso real de una persona revela una necesidad concreta que la versión gratuita no puede
profundizar, Saldo puede ofrecerle sentir esa profundidad en el momento exacto en que la necesita — nunca antes,
nunca como publicidad pasiva, nunca con urgencia.

**Principio de finalidad**: esta ayuda nunca existe para aumentar conversiones por sí misma. Existe para que la
persona evalúe, en su propio contexto y con sus propios datos, si una capacidad adicional realmente mejora su
relación con el dinero. Si concluye que no le aporta valor, debe poder volver a la experiencia gratuita sin
sensación de pérdida, fracaso ni presión comercial.

**Principio de independencia arquitectónica**: toda implementación de esta ayuda debe poder eliminarse sin romper
la coherencia de la experiencia gratuita. Es una extensión contextual del producto, nunca un requisito para que la
experiencia principal tenga sentido.

La implementación concreta de este principio (duración, condiciones, mecanismo) es una decisión de política
comercial — ver la subsección siguiente y las preguntas pendientes registradas en el Discovery de UX-MON-001.

### El trial nunca es automático — es contextual

Saldo nunca ofrece un trial al momento del registro. Hacerlo empujaría a alguien hacia Pro antes de
que la versión gratuita haya cumplido su promesa, contradiciendo el recorrido natural del usuario:
primero descubre que Saldo funciona, después cambia su relación con el dinero, recién ahí aparece
naturalmente el deseo de ir más lejos.

El trial se activa únicamente cuando el propio uso del producto revela una necesidad real que Free
ya no puede profundizar. El tono es siempre "creo que esto puede ayudarte ahora", nunca "probá esto
porque sí".

Ejemplos de ese momento: intentar crear una cuarta meta, registrar la primera tarjeta de crédito, o
cualquier otra señal equivalente que el propio uso del producto revele con el tiempo.

### Cancelar nunca es un castigo

Cancelar Pro nunca implica perder datos, historial ni configuraciones del usuario. Las capacidades
Premium dejarán de generar nuevas funcionalidades mientras la suscripción permanezca inactiva, pero
el usuario nunca será castigado perdiendo información propia.

Cancelar debe sentirse como una decisión tranquila, nunca como una decisión con miedo. Si Saldo
realmente aporta valor, el usuario vuelve por decisión propia — no porque tema perder algo. Este
principio es más fuerte que cualquier técnica de retención.

### La confianza comercial nunca es retroactiva

Cuando las condiciones de un plan cambian, quienes ya compraron bajo las condiciones anteriores
conservan exactamente lo que se les prometió en el momento de la compra — sin excepción. Un cambio
de arquitectura comercial rige únicamente hacia adelante, nunca hacia atrás.

Esto aplica también cuando el cambio nace de una necesidad real de sostenibilidad del negocio: si en
el futuro un modelo deja de ser sostenible, la solución se busca en las condiciones de las próximas
ventas, nunca modificando lo ya acordado con quien ya compró. Ajustar la sostenibilidad futura nunca
puede resolverse a costa de un acuerdo pasado.

Romper esta regla, aunque fuera legal o técnicamente posible, sería el mismo castigo al usuario que
el capítulo prohíbe en general — con el agravante de tratarse de alguien que ya pagó confiando en
la palabra de Saldo.

Esta garantía debe comunicarse cada vez que exista una interacción con el usuario que informe o modifique las
condiciones comerciales de su compra, manteniendo el mismo tono de confianza serena que guía este capítulo. Su
propósito es reafirmar la confianza del usuario, nunca cumplir únicamente una formalidad legal.

## Cuándo puede aparecer una invitación a Pro (opera principio 8, UX-MON-001)

Puede aparecer únicamente cuando, a la vez: el usuario realizó una acción deliberada; comprende qué función
intentó utilizar; esa función realmente aporta valor en ese momento concreto; la interrupción no aumenta su
ansiedad financiera.

Nunca puede aparecer cuando: el usuario todavía no entiende la función; se muestra como publicidad pasiva sin que
el usuario haya actuado; busca generar urgencia; interrumpe una tarea crítica; aprovecha un momento de frustración
financiera para intentar convertir.

Si existe duda razonable sobre si una interacción cumple estos criterios, la decisión por defecto será no mostrar
el gate. Este principio conservador gobierna cualquier implementación futura: ante la duda, la prioridad siempre
es proteger la experiencia del usuario antes que la conversión.

Esta regla es agnóstica de componente — se aplica a cualquier elemento futuro que comunique una limitación de
acceso, no solo a los ya existentes.

### Aplicación de esta regla a elementos de gestión de cuenta (UX-MON-001)

Esta regla no cambia. Lo que sigue es un criterio de interpretación para un caso particular: los elementos que
viven en el espacio donde el usuario ya administra su cuenta o su plan.

Estos elementos no necesitan estar atados a una acción reciente para existir — cumplen una función de
administración, no de invitación reactiva. Pero si, además de mostrar el estado de la cuenta, invitan activamente
a ampliar el acceso de forma persistente, esa invitación sigue debiendo responder las mismas preguntas que ya rige
la regla de arriba: por qué aparece ahí, por qué de forma continua, y por qué ayuda en vez de presionar. Estar en
un espacio legítimo de gestión no exime de esa justificación.

## Qué debe comunicarse ante cualquier cambio de acceso comercial (UX-MON-001)

Toda interacción que modifique el nivel de acceso comercial del usuario —upgrade, downgrade, cancelación,
reactivación, cambio desde o hacia Lifetime, o cualquier modalidad comercial futura— debe comunicar
explícitamente, sin excepción:
- qué conserva el usuario (datos, historial, configuraciones);
- qué deja de estar disponible a partir de ese momento.

Esta regla no depende de un flujo, pantalla o mecanismo técnico específico — se aplica a cualquier interacción de
este tipo, presente o futura, incluidas modalidades comerciales que todavía no existen.

## Aplicación concreta a Saldo

- Los gates de plan existentes hoy (tarjetas de crédito, metas ilimitadas, gráficos avanzados, exportación, IA) se
  contrastan contra estos 10 principios y las líneas rojas de arriba — ninguno elimina las 5 capacidades básicas de
  la versión Free; todos ofrecen profundidad o automatización adicional.
- El límite de metas deberá revisarse periódicamente para asegurar que siga siendo una ampliación natural de la
  experiencia y nunca una fuente de ansiedad para el usuario Free.
- Toda copia de invitación a Pro (modales, pantallas de planes) debe poder leerse en voz alta sin sonar a venta de
  miedo ni a urgencia artificial — mismo criterio de lenguaje humano que cap 01/03.
- (UX-MON-001, Bloque B) Verificación de los gates reales contra estos principios: el gráfico bloqueado y el aviso
  de exportación ya aplican el rol Disponibilidad (cap 12) de forma consistente — quedan formalmente reconocidos
  como ejemplos conformes. El modal de upgrade y la comparación de planes usan hoy "CSV"/"PDF" como texto visible
  (contradice cap 04) y un tono de urgencia (badges de descuento, tachados en rojo, llamados a la acción
  imperativos) que no corresponde al lenguaje calmo ya exigido — quedan señalados como corrección pendiente de
  implementación, no de principio.
- (UX-MON-001, Bloque B; ratificado en PM-RECON-003, 2026-07-28) El elemento persistente de invitación en el
  espacio de gestión de cuenta queda resuelto: vive como una página propia dentro de Perfil, con una invitación
  contextual de frecuencia mensual, sin contadores ni urgencia artificial — modelo definido en Product Blueprint
  §02 ("Suscripción"), que opera los principios de este capítulo sin contradecirlos. Ya no es una decisión
  pendiente del Product Owner.

Si algún día monetizar obliga a romper cualquiera de estos principios, no debemos cambiar los principios. Debemos
cambiar el modelo de negocio.
