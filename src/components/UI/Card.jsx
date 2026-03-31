import PropTypes from 'prop-types';

/**
 * Componente Card con estética Glassmorphism Pastoral
 */
export const Card = ({ children, className = '', padding = 'p-6' }) => {
  return (
    <div className={`
      relative overflow-hidden
      bg-white/80 dark:bg-slate-900/50 
      backdrop-blur-xl
      border border-white/40 dark:border-white/10
      rounded-3xl 
      shadow-glass hover:shadow-premium-hover 
      transition-all duration-500 ease-out
      ${padding} 
      ${className}
    `}>
      {/* Sutil gradiente interno decorativo */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/5 opacity-50" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.string,
};
