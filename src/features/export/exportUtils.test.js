import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Papa from 'papaparse';
import i18n from '../../i18n';

// RC-1.5: exportToCSV/exportToPDF ahora usan getFormatLocale() (idioma activo
// de i18next) en vez de 'es-ES' fijo. Se mockean papaparse/jsPDF para
// capturar los valores formateados sin depender de generación real de
// archivos — no hay precedente en el repo de testear jsPDF real.
vi.mock('papaparse', () => ({
  default: { unparse: vi.fn(() => 'csv-content') },
}));

const textCalls = [];
const autoTableCalls = [];

vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(function MockJsPDF() {
    this.setFillColor = vi.fn();
    this.rect = vi.fn();
    this.setTextColor = vi.fn();
    this.setFontSize = vi.fn();
    this.setFont = vi.fn();
    this.text = vi.fn((...args) => textCalls.push(args));
    this.internal = { getNumberOfPages: () => 1 };
    this.setPage = vi.fn();
    this.addPage = vi.fn();
    this.save = vi.fn();
    this.lastAutoTable = { finalY: 100 };
  }),
}));

vi.mock('jspdf-autotable', () => ({
  default: vi.fn((_doc, opts) => autoTableCalls.push(opts)),
}));

const { exportToCSV, exportToPDF } = await import('./exportUtils');

describe('exportUtils — RC-1.5, locale dinámico según idioma activo de i18n', () => {
  const originalLanguage = i18n.language;
  const incomes = [{ date: '2026-03-15', description: 'Salario', amount: 1000 }];
  const expenses = [{ date: '2026-03-20', description: 'Renta', category: 'Vivienda', amount: 500 }];
  const dateRange = { start: '2026-03-01', end: '2026-03-31' };
  const totals = { totalIncome: 1000, totalExpenses: 500, balance: 500 };

  beforeEach(() => {
    global.URL.createObjectURL = vi.fn(() => 'blob:mock');
    global.URL.revokeObjectURL = vi.fn();
    Papa.unparse.mockClear();
    textCalls.length = 0;
    autoTableCalls.length = 0;
  });

  afterEach(async () => {
    await i18n.changeLanguage(originalLanguage);
  });

  it.each([
    ['es', 'es-419'],
    ['en', 'en-US'],
    ['fr', 'fr-FR'],
  ])('exportToCSV formatea "Fecha" con el locale correspondiente a "%s"', async (lang, expectedLocale) => {
    await i18n.changeLanguage(lang);
    exportToCSV(incomes, expenses, dateRange);

    const [rows] = Papa.unparse.mock.calls[0];
    const expectedFecha = new Date(incomes[0].date).toLocaleDateString(expectedLocale);
    expect(rows.some((r) => r.Fecha === expectedFecha)).toBe(true);
  });

  it.each([
    ['es', 'es-419'],
    ['en', 'en-US'],
    ['fr', 'fr-FR'],
  ])('exportToPDF formatea el rango de período con el locale correspondiente a "%s"', async (lang, expectedLocale) => {
    await i18n.changeLanguage(lang);
    await exportToPDF(incomes, expenses, [], totals, dateRange, false);

    const expectedPeriod = `Periodo: ${new Date(dateRange.start).toLocaleDateString(expectedLocale)} - ${new Date(dateRange.end).toLocaleDateString(expectedLocale)}`;
    expect(textCalls.some((args) => args[0] === expectedPeriod)).toBe(true);
  });

  it.each([
    ['es', 'es-419'],
    ['en', 'en-US'],
    ['fr', 'fr-FR'],
  ])('exportToPDF formatea las fechas de la tabla de transacciones con el locale de "%s"', async (lang, expectedLocale) => {
    await i18n.changeLanguage(lang);
    await exportToPDF(incomes, expenses, [], totals, dateRange, false);

    const transactionTable = autoTableCalls.find((opts) => opts.head[0][0] === 'Fecha');
    const expectedFecha = new Date(incomes[0].date).toLocaleDateString(expectedLocale);
    expect(transactionTable.body.some((row) => row[0] === expectedFecha)).toBe(true);
  });
});
