import { useState, useEffect } from 'react';

// Checkpoint IV-E.2 (Saldo Design Constitution v1.2) — primer hook de
// breakpoint "vivo" (con listener de resize) del proyecto. El resto de la
// navegación responsiva de la app (DSSidebar/DSBottomNav/DSFab/DSTopBar) se
// resuelve con pares CSS `hidden`/`md:flex` porque ninguno de esos
// componentes tiene efectos secundarios atados a su visibilidad. Sheet.jsx
// sí los tiene (trampa de foco, scroll-lock del body) — disparan en cuanto
// `isOpen` es true, sin importar si el nodo está oculto por CSS. Historial
// necesita saber el viewport en JS para decidir si esa apertura debe
// ocurrir siquiera (Checkpoint IV-E.2: expansión en línea en desktop real,
// HojaDetalle — un Sheet — en todo lo demás).
//
// SSR-safe: `window` no existe en un primer render de servidor — arranca en
// `false` y se corrige en el efecto (mismo criterio que ya usa
// ThemeContext.jsx para prefers-color-scheme, extendido acá con un listener
// vivo en vez de una lectura única).
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handleChange = (e) => setMatches(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

// Envoltorio del corte "desktop real" ya definido por la Constitución de
// diseño (tailwind.config.js: `ds-desktop: 1200px`, mismo breakpoint que ya
// usa DSSidebar.jsx) — quien lo consume (Historial) no necesita conocer el
// valor en píxeles ni que está implementado con matchMedia, solo la
// pregunta de negocio: "¿estamos en desktop real?".
const DS_DESKTOP_QUERY = '(min-width: 1200px)';

export function useIsDesktop() {
  return useMediaQuery(DS_DESKTOP_QUERY);
}
