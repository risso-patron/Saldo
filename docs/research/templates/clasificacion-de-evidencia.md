# Template — Criterios de clasificación de evidencia

**Cómo usar esta plantilla**: no se copia por ronda de investigación — es un criterio fijo que `sintesis.md` referencia. Se actualiza acá, en un solo lugar, si el criterio cambia.

Cada hipótesis, al sintetizarse, se clasifica en tres ejes independientes. Los tres juntos determinan si la evidencia es **accionable** — ninguno alcanza solo.

---

## Impacto

Cuánto cambiaría una decisión de producto si esta hipótesis se confirma o se refuta.

| Nivel | Criterio |
|---|---|
| **Alto** | Afecta directamente una decisión ya identificada como pendiente (ej. C-02, C-03, C-06 de `docs/governance/GOV-001-jerarquia-documental-de-producto.md`, o una prioridad de un PDP). Confirmarla o refutarla cambia qué se construye. |
| **Medio** | Afecta el diseño de una capability ya decidida, pero no su existencia (ej. cómo se muestra algo que ya se sabe que va a existir). |
| **Bajo** | Informativo — no cambia ninguna decisión conocida, pero vale la pena registrarlo para el futuro. |

## Frecuencia

Cuántos participantes mostraron o dijeron algo consistente con la hipótesis, sobre el total entrevistado en la ronda.

| Nivel | Criterio |
|---|---|
| **Alta** | Mayoría de los participantes (más de la mitad), de forma independiente (no porque se les sugirió). |
| **Media** | Un grupo consistente pero no mayoritario (ej. 2 de 5) — patrón real, no aislado, pero no generalizado todavía. |
| **Aislada** | Un solo participante. No se descarta (puede ser una señal temprana real), pero no se actúa solo con esto — se marca como candidata a explorar en la próxima ronda. |

## Confianza

Qué tan directa es la evidencia respecto de lo que realmente pasó, no de lo que el participante cree o dice que pasa.

| Nivel | Criterio |
|---|---|
| **Alta** | Observación de comportamiento directo durante la sesión (ej. "tocó X antes que Y", visto en tiempo real) — no depende de que el participante recuerde bien o describa bien su propio comportamiento. |
| **Media** | Relato consistente y específico del participante sobre un evento pasado concreto ("la última vez que...", con detalle), pero no observado directamente. |
| **Baja** | Opinión general, hipotética, o respuesta a una pregunta que sugería la respuesta (ej. si el entrevistador se desvió del guion y preguntó "¿te gustaría...?"). Marcar explícitamente cuándo esto ocurrió — no ocultarlo en la síntesis. |

---

## Cuándo la evidencia es accionable

Una hipótesis pasa a informar una decisión de producto (§4 del Product Evidence correspondiente) cuando cumple **al menos**:

- Frecuencia Media o Alta, **y**
- Confianza Media o Alta.

Impacto Alto con Frecuencia Aislada o Confianza Baja **no es motivo para actuar** — es motivo para diseñar la próxima ronda de investigación específicamente sobre esa hipótesis, no para decidir con lo que hay. Esto es deliberado: es la misma lógica que ya rechazó, en `metas-exposicion` y en el Discovery de `dashboard-claridad`, forzar una recomendación cuando la evidencia no alcanza — acá se aplica a evidencia de usuario en vez de a evidencia documental.
