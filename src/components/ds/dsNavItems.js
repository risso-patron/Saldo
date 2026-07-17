import { Home, List, PieChart, Settings2 } from 'lucide-react';

// Design System — Saldo Design Constitution v1.2
// (docs/design/screens/Saldo Dashboard.dc.html)
//
// Los 4 destinos de navegación fijados por el diseño (regla R-08, "≤ 7
// destinos, 4 usados"). DSSidebar (desktop/tablet) y DSBottomNav (mobile)
// comparten esta misma lista para que shell y tabs no diverjan.
// `planificacion` y `herramientas` quedan sin destino de navegación en esta
// fase — acceso transitorio vía quick actions del Omnibar (⌘K). Ver
// docs/design/integration-debt.md.
export const DS_NAV_ITEMS = [
  { id: 'resumen', label: 'Inicio', icon: Home },
  { id: 'movimientos', label: 'Movimientos', icon: List },
  { id: 'graficos', label: 'Insights', icon: PieChart },
  { id: 'cuenta', label: 'Ajustes', icon: Settings2 },
];
