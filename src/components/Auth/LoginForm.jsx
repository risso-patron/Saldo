import { useState } from 'react'
import { Eye, EyeSlash, CheckCircle } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/AuthContext'
import { Alert } from '../Shared/Alert'
import BudgetLogo from '../Shared/BudgetLogo'

export const LoginForm = ({ onToggleForm }) => {
  const { signIn, signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.email || !formData.password) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)

    const { error } = await signIn({
      email: formData.email,
      password: formData.password
    })

    if (error) {
      setError(error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-100 to-fuchsia-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-3xl flex overflow-hidden">

        {/* ── Panel izquierdo (solo desktop) ── */}
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-gradient-to-br from-violet-500 to-purple-600 p-8 text-white">
          <div className="flex flex-col items-center gap-3">
            <BudgetLogo size={100} />
            <span className="font-extrabold text-xl bg-gradient-to-r from-blue-300 via-purple-200 to-pink-300 bg-clip-text text-transparent tracking-tight">Saldo</span>
          </div>

          <div>
            <h2 className="text-xl font-bold leading-snug mb-4">
              Tu dinero,<br />finalmente<br />en orden.
            </h2>
            <ul className="space-y-2.5">
              {[
                'Gratis para siempre en lo esencial',
                'Análisis con IA incluido',
                'Tus datos son solo tuyos',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-violet-100">
                  <CheckCircle size={14} weight="fill" className="text-white mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-violet-200 leading-relaxed">
            &ldquo;La construí porque yo también quería entender a dónde iba mi plata.&rdquo;
          </p>
        </div>

        {/* ── Panel derecho: formulario ── */}
        <div className="flex-1 p-6 sm:p-8">
          <div className="mb-6">
            {/* Logo solo visible en mobile */}
            <div className="flex items-center gap-2 mb-4 md:hidden">
              <BudgetLogo size={28} />
              <span className="text-base font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Saldo
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Bienvenido de nuevo</h1>
            <p className="text-sm text-gray-500 mt-1">Ingresa a tu cuenta para continuar</p>
          </div>

        {error && (
          <Alert type="error" message={error} className="mb-6" />
        )}

        {/* Botón Google */}
        <button
          type="button"
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-2.5 px-3 text-sm text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar con Google
        </button>

        {/* Separador */}
        <div className="relative flex items-center my-4">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-3 text-xs text-gray-400">o continúa con email</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => onToggleForm('forgot-password')}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
                placeholder="••••••••"
                required
                minLength="6"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition focus:outline-none"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword
                  ? <EyeSlash size={18} weight="light" />
                  : <Eye size={18} weight="light" />
                }
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-500 hover:bg-violet-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-xs mb-2">¿No tienes una cuenta?</p>
          <button
            onClick={() => onToggleForm('register')}
            className="text-violet-600 hover:text-violet-700 text-sm font-semibold"
          >
            Crear cuenta gratis
          </button>
        </div>
        </div>{/* fin panel derecho */}
      </div>{/* fin card */}
    </div>
  )
}
