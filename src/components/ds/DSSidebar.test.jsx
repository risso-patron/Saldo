import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { DSSidebar } from './DSSidebar';

// Fundación de Diseño — Fase I-C (Saldo Design Constitution v1.2).
// Fuente: docs/design/screens/Saldo Dashboard.dc.html (aside desktop/tablet).
// Cubre los 4 destinos exactos, el estado activo (peso 600, SIN caja de
// fondo), navegación por click y el pie de usuario con iniciales reales.

const mockUser = {
  user_metadata: { full_name: 'Luis Risso' },
  email: 'luis@example.com',
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

describe('DSSidebar (ds) — Saldo Design Constitution v1.2', () => {
  it('renderiza exactamente 4 destinos con los labels del diseño', () => {
    render(<DSSidebar activeTab="resumen" onTabSelect={vi.fn()} onOpenOmnibar={vi.fn()} />);
    const nav = screen.getByRole('navigation');
    const buttons = screen.getAllByRole('button').filter((b) => nav.contains(b));
    expect(buttons).toHaveLength(4);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Movimientos')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
    expect(screen.getByText('Ajustes')).toBeInTheDocument();
  });

  it('el destino activo tiene peso 600 y SIN clase de fondo (caja)', () => {
    render(<DSSidebar activeTab="movimientos" onTabSelect={vi.fn()} onOpenOmnibar={vi.fn()} />);
    const activeItem = screen.getByText('Movimientos').closest('button');
    expect(activeItem.className).toMatch(/font-semibold\b/);
    // "Sidebar sin caja: activo por peso 600, no por relleno" — ningún token
    // de fondo persistente (se permite el velo hover:bg-black/[0.03]).
    const classTokens = activeItem.className.split(/\s+/);
    expect(classTokens.some((c) => /^bg-/.test(c))).toBe(false);
  });

  it('los destinos inactivos usan texto secundario y peso normal', () => {
    render(<DSSidebar activeTab="movimientos" onTabSelect={vi.fn()} onOpenOmnibar={vi.fn()} />);
    const inactiveItem = screen.getByText('Inicio').closest('button');
    expect(inactiveItem.className).toMatch(/text-ds-text-secondary\b/);
    expect(inactiveItem.className).not.toMatch(/font-semibold\b/);
  });

  it('click en un destino invoca onTabSelect con el tab correcto', async () => {
    const user = userEvent.setup();
    const onTabSelect = vi.fn();
    render(<DSSidebar activeTab="resumen" onTabSelect={onTabSelect} onOpenOmnibar={vi.fn()} />);
    await user.click(screen.getByText('Insights').closest('button'));
    expect(onTabSelect).toHaveBeenCalledWith('graficos');
  });

  it('click en la caja de búsqueda invoca onOpenOmnibar', async () => {
    const user = userEvent.setup();
    const onOpenOmnibar = vi.fn();
    render(<DSSidebar activeTab="resumen" onTabSelect={vi.fn()} onOpenOmnibar={onOpenOmnibar} />);
    await user.click(screen.getByLabelText('Buscar'));
    expect(onOpenOmnibar).toHaveBeenCalledTimes(1);
  });

  it('el pie muestra las iniciales y el nombre del usuario real', () => {
    render(<DSSidebar activeTab="resumen" onTabSelect={vi.fn()} onOpenOmnibar={vi.fn()} />);
    expect(screen.getByText('LR')).toBeInTheDocument();
    expect(screen.getByText('Luis Risso')).toBeInTheDocument();
  });

  it('muestra el wordmark SALDO', () => {
    render(<DSSidebar activeTab="resumen" onTabSelect={vi.fn()} onOpenOmnibar={vi.fn()} />);
    expect(screen.getByText('SALDO')).toBeInTheDocument();
  });
});

describe('DSSidebar — fallback de usuario sin nombre', () => {
  it('usa la inicial del email cuando no hay full_name', async () => {
    vi.resetModules();
    vi.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => ({ user: { email: 'ana@example.com' } }),
    }));
    const { DSSidebar: DSSidebarNoName } = await import('./DSSidebar');
    render(<DSSidebarNoName activeTab="resumen" onTabSelect={vi.fn()} onOpenOmnibar={vi.fn()} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('usa "S" cuando no hay usuario', async () => {
    vi.resetModules();
    vi.doMock('../../contexts/AuthContext', () => ({
      useAuth: () => ({ user: null }),
    }));
    const { DSSidebar: DSSidebarNoUser } = await import('./DSSidebar');
    render(<DSSidebarNoUser activeTab="resumen" onTabSelect={vi.fn()} onOpenOmnibar={vi.fn()} />);
    // Se usa el testid del avatar porque el wordmark colapsado (tablet)
    // también renderiza el texto "S" en el DOM (ambos conviven; CSS decide
    // cuál se ve en cada breakpoint) — evita ambigüedad con getByText.
    expect(screen.getByTestId('ds-sidebar-avatar-initials')).toHaveTextContent('S');
  });
});
