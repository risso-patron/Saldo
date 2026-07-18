// Checkpoint IV-A (Saldo Design Constitution v1.2) — Historial de movimientos.
// Fuente: docs/design/screens/Saldo Historial.dc.html.
//
// Utilidad de fecha relativa extraída de FilaMovimiento.jsx (antes función
// privada `formatRelativeDate`, línea ~27-36) — generalizada acá como
// utilidad pura y exportada. Vive en un archivo NUEVO (movementGrouping.js)
// en vez de calculations.js: calculations.js es sobre matemática de dinero
// (sumas, balances, filtros por rango) mientras que esto es sobre
// clasificación/etiquetado de fechas relativas y agrupación por día — mezclar
// ambas responsabilidades en el mismo archivo se sintió menos cohesivo.
// Sí reusa `parseLocalDate` de calculations.js (normalización de timezone),
// en vez de duplicarla.
import { describe, it, expect } from 'vitest';
import { formatRelativeDate, formatDayGroupLabel, groupMovementsByDay } from './movementGrouping';

describe('formatRelativeDate — misma fuente de verdad que usaba FilaMovimiento', () => {
  const referenceDate = new Date(2026, 6, 17); // 17 jul 2026

  it('fecha de hoy devuelve "Hoy"', () => {
    expect(formatRelativeDate('2026-07-17', 'es', referenceDate)).toBe('Hoy');
  });

  it('fecha de ayer devuelve "Ayer"', () => {
    expect(formatRelativeDate('2026-07-16', 'es', referenceDate)).toBe('Ayer');
  });

  it('fecha más vieja devuelve formato "D mmm" vía Intl.DateTimeFormat', () => {
    expect(formatRelativeDate('2026-07-01', 'es', referenceDate)).toBe('1 jul');
  });

  it('fecha inválida devuelve string vacío', () => {
    expect(formatRelativeDate('no-es-una-fecha', 'es', referenceDate)).toBe('');
  });
});

describe('formatDayGroupLabel — cabecera de GrupoDía (Hoy/Ayer con día de la semana, resto sin prefijo)', () => {
  const referenceDate = new Date(2026, 6, 14); // martes 14 jul 2026

  it('hoy: "Hoy · <día de la semana> <día>"', () => {
    expect(formatDayGroupLabel('2026-07-14', 'es', referenceDate)).toBe('Hoy · martes 14');
  });

  it('ayer: "Ayer · <día de la semana> <día>"', () => {
    expect(formatDayGroupLabel('2026-07-13', 'es', referenceDate)).toBe('Ayer · lunes 13');
  });

  it('otro día: solo "<Día de la semana> <día>", sin "Hoy"/"Ayer", con la inicial en mayúscula', () => {
    expect(formatDayGroupLabel('2026-07-12', 'es', referenceDate)).toBe('Domingo 12');
  });

  it('fecha inválida devuelve string vacío', () => {
    expect(formatDayGroupLabel('no-es-una-fecha', 'es', referenceDate)).toBe('');
  });
});

describe('groupMovementsByDay — agrupación por día calendario, orden descendente', () => {
  const referenceDate = new Date(2026, 6, 14); // martes 14 jul 2026

  const movements = [
    // Deliberadamente desordenado y mezclando ingresos/gastos de distintos días.
    { id: 'a', description: 'Farmacia', date: '2026-07-12', type: 'expense', amount: 38.2 },
    { id: 'b', description: 'Supermercado', date: '2026-07-14', type: 'expense', amount: 86.5 },
    { id: 'c', description: 'Nómina', date: '2026-07-12', type: 'income', amount: 2400 },
    { id: 'd', description: 'Café con Marta', date: '2026-07-14', type: 'expense', amount: 4.6 },
    { id: 'e', description: 'Gasolina', date: '2026-07-13', type: 'expense', amount: 52.3 },
  ];

  it('produce un grupo por día calendario distinto, tres días → tres grupos', () => {
    const groups = groupMovementsByDay(movements, 'es', referenceDate);
    expect(groups).toHaveLength(3);
  });

  it('ordena los grupos por fecha descendente (más reciente primero)', () => {
    const groups = groupMovementsByDay(movements, 'es', referenceDate);
    expect(groups.map((g) => g.key)).toEqual(['2026-07-14', '2026-07-13', '2026-07-12']);
  });

  it('cada grupo trae su label correcto (Hoy/Ayer/plano)', () => {
    const groups = groupMovementsByDay(movements, 'es', referenceDate);
    expect(groups[0].label).toBe('Hoy · martes 14');
    expect(groups[1].label).toBe('Ayer · lunes 13');
    expect(groups[2].label).toBe('Domingo 12');
  });

  it('cada grupo contiene exactamente los movimientos de ese día, sin perder ninguno', () => {
    const groups = groupMovementsByDay(movements, 'es', referenceDate);
    expect(groups[0].items.map((i) => i.id).sort()).toEqual(['b', 'd'].sort());
    expect(groups[1].items.map((i) => i.id)).toEqual(['e']);
    expect(groups[2].items.map((i) => i.id).sort()).toEqual(['a', 'c'].sort());
  });

  it('con lista vacía devuelve un array vacío', () => {
    expect(groupMovementsByDay([], 'es', referenceDate)).toEqual([]);
  });
});
