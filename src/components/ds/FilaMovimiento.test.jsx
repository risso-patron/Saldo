import { render, screen, fireEvent } from '@testing-library/react';
import { FilaMovimiento } from './FilaMovimiento';

// Fase II — Integración del Dashboard (Saldo Design Constitution v1.2).
// Fuente: docs/design/screens/Saldo Dashboard.dc.html.
// Fila de movimiento reutilizable (Dashboard hoy, Historial en el futuro).
// Regla Inquebrantable 4: la Constitución prohíbe rojo/verde permanentes en
// importes — gastos con signo "−" tipográfico (U+2212, NUNCA el guion ASCII),
// ingresos sin signo, ambos con el mismo color neutro.

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: { language: 'es' } }),
}));

describe('FilaMovimiento (ds) — Saldo Design Constitution v1.2', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 17)); // 17 jul 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('gasto: muestra el signo "−" tipográfico (U+2212), nunca el guion ASCII "-"', () => {
    // formatCurrency() usa locale 'es-419' internamente (igual que
    // ExpenseList.jsx) independientemente de i18n.language — decimal con
    // punto en este entorno ICU ("45.50"), no coma.
    render(<FilaMovimiento description="Supermercado" date="2026-07-17" amount={45.5} type="expense" />);
    expect(screen.getByText(/−.*45\.50/)).toBeInTheDocument();
    expect(screen.queryByText(/^-45\.50/)).not.toBeInTheDocument();
  });

  it('ingreso: sin signo "+", mismo color neutro que los gastos', () => {
    render(<FilaMovimiento description="Sueldo" date="2026-07-17" amount={45.5} type="income" />);
    const amountEl = screen.getByText(/45\.50/);
    expect(amountEl).toBeInTheDocument();
    expect(screen.queryByText(/\+.*45\.50/)).not.toBeInTheDocument();

    const { container: expenseContainer } = render(
      <FilaMovimiento description="Supermercado" date="2026-07-17" amount={45.5} type="expense" />
    );
    const expenseAmountEl = expenseContainer.querySelector('.text-ds-numeric');
    expect(amountEl.className).toBe(expenseAmountEl.className);
  });

  it('muestra la moneda del movimiento vía formatCurrency (consistente con ExpenseList) — hallazgo de verificación, no estaba cubierto', () => {
    const { container } = render(
      <FilaMovimiento description="Compra en Europa" date="2026-07-17" amount={10} type="expense" currency="EUR" />
    );
    // formatCurrency('es-419') en este entorno ICU renderiza el código de
    // moneda como texto ("EUR 10.00"), no un símbolo — mismo comportamiento
    // que ya usa ExpenseList.jsx, no se reinventa el formateo acá.
    const amountEl = container.querySelector('.text-ds-numeric');
    expect(amountEl.textContent).toMatch(/EUR/);
  });

  it('sin prop currency, usa USD por defecto (mismo default que formatCurrency)', () => {
    const { container } = render(
      <FilaMovimiento description="Compra" date="2026-07-17" amount={10} type="expense" />
    );
    const amountEl = container.querySelector('.text-ds-numeric');
    expect(amountEl.textContent).toMatch(/USD/);
  });

  it('fecha de hoy muestra "Hoy"', () => {
    render(<FilaMovimiento description="Café" date="2026-07-17" amount={5} type="expense" />);
    expect(screen.getByText('Hoy')).toBeInTheDocument();
  });

  it('fecha de ayer muestra "Ayer"', () => {
    render(<FilaMovimiento description="Café" date="2026-07-16" amount={5} type="expense" />);
    expect(screen.getByText('Ayer')).toBeInTheDocument();
  });

  it('otra fecha muestra formato "D mmm" vía Intl.DateTimeFormat', () => {
    render(<FilaMovimiento description="Café" date="2026-07-01" amount={5} type="expense" />);
    expect(screen.getByText('1 jul')).toBeInTheDocument();
  });

  it('renderiza la descripción con el token tipográfico body', () => {
    render(<FilaMovimiento description="Alquiler" date="2026-07-17" amount={500} type="expense" />);
    const el = screen.getByText('Alquiler');
    expect(el.className).toMatch(/text-ds-body\b/);
    expect(el.className).toMatch(/text-ds-text-primary\b/);
  });

  it('nunca usa clases de color rojo/verde/esmeralda/rosa para el importe (Regla Inquebrantable 4)', () => {
    const { container } = render(
      <FilaMovimiento description="Supermercado" date="2026-07-17" amount={45.5} type="expense" />
    );
    expect(container.innerHTML).not.toMatch(/text-red|text-green|text-emerald|text-rose/);
  });

  it('usa el separador inferior y la altura de fila de la Constitución', () => {
    const { container } = render(
      <FilaMovimiento description="Alquiler" date="2026-07-17" amount={500} type="expense" />
    );
    const row = container.firstChild;
    expect(row.className).toMatch(/h-11\b/);
    expect(row.className).toMatch(/border-ds-border-separator\b/);
  });

  it('aplica el token de hover de interacción (mismo que Button/DSSidebar)', () => {
    const { container } = render(
      <FilaMovimiento description="Alquiler" date="2026-07-17" amount={500} type="expense" />
    );
    expect(container.firstChild.className).toMatch(/hover:bg-ds-interaction-hover\b/);
  });
});

// Checkpoint IV-A — props aditivas para encajar en un GrupoDía de Historial
// (la fecha relativa ya vive en la cabecera del grupo, no hace falta
// repetirla por fila). Ambas con default que preserva el comportamiento
// existente de Dashboard — ningún test de arriba se modificó.
describe('FilaMovimiento (ds) — props aditivas Checkpoint IV-A (Historial)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 17)); // 17 jul 2026
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sin showRelativeDate, el comportamiento por defecto no cambia: sigue mostrando "Hoy"', () => {
    render(<FilaMovimiento description="Café" date="2026-07-17" amount={5} type="expense" />);
    expect(screen.getByText('Hoy')).toBeInTheDocument();
  });

  it('con showRelativeDate=false, no muestra la fecha relativa', () => {
    render(<FilaMovimiento description="Café" date="2026-07-17" amount={5} type="expense" showRelativeDate={false} />);
    expect(screen.queryByText('Hoy')).not.toBeInTheDocument();
  });

  it('con category, muestra la categoría en vez de la fecha relativa', () => {
    render(
      <FilaMovimiento
        description="Supermercado"
        date="2026-07-17"
        amount={45.5}
        type="expense"
        category="Alimentación"
        showRelativeDate={false}
      />
    );
    expect(screen.getByText('Alimentación')).toBeInTheDocument();
    expect(screen.queryByText('Hoy')).not.toBeInTheDocument();
  });

  it('sin category y sin showRelativeDate, no rompe: la columna media queda vacía', () => {
    const { container } = render(
      <FilaMovimiento description="Café" date="2026-07-17" amount={5} type="expense" showRelativeDate={false} />
    );
    expect(container.querySelector('.text-ds-caption')).toBeNull();
  });
});

// Checkpoint IV-B — fila clickeable (Historial): prop aditiva `onClick`, con
// default `undefined` que preserva EXACTAMENTE el comportamiento de Dashboard
// (que no la pasa) — ningún test de arriba se modificó.
describe('FilaMovimiento (ds) — prop aditiva `onClick` Checkpoint IV-B (fila interactiva de Historial)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 17));
  });
  afterEach(() => vi.useRealTimers());

  it('sin onClick (Dashboard), renderiza un <div>, no un <button>', () => {
    const { container } = render(
      <FilaMovimiento description="Alquiler" date="2026-07-17" amount={500} type="expense" />
    );
    expect(container.firstChild.tagName).toBe('DIV');
  });

  it('con onClick, renderiza un elemento accesible real: <button type="button">', () => {
    const { container } = render(
      <FilaMovimiento description="Alquiler" date="2026-07-17" amount={500} type="expense" onClick={() => {}} />
    );
    expect(container.firstChild.tagName).toBe('BUTTON');
    expect(container.firstChild).toHaveAttribute('type', 'button');
  });

  it('con onClick, un clic en la fila lo dispara', () => {
    const onClick = vi.fn();
    render(<FilaMovimiento description="Alquiler" date="2026-07-17" amount={500} type="expense" onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('con onClick, Enter con foco en la fila la dispara (semántica nativa de <button>)', () => {
    const onClick = vi.fn();
    render(<FilaMovimiento description="Alquiler" date="2026-07-17" amount={500} type="expense" onClick={onClick} />);
    const row = screen.getByRole('button');
    row.focus();
    fireEvent.keyDown(row, { key: 'Enter', code: 'Enter' });
    fireEvent.click(row); // jsdom no simula la activación por teclado de <button> automáticamente
    expect(onClick).toHaveBeenCalled();
  });

  it('con onClick, conserva las mismas clases visuales de altura/separador/hover que la fila de solo lectura', () => {
    const { container } = render(
      <FilaMovimiento description="Alquiler" date="2026-07-17" amount={500} type="expense" onClick={() => {}} />
    );
    expect(container.firstChild.className).toMatch(/h-11\b/);
    expect(container.firstChild.className).toMatch(/border-ds-border-separator\b/);
    expect(container.firstChild.className).toMatch(/hover:bg-ds-interaction-hover\b/);
  });
});

// Checkpoint RC-1.3 (A2) — nombre accesible contextual (docs/design/screens/
// Saldo Historial.dc.html: "Café con Marta, restaurantes, 4 euros con 60 en
// gasto, hoy — el importe siempre con contexto"). Antes de este checkpoint no
// existía ningún aria-label: el nombre accesible era la concatenación
// implícita de los <span> visibles (verificado en auditoría RC-1.3, ej.
// "Gasto día -0Alimentación−USD 10.00").
describe('FilaMovimiento (ds) — aria-label contextual Checkpoint RC-1.3 (A2)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 17)); // 17 jul 2026
  });
  afterEach(() => vi.useRealTimers());

  it('gasto con categoría, hoy: label = "descripción, categoría, importe en gasto, Hoy"', () => {
    render(
      <FilaMovimiento
        description="Café con Marta"
        date="2026-07-17"
        amount={4.6}
        type="expense"
        category="Restaurantes"
        showRelativeDate={false}
      />
    );
    expect(screen.getByLabelText('Café con Marta, Restaurantes, USD 4.60 en gasto, Hoy')).toBeInTheDocument();
  });

  it('ingreso sin categoría, ayer: label = "descripción, importe en ingreso, Ayer" (sin categoría vacía colgando)', () => {
    render(<FilaMovimiento description="Salario" date="2026-07-16" amount={1000} type="income" />);
    expect(screen.getByLabelText('Salario, USD 1,000.00 en ingreso, Ayer')).toBeInTheDocument();
  });

  it('el label nunca incluye el signo "−" tipográfico (no todos los lectores de pantalla lo anuncian)', () => {
    const { container } = render(
      <FilaMovimiento description="Supermercado" date="2026-07-17" amount={45.5} type="expense" />
    );
    const label = container.firstChild.getAttribute('aria-label');
    expect(label).not.toMatch(/−/);
    expect(label).toMatch(/en gasto/);
  });

  it('incluye la fecha relativa en el label AUNQUE showRelativeDate sea false (visualmente redundante en Historial, no accesiblemente)', () => {
    const { container } = render(
      <FilaMovimiento
        description="Café"
        date="2026-07-17"
        amount={5}
        type="expense"
        category="Alimentación"
        showRelativeDate={false}
      />
    );
    // La columna visual muestra la categoría (no la fecha), pero el label
    // accesible incluye ambas: categoría Y fecha relativa.
    expect(screen.queryByText('Hoy')).not.toBeInTheDocument();
    expect(container.firstChild.getAttribute('aria-label')).toMatch(/Hoy$/);
  });

  it('el aria-label se aplica igual en modo <div> (Dashboard, sin onClick) y en modo <button> (Historial, con onClick)', () => {
    const { container: divContainer } = render(
      <FilaMovimiento description="Alquiler" date="2026-07-17" amount={500} type="expense" />
    );
    const { container: buttonContainer } = render(
      <FilaMovimiento description="Alquiler" date="2026-07-17" amount={500} type="expense" onClick={() => {}} />
    );
    const divLabel = divContainer.firstChild.getAttribute('aria-label');
    const buttonLabel = buttonContainer.firstChild.getAttribute('aria-label');
    expect(divLabel).toMatch(/^Alquiler, .*en gasto, Hoy$/);
    expect(divLabel).toBe(buttonLabel);
  });
});
