import { useState } from 'react';
import PropTypes from 'prop-types';
import { ICON_SIZES } from '../../constants/icons';
import { House, ForkKnife, Car, FilmSlate, Heart, Books, Lightning, Package } from '@phosphor-icons/react';

/**
 * Componente para mostrar iconos 3D con fallback a emoji
 * Soporta animaciones hover y efectos visuales
 */
export const Icon3D = ({ 
  src, 
  alt, 
  size = 'md', 
  emoji = '📦',
  className = '',
  animate = false,
  glow = false,
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Si hay error o no hay src, mostrar emoji
  if (imageError || !src) {
    return (
      <span 
        className={`inline-block ${ICON_SIZES[size]} ${className}`}
        role="img" 
        aria-label={alt}
        style={{ fontSize: size === 'xs' ? '1rem' : size === 'sm' ? '1.5rem' : size === 'md' ? '2rem' : size === 'lg' ? '3rem' : '4rem' }}
      >
        {emoji}
      </span>
    );
  }

  return (
    <div className={`inline-block ${className}`}>
      <img
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
        className={`
          ${ICON_SIZES[size]}
          object-contain
          ${animate ? 'transition-transform duration-300 hover:scale-110 hover:-rotate-6' : ''}
          ${glow ? 'drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]' : ''}
        `}
        loading="lazy"
      />
    </div>
  );
};

Icon3D.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']),
  emoji: PropTypes.string,
  className: PropTypes.string,
  animate: PropTypes.bool,
  glow: PropTypes.bool,
};

/**
 * Componente especializado para iconos de logros
 * Usa emojis directos — consistentes en todos los navegadores modernos
 */
export const AchievementIcon = ({ type = 'bronze', size = 'lg', unlocked = false }) => {
  const emojiMap = {
    bronze:  '🥉',
    silver:  '🥈',
    gold:    '🥇',
    trophy:  '🏆',
    star:    '⭐',
    fire:    '🔥',
    diamond: '💎',
  };

  const sizeStyle = {
    xs: '1rem', sm: '1.5rem', md: '2rem', lg: '3rem', xl: '4rem', '2xl': '5rem', '3xl': '6rem',
  };

  const emoji = emojiMap[type] || emojiMap.bronze;

  return (
    <div className="relative inline-block">
      <span
        role="img"
        aria-label={`${type} achievement`}
        className={`inline-block select-none ${!unlocked ? 'opacity-30 grayscale' : ''}`}
        style={{ fontSize: sizeStyle[size] || '3rem' }}
      >
        {emoji}
      </span>
      {unlocked && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      )}
    </div>
  );
};

AchievementIcon.propTypes = {
  type: PropTypes.oneOf(['bronze', 'silver', 'gold', 'trophy', 'star', 'fire', 'diamond']),
  size: PropTypes.string,
  unlocked: PropTypes.bool,
};

/**
 * Componente para iconos de categorías
 * Usa Phosphor Icons con colores semánticos — cross-platform y dark-mode-ready
 */
export const CategoryIcon = ({ category, size = 'md', className = '' }) => {
  const categoryMap = {
    'Vivienda':        { Icon: House,      color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950/40' },
    'Alimentación':    { Icon: ForkKnife,  color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40' },
    'Transporte':      { Icon: Car,        color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/40' },
    'Entretenimiento': { Icon: FilmSlate,  color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40' },
    'Salud':           { Icon: Heart,      color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-950/40' },
    'Educación':       { Icon: Books,      color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/40' },
    'Servicios':       { Icon: Lightning,  color: 'text-cyan-500',   bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
    'Otros':           { Icon: Package,    color: 'text-slate-500',  bg: 'bg-slate-50 dark:bg-slate-800/40' },
  };

  const sizeMap = {
    xs: 12, sm: 16, md: 20, lg: 28, xl: 36, '2xl': 48, '3xl': 64,
  };

  const containerSizeMap = {
    xs: 'w-5 h-5', sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-12 h-12', xl: 'w-16 h-16', '2xl': 'w-20 h-20', '3xl': 'w-24 h-24',
  };

  const { Icon, color, bg } = categoryMap[category] || categoryMap['Otros'];
  const iconSize = sizeMap[size] ?? 20;
  const containerSize = containerSizeMap[size] ?? 'w-9 h-9';

  return (
    <div className={`inline-flex items-center justify-center rounded-xl ${bg} ${containerSize} ${className}`}>
      <Icon size={iconSize} weight="fill" className={color} />
    </div>
  );
};

CategoryIcon.propTypes = {
  category: PropTypes.string.isRequired,
  size: PropTypes.string,
  className: PropTypes.string,
};
