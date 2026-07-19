import PropTypes from 'prop-types';
import { cn } from './cn';

// Design System — Saldo Design Constitution v1.2
// (docs/design/screens/Saldo Historial.dc.html, "Estados · Cargando")
//
// Primitiva de carga: un rectángulo gris estático — NUNCA `animate-pulse`
// (la Constitución prohíbe spinners; mismo criterio ya aplicado en
// DashboardHome.jsx). Deliberadamente mínima: solo ancho/alto/forma, sin
// variantes ni tamaños predefinidos — cada consumidor compone la geometría
// que necesita (Historial y Dashboard tienen formas de carga distintas).
export function SkeletonBlock({ width, height, className = '' }) {
  return (
    <div
      className={cn('bg-ds-border-separator rounded-sm', className)}
      style={{ width, height }}
    />
  );
}

SkeletonBlock.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  className: PropTypes.string,
};
