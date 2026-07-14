import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  // vitest 4.1.x dejó de aplicar el runtime automático de JSX por defecto en
  // archivos .jsx (en 4.0.x era implícito) — sin esto, todo JSX en tests falla
  // con "ReferenceError: React is not defined".
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/setupTests.js']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
