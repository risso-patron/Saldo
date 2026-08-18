# Resumen final: C-08 — Contraste `text/tertiary` — COMPLETED

**Hallazgo**: `C-08` (`docs/governance/GOV-001-jerarquia-documental-de-producto.md`, registrado originalmente en `docs/design/integration-debt.md:24`, 2026-07-17)
**Fecha de cierre**: 2026-08-08
**Product Acceptance / QA visual**: otorgada por el PO (Luis), 2026-08-08

---

## Objetivo original

La Design Constitution definía `text/tertiary` (`#9E9E9E`) con la excepción *"uso permitido solo en ≥14px"*, mientras que los propios mockups de la Constitution y del resto del corpus de diseño usaban ese color en tamaños menores (10-13px) en los mismos roles tipográficos que el código replica (Overline, Caption, navegación inactiva, metadatos). GOV-001 lo registró como *"ambigüedad constitucional real"*, tocando R-09 (`Saldo Design Review Guide.dc.html`, *"la accesibilidad no puntúa: bloquea"*). El objetivo de C-08 fue determinar si esa excepción tenía fundamento técnico real y, si no, resolver la contradicción de forma mínima y trazable — no una limpieza cosmética.

## Correcciones realizadas

**Verificación técnica (fase de investigación)**: cálculo de contraste WCAG mediante la fórmula de luminancia relativa estándar (script Node, reproducible) confirmó que la excepción "≥14px" no tenía fundamento — el umbral real de "texto grande" en WCAG es ≥18.66px negrita / ≥24px regular, no 14px; y `#9E9E9E` no alcanza ni el umbral más laxo (3:1) a ningún tamaño en modo claro.

**Regla normativa**: corregida en `Saldo Design Constitution.dc.html` (swatch §01·04 y segunda mención en §15 "Accesibilidad") — eliminada la excepción de tamaño sin fundamento, sin introducir una nueva, sin crear un token nuevo, conservando `tertiary` en el sistema para usos no textuales.

**Migración de color** (`tertiary` → `secondary` en texto/íconos informativos que no cumplían AA):
- **Mockups** (7 documentos: Design Constitution, Product Blueprint, Dashboard, Historial, Nuevo Movimiento, Flow 01, Design Review Guide): 263 ocurrencias en la primera pasada de migración automatizada (texto <14px + íconos) + 26 en la segunda pasada (etiquetas 14-15px y sufijos decimales de cifra protagonista).
- **Código de producción**: 30 instancias directas en ~13 componentes (Overline, Caption, navegación inactiva, iconografía funcional, placeholders, decimales de cifra protagonista), más el token base `.text-ds-overline` en `src/index.css`, que benefició automáticamente a los consumidores sin tocarlos.
- **Excepciones preservadas deliberadamente, no migradas**: 12 anotaciones editoriales (Flow 01 ×7, Product Blueprint ×5 — documentación de diseño, no UI real), 1 specimen visual del color terciario (Design Constitution, demuestra el tono, no es texto informativo), 1 ejemplo de copy explícitamente rechazado (par Sí/No de la sección "Personalidad", documentado con comentario HTML explicativo), 2 barras de skeleton loading (`background:`, no `color:`, decorativas).

**`dashboard-claridad-discovery.md`**: corregidas dos citas que quedaban desactualizadas por esta migración (línea 121: "Insights"→"Ideas" y número de línea del Blueprint; línea 123: cita de la regla "≥14px" ya inválida) — ninguna otra parte de `dashboard-claridad` fue tocada.

### Corrección Dark Mode (hallazgo posterior al cierre inicial, dentro del mismo alcance de C-08)

El QA visual manual detectó que `.text-ds-caption` y `.text-ds-overline` tenían el color de la migración anterior **hardcodeado como hex literal** (`color: #6B6B6B`) en vez de referenciar `var(--ds-text-secondary)` — funcionaba correctamente en claro (mismo valor) pero no respondía a `html.dark`, dando `#6B6B6B` también en oscuro (3.353:1 sobre `#0F172A`, bajo AA). Verificado que el hardcodeo de `.text-ds-caption` era preexistente a esta sesión (`git show HEAD`); el de `.text-ds-overline` se originó en la corrección de C-08 misma, al preservar el mismo patrón de hardcodeo que ya tenía `.text-ds-caption` en vez de migrar a variable.

**Corrección aplicada** (único archivo: `src/index.css`, 2 líneas): ambas clases ahora usan `color: var(--ds-text-secondary)`. Verificado con build real (`npx vite build` a directorio temporal, eliminado tras la inspección) que el CSS compilado refleja la variable, no un hex fijo.

## Evidencia de contraste WCAG (fórmula de luminancia relativa estándar, recalculada en cada fase)

| Combinación | Ratio | Resultado |
|---|---|---|
| `secondary` claro sobre blanco (#FFFFFF) | 5.329:1 | ✅ AA texto normal (≥4.5:1) |
| `secondary` claro sobre base (#FAFAFA) | 5.106:1 | ✅ AA |
| `secondary` oscuro sobre base (#0F172A) | 7.077:1 | ✅ AA |
| `secondary` oscuro sobre superficie elevada (#1E293B) | 5.799:1 | ✅ AA |
| `secondary` oscuro sobre superficie hundida (#0B1220) | 7.422:1 | ✅ AA |
| *(Referencia, pre-corrección Dark Mode)* `#6B6B6B` hardcodeado sobre #0F172A | 3.353:1 | ❌ No AA — ya corregido |
| *(Referencia, `tertiary` original antes de C-08)* `#9E9E9E` sobre blanco | 2.679:1 | ❌ No AA — ya corregido |

## Evidencia de tests

`npx vitest run` — **72/72 archivos, 784/784 tests, verde** — verificado en la corrida final tras la corrección de Dark Mode, y en cada fase intermedia de C-08.

## `git diff --check`

Limpio, `exit 0`, en la verificación final tras la corrección de Dark Mode y en cada fase anterior de C-08.

## Resultado del QA visual manual (PO, 2026-08-08)

| Superficie | Light | Dark |
|---|---|---|
| Dashboard | OK | OK |
| Historial | OK | OK |
| Nuevo movimiento | OK (excepto hallazgo B, ver abajo) | OK |
| Omnibar | OK | OK |
| Toggle Light/Dark | OK | — |

## Excepciones legítimas (dentro del alcance de C-08, no migradas por diseño)

- 12 anotaciones editoriales (Flow 01, Product Blueprint) — documentación de diseño, no UI real del producto.
- 1 specimen visual del swatch `tertiary` (Design Constitution) — demuestra el color, no es texto informativo.
- 1 ejemplo de copy rechazado (par Sí/No, sección "Personalidad") — atenuado deliberadamente como recurso retórico del propio documento; documentado con comentario HTML explícito para evitar falsas detecciones futuras.
- 2 barras de skeleton loading (Historial, `background:` no `color:`) — decorativas, no sujetas a contraste de texto.
- Definición del token `--ds-text-tertiary` en `src/index.css` — el token permanece en el sistema; solo se retiró su uso como color de texto/ícono informativo.

## Deudas explícitamente fuera de alcance de C-08

- **Experience Constitution** (`Saldo Experience Constitution.dc.html`) — conserva 13 Overlines en `#9E9E9E` sin corregir, por instrucción explícita del PO de no tocar ese documento. Queda como inconsistencia externa conocida, no resuelta.
- **`src/styles/themes/light.js` / `dark.js`** — sistema de tokens de color legacy, con nombres iguales pero valores distintos a los tokens `ds-*` (`tertiary` ahí es `#f3f4f6`/`#374151`, no `#9E9E9E`/`#7A7A7A`). Verificado huérfano: `grep` no encuentra ningún import de estos archivos en `src/`. No conectado al Design System actual, no tocado.
- **240 errores preexistentes de ESLint** (`no-undef` en 6 archivos de test por falta de `globals.vitest` en `eslint.config.js`, más 1 `react-refresh/only-export-components` en `EstadoSinResultados.jsx`) — verificados como 100% preexistentes a cualquier trabajo de esta sesión (`git show HEAD` reproduce los mismos errores en las versiones commiteadas). Deuda de configuración global, no de C-08.

## Hallazgo B — selector nativo de Categoría/Moneda (registrado, no corregido)

**Qué es**: en Light Mode, las opciones del `<select>` nativo de Categoría y Moneda aparecen con contraste insuficiente (reportado como "blanco/invisible" en QA visual). En Dark Mode se ven correctamente.

**Dónde**:
- `src/components/NewMovement/NewMovementSheet.jsx` — selector de Categoría (líneas ~324-336) y de Moneda (líneas ~361-373).
- `src/components/Transactions/EditTransactionModal.jsx` — mismo patrón en Categoría y Moneda. Confirmado que este componente está realmente montado en producción (vía `TransactionItem.jsx`, usado por `TransactionList.jsx` y `Omnibar.jsx`), no es código huérfano.

**Causa raíz**: ninguno de estos `<select>`/`<option>` tiene un `color` de autor definido — ni `tertiary`, ni `secondary`, ninguno. Solo el fondo (`bg-ds-surface-sunken`) está tokenizado. El navegador decide el color del popup nativo de opciones según `color-scheme` (`light`/`dark`, ya seteado correctamente en `html.light`/`html.dark`) y su propia lógica interna — con el fondo forzado vía token pero sin color de texto de autor, el resultado en claro es contraste insuficiente. No es un hardcodeo de color incorrecto (como fue C-08) — es **ausencia total** de token de color de texto en un control nativo, combinado con una limitación conocida y documentada de la plataforma web para estilizar completamente el popup de `<option>`.

**Alcance**: 4 selectores en 2 componentes montados en producción (creación y edición de movimientos). Categorías existentes y todas las opciones del listado, no un subconjunto — no es específico de hover/focus/selected.

**Riesgo si no se corrige**: bajo-medio — afecta legibilidad en un flujo de uso frecuente (elegir categoría), solo en Light Mode.

**Corrección mínima posible (no implementada, no autorizada)**: agregar `text-ds-text-primary` o `text-ds-text-secondary` explícito a los 4 `<select>` — sin garantía total de que el navegador lo respete en el popup nativo (limitación de plataforma, no de este código); una corrección más robusta implicaría reemplazar el `<select>` nativo por un listbox custom, fuera del alcance de una corrección mínima.

**Clasificación**: **B — bug de accesibilidad relacionado con el Design System, fuera del alcance exacto de C-08.** No fue corregido ni incorporado a este cierre, por decisión del PO.

## Declaración de alcance

**C-08 queda cerrado respecto de su alcance definido y con las verificaciones realizadas** — la regla de contraste `tertiary`/`secondary`, su aplicación en Overline, Caption, navegación inactiva, iconografía funcional, placeholders y cifras protagonistas, en el código de producción y en los 7 documentos de mockup dentro del alcance autorizado, y su correcto comportamiento en Light y Dark Mode. **C-08 no garantiza la ausencia de otros problemas de accesibilidad fuera de este alcance** — quedan registradas como deudas separadas la Experience Constitution, los legacy themes, la deuda de configuración de ESLint, y el Hallazgo B del selector nativo.

---

## Estado

**CLOSED.**
