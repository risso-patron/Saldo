# Budget Calculator - Gestión Inteligente de Finanzas Personales

<div align="center">

**Aplicación web para control de finanzas personales con autenticación, gráficos interactivos e IA**

[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Reportar Bug](https://github.com/risso-patron/budget-calculator-react/issues) · [Solicitar Feature](https://github.com/risso-patron/budget-calculator-react/issues)

</div>

---

## Features Principales

### Gestión de Transacciones
- Registro de ingresos y gastos con categorías personalizadas
- Filtros avanzados por fecha, categoría y monto
- Edición y eliminación de transacciones
- Importación masiva desde CSV/Excel
- Exportación profesional a PDF y CSV

### Análisis y Reportes
- Dashboard con métricas en tiempo real
- 4 tipos de gráficos interactivos (Donut, Línea, Barras, Comparativo)
- Análisis de tendencias por período
- Reportes descargables con diseño profesional
- Estadísticas detalladas por categoría

### Inteligencia Artificial
- Análisis financiero multi-proveedor (Google Gemini, Groq Llama, Anthropic Claude)
- Score de salud financiera (0-100)
- Detección automática de patrones de gasto
- Recomendaciones personalizadas
- Predicciones de gastos futuros
- Proxy seguro via Netlify Functions (las API keys nunca llegan al navegador)

### Metas Financieras
- Creación de metas de ahorro personalizadas
- Seguimiento visual de progreso
- Proyecciones de cumplimiento
- Notificaciones de logros

### Gestión de Tarjetas
- Múltiples tarjetas de crédito
- Control de límites de crédito
- Alertas de vencimiento
- Cálculo automático de intereses

### Gamificación
- Sistema de logros (24 achievements desbloqueables)
- Niveles y experiencia
- Rachas de uso consistente
- Recompensas por metas alcanzadas

### Autenticación y Seguridad
- Login/Registro con Supabase Auth
- Datos sincronizados en la nube
- Recuperación de contraseña
- Sesión persistente segura
- Row Level Security (RLS)

### UI/UX Moderna
- Dark mode nativo con transiciones suaves
- Diseño 100% responsive (móvil, tablet, desktop)
- Animaciones optimizadas con WebP
- Interfaz intuitiva y accesible
- PWA instalable en móvil

---

## Instalación Rápida

### Requisitos Previos

- Node.js 18+ 
- npm 9+
- Cuenta en [Supabase](https://supabase.com) (gratuita)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/risso-patron/budget-calculator-react.git
cd budget-calculator-react

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en [http://localhost:5174](http://localhost:5174)

Guía completa de instalación: [docs/SETUP.md](./docs/SETUP.md)

---

## Tech Stack

<table>
<tr>
<td valign="top" width="50%">

### Frontend
- **React 19.1** - Framework UI
- **Vite 5.4** - Build tool
- **TailwindCSS 3.4** - Utility-first CSS
- **Framer Motion 12** - Animaciones fluidas
- **Recharts 3** - Gráficos interactivos

</td>
<td valign="top" width="50%">

### Backend & Servicios
- **Supabase** - BaaS completo
  - PostgreSQL database
  - Auth (Email)
  - Row Level Security
- **IA multi-proveedor** - Google Gemini (gratis), Groq (gratis), Anthropic Claude
- **Netlify Functions** - Proxy seguro para API keys

</td>
</tr>
</table>

### Otras Librerías
- **jsPDF** + **jsPDF-AutoTable** - Generación de PDFs
- **PapaParse** - Procesamiento CSV
- **React Confetti** - Celebraciones
- **PropTypes** - Validación de props

---

## Capturas de Pantalla

> Screenshots pendientes de producción.

---

## Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo (puerto 5174)
npm run build            # Build de producción
npm run preview          # Preview del build (puerto 4173)

# Calidad de código
npm run lint             # Ejecutar ESLint
npm run format           # Formatear con Prettier

# Testing
npm run test             # Ejecutar tests con Vitest
npm run test:ui          # UI interactiva de tests
npm run test:coverage    # Reporte de cobertura
```

---

## Estructura del Proyecto

```
budget-calculator-react/
├── public/
│   ├── animations/         # Animaciones WebP optimizadas
│   ├── icons/              # Iconos 3D de categorías
│   └── manifest.json       # PWA manifest
│
├── src/
│   ├── components/         # Componentes React
│   │   ├── AI/            # Componentes de IA
│   │   ├── Auth/          # Autenticación
│   │   ├── Charts/        # Gráficos
│   │   ├── Dashboard/     # Dashboard
│   │   ├── Shared/        # Componentes reutilizables
│   │   └── Transactions/  # Transacciones
│   │
│   ├── features/          # Features completas
│   │   ├── export/        # Exportación PDF/CSV
│   │   ├── gamification/  # Sistema de logros
│   │   ├── goals/         # Metas financieras
│   │   └── import/        # Importación CSV
│   │
│   ├── hooks/             # Custom React hooks
│   │   ├── useTransactions.js
│   │   ├── useAIInsights.js
│   │   └── useLocalStorage.js
│   │
│   ├── contexts/          # React Context
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── utils/             # Funciones helper
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── chartHelpers.js
│   │
│   ├── lib/               # Configuración de librerías
│   │   ├── supabase.js
│   │   └── anthropic.js
│   │
│   └── constants/         # Constantes
│       ├── categories.js
│       └── icons.js
│
├── docs/                  # Documentación
│   ├── SETUP.md          # Guía de instalación
│   ├── API.md            # Documentación de APIs
│   ├── CHANGELOG.md      # Historial de cambios
│   └── setup/            # Guías de configuración
│
└── supabase/             # Esquemas de DB
    ├── schema.sql
    └── subscriptions-schema.sql
```

---

## Roadmap

### Completado
- CRUD de transacciones
- Autenticación con Supabase
- Gráficos interactivos
- Exportación PDF/CSV
- Importación CSV
- Sistema de gamificación
- Integración de IA
- Dark mode
- PWA

### En Desarrollo
- Migración completa a TypeScript
- Tests unitarios y de integración
- CI/CD con GitHub Actions

### Próximas Features
- Presupuestos mensuales
- Recordatorios de pagos
- Integración con bancos (Plaid)
- App móvil nativa (React Native)
- Modo colaborativo (finanzas familiares)
- Inversiones y crypto tracking

---

## Configuración de Supabase

### 1. Crear Proyecto

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click en "New Project"
3. Completa los datos y crea el proyecto

### 2. Configurar Tablas

Ejecuta los scripts SQL en este orden:

```sql
-- 1. Tabla de transacciones
-- Ver: supabase/schema.sql

-- 2. Tabla de suscripciones (opcional)
-- Ver: supabase/subscriptions-schema.sql
```

### 3. Obtener Credenciales

En Settings → API, copia:
- `Project URL` → `VITE_SUPABASE_URL`
- `anon/public key` → `VITE_SUPABASE_ANON_KEY`

Guía completa: [docs/API.md](./docs/API.md#supabase)

---

## Configuración de IA (Opcional)

Soporta 3 proveedores. Al menos uno es suficiente:

| Proveedor | Costo | Límite | Obtener key |
|-----------|-------|--------|-------------|
| Google Gemini | Gratis | 1500 req/día | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| Groq | Gratis | 30 req/min | [console.groq.com](https://console.groq.com/keys) |
| Anthropic Claude | Pago | Según plan | [console.anthropic.com](https://console.anthropic.com/) |

**Desarrollo local** — agregar al `.env`:
```
VITE_GOOGLE_GEMINI_API_KEY=tu_key
VITE_GROQ_API_KEY=tu_key
VITE_ANTHROPIC_API_KEY=tu_key  # opcional
```

**Producción (Netlify)** — configurar en el dashboard **sin prefijo VITE_**:
```
GOOGLE_GEMINI_API_KEY=tu_key
GROQ_API_KEY=tu_key
```
Las keys de producción pasan por `netlify/functions/ai-proxy.js` y nunca llegan al navegador.

Nota: La app funciona completamente sin IA configurada.

---

## Testing

```bash
# Ejecutar todos los tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## Instalación como PWA

### Android
1. Abre la app en Chrome
2. Menú → "Agregar a pantalla de inicio"

### iOS
1. Abre en Safari
2. Compartir → "Agregar a pantalla de inicio"

---

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b mi-nueva-feature`)
3. Commit tus cambios (`git commit -m 'Agregada nueva funcionalidad'`)
4. Push al branch (`git push origin mi-nueva-feature`)
5. Abre un Pull Request

---

## Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

---

## Autor

**Jorge Luis Risso Patrón**

- GitHub: [@risso-patron](https://github.com/risso-patron)
- Email: luisrissopa@gmail.com
- LinkedIn: [jorge-luis-risso-](https://www.linkedin.com/in/jorge-luis-risso-)

---

## Créditos

- [React](https://react.dev) - Framework UI
- [Supabase](https://supabase.com) - Backend as a Service
- [TailwindCSS](https://tailwindcss.com) - Utility-first CSS
- [Recharts](https://recharts.org) - Librería de gráficos
- [Anthropic](https://anthropic.com) - Claude AI
- [Vite](https://vitejs.dev) - Build tool

---

<div align="center">

Desarrollado por Jorge Luis Risso Patrón

[Volver arriba](#budget-calculator---gestión-inteligente-de-finanzas-personales)

</div>
