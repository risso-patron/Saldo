// Checkpoint IV-A (Saldo Design Constitution v1.2) — Historial de movimientos.
// Fuente: docs/design/screens/Saldo Historial.dc.html.
//
// Reemplaza a ExpenseList.jsx + BudgetForm.jsx + LegacyPeriodFilters en la
// pestaña "Movimientos". Alcance CERRADO: sin selección múltiple, sin
// sugerencia heurística de categoría, sin editar/eliminar (filas de solo
// lectura, igual que Dashboard hoy), sin estados ilustrados completos.
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { Historial } from './Historial';
import { useIsDesktop, useIsMobileRow } from '../../hooks/useMediaQuery';

// RC-1.5: formatCurrency ahora importa src/i18n/index.js (getFormatLocale),
// que registra initReactI18next en el singleton real — debe conservarse al
// mockear este módulo, o la inicialización de i18n lanza en import.
vi.mock('react-i18next', async (importOriginal) => ({
  ...(await importOriginal()),
  useTranslation: () => ({ i18n: { language: 'es' } }),
}));

// Checkpoint IV-E.2 — useIsDesktop decide entre expansión en línea (desktop
// real) y HojaDetalle (Sheet). Todos los tests de este archivo anteriores a
// IV-E.2 se escribieron asumiendo el único comportamiento que existía
// entonces (en línea) — se mockea acá en `true` por defecto para que seguir
// pasando sin modificarlos sea el comportamiento por defecto del archivo;
// el describe de IV-E.2 lo sobreescribe puntualmente a `false`.
//
// Checkpoint IV-E.3 — useIsMobileRow decide si el swipe está activo
// (FilaDeslizable). Se mockea en `false` por defecto (mismo criterio: los
// tests anteriores a IV-E.3 no conocían el swipe) — el describe de IV-E.3
// lo sobreescribe puntualmente a `true`.
vi.mock('../../hooks/useMediaQuery', () => ({
  useIsDesktop: vi.fn(() => true),
  useIsMobileRow: vi.fn(() => false),
}));

// Checkpoint IV-E.3 — FilaDeslizable envuelve el gesto real (framer-motion
// drag), que no tiene sentido simular en jsdom (sin motor de layout/touch
// real — ver FilaDeslizable.test.jsx para el porqué). Acá se reemplaza por
// un doble simple con dos botones que invocan onReveal/onCloseReveal
// directamente, para poder probar la COORDINACIÓN entre filas que vive en
// Historial.jsx (el reducer) de forma determinística — no la física del
// gesto, que se valida en navegador/dispositivo.
vi.mock('./FilaDeslizable', () => ({
  FilaDeslizable: ({ id, isRevealed, onReveal, onCloseReveal, children }) => (
    <div data-testid={`fila-deslizable-${id}`} data-revealed={isRevealed}>
      <button type="button" onClick={() => onReveal(id)}>{`reveal-${id}`}</button>
      <button type="button" onClick={() => onCloseReveal(id)}>{`close-reveal-${id}`}</button>
      {children}
    </div>
  ),
}));

const noop = () => {};

const baseProps = {
  incomes: [],
  expenses: [],
  selectedYear: null,
  selectedMonth: null,
  setSelectedYear: noop,
  setSelectedMonth: noop,
};

describe('Historial — agrupación por día (GrupoDía)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14)); // martes 14 jul 2026
  });
  afterEach(() => vi.useRealTimers());

  const expenses = [
    { id: 'e1', description: 'Farmacia', date: '2026-07-12', category: 'Salud', amount: 38.2 },
    { id: 'e2', description: 'Supermercado', date: '2026-07-14', category: 'Alimentación', amount: 86.5 },
    { id: 'e3', description: 'Café con Marta', date: '2026-07-14', category: 'Entretenimiento', amount: 4.6 },
    { id: 'e4', description: 'Gasolina', date: '2026-07-13', category: 'Transporte', amount: 52.3 },
  ];
  const incomes = [
    { id: 'i1', description: 'Nómina', date: '2026-07-12', amount: 2400 },
  ];

  it('muestra una cabecera "Hoy · martes 14" para los movimientos de hoy', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    expect(screen.getByText('Hoy · martes 14')).toBeInTheDocument();
  });

  it('muestra una cabecera "Ayer · lunes 13" para los movimientos de ayer', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    expect(screen.getByText('Ayer · lunes 13')).toBeInTheDocument();
  });

  it('muestra una cabecera plana "Domingo 12" (sin "Hoy"/"Ayer") para días más viejos', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    expect(screen.getByText('Domingo 12')).toBeInTheDocument();
  });

  it('renderiza todos los movimientos, cada uno una sola vez', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    expect(screen.getByText('Farmacia')).toBeInTheDocument();
    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.getByText('Café con Marta')).toBeInTheDocument();
    expect(screen.getByText('Gasolina')).toBeInTheDocument();
    expect(screen.getByText('Nómina')).toBeInTheDocument();
  });
});

describe('Historial — resumen mensual pegajoso ("Gastado X · Ingresado Y", nunca saldo neto)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14));
  });
  afterEach(() => vi.useRealTimers());

  const expenses = [
    { id: 'e1', description: 'Farmacia', date: '2026-07-12', category: 'Salud', amount: 38.2 },
    { id: 'e2', description: 'Supermercado', date: '2026-07-14', category: 'Alimentación', amount: 86.5 },
  ];
  const incomes = [
    { id: 'i1', description: 'Nómina', date: '2026-07-12', amount: 2400 },
  ];

  it('el resumen coincide con la suma real de lo visible (calculateTotal)', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    // calculateTotal(expenses) = 124.70 · calculateTotal(incomes) = 2400.00
    const summary = screen.getByText(/Gastado/);
    expect(summary.textContent).toMatch(/124\.70/);
    expect(summary.textContent).toMatch(/Ingresado/);
    expect(summary.textContent).toMatch(/2,400\.00|2400\.00/);
  });

  it('el resumen se recalcula sobre lo filtrado (categoría) — Regla Inquebrantable: nunca un saldo neto', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Salud' } });
    const summary = screen.getByText(/Gastado/);
    expect(summary.textContent).toMatch(/38\.20/);
    expect(summary.textContent).not.toMatch(/124\.70/);
    // Nunca debe aparecer la palabra "Saldo" ni "Balance" en este componente.
    expect(screen.queryByText(/Saldo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Balance/i)).not.toBeInTheDocument();
  });
});

describe('Historial — filtros de categoría y tipo, aplican al instante y en combinación', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14));
  });
  afterEach(() => vi.useRealTimers());

  const expenses = [
    { id: 'e1', description: 'Farmacia', date: '2026-07-14', category: 'Salud', amount: 38.2 },
    { id: 'e2', description: 'Supermercado', date: '2026-07-14', category: 'Alimentación', amount: 86.5 },
  ];
  const incomes = [
    { id: 'i1', description: 'Nómina', date: '2026-07-14', amount: 2400 },
  ];

  it('filtro de categoría "Salud" solo muestra los gastos de esa categoría', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Salud' } });
    expect(screen.getByText('Farmacia')).toBeInTheDocument();
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
  });

  it('filtro de tipo "Ingreso" solo muestra ingresos', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    fireEvent.click(screen.getByRole('button', { name: /^ingreso$/i }));
    expect(screen.getByText('Nómina')).toBeInTheDocument();
    expect(screen.queryByText('Farmacia')).not.toBeInTheDocument();
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
  });

  it('filtro de tipo "Gasto" combinado con categoría "Alimentación" solo muestra ese gasto', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    fireEvent.click(screen.getByRole('button', { name: /^gasto$/i }));
    fireEvent.change(screen.getByLabelText(/categoría/i), { target: { value: 'Alimentación' } });
    expect(screen.getByText('Supermercado')).toBeInTheDocument();
    expect(screen.queryByText('Farmacia')).not.toBeInTheDocument();
    expect(screen.queryByText('Nómina')).not.toBeInTheDocument();
  });
});

describe('Historial — búsqueda por descripción, tolerante y en vivo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14));
  });
  afterEach(() => vi.useRealTimers());

  const expenses = [
    { id: 'e1', description: 'Taxi al aeropuerto', date: '2026-07-14', category: 'Transporte', amount: 20 },
    { id: 'e2', description: 'Supermercado', date: '2026-07-14', category: 'Alimentación', amount: 86.5 },
  ];

  it('filtra por texto parcial, sin distinguir mayúsculas/minúsculas', () => {
    render(<Historial {...baseProps} expenses={expenses} />);
    fireEvent.change(screen.getByPlaceholderText(/buscar/i), { target: { value: 'TAXI' } });
    expect(screen.getByText('Taxi al aeropuerto')).toBeInTheDocument();
    expect(screen.queryByText('Supermercado')).not.toBeInTheDocument();
  });
});

describe('Historial — deep-link de categoría desde Gráficos (initialCategoryFilter)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14));
  });
  afterEach(() => vi.useRealTimers());

  const expenses = [
    { id: 'e1', description: 'Suscripción rara', date: '2026-07-14', category: 'Otros', amount: 15 },
    { id: 'e2', description: 'Renta', date: '2026-07-14', category: 'Vivienda', amount: 500 },
  ];

  it('con initialCategoryFilter="Otros", aterriza con esa categoría ya filtrada', () => {
    render(<Historial {...baseProps} expenses={expenses} initialCategoryFilter="Otros" />);
    expect(screen.getByText('Suscripción rara')).toBeInTheDocument();
    expect(screen.queryByText('Renta')).not.toBeInTheDocument();
  });

  it('consume el filtro inicial una sola vez y llama a onInitialFilterConsumed al montar', () => {
    const onInitialFilterConsumed = vi.fn();
    render(
      <Historial
        {...baseProps}
        expenses={expenses}
        initialCategoryFilter="Otros"
        onInitialFilterConsumed={onInitialFilterConsumed}
      />
    );
    expect(onInitialFilterConsumed).toHaveBeenCalledTimes(1);
  });

  it('sin initialCategoryFilter, NO llama a onInitialFilterConsumed', () => {
    const onInitialFilterConsumed = vi.fn();
    render(<Historial {...baseProps} expenses={expenses} onInitialFilterConsumed={onInitialFilterConsumed} />);
    expect(onInitialFilterConsumed).not.toHaveBeenCalled();
  });
});

describe('Historial — chip de mes (reusa selectedYear/selectedMonth de useFilters, NO estado paralelo)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14));
  });
  afterEach(() => vi.useRealTimers());

  it('sin período seleccionado, no muestra ningún chip de mes', () => {
    render(<Historial {...baseProps} />);
    expect(screen.queryByRole('button', { name: /quitar filtro de período/i })).not.toBeInTheDocument();
  });

  it('con año y mes seleccionados, muestra un chip con el nombre del mes y el año', () => {
    render(<Historial {...baseProps} selectedYear={2026} selectedMonth={6} />);
    // Checkpoint IV-F.1 — con baseProps (sin movimientos) y un mes
    // seleccionado, también aparece "Julio 2026" dentro del mensaje de
    // EstadoSinResultados ("Nada en Julio 2026.") — se ancla al chip
    // específicamente (identificado por su botón "Quitar filtro de
    // período"), no a cualquier texto que contenga el mes.
    const chip = screen.getByRole('button', { name: /quitar filtro de período/i }).closest('span');
    expect(chip).toHaveTextContent('Julio 2026');
  });

  it('al pulsar la "✕" del chip, limpia año y mes vía los setters recibidos (no un estado propio)', () => {
    const setSelectedYear = vi.fn();
    const setSelectedMonth = vi.fn();
    render(
      <Historial
        {...baseProps}
        selectedYear={2026}
        selectedMonth={6}
        setSelectedYear={setSelectedYear}
        setSelectedMonth={setSelectedMonth}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /quitar filtro de período/i }));
    expect(setSelectedYear).toHaveBeenCalledWith(null);
    expect(setSelectedMonth).toHaveBeenCalledWith(null);
  });
});

describe('Historial — Checkpoint IV-F.1: cargando / vacío real / sin resultados', () => {
  it('loading=true muestra el skeleton y nada más (ni filtros, ni resumen, ni lista)', () => {
    render(<Historial {...baseProps} loading />);

    expect(screen.getByTestId('historial-skeleton')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Buscar…')).not.toBeInTheDocument();
  });

  it('hasMovements=false (agregado sin filtrar, calculado por App.jsx) muestra EstadoVacio, SIN filtros ni resumen', () => {
    render(
      <Historial
        {...baseProps}
        hasMovements={false}
        onRegisterExpense={noop}
        onNavigateToImport={noop}
      />
    );

    expect(screen.getByText(/aquí aparecerán tus movimientos/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar el primero' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Importar un CSV' })).toBeInTheDocument();
    // Sin filtros ni resumen — "la maquinaria aparece cuando hay algo que filtrar".
    expect(screen.queryByPlaceholderText('Buscar…')).not.toBeInTheDocument();
    expect(screen.queryByText(/Gastado/)).not.toBeInTheDocument();
  });

  it('"Registrar el primero" e "Importar un CSV" disparan los callbacks recibidos', () => {
    const onRegisterExpense = vi.fn();
    const onNavigateToImport = vi.fn();
    render(
      <Historial
        {...baseProps}
        hasMovements={false}
        onRegisterExpense={onRegisterExpense}
        onNavigateToImport={onNavigateToImport}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Registrar el primero' }));
    fireEvent.click(screen.getByRole('button', { name: 'Importar un CSV' }));

    expect(onRegisterExpense).toHaveBeenCalledTimes(1);
    expect(onNavigateToImport).toHaveBeenCalledTimes(1);
  });

  it('hasMovements=true (default) pero el filtro/búsqueda no encuentra nada: EstadoSinResultados, filtros y resumen SIGUEN visibles', () => {
    render(<Historial {...baseProps} />);

    expect(screen.getByText('Nada coincide con los filtros actuales.')).toBeInTheDocument();
    // A diferencia de EstadoVacio, acá los filtros y el resumen quedan.
    expect(screen.getByPlaceholderText('Buscar…')).toBeInTheDocument();
    expect(screen.getByText(/Gastado/)).toBeInTheDocument();
  });

  it('el mensaje de sin-resultados incluye el término de búsqueda y el mes activos', () => {
    render(<Historial {...baseProps} selectedYear={2026} selectedMonth={6} />);

    fireEvent.change(screen.getByPlaceholderText('Buscar…'), { target: { value: 'taxi' } });

    expect(screen.getByText('Nada con «taxi» en Julio 2026.')).toBeInTheDocument();
  });

  it('"Buscar en todo el historial" limpia el período (mismo setter que la "✕" del chip) y conserva la búsqueda', () => {
    const setSelectedYear = vi.fn();
    const setSelectedMonth = vi.fn();
    render(
      <Historial
        {...baseProps}
        selectedYear={2026}
        selectedMonth={6}
        setSelectedYear={setSelectedYear}
        setSelectedMonth={setSelectedMonth}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Buscar en todo el historial' }));

    expect(setSelectedYear).toHaveBeenCalledWith(null);
    expect(setSelectedMonth).toHaveBeenCalledWith(null);
  });

  it('"Quitar filtros" limpia búsqueda, categoría, tipo Y período', () => {
    const setSelectedYear = vi.fn();
    const setSelectedMonth = vi.fn();
    render(
      <Historial
        {...baseProps}
        selectedYear={2026}
        selectedMonth={6}
        setSelectedYear={setSelectedYear}
        setSelectedMonth={setSelectedMonth}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Buscar…'), { target: { value: 'taxi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }));

    expect(setSelectedYear).toHaveBeenCalledWith(null);
    expect(setSelectedMonth).toHaveBeenCalledWith(null);
    expect(screen.getByPlaceholderText('Buscar…')).toHaveValue('');
  });
});

// Checkpoint IV-B — filas interactivas + expansión en línea (definitiva, no
// provisoria): clic en una fila la expande mostrando detalle + Editar.
// NUNCA clic-directo-a-la-hoja. Sin "Cuenta"/"Nota" (no existen en el
// modelo de datos de useTransactions.js) — solo Categoría, y solo para
// gastos (los ingresos no tienen categoría).
describe('Historial — Checkpoint IV-B: filas interactivas, expansión en línea con Editar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14));
  });
  afterEach(() => vi.useRealTimers());

  const expenses = [
    { id: 'e1', description: 'Farmacia', date: '2026-07-14', category: 'Salud', amount: 38.2 },
  ];
  const incomes = [
    { id: 'i1', description: 'Nómina', date: '2026-07-14', amount: 2400 },
  ];

  it('las filas se renderizan como elementos accesibles reales (botón)', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    expect(screen.getByRole('button', { name: /Farmacia/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nómina/ })).toBeInTheDocument();
  });

  it('clic en una fila de GASTO la expande mostrando su categoría', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    // "Salud" ya aparece en la columna media de la fila colapsada (IV-A,
    // reemplaza la fecha relativa) — lo que verificamos acá es el texto
    // ESPECÍFICO de la expansión, no una coincidencia parcial ambigua.
    expect(screen.queryByText(/Categoría: Salud/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Farmacia/ }));

    expect(screen.getByText(/Categoría: Salud/)).toBeInTheDocument();
  });

  it('clic en una fila de INGRESO la expande SIN mostrar categoría (los ingresos no tienen)', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);

    fireEvent.click(screen.getByRole('button', { name: /Nómina/ }));

    // El botón Editar de la expansión de Nómina debe existir, pero ningún
    // texto de categoría (ni "Ingresos" sintética, ni la de Farmacia).
    expect(screen.queryByText(/Categoría:/)).not.toBeInTheDocument();
  });

  it('clic de nuevo en la misma fila la colapsa', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    const row = screen.getByRole('button', { name: /Farmacia/ });

    fireEvent.click(row);
    expect(screen.getByText(/Categoría: Salud/)).toBeInTheDocument();

    fireEvent.click(row);
    expect(screen.queryByText(/Categoría: Salud/)).not.toBeInTheDocument();
  });

  it('la expansión NO muestra "Cuenta" ni "Nota" (no existen en el modelo de datos)', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    fireEvent.click(screen.getByRole('button', { name: /Farmacia/ }));

    expect(screen.queryByText(/Cuenta/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nota/i)).not.toBeInTheDocument();
  });

  it('el botón "Editar" de la expansión dispara onEditMovement con el movimiento correcto (no la hoja directamente)', () => {
    const onEditMovement = vi.fn();
    render(
      <Historial {...baseProps} incomes={incomes} expenses={expenses} onEditMovement={onEditMovement} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Farmacia/ }));
    fireEvent.click(screen.getByRole('button', { name: /Editar/i }));

    expect(onEditMovement).toHaveBeenCalledTimes(1);
    expect(onEditMovement).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1', description: 'Farmacia' }));
  });

  it('sin onDeleteMovement (nadie lo pasa en IV-B), NO renderiza un botón "Eliminar"', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    fireEvent.click(screen.getByRole('button', { name: /Farmacia/ }));

    expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
  });

  it('con onDeleteMovement provisto, SÍ renderiza el botón "Eliminar" (preparación estructural para IV-C)', () => {
    const onDeleteMovement = vi.fn();
    render(
      <Historial {...baseProps} incomes={incomes} expenses={expenses} onDeleteMovement={onDeleteMovement} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Farmacia/ }));

    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument();
  });
});

describe('Historial — Checkpoint IV-D: navegación completa por teclado (roving tabindex)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 14)); // martes 14 jul 2026
  });
  afterEach(() => vi.useRealTimers());

  // Orden visual esperado (groupMovementsByDay: por día desc; dentro del
  // día, ingresos antes que gastos — orden de `movements` en Historial.jsx):
  // Nómina (hoy), Farmacia (hoy), Supermercado (ayer) — cruza GrupoDía.
  const incomes = [{ id: 'i1', description: 'Nómina', date: '2026-07-14', amount: 2400 }];
  const expenses = [
    { id: 'e1', description: 'Farmacia', date: '2026-07-14', category: 'Salud', amount: 38.2 },
    { id: 'e2', description: 'Supermercado', date: '2026-07-13', category: 'Alimentación', amount: 50 },
  ];

  it('solo una fila es alcanzable por Tab (tabIndex 0) antes de cualquier interacción — la primera del orden visual', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);

    expect(screen.getByRole('button', { name: /Nómina/ })).toHaveAttribute('tabIndex', '0');
    expect(screen.getByRole('button', { name: /Farmacia/ })).toHaveAttribute('tabIndex', '-1');
    expect(screen.getByRole('button', { name: /Supermercado/ })).toHaveAttribute('tabIndex', '-1');
  });

  it('ArrowDown mueve el foco real del DOM a la fila siguiente, cruzando el límite de GrupoDía', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    const nomina = screen.getByRole('button', { name: /Nómina/ });
    const farmacia = screen.getByRole('button', { name: /Farmacia/ });
    const supermercado = screen.getByRole('button', { name: /Supermercado/ });

    nomina.focus();
    fireEvent.keyDown(nomina, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(farmacia);

    fireEvent.keyDown(farmacia, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(supermercado);

    // Última fila: ArrowDown no tiene adónde ir, no hace nada.
    fireEvent.keyDown(supermercado, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(supermercado);
  });

  it('ArrowUp mueve el foco real del DOM a la fila anterior', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    const farmacia = screen.getByRole('button', { name: /Farmacia/ });

    farmacia.focus();
    fireEvent.keyDown(farmacia, { key: 'ArrowUp' });
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Nómina/ }));
  });

  it('mover el foco real (programático, equivalente a lo que hace un clic real en el navegador) también actualiza cuál fila es tabbable — un único punto de sincronización (onFocus)', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);

    // jsdom no simula que un clic real mueve el foco (fireEvent.click no
    // dispara el `focus` nativo que sí dispara un navegador real) — se
    // invoca .focus() directamente, envuelto en act(), como equivalente de
    // prueba de esa consecuencia del clic.
    act(() => {
      screen.getByRole('button', { name: /Supermercado/ }).focus();
    });

    expect(screen.getByRole('button', { name: /Supermercado/ })).toHaveAttribute('tabIndex', '0');
    expect(screen.getByRole('button', { name: /Nómina/ })).toHaveAttribute('tabIndex', '-1');
  });

  it('Escape colapsa la fila expandida sobre la que está el foco', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    const farmacia = screen.getByRole('button', { name: /Farmacia/ });

    fireEvent.click(farmacia);
    expect(screen.getByText(/Categoría: Salud/)).toBeInTheDocument();

    fireEvent.keyDown(farmacia, { key: 'Escape' });
    expect(screen.queryByText(/Categoría: Salud/)).not.toBeInTheDocument();
  });

  it('E sobre la fila con foco dispara onEditMovement con ese movimiento (no la hoja directamente)', () => {
    const onEditMovement = vi.fn();
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} onEditMovement={onEditMovement} />);
    const farmacia = screen.getByRole('button', { name: /Farmacia/ });

    farmacia.focus();
    fireEvent.keyDown(farmacia, { key: 'e' });

    expect(onEditMovement).toHaveBeenCalledTimes(1);
    expect(onEditMovement).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
  });

  it('⌫ sobre la fila con foco elimina y mueve el foco real al vecino SIGUIENTE (misma prioridad que la especificación de posición)', () => {
    const onDeleteMovement = vi.fn();
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} onDeleteMovement={onDeleteMovement} />);
    const farmacia = screen.getByRole('button', { name: /Farmacia/ });

    farmacia.focus();
    fireEvent.keyDown(farmacia, { key: 'Backspace' });

    expect(onDeleteMovement).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Supermercado/ }));
  });

  it('⌫ sobre la ÚLTIMA fila mueve el foco al vecino ANTERIOR (no hay siguiente) — nunca queda huérfano en document.body', () => {
    const onDeleteMovement = vi.fn();
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} onDeleteMovement={onDeleteMovement} />);
    const supermercado = screen.getByRole('button', { name: /Supermercado/ });

    supermercado.focus();
    fireEvent.keyDown(supermercado, { key: 'Backspace' });

    expect(onDeleteMovement).toHaveBeenCalledWith(expect.objectContaining({ id: 'e2' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Farmacia/ }));
    expect(document.activeElement).not.toBe(document.body);
  });

  it('clic en "Eliminar" desde la expansión pasa por el MISMO mecanismo de foco que ⌫ (un único camino de eliminación)', () => {
    const onDeleteMovement = vi.fn();
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} onDeleteMovement={onDeleteMovement} />);

    fireEvent.click(screen.getByRole('button', { name: /Farmacia/ })); // expande
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(onDeleteMovement).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Supermercado/ }));
  });

  it('sin onDeleteMovement, ⌫ no hace nada (no revienta ni llama a nada)', () => {
    render(<Historial {...baseProps} incomes={incomes} expenses={expenses} />);
    const farmacia = screen.getByRole('button', { name: /Farmacia/ });

    farmacia.focus();
    expect(() => fireEvent.keyDown(farmacia, { key: 'Backspace' })).not.toThrow();
  });
});

describe('Historial — Checkpoint IV-E.2: HojaDetalle en tablet/mobile (mismo expandedId, otra representación)', () => {
  // Sin fake timers en este describe: estas pruebas no dependen de "Hoy"/
  // "Ayer" (esa cobertura ya vive en los describes de arriba) y Sheet.jsx
  // necesita esperar su efecto de foco vía requestAnimationFrame
  // (waitFor) — mezclar eso con vi.useFakeTimers() es el gotcha ya
  // documentado del proyecto (userEvent/waitFor + fake timers cuelgan).
  const expenses = [
    { id: 'e1', description: 'Farmacia', date: '2026-07-14', category: 'Salud', amount: 38.2 },
  ];

  beforeEach(() => {
    useIsDesktop.mockReturnValue(false);
  });
  afterEach(() => {
    useIsDesktop.mockReturnValue(true);
  });

  it('en tablet/mobile (isDesktop=false), expandir una fila NO la expande en línea — abre una HojaDetalle (Sheet)', () => {
    render(<Historial {...baseProps} expenses={expenses} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Farmacia/ }));

    // El mismo ExpansionDetalle, ahora dentro de un diálogo — no una
    // segunda implementación de detalle.
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Categoría: Salud/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('Escape cierra la HojaDetalle (vía el propio manejador de Sheet.jsx) y el foco vuelve a la fila', async () => {
    render(<Historial {...baseProps} expenses={expenses} />);
    const farmacia = screen.getByRole('button', { name: /Farmacia/ });

    // jsdom no simula que un clic real mueve el foco (fireEvent.click no
    // dispara el `focus` nativo que sí dispara un navegador real) — se
    // enfoca explícitamente para que Sheet.jsx capture la fila correcta
    // como "elemento a restaurar" al cerrar, igual que en un navegador real.
    act(() => {
      farmacia.focus();
    });
    fireEvent.click(farmacia);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => {
      expect(document.activeElement).toBe(farmacia);
    });
  });

  it('sin scroll-lock residual: overflow del body se restaura al cerrar la HojaDetalle', () => {
    render(<Historial {...baseProps} expenses={expenses} />);

    fireEvent.click(screen.getByRole('button', { name: /Farmacia/ }));
    expect(document.body.style.overflow).toBe('hidden');

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('el botón "Editar" dentro de la HojaDetalle dispara onEditMovement con el movimiento correcto', () => {
    const onEditMovement = vi.fn();
    render(<Historial {...baseProps} expenses={expenses} onEditMovement={onEditMovement} />);

    fireEvent.click(screen.getByRole('button', { name: /Farmacia/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    expect(onEditMovement).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
  });

  it('el botón "Eliminar" dentro de la HojaDetalle pasa por el mismo mecanismo de foco que en desktop', () => {
    const onDeleteMovement = vi.fn();
    render(<Historial {...baseProps} expenses={expenses} onDeleteMovement={onDeleteMovement} />);

    fireEvent.click(screen.getByRole('button', { name: /Farmacia/ }));
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }));

    expect(onDeleteMovement).toHaveBeenCalledWith(expect.objectContaining({ id: 'e1' }));
  });
});

describe('Historial — Checkpoint IV-E.3: swipe-to-reveal, acordeón único con la expansión (rowInteractionReducer)', () => {
  // FilaDeslizable está mockeado arriba (doble simple con botones
  // reveal-{id}/close-reveal-{id}) — acá se prueba la COORDINACIÓN entre
  // filas que vive en Historial.jsx, no la física del gesto.
  const expenses = [
    { id: 'a', description: 'Fila A', date: '2026-07-14', category: 'Salud', amount: 10 },
    { id: 'b', description: 'Fila B', date: '2026-07-14', category: 'Salud', amount: 20 },
  ];

  beforeEach(() => {
    useIsMobileRow.mockReturnValue(true);
  });
  afterEach(() => {
    useIsMobileRow.mockReturnValue(false);
  });

  it('secuencia completa: swipe A → swipe B cierra A → tap en B cierra el swipe y abre el detalle → Escape cierra todo', () => {
    render(<Historial {...baseProps} expenses={expenses} onEditMovement={noop} />);

    // 1) Swipe sobre fila A → acciones visibles.
    fireEvent.click(screen.getByRole('button', { name: 'reveal-a' }));
    expect(screen.getByTestId('fila-deslizable-a')).toHaveAttribute('data-revealed', 'true');
    expect(screen.getByTestId('fila-deslizable-b')).toHaveAttribute('data-revealed', 'false');
    expect(screen.queryByText(/Categoría:/)).not.toBeInTheDocument();

    // 2) Swipe sobre fila B → A se cierra automáticamente.
    fireEvent.click(screen.getByRole('button', { name: 'reveal-b' }));
    expect(screen.getByTestId('fila-deslizable-a')).toHaveAttribute('data-revealed', 'false');
    expect(screen.getByTestId('fila-deslizable-b')).toHaveAttribute('data-revealed', 'true');

    // 3) Tap sobre B (la fila real envuelta, no el doble) → el swipe
    // desaparece y se abre el detalle.
    fireEvent.click(screen.getByRole('button', { name: /Fila B/ }));
    expect(screen.getByTestId('fila-deslizable-b')).toHaveAttribute('data-revealed', 'false');
    expect(screen.getByText(/Categoría: Salud/)).toBeInTheDocument();

    // Nunca coexisten expansión y swipe.
    expect(screen.getByTestId('fila-deslizable-a')).toHaveAttribute('data-revealed', 'false');

    // 4) Escape sobre la fila con foco (B, recién tocada) → todo cierra.
    fireEvent.keyDown(screen.getByRole('button', { name: /Fila B/ }), { key: 'Escape' });
    expect(screen.queryByText(/Categoría: Salud/)).not.toBeInTheDocument();
    expect(screen.getByTestId('fila-deslizable-b')).toHaveAttribute('data-revealed', 'false');
  });

  it('revelar una fila por swipe cierra una expansión ya abierta en otra fila', () => {
    render(<Historial {...baseProps} expenses={expenses} onEditMovement={noop} />);

    fireEvent.click(screen.getByRole('button', { name: /Fila A/ })); // expande A
    expect(screen.getByText(/Categoría: Salud/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'reveal-b' })); // swipe en B

    expect(screen.queryByText(/Categoría: Salud/)).not.toBeInTheDocument();
    expect(screen.getByTestId('fila-deslizable-b')).toHaveAttribute('data-revealed', 'true');
  });

  it('expandir una fila cierra un swipe ya revelado en otra fila', () => {
    render(<Historial {...baseProps} expenses={expenses} onEditMovement={noop} />);

    fireEvent.click(screen.getByRole('button', { name: 'reveal-a' })); // swipe en A
    expect(screen.getByTestId('fila-deslizable-a')).toHaveAttribute('data-revealed', 'true');

    fireEvent.click(screen.getByRole('button', { name: /Fila B/ })); // expande B

    expect(screen.getByTestId('fila-deslizable-a')).toHaveAttribute('data-revealed', 'false');
    expect(screen.getByText(/Categoría: Salud/)).toBeInTheDocument();
  });

  it('close-reveal de una fila que ya no es la activa (mensaje tardío) no pisa el estado de la fila que sí lo es', () => {
    render(<Historial {...baseProps} expenses={expenses} onEditMovement={noop} />);

    fireEvent.click(screen.getByRole('button', { name: 'reveal-a' }));
    fireEvent.click(screen.getByRole('button', { name: 'reveal-b' })); // B pasa a ser la activa, A ya se cerró

    // Un close-reveal tardío de A (ya inactiva) no debe tocar el estado de B.
    fireEvent.click(screen.getByRole('button', { name: 'close-reveal-a' }));

    expect(screen.getByTestId('fila-deslizable-b')).toHaveAttribute('data-revealed', 'true');
  });
});

describe('Historial — Checkpoint IV-F.2: banner de error de sincronización (aditivo, no excluyente)', () => {
  it('syncError=false (default) no muestra ningún banner', () => {
    render(<Historial {...baseProps} />);
    expect(screen.queryByText(/no pudimos actualizar/i)).not.toBeInTheDocument();
  });

  it('syncError=true muestra el banner CONVIVIENDO con filtros/resumen (contenido normal, no lo reemplaza)', () => {
    render(<Historial {...baseProps} syncError onRetrySync={noop} />);

    expect(screen.getByText(/no pudimos actualizar/i)).toBeInTheDocument();
    // Sigue siendo el mismo árbol de "contenido normal" — filtros presentes.
    expect(screen.getByPlaceholderText('Buscar…')).toBeInTheDocument();
  });

  it('con lastSyncedAt, el banner incluye la fecha formateada', () => {
    render(
      <Historial {...baseProps} syncError lastSyncedAt="2026-07-14T18:40:00.000Z" onRetrySync={noop} />
    );
    expect(screen.getByText(/no pudimos actualizar/i)).toHaveTextContent(/14 jul/i);
  });

  it('sin lastSyncedAt (nunca sincronizó con éxito), el banner igual se muestra sin fecha', () => {
    render(<Historial {...baseProps} syncError lastSyncedAt={null} onRetrySync={noop} />);
    expect(screen.getByText(/no pudimos actualizar desde tu banco\.$/i)).toBeInTheDocument();
  });

  it('"Reintentar ahora" dispara onRetrySync (refreshTransactions, inyectado desde App.jsx)', () => {
    const onRetrySync = vi.fn();
    render(<Historial {...baseProps} syncError onRetrySync={onRetrySync} />);

    fireEvent.click(screen.getByRole('button', { name: 'Reintentar ahora' }));

    expect(onRetrySync).toHaveBeenCalledTimes(1);
  });

  it('el banner convive con EstadoSinResultados (ambos visibles a la vez)', () => {
    render(<Historial {...baseProps} syncError onRetrySync={noop} />);
    // baseProps no tiene movimientos -> hasMovements default true, groups vacío -> sin-resultados.
    expect(screen.getByText(/no pudimos actualizar/i)).toBeInTheDocument();
    expect(screen.getByText('Nada coincide con los filtros actuales.')).toBeInTheDocument();
  });
});
