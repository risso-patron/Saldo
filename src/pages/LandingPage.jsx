import {
  Brain,
  ChartBar,
  Target,
  CurrencyDollar,
  Trophy,
  Export,
  ArrowRight,
  CheckCircle,
  TrendUp,
  ShootingStar,
  Coffee,
} from '@phosphor-icons/react'
import BudgetLogo from '../components/Shared/BudgetLogo'

// ─── Datos de features ────────────────────────────────────────────────────────
const features = [
  {
    icon: Brain,
    title: 'Tu asesor financiero con IA',
    desc: 'Recibe un diagnóstico honesto de tu situación cada vez que lo necesites. Te dice qué está bien, qué mejorar y qué viene si sigues igual.',
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    color: 'text-purple-500',
  },
  {
    icon: ChartBar,
    title: 'Ve exactamente a dónde va tu dinero',
    desc: 'Gráficos claros que muestran tus patrones reales de gasto. Sin tablas aburridas — en segundos entiendes el mes completo.',
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    color: 'text-blue-500',
  },
  {
    icon: Target,
    title: 'Ponle fecha a tus sueños',
    desc: 'Crea una meta, define cuándo quieres lograrlo y la app te dice si vas bien o necesitas ajustar. Celebra cuando llegues.',
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    color: 'text-green-500',
  },
  {
    icon: CurrencyDollar,
    title: 'Tu moneda, sin conversiones manuales',
    desc: 'Trabaja en dólares, bolívares, colones o cualquiera de las 150+ monedas disponibles. La app convierte por ti.',
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    color: 'text-yellow-500',
  },
  {
    icon: Trophy,
    title: 'Ahorrar se vuelve adictivo',
    desc: 'Desbloquea logros, mantén rachas diarias y sube de nivel. Pequeños hábitos financieros que se sienten como un juego.',
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    color: 'text-orange-500',
  },
  {
    icon: Export,
    title: 'Tus reportes listos al instante',
    desc: 'Exporta tu mes en PDF o comparte los datos con tu contador en CSV. Sin copiar y pegar, sin hojas de cálculo manuales.',
    gradient: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    color: 'text-indigo-500',
  },
]

// ─── Beneficios del hero ──────────────────────────────────────────────────────
const heroBenefits = [
  'Gratis para siempre en lo esencial, sin tarjeta',
  'Análisis con IA incluido desde el día uno',
  'Tus datos son tuyos — privados y seguros',
]

// ─── Componente principal ─────────────────────────────────────────────────────
export default function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-100 to-fuchsia-50 text-gray-900 overflow-x-hidden">

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
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Budget Calculator
          </span>
          <button
            onClick={onLogin}
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-purple-100"
          >
            Iniciar sesión
          </button>
          <button
            onClick={onGetStarted}
            className="text-sm font-semibold px-5 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 text-white transition-all shadow-md hover:shadow-lg"
          >
            Comenzar gratis
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 text-center px-6 pt-16 pb-24 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 border border-purple-300 text-sm text-purple-700 mb-8">
          <TrendUp size={16} weight="bold" aria-hidden="true" />
          <span>Para los que ya se cansaron de no saber a dónde va la plata</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Tu dinero, finalmente{' '}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            en orden.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Deja de adivinar en qué se va el dinero. Registra, visualiza y recibe
          análisis con IA — todo gratis, en segundos.
        </p>

        {/* Beneficios rápidos */}
        <ul className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10" role="list">
          {heroBenefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle size={16} weight="fill" className="text-green-600 shrink-0" aria-hidden="true" />
              {benefit}
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold text-lg shadow-md hover:shadow-lg transition-all"
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
            className="px-8 py-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 font-semibold text-lg text-violet-600 shadow-md hover:shadow-lg transition-all"
            aria-label="Iniciar sesión en tu cuenta"
          >
            Ya tengo cuenta
          </button>
        </div>
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
            Todo en un mismo lugar,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              sin complicaciones
            </span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Diseñado para que entiendas tu dinero en minutos, no en horas.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" role="list">
          {features.map(({ icon: Icon, title, desc, bg, border, color }) => (
            <li
              key={title}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div
                className={`w-14 h-14 rounded-2xl ${bg} ${border} border flex items-center justify-center mb-4`}
                aria-hidden="true"
              >
                <Icon size={28} weight="light" className={color} />
              </div>
              <h3 className="text-base font-semibold mb-2 text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── CTA final ── */}
      <section className="relative z-10 px-6 pb-24 max-w-2xl mx-auto text-center">
          <div className="backdrop-blur-md bg-white/80 border border-purple-200 rounded-3xl p-10 shadow-2xl shadow-purple-200/50">
          <span className="icon-thin inline-block mx-auto mb-4">
            <ShootingStar size={50} weight="duotone" className="text-violet-600 rotate-[75deg]" aria-hidden="true" />
          </span>
          <h2 className="text-3xl font-bold mb-3">
            Empieza hoy, es gratis
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Crea tu cuenta en segundos. Sin compromisos, sin tarjeta de crédito.
            Tus datos son solo tuyos, siempre.
          </p>
          <button
            onClick={onGetStarted}
            className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold text-lg shadow-md hover:shadow-lg transition-all"
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
              className="text-blue-600 hover:text-blue-700 underline transition-colors"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-purple-200 mt-12 py-12 px-6 text-center text-sm text-gray-500">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <BudgetLogo size={24} />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Budget Calculator
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-3 md:gap-8 text-gray-500 font-medium">
            <span className="flex items-center gap-2">
              Gestión Inteligente de Finanzas Personales
            </span>
            <span className="hidden md:inline-block w-1.5 h-1.5 rounded-full bg-gray-300"></span>
            <span className="flex items-center gap-1.5">
              Hecho con <Coffee size={16} weight="fill" className="text-amber-400" /> por 
              <a 
                href="https://www.risso-patron.com" 
                target="_blank" 
                rel="noreferrer" 
                className="font-bold text-purple-600 hover:text-purple-700 transition-colors uppercase tracking-tight"
              >
                Luis Risso Patrón
              </a>
            </span>
          </div>

          <p className="text-xs text-gray-400 italic max-w-sm text-center leading-relaxed">
            &ldquo;La construí porque yo también quería entender a dónde iba mi plata cada mes.&rdquo;
          </p>
        </div>
      </footer>
    </div>
  )
}
