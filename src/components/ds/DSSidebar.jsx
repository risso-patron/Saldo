import { Search } from 'lucide-react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import { DS_NAV_ITEMS } from './dsNavItems';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2
// (docs/design/screens/Saldo Dashboard.dc.html)
//
// Sidebar del shell — un único componente para dos variantes por breakpoint:
//   - Desktop (>= 1200, custom screen `ds-desktop`): 216px, labels visibles.
//   - Tablet (768-1199, `md`): 64px, colapsado a solo iconos, wordmark "S".
// Mobile (<768) no la monta — usa DSBottomNav + DSFab (App.jsx decide según
// breakpoint, pero el propio componente también se auto-oculta con
// `hidden md:flex` como defensa en profundidad).
//
// Activo = texto primario + peso 600, SIN caja de fondo ni barra ni punto
// animado (nota del diseño: "Sidebar sin caja: activo por peso 600, no por
// relleno"). Hover: velo ds-interaction-hover — única interacción de fondo.

function getInitials(user) {
  const fullName = user?.user_metadata?.full_name?.trim();
  if (fullName) {
    const initials = fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
    if (initials) return initials;
  }
  if (user?.email) return user.email[0].toUpperCase();
  return 'S';
}

function getDisplayName(user) {
  return user?.user_metadata?.full_name || user?.email || 'Usuario';
}

// Foco accesible constitucional — compartido por el botón de búsqueda y los
// 4 destinos de nav.
const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:ring-offset-2';

// Área táctil ≥44px (mismo patrón antes: de Button): en la variante tablet
// el control visual mide 32px (búsqueda: 32x32, nav: 32x36) — se extiende
// el hit-area con un ::before invisible, sin alterar el tamaño visual.
const SEARCH_HIT_AREA = "relative before:content-[''] before:absolute before:-inset-x-[6px] before:-inset-y-[6px]";
const NAV_HIT_AREA = "relative before:content-[''] before:absolute before:-inset-x-[6px] before:-inset-y-[4px]";

export function DSSidebar({ activeTab, onTabSelect, onOpenOmnibar }) {
  const { user } = useAuth();
  const initials = getInitials(user);
  const displayName = getDisplayName(user);

  return (
    <aside
      className="hidden md:flex md:w-16 ds-desktop:w-[216px] flex-shrink-0 flex-col
        border-r border-ds-border-separator bg-ds-bg-base font-ds
        pt-7 pb-6 px-0 ds-desktop:px-5 gap-6 ds-desktop:gap-7"
    >
      {/* 1. Wordmark */}
      <div className="flex justify-center ds-desktop:justify-start px-0 ds-desktop:px-2">
        <span className="hidden ds-desktop:inline text-ds-text-primary text-sm font-bold tracking-[0.14em]">
          SALDO
        </span>
        <span className="ds-desktop:hidden text-ds-text-primary text-sm font-bold" aria-hidden="true">
          S
        </span>
      </div>

      {/* 2. Búsqueda / Omnibar */}
      <button
        type="button"
        onClick={onOpenOmnibar}
        aria-label="Buscar"
        className={cn(
          'flex items-center gap-2 h-8 rounded-ds-control mx-auto ds-desktop:mx-0',
          'w-8 justify-center ds-desktop:w-full ds-desktop:justify-start',
          'ds-desktop:bg-ds-surface-sunken ds-desktop:px-2.5',
          'transition-colors duration-ds-fast ease-ds hover:bg-ds-interaction-hover',
          SEARCH_HIT_AREA,
          FOCUS_RING
        )}
      >
        <Search
          strokeWidth={1.5}
          aria-hidden="true"
          className="w-[18px] h-[18px] ds-desktop:w-[15px] ds-desktop:h-[15px] text-ds-text-secondary shrink-0"
        />
        <span className="hidden ds-desktop:inline text-ds-caption">Buscar</span>
        <span className="hidden ds-desktop:inline ml-auto font-mono text-[11px] text-ds-text-disabled">
          ⌘K
        </span>
      </button>

      {/* 3. Nav — exactamente 4 destinos (regla R-08) */}
      <nav className="flex flex-col gap-0.5" aria-label="Navegación principal">
        {DS_NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onTabSelect(id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 h-9 rounded-ds-control mx-auto ds-desktop:mx-0',
                'w-8 justify-center ds-desktop:w-full ds-desktop:justify-start ds-desktop:px-2',
                'transition-colors duration-ds-fast ease-ds hover:bg-ds-interaction-hover',
                NAV_HIT_AREA,
                FOCUS_RING,
                isActive ? 'text-ds-text-primary font-semibold' : 'text-ds-text-secondary font-normal'
              )}
            >
              <Icon
                strokeWidth={1.5}
                aria-hidden="true"
                className="w-5 h-5 ds-desktop:w-[18px] ds-desktop:h-[18px] shrink-0"
              />
              <span className="hidden ds-desktop:inline text-ds-body">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* 4. Spacer */}
      <div className="flex-1" />

      {/* 5. Pie de usuario */}
      <div className="flex items-center gap-2.5 justify-center ds-desktop:justify-start px-0 ds-desktop:px-2">
        <div
          data-testid="ds-sidebar-avatar-initials"
          className="w-7 h-7 rounded-ds-full bg-ds-border flex items-center justify-center
            text-[11px] font-semibold text-ds-text-secondary shrink-0"
        >
          {initials}
        </div>
        <span className="hidden ds-desktop:inline text-ds-caption text-ds-text-secondary truncate">
          {displayName}
        </span>
      </div>
    </aside>
  );
}

DSSidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabSelect: PropTypes.func.isRequired,
  onOpenOmnibar: PropTypes.func.isRequired,
};
