# Budget Calculator - Gestión Inteligente de Finanzas Personales

<div align="center">

**Aplicación web completa para control de finanzas personales con IA, gráficos interactivos, gamificación y sincronización en la nube**

[![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Netlify](https://img.shields.io/badge/Netlify-deployed-00C7B7?logo=netlify&logoColor=white)](https://netlify.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Ver Demo](https://budget-calculator.netlify.app) · [Reportar Bug](https://github.com/risso-patron/budget-calculator-react/issues) · [Solicitar Feature](https://github.com/risso-patron/budget-calculator-react/issues)

</div>

---

## Features Principales

### Landing Page Promocional
- Página de inicio con hero, estadísticas y grilla de features
- Navegación directa al login/registro sin perder el flujo
- Diseño glassmorphism consistente con el resto de la app

### Gestión de Transacciones
- Registro de ingresos y gastos con categorías personalizadas
- Filtros avanzados por fecha, categoría y monto
- Edición y eliminación con confirmación
- Importación masiva desde CSV/Excel bancarios con mapeo automático por IA
- Exportación profesional a PDF y CSV
- Transacciones recurrentes (se auto-procesan al vencer)

### Presupuestos por Categoría
- Definición de presupuestos mensuales por categoría
- Seguimiento en tiempo real vs. gasto real
- Alertas visuales al superar límites

### Análisis y Reportes
- Dashboard con métricas en tiempo real
- 8 tipos de gráficos interactivos: Donut, Línea de tendencia, Barras, Comparativo, Flujo mensual, Gasto diario, Top comercios, Categorías
- Filtros por período: 15d, 30d, 3m, Todo
- Reportes descargables en PDF con gráficos incrustados y análisis por categoría

### Inteligencia Artificial (multi-proveedor)
- Google Gemini API — gratis, 1500 req/día
- Groq Llama 3.3 — gratis, 30 req/min
- Anthropic Claude — opcional, pago
- Ollama — local, ilimitado
- Score de salud financiera (0-100)
- Detección automática de patrones de gasto
- Recomendaciones personalizadas y predicciones
- Categorización automática en importación CSV
- Chat financiero conversacional
- Proxy seguro via Netlify Functions (las API keys nunca expuestas al navegador)

### Metas Financieras
- Creación de metas de ahorro con fecha objetivo
- Seguimiento visual de progreso con barra porcentual
- Proyección de cumplimiento ("¿llegas a tiempo?")
- Confetti y animaciones al alcanzar una meta

### Espacios Compartidos
- Presupuesto compartido con pareja, familia o equipo
- Sincronización en tiempo real con Supabase Realtime
- Código de invitación para unirse a un espacio
- Transacciones compartidas con atribución por miembro

### Gestión de Tarjetas de Crédito
- Múltiples tarjetas con límites personalizados
- Control de deuda del mes actual
- Integración con el balance (resta la deuda del balance real)

### Gamificación
- 24 achievements desbloqueables por uso consistente
- Logros por transacciones, metas, rachas, hitos de balance y exportaciones
- Niveles y puntos de experiencia
- Panel visual de logros con iconos

### Multi-Moneda
- Más de 150 monedas soportadas
- Selector persistente por usuario
- Formateo automático en toda la interfaz

### Autenticación y Seguridad
- Login/Registro con email y contraseña
- OAuth con Google
- Recuperación de contraseña
- Migración automática de datos localStorage → Supabase al registrarse
- Row Level Security (RLS) activo en todas las tablas
- Sanitización de inputs contra XSS
- Precisión financiera con Decimal.js (sin errores de punto flotante)

### Configuración de Cuenta
- Modal de ajustes de cuenta (nombre, email, preferencias)
- Gestión de perfil de usuario

### UI/UX
- Landing page promocional con CTA a login/registro
- Dark mode nativo (detecta preferencia del sistema)
- Diseño 100% responsive: móvil, tablet, desktop
- Animaciones con Framer Motion y Lottie
- PWA instalable en móvil y escritorio
- Accesibilidad WCAG 2.1: `aria-*`, `useId()`, navegación por teclado

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
- **React 19.1** — Framework UI
- **Vite 5.4** — Build tool
- **TailwindCSS 3.4** — Utility-first CSS
- **Framer Motion 12** — Animaciones fluidas
- **Recharts 3** + **Chart.js 4** — Gráficos interactivos
- **React Number Format** — Inputs de moneda
- **Phosphor Icons** — Sistema de iconos

</td>
<td valign="top" width="50%">

### Backend & Servicios
- **Supabase** — BaaS completo
  - PostgreSQL + Row Level Security
  - Auth (Email/Password + Google OAuth)
  - Realtime (espacios compartidos)
- **IA multi-proveedor** — Gemini (gratis), Groq (gratis), Claude, Ollama
- **Netlify Functions** — Proxy seguro para API keys
- **Stripe** — Integración de pagos (configurado)

</td>
</tr>
</table>

### Otras Librerías
- **Decimal.js** — Precisión financiera (sin errores de punto flotante)
- **jsPDF** + **jsPDF-AutoTable** — Generación de PDFs con gráficos
- **PapaParse** — Procesamiento de CSV bancarios
- **Lottie React** — Animaciones JSON
- **React Confetti** — Celebraciones visuales
- **es-toolkit** — Utilidades funcionales
- **PropTypes** — Validación de props en runtime

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
│   ├── animations/            # Animaciones WebP optimizadas
│   ├── icons/                 # Iconos 3D de categorías
│   └── manifest.json          # PWA manifest
│
├── netlify/
│   └── functions/
│       └── ai-proxy.js        # Proxy serverless para API keys de IA
│
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx    # Landing page promocional
│   │   └── AuthPage.jsx       # Login / Registro / Recuperar contraseña
│   │
│   ├── components/
│   │   ├── AI/                # AIInsightsPanel, AIAlerts, PredictiveChart, AIProviderStatus
│   │   ├── Auth/              # LoginForm, RegisterForm, ForgotPasswordForm, ProfileMenu
│   │   ├── Charts/            # 8 componentes de gráficos (Recharts + Chart.js)
│   │   ├── CreditCard/        # CreditCardManager
│   │   ├── Dashboard/         # BalanceCard, CategoryChart
│   │   ├── Shared/            # Button, Card, Alert, Modal, ConfirmDialog, BudgetLogo, ThemeToggle
│   │   ├── Subscription/      # UpgradeModal, PricingPlans
│   │   └── Transactions/      # TransactionForm, TransactionList, TransactionItem, EditTransactionModal
│   │
│   ├── features/
│   │   ├── budgets/           # BudgetManager — presupuestos por categoría
│   │   ├── chat/              # AIChat — chat financiero con IA
│   │   ├── currency/          # CurrencySelector — 150+ monedas
│   │   ├── export/            # ExportManager, exportUtils — PDF/CSV
│   │   ├── gamification/      # GamificationDashboard, 24 logros, notificaciones
│   │   ├── goals/             # GoalManager, GoalProgress
│   │   ├── import/            # ImportManager — CSV bancario con mapeo IA
│   │   ├── recurring/         # RecurringManager — transacciones recurrentes
│   │   └── sharing/           # SharedSpaceManager — espacios compartidos Realtime
│   │
│   ├── hooks/
│   │   ├── useTransactions.js          # CRUD transacciones + cálculos
│   │   ├── useLocalStorage.js          # Sincronización reactiva con localStorage
│   │   ├── useAIInsightsMulti.js       # IA multi-proveedor (activo)
│   │   ├── useSubscription.js          # Gestión de plan Free/Pro
│   │   ├── useRecurring.js             # Transacciones recurrentes
│   │   ├── useSharedSpace.js           # Supabase Realtime sync
│   │   └── gamification/useAchievements.js
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx             # Autenticación global (Supabase)
│   │   ├── ThemeContext.jsx            # Dark/light mode
│   │   └── CurrencyContext.jsx         # Moneda activa y formateo
│   │
│   ├── utils/
│   │   ├── formatters.js               # Moneda, porcentajes, fechas
│   │   ├── validators.js               # Validación de campos de formulario
│   │   ├── sanitize.js                 # Sanitización XSS de inputs
│   │   ├── currencyHelpers.js          # Operaciones con Decimal.js
│   │   ├── chartHelpers.jsx            # Helpers para gráficos
│   │   ├── dataMigration.js            # localStorage → Supabase
│   │   └── calculations.js             # Lógica financiera pura + tests
│   │
│   ├── lib/
│   │   ├── supabase.js                 # Cliente Supabase
│   │   └── ai-providers.js             # Integración multi-proveedor IA
│   │
│   └── constants/
│       ├── categories.js               # Categorías + STORAGE_KEYS
│       └── icons.js                    # Mapping de iconos
│
├── supabase/
│   ├── schema.sql                      # Tablas principales
│   └── subscriptions-schema.sql        # Tabla de suscripciones
│
└── docs/                               # Documentación extendida
    ├── SETUP.md
    ├── API.md
    ├── CHANGELOG.md
    └── setup/                          # Guías específicas de configuración
```

---

## Capacidad y Escalabilidad

La app usa Supabase (BaaS) + Netlify (hosting + functions). No hay servidor propio que escalar.

### Plan Gratuito (actual)

| Servicio | Límite | Impacto |
|----------|--------|---------|
| Supabase Auth | **50,000 usuarios activos/mes** | Máximo de cuentas registradas |
| Supabase DB bandwidth | 2 GB/mes | ~5,000 usuarios con uso normal |
| Supabase storage | 500 MB | ~20,000 usuarios con 200 tx cada uno |
| Netlify Functions | 125,000 req/mes | ~4,200 análisis de IA por día |
| Netlify CDN | 100 GB/mes | Prácticamente ilimitado para la web estática |

**Simultáneos estimados:** 500–2,000 sesiones activas sin degradación.

### Escalado a Pago (~$44/mes)

| Servicio | Costo | Lo que agrega |
|----------|-------|---------------|
| Supabase Pro | $25/mes | Usuarios ilimitados, 8 GB storage, 50 GB bandwidth |
| Netlify Pro | $19/mes | 1M function invocations/mes, builds prioritarios |

Con Pro: **+100,000 usuarios activos** sin tocar el código.

> Esta arquitectura (React SPA + Supabase + Netlify) es la misma que usan productos como Pocketbase, Habit trackers y herramientas SaaS pequeñas-medianas. El free tier es suficiente para validar el producto y los primeros miles de usuarios.

---

## Roadmap

### Completado ✅
- Landing page promocional con CTA a login/registro
- CRUD completo de transacciones (ingresos / gastos)
- Presupuestos por categoría con seguimiento en tiempo real
- Autenticación con Supabase (email + Google OAuth)
- 8 tipos de gráficos interactivos
- Exportación PDF con gráficos incrustados y CSV
- Importación CSV bancario con mapeo automático por IA
- Transacciones recurrentes auto-procesadas
- Multi-moneda (150+ divisas)
- Espacios compartidos con Supabase Realtime
- Chat financiero conversacional con IA
- Sistema de gamificación (24 logros, niveles, rachas)
- Metas de ahorro con proyección de cumplimiento
- Gestión de tarjetas de crédito
- Modal de configuración de cuenta
- Dark mode + PWA instalable
- Proxy seguro para API keys de IA (Netlify Functions)

### En Desarrollo 🔄
- Tests unitarios e integración (cobertura objetivo: 70%+)
- CI/CD con GitHub Actions
- Migración gradual a TypeScript

### Próximas Features 🔮
- Recordatorios y alertas de pagos
- Integración con APIs bancarias reales (Plaid)
- App móvil nativa (React Native)
- Inversiones y seguimiento de crypto

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
