/* global describe, it, expect, vi */
import { render, screen } from '@testing-library/react';
import { ExpansionDetalle } from './ExpansionDetalle';

describe('ExpansionDetalle — IMP-002B import metadata', () => {
  const baseMovement = {
    id: 'tx-1',
    type: 'expense',
    category: 'Otros',
  };

  it('keeps manual movements without import origin metadata', () => {
    render(
      <ExpansionDetalle
        movement={baseMovement}
        onEditMovement={vi.fn()}
      />
    );

    expect(screen.queryByText(/Origen:/i)).not.toBeInTheDocument();
  });

  it('shows minimal imported origin metadata from movement data only', () => {
    render(
      <ExpansionDetalle
        movement={{
          ...baseMovement,
          importBatchId: 'batch-1',
          source: 'csv_import',
          importedAt: '2026-08-23T10:00:01.000Z',
        }}
        onEditMovement={vi.fn()}
      />
    );

    expect(screen.getByText(/Origen:/i)).toHaveTextContent(/CSV/i);
    expect(screen.getByText(/Origen:/i)).toHaveTextContent(/23/i);
    expect(screen.queryByText(/batch-1/i)).not.toBeInTheDocument();
  });
});
