# 💰 Budget Calculator - Gestión Inteligente de Finanzas Personales

<div align="center">

![Budget Calculator Banner](./docs/images/banner.png)

**Aplicación web moderna para control total de tus finanzas personales**

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-SITE-ID/deploy-status)](https://app.netlify.com/sites/budget-calculator/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?logo=vite)](https://vitejs.dev)

[🚀 Ver Demo](https://budget-calculator.netlify.app) · [📖 Documentación](./docs) · [🐛 Reportar Bug](https://github.com/risso-patron/budget-calculator-react/issues) · [💡 Solicitar Feature](https://github.com/risso-patron/budget-calculator-react/issues)

</div>

---

## 📸 Screenshots

<div align="center">

### Desktop View
![Dashboard Desktop](./docs/images/desktop-dashboard.png)

### Mobile View
<img src="./docs/images/mobile-view.png" width="300" alt="Mobile Dashboard">

### Dark Mode
![Dark Mode](./docs/images/dark-mode.png)

</div>

---

## ✨ Features

### 💸 Gestión de Transacciones
- ✅ Registro de ingresos y gastos
- ✅ Categorización automática
- ✅ Filtros y búsqueda avanzada
- ✅ Edición y eliminación de transacciones
- ✅ Importación masiva desde CSV/Excel
- ✅ Exportación a PDF y CSV

### 📊 Análisis y Reportes
- ✅ Dashboard con métricas clave
- ✅ Gráficos interactivos (Donut, Línea, Barras, Comparativo)
- ✅ Análisis de tendencias
- ✅ Reportes profesionales descargables
- ✅ Estadísticas por categoría y período

### 🎯 Metas Financieras
- ✅ Creación de metas de ahorro
- ✅ Seguimiento de progreso
- ✅ Proyecciones de cumplimiento
- ✅ Notificaciones de logros

### 💳 Gestión de Tarjetas
- ✅ Múltiples tarjetas de crédito
- ✅ Control de límites
- ✅ Alertas de vencimiento
- ✅ Cálculo de intereses

### 🎮 Gamificación
- ✅ Sistema de logros (24 achievements)
- ✅ Niveles y experiencia
- ✅ Rachas de uso consistente
- ✅ Recompensas por metas alcanzadas

### 🔐 Autenticación y Seguridad
- ✅ Login/Registro con Supabase Auth
- ✅ Datos sincronizados en la nube
- ✅ Recuperación de contraseña
- ✅ Sesión persistente segura

### 🎨 UI/UX Moderna
- ✅ Dark mode nativo
- ✅ Responsive design (móvil, tablet, desktop)
- ✅ Animaciones suaves con Framer Motion
- ✅ Diseño intuitivo y accesible
- ✅ PWA (instalable en móvil)

---

## 🛠️ Tech Stack

### Frontend
- **React 19.1** - Framework UI
- **Vite 7.1** - Build tool ultra-rápido
- **TailwindCSS 3.4** - Utility-first CSS
- **Framer Motion 12** - Animaciones

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Auth
  - Real-time subscriptions
  - Row Level Security (RLS)

### Libraries
- **Recharts 3.3** - Gráficos interactivos
- **jsPDF + jsPDF-AutoTable** - Generación de PDFs
- **PapaParse** - Parsing de CSV
- **React Confetti** - Efectos de celebración

### DevOps & Tools
- **GitHub Actions** - CI/CD
- **Netlify** - Hosting y deployment
- **ESLint** - Linting
- **PostCSS + Autoprefixer** - CSS processing

---

## 🚀 Getting Started

### Pre-requisitos

- Node.js 18+ ([Descargar](https://nodejs.org))
- npm o yarn
- Cuenta en [Supabase](https://supabase.com) (gratis)

### Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/risso-patron/budget-calculator-react.git
cd budget-calculator-react
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) 🎉

---

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo
npm run build            # Build para producción
npm run preview          # Preview del build
npm run lint             # Ejecuta ESLint

# Deployment
npm run deploy           # Deploy a GitHub Pages
npm run build:analyze    # Analiza tamaño del bundle
npm run build:prod       # Build optimizado para producción

# Utilidades
npm run clean            # Limpia caché y dist/
npm run format           # Formatea código con Prettier
```

---

## 🗂️ Estructura del Proyecto

```
budget-calculator-react/
├── public/              # Assets estáticos
│   ├── icons/          # PWA icons
│   ├── screenshots/    # Screenshots para README
│   └── manifest.json   # PWA manifest
├── src/
│   ├── components/     # Componentes React
│   │   ├── auth/      # Login, Register, etc.
│   │   ├── charts/    # Gráficos (Donut, Line, Bar)
│   │   ├── common/    # Componentes reutilizables
│   │   └── ui/        # UI elements (Modals, Buttons)
│   ├── features/       # Features modulares
│   │   ├── export/    # Exportación PDF/CSV
│   │   ├── import/    # Importación CSV
│   │   ├── gamification/  # Sistema de logros
│   │   └── goals/     # Metas financieras
│   ├── hooks/          # Custom React Hooks
│   │   ├── useAuth.js
│   │   ├── useSupabase.js
│   │   └── useLocalStorage.js
│   ├── utils/          # Utilidades
│   │   ├── calculations.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── styles/         # Estilos globales
│   ├── App.jsx         # Componente principal
│   └── main.jsx        # Entry point
├── docs/               # Documentación
│   ├── NETLIFY-DEPLOYMENT.md
│   ├── IMPORT-GUIDE.md
│   └── ARCHITECTURE.md
├── .github/
│   └── workflows/
│       └── deploy.yml  # CI/CD pipeline
├── netlify.toml        # Configuración Netlify
├── vercel.json         # Configuración Vercel
├── vite.config.js      # Configuración Vite
├── tailwind.config.js  # Configuración Tailwind
└── package.json
```

---

## 🔧 Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Espera a que inicialize (~2 minutos)

### 2. Configurar Tablas

```sql
-- Crear tabla de transacciones
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ingreso', 'gasto')),
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" 
  ON transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
  ON transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(user_id, category);
```

### 3. Obtener Credenciales

1. Project Settings → API
2. Copia `URL` → `VITE_SUPABASE_URL`
3. Copia `anon public` key → `VITE_SUPABASE_ANON_KEY`

Documentación completa: [docs/SUPABASE-SETUP.md](./docs/SUPABASE-SETUP.md)

---

## 🚀 Deployment

### Netlify (Recomendado)

1. **Push a GitHub**
```bash
git push origin main
```

2. **Conectar en Netlify**
- Ve a [app.netlify.com](https://app.netlify.com)
- Import from GitHub
- Selecciona el repo
- Build command: `npm run build`
- Publish directory: `dist`

3. **Configurar Variables de Entorno**
- Site settings → Environment variables
- Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

4. **Deploy!** 🎉

Guía completa: [docs/NETLIFY-DEPLOYMENT.md](./docs/NETLIFY-DEPLOYMENT.md)

### Vercel (Alternativa)

```bash
npm i -g vercel
vercel
```

---

## 📊 Performance

### Lighthouse Scores

| Métrica | Score |
|---------|-------|
| Performance | 95+ |
| Accessibility | 95+ |
| Best Practices | 95+ |
| SEO | 100 |

### Web Vitals

- **LCP** (Largest Contentful Paint): < 1.5s
- **FID** (First Input Delay): < 50ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Bundle Size

- **JavaScript**: ~180 KB (gzipped)
- **CSS**: ~25 KB (gzipped)
- **Total**: < 1 MB

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea tu branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: Amazing feature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para más detalles.

---

## 📝 Roadmap

### Fase 1 - Core Features ✅
- [x] Gestión de transacciones
- [x] Dashboard con gráficos
- [x] Autenticación con Supabase
- [x] Dark mode
- [x] Responsive design

### Fase 2 - Features Avanzadas ✅
- [x] Gamificación
- [x] Importación CSV
- [x] Exportación PDF/CSV
- [x] Metas financieras
- [x] Gestión de tarjetas

### Fase 3 - Optimización (En Progreso)
- [x] Build optimization
- [x] SEO completo
- [x] PWA manifest
- [ ] Service Worker (offline support)
- [ ] Lighthouse CI

### Fase 4 - Próximas Features
- [ ] Multi-moneda
- [ ] Presupuestos mensuales
- [ ] Notificaciones push (PWA)
- [ ] Compartir reportes
- [ ] Widgets de acceso rápido
- [ ] Integración con bancos (Open Banking)

### Fase 5 - IA y Analytics
- [ ] Análisis con IA (Anthropic Claude)
- [ ] Predicciones de gastos
- [ ] Recomendaciones personalizadas
- [ ] Detección de anomalías

---

## 🐛 Issues Conocidos

Ver [GitHub Issues](https://github.com/risso-patron/budget-calculator-react/issues) para bugs reportados y features solicitadas.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](./LICENSE) para detalles.

---

## 👤 Autor

**Jorge Luis Risso Patrón**

- 🌐 Website: [risso-patron.github.io](https://risso-patron.github.io/risso-patron/)
- 💼 LinkedIn: [linkedin.com/in/jorge-luis-risso-patron](https://www.linkedin.com/in/jorge-luis-risso-patron)
- 🐙 GitHub: [@risso-patron](https://github.com/risso-patron)
- 📧 Email: luisrissopa@gmail.com
- 📱 WhatsApp: [+507 6456-0263](https://wa.me/50764560263)
- 📍 Ubicación: Ciudad de Panamá, Panamá 🇵🇦

---

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) - Backend as a Service
- [Netlify](https://netlify.com) - Hosting y deployment
- [Recharts](https://recharts.org) - Librería de gráficos
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Vite](https://vitejs.dev) - Build tool
- [React](https://react.dev) - UI Framework

---

## ⭐ Show your support

Si este proyecto te fue útil, ¡dale una ⭐ en GitHub! Me ayuda a seguir mejorando.

---

<div align="center">

**Desarrollado con ❤️ en Panamá 🇵🇦**

[⬆ Volver arriba](#-budget-calculator---gestión-inteligente-de-finanzas-personales)

</div>

