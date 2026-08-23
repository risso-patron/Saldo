# RETRO-001 — `metas-exposicion`

**Ciclo retrospectivo de**: capability `metas-exposicion` (change `saldo-v1-1-claridad-financiera`)
**Fecha**: 2026-08-06
**Alcance de este documento**: mejora continua del proceso (SDC — SALDO Development Cycle). No contiene código ni modifica artefactos de `openspec/`.

---

## 1. ¿Qué funcionó especialmente bien?

- **Acotar el ciclo a una sola capability.** PDP-001 y la propuesta cubrían 4 capabilities (`metas-exposicion`, `dashboard-claridad`, `onboarding-flow`, `dinero-pendiente`). Diseñar, especificar, planear e implementar **solo** `metas-exposicion` — dejando el resto explícitamente fuera en cada fase — permitió cerrar un ciclo completo (Discovery→Completed) en una sola sesión, sin ambigüedad de alcance en ningún gate.
- **Escalación honesta en vez de recomendación forzada.** Cuando ninguna alternativa de navegación cumplía simultáneamente R-08 y "visibilidad de módulo principal" (hallazgo E1), el diseño lo comunicó como riesgo abierto en vez de maquillar una recomendación. El PO pudo decidir con la información real.
- **Verificación contra fuente primaria, no contra comentarios de código.** El diseño detectó que el comentario de `dsNavItems.js` citaba mal R-08 ("≤ 7 destinos") porque se instruyó explícitamente a verificar el texto literal en el documento fuente (`Saldo Design Review Guide.dc.html`) en vez de asumir que el comentario del código era correcto.
- **Gate documental (Implementation Plan) antes de tocar código.** Verificar línea por línea el plan contra el estado real del repo (no solo contra los artefactos SDD) antes de `sdd-apply` no encontró desviaciones — pero el punto es que el mecanismo existía para encontrarlas si las hubiera habido.
- **TDD estricto con evidencia real, no declarada.** El verify-report reconstruyó cada ciclo RED→GREEN contra `git diff` y ejecución actual, no contra lo que `tasks.md` decía que había pasado.
- **Verificación independiente del orquestador en cada gate hacia el PO.** En vez de reenviar el reporte del sub-agente tal cual, se corrió `npm test`/`npm run lint`/`git diff` de nuevo antes de cada checkpoint con el PO. No hubo discrepancias esta vez, pero es lo que le da peso real a la palabra "verificado".
- **Separación de alcance entre capabilities hermanas.** `DashboardHome.jsx` se tocó solo para wiring (`goals`/`onNavigate` + un botón de texto), dejando la composición visual explícitamente para `dashboard-claridad` — evitó que una capability invadiera el territorio de la siguiente.

## 2. ¿Qué problemas aparecieron y cómo se resolvieron?

| Problema | Cómo se resolvió |
|---|---|
| El survey de arquitectura inicial (sdd-explore) citó R-08 como "≤7 destinos, 4 usados", tomando el comentario del código como fuente de verdad. Esto casi se convierte en premisa de diseño incorrecta en la propuesta. | `sdd-design` fue instruido a verificar el texto literal contra la fuente primaria — encontró que R-08 es tope duro de 4, y que "≤7 destinos" es una regla distinta (del Sidebar de la Constitution) mezclada por error en el comentario. |
| El Product Blueprint no contempla "Metas" como superficie de navegación en absoluto — esto no apareció en el survey inicial, recién en `sdd-design`. | Se documentó como hallazgo (H3) y se usó para descartar alternativas que hubieran ido contra la arquitectura de superficies ya definida. No bloqueó el ciclo, pero podría haberse detectado una fase antes. |
| `GoalManager` ya tenía una violación preexistente del Blueprint (gamificación: confetti/trofeo/animaciones) que nadie había registrado. | Se documentó como deuda técnica (E2) en `integration-debt.md`, con ticket propio, sin bloquear ni redefinir el componente (instrucción explícita del PO de no tocar su comportamiento funcional). |
| `docs/design/integration-debt.md` terminó modificado fuera de la lista literal de "archivos autorizados" del Implementation Plan — porque se editó durante `sdd-design` (antes de que existiera un Implementation Plan que lo autorizara). | Se clasificó en `sdd-verify` como WARNING de proceso, no funcional (contenido de trazabilidad, decisión ya aprobada) — no bloqueó el cierre, pero expone una brecha real en el mecanismo de gate. |

## 3. ¿Qué partes del flujo podrían simplificarse o automatizarse?

- **Verificación de "archivos autorizados" es manual hoy.** Cada fase revisó `git diff`/`git status` por lectura humana (o de agente) contra una lista en prosa. Un check automatizado (script o test) que compare el diff real contra una lista declarada en `tasks.md`/`implementation-plan.md` cerraría sistemáticamente el tipo de WARNING que apareció con `integration-debt.md`.
- **Resolución de skill-registry no se inyectó automáticamente.** Las 6 fases delegadas reportaron `skill_resolution: none` o `fallback-path` — ninguna recibió el bloque `## Project Standards (auto-resolved)` que el protocolo del orquestador prevé; cada sub-agente tuvo que cargar `sdd-phase-common.md`/`openspec-convention.md` por su cuenta vía ruta explícita en el prompt. Funcionó, pero es trabajo repetido que el orquestador podría evitar inyectando el bloque compacto directamente.
- **Costo de arranque por fase.** Cada una de las 6 fases delegadas (propose/design/spec/tasks/apply/verify) pagó el costo de cargar el skill + docs compartidos + releer los artefactos previos desde cero. Para una capability tan chica (4 archivos de producción), vale la pena explorar un modo "fast-track" que combine spec+tasks en una sola pasada cuando el alcance ya quedó completamente acotado por un gate previo (como el de E1/E2 acá).
- **Coverage medido en aislamiento subestima la cobertura real.** `sdd-verify` corrió coverage limitado a los 4 archivos de test nuevos y reportó números bajos (52-89%) que no reflejan que `App.jsx`/`Omnibar.jsx` tienen suites propias adicionales cubriendo el resto. Estandarizar correr coverage sobre la suite completa, filtrado por archivo, evitaría un número que parece peor de lo que es.

## 4. Aprendizajes a incorporar como estándar

1. **No confiar en comentarios de código como fuente de verdad de reglas de diseño/negocio** — verificar siempre contra el documento fuente antes de usarlos como premisa (aplicó a R-08; puede aplicar a otras reglas citadas en comentarios en el resto del código).
2. **Una capability por ciclo**, incluso cuando la propuesta aprobada cubre varias — hacerlo el default explícito del SDC, no una decisión ad-hoc de PO en cada caso.
3. **Implementation Plan como gate obligatorio** antes de `sdd-apply` para cualquier capability, no solo para ésta — el costo (un documento breve) es bajo comparado con lo que hubiera costado detectar una desviación de alcance ya en código.
4. **Verificación independiente del orquestador** (correr tests/lint/diff de nuevo, no solo leer el reporte del sub-agente) en cada gate que llega al PO — mantenerlo en Product Acceptance aunque se relaje en checkpoints intermedios de menor riesgo.
5. **Escalar explícitamente cuando ningún camino cumple el 100% de los objetivos** — el patrón de E1 (documentar el trade-off en vez de forzar una recomendación falsa) debería ser el comportamiento esperado, no la excepción.

## 5. Riesgos identificados para `dashboard-claridad`

- **Acoplamiento de contrato.** `dashboard-claridad` va a componer visualmente la sección "Mis metas" sobre el wiring (`goals`/`onNavigate`) que dejó `metas-exposicion`. Si necesita cambiar la forma de ese contrato, va a tocar `App.jsx` y potencialmente reabrir código de esta capability ya cerrada — el diseño de `dashboard-claridad` debería tratar ese contrato como dado, no renegociarlo salvo necesidad real.
- **`DashboardHome.jsx` como punto de convergencia de varias iniciativas.** Esta capability, `dashboard-claridad`, y eventualmente `insights-ia-real` (cuando implemente "una idea sobre tu plata") van a tocar el mismo archivo. Sin coordinación de orden, hay riesgo de conflictos de merge o de que una capability pise composición visual de otra.
- **El disparador actual ("Mis metas" como link de texto) es un placeholder, no el diseño final.** `dashboard-claridad` necesita **reemplazarlo** al componer la sección real, no agregar un segundo punto de entrada — vale la pena dejarlo explícito en su propio design.md para no duplicar UX.
- **La brecha "Blueprint no contempla X" puede repetirse.** El Blueprint no preveía "Metas" como superficie; no hay garantía de que sí prevea todo lo que `dashboard-claridad` necesita (p. ej., cómo debe verse exactamente la sección "una idea sobre tu plata" cuando no hay historial suficiente — ya resuelto conceptualmente en `insights-ia-real`, pero conviene releerlo en el design de `dashboard-claridad` en vez de asumirlo).
- **Mayor visibilidad de la deuda de gamificación (E2).** Si la composición visual de "Mis metas" en el Dashboard reutiliza literalmente los elementos de `GoalManager` (confetti/trofeo), la violación del Blueprint se vuelve más visible en la superficie más vista de la app. Vale la pena decidir conscientemente antes del design de `dashboard-claridad` si esa exposición es aceptable o si el ticket E2 debería priorizarse antes.

## 6. Recomendaciones concretas para el próximo ciclo del SDC

1. Mantener el Implementation Plan como gate estándar antes de `sdd-apply`, para toda capability futura.
2. Antes de `sdd-explore`/`sdd-design`, verificar cualquier regla de negocio/diseño citada en comentarios de código contra su documento fuente — no asumir que el comentario es correcto.
3. Seguir acotando cada ciclo a una sola capability, aunque la propuesta original cubra varias.
4. Para `dashboard-claridad`: su `sdd-design` debe empezar leyendo explícitamente el contrato dejado por `metas-exposicion` (`goals`/`onNavigate`) y el estado de `insights-ia-real`, y declarar cómo se coordina con ambos antes de proponer alternativas de composición visual.
5. Agregar (como tarea de infraestructura, no de esta capability) un check automatizado que compare el diff real contra los archivos autorizados declarados en cada `implementation-plan.md` — convertiría el WARNING manual de esta ronda en una verificación sistemática.
6. Decidir la prioridad del ticket E2 (gamificación de `GoalManager`) antes de que `dashboard-claridad` le dé más visibilidad al Dashboard.
7. Revisar por qué el bloque `## Project Standards (auto-resolved)` no llegó a inyectarse en ninguna de las 6 fases delegadas de este ciclo, y corregir el mecanismo de inyección del orquestador para el próximo.

---

**Estado**: documento de retrospectiva, no requiere aprobación de Product Acceptance. Insumo para el Discovery de `dashboard-claridad` cuando el PO decida iniciarlo.
