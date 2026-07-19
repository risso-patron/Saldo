import PropTypes from 'prop-types';
import { Button } from '../ds/Button';

// Checkpoint IV-F.1 (Saldo Design Constitution v1.2) — "Vacío"
// (docs/design/screens/Saldo Historial.dc.html, "Estados": "Futuro, no
// carencia. Sin filtros ni resumen: la maquinaria aparece cuando hay algo
// que filtrar."). Historial.jsx renderiza ESTE componente EN VEZ DE los
// filtros/resumen/lista — no hay nada que filtrar todavía.
export function EstadoVacio({ onRegisterExpense, onNavigateToImport }) {
  return (
    <div className="flex flex-col items-start">
      <p className="text-ds-body text-ds-text-primary max-w-[360px]">
        Aquí aparecerán tus movimientos, agrupados por día.
      </p>
      <div className="flex items-center gap-5 mt-5">
        <Button variant="primary" onClick={onRegisterExpense}>
          Registrar el primero
        </Button>
        <Button variant="link" onClick={onNavigateToImport}>
          Importar un CSV
        </Button>
      </div>
    </div>
  );
}

EstadoVacio.propTypes = {
  onRegisterExpense: PropTypes.func.isRequired,
  onNavigateToImport: PropTypes.func.isRequired,
};
