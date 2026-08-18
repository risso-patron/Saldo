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
      // Breakpoint custom del shell de navegación (Fase I-C, Sidebar/DSSidebar):
      // la Constitución define el corte desktop/tablet en 1200px, distinto del
      // `lg` nativo de Tailwind (1024). Se documenta acá en vez de reutilizar
      // `lg` para no generar ambigüedad con el resto de la app.
      'ds-desktop': '1200px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // ---------------------------------------------------------------
        // Design System — Saldo Design Constitution v1.2 (docs/design/constitution)
        // Tokens semánticos "ds-*". Conviven con la paleta legacy de abajo
        // (primary-*, pastel-*, etc.) hasta que las pantallas migren — no
        // se tocan ni se borran los tokens viejos en esta fase.
        //
        // RC-1.1 — cada valor referencia una variable CSS (definida en
        // src/index.css bajo :root / html.dark) en vez de un hex fijo, para
        // que todo consumidor de ds-* responda automáticamente al cambio de
        // tema sin tocar clases componente por componente.
        // ---------------------------------------------------------------
        ds: {
          bg: {
            base: 'var(--ds-bg-base)',
          },
          surface: {
            raised: 'var(--ds-surface-raised)',
            sunken: 'var(--ds-surface-sunken)',
            inverse: 'var(--ds-surface-inverse)',
          },
          text: {
            primary: 'var(--ds-text-primary)',
            secondary: 'var(--ds-text-secondary)',
            tertiary: 'var(--ds-text-tertiary)', // C-08 (2026-08-07): no cumple AA como texto a ningún tamaño — reservado para uso no textual/decorativo. Para texto pequeño usar 'secondary'.
            disabled: 'var(--ds-text-disabled)',
          },
          border: {
            DEFAULT: 'var(--ds-border)',
            separator: 'var(--ds-border-separator)',
          },
          accent: {
            DEFAULT: 'var(--ds-accent)', // action/primary — acento ÚNICO del sistema
            hover: 'var(--ds-accent-hover)',
            tint: 'var(--ds-accent-tint)', // tenue / selección
          },
          success: {
            DEFAULT: 'var(--ds-success)',
            tint: 'var(--ds-success-tint)',
          },
          warning: {
            DEFAULT: 'var(--ds-warning)',
            tint: 'var(--ds-warning-tint)',
          },
          danger: {
            DEFAULT: 'var(--ds-danger)', // sin tenue definido en la Constitución — no inventar uno
          },
          // Velos de interacción — Constitución: "Hover: velo neutro rgba(0,0,0,0.03)…
          // Pressed: el doble del hover" (rgba(0,0,0,0.06)). Únicos tokens de
          // interacción del sistema — reemplazan cualquier hover:bg-black/[...] a mano.
          interaction: {
            hover: 'var(--ds-interaction-hover)',
            pressed: 'var(--ds-interaction-pressed)',
          },
          // Velo de modal (Constitución, Nivel 2 — Modal: "sobre velo rgba(0,0,0,0.24)").
          // Sin consumidor en Fase I — lo usará el Sheet en Fase II.
          scrim: 'var(--ds-scrim)',
        },
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
        // Design System — reposo es SIN sombra (usar border/default en su lugar).
        // Prohibido: glassmorphism, sombras de color, sombras hover decorativas.
        'ds-floating': '0 4px 12px rgba(0, 0, 0, 0.06)',
        'ds-modal': '0 12px 32px rgba(0, 0, 0, 0.10)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        // Design System — control 6px · surface 10px · modal 16px · full 999px (nunca en botones)
        'ds-control': '6px',
        'ds-surface': '10px',
        'ds-modal': '16px',
        'ds-full': '999px',
      },
      fontFamily: {
        // Design System — Inter cargada vía Google Fonts en index.html (400/500/600/700).
        // La familia legacy 'Outfit' (src/index.css) sigue siendo el default de <html>
        // hasta que las pantallas migren; los componentes ds/ usan font-ds explícitamente.
        ds: ['Inter', '-apple-system', 'sans-serif'],
      },
      transitionDuration: {
        // Design System — motion: fast 120ms · base 200ms · slow 320ms (máximo absoluto)
        'ds-fast': '120ms',
        'ds-base': '200ms',
        'ds-slow': '320ms',
      },
      transitionTimingFunction: {
        // Design System — curva única
        'ds': 'cubic-bezier(0.2, 0, 0, 1)',
      },
      spacing: {
        // Design System — escala de espaciado 4·8·16·24·32·48·64·96.
        // Mapeo a la escala numérica de Tailwind (unidad = 4px): ya cubierta
        // por los tokens nativos 1(4) 2(8) 4(16) 6(24) 8(32) 12(48) 16(64) 24(96).
        // No se redefine la escala completa — solo se documenta el mapeo acá.
      },
      scale: {
        '102': '1.02',
      },
      opacity: {
        // Design System — opacidad única de estado disabled (Constitución).
        'ds-disabled': '0.45',
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
