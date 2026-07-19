import { rowInteractionReducer, ROW_INTERACTION_INITIAL } from './rowInteractionReducer';

describe('rowInteractionReducer — única autoridad de transición (Checkpoint IV-E.3)', () => {
  it('estado inicial: nada expandido, nada revelado', () => {
    expect(ROW_INTERACTION_INITIAL).toEqual({ expandedId: null, swipedId: null });
  });

  it('OPEN_EXPANSION expande la fila pedida y limpia cualquier swipe activo', () => {
    const state = rowInteractionReducer(
      { expandedId: null, swipedId: 'b' },
      { type: 'OPEN_EXPANSION', id: 'a' }
    );
    expect(state).toEqual({ expandedId: 'a', swipedId: null });
  });

  it('REVEAL_ACTIONS revela la fila pedida y limpia cualquier expansión activa', () => {
    const state = rowInteractionReducer(
      { expandedId: 'a', swipedId: null },
      { type: 'REVEAL_ACTIONS', id: 'b' }
    );
    expect(state).toEqual({ expandedId: null, swipedId: 'b' });
  });

  it('REVEAL_ACTIONS sobre una fila nueva reemplaza a la que estaba revelada antes', () => {
    const state = rowInteractionReducer(
      { expandedId: null, swipedId: 'a' },
      { type: 'REVEAL_ACTIONS', id: 'b' }
    );
    expect(state).toEqual({ expandedId: null, swipedId: 'b' });
  });

  it('CLOSE_ACTIVE_ROW vuelve al estado inicial sin importar cuál era el estado previo', () => {
    expect(
      rowInteractionReducer({ expandedId: 'a', swipedId: null }, { type: 'CLOSE_ACTIVE_ROW' })
    ).toEqual(ROW_INTERACTION_INITIAL);

    expect(
      rowInteractionReducer({ expandedId: null, swipedId: 'b' }, { type: 'CLOSE_ACTIVE_ROW' })
    ).toEqual(ROW_INTERACTION_INITIAL);

    expect(
      rowInteractionReducer(ROW_INTERACTION_INITIAL, { type: 'CLOSE_ACTIVE_ROW' })
    ).toEqual(ROW_INTERACTION_INITIAL);
  });

  it('una acción desconocida no cambia el estado', () => {
    const state = { expandedId: 'a', swipedId: null };
    expect(rowInteractionReducer(state, { type: 'NOOP' })).toBe(state);
  });

  it('INVARIANTE: expandedId y swipedId nunca son ambos no-nulos, a lo largo de cualquier secuencia de acciones', () => {
    const sequence = [
      { type: 'OPEN_EXPANSION', id: 'a' },
      { type: 'REVEAL_ACTIONS', id: 'b' },
      { type: 'REVEAL_ACTIONS', id: 'c' },
      { type: 'OPEN_EXPANSION', id: 'd' },
      { type: 'CLOSE_ACTIVE_ROW' },
      { type: 'REVEAL_ACTIONS', id: 'e' },
      { type: 'OPEN_EXPANSION', id: 'e' },
      { type: 'OPEN_EXPANSION', id: 'e' }, // re-abrir la misma no debería filtrar un swipe fantasma
      { type: 'CLOSE_ACTIVE_ROW' },
      { type: 'CLOSE_ACTIVE_ROW' }, // cerrar dos veces seguidas es un no-op válido
    ];

    let state = ROW_INTERACTION_INITIAL;
    for (const action of sequence) {
      state = rowInteractionReducer(state, action);
      expect(Boolean(state.expandedId) && Boolean(state.swipedId)).toBe(false);
    }
  });
});
