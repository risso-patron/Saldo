import PropTypes from 'prop-types';
import { Sheet } from '../ds/Sheet';
import { Button } from '../ds/Button';

// Fase 2, task 2.3 (tasks.md) — onboarding-flow, design.md "Mapa Requirement
// → decisión técnica" (Paso A — opcional). Sobre el Sheet DS, sin componente
// nuevo de formulario: una única pantalla con una frase (copy exacto fuera
// de alcance, spec "Fuera de alcance" > Copy) y dos acciones del MISMO
// variant de Button — "saltear" MUST NOT ser una acción secundaria (spec,
// Requirement "Paso A — confirmación opcional").
//
// Cerrar el Sheet (Escape/velo) equivale a "saltear": Paso A es enteramente
// opcional y ambas acciones llevan al mismo destino (Paso B), así que no
// tiene sentido un tercer camino de cierre sin decisión.
export function OnboardingStepA({ isOpen, onContinue, onSkip }) {
  return (
    <Sheet isOpen={isOpen} onClose={onSkip}>
      <div className="space-y-6">
        <p className="text-ds-title text-ds-text-primary">
          ¿Por qué usás Saldo? Registrá tu primer movimiento y empezá a ver tu plata con claridad.
        </p>
        <div className="flex gap-3">
          <Button variant="primary" onClick={onSkip}>Saltear</Button>
          <Button variant="primary" onClick={onContinue}>Continuar</Button>
        </div>
      </div>
    </Sheet>
  );
}

OnboardingStepA.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onContinue: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
};
