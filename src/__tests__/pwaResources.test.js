import fs from 'fs'
import path from 'path'

// PWA-001: verifica que los recursos de PWA declarados en manifest.json,
// index.html y service-worker.js existan realmente en public/ — evita que
// vuelva a romperse cache.addAll() del Service Worker (atómico: una sola
// ruta 404 hace fallar la instalación completa) o que index.html/manifest.json
// referencien íconos inexistentes.

const ROOT = path.resolve(__dirname, '../..')
const PUBLIC_DIR = path.join(ROOT, 'public')

const resolvePublicPath = (src) => path.join(PUBLIC_DIR, src.replace(/^\//, ''))

describe('PWA-001 — recursos gráficos y precache existen realmente', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'manifest.json'), 'utf-8'))
  const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8')
  const serviceWorker = fs.readFileSync(path.join(PUBLIC_DIR, 'service-worker.js'), 'utf-8')

  it('manifest.json declara un ícono de 192x192 y uno de 512x512', () => {
    const sizes = manifest.icons.map((icon) => icon.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')
  })

  it('todos los íconos declarados en manifest.json existen en public/', () => {
    for (const icon of manifest.icons) {
      const filePath = resolvePublicPath(icon.src)
      expect(fs.existsSync(filePath), `Falta el archivo: ${icon.src}`).toBe(true)
    }
  })

  it('el apple-touch-icon de index.html apunta a un archivo existente', () => {
    const match = indexHtml.match(/rel="apple-touch-icon"[^>]*href="([^"]+)"/)
    expect(match).not.toBeNull()
    const filePath = resolvePublicPath(match[1])
    expect(fs.existsSync(filePath), `apple-touch-icon apunta a un archivo inexistente: ${match[1]}`).toBe(true)
  })

  it('index.html no repite la misma etiqueta <link rel="icon"> con el mismo href', () => {
    const iconLinks = [...indexHtml.matchAll(/<link rel="icon"[^>]*href="([^"]+)"[^>]*\/>/g)].map((m) => m[0])
    expect(new Set(iconLinks).size).toBe(iconLinks.length)
  })

  it('todas las rutas de INITIAL_CACHED_RESOURCES en service-worker.js existen en public/', () => {
    const match = serviceWorker.match(/INITIAL_CACHED_RESOURCES\s*=\s*\[([\s\S]*?)\]/)
    expect(match).not.toBeNull()
    const routes = [...match[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
    expect(routes.length).toBeGreaterThan(0)
    for (const route of routes) {
      const filePath = resolvePublicPath(route)
      expect(fs.existsSync(filePath), `Ruta precacheada inexistente: ${route}`).toBe(true)
    }
  })
})
