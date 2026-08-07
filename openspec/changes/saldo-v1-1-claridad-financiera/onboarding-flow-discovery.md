# Discovery — `onboarding-flow`

**Fase**: sdd-explore (Discovery funcional + auditoría técnica + evaluación de riesgo PROP-002). **No propone arquitectura, componentes, ni crea `proposal.md`.**
**Change**: `saldo-v1-1-claridad-financiera` — capability `onboarding-flow` (siguiente tras `metas-exposicion`, cerrada, commit `8de52e5`). Prioridad Alta según `PDP-001` §7.
**Fecha**: 2026-08-07
**Ejecutado por**: orquestador directamente (dos intentos de sub-agente fallaron por entorno — stall/reinicio del proceso en background, no por falta de acceso al repositorio; acceso verificado explícitamente antes de empezar).

**Regla aplicada (RETRO-001, ratificada)**: toda cita a `06-onboarding.md`, `PDP-001`, `00-STATE.md` o el código está verificada leyendo el archivo real en este momento, no heredada de resúmenes de sesiones anteriores.

---

## A. Qué dice `docs/product-master/06-onboarding.md` (fuente primaria, leída completa)

Capítulo cerrado el 2026-07-12, "aprobado explícitamente por el usuario" (`00-STATE.md:69-71`), sin contradicciones abiertas según su propio checklist de cierre (`06-onboarding.md:108`).

**Estructura: 3 pasos, no más** (`:19-20`, "más de tres pasos ya es un tutorial disfrazado"):

- **Paso A — Confirmar el porqué** (`:22-32`): opcional, salteable en un toque, una sola frase. El botón de saltear pesa visualmente igual que el de continuar — excepción documentada y justificada a la regla de "un solo llamado a la acción" (cap 03 regla 2), porque ambos botones llevan al mismo resultado funcional.
- **Paso B — Primera acción guiada** (`:34-37`): obligatorio, cargar un movimiento real (ingreso o gasto). Es "el corazón del onboarding" — reemplaza al tutorial, no hay pantalla explicativa antes.
- **Paso C — Confirmación y entrada al Inicio** (`:39-44`): NO es una pantalla nueva. Termina en el Inicio real, mostrando **"el trío de cifras de cap 01, línea 42: 'cuánto entró, cuánto salió y cuánto queda hoy'"**, con el dato recién cargado reflejado ahí. Cita verificada contra `01-la-filosofia.md` — el texto existe, aunque hoy en la línea 68 del archivo actual, no 42 (desfasaje de numeración, no de contenido — ver hallazgo D-3).

**Criterio de "onboarding completo"** (`:47-50`): el usuario ve el Inicio con **al menos un movimiento cargado por sí mismo** — no "completar todos los pasos". Saltear el Paso A y cargar en el Paso B ya cuenta como completo.

**Onboarding interrumpido y retomado** (`:52-57`): decisión de arquitectura explícita, no un detalle — si el usuario cierra la app a mitad del Paso B, debe retomar exactamente ahí, no reiniciar. Justificado con la persona Ana (bloques de 5-10 min, verificado contra `02-quien-es-nuestro-usuario.md:32`).

**Por persona** (`:59-72`, quotes verificados contra `02-quien-es-nuestro-usuario.md:22,32,42`): mismo esqueleto de 3 pasos para las 4 personas, sin flujos separados — cambia solo el énfasis (Rosa no debería saltear el Paso A por defecto; Luis necesita el botón de saltear muy visible; Ana necesita que sobreviva la interrupción; José necesita que no exceda sus bloques de 10 min).

**Nota de vocabulario** (`:74-79`): "Onboarding" es nombre interno, no necesariamente texto de pantalla — si hace falta un indicador visible, usar "primeros pasos" u otro lenguaje simple, no el anglicismo.

**Delegado explícitamente a otros capítulos** (`:81-86`): texto exacto → cap 07 (UX Writing); transiciones/animaciones → cap 08; qué pasa si el Paso B falla → cap 09 (Sistema de Feedback).

## B. Auditoría del código actual — qué existe realmente

Verificado por lectura directa, no por grep superficial:

| Componente | Qué hace realmente | ¿Es el onboarding de cap 06? |
|---|---|---|
| `src/components/Notifications/DailyOnboardingToast.jsx` | Toast "¡Hola de nuevo! ✨" que aparece una vez por día (`localStorage: budgetrp_last_welcome_date`), a los 2s de abrir la app, recordando cargar gastos. | **No.** Es un recordatorio diario recurrente, no un flujo de primer uso. No tiene Paso A/B/C, no distingue usuario nuevo de recurrente. |
| `src/hooks/useOnboardingTip.js` + `src/components/UI/OnboardingBubble.jsx` | Hook + componente genérico de tooltip "dismiss-once por feature" (`localStorage: budgetrp_tip_{id}`). Usado para tips puntuales en distintas pantallas. | **No.** Es infraestructura de tips contextuales reutilizable, no un flujo secuencial de 3 pasos. |
| `App.jsx` — `activeTab` (`useLocalStorage('budgetrp_ui_activeTab', 'resumen')`, línea 232) | Un usuario nuevo aterriza en `'resumen'` (Dashboard) por default. | Coincide con Paso C en el destino final, pero no hay Paso A ni B antes — el usuario llega directo al Dashboard vacío. |
| `DashboardHome.jsx` — `EmptyState` (líneas 51-69) | Un único CTA: **"Registrar un gasto"**. No pregunta el "porqué" (Paso A), no ofrece registrar un ingreso con el mismo peso. | **Parcial.** Es lo más cercano a un "Paso B" hoy, pero contradice parcialmente cap 06 (`:35`, "un ingreso o un gasto, lo que el usuario tenga a mano") — solo ofrece gasto. |
| `AuthContext.jsx` — `signUp` (línea 66) | Registro de usuario funcional. **No existe ningún flag ni estado que distinga "usuario recién registrado" de "usuario recurrente"** — verificado, no hay `isNewUser`/`justRegistered` en todo `src/`. | No aplica onboarding — no hay gancho para dispararlo. |
| `src/components/NewMovement/NewMovementSheet.jsx` | Tiene persistencia de borrador (verificado: existe lógica de `draft` en el componente y su test — corresponde al Checkpoint III-C.2 de una fase anterior del proyecto). | **Relevante para Paso B/interrupción.** Esta infraestructura podría cubrir gran parte del requisito de "retomar donde quedó" sin construir nada nuevo — a confirmar en diseño técnico, no en este Discovery. |

## C. Qué existe, qué falta, qué contradice — tabla comparativa

| Elemento de cap 06 | Estado | Detalle |
|---|---|---|
| Paso A (confirmar el porqué, salteable) | **No implementado** | No existe ninguna pantalla ni componente. |
| Paso B (carga guiada, ingreso o gasto) | **Parcial** | `NewMovementSheet` existe y funciona para carga normal; `EmptyState` ofrece un CTA pero solo para gasto, no ingreso — contradice `06-onboarding.md:35`. |
| Paso B — interrumpido y retomado | **Posiblemente ya cubierto** | Draft persistence de `NewMovementSheet` (III-C.2) podría satisfacerlo — no verificado a nivel de comportamiento exacto en este Discovery, requiere confirmación en diseño técnico. |
| Paso C (Inicio con trío de cifras) | **Contradice el estado actual del Dashboard** | Ver hallazgo D-1 — es el hallazgo más importante de este documento. |
| Criterio de "completo" = 1er movimiento propio | **No implementado** | No hay ningún tracking de si el primer movimiento fue cargado por el usuario vs. importado, ni ninguna lógica que lo use como criterio de cierre de onboarding. |
| Detección de "usuario nuevo" | **No implementado** | Sin esto, no hay forma de disparar Paso A/B ni de diferenciarlo de `DailyOnboardingToast`. |
| Vocabulario ("Onboarding" no es texto de pantalla) | **No aplica todavía** | No hay copy escrito — cap 07 lo resuelve cuando corresponda, no es parte de este Discovery ni bloquea nada. |

**Incompatibilidad técnica que justifique apartarse de cap 06 (per PDP-001 §4.1)**: **no se encontró ninguna.** Todo lo que falta es código no construido, no una limitación técnica del stack (React 19 + hooks existentes). El único gap real no es técnico, es de contenido (ver D-1).

## D. Contradicciones documentales — escaladas, no resueltas

### D-1 — El Paso C de cap 06 exige el "trío de cifras"; el Dashboard actual muestra una sola cifra protagonista

**Esta es la contradicción más importante encontrada.** `06-onboarding.md:41-42` exige textualmente que el Inicio muestre, al cerrar el onboarding, *"el trío de cifras de cap 01... cuánto entró, cuánto salió y cuánto queda hoy"*. Verificado contra el código real (`DashboardHome.jsx:104-143`): hoy el Dashboard muestra **"Saldo disponible"** (una cifra, "queda") y **"Gasto de {mes}"** (solo el gasto del mes actual, no "salió" en su forma completa) — **no muestra "cuánto entró" en ningún lugar del Dashboard**, ni el trío completo.

Esto **no es un hallazgo nuevo aislado** — es exactamente la tensión **C-03** ya documentada en `docs/governance/GOV-001-jerarquia-documental-de-producto.md` §1 (*"una cifra protagonista"* de la Design Constitution regla 02 vs. *"el trío de cifras"* de `00-STATE.md:626`), que hoy sigue **sin resolver** y es parte de por qué `dashboard-claridad` está en estado `WAITING FOR PRODUCT EVIDENCE`.

**Consecuencia concreta para `onboarding-flow`**: implementar el Paso C literalmente, tal como cap 06 lo especifica, requiere que el Dashboard muestre el trío — algo que hoy no existe y que depende de una decisión (C-03) que este Discovery **no puede ni debe resolver**. No lo asumo resuelto ni lo ignoro: lo dejo escalado.

### D-2 — El CTA del estado vacío solo ofrece "gasto", no "ingreso"

`06-onboarding.md:35` es explícito: *"un ingreso o un gasto, lo que el usuario tenga a mano"* — ambos con el mismo peso. `DashboardHome.jsx:60` ofrece un único botón, "Registrar un gasto". No es una contradicción de arquitectura, es un gap de paridad que cualquier implementación de Paso B tendría que corregir — lo registro para que no se pierda, sin proponer todavía cómo resolverlo (eso es diseño técnico).

### D-3 — Cita de línea desactualizada (cosmético, no de contenido)

`06-onboarding.md:42` cita *"cap 01, línea 42"* para el trío de cifras; el texto existe, verificado, pero hoy vive en la línea 68 de `01-la-filosofia.md` — el archivo fue editado después de que cap 06 se cerró y la referencia de línea quedó desactualizada. El contenido citado es correcto; solo el número de línea no lo es. No amerita una entrada de gobernanza propia — lo señalo acá por transparencia, no como hallazgo bloqueante.

## E. Evaluación de riesgo — PROP-002

Aplicando `docs/governance/PROP-002-niveles-de-evidencia.md` (institucionalizado) con razonamiento propio, sin arrastrar automáticamente la conclusión de `dashboard-claridad` solo por ser ambas "superficie núcleo":

### E.1 Nivel de evidencia disponible

**Nivel B.** No hay Nivel A — cero entrevistas registradas todavía (la ronda `docs/research/primeros-10-minutos-2026-08/` está abierta pero sin entrevistas cargadas). Pero cap 06 no es un vacío de evidencia: es un documento de razonamiento heurístico completo, derivado explícitamente de los capítulos 01-05 (misión, personas, principios, arquitectura de experiencia) — exactamente la definición de Nivel B de `PROP-002` §2 ("análisis heurístico contra la Design Constitution/Product Master... con su razonamiento"). Reforzado por `PDP-001` §4.1, una decisión explícita y fresca del PO autorizando implementarlo tal cual.

### E.2 Reversibilidad — Alta

Código nuevo, sin migración de datos. A diferencia del contenido del Dashboard (que un usuario ve todos los días, formando una impresión acumulada), el onboarding se experimenta **una sola vez por usuario** — si la primera versión implementada resulta imperfecta, corregirla no requiere "deshacer" nada para usuarios que ya lo vivieron; solo mejora la experiencia de los siguientes. Esto reduce el argumento de "revertir código no revierte percepción" que sí aplica al Dashboard.

### E.3 Costo de corrección — Bajo

Alcance acotado: 3 pasos ya especificados con precisión (no hay que inventar contenido), copy delegado a cap 07 (no es parte de este alcance), y al menos una pieza de infraestructura relevante (draft persistence de `NewMovementSheet`) ya podría existir. El trabajo real es mayormente wiring de componentes existentes + un flag de "usuario nuevo" + una pantalla nueva (Paso A) — no rediseño de arquitectura.

### E.4 Impacto sobre la experiencia del usuario — Medio

Alto en importancia estratégica (es la primera experiencia, directamente ligado a la hipótesis H1 de `dashboard-claridad-product-evidence.md` sobre dificultad de descubrir el siguiente paso) — pero, a diferencia de `dashboard-claridad`, **no hay una pregunta de producto abierta sobre qué construir**: cap 06 ya cerró esa pregunta, con checklist verificado sin contradicciones (`06-onboarding.md:95-108`). El riesgo real acá es de **fidelidad de ejecución**, no de **incertidumbre de contenido** — por eso no hereda automáticamente el mismo nivel de impacto que el contenido del Dashboard, que sí tiene decisiones abiertas (C-02/C-03). La única excepción real es D-1, que si no se resuelve, hace que el Paso C específicamente sí cargue impacto/incertidumbre de contenido — pero acotado a esa pieza, no al onboarding completo.

### E.5 Riesgo compuesto y resultado según la matriz

Ninguna dimensión cae en su nivel más severo (Reversibilidad no es Baja, Costo no es Alto, Impacto no es Alto) → **Riesgo compuesto: Medio** (por Impacto en nivel intermedio).

Matriz (`PROP-002` §5): Riesgo Medio × Nivel B = **Avanza**.

**Con una salvedad explícita, no una excepción silenciosa**: este veredicto cubre los Pasos A y B, donde no hay dependencia sin resolver. El Paso C, específicamente en su requisito del "trío de cifras", queda condicionado a D-1 — avanzar ahí sin resolver esa dependencia significaría implementar un Paso C que no cumple cap 06 tal como está escrito.

## F. Recomendación de siguiente paso (recomendación, no decisión — el PO dijo explícitamente que no se ejecuta nada sin su aprobación)

1. **`onboarding-flow` puede avanzar a `sdd-propose` con evidencia Nivel B**, según la matriz de PROP-002 — no hace falta Product Evidence adicional para autorizar el ciclo en general.
2. **El Decision Gate correspondiente debería registrar explícitamente D-1 como una dependencia, no ignorarla.** Opciones que un futuro `sdd-propose` podría evaluar (no las desarrollo acá, sería adelantar diseño): (a) implementar el Paso C mostrando el Dashboard tal como existe hoy, documentando conscientemente que no cumple el "trío" literal de cap 06 hasta que `dashboard-claridad` lo resuelva; o (b) esperar la resolución de C-03 antes de cerrar el Paso C. Ninguna de las dos la elijo yo acá.
3. **D-2 (CTA solo de gasto) es un ajuste menor** que cualquier propuesta técnica debería incorporar, sin necesidad de Decision Gate propio — está dentro del alcance ya autorizado por PDP-001 §4.1.
4. **No se encontró ninguna incompatibilidad técnica** que justifique diseñar un flujo distinto al de cap 06 — la única razón válida para desviarse (per PDP-001 §4.1) no aplica.

---

**Estado**: Discovery + evaluación de riesgo completos. Sin propuesta técnica, sin `proposal.md`, sin cambios ejecutados. D-1 queda escalada, no resuelta. A la espera de tu aprobación para decidir cómo seguir.
