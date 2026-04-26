import { useState } from 'react';
import { FileText, User, Info, Shield, Barcode } from 'lucide-react';
import { AboutPage } from './components/AboutPage';
import { DocumentoActa } from './components/DocumentoActa';
import { DocumentoCURP } from './components/DocumentoCURP';
import { Formulario } from './components/Formulario';
import { useAppStore } from './store/store';

export default function App() {
  const { isFormValid } = useAppStore();
  const [activeTab, setActiveTab] = useState<'formulario' | 'acta' | 'curp' | 'about'>('formulario');

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center h-auto md:h-16 py-4 md:py-0">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="w-6 h-6 text-amber-500" />
              <span className="font-semibold text-lg tracking-wide uppercase">Sistema de Expedición</span>
            </div>
            
            <div className="flex space-x-1 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('formulario')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'formulario' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <User className="w-4 h-4" /> Datos
              </button>
              <button 
                onClick={() => setActiveTab('acta')}
                disabled={!isFormValid}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : activeTab === 'acta' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <FileText className="w-4 h-4" /> Acta
              </button>
              <button 
                onClick={() => setActiveTab('curp')}
                disabled={!isFormValid}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : activeTab === 'curp' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Barcode className="w-4 h-4" /> CURP
              </button>
              <button 
                onClick={() => setActiveTab('about')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'about' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <Info className="w-4 h-4" /> About
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-10">
        {activeTab === 'formulario' && <Formulario />}
        {activeTab === 'acta' && isFormValid && <DocumentoActa />}
        {activeTab === 'curp' && isFormValid && <DocumentoCURP />}
        {activeTab === 'about' && <AboutPage />}
      </main>
      
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm border-t border-slate-800 mt-auto">
        <p>© 2026 Sistema Generador. Arquitectura Real Vite + TS + Zustand + Zod.</p>
      </footer>
    </div>
  );
}