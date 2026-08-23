# Ronda de investigación — H2: destino recurrente desde el Dashboard

**Tipo**: registro formal de una ronda de Product Evidence. Sin conclusiones todavía — esta carpeta solo prepara la estructura para recibir entrevistas reales.
**Fecha de apertura**: 2026-08-07
**Objetivo de investigación aprobado por el Product Owner**: validar o refutar la hipótesis H2 (abajo).
**Origen**: `openspec/changes/saldo-v1-1-claridad-financiera/dashboard-claridad-product-evidence.md` (H2 original) y la investigación documental posterior de C-06 (`docs/governance/GOV-001-jerarquia-documental-de-producto.md`, hallazgo C-06) — la Experience Constitution exige exactamente esta señal (`Saldo Experience Constitution.dc.html:355`) para autorizar que el Dashboard crezca. Ronda independiente de `docs/research/primeros-10-minutos-2026-08/`, que conserva íntegramente su alcance original (H1) y no se modifica por esta apertura.

---

## Hipótesis H2 (única hipótesis de esta ronda)

> Los usuarios abren el Dashboard buscando algo específico que hoy no está ahí, y navegan repetidamente al mismo destino para encontrarlo.

(`dashboard-claridad-product-evidence.md:29`, texto original sin modificar)

**Pregunta que esta ronda existe para responder**: ¿Existe un destino recurrente al que los usuarios vuelven una y otra vez desde el Dashboard, y cuál es?

**Falsable** (`dashboard-claridad-product-evidence.md:29`, texto original): se refuta si *"no existe un destino recurrente único; la navegación post-Dashboard es dispersa o va directo a 'Nuevo movimiento' (que ya es el botón primario)"*.

**Esta ronda no parte de la premisa de que H2 es verdadera.** Puede terminar en cualquiera de tres resultados, y ninguno se anticipa acá:
- **H2 confirmada** — evidencia accionable a favor (ver criterio de accionabilidad abajo).
- **H2 refutada** — evidencia accionable en contra.
- **H2 sin evidencia accionable todavía** — frecuencia aislada o confianza baja (`clasificacion-de-evidencia.md`): no es motivo para concluir nada, es motivo para una ronda adicional específica sobre H2, no para forzar una lectura.

## Alcance de esta ronda (fijado por el PO — no ampliar sin nueva instrucción)

- **Objeto de observación**: exclusivamente el comportamiento de navegación posterior al Dashboard — a qué pantalla/acción vuelve el usuario, con qué frecuencia, y qué tan rápido llega ahí al abrir la app.
- **No se evalúan en esta ronda** (aunque el participante los mencione espontáneamente, se registra como hallazgo fuera de alcance en `hallazgos.md` §5, "señales inesperadas" — no se profundiza en la entrevista):
  - **H1** (activación/primeros 10 minutos) — cubierta por `docs/research/primeros-10-minutos-2026-08/`, ronda separada e intacta.
  - **H3, H4, H5, H6** — hipótesis vecinas del mismo Product Evidence, cada una requiere su propia ronda o ampliación explícita del PO.
  - **C-03** (cifra protagonista vs. trío) y **C-02** (contenido definitivo del Dashboard) — decisiones posteriores en la secuencia (`GOV-001` §4), fuera del objeto de esta ronda.
  - Cualquier decisión de diseño o de implementación — esta ronda produce evidencia, no propuestas.
- **Plantillas institucionalizadas sin modificar**: esta ronda usa `docs/research/templates/entrevista.md` y `docs/research/templates/hallazgos.md` tal como están. No se alteró ningún template para este propósito.

## Estructura de esta carpeta

```
dashboard-h2-destino-recurrente-2026-08/
├── README.md          — este archivo (objetivo, hipótesis, alcance)
└── entrevistas/        — una carpeta vacía, lista para recibir las entrevistas reales
```

`sintesis.md` y `decision.md` **no se crean todavía** — corresponden a fases posteriores del proceso (después de tener entrevistas reales registradas, y después del Decision Gate respectivamente). Crearlos ahora, vacíos, anticiparía una estructura de conclusiones antes de que exista evidencia.

## Cómo registrar cada entrevista

1. Copiar `docs/research/templates/entrevista.md` a `entrevistas/entrevista-{NN}.md` (numeración secuencial, dos dígitos: `01`, `02`, ...).
2. Completar la metadata de esa copia con:
   - **Ronda de investigación**: `dashboard-h2-destino-recurrente-2026-08`
   - **Hipótesis a explorar**: `H2` (texto completo arriba)
   - Resto de los campos (participante, fecha, entrevistador/a, consentimiento) según corresponda a esa sesión real.
3. Usar el **Bloque 1** (Apertura) como contexto, y del **Bloque 3** ("qué busca y a dónde va") únicamente las preguntas directamente ligadas a H2 — sin reinventarlas, son las que el template ya trae:
   - *"La última vez que abriste SALDO antes de hoy, ¿qué buscabas encontrar?"*
   - *"Mostrame qué tocaste para llegar ahí."* — la que habilita Confianza Alta por demostración en vivo, no solo relato.
   - *"¿Hay algo que revisás seguido acá y que te toma más de un toque llegar?"*
   La pregunta sobre progreso de metas (ligada a H3) y la de "qué es lo primero que mirás" (ligada a H5) no son el foco de esta ronda — si el participante responde algo relevante ahí de todos modos, se registra como señal fuera de alcance, no como evidencia de H2. Los Bloques 2 y 4 (apertura de la app, acciones más allá de cargar movimientos) no son el foco de esta ronda.
4. Inmediatamente después de cada sesión, copiar `docs/research/templates/hallazgos.md` junto a la entrevista correspondiente y completarlo, respetando la separación estricta que el propio template exige entre sus cuatro categorías — **nunca mezclarlas**:
   - **Observaciones** (§1): lo que el participante *hizo*, hecho verificable, no interpretado.
   - **Citas textuales** (§2): lo que el participante *dijo*, palabras exactas, con el contexto de la pregunta.
   - **Hipótesis confirmadas/refutadas** (§3-4): solo con referencia directa a una Observación o Cita de arriba — nunca una impresión general del entrevistador.
   - **Señales inesperadas** (§5): lo que aparece fuera del alcance de esta ronda (H1, H3-H6, o cualquier otra cosa).
   No se interpreta todavía si H2 queda confirmada o refutada — eso es tarea de `sintesis.md`, no de `hallazgos.md`.

## Participantes — sin número fijo

No se fija un N de arranque: ningún documento institucional del proyecto establece un mínimo numérico. El criterio real es doble, ya institucionalizado (`docs/research/templates/clasificacion-de-evidencia.md`, `docs/research/templates/sintesis.md:30`):
- **Cobertura cualitativa mínima**: al menos un perfil con miedo a "perder el control" (José, Ana) y uno con miedo a "no ver la foto completa" (Luis) — los dos miedos más directamente relacionados con qué se busca desde el Dashboard (`docs/product-master/02-quien-es-nuestro-usuario.md`).
- **Criterio de saturación** (regla de parada, no de arranque): si las últimas 2-3 entrevistas no aportan hallazgos nuevos sobre H2, la hipótesis se considera saturada con la evidencia disponible.

## Qué constituye evidencia accionable

Regla ya fijada en `docs/research/templates/clasificacion-de-evidencia.md:43`, sin modificar: H2 pasa a informar una decisión de producto cuando cumple **simultáneamente** Frecuencia Media o Alta **y** Confianza Media o Alta. Impacto Alto con Frecuencia Aislada o Confianza Baja no es motivo para actuar — es motivo para una ronda adicional específica.

## Qué sigue después de las entrevistas (fuera de alcance de este registro)

Cuando existan entrevistas reales registradas: elaborar `sintesis.md` (matriz de H2 con frecuencia/confianza/impacto, sin decisión) → ejecutar el **Decision Gate** (`docs/governance/PROP-001-etapa-product-decision.md`) → `decision.md` (separado de la evidencia, con el bloque de riesgo de `PROP-002` si el nivel no es A) → PDP solo si corresponde. Ninguno de esos pasos se ejecuta todavía — esta carpeta solo deja lista la estructura para recibir la evidencia.

**Importante, ya establecido en la investigación previa de C-06**: que H2 resulte confirmada y accionable no satisface automáticamente C-06 — eso sigue siendo una decisión del Product Owner en el Decision Gate, informada por esta evidencia, no derivada mecánicamente de ella.

---

**Estado**: estructura preparada, sin entrevistas registradas todavía. Sin conclusiones, sin propuestas de producto, sin ciclo SDD iniciado.
