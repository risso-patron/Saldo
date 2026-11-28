# PROP-001 — Propuesta final: Decision Gate entre evidencia/motivación y Discovery

**Tipo**: pieza oficial del framework metodológico del SDC. **Aprobada e institucionalizada por el Product Owner, 2026-08-06.**
**Fecha**: 2026-08-06
**Versión**: 3 (final) — incorpora dos ajustes del PO sobre la v2 (generalización del origen del gate, separación física entre evidencia `sintesis.md` y decisión `decision.md`) más un ajuste editorial de cierre (§1, redacción normativa de la definición principal).
**Depende de**: `docs/research/README.md` (paquete de investigación, aprobado), `docs/governance/GOV-001-jerarquia-documental-de-producto.md` §2.2-§2.4 (jerarquía documental y principio de autoridad del PO, ratificados).

---

## 0. Qué cambió respecto de la v2

Dos ajustes, ninguno revierte la separación Proceso/Artefacto que ya quedó aprobada conceptualmente en v2 (Decision Gate = punto de decisión; PDP = artefacto condicional):

1. **El gate deja de depender exclusivamente de investigación.** La v2 lo modelaba como el paso que sigue a una síntesis de `docs/research/`. Eso cubre un origen legítimo, pero no todos — deuda técnica, seguridad, regulación o estrategia de negocio también producen evoluciones de producto que necesitan la misma decisión formal, sin haber pasado por una ronda de investigación con usuarios.
2. **La síntesis deja de cargar con el resultado del gate.** La v2 proponía agregarle una §7 a `sintesis.md`. Eso mezclaba evidencia (lo que se observó) con interpretación (lo que el PO decidió hacer con eso) en el mismo documento — exactamente la distinción que esta propuesta existe para proteger. El resultado del gate pasa a vivir en un archivo propio, `decision.md`.

## 1. Propósito del Decision Gate (definición normativa)

> **Toda evolución del producto que pueda modificar el comportamiento, alcance, estrategia o dirección del producto debe atravesar un Decision Gate antes de iniciar un nuevo ciclo de desarrollo.**

No está atado a una fuente única. Orígenes legítimos, sin que la lista sea exhaustiva:

| Origen | Ejemplo en este proyecto |
|---|---|
| Product Evidence / investigación con usuarios | `dashboard-claridad-product-evidence.md` → una síntesis futura de `docs/research/` |
| Deuda técnica que se decide priorizar | El ticket E2 (`GoalManager`, gamificación — `docs/design/integration-debt.md`, fila 2026-08-06) |
| Seguridad | Un hallazgo que obliga a decidir alcance de una migración o mitigación |
| Cambio regulatorio | Requisitos nuevos de protección de datos, por ejemplo |
| Estrategia de negocio | El mismo tipo de decisión que ya originó `PDP-001` |
| Otro | Cualquier fuente que el PO considere que amerita una decisión formal antes de abrir Discovery |

El gate sigue siendo un punto de control, no una etapa de trabajo — no importa el origen, lo que exige es una decisión explícita y su registro, no investigación adicional ni redacción extensa por defecto.

## 2. Salidas posibles del Decision Gate (sin cambios respecto de v2)

| Salida | Qué significa | Qué sigue |
|---|---|---|
| **Aprobado** | La evidencia/motivación respalda avanzar con una evolución del producto. | Si es relevante (§4): PDP nuevo, y con eso Discovery empieza. Si no: Discovery empieza citando `decision.md` + la evidencia de origen directamente. |
| **Rechazado** | La evidencia/motivación no respalda la evolución propuesta. | Se registra en `decision.md` con su razón. No se genera PDP. Discovery no se abre. |
| **Pospuesto** | Válido, pero no es prioridad ahora, o falta una condición previa. | Se registra la razón y la condición de retomo en `decision.md`. PDP solo si comprometer el roadmap exige que otro ciclo lo cite como autoridad (poco frecuente). |
| **Solicitar más evidencia** | Lo disponible no alcanza para decidir (ej. frecuencia/confianza insuficiente según `clasificacion-de-evidencia.md`, o falta un dictamen externo en un origen regulatorio/de seguridad). | Se registra en `decision.md` qué falta específicamente. No hay PDP — vuelve al origen (nueva ronda de investigación, u obtención de la información faltante). |

**Cómo se decide si "lo disponible alcanza"**: para evoluciones de producto (`docs/governance/PROP-002-niveles-de-evidencia.md` §Alcance — no aplica a incidencias, defectos, seguridad o cumplimiento normativo), el criterio es la matriz de riesgo de PROP-002: Nivel de evidencia disponible (A/B/C) cruzado contra Riesgo compuesto (Reversibilidad, Costo de corrección, Impacto sobre la experiencia del usuario). Registro obligatorio en `decision.md` cuando el nivel no es A.

## 3. Relación con las fuentes de origen y con Discovery

```
Origen del gate (uno de varios — §1)
   │
   ▼
Decision Gate  →  decision.md (siempre se registra, cualquiera sea el resultado)
   │
   ├── Rechazado / Solicitar más evidencia ──► no se abre Discovery
   ├── Pospuesto ──────────────────────────► no se abre Discovery todavía
   └── Aprobado
         ├── alcance menor ──────► Discovery arranca citando decision.md + evidencia de origen
         └── evolución relevante (§4) ─► PDP-00N ─► Discovery arranca citando el PDP
```

Cuando el origen es Product Evidence, la cadena completa queda: Product Evidence (hipótesis) → investigación → `sintesis.md` (evidencia, sin interpretación) → Decision Gate → `decision.md` (interpretación, separada de la evidencia) → PDP si corresponde. Cuando el origen es deuda técnica, seguridad, regulación o negocio, la cadena es más corta — no hay `sintesis.md` porque no hay investigación con usuarios de por medio, pero el gate y su `decision.md` funcionan igual.

## 4. Cuándo corresponde generar un PDP y cuándo no (sin cambios de criterio respecto de v2)

Se genera PDP únicamente si el resultado es **Aprobado** y se cumple al menos uno de estos criterios de relevancia:

- Afecta una superficie núcleo del producto (Dashboard, Hoja/Movimientos, Onboarding — `Saldo Product Blueprint.dc.html` §02).
- Cambia, amplía o reduce el alcance de un PDP anterior.
- Compromete una prioridad de roadmap de forma que otro ciclo futuro va a necesitar citarlo como autoridad, no solo como contexto.

No se genera PDP cuando el resultado es Rechazado, Solicitar más evidencia, Pospuesto sin compromiso de roadmap, o Aprobado de alcance menor — en todos esos casos `decision.md` es, por sí solo, registro suficiente. Mismo criterio de trazabilidad-vs-autoridad que `GOV-001` §2.2 ya aplica al resto de la documentación del proyecto.

## 5. Trazabilidad — evidencia separada de decisión

**Regla central de este ajuste**: `sintesis.md` (cuando el origen es investigación) queda exclusivamente como documento de evidencia — hipótesis confirmadas/refutadas, citas, clasificación de impacto/frecuencia/confianza. No contiene ninguna decisión ni ningún resultado de gate.

El resultado del gate vive en un archivo nuevo, liviano, **`decision.md`**, ubicado junto al contexto que originó el gate:

- Origen investigación: `docs/research/{tema}-{AAAA-MM}/decision.md`, junto a `sintesis.md` y la carpeta `entrevistas/`.
- Otros orígenes (deuda técnica, seguridad, regulación, negocio): junto al artefacto que motivó el gate — por ejemplo, dentro de la carpeta del `openspec/changes/{change}/` si ya existe, o en `docs/governance/` si es una decisión transversal sin change asociado todavía. El principio es el mismo: `decision.md` vive donde vive la evidencia/motivación que decide, no en un índice centralizado separado.

**Contenido propuesto de `decision.md`**:

```markdown
# Decision Gate — {tema}

**Origen**: {Product Evidence / deuda técnica / seguridad / regulación / estrategia de negocio / otro}
**Evidencia u origen citado**: {link a sintesis.md, a integration-debt.md, a un hallazgo de seguridad, etc.}
**Fecha**: {fecha}
**Responsable**: {quién decide — el Product Owner}
**Resultado**: {Aprobado / Rechazado / Pospuesto / Solicitar más evidencia}
**Razón**: {texto}
**PDP relacionado**: {link, o "— no aplica, ver §4"}
```

Trazabilidad de punta a punta, en un solo salto por documento: origen → (si aplica) `sintesis.md` → `decision.md` → (si aplica) PDP. Ningún documento hace doble función.

## 6. Cómo este enfoque sigue simplificando el SDC

- El gate no depende de que exista investigación — cubre deuda técnica, seguridad, regulación y negocio con el mismo mecanismo, sin inventar un proceso paralelo para cada origen.
- `decision.md` es deliberadamente chico — seis campos, no una plantilla de varias secciones. El costo de registrar un Rechazado o un Pospuesto sigue siendo mínimo.
- La separación evidencia/decisión evita un riesgo concreto: que alguien lea `sintesis.md` en el futuro y no pueda distinguir qué observaron los usuarios de qué decidió el PO hacer con eso — especialmente relevante si una decisión se revierte más adelante y la evidencia original sigue siendo válida.
- El PDP se sigue reservando para cuando hace falta una fuente de verdad citable por otro ciclo — no cambia respecto de v2.

## 7. Ejemplo aplicado (ilustrativo, no ejecutado)

Si la próxima ronda de investigación para `dashboard-claridad` termina en una síntesis con H2 confirmada (frecuencia alta, confianza alta) y H4 refutada:

```
docs/research/dashboard-claridad-2026-XX/
├── entrevistas/
│   ├── entrevista-01.md
│   └── ...
├── sintesis.md          — matriz de hipótesis, citas, clasificación. Sin decisión.
└── decision.md           — "Aprobado, evolución relevante (toca Dashboard) → PDP-002.
                             Rechazado H4 → registrado, sin PDP para esa parte."
```

`PDP-002` cita `sintesis.md` como evidencia y `decision.md` como el registro formal de que el PO decidió avanzar — dos documentos, dos funciones, ninguna mezclada.

---

## 8. Qué queda explícitamente fuera de esta institucionalización

- No modifica ninguna capacidad funcional del producto ni abre ningún ciclo `openspec/` — la institucionalización es exclusivamente metodológica.

## 9. Decisión de aplicación (cierra el documento, 2026-08-06)

**El Decision Gate no se aplica retroactivamente al ciclo de `dashboard-claridad` ya en curso.** Aplica principio de no-retroactividad ratificado el mismo día: *"Las normas metodológicas rigen para los ciclos iniciados después de su institucionalización, salvo que el Product Owner autorice expresamente una aplicación retroactiva"* (memoria persistente del SDC, principio 7). El primer ciclo que ejecuta un Decision Gate bajo esta metodología será la próxima ronda de investigación con usuarios, no `dashboard-claridad`.

---

**Estado**: **completamente cerrado**. Institucionalización ejecutada y verificada (`docs/governance/INFORME-CIERRE-PROP-001.md`). Decisión de aplicación resuelta (§9). No quedan puntos abiertos sobre este documento.
