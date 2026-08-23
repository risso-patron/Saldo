# Template — Síntesis de investigación

**Cómo usar esta plantilla**: una por ronda de investigación, en `docs/research/{tema}-{AAAA-MM}/sintesis.md`, completada después de tener todos los `hallazgos.md` de esa ronda. Es la **única** pieza de esta carpeta que se cita directamente en un `sdd-propose` — las entrevistas individuales quedan como respaldo, no como evidencia citable por sí solas.

**Regla de verificación (RETRO-001, ratificada)**: cada fila de la tabla de síntesis debe poder rastrearse hasta un `hallazgos.md` específico. Si no se puede señalar de qué entrevista sale, no entra en la síntesis.

---

## Metadata de la ronda

| Campo | Valor |
|---|---|
| Tema / capability relacionada | `{{ej. dashboard-claridad}}` |
| Product Evidence de origen | `{{link al documento que definió las hipótesis}}` |
| N.º de entrevistas realizadas | `{{N}}` |
| Perfiles cubiertos | `{{ej. 2 Rosa, 1 Ana, 1 Luis, 1 José}}` |
| Período | `{{fechas}}` |

---

## 1. Matriz de hipótesis

Una fila por hipótesis del Product Evidence de origen. Clasificación según `clasificacion-de-evidencia.md`.

| ID | Hipótesis | Confirmada en | Refutada en | Frecuencia | Confianza | Impacto | Accionable? |
|---|---|---|---|---|---|---|---|
| `{{H1}}` | `{{texto}}` | `{{entrevista-02, entrevista-04}}` | `{{—}}` | `{{Media}}` | `{{Alta}}` | `{{Alto}}` | `{{Sí}}` |
| `{{H4}}` | `{{texto}}` | `{{—}}` | `{{entrevista-01, entrevista-03}}` | `{{Alta}}` | `{{Media}}` | `{{Alto}}` | `{{Sí — refutada}}` |

**Criterio de saturación**: si las últimas 2-3 entrevistas de la ronda no aportan hallazgos nuevos sobre una hipótesis (ni confirmándola ni refutándola con más fuerza), esa hipótesis se considera saturada con la evidencia disponible — no hace falta seguir entrevistando solo por esa hipótesis específica.

## 2. Hipótesis nuevas emergentes

Las que no estaban en el Product Evidence original y aparecieron en 2 o más entrevistas de forma independiente (una sola mención va en la síntesis narrativa de §4, no acá, hasta que se repita).

| Hipótesis nueva | Apareció en | Frecuencia | Sugerencia |
|---|---|---|---|
| `{{texto}}` | `{{entrevistas}}` | `{{Media/Alta}}` | `{{ej. "incorporar como hipótesis a un Product Evidence futuro" / "explorar en la próxima ronda"}}` |

## 3. Citas representativas

3-5 citas (de `hallazgos.md`, nunca parafraseadas) que ilustran el patrón más fuerte de la ronda — para que quien lea la síntesis sin haber estado en las entrevistas tenga contacto directo con el lenguaje real de los usuarios, no solo con la interpretación.

- `{{"cita" — participante, entrevista-0X}}`

## 4. Síntesis narrativa

2-4 párrafos, en prosa, respondiendo: ¿qué aprendimos que cambia algo? ¿Qué hipótesis del Product Evidence quedan confirmadas con suficiente fuerza para actuar (según §1)? ¿Cuáles quedan abiertas, y por qué (frecuencia aislada, confianza baja, o simplemente no se tocó el tema)? No repetir la matriz en prosa — agregar el juicio que la tabla sola no puede dar.

## 5. Qué decisiones de producto puede informar esta síntesis

Vínculo directo a la sección "Qué decisiones de producto dependen de esta evidencia" del Product Evidence de origen — señalar cuáles de esas decisiones ya tienen evidencia accionable (§1) y cuáles siguen sin ella.

| Decisión pendiente | Estado tras esta ronda |
|---|---|
| `{{ej. C-02 — contenido del Dashboard}}` | `{{ej. "H1 y H3 accionables; H4 refutada; H5 sigue sin evidencia suficiente (frecuencia aislada)"}}` |

## 6. Qué NO resuelve esta síntesis

- No decide la propuesta de producto — eso es `sdd-propose`, y toma esta síntesis como uno de sus insumos, no como la decisión en sí.
- No reemplaza el criterio del PO en decisiones de gobernanza (ej. C-06) — informa, no decide por él.
- Toda hipótesis sin evidencia accionable (§1) queda pendiente, no descartada — no se fuerza una conclusión donde la evidencia no alcanza.

---

**Estado**: síntesis de investigación. Insumo directo para el próximo `sdd-explore`/`sdd-propose` de `{{capability}}`.
