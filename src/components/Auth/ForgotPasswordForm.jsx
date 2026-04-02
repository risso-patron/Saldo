import { useState } from 'react'
import { EnvelopeSimple, CheckCircle, ArrowLeft } from '@phosphor-icons/react'
import { useAuth } from '../../contexts/AuthContext'
import { Alert } from '../Shared/Alert'
import BudgetLogo from '../Shared/BudgetLogo'

export const ForgotPasswordForm = ({ onToggleForm }) => {
  const { resetPassword } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email) {
      setError('Por favor ingresa tu email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido')
      return
    }

    setLoading(true)

    const { error } = await resetPassword(email)

    if (error) {
      setError(error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-100 to-fuchsia-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8 text-center">
          <div className="w-14 h-14 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EnvelopeSimple size={28} weight="light" className="text-violet-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Revisa tu email</h2>
          <p className="text-sm text-gray-500 mb-1">
            Te enviamos un enlace a:
          </p>
          <p className="text-sm font-semibold text-gray-800 mb-6">{email}</p>
          <button
            onClick={() => onToggleForm('login')}
            className="w-full bg-violet-500 hover:bg-violet-600 text-white py-2.5 rounded-xl font-semibold transition text-sm"
          >
            Volver a Iniciar Sesión
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
              Recupera tu<br />acceso en<br />segundos.
            </h2>
            <ul className="space-y-2.5">
              {[
                'Te enviamos el enlace al instante',
                'Sin preguntas complicadas',
                'Tus datos siempre seguros',
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
                Budget Calculator
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Recuperar contraseña</h1>
            <p className="text-sm text-gray-500 mt-1">
              Ingresa tu email y te enviamos un enlace para restablecerla.
            </p>
          </div>

          {error && (
            <Alert type="error" message={error} className="mb-4" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-sm"
                placeholder="tu@email.com"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-500 hover:bg-violet-600 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <button
              onClick={() => onToggleForm('login')}
              className="inline-flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-semibold"
            >
              <ArrowLeft size={14} weight="bold" />
              Volver a Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
