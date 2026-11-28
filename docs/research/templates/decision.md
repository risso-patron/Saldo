# Template — Decision Gate

**Cómo usar esta plantilla**: definida en `docs/governance/PROP-001-etapa-product-decision.md`. Se copia una vez por Decision Gate — no por entrevista, no por ronda de investigación completa (una ronda puede necesitar varios gates si sus hipótesis se deciden en momentos distintos).

**Ubicación de la copia completada**, según el origen del gate:
- Origen investigación/Product Evidence: `docs/research/{tema}-{AAAA-MM}/decision.md`, junto a `sintesis.md` y `entrevistas/`.
- Otro origen (deuda técnica, seguridad, regulación, estrategia de negocio): junto al artefacto que motivó el gate — dentro del `openspec/changes/{change}/` correspondiente si ya existe, o en `docs/governance/` si es una decisión transversal sin change asociado.

**Regla central** (PROP-001 §5): este archivo registra la **decisión**, nunca la evidencia. Si `sintesis.md` u otro documento de evidencia empieza a acumular resultados de gate, se rompe la separación que esta plantilla existe para proteger — mover ese contenido acá.

---

# Decision Gate — {{tema}}

**Origen**: {{Product Evidence / deuda técnica / seguridad / regulación / estrategia de negocio / otro}}
**Evidencia u origen citado**: {{link a sintesis.md, a integration-debt.md, a un hallazgo de seguridad, a un PDP anterior, etc. — siempre un link o referencia verificable, nunca un resumen sin fuente}}
**Fecha**: {{fecha}}
**Responsable**: {{quién decide — el Product Owner}}
**Resultado**: {{Aprobado / Rechazado / Pospuesto / Solicitar más evidencia}}
**Razón**: {{texto — por qué este resultado, no solo cuál}}
**PDP relacionado**: {{link al PDP nuevo, si el resultado fue Aprobado + evolución relevante (PROP-001 §4) — o "no aplica" con una palabra de por qué}}

---

## Evaluación de riesgo (PROP-002 — obligatoria cuando el Nivel de evidencia no es A)

Ver `docs/governance/PROP-002-niveles-de-evidencia.md` para las definiciones completas de cada dimensión y la matriz de decisión. No aplica cuando el Nivel de evidencia disponible es A — la matriz siempre permite avanzar con Nivel A, sin importar el riesgo.

**Nivel de evidencia disponible**: {{A / B / C}}
**Reversibilidad**: {{Alta / Media / Baja}} — {{justificación breve}}
**Costo de corrección**: {{Bajo / Medio / Alto}} — {{justificación breve}}
**Impacto sobre la experiencia del usuario**: {{Bajo / Medio / Alto}} — {{justificación breve; "toca superficie núcleo" es una señal, no un veto automático — evaluar el impacto real de esta decisión específica}}
**Riesgo compuesto**: {{Bajo / Medio / Alto — regla de veto: Alto si cualquiera de las tres dimensiones de arriba está en su nivel más severo}}
**Resultado según matriz**: {{Avanza / Solicitar más evidencia}}

---

## Notas adicionales (opcional)

{{Solo si hace falta más contexto que no entra en "Razón" — ej. condición específica para retomar un Pospuesto, o qué evidencia puntual falta para un "Solicitar más evidencia".}}
