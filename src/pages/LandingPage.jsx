import {
  Brain,
  ChartBar,
  Target,
  CurrencyDollar,
  Trophy,
  Users,
  Export,
  CalendarBlank,
  ArrowRight,
  CheckCircle,
  TrendUp,
  Shield,
  UploadSimple,
} from '@phosphor-icons/react'
import BudgetLogo from '../components/Shared/BudgetLogo'

// ─── Datos de features ────────────────────────────────────────────────────────
const features = [
  {
    icon: Brain,
    title: 'IA Multi-Proveedor',
    desc: 'Análisis con Gemini, Groq y Claude. Score de salud financiera, predicciones y recomendaciones personalizadas.',
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: ChartBar,
    title: '8 Tipos de Gráficos',
    desc: 'Donut, tendencias, barras, flujo mensual, comercios frecuentes y más. Filtros por período interactivos.',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: Target,
    title: 'Metas Financieras',
    desc: 'Define objetivos con fecha límite, sigue el progreso en tiempo real y celebra cuando los alcanzas.',
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
  {
    icon: CurrencyDollar,
    title: 'Multi-Moneda',
    desc: 'Más de 150 monedas soportadas. Trabaja en la divisa que prefieras y convierte al instante.',
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  {
    icon: Trophy,
    title: 'Gamificación',
    desc: '24 logros desbloqueables, rachas de registro y niveles de experiencia. Tus finanzas como un juego.',
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  {
    icon: Users,
    title: 'Espacios Compartidos',
    desc: 'Comparte tu presupuesto con pareja o familia en tiempo real gracias a sincronización con Supabase.',
    gradient: 'from-teal-500 to-blue-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
  },
  {
    icon: Export,
    title: 'Exportar PDF & CSV',
    desc: 'Reportes profesionales en PDF con gráficos incrustados. Exportación CSV lista para Excel o Google Sheets.',
    gradient: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: CalendarBlank,
    title: 'Transacciones Recurrentes',
    desc: 'Automatiza gastos fijos como alquiler, suscripciones y servicios. Se procesan solos al vencer.',
    gradient: 'from-pink-500 to-rose-500',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
  },
  {
    icon: UploadSimple,
    title: 'Importar CSV Bancario',
    desc: 'Carga extractos de tu banco, mapeo automático de columnas con IA y categorización inteligente.',
    gradient: 'from-slate-400 to-slate-600',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
  },
]

// ─── Estadísticas ─────────────────────────────────────────────────────────────
const stats = [
  { value: '150+', label: 'Monedas soportadas' },
  { value: '8', label: 'Tipos de gráficos' },
  { value: '24', label: 'Logros desbloqueables' },
  { value: '4', label: 'Proveedores de IA' },
]

// ─── Beneficios del hero ──────────────────────────────────────────────────────
const heroBenefits = [
  'Gratis para empezar, sin tarjeta de crédito',
  'IA gratuita con Google Gemini',
  'Datos seguros con Supabase + RLS',
]

// ─── Componente principal ─────────────────────────────────────────────────────
export default function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">

      {/* Blobs de fondo animados */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <BudgetLogo size={36} />
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Budget Calculator
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm text-gray-300 hover:text-white transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/5"
          >
            Iniciar sesión
          </button>
          <button
            onClick={onGetStarted}
            className="text-sm font-semibold px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 transition-all shadow-lg shadow-purple-900/40 hover:scale-105"
          >
            Comenzar gratis
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-sm text-purple-300 mb-8 backdrop-blur-sm">
          <TrendUp size={16} weight="bold" aria-hidden="true" />
          <span>Gestión financiera con Inteligencia Artificial</span>
        </div>

        {/* Logo centrado */}
        <div className="flex justify-center mb-8">
          <BudgetLogo size={88} />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Controla tus finanzas{' '}
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            con inteligencia
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Registra ingresos y gastos, visualiza tu dinero con gráficos interactivos y recibe
          análisis personalizados de IA. Todo en un solo lugar, gratis para empezar.
        </p>

        {/* Beneficios rápidos */}
        <ul className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10" role="list">
          {heroBenefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckCircle size={16} weight="fill" className="text-green-400 shrink-0" aria-hidden="true" />
              {benefit}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 font-bold text-lg shadow-2xl shadow-purple-900/50 hover:scale-105 transition-all"
            aria-label="Crear cuenta gratis y comenzar"
          >
            Comenzar gratis
            <ArrowRight
              size={20}
              weight="bold"
              className="group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </button>
          <button
            onClick={onLogin}
            className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 font-semibold text-lg backdrop-blur-sm transition-all hover:scale-105"
            aria-label="Iniciar sesión en tu cuenta"
          >
            Ya tengo cuenta
          </button>
        </div>
      </section>

      {/* ── Stats ── */}
      <section
        className="relative z-10 px-6 pb-20 max-w-4xl mx-auto"
        aria-label="Estadísticas de la aplicación"
      >
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-colors"
            >
              <dt className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
                {value}
              </dt>
              <dd className="text-sm text-gray-400">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Features grid ── */}
      <section
        className="relative z-10 px-6 pb-24 max-w-6xl mx-auto"
        aria-labelledby="features-heading"
      >
        <div className="text-center mb-14">
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Todo lo que necesitas para{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              controlar tu dinero
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Desde el registro diario hasta análisis avanzados con IA, tenemos cada herramienta que necesitas.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list">
          {features.map(({ icon: Icon, title, desc, gradient, bg, border }) => (
            <li
              key={title}
              className={`${bg} ${border} border backdrop-blur-sm rounded-2xl p-6 hover:scale-[1.02] transition-transform group`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}
                aria-hidden="true"
              >
                <Icon size={24} weight="bold" className="text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── CTA final ── */}
      <section className="relative z-10 px-6 pb-24 max-w-2xl mx-auto text-center">
        <div className="backdrop-blur-md bg-white/5 border border-white/15 rounded-3xl p-10 shadow-2xl">
          <Shield size={40} weight="fill" className="text-purple-400 mx-auto mb-4" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-3">
            Empieza hoy, es gratis
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Crea tu cuenta en segundos. Tus datos están protegidos con cifrado y Row Level Security.
            Sin compromisos, sin tarjeta de crédito.
          </p>
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 font-bold text-lg shadow-2xl shadow-purple-900/50 hover:scale-105 transition-all"
            aria-label="Crear cuenta gratis"
          >
            Crear cuenta gratis
            <ArrowRight
              size={20}
              weight="bold"
              className="group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </button>
          <p className="mt-5 text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={onLogin}
              className="text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-6 text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BudgetLogo size={20} />
          <span className="text-gray-400 font-medium">Budget Calculator</span>
        </div>
        <p>Gestión de finanzas personales con IA · Hecho con React + Supabase</p>
      </footer>
    </div>
  )
}
