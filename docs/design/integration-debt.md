# Deuda de integración — Fase I-C (shell de navegación)

Registro de desvíos entre el shell nuevo (`src/components/ds/DSSidebar.jsx`,
`DSBottomNav.jsx`, `DSFab.jsx`, `DSTopBar.jsx`, montados en `src/App.jsx`) y
la fuente de verdad (`docs/design/screens/Saldo Dashboard.dc.html`). Regla
del PO: el diseño gana sobre el código; ninguna carencia técnica se resuelve
inventando UX alternativa — se cubre con el placeholder más fiel disponible
y se deja anotada acá.

| Fecha | Pantalla/Área | Diferencia con el diseño | Causa | Resolución prevista |
|---|---|---|---|---|
| 2026-07-17 | Shell completo (Sidebar/BottomNav/TopBar) | Los componentes `ds/` no tienen variante dark — el shell nuevo es solo claro. El contenido de los tabs (legacy) conserva sus clases `dark:*`. | La Constitución v1.2 y los tokens `ds-*` de `tailwind.config.js` no definen paleta dark; es un hueco total de la Design Constitution, no una omisión de esta fase. | Definir tokens `ds-*` dark cuando la Constitución los especifique; hasta entonces el shell fuerza claro y el resto convive con `dark:` legacy. |
| 2026-07-17 | DSTopBar | Se omite "Sincronizado hace X min" del mockup desktop/mobile. | No existe sincronización bancaria real en el producto — mostrarlo sería un dato falso ("el sistema es notario", regla de microcopy de la Constitución). | Agregar cuando exista una integración bancaria real que produzca ese timestamp. |
| 2026-07-17 | Navegación | `planificacion` (Mis Metas/Tarjetas/Presupuestos/Recurrentes) y `herramientas` (Exportar/Importar) quedan sin destino en Sidebar/BottomNav — el diseño fija exactamente 4 ítems (regla R-08). | El diseño no contempla más de 4 destinos y el PO ordenó no inventar un 5º. | Acceso transitorio vía quick actions del Omnibar (⌘K): "Mis Metas" → `planificacion`, "Herramientas" → `herramientas`. Reevaluar cuando el diseño defina pantallas propias para Ajustes/Historial. |
| 2026-07-17 | Contenido de todos los tabs | El contenido interior (Summary, ExpenseList, ChartsTab, ProfilePage, etc.) conserva su estética legacy (Tailwind slate-*, phosphor-icons, framer-motion) — solo el shell (nav) migró a tokens `ds-*`/lucide-react. La convivencia visual es transitoria y esperada. | Fuera de alcance de Fase I-C (solo shell de navegación); migrar cada pantalla es trabajo de Fase II+. | Migrar pantalla por pantalla en fases siguientes, según la fuente de verdad de cada una (`docs/design/screens/*.dc.html`). |
| 2026-07-17 | Filtros de período (Año/Mes) | El shell DS no tiene superficie de filtro de período (la spec de `DSTopBar` es explícita: overline + slot `actions`, sin filtros). Pero los chips del `AppHeader` viejo eran la ÚNICA UI que escribía el período global (`PeriodContext.setYear/setMonth`) — desmontarlos sin reemplazo dejaba Movimientos e Insights clavados en el período por defecto (regresión funcional, no solo visual; verificado: `BudgetManager`/`ExportManager`/`useFilters` solo LEEN el período). | El diseño del Dashboard asume la vista del mes en curso y no contempla navegador histórico; las pantallas que sí lo necesitarán (Historial, Insights) aún no están integradas. | Recuperados VERBATIM como `LegacyPeriodFilters.jsx` (con test), montado DENTRO del contenido legacy de los tabs `movimientos` y `graficos` — el shell DS queda puro. El componente muere cuando Historial/Insights se integren con su propia UI de período según su diseño. |
| 2026-07-17 | Footer del Sidebar viejo → shell nuevo | El diseño no contempla selector de moneda en el shell. `CurrencySelector` dejó de estar en Sidebar/AppHeader. | El diseño del Dashboard no incluye un control de moneda visible en ningún breakpoint. | Se agregó `<CurrencySelector />` funcional dentro de una sección "Utilidades" del Omnibar (⌘K) — no se perdió la función, solo cambió la superficie. Reevaluar si el diseño define dónde vivir permanentemente. |
| 2026-07-17 | Footer del Sidebar viejo (`ProfileMenu`) → shell nuevo | La acción "Eliminar Datos Locales" (borrado total de transacciones) no tiene equivalente en el tab `cuenta` (`ProfilePage.jsx`) — el resto de `ProfileMenu` (Configuración de Cuenta, Cerrar Sesión) sí es alcanzable ahí. | `ProfilePage.jsx` es contenido de tab (fuera de alcance de esta fase — "NO tocar contenido de tabs") y no incluye esa acción. | Se agregó como acción en la sección "Utilidades" del Omnibar (⌘K), reutilizando el mismo handler (`onClearAll`) que ya usaba el Sidebar viejo. Evaluar si `ProfilePage` debería incorporarla en Fase II. |
| 2026-07-17 | Mobile (<768px) — alcance real del gap ANTES del placeholder técnico | El mockup mobile del Dashboard no incluye ningún punto de entrada visible al Omnibar (buscador). Tras retirar `AppHeader`/`Sidebar` viejos, en mobile el Omnibar solo se abría por teclado (⌘K), impracticable en touch — esto dejaba **100% inalcanzables en teléfono**: los tabs `planificacion` y `herramientas` (solo viven en quick actions del Omnibar), el `CurrencySelector` (sección Utilidades del Omnibar) y "Vaciar datos" (idem). | El diseño mobile (390px) no contempla un ícono de búsqueda en ningún lugar del layout — el PO pidió no inventar UX fuera del diseño. | Resuelto TÉCNICAMENTE por el placeholder de búsqueda de `DSTopBar` (ver fila siguiente): reabre el camino táctil al Omnibar y, con él, a las 4 superficies de arriba. El diseño OFICIAL de acceso mobile (¿ícono en TopBar? ¿otro patrón?) sigue pendiente — el placeholder es un puente, no la resolución de diseño. |
| 2026-07-17 | `DSTopBar` — botón de búsqueda mobile | Se agregó un botón de ícono (`Search`, ghost, `md:hidden`, `aria-label="Buscar"`) a la derecha del overline, que dispara `onOpenOmnibar`. NO existe en ningún mockup — es un puente técnico mínimo, marcado en código con el comentario `PLACEHOLDER CONSTITUCIONAL`. | Sin esto, `planificacion`/`herramientas`/moneda/"vaciar datos" quedaban con CERO acceso táctil (ver fila anterior) — una regresión funcional, no solo visual. El PO prohibió inventar UX; este placeholder es la opción más neutra disponible (mismo ícono/patrón que ya usa `DSSidebar` para el mismo propósito en desktop/tablet). | **Dependencia constitucional pendiente de diseño oficial.** Retirar o reemplazar este botón en cuanto la Constitución/el mockup mobile especifique su propio patrón de acceso al Omnibar — no extender mientras tanto (no agregarle más funciones). |
| 2026-07-17 | `App.jsx` | Se removió el estado `quote` (frase motivacional aleatoria) y su `useEffect`, junto con el import de `STRATEGIC_MESSAGES`. | `DSTopBar` excluye explícitamente "quote" del diseño y el estado quedó sin consumidor (no era lógica de negocio, solo copy decorativo del `AppHeader` viejo). | Ninguna — decisión intencional, no requiere reintroducción salvo que el diseño lo pida. |
| 2026-07-17 | `src/components/Auth/ProfileMenu.jsx` — huérfano | Su único importador era `AppHeader.jsx` (shell viejo, ya desmontado de `App.jsx` desde una fase anterior). El archivo sigue en el repo pero ningún componente montado lo importa. | Fase I-C reemplazó `AppHeader`/`Sidebar` viejos por `DSSidebar`/`DSTopBar`; `ProfileMenu` no tiene equivalente 1:1 en el shell nuevo (ver fila "Footer del Sidebar viejo (`ProfileMenu`)" arriba — su única acción sin cubrir, "Eliminar Datos Locales", ya migró al Omnibar). | Ninguna acción en esta fase (fuera de alcance tocar componentes no montados). Evaluar borrado del archivo en una futura limpieza de código muerto, una vez confirmado que nada más lo referencia. |
| 2026-07-17 | `src/components/Shared/ThemeToggle.jsx` — huérfano | Su único importador era `AppHeader.jsx` (shell viejo). Ningún componente montado lo importa hoy — **corrección de la nota anterior** ("Notas de implementación relacionadas" más abajo): `ProfilePage.jsx` NO usa el componente `<ThemeToggle/>`; usa el hook `useTheme()` (`ThemeContext`) directamente para armar su propia fila Sun/Moon. La FUNCIÓN (cambiar de tema) está disponible en `cuenta`/Ajustes; el COMPONENTE `ThemeToggle` quedó huérfano. | Igual que `ProfileMenu`: sin equivalente montado tras el reemplazo del shell viejo. | Ninguna acción en esta fase. Evaluar borrado del archivo junto con `ProfileMenu.jsx` en una futura limpieza. |
| 2026-07-17 | Labels <14px en `tertiary` (DSBottomNav 10px, "Buscar" 13px, "⌘K" 11px) | La Constitución define el color `text/tertiary` (#9E9E9E) como "uso permitido solo en >=14px" (comentario en `tailwind.config.js`), pero los propios mockups de `Saldo Dashboard.dc.html` usan `tertiary` en tamaños menores (10-13px) en los mismos lugares donde este shell lo replica. | **Ambigüedad constitucional real**, no un error de implementación: la regla de contraste ("solo ≥14px") contradice a los mockups que la propia Constitución aporta como fuente de verdad visual. Se priorizó fidelidad al mockup (regla del PO: "el diseño gana") en vez de "corregir" el tamaño o el color por cuenta propia. | Ninguna resolución de código — requiere que el PO/diseño resuelva la contradicción (¿sube el tamaño? ¿define una excepción para labels de nav/metadata? ¿un tono `tertiary` más oscuro solo para <14px?). Queda registrada para no perderla en la próxima revisión de la Constitución. |
| 2026-07-17 | Tab `resumen` (Dashboard) — Fase II | `HabitDailyCard`, `Summary`, `GlobalBudgetTracker`, el botón "Ver mis tendencias detalladas" y la sección colapsable de logros (`GamificationDashboard`) se desmontaron de `App.jsx` (tab `resumen`) y fueron reemplazados por `DashboardHome`. NO se borraron — siguen intactos y compilables en sus propios archivos (`src/components/Dashboard/HabitDailyCard.jsx`, `src/components/Summary.jsx`, `src/components/Budget/GlobalBudgetTracker.jsx`, `src/features/gamification/`). | El diseño (`Saldo Dashboard.dc.html`) no contempla estos componentes en el Dashboard, y su estética actual (rojo en negativos, "¡Peligro!", etc.) viola las Reglas Inquebrantables 4 y 8 de la Constitución. | Destino permanente pendiente de decisión del PO (¿Insights? ¿Ajustes? ¿pantalla propia?). |
| 2026-07-17 | Dashboard — región de IA | Implementado el estado constitucional "Sin IA": `DashboardHome` no renderiza ningún nodo en la región de IA (sin nota, sin hueco reservado). | No existe un motor de IA funcional integrado a esta pantalla todavía. `AIInsightCard.jsx` (`src/components/AI/`) sigue siendo el único componente oficial de IA. Se descartó crear un componente "NotaIA" nuevo en `ds/` — regla de gobernanza: el Design System no contiene componentes de dominio. | `AIInsightCard.jsx` es el punto de integración futura cuando exista un motor de IA funcional. |
| 2026-07-17 | Dashboard — estado Vacío | El estado "Error de sincronización" y la acción "Conectar mi banco" del mockup Vacío no se implementaron. El estado Vacío de `DashboardHome` solo ofrece "Registrar un gasto" (camino manual existente). | No existe integración bancaria real en el producto (misma excepción constitucional documentada arriba, fila "DSTopBar" — "Sincronizado hace X min"). | Agregar cuando exista una integración bancaria real. |

## Notas de implementación relacionadas (no son deuda, son decisiones tomadas)

- Se agregó el breakpoint custom `ds-desktop: 1200px` en `tailwind.config.js`
  (`theme.screens`) porque el corte desktop/tablet de la Constitución (1200)
  no coincide con ningún breakpoint nativo de Tailwind (`lg`=1024, `xl`=1280).
- `DSSidebar` es un único componente que resuelve las variantes desktop
  (≥1200) y tablet (768–1199) con clases responsive (`md:` / `ds-desktop:`),
  no dos componentes separados — así shell y lógica de navegación no
  divergen entre breakpoints.
- Los 4 destinos de navegación (`resumen`/`movimientos`/`graficos`/`cuenta`)
  se centralizaron en `src/components/ds/dsNavItems.js`, compartido por
  `DSSidebar` y `DSBottomNav`.
- La quick action rota `"Consultar IA"` del Omnibar (apuntaba a un chat que
  ya no existe) se reemplazó por `"Insights"` → tab `graficos`.
- `ThemeToggle` (componente) y `LanguageSelector` quedaron sin superficie en
  el shell nuevo pero la FUNCIÓN no se perdió: `ProfilePage` (tab `cuenta` =
  destino Ajustes) ya tenía sus propios controles de tema e idioma, además de
  Cerrar Sesión — verificado. Precisión sobre tema (corrige la redacción
  anterior de esta nota): `ProfilePage` NO renderiza el componente
  `<ThemeToggle/>` — usa el hook `useTheme()` (`ThemeContext`) directamente
  para su propia fila Sun/Moon. Es decir, la función "cambiar de tema" está
  disponible; el COMPONENTE `ThemeToggle.jsx` en sí quedó huérfano (ver fila
  de la tabla de arriba). `LanguageSelector` sí es el mismo componente
  reutilizado (`<LanguageSelector />`), no una reimplementación — ese caso no
  tiene huérfano equivalente.
- **"Saldo disponible" (Dashboard, Fase II) = ingresos totales − gastos
  totales de TODO el historial, SIN descontar la deuda de tarjetas de
  crédito.** Decisión de negocio explícita del PO, no una carencia técnica:
  la deuda de tarjeta es un pasivo y no modifica el dinero que efectivamente
  ingresó al usuario. Cuando exista una pantalla patrimonial se mostrarán
  Saldo disponible / Deuda / Patrimonio neto por separado, sin mezclar
  conceptos financieros. Difiere deliberadamente de `Summary.jsx` (tab
  `movimientos`), que sí descuenta `creditCardDebt` — ambos componentes
  conviven con criterios distintos hasta que se unifique el concepto en una
  pantalla patrimonial.
- **Regla de organización del proyecto (fijada por el PO en Fase II):**
  `src/components/ds/` contiene primitivas de UI de propósito general y
  agnósticas de dominio (Button, Card, Input, FilaMovimiento...). NO contiene
  componentes de dominio/negocio (AIInsightCard, GlobalBudgetTracker,
  GoalProgress, GamificationCard, DashboardSummary...), que viven en sus
  propias carpetas de feature. Un componente nuevo solo entra a `ds/` si es
  genuinamente reutilizable sin conocer reglas de negocio de una feature
  específica.
