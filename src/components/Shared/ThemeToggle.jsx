import { motion } from 'framer-motion';
import { Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Toggle animado para cambiar entre modo claro y oscuro
 */
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      style={{
        backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
      }}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      {/* Track background */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Sliding circle */}
      <motion.div
        className="relative z-10 w-5 h-5 rounded-full shadow-md flex items-center justify-center"
        animate={{
          x: isDark ? 28 : 0,
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      >
        {/* Icon */}
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Moon weight="fill" size={12} color="#8B5CF6" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ scale: 0, rotate: 90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Sun weight="fill" size={12} color="#FBBF24" />
          </motion.div>
        )}
      </motion.div>
    </button>
  );
};
