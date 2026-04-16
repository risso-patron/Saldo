/**
 * BudgetLogo — Logo de Saldo
 * Estilo: cuadrado redondeado con gradiente violeta, letra "S" blanca bold
 * y flecha ↗ en verde esmeralda emergiendo del extremo superior de la S.
 */
const BudgetLogo = ({ size = 48, className = '' }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Saldo"
        role="img"
      >
        <defs>
          {/* Gradiente violeta del fondo */}
          <linearGradient id="saldo-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4C1D95" />
            <stop offset="55%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          {/* Glow interno sutil */}
          <radialGradient id="saldo-inner" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="0.12" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          {/* Glow de la flecha */}
          <filter id="saldo-arrow-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Fondo — cuadrado redondeado con gradiente violeta */}
        <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#saldo-bg)" />
        {/* Inner glow */}
        <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#saldo-inner)" />

        {/* Letra S — blanca, bold, centrada */}
        <text
          x="50"
          y="67"
          textAnchor="middle"
          fontSize="62"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"
          fill="white"
          letterSpacing="-1"
        >S</text>

        {/* Flecha ↗ en esmeralda — emerge del extremo superior de la S */}
        <g filter="url(#saldo-arrow-glow)">
          {/* Línea diagonal */}
          <line x1="60" y1="37" x2="75" y2="21" stroke="#10B981" strokeWidth="5.5" strokeLinecap="round" />
          {/* Cabeza de flecha */}
          <polyline
            points="62,20 75,21 74,34"
            stroke="#10B981"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  )
}

export default BudgetLogo
