import { render, screen, fireEvent } from '@testing-library/react';
import { LegacyPeriodFilters } from './LegacyPeriodFilters';

// Recuperación transitoria de los chips Año/Mes del AppHeader desmontado en
// Fase I-C (integration-debt.md): eran la ÚNICA UI que escribía el período
// global (PeriodContext.setYear/setMonth) — sin ellos, Movimientos e Insights
// quedan clavados en el período por defecto. Viven DENTRO del contenido
// legacy de esos tabs (no en el shell DS) y mueren cuando cada pantalla se
// integre con su propio diseño.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => ({ 'header.year': 'Año', 'header.month': 'Mes', 'header.all': 'Todos' })[key] || key,
    i18n: { language: 'es' },
  }),
}));

describe('LegacyPeriodFilters — recuperación de los chips de período (deuda Fase I-C)', () => {
  const baseProps = {
    availableYears: [2025, 2026],
    selectedYear: null,
    setSelectedYear: vi.fn(),
    availableMonths: [],
    selectedMonth: null,
    setSelectedMonth: vi.fn(),
  };

  beforeEach(() => vi.clearAllMocks());

  it('renderiza un chip por año disponible más "Todos"', () => {
    render(<LegacyPeriodFilters {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2025' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2026' })).toBeInTheDocument();
  });

  it('seleccionar un año llama setSelectedYear y resetea el mes', () => {
    render(<LegacyPeriodFilters {...baseProps} />);
    fireEvent.click(screen.getByRole('button', { name: '2026' }));
    expect(baseProps.setSelectedYear).toHaveBeenCalledWith(2026);
    expect(baseProps.setSelectedMonth).toHaveBeenCalledWith(null);
  });

  it('con año seleccionado muestra los chips de mes disponibles', () => {
    render(
      <LegacyPeriodFilters
        {...baseProps}
        selectedYear={2026}
        availableMonths={[0, 6]}
      />
    );
    // 0 = enero, 6 = julio (es), formato corto de Intl
    fireEvent.click(screen.getByRole('button', { name: /jul/i }));
    expect(baseProps.setSelectedMonth).toHaveBeenCalledWith(6);
  });

  it('sin años disponibles no renderiza nada', () => {
    const { container } = render(<LegacyPeriodFilters {...baseProps} availableYears={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
