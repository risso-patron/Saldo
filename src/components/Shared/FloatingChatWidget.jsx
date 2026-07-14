import { useState, useEffect, useRef } from 'react';
import { X, Robot, PaperPlaneRight, User, Sparkle, ArrowClockwise } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPercentageSafe } from '../../utils/formatters';

const WELCOME_MSG = {
  id: 'welcome_1',
  sender: 'bot',
  text: '¡Hola! Soy tu Asistente Financiero 🤖\n\nPuedo ayudarte a entender tus gastos, identificar patrones de ahorro y responderte preguntas sobre tus finanzas. ¿En qué te ayudo hoy?',
};

const QUICK_ACTIONS = [
  '¿Cómo está mi balance?',
  '¿Dónde gasto más?',
  '¿Cómo puedo ahorrar más?',
];

const getBotReply = (text, context) => {
  const t = text.toLowerCase();
  if (t.includes('balance') || t.includes('saldo')) {
    const b = context?.balance ?? 0;
    return b >= 0
      ? `Tu balance actual es positivo: **${new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' }).format(b)}** 🟢  ¡Vas por buen camino!`
      : `Tu balance actual es **negativo** 🔴: ${new Intl.NumberFormat('es', { style: 'currency', currency: 'USD' }).format(b)}. Considera reducir gastos variables este mes.`;
  }
  if (t.includes('gasto') || t.includes('categoría') || t.includes('mas')) {
    return `Para ver en qué categorías gastas más, ve a la sección **Análisis** 📊. Allí encontrarás el desgrama por categoría con tu distribución exacta.`;
  }
  if (t.includes('ahorr')) {
    const rate = context?.savingsRate ?? 0;
    return `Tu tasa de ahorro actual es del **${formatPercentageSafe(rate)}**. Para mejorarla, una buena regla es aplicar el método **50/30/20**: 50% necesidades, 30% gustos, 20% ahorro.`;
  }
  if (t.includes('hola') || t.includes('hola') || t.includes('buenos') || t.includes('buenas')) {
    return '¡Hola! 😊 Estoy aquí para ayudarte. Puedes preguntarme sobre tu balance, tus categorías de gasto, consejos de ahorro o cualquier cosa relacionada con tus finanzas.';
  }
  return '¡Buena pregunta! Para darte una respuesta más precisa, te recomiendo revisar la sección **Análisis** donde tienes todos los datos visualizados. También puedo responder preguntas específicas sobre tu balance o categorías de gasto. 💡';
};

export const FloatingChatWidget = ({ isOpen, onClose, context }) => {
  const getInitialTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const [messages, setMessages] = useState([{ ...WELCOME_MSG, time: getInitialTime() }]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = (text) => {
    if (!text?.trim()) return;
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    setTimeout(() => {
      const reply = getBotReply(text, context);
      setMessages(prev => [...prev, {
        id: Date.now() + 'bot',
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 600);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    sendMessage(inputText);
  };

  const handleReset = () => {
    setMessages([{ ...WELCOME_MSG, time: getInitialTime() }]);
    setInputText('');
    setIsTyping(false);
  };

  /* Renderiza el texto con **negritas** */
  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className={i > 0 ? 'mt-1' : ''}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-48 lg:bottom-28 right-4 lg:right-8 z-[149] w-[calc(100vw-2rem)] max-w-sm flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-white/10 overflow-hidden"
          style={{ height: 'min(500px, calc(100dvh - 220px))' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center relative">
                <Robot size={20} weight="fill" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full" />
              </div>
              <div>
                <h3 className="font-black text-sm leading-tight">Asistente IA</h3>
                <p className="text-white/70 text-[10px] font-medium flex items-center gap-1">
                  <Sparkle size={9} weight="fill" /> En línea · Saldo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleReset} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors" title="Nueva conversación">
                <ArrowClockwise size={15} weight="bold" />
              </button>
              <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/20 transition-colors">
                <X size={16} weight="bold" />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[88%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.sender === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-500' : 'bg-indigo-600 text-white'
                  }`}>
                    {msg.sender === 'user' ? <User size={13} weight="bold" /> : <Robot size={13} weight="fill" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-snug ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm'
                    }`}>
                      {renderText(msg.text)}
                    </div>
                    <span className={`text-[9px] text-slate-400 px-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>{msg.time}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Indicador de escritura */}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <Robot size={13} weight="fill" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-3.5 py-2.5 flex gap-1 shadow-sm">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Acciones rápidas — solo si es el primer mensaje */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex gap-1.5 overflow-x-auto border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  onClick={() => sendMessage(action)}
                  className="whitespace-nowrap px-3 py-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl transition-colors border border-indigo-100 dark:border-indigo-800/50"
                >
                  {action}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 pb-3 pt-2 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <form onSubmit={handleSubmit} className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:focus-within:ring-indigo-900/30 transition-all">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
                }}
                placeholder="Pregúntame sobre tus finanzas..."
                className="flex-1 bg-transparent max-h-24 min-h-[36px] resize-none px-2 py-1.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none"
                rows={1}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 transition-colors shrink-0"
              >
                <PaperPlaneRight size={16} weight="fill" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
