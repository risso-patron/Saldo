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
| 2026-07-17 | Mobile (<768px) | El mockup mobile del Dashboard no incluye ningún punto de entrada visible al Omnibar (buscador). Tras retirar `AppHeader`/`Sidebar` viejos, en mobile el Omnibar solo se abre por teclado (⌘K), impracticable en touch. | El diseño mobile (390px) no contempla un ícono de búsqueda en ningún lugar del layout — el PO pidió no inventar UX fuera del diseño. | Pendiente de definición en el diseño: agregar una entrada táctil al Omnibar en mobile cuando la Constitución/pantalla la especifique. |
| 2026-07-17 | `App.jsx` | Se removió el estado `quote` (frase motivacional aleatoria) y su `useEffect`, junto con el import de `STRATEGIC_MESSAGES`. | `DSTopBar` excluye explícitamente "quote" del diseño y el estado quedó sin consumidor (no era lógica de negocio, solo copy decorativo del `AppHeader` viejo). | Ninguna — decisión intencional, no requiere reintroducción salvo que el diseño lo pida. |

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
- `ThemeToggle` y `LanguageSelector` quedaron sin superficie en el shell nuevo
  pero NO se perdieron: `ProfilePage` (tab `cuenta` = destino Ajustes) ya
  tenía sus propios controles de tema (`useTheme`, fila con Sun/Moon) e
  idioma (`LanguageSelector`), además de Cerrar Sesión — verificado.
