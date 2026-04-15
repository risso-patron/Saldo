import { useState, useRef, useEffect, useMemo } from 'react'
import { callAI } from '../../lib/ai-providers'
import { motion, AnimatePresence } from 'framer-motion'

const QUICK_QUESTIONS = [
  '¿En qué categoría gasté más este mes?',
  '¿Cómo va mi balance este mes?',
  '¿Cuál es mi gasto promedio diario?',
  '¿Tengo algún gasto inusual?',
  'Dame un resumen de mis finanzas',
  '¿En qué puedo ahorrar más?',
]

/**
 * AIChat — Chat conversacional con IA sobre tus finanzas
 * Inspirado en MonAi: "Pregúntale a tus finanzas cualquier cosa"
 */
export function AIChat({ transactions, totalIncome, totalExpenses, balance }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: '¡Hola! Soy tu asistente financiero. Puedes preguntarme cualquier cosa sobre tus finanzas. ¿En qué te ayudo?',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  // Contexto financiero comprimido para el prompt
  const financialContext = useMemo(() => {
    const now = new Date()
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const thisMonth = transactions.filter(t => t.date?.startsWith(yearMonth))
    const incomeThisMonth = thisMonth.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expensesThisMonth = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    // Gastos por categoría este mes
    const byCategory = {}
    thisMonth.filter(t => t.type === 'expense').forEach(t => {
      byCategory[t.category || 'Otros'] = (byCategory[t.category || 'Otros'] || 0) + t.amount
    })

    const catSummary = Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
      .join(', ')

    const recentTx = transactions
      .slice(-10)
      .map(t => `${t.type === 'income' ? '+' : '-'}$${t.amount} ${t.description || ''} (${t.date || ''})`)
      .join('\n')

    return `DATOS FINANCIEROS DEL USUARIO:
Ingresos totales: $${totalIncome.toFixed(2)}
Gastos totales: $${totalExpenses.toFixed(2)}
Balance actual: $${balance.toFixed(2)}
Ingresos este mes: $${incomeThisMonth.toFixed(2)}
Gastos este mes: $${expensesThisMonth.toFixed(2)}
Gastos por categoría este mes: ${catSummary || 'Sin gastos'}
Últimas 10 transacciones:
${recentTx || 'Sin transacciones'}
Total de transacciones registradas: ${transactions.length}`
  }, [transactions, totalIncome, totalExpenses, balance])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const sendMessage = async (text) => {
    const question = (text || input).trim()
    if (!question || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const prompt = `${financialContext}

Eres un asistente financiero personal amigable y directo. Responde en español, de forma concisa (máximo 3-4 líneas). No uses markdown complejo. Usa emojis de forma moderada para hacer la respuesta más legible.

PREGUNTA DEL USUARIO: ${question}`

      const result = await callAI(prompt, 500, false)
      setMessages(prev => [...prev, { role: 'ai', content: result.content }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: '⚠️ No pude conectarme con la IA en este momento. Verifica tu conexión e inténtalo de nuevo.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header — clicable para colapsar */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            🤖 Chat con IA Financiera
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Pregúntale cualquier cosa sobre tus finanzas
          </p>
        </div>
        <span className="text-gray-400 text-lg">{isOpen ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Preguntas rápidas */}
            <div className="px-6 pb-3 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 
                    dark:hover:bg-indigo-800/40 text-indigo-700 dark:text-indigo-300 rounded-full 
                    transition-colors disabled:opacity-40"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Mensajes */}
            <div className="mx-6 mb-3 h-72 overflow-y-auto flex flex-col gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-indigo-500 text-white rounded-br-sm'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                    <span className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="w-2 h-2 bg-gray-400 rounded-full block"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-6 pb-6 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendMessage() }}
                disabled={loading}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-600 rounded-xl 
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 
                  text-white rounded-xl font-medium text-sm transition-colors flex items-center gap-1.5"
              >
                <span>Enviar</span>
                <span>→</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
