import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DSTopBar } from './DSTopBar';
import { PeriodProvider } from '../../contexts/PeriodContext';

// Fundación de Diseño — Fase I-C (Saldo Design Constitution v1.2).
// Fuente: docs/design/screens/Saldo Dashboard.dc.html ("Julio 2026" —
// overline 11px, mayúscula inicial, SIN "de"). Sin saludo, sin quote, sin
// tabs, sin filtros — overline de período real (usePeriod, no un prop
// `date` muerto — se retiró) + slot `actions` (children) + placeholder de
// búsqueda mobile (dependencia constitucional, ver integration-debt.md).

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'es' } }),
}));

// DSTopBar llama usePeriod() -> necesita un PeriodProvider ancestro. El año/
// mes "seleccionados" se pre-cargan vía el mock de localStorage (mismo
// mecanismo que PeriodContext.test.jsx), no interactuando con la UI.
const renderTopBar = (ui, { year, month } = {}) => {
  localStorage.getItem.mockImplementation((key) => {
    if (key.endsWith('selectedYear')) return year != null ? JSON.stringify(year) : null;
    if (key.endsWith('selectedMonth')) return month != null ? JSON.stringify(month) : null;
    return null;
  });
  return render(<PeriodProvider>{ui}</PeriodProvider>);
};

describe('DSTopBar (ds) — Saldo Design Constitution v1.2', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  it('sin período seleccionado (vista "todos"): overline muestra el mes actual, mayúscula inicial y sin "de"', () => {
    // Fake timers SOLO acá (no en beforeEach global): userEvent v14 usa
    // setTimeout real internamente y se cuelga si hay fake timers activos
    // sin avanzarlos — verificado (el test de click de más abajo colgaba
    // hasta timeout con fake timers globales).
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 17));
    renderTopBar(<DSTopBar onOpenOmnibar={vi.fn()} />);
    expect(screen.getByText('Julio 2026')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('con year+month seleccionados: overline muestra ese mes/año (no el actual)', () => {
    renderTopBar(<DSTopBar onOpenOmnibar={vi.fn()} />, { year: 2025, month: 0 });
    expect(screen.getByText('Enero 2025')).toBeInTheDocument();
  });

  it('con solo year seleccionado: overline muestra únicamente el año', () => {
    renderTopBar(<DSTopBar onOpenOmnibar={vi.fn()} />, { year: 2024 });
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.queryByText(/Enero|Julio/)).not.toBeInTheDocument();
  });

  it('renderiza el slot actions (children) a la derecha', () => {
    renderTopBar(
      <DSTopBar onOpenOmnibar={vi.fn()}>
        <button>Nuevo movimiento</button>
      </DSTopBar>
    );
    expect(screen.getByRole('button', { name: 'Nuevo movimiento' })).toBeInTheDocument();
  });

  it('no renderiza saludo, quote, tabs ni filtros de año/mes', () => {
    renderTopBar(<DSTopBar onOpenOmnibar={vi.fn()} />);
    expect(screen.queryByText(/hola/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  describe('placeholder de búsqueda mobile (puente técnico, integration-debt.md)', () => {
    it('es visible solo en mobile (md:hidden) y expone aria-label "Buscar"', () => {
      renderTopBar(<DSTopBar onOpenOmnibar={vi.fn()} />);
      const btn = screen.getByRole('button', { name: 'Buscar' });
      expect(btn.className).toMatch(/md:hidden\b/);
    });

    it('dispara onOpenOmnibar al hacer click', async () => {
      const user = userEvent.setup();
      const onOpenOmnibar = vi.fn();
      renderTopBar(<DSTopBar onOpenOmnibar={onOpenOmnibar} />);
      await user.click(screen.getByRole('button', { name: 'Buscar' }));
      expect(onOpenOmnibar).toHaveBeenCalledTimes(1);
    });
  });
});
