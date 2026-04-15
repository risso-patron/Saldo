import { useState, useRef } from 'react';
import { Camera, Image, X, MagicWand, Check, ArrowsCounterClockwise } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVisionScanner } from '../../hooks/useVisionScanner';

/**
 * ReceiptScanner - Componente de Cámara e IA para Escaneo de Recibos
 */
export const ReceiptScanner = ({ onResult, onCancel }) => {
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { scanImage, isProcessing, progress } = useVisionScanner();

  // Iniciar Cámara
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      alert('No se pudo acceder a la cámara. Prueba subiendo una foto.');
    }
  };

  // Capturar Foto
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setStream(null);
  };

  // Subir Archivo
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCapturedImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Procesar con IA
  const handleProcess = async () => {
    if (!capturedImage) return;
    try {
      const result = await scanImage(capturedImage);
      onResult(result);
    } catch {
      alert('Error al procesar la imagen con IA. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl">
      
      {/* Botón Cerrar */}
      <button onClick={onCancel} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full backdrop-blur-md border border-white/20">
        <X size={20} weight="bold" />
      </button>

      {/* ÁREA DE VISIÓN */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {!capturedImage ? (
            <motion.div 
              key="camera"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full h-full relative"
            >
              {stream ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  {/* Marco de Escaneo */}
                  <div className="absolute inset-x-10 inset-y-20 border-2 border-primary-500/50 rounded-3xl border-dashed pointer-events-none">
                    <div className="absolute inset-0 bg-primary-500/5 animate-pulse" />
                  </div>
                  <div className="absolute bottom-10 inset-x-0 flex justify-center">
                    <button onClick={capturePhoto} className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 bg-white/20 backdrop-blur-sm">
                      <div className="w-full h-full rounded-full bg-white shadow-xl" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-6 p-8 text-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center border border-white/5 shadow-inner mb-4">
                    <Camera size={40} weight="duotone" className="text-primary-400" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Preparar Escáner IA</h3>
                  <div className="w-full space-y-3">
                    <button onClick={startCamera} className="w-full py-4 rounded-2xl bg-primary-600 text-white font-black uppercase tracking-widest text-xs shadow-lg">Abrir Cámara</button>
                    <label className="w-full py-4 rounded-2xl bg-slate-800 text-slate-300 font-black uppercase tracking-widest text-xs border border-white/5 flex items-center justify-center gap-2 cursor-pointer">
                      <Image size={18} /> Subir Foto Recibo
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full h-full relative"
            >
              <img src={capturedImage} className="w-full h-full object-contain" alt="Escaneado" />
              
              {/* Efecto de Escaneo Láser */}
              {isProcessing && (
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)] z-10"
                />
              )}

              {/* Botones de Acción sobre la Foto */}
              <div className="absolute bottom-10 inset-x-0 flex justify-center gap-4 px-6">
                {!isProcessing ? (
                  <>
                    <button onClick={() => setCapturedImage(null)} className="flex-1 py-4 rounded-2xl bg-slate-800 text-white font-black uppercase tracking-widest text-xs border border-white/10 flex items-center justify-center gap-2">
                       <ArrowsCounterClockwise size={18} /> Repetir
                    </button>
                    <button onClick={handleProcess} className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2">
                       <MagicWand size={18} weight="fill" /> Extraer con IA
                    </button>
                  </>
                ) : (
                  <div className="w-full bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black text-white uppercase tracking-widest">IA Analizando...</span>
                      <span className="text-xs font-black text-cyan-400">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
