# Design: SALDO v1.1 — Exposición de Metas dentro de R-08

**Alcance de ESTE documento**: SOLO la capability `metas-exposicion` (cómo se alcanza Metas en la navegación).
`onboarding-flow`, `dashboard-claridad` y `dinero-pendiente` se diseñan en iteraciones posteriores; `insights-ia-real` no se toca.

## Hallazgos constitucionales (verificados, no asumidos)

| # | Fuente | Texto literal | Consecuencia |
|---|---|---|---|
| H1 | `docs/design/review/Saldo Design Review Guide.dc.html:144` | R-08: "Romper el presupuesto de superficie: **5.º destino de navegación**, 2.º FAB, 2.ª capa modal, 2.ª nota." + línea 60: "¿Respeta el presupuesto de superficie? **(4 destinos, 1 nota, 1 modal)**" | R-08 es **tope duro de 4**, no "≤7". Una 5.ª pestaña **bloquea** la revisión. |
| H2 | `src/components/ds/dsNavItems.js:6` | "regla R-08, «≤ 7 destinos, 4 usados»" | **Comentario erróneo**: mezcla la regla del componente Sidebar de la Constitution ("≤ 7 destinos") con R-08. Debe corregirse. |
| H3 | `Saldo Product Blueprint.dc.html:236` | "Presupuestos y **metas — como contexto del mes** («tu media», «tu límite»), nunca como gamificación." | El Blueprint escala Metas como **contexto**, no como superficie. No existe superficie "Metas" en su arquitectura (Dashboard, Hoja, Historial, Insights, Perfil, Importación, Suscripción, ⌘K). |
| H4 | `src/App.jsx:471` | `planificacion` monta `CreditCardManager` + `BudgetManager` + `RecurringManager` + `GoalManager` (4.º, al final) | La quick action "Mis Metas" del Omnibar (`Omnibar.jsx:56`) **no aterriza en Metas**: aterriza en una pila de 4 módulos. Viola reglas inquebrantables 01 y 02 (una pregunta / una cifra protagonista por vista). |

## Alternativas evaluadas

| Opción | Ventajas | Desventajas | Impacto técnico | Objetivos PO |
|---|---|---|---|---|
| **A. Reemplazar un tab por Metas** (`graficos` o `cuenta`) | Máxima visibilidad; 4 destinos intactos | Insights ("el espejo") y Perfil son superficies **exigidas por el Blueprint**; sacarlas es una regresión mayor a cambio de una promoción | `dsNavItems.js` + acceso alternativo a lo removido | 1✓ 2✓ 3✓ 4✓ — pero rompe el Blueprint |
| **A'. Mover Perfil al pie del Sidebar** (ya existe avatar+nombre, `DSSidebar.jsx:131`) y liberar el 4.º slot para Metas | Reusa una superficie ya construida en desktop | En mobile `DSBottomNav` no tiene pie de usuario → Perfil quedaría sin acceso táctil salvo inventando un avatar en `DSTopBar`: exactamente el "placeholder constitucional" que el PO prohibió extender (`integration-debt.md`, 2026-07-17) | `dsNavItems.js`, `DSSidebar`, `DSBottomNav`, `DSTopBar` | 1✓ 2✓ 3✓ 4✓ — falla mobile-first |
| **B. "Ajustes" como menú (Metas + Cuenta)** | No agrega ítems visibles | Un destino que despliega en vez de navegar deja de ser destino; en mobile un popover sobre la bottom nav de 64px es hostil al pulgar; suma 5 destinos alcanzables (espíritu de R-08) y un nivel de navegación | `DSSidebar` + `DSBottomNav` + estado de apertura | 1⚠ 2✓ 3⚠ 4✓ |
| **C. Metas como sección del Dashboard + vista dedicada sin destino de nav** ← **recomendada** | Es literalmente lo que ordena el Blueprint H3; el Dashboard es donde "toda sesión empieza"; ya figura como sección en PDP-001 §4.2; corrige de paso el mal aterrizaje H4 | Metas no aparece en la barra de navegación (visibilidad de sección de portada, no de destino) | Cambio menor y aditivo | 1✓ 2✓ 3◐ 4✓ |

## Decisiones de arquitectura

### Decisión 1: Metas se expone por Dashboard + vista propia sin slot de navegación

**Elección**: sección "Mis metas" en `DashboardHome` (superficie primaria) → navega a una vista `metas` dedicada que monta `GoalManager` **solo**; el Omnibar (⌘K) queda como atajo experto.
**Alternativas rechazadas**: A, A', B (ver tabla).
**Justificación**: es la única opción que respeta simultáneamente R-08 (H1), la arquitectura de superficies del Blueprint y la regla mobile-first, sin inventar UX fuera del diseño. Además convierte la promoción de Metas en un cambio **aditivo**: no se quita nada a nadie.

### Decisión 2: `metas` es un `activeTab` sin entrada en `DS_NAV_ITEMS`

**Elección**: nuevo id de vista `metas` en `App.jsx`, alcanzable por navegación programática (Dashboard, Omnibar), ausente de `DS_NAV_ITEMS`.
**Alternativas rechazadas**: seguir usando `planificacion` como destino de "Mis Metas".
**Justificación**: `planificacion` apila 4 módulos (H4); una vista con un único protagonista cumple las reglas 01/02. `planificacion` sobrevive intacto con los otros 3 módulos — sin regresión.

### Decisión 3: `GoalManager` no se modifica

**Elección**: se reusa con su firma actual `({ goals, onAddGoal, onUpdateProgress, onDeleteGoal })` y su gating `hasFeature('unlimited_goals')`. Solo cambia dónde se monta.

## Estructura de navegación — antes / después

```
ANTES                                  DESPUÉS
Nav (4)  Inicio Movim. Insights Ajustes    Nav (4)  Inicio Movim. Insights Ajustes   ← sin cambios
                                                      │
⌘K "Mis Metas" ─→ planificacion            Inicio ────┴─→ [sección "Mis metas"] ─→ metas ─→ GoalManager
                   ├ CreditCard                                                      ▲
                   ├ Budget                 ⌘K "Mis Metas" ───────────────────────────┘
                   ├ Recurring
                   └ GoalManager  ← 4.º     planificacion (CreditCard/Budget/Recurring) sigue en ⌘K
```

## File Changes

| Archivo | Acción | Descripción |
|---|---|---|
| `src/App.jsx` | Modify | Nuevo `activeTab === 'metas'` que monta `GoalManager` solo (lazy, `Suspense`); quitarlo de la pila `planificacion`; pasar `onNavigate` a `DashboardHome` |
| `src/components/Shared/Omnibar.jsx` | Modify | Quick action "Mis Metas": `planificacion` → `metas` (corrige H4) |
| `src/components/Dashboard/DashboardHome.jsx` | Modify | Sección "Mis metas" con acción a `metas`. **Composición visual delegada a la iteración `dashboard-claridad`**; acá solo se fija el contrato: recibe metas + `onNavigate('metas')` |
| `src/components/ds/dsNavItems.js` | Modify | **Solo el comentario**: corregir la cita de R-08 (H2). La lista de 4 ítems NO cambia |
| `docs/design/integration-debt.md` | Modify | Nueva fila: `GoalManager` con gamificación (confetti/trofeo) contradice Blueprint §07 — ticket separado (E2), no bloquea esta fase |

## Contratos

```jsx
// App.jsx — vista dedicada, fuera de DS_NAV_ITEMS
{activeTab === 'metas' && (
  <Suspense fallback={<TabLoader />}>
    <GoalManager goals={goals} onAddGoal={handleAddGoal}
      onUpdateProgress={handleUpdateGoalProgress} onDeleteGoal={handleDeleteGoal} />
  </Suspense>
)}
// DashboardHome: props añadidas → goals: Goal[], onNavigate: (tabId: string) => void
```

## Testing Strategy

| Capa | Qué | Cómo |
|---|---|---|
| Unit | `DS_NAV_ITEMS` mantiene **exactamente 4** ítems (guardia de regresión de R-08) | vitest sobre `dsNavItems.js` |
| Integración | `metas` monta `GoalManager` y NO monta CreditCard/Budget/Recurring | @testing-library/react sobre `App` |
| Integración | Quick action "Mis Metas" del Omnibar navega a `metas` | RTL + `onTabSelect` espiado |
| Integración | Sección "Mis metas" del Dashboard dispara `onNavigate('metas')` | RTL |
| Mobile (<768px) | `DSBottomNav` sigue con 4 columnas y sin ítem Metas | RTL + matchMedia |

TDD estricto activo (`openspec/config.yaml: strict_tdd: true`, `npm test`).

## Migration / Rollout

Sin migración: no toca Supabase, ni `localStorage`, ni el modelo de datos. Rollback = revertir commits.

## Riesgos y escalaciones al PO

| # | Riesgo | Acción | Resolución |
|---|---|---|---|
| E1 | **Objetivo 3 se cumple parcialmente.** Ninguna alternativa da a Metas un slot de navegación sin romper R-08 (H1) o sin sacar una superficie del Blueprint. | **Decisión del PO** antes de `sdd-spec` | **Resuelto (2026-08-06):** PO acepta Dashboard + vista dedicada, sin slot de nav. No se enmienda R-08. |
| E2 | `GoalManager` usa `react-confetti`, `TrophyWebP` y `framer-motion` — anti-patrón "El casino" y Blueprint §07 "Rachas, logros, niveles, confeti — jamás debe agregarse". Promoverlo al Dashboard **aumenta la exposición** de una violación existente. | Reportado, **no se corrige acá** (PO: no redefinir GoalManager). | **Resuelto (2026-08-06):** PO pide ticket separado — ver `docs/design/integration-debt.md`, fila 2026-08-06. No bloquea esta fase. |
| E3 | `App.jsx:471` pasa `currentBalance={balance}` a `GoalManager`, que no lo declara — prop muerta | Limpieza menor, oportunista | Sin decisión requerida — se resuelve en `sdd-apply` si corresponde. |

## Open Questions

- [x] E1: **Resuelto** — sección de portada + vista dedicada satisface el objetivo. No se enmienda R-08.
- [x] Vista `metas`: **Ratificada como superficie oficial del Blueprint** (PDP-001 §4.4 eleva Metas a módulo principal; el registro formal en Product Master queda para `sdd-archive`, cuando se sincronizan deltas contra specs/docs oficiales).
