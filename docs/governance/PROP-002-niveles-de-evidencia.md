# PROP-002 — Modelo de niveles de evidencia basado en riesgo

**Tipo**: pieza oficial del framework metodológico del SDC. **Aprobada e institucionalizada por el Product Owner, 2026-08-07.**
**Fecha**: 2026-08-07
**Versión**: 3 — incorpora una aclaración de alcance (ver abajo) sobre la v2. Modelo A/B/C, las cuatro dimensiones, la regla de veto, la matriz de decisión, y la compatibilidad con Product Evidence/Decision Gate quedan **sin cambios** respecto de la v2.
**Depende de**: `docs/governance/PROP-001-etapa-product-decision.md` (Decision Gate, institucionalizado), `docs/research/README.md` (Product Evidence, institucionalizado), memoria persistente del SDC (7 principios ratificados).

---

## Alcance de PROP-002

**PROP-002 regula decisiones de evolución del producto** — evoluciones de comportamiento, alcance, estrategia o dirección, en el mismo sentido en que el Decision Gate (`PROP-001` §1) ya las define.

**PROP-002 no sustituye ni condiciona los procesos aplicables a**: incidencias, correcciones de defectos, seguridad, cumplimiento normativo, u otras acciones obligatorias donde el objetivo no sea decidir una evolución funcional del producto. En esos casos prevalecen las políticas y procesos específicos correspondientes — el modelo de niveles de evidencia y la matriz de riesgo de este documento no aplican ahí, ni los reemplazan, ni les agregan un paso adicional.

Ejemplo de deslinde, con casos ya presentes en el proyecto: decidir *si* y *cómo* incorporar "acciones rápidas" al Dashboard es una evolución de producto — PROP-002 aplica. Corregir el gap de `eslint.config.js` sin globals de Vitest (`RETRO-001-metas-exposicion.md`, hallazgo de la implementación de `metas-exposicion`) es una corrección técnica, no una decisión de evolución — PROP-002 no aplica, se resuelve con el proceso técnico que corresponda.

---

## 0. Qué cambió respecto de la v1

La v1 resolvía la tensión de la superficie núcleo con una regla binaria: *"¿toca Dashboard/Movimientos/Onboarding? Si sí, Nivel A obligatorio sin excepción."* El PO señaló el problema correcto: el tipo de superficie es una señal, no el riesgo en sí. Dos cambios de fondo:

1. **"Superficie núcleo" deja de ser un veto automático.** Pasa a ser una de las señales que alimentan la dimensión "Impacto sobre la experiencia del usuario" (§3), evaluada caso por caso — no heredada en bloque de la superficie completa.
2. **El modelo pasa de una lista de condiciones a una matriz de decisión.** La v1 pedía tres condiciones simultáneas (reversible, barato, declarado). La v2 separa cuatro dimensiones y las combina explícitamente en una matriz (§5), en vez de una lista donde no quedaba claro cómo pesaba cada una frente a las otras.

El modelo de niveles A/B/C (§2) y la exigencia de declarar la fuente no cambian — el PO aprobó ese enfoque general en la v1.

## 1. El problema (sin cambios respecto de v1)

Un estándar único de evidencia para riesgos distintos frena evoluciones de bajo riesgo sin necesidad real, o — el riesgo inverso, que la v1 no nombraba con suficiente fuerza — permite que una evaluación de riesgo mal hecha en una superficie "no núcleo" deje pasar una decisión de alto impacto real. El modelo de riesgo (en vez de superficie) resuelve los dos problemas a la vez: no depende de dónde vive la decisión, depende de cuánto puede salir mal y cuánto costaría arreglarlo.

## 2. Modelo de niveles de evidencia (sin cambios respecto de v1)

| Nivel | Qué es | Ejemplo en este proyecto |
|---|---|---|
| **A — Evidencia directa de usuarios reales** | Entrevistas, observación de comportamiento, datos de uso agregados. Estándar ya institucionalizado vía Product Evidence + `docs/research/`. | La ronda `docs/research/primeros-10-minutos-2026-08/` cuando tenga entrevistas registradas. |
| **B — Evidencia indirecta o proxy** | Feedback recibido sin estructurar, análisis heurístico contra la Design Constitution/Product Master, comparables de productos similares, opinión experta documentada. | Las 3 frases de PDP-001 §1. |
| **C — Juicio informado del Product Owner o del equipo** | Sin evidencia externa nueva, razonamiento explícito apoyado en lo que el proyecto ya sabe (personas, principios, restricciones de diseño ya documentadas). | La decisión de navegación de `metas-exposicion` (ver §6). |

## 3. Las cuatro dimensiones, separadas

### 3.1 Nivel de evidencia disponible
El nivel más alto que realmente existe para esta decisión — A, B o C (§2). Es un hecho, no una evaluación de riesgo — se constata, no se estima.

### 3.2 Reversibilidad del cambio

| Nivel | Criterio |
|---|---|
| **Alta** | Revertir es un cambio de código acotado, sin pérdida de datos, sin que el usuario perciba que hubo un vaivén. |
| **Media** | Revertir es técnicamente posible pero deja rastro perceptible (el usuario nota el cambio y después el regreso), o requiere coordinar con otro sistema o dato. |
| **Baja** | Revertir no es viable sin costo alto — migración de datos irreversible, compromiso externo (regulatorio, contractual), o el daño ya ocurrió en la percepción del usuario y el código revertido no lo repara. |

### 3.3 Costo de corrección
Distinto del costo de implementar la primera vez — es cuánto cuesta arreglarlo **si resulta que la decisión estaba equivocada**, después de ya haberla implementado.

| Nivel | Criterio |
|---|---|
| **Bajo** | Arreglo en un ciclo o menos, alcance acotado a los mismos archivos. |
| **Medio** | Requiere un ciclo completo nuevo, sin rediseño de arquitectura. |
| **Alto** | Requiere rediseño, coordinación entre múltiples capabilities, o una migración compleja. |

### 3.4 Impacto sobre la experiencia del usuario
**Reemplaza "superficie núcleo" como regla dura.** Se evalúa la decisión específica, no se hereda el nivel de la superficie completa — aunque tocar una superficie núcleo (Dashboard, Movimientos, Onboarding) es una señal fuerte de que el impacto probablemente sea alto, no lo determina por sí sola.

| Nivel | Criterio |
|---|---|
| **Bajo** | La mayoría de los usuarios no lo percibe, o lo percibe como neutral. |
| **Medio** | Perceptible, afecta cómo el usuario hace una tarea, pero no cambia su modelo mental del producto. |
| **Alto** | Afecta la primera impresión, la confianza, o el modelo mental que el usuario ya formó — ej.: cambia el contenido de una de las tres preguntas que el Dashboard responde (`Saldo Design Constitution.dc.html:528`), altera el flujo de onboarding, o toca directamente uno de los miedos ya documentados de las personas (`02-quien-es-nuestro-usuario.md`). |

## 4. Riesgo compuesto — cómo se combinan 3.2, 3.3 y 3.4

**Regla de veto**: si **cualquiera** de las tres dimensiones de riesgo cae en su nivel más severo (Reversibilidad Baja, Costo de corrección Alto, o Impacto Alto), el **Riesgo compuesto es Alto** — sin importar cómo califiquen las otras dos. Una decisión de alto impacto no se vuelve segura solo porque es barata de implementar, ni una decisión cara de corregir se vuelve segura solo porque el impacto percibido es bajo.

| Riesgo compuesto | Cuándo aplica |
|---|---|
| **Bajo** | Las tres dimensiones en su nivel más favorable (Reversibilidad Alta, Costo Bajo, Impacto Bajo). |
| **Medio** | Al menos una dimensión en nivel intermedio, ninguna en el nivel más severo. |
| **Alto** | Al menos una dimensión en su nivel más severo (regla de veto). |

## 5. Matriz de decisión

Cruza el Riesgo compuesto (§4) contra el Nivel de evidencia disponible (§3.1):

| Riesgo compuesto \ Evidencia disponible | Nivel A | Nivel B | Nivel C |
|---|---|---|---|
| **Bajo** | Avanza | Avanza | Avanza |
| **Medio** | Avanza | Avanza | **Solicitar más evidencia** (subir a B) |
| **Alto** | Avanza | **Solicitar más evidencia** (subir a A) | **Solicitar más evidencia** (subir a A) |

Lectura de la matriz: Nivel A siempre alcanza, cualquiera sea el riesgo — es el estándar más alto y no necesita justificación adicional. Nivel C solo alcanza cuando el riesgo es genuinamente bajo en las tres dimensiones. Nivel B cubre el rango intermedio, pero no el riesgo alto — ahí no hay atajo, hace falta evidencia directa de usuarios.

## 6. Ejemplos aplicados (reclasificados bajo el modelo nuevo, no bajo el veto de superficie de la v1)

| Decisión | Reversibilidad | Costo de corrección | Impacto | Riesgo compuesto | Evidencia usada | ¿Matriz lo hubiera permitido? |
|---|---|---|---|---|---|---|
| `metas-exposicion` — exposición de Metas | Alta (código de navegación, sin migración) | Bajo (diff de 34 líneas en 4 archivos, un ciclo) | **Bajo** — aditivo, no tocó las 3 preguntas del Dashboard, acceso secundario (⌘K) además del nuevo | **Bajo** | C (juicio del PO + restricciones ya documentadas) | Sí — Riesgo Bajo + Nivel C = Avanza |
| `dashboard-claridad` — contenido del Dashboard (C-02) | Baja (la primera impresión/confianza no se revierte con el código, aunque el código sí) | Medio-Alto (podría exigir rediseño si la evidencia posterior muestra que estaba mal) | **Alto** — toca directamente una de las 3 preguntas que el Dashboard responde | **Alto** (veto por Impacto y por Reversibilidad) | B (3 frases de PDP-001 §1) | No — Riesgo Alto + Nivel B = Solicitar más evidencia (el estado actual, correcto) |

El modelo reproduce, con un criterio explícito y auditable, el mismo resultado al que el proyecto ya había llegado por criterio caso a caso — eso es lo que valida que la matriz está bien calibrada, no solo que es internamente consistente.

## 7. Integración con Product Evidence (sin cambios de fondo respecto de v1)

Product Evidence sigue siendo el camino institucionalizado para llegar a Nivel A. El modelo no da un atajo para evitarlo cuando el Riesgo compuesto es Alto (§5, última fila) — en ese caso, la matriz exige Nivel A sin excepción, sea cual sea la superficie. Da una vía explícita para cuando el riesgo es Bajo o Medio y Nivel A no está disponible o no se justifica.

## 8. Integración con el Decision Gate

`decision.md` (`docs/research/templates/decision.md`, sin modificar todavía) ganaría, cuando el nivel no es A, un bloque con las cuatro dimensiones evaluadas explícitamente — no solo el resultado de la matriz, sino cómo se llegó a él:

```markdown
**Nivel de evidencia disponible**: {{A / B / C}}
**Reversibilidad**: {{Alta / Media / Baja}} — {{justificación breve}}
**Costo de corrección**: {{Bajo / Medio / Alto}} — {{justificación breve}}
**Impacto sobre la experiencia del usuario**: {{Bajo / Medio / Alto}} — {{justificación breve}}
**Riesgo compuesto**: {{Bajo / Medio / Alto}}
**Resultado según matriz**: {{Avanza / Solicitar más evidencia}}
```

Sin cambios a las 4 salidas del gate (Aprobado/Rechazado/Pospuesto/Solicitar más evidencia) — este bloque informa la decisión, no la reemplaza. Un gate puede seguir resultando en Rechazado o Pospuesto por razones de negocio aunque la matriz diga "Avanza": la matriz responde si hay evidencia suficiente para decidir, no qué decidir.

## 9. Integración con no-retroactividad (sin cambios respecto de v1)

Si se institucionalizara, aplicaría solo a Decision Gates futuros. No reabre `metas-exposicion` ni reclasifica retroactivamente su evidencia — el ejercicio de §6 es ilustrativo, no una reapertura de esa decisión ya cerrada con Product Acceptance.

## 10. Qué NO hace este análisis

- No modifica `docs/research/templates/decision.md` ni ningún otro archivo existente.
- No institucionaliza el modelo de niveles, las cuatro dimensiones, ni la matriz.
- No cambia el estado `WAITING FOR PRODUCT EVIDENCE` de `dashboard-claridad` — bajo este modelo, esa capability sigue en Riesgo Alto con evidencia Nivel B, que la matriz sigue resolviendo como "Solicitar más evidencia".
- No abre ningún ciclo SDD.

## 11. Si se aprueba — qué implicaría institucionalizar (no ejecutado)

- Agregar el bloque de §8 a `docs/research/templates/decision.md`.
- Documentar el modelo (§2-§5) en `PROP-001` o en este mismo documento, según prefieras.
- Ratificar como principio 8 del SDC en la memoria persistente, siguiendo el patrón de los 7 anteriores.

---

**Estado**: **institucionalizado y completamente cerrado**. Ejecución registrada en `docs/governance/INFORME-CIERRE-PROP-002.md`. Cambios: `docs/research/templates/decision.md` (bloque de evaluación de riesgo agregado), `docs/governance/PROP-001-etapa-product-decision.md` (referencia cruzada mínima en §2), memoria persistente del SDC (principio 8 ratificado).
