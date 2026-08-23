# Template — Hallazgos de entrevista

**Cómo usar esta plantilla**: una copia por entrevista, en la misma carpeta que la entrevista completada (`docs/research/{tema}-{AAAA-MM}/entrevistas/`). Completar inmediatamente después de la sesión — no acumular varias entrevistas sin registrar.

**Principio rector**: cuatro categorías, y **no se mezclan entre sí**. Una observación no es una cita. Una hipótesis confirmada no es una opinión del entrevistador. Mezclar categorías es lo que hace que la síntesis (`sintesis.md`) termine repitiendo el sesgo de quien entrevistó en vez de mostrar el patrón real.

---

## Metadata

| Campo | Valor |
|---|---|
| Entrevista de referencia | `{{link o nombre de archivo de la entrevista}}` |
| Participante | `{{persona/perfil}}` |
| Fecha | `{{fecha}}` |
| Hipótesis exploradas | `{{IDs}}` |

---

## 1. Observaciones

Hechos verificables sobre lo que el participante **hizo**, no lo que dijo que hace ni lo que el entrevistador interpretó. Formato: una línea por observación, con el momento de la sesión si aplica.

- `{{ej. "Al abrir la app, tocó primero el número de saldo, no lo leyó en voz alta hasta que se le preguntó qué miraba."}}`
- `{{ej. "Tardó ~8 segundos en encontrar cómo llegar a Historial; usó el ícono de la barra inferior, no el Omnibar."}}`

## 2. Citas textuales

Palabras exactas del participante, entre comillas, con el contexto de qué se le preguntó. Nunca parafraseadas — si no se registró la frase exacta, no va acá, va en Observaciones como paráfrasis marcada como tal.

- `{{ej. "no entiendo cómo usarla" — dicho en respuesta a 'contame qué hiciste la primera vez que abriste SALDO'}}`
- `{{ej. "reviso mi meta del viaje casi todos los domingos, cuando organizo la semana" — dicho en respuesta al bloque 3}}`

## 3. Hipótesis confirmadas

Solo las que tienen respaldo directo en las Observaciones o Citas de arriba — con la referencia exacta, no una impresión general.

| ID | Hipótesis | Evidencia de esta entrevista |
|---|---|---|
| `{{H2}}` | `{{texto de la hipótesis, copiado del Product Evidence}}` | `{{qué observación/cita de arriba la respalda}}` |

## 4. Hipótesis refutadas

Mismo formato — con evidencia específica de por qué esta entrevista va en contra.

| ID | Hipótesis | Evidencia de esta entrevista |
|---|---|---|
| `{{H4}}` | `{{texto}}` | `{{qué observación/cita la contradice}}` |

## 5. Nuevas hipótesis / señales inesperadas

Lo que apareció y no estaba en la lista original del Product Evidence. Es frecuentemente la parte más valiosa de la entrevista — no descartar algo solo porque no estaba previsto.

- `{{ej. "El participante mencionó espontáneamente que revisa el Dashboard antes de pagar cuentas, no al azar — podría ser una hipótesis nueva sobre timing de uso, no solo contenido."}}`

## 6. Preguntas abiertas para próximas entrevistas

Cosas que esta sesión dejó sin resolver y que valdría la pena preguntar mejor en la siguiente.

- `{{ej. "No quedó claro si 'le faltan cosas' se refiere al Dashboard o a otra parte de la app — preguntar más directo la próxima vez, sin nombrar el Dashboard primero."}}`
