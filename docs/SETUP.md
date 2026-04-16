# Guía de Instalación y Configuración

Esta guía te llevará paso a paso desde la clonación del repositorio hasta tener la aplicación corriendo localmente.

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18.x o superior ([Descargar aquí](https://nodejs.org/))
- **npm** 9.x o superior (viene con Node.js)
- **Git** ([Descargar aquí](https://git-scm.com/))
- Una cuenta en [Supabase](https://supabase.com) (gratuita)

---

## Instalación Rápida

### 1. Clonar el repositorio

```bash
git clone https://github.com/risso-patron/Saldo.git
cd Saldo
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
# Usa tu editor favorito (VS Code, Notepad++, etc.)
code .env
```

### 4. Configurar Supabase

#### 4.1 Crear proyecto en Supabase
1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click en "New Project"
3. Completa los datos:
   - **Name**: Budget Calculator
   - **Database Password**: [guarda esta contraseña]
   - **Region**: Elige el más cercano a tu ubicación
4. Click en "Create new project" (tarda ~2 minutos)

#### 4.2 Obtener las API Keys
1. En tu proyecto, ve a **Settings** → **API**
2. Copia:
   - **Project URL** → pégalo en `VITE_SUPABASE_URL`
   - **anon public** key → pégalo en `VITE_SUPABASE_ANON_KEY`

#### 4.3 Crear las tablas
1. En Supabase, ve a **SQL Editor**
2. Click en "New Query"
3. Copia y pega el contenido de `supabase/schema.sql`
4. Click en "Run" (▶️)
5. Repite con `supabase/subscriptions-schema.sql`

#### 4.4 Configurar autenticación
1. Ve a **Authentication** → **Providers**
2. Habilita **Email** (ya debería estar activo)
3. Opcional: Habilita **Google** o **GitHub** si quieres login social

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3000**

---

## Configuración Opcional

### Integración de IA (Claude API)

Para habilitar el análisis financiero con IA:

1. Crea una cuenta en [Anthropic](https://console.anthropic.com/)
2. Genera una API key
3. Agrégala a tu `.env`:
   ```
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-tu_key_aquí
   ```

**Nota:** La app funciona perfectamente sin esto, solo no tendrás las features de IA.

---

### Stripe (Pagos Premium)

Para habilitar suscripciones premium:

1. Crea una cuenta en [Stripe](https://dashboard.stripe.com/)
2. Obtén tu **Publishable key** (modo test)
3. Agrégala a tu `.env`:
   ```
   VITE_STRIPE_PUBLIC_KEY=pk_test_tu_key_aquí
   ```

---

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo (puerto 3000)

# Build
npm run build            # Genera build de producción
npm run preview          # Preview del build (puerto 4173)

# Calidad de código
npm run lint             # Ejecuta ESLint
npm run format           # Formatea código con Prettier

# Testing
npm run test             # Ejecuta tests con Vitest
npm run test:ui          # Interfaz visual de tests

# Deployment
npm run deploy           # Deploy a GitHub Pages
```

---

## Estructura del Proyecto

```
budget-calculator-react/
├── public/              # Archivos estáticos
│   ├── animations/      # Animaciones WebP
│   └── icons/           # Iconos de la app
├── src/
│   ├── components/      # Componentes React organizados por feature
│   ├── features/        # Features completas (gamification, goals, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── contexts/        # Context API (Auth, Theme)
│   ├── utils/           # Funciones helper
│   ├── pages/           # Páginas principales
│   └── styles/          # Estilos globales y temas
├── docs/                # Documentación
└── supabase/            # Esquemas de base de datos
```

---

## Solución de Problemas

### Error: "Supabase client not initialized"

**Causa:** Falta configurar las variables de entorno de Supabase.

**Solución:**
1. Verifica que `.env` existe
2. Confirma que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están configuradas
3. Reinicia el servidor: `Ctrl+C` y luego `npm run dev`

---

### Error: "Failed to fetch"

**Causa:** Las tablas de Supabase no están creadas.

**Solución:**
1. Ve a Supabase SQL Editor
2. Ejecuta `supabase/schema.sql`
3. Verifica que las tablas aparecen en Table Editor

---

### La app carga pero no guarda datos

**Causa:** Row Level Security (RLS) mal configurado en Supabase.

**Solución:**
Ver [docs/API.md](./API.md) sección "Configurar RLS".

---

### Puerto 3000 ya en uso

**Solución:**
```bash
# Opción 1: Usar otro puerto
PORT=3001 npm run dev

# Opción 2: Matar el proceso en el puerto 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID [número_de_proceso] /F
```

---

## Instalación como PWA (Móvil)

La app puede instalarse en tu móvil como app nativa:

### Android
1. Abre la app en Chrome
2. Tap en los 3 puntos (⋮)
3. "Agregar a pantalla de inicio"

### iOS
1. Abre la app en Safari
2. Tap en compartir (⬆️)
3. "Agregar a pantalla de inicio"

---

## Personalización

### Cambiar colores del tema

Edita `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#667eea', // ← Cambia este color
  }
}
```

### Agregar nuevas categorías de gastos

Edita `src/constants/categories.js`

---

## Próximos Pasos

Una vez tengas la app corriendo:

1. Crea tu cuenta y haz login
2. Agrega transacciones de prueba para ver cómo funciona
3. Explora las features:
   - Gráficos interactivos
   - Metas financieras
   - Sistema de logros
   - Exportar reportes PDF
4. Lee la documentación completa: [README.md](../README.md)

---

## Necesitas ayuda?

- Issues: [GitHub Issues](https://github.com/risso-patron/budget-calculator-react/issues)
- Documentación API: [docs/API.md](./API.md)
- Email: luisrissopa@gmail.com

---

Listo para empezar.
