// Checkpoint IV-E.3 (Saldo Design Constitution v1.2) — única autoridad de
// transición entre los tres estados posibles de una fila de Historial:
// nada activo, una expandida (ExpansionDetalle/HojaDetalle, IV-B/IV-E.2), o
// una con acciones reveladas por swipe (IV-E.3, FilaDeslizable). Función
// pura, completamente agnóstica de gestos/UI: no sabe qué es un swipe, un
// tap o un Escape — solo ejecuta la transición que se le pide. Decidir QUÉ
// transición pedir (p.ej. "si esta fila ya estaba expandida, cerrarla en
// vez de expandirla de nuevo") es responsabilidad de quien dispatchea
// (Historial.jsx), nunca del reducer.
//
// Invariante (demostrada en rowInteractionReducer.test.js): `expandedId` y
// `swipedId` nunca son ambos no-nulos a la vez — cada rama define el PAR
// COMPLETO resultante, nunca modifica un campo dejando el otro intacto. No
// es disciplina externa entre dos `useState` independientes: es imposible
// por construcción representar el estado inválido con esta forma.
export const ROW_INTERACTION_INITIAL = { expandedId: null, swipedId: null };

export function rowInteractionReducer(state, action) {
  switch (action.type) {
    case 'OPEN_EXPANSION':
      return { expandedId: action.id, swipedId: null };
    case 'REVEAL_ACTIONS':
      return { expandedId: null, swipedId: action.id };
    case 'CLOSE_ACTIVE_ROW':
      return ROW_INTERACTION_INITIAL;
    default:
      return state;
  }
}
