import { render, screen } from '@testing-library/react';
import TransactionPreviewTable from './TransactionPreviewTable';

// RC-1.4/C1 — "Total Ingresos" y "Total Gastos" usaban color permanente
// (emerald/rose) para distinguirse, violando la regla de la Design
// Constitution ("los gastos se distinguen por signo y posición, nunca por
// rojo") ya aplicada en FilaMovimiento.jsx. Ahora ambas tarjetas comparten
// el mismo tratamiento neutro; el signo "−" y la etiqueta son lo único que
// distingue un total del otro.
describe('TransactionPreviewTable — sin color permanente en Total Ingresos/Gastos (RC-1.4/C1)', () => {
  const transactions = [
    { description: 'Sueldo', amount: 1000, date: '2026-07-01', category: 'Otros' },
    { description: 'Alquiler', amount: -300, date: '2026-07-02', category: 'Vivienda' },
  ];

  it('Total Ingresos se muestra sin signo, Total Gastos con el signo tipográfico "−"', () => {
    render(
      <TransactionPreviewTable
        transactions={transactions}
        onUpdateTransaction={() => {}}
        onImport={() => {}}
        isImporting={false}
      />
    );

    expect(screen.getByText('$1000.00')).toBeInTheDocument();
    expect(screen.getByText('−$300.00')).toBeInTheDocument();
  });
});
