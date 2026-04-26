import { useState, useRef, type MouseEvent } from 'react';
import { Info } from 'lucide-react';

export function AboutPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="relative w-full max-w-2xl bg-slate-900 rounded-2xl p-1 overflow-hidden shadow-2xl transition-transform hover:scale-[1.02] duration-300 cursor-crosshair"
      >
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 hover:opacity-100"
          style={{ background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(56, 189, 248, 0.15), transparent 40%)` }}
        />
        
        <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-xl p-10 h-full border border-slate-700/50 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-linear-to-tr from-sky-500 to-indigo-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-sky-500/30">
            <Info className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">El Código es Poesía</h2>
          <p className="text-slate-400 leading-relaxed mb-8 max-w-lg">
            La arquitectura de software moderna requiere herramientas poderosas. 
            Al usar <span className="text-sky-400 font-semibold">TypeScript</span> evitamos errores humanos, con <span className="text-indigo-400 font-semibold">Zod</span> validamos la realidad, y con <span className="text-teal-400 font-semibold">Zustand</span> orquestamos los datos con elegancia.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-full border border-slate-700">TypeScript Estricto</span>
            <span className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-full border border-slate-700">Zod (Schemas)</span>
            <span className="px-4 py-2 bg-slate-800 text-slate-300 text-sm rounded-full border border-slate-700">Zustand (Store)</span>
          </div>
        </div>
      </div>
    </div>
  );
}