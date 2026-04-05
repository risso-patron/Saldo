import React from 'react';
import { WarningCircle, ArrowClockwise } from '@phosphor-icons/react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Aquí podríamos mandar telémetros a Sentry/PostHog/etc. en producción.
    console.error('💥 Error Atrapado por GAFAS:', error, errorInfo);
  }

  handleReload = () => {
    // Si recargan, podríamos purgar todo? No, solo recargamos ventana primero.
    window.location.reload();
  };

  handleHardClear = () => {
    window.localStorage.clear();
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center font-sans">
          <div className="bg-slate-900 border border-red-500/50 p-6 rounded-3xl max-w-lg w-full shadow-2xl shadow-red-500/20">
            <div className="flex items-center gap-3 mb-4 text-red-500">
              <WarningCircle size={40} weight="fill" />
              <h1 className="text-xl font-black">App Crashed</h1>
            </div>
            <p className="text-gray-300 text-sm mb-4">
              Hemos detectado una ruptura en el renderizado. Aquí tienes los detalles técnicos para enviarlos al desarrollador:
            </p>
            
            <div className="bg-black/50 p-4 rounded-xl border border-red-900 overflow-auto max-h-[30vh] mb-6">
              <p className="text-red-400 font-mono text-sm leading-relaxed whitespace-pre-wrap font-bold">
                {this.state.error && this.state.error.toString()}
              </p>
              <p className="text-gray-500 font-mono text-[11px] mt-3 whitespace-pre-wrap">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={this.handleReload}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white p-3 py-4 font-bold rounded-xl transition-all shadow-md focus:ring"
              >
                <ArrowClockwise size={20} weight="bold" /> Intento Suave (Refrescar App)
              </button>

              <button 
                onClick={this.handleHardClear}
                className="w-full text-xs font-semibold text-gray-500 hover:text-red-400 transition-colors p-2"
              >
                O intento forzoso (Limpiar Memoria Completa)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
