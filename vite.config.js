import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Optimizaciones de build
  build: {
    minify: 'esbuild',
    chunkSizeWarningLimit: 700, // pdf + animaciones son inherentemente grandes
    sourcemap: false,

    rollupOptions: {
      output: {
        // Code-splitting manual: divide el bundle de 2.38 MB en chunks cacheables
        manualChunks: (id) => {
          // React core → cacheado indefinidamente, raramente cambia
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-is/') ||
              id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }

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
})
