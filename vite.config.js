import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // En producción: las API keys de IA NO deben ir al bundle del cliente.
  // El proxy de Netlify Functions las lee desde process.env (sin prefijo VITE_).
  // Este bloque reemplaza estáticamente esas variables con string vacío
  // aunque estén definidas como env vars en el panel de Netlify, previniendo
  // que el scanner de secretos falle el build.
  ...(mode === 'production' && {
    define: {
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(''),
    },
  }),

  // Optimizaciones de build
  build: {
    minify: 'esbuild',
    chunkSizeWarningLimit: 700, // pdf + animaciones son inherentemente grandes
    sourcemap: false,

    rollupOptions: {
      output: {
        // Code-splitting manual: divide el bundle de 2.38 MB en chunks cacheables
        // NOTA: React NO se separa en vendor-react porque framer-motion llama
        // React.createContext() al inicializarse (efecto lateral de módulo).
        // Si React está en un chunk separado puede no estar cargado a tiempo → crash.
        // React queda en el index principal (~320 kB) garantizando orden de carga.
        manualChunks: (id) => {
          // Recharts + dependencias de gráficos → chunk separado
          if (id.includes('node_modules/recharts') ||
              id.includes('node_modules/es-toolkit') ||
              id.includes('node_modules/victory-vendor') ||
              id.includes('node_modules/d3-')) {
            return 'vendor-charts';
          }

          // PDF y exportación → solo se carga cuando el usuario exporta
          if (id.includes('node_modules/jspdf') ||
              id.includes('node_modules/jspdf-autotable') ||
              id.includes('node_modules/html2canvas')) {
            return 'vendor-pdf';
          }

          // Animaciones → framer-motion y lottie son grandes
          if (id.includes('node_modules/framer-motion') ||
              id.includes('node_modules/lottie-react') ||
              id.includes('node_modules/lottie-web')) {
            return 'vendor-animations';
          }

          // Supabase → cliente de base de datos
          if (id.includes('node_modules/@supabase/')) {
            return 'vendor-supabase';
          }

          // UI utilities → iconos, inputs numéricos, confetti
          if (id.includes('node_modules/@phosphor-icons') ||
              id.includes('node_modules/react-number-format') ||
              id.includes('node_modules/react-confetti')) {
            return 'vendor-ui';
          }

          // Procesamiento de datos → CSV, sanitización, decimales
          if (id.includes('node_modules/papaparse') ||
              id.includes('node_modules/dompurify') ||
              id.includes('node_modules/decimal.js')) {
            return 'vendor-data';
          }
        },
      },
    },
  },
  
  // Server config para desarrollo
  server: {
    port: 5174, // Cambiado temporalmente para evitar cache
    strictPort: false,
    open: true,
  },
  
  // Preview config
  preview: {
    port: 4173,
    strictPort: true,
  },
  
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@supabase/supabase-js',
      'es-toolkit/compat',
      'recharts'
    ],
  },
  
  // Resolver alias para problemas de módulos
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  
  // SSR options para resolver CommonJS
  ssr: {
    noExternal: ['es-toolkit'],
  },
}))
