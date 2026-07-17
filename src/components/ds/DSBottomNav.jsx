import PropTypes from 'prop-types';
import { DS_NAV_ITEMS } from './dsNavItems';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2
// (docs/design/screens/Saldo Dashboard.dc.html)
//
// Navegación inferior mobile (<768px): altura 64px, separador superior,
// grid de 4 columnas — los mismos 4 destinos que DSSidebar. SIN
// glassmorphism, SIN blur, SIN framer-motion, SIN sombras (prohibido por la
// Constitución en reposo). El FAB es un componente aparte (DSFab).

export function DSBottomNav({ activeTab, onTabSelect }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-[100] h-16 grid grid-cols-4 items-center
        bg-ds-surface-raised border-t border-ds-border-separator font-ds"
      aria-label="Navegación principal"
    >
      {DS_NAV_ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onTabSelect(id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center gap-1 h-full',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ds-accent focus-visible:ring-offset-2',
              isActive ? 'text-ds-text-primary font-semibold' : 'text-ds-text-tertiary font-normal'
            )}
          >
            <Icon width={24} height={24} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-[10px] leading-none">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

DSBottomNav.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabSelect: PropTypes.func.isRequired,
};
