# onboarding-flow Specification

**Alcance de este spec**: traduce exclusivamente lo aprobado en `onboarding-flow-proposal.md` a requisitos verificables. No introduce funcionalidad nueva, no toma decisiones de implementación, no propone diseño técnico, no modifica ni resuelve nada de `dashboard-claridad`/D-1.

## Purpose

Especificar el comportamiento verificable del flujo de primer uso (`06-onboarding.md`): inicio, Paso A, Paso B, persistencia, reanudación, continuidad tras abandono, finalización, idempotencia, observabilidad, y el límite explícito de su dependencia con el Dashboard.

## Terminología

- **"Onboarding pendiente"** es un estado funcional, no una propiedad de antigüedad del usuario. Se aplica a cualquier usuario registrado que todavía no cumple la condición de finalización (Requirement "Finalización del onboarding") — sin importar si se registró hace un minuto o hace meses. Este spec evita el término "usuario nuevo" precisamente porque mezcla dos ejes distintos (estado funcional vs. antigüedad); donde el proposal original usaba esa expresión, este spec la reemplaza por "usuario con onboarding pendiente".
- **"Movimiento propio"** — este spec depende de que exista una condición verificable, expuesta por el dominio de Movimientos, que distinga un movimiento cargado directamente por el usuario de otros orígenes (ej. importación). Este spec **no define** qué hace que un movimiento sea "propio" — esa definición pertenece al dominio de Movimientos, no al de onboarding. Onboarding solo consume esa condición como dato de entrada.

## Requirements

### Requirement: Inicio del onboarding

El sistema MUST considerar a un usuario en estado "onboarding pendiente" desde un registro exitoso hasta que cargue su primer movimiento por sí mismo (Proposal, Precisión 1) — independientemente de cuánto tiempo pasó o cuántas sesiones tuvo. El sistema MUST iniciar el onboarding inmediatamente después del registro, sin pantalla intermedia.

#### Scenario: Registro exitoso dispara el onboarding
- GIVEN un usuario completa el registro
- WHEN aterriza en la app por primera vez
- THEN el sistema inicia el onboarding sin pantalla intermedia

#### Scenario: Usuario antiguo sin movimientos propios también está pendiente
- GIVEN un usuario registrado con anterioridad que nunca cargó un movimiento por sí mismo
- WHEN abre la app
- THEN el sistema lo trata como "onboarding pendiente", no solo a los recién registrados en la sesión actual

### Requirement: Paso A — confirmación opcional

El sistema MUST presentar el Paso A como una única pantalla con una frase, con dos acciones de igual peso visual: continuar y saltear. El sistema MUST NOT tratar "saltear" como una acción secundaria o penalizada.

#### Scenario: Saltear el Paso A
- GIVEN un usuario en el Paso A
- WHEN toca "saltear"
- THEN el sistema avanza directamente al Paso B, sin fricción adicional

#### Scenario: Continuar el Paso A
- GIVEN un usuario en el Paso A
- WHEN toca "continuar"
- THEN el sistema avanza al Paso B

### Requirement: Paso B — registro obligatorio del primer movimiento

El sistema MUST requerir la carga de un movimiento real (ingreso o gasto) como paso obligatorio, no salteable. El sistema MUST ofrecer ambas opciones (ingreso y gasto) con el mismo peso. El sistema MUST NOT mostrar ninguna pantalla explicativa de "cómo cargar un movimiento" antes del formulario real — el formulario ES la primera interacción.

#### Scenario: Ambos tipos de movimiento disponibles por igual
- GIVEN un usuario en el Paso B
- WHEN se le presenta el formulario
- THEN puede elegir cargar un ingreso o un gasto, ambos con el mismo peso visual/funcional

#### Scenario: Paso B no es salteable
- GIVEN un usuario en el Paso B
- WHEN intenta avanzar sin cargar un movimiento
- THEN el sistema lo impide — no existe una acción de "saltear" en este paso

### Requirement: Persistencia del estado

El sistema MUST persistir el estado de onboarding (pendiente/completo, y el paso alcanzado) de forma que sobreviva el cierre y la reapertura de la aplicación. Este requirement no dicta el mecanismo de persistencia (queda para `sdd-design`).

#### Scenario: El estado sobrevive un cierre de la app
- GIVEN un usuario a mitad del Paso B
- WHEN cierra la aplicación sin completar la carga
- THEN el estado "onboarding pendiente, en Paso B" persiste para la próxima apertura

### Requirement: Reanudación después de interrupciones

El sistema MUST retomar el onboarding exactamente en el Paso B si fue interrumpido ahí. El sistema MUST NOT reiniciar desde el Paso A tras una interrupción.

#### Scenario: Reanudación directa en Paso B
- GIVEN un usuario que cerró la app a mitad del Paso B
- WHEN reabre la aplicación
- THEN el sistema lo lleva directo al Paso B, no al Paso A

#### Scenario: El Paso A no se re-presenta si ya fue resuelto
- GIVEN un usuario que salteó o completó el Paso A y luego interrumpió el Paso B
- WHEN reabre la aplicación
- THEN el sistema reanuda en Paso B sin volver a mostrar el Paso A

### Requirement: Continuidad tras abandono

Mientras el onboarding permanezca pendiente (en cualquier punto del flujo, no solo a mitad del Paso B), el sistema MUST intentar reanudar el flujo cada vez que el usuario vuelva a ingresar a la aplicación. Este requirement no define el mecanismo técnico de reanudación (queda para `sdd-design`).

#### Scenario: Reingreso con onboarding pendiente
- GIVEN un usuario con onboarding pendiente que abandonó el flujo sin completarlo (cierre de la app, navegación fuera del flujo, u otro motivo)
- WHEN vuelve a ingresar a la aplicación
- THEN el sistema intenta reanudar el onboarding en vez de asumir que fue cancelado permanentemente

### Requirement: Finalización del onboarding

El sistema MUST considerar completo el onboarding cuando el usuario ve el Inicio con al menos un movimiento cargado por sí mismo. El sistema MUST NOT exigir haber "completado todos los pasos" como criterio. El Paso C MUST aterrizar en el Dashboard existente, sin una pantalla de cierre/confirmación separada.

#### Scenario: Completar sin haber visto el Paso A
- GIVEN un usuario que salteó el Paso A y completó el Paso B
- WHEN se guarda su movimiento
- THEN el sistema considera el onboarding completo

#### Scenario: Aterrizaje directo al Inicio, sin pantalla de cierre
- GIVEN un usuario completa el Paso B
- WHEN se guarda el movimiento
- THEN el sistema lo lleva al Inicio real, sin ninguna pantalla intermedia de "listo" o felicitación

### Requirement: Idempotencia

Una vez que el onboarding se considera completo, el sistema MUST NOT volver a dispararlo automáticamente, bajo ninguna condición dentro de este alcance. El sistema MUST NOT ofrecer una vía de reinicio automático sin una decisión de producto futura y explícita (fuera de este alcance).

#### Scenario: Onboarding completo no se repite en sesiones futuras
- GIVEN un usuario con onboarding completo
- WHEN abre la app en cualquier sesión posterior
- THEN el sistema no presenta el Paso A ni el Paso B como flujo de onboarding

#### Scenario: La finalización es un estado permanente, no derivado en tiempo real
- GIVEN un usuario con onboarding completo
- WHEN el conteo actual de sus movimientos vuelve a cero por cualquier motivo ajeno a este flujo (ej. borrado manual)
- THEN el sistema no re-dispara el onboarding automáticamente — la finalización, una vez alcanzada, no se reevalúa contra el estado actual de movimientos

### Requirement: Observabilidad

El flujo MUST generar eventos de dominio observables para sus transiciones principales: inicio, reanudación, omisión (cuando aplica — ej. saltear el Paso A), y finalización. Este requirement no define nombres de eventos, esquema, ni mecanismo de instrumentación (queda para `sdd-design`) — únicamente que esas cuatro transiciones deben ser observables por algún medio.

#### Scenario: Cada transición principal es observable
- GIVEN el flujo de onboarding en ejecución
- WHEN ocurre inicio, reanudación, una omisión, o la finalización
- THEN el sistema genera un evento de dominio observable correspondiente a esa transición, sin que este spec fije su forma concreta

### Requirement: Dependencia explícita con el Dashboard (D-1) — no resuelta en este spec

El Paso C MUST aterrizar en el Dashboard tal como existe actualmente, sin requerir ningún cambio a su contenido o arquitectura. Este spec MUST dejar registrado que el requisito de `06-onboarding.md` de mostrar "el trío de cifras" en el Paso C no está satisfecho por el Dashboard actual (que muestra una única cifra protagonista, "Saldo disponible") — esta brecha no se resuelve, se hereda como dependencia documentada.

#### Scenario: Paso C usa el Dashboard actual, no el trío de cifras
- GIVEN el Paso C se ejecuta
- WHEN el usuario aterriza en el Inicio
- THEN ve el Dashboard tal como existe hoy (cifra protagonista "Saldo disponible" + el movimiento recién cargado reflejado), sin que este spec exija el "trío de cifras" completo de `06-onboarding.md:41-42`

**Nota de verificación**: cualquier `sdd-verify` futuro sobre este requirement debe evaluar el Paso C contra "el Dashboard tal como existe al momento de la implementación", no contra el texto literal de cap 06 sobre el trío de cifras — esa brecha depende de la evolución de `dashboard-claridad`, fuera del alcance de esta capability.

## Fuera de alcance

Este spec deliberadamente no define ni resuelve lo siguiente — queda para otras capabilities, otros dominios, u otras fases del SDC:

- **`dashboard-claridad`** — cualquier evolución de contenido o arquitectura del Dashboard (incluida la resolución de D-1).
- **Arquitectura** — cómo se estructura el código que implementa este spec (`sdd-design`).
- **Diseño visual** — layout, composición, tokens visuales de las pantallas del flujo.
- **Copy** — texto exacto de cada paso (delegado a cap 07, UX Writing).
- **Animaciones** — transiciones entre pasos (delegado a cap 08, Microinteracciones).
- **Almacenamiento** — mecanismo concreto de persistencia del estado (Supabase, localStorage, u otro — `sdd-design`).
- **Telemetría** — infraestructura de analítica, almacenamiento, transporte o consumo de los eventos de dominio que el Requirement "Observabilidad" exige generar. Distinción importante: este spec exige *que* existan eventos de dominio observables (comportamiento funcional); la existencia de esos eventos no implica la existencia de un sistema de analítica, y este spec no define *cómo* se implementan — esa distinción es la misma que ya aplica a "Persistencia del estado" (se exige que el estado persista, no dónde ni cómo).
- **Definición de "movimiento propio"** — pertenece al dominio de Movimientos (ver Terminología); este spec solo consume la condición, no la define.
- **Implementación técnica en general** — cualquier decisión de código, librería, o patrón no cubierta explícitamente arriba.
