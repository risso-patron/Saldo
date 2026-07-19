import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useIsDesktop } from './useMediaQuery';

// Checkpoint IV-E.2 — primer hook de breakpoint "vivo" del proyecto.
// setupTests.js mockea window.matchMedia globalmente (matches: false,
// sin distinguir query) para el resto de la suite — acá se reemplaza esa
// implementación puntualmente por una controlable, para poder probar la
// reacción real a un cambio de media query y la limpieza del listener.

function makeMatchMediaMock(initialMatches) {
  const listeners = new Set();
  const mql = {
    matches: initialMatches,
    media: '',
    addEventListener: vi.fn((event, handler) => {
      if (event === 'change') listeners.add(handler);
    }),
    removeEventListener: vi.fn((event, handler) => {
      if (event === 'change') listeners.delete(handler);
    }),
  };
  const fire = (matches) => {
    mql.matches = matches;
    listeners.forEach((handler) => handler({ matches }));
  };
  return { mql, fire, listeners };
}

describe('useMediaQuery', () => {
  let originalMatchMedia;
  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('devuelve el valor inicial de matchMedia().matches', () => {
    const { mql } = makeMatchMediaMock(true);
    window.matchMedia = vi.fn(() => mql);

    const { result } = renderHook(() => useMediaQuery('(min-width: 1200px)'));

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1200px)');
  });

  it('reacciona en vivo a un cambio de media query (resize real)', () => {
    const { mql, fire } = makeMatchMediaMock(false);
    window.matchMedia = vi.fn(() => mql);

    const { result } = renderHook(() => useMediaQuery('(min-width: 1200px)'));
    expect(result.current).toBe(false);

    act(() => {
      fire(true);
    });

    expect(result.current).toBe(true);
  });

  it('limpia el listener de "change" al desmontar (sin fugas)', () => {
    const { mql, listeners } = makeMatchMediaMock(false);
    window.matchMedia = vi.fn(() => mql);

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 1200px)'));
    expect(listeners.size).toBe(1);

    unmount();

    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    expect(listeners.size).toBe(0);
  });

  // SSR real ("window" no existe en absoluto, no solo matchMedia) no es
  // simulable con renderHook: necesita un DOM (jsdom) para poder renderizar
  // cualquier cosa, así que "quitar window" no es reproducible acá sin
  // dejar de poder montar el hook. La guarda `typeof window !== 'undefined'`
  // en useMediaQuery.js es el mecanismo real de SSR-safety — se verifica
  // por lectura de código (mismo patrón que ya usa ThemeContext.jsx), no
  // con un test que fuerce un escenario que esta suite no puede reproducir
  // fielmente.
});

describe('useIsDesktop', () => {
  let originalMatchMedia;
  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
  });
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('consulta el corte ds-desktop (1200px) sin exponer el detalle a quien lo consume', () => {
    const { mql } = makeMatchMediaMock(true);
    window.matchMedia = vi.fn(() => mql);

    const { result } = renderHook(() => useIsDesktop());

    expect(result.current).toBe(true);
    expect(window.matchMedia).toHaveBeenCalledWith('(min-width: 1200px)');
  });
});
