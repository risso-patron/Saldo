/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Habilitar dark mode con clase
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Paleta Celeste Cielo Pastel (Nuevo Color Maestro)
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9', // Celeste Cielo (Más humano y claro)
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Variantes Pastel Específicas
        pastel: {
          lavender: '#E9D5FF', // Soft Purple
          mint: '#DCFCE7',    // Soft Green
          rose: '#FFE4E6',    // Soft Red
          sky: '#E0F2FE',     // Soft Blue
          peach: '#FFEDD5',   // Soft Orange
          cream: '#FFFBEB',   // Background tint
          midnight: '#0F172A', // Deep Midnight (Dark Mode)
        },
        dark: {
          500: '#1E293B',
          600: '#0F172A',
        }
      },
      backgroundImage: {
        'gradient-celestial': 'radial-gradient(at 0% 0%, rgba(224, 242, 254, 0.4) 0, transparent 50%), radial-gradient(at 100% 0%, rgba(186, 230, 253, 0.3) 0, transparent 50%), radial-gradient(at 50% 100%, rgba(240, 249, 255, 0.5) 0, transparent 50%)',
        'gradient-pastel-lavender': 'linear-gradient(135deg, #F3E8FF 0%, #D8B4FE 100%)',
        'gradient-pastel-mint': 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
        'gradient-pastel-rose': 'linear-gradient(135deg, #FFE4E6 0%, #FECACA 100%)',
        'gradient-pastel-sky': 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
        'gradient-soft-dark': 'linear-gradient(135deg, #0F172A, #1E293B)',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        'premium-hover': '0 20px 50px -12px rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      scale: {
        '102': '1.02',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      },
      animationDelay: {
        '2000': '2s',
        '4000': '4s',
      }
    },
  },
  plugins: [],
}
