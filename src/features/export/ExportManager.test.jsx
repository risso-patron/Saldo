// Test OBJETIVO (Fase 3, task 3.6 — debe quedar en ROJO hasta 3.7).
// ExportManager MUST inicializar su rango de exportación con el `dateRange`
// activo del PeriodContext, sin que el usuario tenga que tocar los inputs
// (spec "ExportManager usa el rango activo del dashboard" — escenario
// "Exportación sin override manual").
import { render, screen, fireEvent } from '@testing-library/react';
import { PeriodProvider, usePeriod } from '../../contexts/PeriodContext';
import { ExportManager } from './ExportManager';
import { exportToCSV, exportToPDF } from './exportUtils';

vi.mock('../../hooks/useSubscription', () => ({
  useSubscription: () => ({ hasFeature: () => true }),
}));

// Mockeado para inspeccionar exactamente qué datos filtrados recibe cada
// exportador, sin depender de jsPDF/Papa reales (P0 "exportación respeta
// filtros activos" — coherencia interna del documento generado).
vi.mock('./exportUtils', () => ({
  exportToCSV: vi.fn(),
  exportToPDF: vi.fn().mockResolvedValue(undefined),
}));

const selectPeriod = (year, month) => {
  localStorage.getItem.mockImplementation((key) => {
    if (key === '@budgetRP_v1:budgetrp_ui_selectedYear') return JSON.stringify(year);
    if (key === '@budgetRP_v1:budgetrp_ui_selectedMonth') return JSON.stringify(month);
    return null;
  });
};

// Harness: expone un control del período global (como AppHeader) junto al
// ExportManager, para simular "el usuario cambia el período sin salir de
// Herramientas" — el caso real que causaba la desincronización silenciosa.
const Harness = ({ incomes, expenses }) => {
  const { setYear, setMonth } = usePeriod();
  return (
    <>
      <button onClick={() => { setYear(2026); setMonth(5); }}>Cambiar a Junio 2026</button>
      <ExportManager incomes={incomes} expenses={expenses} />
    </>
  );
};

describe('ExportManager — usa el dateRange del período global activo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicializa el rango de exportación con Marzo 2026 (período activo del dashboard), sin override manual', () => {
    selectPeriod(2026, 2); // Marzo elegido en el dashboard

    const incomes = [{ description: 'Sueldo Marzo', amount: 1000, date: '2026-03-10' }];
    const expenses = [
      { description: 'Renta Marzo', amount: 500, date: '2026-03-05', category: 'Vivienda' },
      { description: 'Renta Julio', amount: 999, date: '2026-07-05', category: 'Vivienda' }, // fuera del período, no debe contarse
    ];

    const { container } = render(
      <PeriodProvider>
        <ExportManager incomes={incomes} expenses={expenses} />
      </PeriodProvider>
    );

    const dateInputs = container.querySelectorAll('input[type="date"]');
    expect(dateInputs[0]).toHaveValue('2026-03-01');
    expect(dateInputs[1]).toHaveValue('2026-03-31');
    expect(screen.getByText(/2 transacciones/)).toBeInTheDocument();
  });
});

// HAL: Exportación respeta filtros activos. Cubre la resincronización con
// override manual sticky, y la coherencia interna del documento exportado
// (transacciones + totales + categoryAnalysis siempre del mismo conjunto
// filtrado).
describe('ExportManager — resincronización con el período global (override manual sticky)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cambiar el período global SIN edición manual actualiza el rango exportado', () => {
    selectPeriod(2026, 2); // Marzo

    const { container } = render(
      <PeriodProvider>
        <Harness incomes={[]} expenses={[]} />
      </PeriodProvider>
    );

    expect(container.querySelectorAll('input[type="date"]')[0]).toHaveValue('2026-03-01');

    fireEvent.click(screen.getByText('Cambiar a Junio 2026'));

    const dateInputsAfter = container.querySelectorAll('input[type="date"]');
    expect(dateInputsAfter[0]).toHaveValue('2026-06-01');
    expect(dateInputsAfter[1]).toHaveValue('2026-06-30');
  });

  it('editar el rango a mano hace que un cambio posterior del período global NO lo pise', () => {
    selectPeriod(2026, 2); // Marzo

    const { container } = render(
      <PeriodProvider>
        <Harness incomes={[]} expenses={[]} />
      </PeriodProvider>
    );

    const dateInputs = container.querySelectorAll('input[type="date"]');
    fireEvent.change(dateInputs[0], { target: { value: '2026-01-15' } });
    expect(container.querySelectorAll('input[type="date"]')[0]).toHaveValue('2026-01-15');

    fireEvent.click(screen.getByText('Cambiar a Junio 2026'));

    // El override manual tiene prioridad: el rango NO debe volver a Junio.
    const dateInputsAfter = container.querySelectorAll('input[type="date"]');
    expect(dateInputsAfter[0]).toHaveValue('2026-01-15');
    expect(dateInputsAfter[1]).toHaveValue('2026-03-31'); // sin tocar, queda el valor sembrado original
  });
});

describe('ExportManager — coherencia interna del documento exportado', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const expenses = [
    { id: 'e1', description: 'Renta Marzo', amount: 500, date: '2026-03-05', category: 'Vivienda' },
    { id: 'e2', description: 'Super Marzo', amount: 100, date: '2026-03-10', category: 'Alimentación' },
    { id: 'e3', description: 'Renta Julio', amount: 999, date: '2026-07-05', category: 'Vivienda' }, // fuera de rango
  ];
  const incomes = [
    { id: 'i1', description: 'Sueldo Marzo', amount: 1000, date: '2026-03-01' },
  ];

  it('CSV recibe el conjunto de transacciones filtrado por el rango activo', async () => {
    selectPeriod(2026, 2); // Marzo

    render(
      <PeriodProvider>
        <ExportManager incomes={incomes} expenses={expenses} />
      </PeriodProvider>
    );

    fireEvent.click(screen.getByText('📊 Exportar CSV'));
    await vi.waitFor(() => expect(exportToCSV).toHaveBeenCalled());

    const [csvIncomes, csvExpenses] = exportToCSV.mock.calls[0];
    expect(csvExpenses.map(e => e.id)).toEqual(['e1', 'e2']); // e3 (Julio) queda fuera
    expect(csvIncomes.map(i => i.id)).toEqual(['i1']);
  });

  it('PDF recibe exactamente el mismo conjunto de transacciones filtrado que el CSV', async () => {
    selectPeriod(2026, 2); // Marzo

    render(
      <PeriodProvider>
        <ExportManager incomes={incomes} expenses={expenses} />
      </PeriodProvider>
    );

    fireEvent.click(screen.getByText('📄 Exportar PDF'));
    await vi.waitFor(() => expect(exportToPDF).toHaveBeenCalled());

    const [pdfIncomes, pdfExpenses] = exportToPDF.mock.calls[0];
    expect(pdfExpenses.map(e => e.id)).toEqual(['e1', 'e2']); // mismo conjunto que el CSV
    expect(pdfIncomes.map(i => i.id)).toEqual(['i1']);
  });

  it('categoryAnalysis exportado en el PDF corresponde únicamente al rango exportado, no al historial completo', async () => {
    selectPeriod(2026, 2); // Marzo

    render(
      <PeriodProvider>
        <ExportManager incomes={incomes} expenses={expenses} />
      </PeriodProvider>
    );

    fireEvent.click(screen.getByText('📄 Exportar PDF'));
    await vi.waitFor(() => expect(exportToPDF).toHaveBeenCalled());

    const [, , categoryAnalysis] = exportToPDF.mock.calls[0];
    const categories = categoryAnalysis.map(c => c.category).sort();

    // Vivienda entra (Renta Marzo, dentro de rango) pero SOLO por el monto de
    // Marzo — Renta Julio (fuera de rango) no debe sumarse ni aparecer aparte.
    expect(categories).toEqual(['Alimentación', 'Vivienda']);
    const vivienda = categoryAnalysis.find(c => c.category === 'Vivienda');
    expect(vivienda.amount).toBe(500); // no 500+999
  });

  it('un rango sin gastos no rompe la generación del análisis — categoryAnalysis queda vacío, sin excepción', async () => {
    selectPeriod(2026, 2); // Marzo

    const gastoFueraDeRango = [
      { id: 'e1', description: 'Renta Julio', amount: 999, date: '2026-07-05', category: 'Vivienda' },
    ];
    const ingresoDentroDeRango = [
      { id: 'i1', description: 'Sueldo Marzo', amount: 1000, date: '2026-03-01' },
    ];

    render(
      <PeriodProvider>
        <ExportManager incomes={ingresoDentroDeRango} expenses={gastoFueraDeRango} />
      </PeriodProvider>
    );

    // Hay 1 transacción en rango (el ingreso), así que el botón está habilitado.
    expect(screen.getByText(/1 transacciones/)).toBeInTheDocument();

    expect(() => fireEvent.click(screen.getByText('📄 Exportar PDF'))).not.toThrow();
    await vi.waitFor(() => expect(exportToPDF).toHaveBeenCalled());

    const [, pdfExpenses, categoryAnalysis] = exportToPDF.mock.calls[0];
    expect(pdfExpenses).toEqual([]);
    expect(categoryAnalysis).toEqual([]);
  });
});
