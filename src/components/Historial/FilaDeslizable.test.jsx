import { render, screen, fireEvent } from '@testing-library/react';
import { FilaDeslizable } from './FilaDeslizable';

// Checkpoint IV-E.3 — se prueba el CONTRATO del componente (props/eventos),
// no la física del gesto de arrastre: jsdom no tiene motor de layout/touch
// real, y forzar esa simulación produciría tests frágiles sin valor real.
// La física real (distancia, velocidad, convivencia con scroll) se valida
// en navegador/dispositivo — ver evidencia del checkpoint.

const movement = { id: 'e1', type: 'expense', description: 'Farmacia' };

describe('FilaDeslizable — envoltorio de gesto (Checkpoint IV-E.3)', () => {
  it('renderiza sus children (la fila envuelta) sin alterarlos', () => {
    render(
      <FilaDeslizable
        id="e1"
        isRevealed={false}
        onReveal={vi.fn()}
        onCloseReveal={vi.fn()}
        onEditMovement={vi.fn()}
        onDeleteMovement={vi.fn()}
        movement={movement}
      >
        <button type="button">Farmacia</button>
      </FilaDeslizable>
    );

    expect(screen.getByRole('button', { name: 'Farmacia' })).toBeInTheDocument();
  });

  it('sin isRevealed, los botones Editar/Eliminar quedan fuera del orden de tabulación (tabIndex -1) y marcados aria-hidden', () => {
    render(
      <FilaDeslizable
        id="e1"
        isRevealed={false}
        onReveal={vi.fn()}
        onCloseReveal={vi.fn()}
        onEditMovement={vi.fn()}
        onDeleteMovement={vi.fn()}
        movement={movement}
      >
        <button type="button">Farmacia</button>
      </FilaDeslizable>
    );

    // aria-hidden="true" saca correctamente el botón del árbol de
    // accesibilidad — getByRole normal no lo encuentra (funciona como
    // debe); { hidden: true } lo busca igual para poder inspeccionarlo.
    const editar = screen.getByRole('button', { name: 'Editar', hidden: true });
    expect(editar).toHaveAttribute('tabIndex', '-1');
    expect(editar.closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'true');
  });

  it('con isRevealed, los botones Editar/Eliminar son alcanzables (tabIndex 0) y no están aria-hidden', () => {
    render(
      <FilaDeslizable
        id="e1"
        isRevealed
        onReveal={vi.fn()}
        onCloseReveal={vi.fn()}
        onEditMovement={vi.fn()}
        onDeleteMovement={vi.fn()}
        movement={movement}
      >
        <button type="button">Farmacia</button>
      </FilaDeslizable>
    );

    const editar = screen.getByRole('button', { name: 'Editar' });
    expect(editar).toHaveAttribute('tabIndex', '0');
    expect(editar.closest('[aria-hidden]')).toHaveAttribute('aria-hidden', 'false');
  });

  it('sin onDeleteMovement, NO renderiza el botón "Eliminar" (mismo criterio que ExpansionDetalle)', () => {
    render(
      <FilaDeslizable
        id="e1"
        isRevealed
        onReveal={vi.fn()}
        onCloseReveal={vi.fn()}
        onEditMovement={vi.fn()}
        movement={movement}
      >
        <button type="button">Farmacia</button>
      </FilaDeslizable>
    );

    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Eliminar' })).not.toBeInTheDocument();
  });

  it('clic en "Editar" dispara onEditMovement con el movimiento correcto', () => {
    const onEditMovement = vi.fn();
    render(
      <FilaDeslizable
        id="e1"
        isRevealed
        onReveal={vi.fn()}
        onCloseReveal={vi.fn()}
        onEditMovement={onEditMovement}
        onDeleteMovement={vi.fn()}
        movement={movement}
      >
        <button type="button">Farmacia</button>
      </FilaDeslizable>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

    expect(onEditMovement).toHaveBeenCalledWith(movement);
  });

  it('clic en "Eliminar" dispara onDeleteMovement con el movimiento correcto', () => {
    const onDeleteMovement = vi.fn();
    render(
      <FilaDeslizable
        id="e1"
        isRevealed
        onReveal={vi.fn()}
        onCloseReveal={vi.fn()}
        onEditMovement={vi.fn()}
        onDeleteMovement={onDeleteMovement}
        movement={movement}
      >
        <button type="button">Farmacia</button>
      </FilaDeslizable>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));

    expect(onDeleteMovement).toHaveBeenCalledWith(movement);
  });

  it('con isRevealed, tocar el contenido de la fila NO se intercepta — el clic llega normalmente a la fila envuelta (abrir el detalle limpia swipedId por la forma del reducer, no por lógica acá)', () => {
    const onCloseReveal = vi.fn();
    const innerOnClick = vi.fn();
    render(
      <FilaDeslizable
        id="e1"
        isRevealed
        onReveal={vi.fn()}
        onCloseReveal={onCloseReveal}
        onEditMovement={vi.fn()}
        onDeleteMovement={vi.fn()}
        movement={movement}
      >
        <button type="button" onClick={innerOnClick}>Farmacia</button>
      </FilaDeslizable>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Farmacia' }));

    expect(innerOnClick).toHaveBeenCalledTimes(1);
    expect(onCloseReveal).not.toHaveBeenCalled();
  });

  it('sin isRevealed, tocar el contenido de la fila tampoco llama a onCloseReveal — el clic siempre llega normalmente a la fila envuelta', () => {
    const onCloseReveal = vi.fn();
    const innerOnClick = vi.fn();
    render(
      <FilaDeslizable
        id="e1"
        isRevealed={false}
        onReveal={vi.fn()}
        onCloseReveal={onCloseReveal}
        onEditMovement={vi.fn()}
        onDeleteMovement={vi.fn()}
        movement={movement}
      >
        <button type="button" onClick={innerOnClick}>Farmacia</button>
      </FilaDeslizable>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Farmacia' }));

    expect(onCloseReveal).not.toHaveBeenCalled();
    expect(innerOnClick).toHaveBeenCalledTimes(1);
  });
});
