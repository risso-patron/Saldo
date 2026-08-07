# metas-exposicion Specification

**Alcance de esta iteración**: cubre SOLO `metas-exposicion` (cómo se alcanza Metas dentro de R-08). `onboarding-flow`, `dashboard-claridad` y `dinero-pendiente` se especifican en iteraciones posteriores, cada una tras su propio `sdd-design`. `insights-ia-real` no se toca.

## Purpose

Hacer alcanzable el módulo Metas (`GoalManager`, ya funcional) sin agregar un 5.º destino de navegación (R-08, tope duro de 4) y sin apilarlo junto a otros 3 módulos bajo `planificacion` (regresión de las reglas 01/02, una pregunta/una cifra por vista).

## Requirements

### Requirement: Vista `metas` fuera de la barra de navegación

El sistema MUST exponer una vista `metas` alcanzable vía `activeTab === 'metas'` en `App.jsx`, y esta vista MUST NOT tener entrada en `DS_NAV_ITEMS`.

#### Scenario: Navegación programática monta la vista

- GIVEN la app con `activeTab` distinto de `'metas'`
- WHEN algo dispara `setActiveTab('metas')`
- THEN se monta `GoalManager` dentro de un `Suspense`
- AND ningún otro módulo (`CreditCardManager`, `BudgetManager`, `RecurringManager`) se monta

### Requirement: `DS_NAV_ITEMS` conserva exactamente 4 destinos

El sistema MUST mantener `DS_NAV_ITEMS` con exactamente 4 ítems (`resumen`, `movimientos`, `graficos`, `cuenta`) y MUST NOT incluir un ítem `metas`. Esta es una guardia de regresión de R-08.

#### Scenario: Guardia de regresión sobre la lista de navegación

- GIVEN `dsNavItems.js`
- WHEN se importa `DS_NAV_ITEMS`
- THEN `DS_NAV_ITEMS.length === 4`
- AND ningún ítem tiene `id === 'metas'`

### Requirement: `planificacion` pierde `GoalManager` sin regresión en el resto

El sistema MUST mantener `activeTab === 'planificacion'` funcional, montando `CreditCardManager`, `BudgetManager` y `RecurringManager` con sus props actuales, y MUST NOT montar `GoalManager` ahí.

#### Scenario: `planificacion` sin Metas

- GIVEN `activeTab === 'planificacion'`
- WHEN se renderiza `App`
- THEN se ven `CreditCardManager`, `BudgetManager` y `RecurringManager`
- AND `GoalManager` no se renderiza

### Requirement: Omnibar navega a `metas`

El sistema MUST hacer que la quick action "Mis Metas" del Omnibar (`Omnibar.jsx`) navegue a `activeTab === 'metas'`, y MUST NOT navegar a `planificacion`.

#### Scenario: Quick action corregida

- GIVEN el Omnibar abierto (⌘K)
- WHEN el usuario selecciona la quick action "Mis Metas"
- THEN se invoca `onNavigate('metas')`
- AND se cierra el Omnibar

### Requirement: Contrato de navegación desde el Dashboard

`DashboardHome` MUST aceptar props `goals` y `onNavigate(tabId: string)`; la acción de la sección "Mis metas" MUST invocar `onNavigate('metas')`. La composición visual de esa sección queda fuera de esta spec (se define en `dashboard-claridad`).

#### Scenario: Disparo de navegación desde Dashboard

- GIVEN `DashboardHome` recibe `goals` y `onNavigate`
- WHEN se ejecuta la acción de navegación a Metas
- THEN `onNavigate` se invoca con el argumento `'metas'`

### Requirement: `GoalManager` sin cambios de comportamiento

El sistema MUST reusar `GoalManager` con su firma actual `({ goals, onAddGoal, onUpdateProgress, onDeleteGoal })` y su gating `hasFeature('unlimited_goals')` (3 metas gratis / ilimitadas Pro) intactos. La prop muerta `currentBalance` (no declarada por `GoalManager`) SHOULD eliminarse en `App.jsx`.

#### Scenario: Gating Free sin cambios

- GIVEN un usuario sin `unlimited_goals` con 3 metas creadas
- WHEN intenta agregar una 4.ª meta desde la vista `metas`
- THEN el gating de `hasFeature('unlimited_goals')` bloquea la creación igual que en `planificacion` hoy

### Requirement: Mobile-first — `DSBottomNav` sin ítem Metas

En viewport < 768px, `DSBottomNav` MUST mostrar exactamente 4 columnas (las de `DS_NAV_ITEMS`) sin tab para Metas. El acceso a `metas` en mobile MUST ocurrir solo por navegación programática (Dashboard u Omnibar).

#### Scenario: Bottom nav mobile sin 5.ª columna

- GIVEN viewport < 768px
- WHEN se renderiza `DSBottomNav`
- THEN se ven exactamente 4 columnas
- AND ninguna corresponde a Metas

### Requirement: Comentario de `dsNavItems.js` corregido

El comentario en `src/components/ds/dsNavItems.js` MUST citar R-08 correctamente (tope duro de 4 destinos, no "≤ 7 destinos, 4 usados" — regla distinta del Sidebar de la Constitution) y MUST NOT mezclar ambas reglas.

#### Scenario: Cita corregida

- GIVEN el archivo `dsNavItems.js`
- WHEN se lee el comentario sobre la regla de navegación
- THEN no aparece el texto "≤ 7 destinos" atribuido a R-08
