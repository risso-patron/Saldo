import { useState } from 'react'
import { LoginForm } from '../components/Auth/LoginForm'
import { RegisterForm } from '../components/Auth/RegisterForm'
import { ForgotPasswordForm } from '../components/Auth/ForgotPasswordForm'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login', 'register', 'forgot'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Header with glass effect */}
        <div className="text-center mb-8 backdrop-blur-sm bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Budget Calculator
          </h1>
          <p className="text-gray-300">
            {mode === 'login' && 'Gestiona tus finanzas inteligentemente'}
            {mode === 'register' && 'Comienza tu viaje financiero'}
            {mode === 'forgot' && 'Recupera tu contraseña'}
          </p>
        </div>

        {/* Forms with glass morphism */}
        <div className="backdrop-blur-md bg-white/10 rounded-2xl p-8 shadow-2xl border border-white/20">
          {mode === 'login' && <LoginForm onToggleForm={(m) => setMode(m === 'forgot-password' ? 'forgot' : m)} />}
          {mode === 'register' && <RegisterForm onToggleForm={setMode} />}
          {mode === 'forgot' && <ForgotPasswordForm onToggleForm={setMode} />}
        </div>

        {/* Toggle modes */}
        <div className="mt-6 text-center space-y-3 backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10">
          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('register')}
                className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
              >
                ¿No tienes cuenta? <span className="underline">Regístrate gratis</span>
              </button>
              <br />
              <button
                onClick={() => setMode('forgot')}
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </>
          )}

          {mode === 'register' && (
            <button
              onClick={() => setMode('login')}
              className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
            >
              ¿Ya tienes cuenta? <span className="underline">Inicia sesión</span>
            </button>
          )}

          {mode === 'forgot' && (
            <button
              onClick={() => setMode('login')}
              className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
            >
              ← Volver al inicio de sesión
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            © 2025 Budget Calculator | Desarrollado por{' '}
            <a 
              href="https://www.linkedin.com/in/jorge-luis-risso-/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              R P
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
