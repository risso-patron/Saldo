import {
  ArrowRight,
  CheckCircle,
  TrendUp,
  TrendDown,
  Coffee,
  ShoppingBag,
  Lightning,
  Car,
  CaretDown,
  Wallet,
  Sparkle,
  ChartPie,
  Shield,
  Bell,
  Target,
  ShootingStar,
} from '@phosphor-icons/react'
import BudgetLogo from '../components/Shared/BudgetLogo'

// ─── App Mockup ───────────────────────────────────────────────────────────────
const transactions = [
  { Icon: Coffee,       label: 'Starbucks',     amount: -45,  color: 'text-amber-500', bg: 'bg-amber-100' },
  { Icon: ShoppingBag, label: 'Supermercado',   amount: -128, color: 'text-blue-500',  bg: 'bg-blue-100'  },
  { Icon: Lightning,   label: 'Luz del mes',    amount: -89,  color: 'text-yellow-500',bg: 'bg-yellow-100'},
  { Icon: Car,         label: 'Uber',           amount: -35,  color: 'text-slate-500', bg: 'bg-slate-100' },
]

const categories = [
  { label: 'Comida',      pct: 35, bar: 'bg-violet-500' },
  { label: 'Transporte',  pct: 20, bar: 'bg-blue-500'   },
  { label: 'Servicios',   pct: 25, bar: 'bg-emerald-500'},
  { label: 'Otros',       pct: 20, bar: 'bg-amber-500'  },
]

function AppMockup() {
  return (
    <div className="relative w-full max-w-sm lg:max-w-md transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
      {/* AI Badge flotante */}
      <div className="absolute -top-4 right-6 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full shadow-lg border border-gray-100">
        <Sparkle size={16} weight="fill" className="text-violet-500" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-800">IA activa</span>
      </div>

      {/* Phone frame */}
      <div className="bg-white rounded-[2.5rem] p-3 shadow-2xl shadow-violet-200/60 border border-gray-100">
        <div className="bg-gray-50 rounded-[2rem] overflow-hidden">
          {/* Status bar */}
          <div className="bg-white px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-400">9:41</span>
            <div className="w-4 h-2 bg-gray-800/80 rounded-sm" />
          </div>

          {/* App content */}
          <div className="px-4 pb-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-base font-semibold text-gray-900">¡Hola, Luis! 👋</p>
                <p className="text-xs text-gray-500">Tu resumen financiero</p>
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-600">
                Abril <CaretDown size={12} />
              </button>
            </div>

            {/* Balance card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white">
              <p className="text-xs text-white/70 mb-1">Saldo del mes</p>
              <p className="text-3xl font-bold">$1,240</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-300">
                <TrendUp size={14} weight="bold" />
                <span className="text-xs">+12% vs mes anterior</span>
              </div>
            </div>

            {/* Income vs Expenses */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <TrendUp size={12} weight="bold" className="text-emerald-600" />
                  </div>
                  <span className="text-xs text-gray-500">Ingresos</span>
                </div>
                <p className="text-base font-semibold text-emerald-600">$4,500</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                    <TrendDown size={12} weight="bold" className="text-red-500" />
                  </div>
                  <span className="text-xs text-gray-500">Gastos</span>
                </div>
                <p className="text-base font-semibold text-red-500">$3,260</p>
              </div>
            </div>

            {/* Category bar */}
            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs font-medium text-gray-800 mb-3">Gastos por categoría</p>
              <div className="flex h-2.5 rounded-full overflow-hidden mb-3">
                {categories.map(({ pct, bar, label }) => (
                  <div key={label} className={bar} style={{ width: `${pct}%` }} />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {categories.map(({ label, bar }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${bar}`} />
                    <span className="text-xs text-gray-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent transactions */}
            <div>
              <p className="text-xs font-medium text-gray-800 mb-2">Últimos movimientos</p>
              <div className="space-y-2">
                {transactions.map(({ Icon, label, amount, color, bg }) => (
                  <div key={label} className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
                        <Icon size={16} weight="fill" className={color} />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{label}</span>
                    </div>
                    <span className="text-xs font-semibold text-red-500">${Math.abs(amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
const features = [
  {
    Icon: Sparkle,
    title: 'Análisis con IA',
    desc: 'Obtén insights automáticos sobre tus patrones de gasto y recomendaciones personalizadas.',
    color: 'text-violet-600',
    bg: 'bg-purple-100',
    border: 'border-purple-200',
  },
  {
    Icon: ChartPie,
    title: 'Visualizaciones claras',
    desc: 'Gráficos intuitivos que te muestran exactamente a dónde va tu dinero cada mes.',
    color: 'text-blue-500',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
  },
  {
    Icon: Shield,
    title: '100% privado y seguro',
    desc: 'Tus datos financieros están encriptados y nunca se comparten con terceros.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100',
    border: 'border-emerald-200',
  },
  {
    Icon: Lightning,
    title: 'Registro en segundos',
    desc: 'Añade gastos rápidamente con nuestra interfaz simple y fluida.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-100',
    border: 'border-yellow-200',
  },
  {
    Icon: Bell,
    title: 'Alertas inteligentes',
    desc: 'Recibe notificaciones cuando te acerques a tus límites de presupuesto.',
    color: 'text-orange-500',
    bg: 'bg-orange-100',
    border: 'border-orange-200',
  },
  {
    Icon: Target,
    title: 'Metas de ahorro',
    desc: 'Define objetivos financieros y haz seguimiento de tu progreso fácilmente.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-100',
    border: 'border-indigo-200',
  },
]

const heroBenefits = [
  'Gratis para siempre en lo esencial',
  'Análisis con IA incluido desde el día uno',
  'Tus datos son privados y seguros',
]

// ─── Componente principal ─────────────────────────────────────────────────────
export default function LandingPageNew({ onGetStarted, onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 text-gray-900 overflow-x-hidden">

      {/* Blobs de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/60 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-violet-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-100/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      {/* ── Navbar ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <BudgetLogo size={32} />
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Saldo
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-purple-100"
          >
            Iniciar sesión
          </button>
          <button
            onClick={onGetStarted}
            className="text-sm font-semibold px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-md hover:shadow-lg"
          >
            Comenzar gratis
          </button>
        </div>
      </nav>

      {/* ── Hero — 2 columnas ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-5rem)]">

          {/* Columna izquierda */}
          <div className="flex flex-col justify-center order-2 lg:order-1">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 border border-purple-200 text-sm text-purple-700 font-medium w-fit mb-6">
              <span>📊</span>
              <span>App gratuita de finanzas personales con IA</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Deja de llegar a fin de mes{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                sin saber qué pasó.
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
              Registra tus gastos, visualiza patrones reales y recibe análisis con IA — gratis, en segundos.
            </p>

            {/* Beneficios */}
            <ul className="flex flex-col sm:flex-row gap-3 sm:gap-6 mb-10" role="list">
              {heroBenefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle size={16} weight="fill" className="text-emerald-500 shrink-0" aria-hidden="true" />
                  {benefit}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="group flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg shadow-md hover:shadow-lg transition-all"
                aria-label="Crear cuenta gratis y comenzar"
              >
                Comenzar gratis
                <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </button>
              <button
                onClick={onLogin}
                className="px-8 py-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 font-semibold text-lg text-violet-600 shadow-md hover:shadow-lg transition-all"
                aria-label="Iniciar sesión en tu cuenta"
              >
                Ya tengo cuenta
              </button>
            </div>
          </div>

          {/* Columna derecha — Mockup */}
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
            <AppMockup />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative z-10 py-20 bg-white/60 backdrop-blur-sm" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold mb-4">
              Todo en un mismo lugar,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                sin complicaciones
              </span>
            </h2>
            <p className="text-gray-600 text-lg">
              Las herramientas que necesitas para tomar el control de tus finanzas personales.
            </p>
          </div>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
            {features.map(({ Icon, title, desc, color, bg, border }) => (
              <li
                key={title}
                className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl ${bg} border ${border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
                  <Icon size={24} weight="duotone" className={color} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="relative z-10 px-6 py-24 max-w-2xl mx-auto text-center">
        <div className="backdrop-blur-md bg-white/80 border border-purple-200 rounded-3xl p-10 shadow-2xl shadow-purple-200/50">
          <ShootingStar size={50} weight="duotone" className="text-violet-600 rotate-[75deg] inline-block mb-4" aria-hidden="true" />
          <h2 className="text-3xl font-bold mb-3">Empieza hoy, es gratis</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Crea tu cuenta en segundos. Sin compromisos, sin tarjeta de crédito.
            Tus datos son solo tuyos, siempre.
          </p>
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg shadow-md hover:shadow-lg transition-all"
            aria-label="Crear cuenta gratis"
          >
            Crear cuenta gratis
            <ArrowRight size={20} weight="bold" className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </button>
          <p className="mt-5 text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <button onClick={onLogin} className="text-violet-600 hover:text-violet-700 underline transition-colors">
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-purple-200 py-10 px-6 text-center text-sm text-gray-500">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <BudgetLogo size={22} />
            <span className="font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Saldo
            </span>
          </div>
          <span className="text-gray-400 text-xs">Gestión Inteligente de Finanzas Personales</span>
          <p className="text-xs text-gray-400 italic max-w-sm leading-relaxed">
            &ldquo;La construí porque yo también quería entender a dónde iba mi plata cada mes.&rdquo;
          </p>
          <a
            href="https://www.risso-patron.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors"
          >
            Luis Risso Patrón
          </a>
        </div>
      </footer>
    </div>
  )
}
