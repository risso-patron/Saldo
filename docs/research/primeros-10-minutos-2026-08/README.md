# Ronda de investigación — Primeros 10 minutos

**Tipo**: registro formal de una ronda de Product Evidence. Sin conclusiones todavía — esta carpeta solo prepara la estructura para recibir entrevistas reales.
**Fecha de apertura**: 2026-08-07
**Objetivo de investigación aprobado por el Product Owner**: validar o refutar la hipótesis H1 (abajo).
**Origen**: continúa la línea de investigación abierta en `openspec/changes/saldo-v1-1-claridad-financiera/dashboard-claridad-product-evidence.md` (H1 original: *"Los usuarios nuevos no entienden qué hacer al abrir SALDO por primera vez, y eso frena la activación"*). El PO refinó esa hipótesis para esta ronda específica — ver H1 abajo, es la versión vigente para esta ronda.

---

## Hipótesis H1 (única hipótesis de esta ronda)

> Los nuevos usuarios comprenden el propósito general de SALDO, pero tienen dificultades para descubrir cuál es el siguiente paso después de registrar sus primeros movimientos.

Falsable: se refuta si los usuarios, tras registrar sus primeros movimientos, identifican sin ayuda externa qué hacer a continuación (revisar el Dashboard, cargar otro movimiento, explorar otra sección) sin dudar ni buscar orientación.

## Alcance de esta ronda (fijado por el PO — no ampliar sin nueva instrucción)

- **Ventana de observación**: exclusivamente los primeros 10 minutos de uso de la aplicación — desde la apertura hasta después de registrar los primeros movimientos.
- **No se evalúan** en esta ronda: funcionalidades nuevas, monetización, ni módulos avanzados (Metas, Herramientas, Ideas, etc.) — aunque el participante los mencione espontáneamente, se registra como hallazgo fuera de alcance (`hallazgos.md` §5, "señales inesperadas"), no se profundiza en la entrevista.
- **Plantillas institucionalizadas sin modificar**: esta ronda usa `docs/research/templates/entrevista.md` y `docs/research/templates/hallazgos.md` tal como están. No se alteró ningún template para este propósito.

## Participantes — orientación de cobertura (sin número fijo)

No se fija un N de arranque: ningún documento institucional del proyecto establece un mínimo numérico para esta ronda. El criterio real es doble:

- **Orientación de cobertura cualitativa** (heredada del Product Evidence de origen, `openspec/changes/saldo-v1-1-claridad-financiera/dashboard-claridad-product-evidence.md:54`): *"vale la pena priorizar entrevistas que cubran al menos un perfil con miedo a 'perder el control' (José, Ana) y uno con miedo a 'no ver la foto completa' (Luis)"* — los dos miedos más directamente relacionados con qué debería protagonizar el Dashboard. Es una orientación de selección, no un requisito cuantitativo ni una distribución fija (no implica 50/50 ni ningún otro reparto).
- **Criterio de saturación** (regla de parada, no de arranque, ya definido en `docs/research/templates/sintesis.md:30`): si las últimas 2-3 entrevistas no aportan hallazgos nuevos sobre H1, la hipótesis se considera saturada con la evidencia disponible.

**Población objetivo**: usuarios reales de SALDO (`docs/research/README.md:3`), no proxies ni personas ajenas al producto.

## Duración práctica de esta ronda

Núcleo de H1 (Bloques 1-2 del template, `docs/research/templates/entrevista.md:31-44`): **7-10 minutos** (Apertura 2-3 min + Bloque de comportamiento — apertura de la app 5-7 min) — son los tiempos ya fijados por el template general, sin modificarlos.

Si el tiempo y el consentimiento lo permiten, la sesión puede continuar con el cierre exploratorio (Bloques 3-5, hasta completar el rango de 20-30 min del template general), tal como ya indica la sección "Cómo registrar cada entrevista" de este documento. Esos bloques adicionales siguen siendo opcionales y no forman parte del núcleo de H1: sus hallazgos no validan ni refutan H1, se registran como señales fuera de alcance (`hallazgos.md` §5), igual que cualquier otro tema fuera de la ventana de los primeros 10 minutos.

## Estructura de esta carpeta

```
primeros-10-minutos-2026-08/
├── README.md          — este archivo (objetivo, hipótesis, alcance)
└── entrevistas/        — una carpeta vacía, lista para recibir las entrevistas reales
```

`sintesis.md` y `decision.md` **no se crean todavía** — corresponden a fases posteriores del proceso (después de tener entrevistas reales registradas, y después del Decision Gate respectivamente). Crearlos ahora, vacíos, anticiparía una estructura de conclusiones antes de que exista evidencia.

## Cómo registrar cada entrevista

1. Copiar `docs/research/templates/entrevista.md` a `entrevistas/entrevista-{NN}.md` (numeración secuencial, dos dígitos: `01`, `02`, ...).
2. Completar la metadata de esa copia con:
   - **Ronda de investigación**: `primeros-10-minutos-2026-08`
   - **Hipótesis a explorar**: `H1` (texto completo arriba)
   - Resto de los campos (participante, fecha, entrevistador/a, consentimiento) según corresponda a esa sesión real.
3. Usar únicamente los bloques 1 y 2 de la guía de entrevista (Apertura + Bloque de comportamiento — apertura de la app) como núcleo — son los que caen dentro de la ventana de 10 minutos. Los bloques 3-5 del template general exploran más allá de esa ventana (navegación posterior, acciones más allá de cargar movimientos) — si el tiempo y el consentimiento lo permiten, se pueden usar como cierre exploratorio, pero **no son el foco de esta ronda** y sus hallazgos, si aparecen, se registran como señales fuera de alcance, no como validación de H1.
4. Inmediatamente después de cada sesión, copiar `docs/research/templates/hallazgos.md` junto a la entrevista correspondiente y completarlo — sin interpretar todavía si H1 queda confirmada o refutada (eso es tarea de `sintesis.md`, no de `hallazgos.md`).

## Qué sigue después de las entrevistas (fuera de alcance de este registro)

Cuando existan entrevistas reales registradas: elaborar `sintesis.md` (matriz de H1 con frecuencia/confianza/impacto) → ejecutar el Decision Gate → `decision.md` → PDP solo si corresponde (`docs/governance/PROP-001-etapa-product-decision.md`). Ninguno de esos pasos se ejecuta todavía — esta carpeta solo deja lista la estructura para recibir la evidencia.

---

**Estado**: estructura preparada, sin entrevistas registradas todavía. Sin conclusiones, sin propuestas de producto, sin ciclo SDD iniciado.
