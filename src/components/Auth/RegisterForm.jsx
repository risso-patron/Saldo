import { useState } from 'react'
import { Eye, EyeSlash, CheckCircle } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/AuthContext'
import { Alert } from '../Shared/Alert'
import BudgetLogo from '../Shared/BudgetLogo'

export const RegisterForm = ({ onToggleForm }) => {
  const { signUp, signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const validateForm = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor completa todos los campos')
      return false
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Por favor ingresa un email válido')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!validateForm()) return

    setLoading(true)

    const result = await signUp({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName
    })

    console.log('Resultado del registro:', result)

    if (result.error) {
      console.error('Error de registro:', result.error)
      setError(result.error)
      setLoading(false)
    } else {
      console.log('Registro exitoso:', result.data)
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-100 to-fuchsia-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} weight="fill" className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ¡Cuenta creada con éxito!
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Revisa tu email para confirmar tu cuenta y luego inicia sesión.
          </p>
          <button
            onClick={() => onToggleForm('login')}
            className="w-full bg-violet-500 hover:bg-violet-600 text-white py-2.5 rounded-xl font-semibold transition text-sm"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-100 to-fuchsia-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-3xl flex overflow-hidden">

        {/* ── Panel izquierdo (solo desktop) ── */}
        <div className="hidden md:flex flex-col justify-between w-5/12 bg-gradient-to-br from-violet-500 to-purple-600 p-8 text-white">
          <div className="flex flex-col items-center gap-3">
            <BudgetLogo size={100} />
            <span className="font-extrabold text-xl bg-gradient-to-r from-blue-300 via-purple-200 to-pink-300 bg-clip-text text-transparent tracking-tight">Budget Calculator</span>
          </div>

          <div>
            <h2 className="text-xl font-bold leading-snug mb-4">
              Empieza hoy,<br />es completamente<br />gratis.
            </h2>
            <ul className="space-y-2.5">
              {[
                'Sin tarjeta de crédito requerida',
                'Listo en menos de 2 minutos',
                'Tus datos, siempre privados',
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
          <div className="mb-5">
            {/* Logo solo visible en mobile */}
            <div className="flex items-center gap-2 mb-4 md:hidden">
              <BudgetLogo size={28} />
              <span className="text-base font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                Budget Calculator
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Crea tu cuenta</h1>
            <p className="text-sm text-gray-500 mt-1">Comienza a tomar control de tus finanzas</p>
          </div>

          {error && (
            <Alert type="error" message={error} className="mb-4" />
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
            <span className="mx-3 text-xs text-gray-400">o regístrate con email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
                placeholder="Tu nombre"
                required
              />
            </div>

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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
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
              <p className="text-xs text-gray-400 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition focus:outline-none"
                  aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showConfirmPassword
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
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              ¿Ya tienes una cuenta?{' '}
              <button
                onClick={() => onToggleForm('login')}
                className="text-violet-600 hover:text-violet-700 font-semibold"
              >
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
