import { Stamp, Download } from 'lucide-react';
import { useRef } from 'react';
import { useAppStore } from '../store/store';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import escudo from '../assets/escudo-nacional.svg';

export function DocumentoActa() {
  // Solo leemos el estado global. ¡Gracias Zustand!
  const { formData } = useAppStore();
  const documentRef = useRef<HTMLDivElement>(null);

  const descargarPDF = async () => {
    if (!documentRef.current) return;

    try {
      const element = documentRef.current;

      const captureWidth = 1024;
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        width: captureWidth,
        style: {
          width: `${captureWidth}px`,
          maxWidth: 'none',
          margin: '0',
          transform: 'scale(1)',
        }
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const marginSides = 15; // 15mm en cada lado
      const marginTop = 15;
      const marginBottom = 15;
      
      const maxWidth = pageWidth - (marginSides * 2);
      const maxHeight = pageHeight - marginTop - marginBottom;
      
      const imgRatio = img.width / img.height;
      let finalWidth = maxWidth;
      let finalHeight = finalWidth / imgRatio;
      
      // Si la altura es mayor que el máximo, redimensionar
      if (finalHeight > maxHeight) {
        finalHeight = maxHeight;
        finalWidth = finalHeight * imgRatio;
      }
      
      // Centrar horizontalmente y posicionar en la parte superior
      const xPosition = (pageWidth - finalWidth) / 2;
      const yPosition = marginTop;
      
      pdf.addImage(dataUrl, 'PNG', xPosition, yPosition, finalWidth, finalHeight);
      pdf.save(`Acta_${formData.nombres}_${formData.apellidoPaterno}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={descargarPDF}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        <Download size={20} />
        Descargar PDF
      </button>
      <div ref={documentRef} className="max-w-4xl mx-auto bg-[#FDFBF7] p-10 rounded shadow-2xl border-12 border-[#2C3E50] relative overflow-hidden font-serif text-slate-800">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2C3E50 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      <div className="text-center mb-10 relative z-10 border-b-2 border-slate-800 pb-6">
        <img src={escudo} alt="Escudo" className="w-24 h-auto mx-auto mb-4" />
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[#2C3E50]">Estados Unidos Mexicanos</h1>
        <h2 className="text-xl tracking-wide mt-2">Registro Civil</h2>
        <h3 className="text-2xl font-bold mt-4 text-amber-800 uppercase">Acta de Nacimiento</h3>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-8 relative z-10">
        <div className="col-span-2 md:col-span-1 border-b border-slate-300 pb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Registrado</p>
          <p className="text-xl font-bold mt-1">{formData.nombres}</p>
        </div>
        <div className="col-span-2 md:col-span-1 border-b border-slate-300 pb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primer Apellido</p>
          <p className="text-xl font-bold mt-1">{formData.apellidoPaterno}</p>
        </div>
        <div className="col-span-2 md:col-span-1 border-b border-slate-300 pb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Segundo Apellido</p>
          <p className="text-xl font-bold mt-1">{formData.apellidoMaterno}</p>
        </div>
        <div className="col-span-2 md:col-span-1 border-b border-slate-300 pb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Nacimiento</p>
          <p className="text-xl font-bold mt-1">{formData.fechaNacimiento}</p>
        </div>
        <div className="border-b border-slate-300 pb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sexo</p>
          <p className="text-xl font-bold mt-1">{formData.sexo === 'H' ? 'HOMBRE' : formData.sexo === 'M' ? 'MUJER' : 'NO BINARIO'}</p>
        </div>
        <div className="border-b border-slate-300 pb-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lugar de Nacimiento</p>
          <p className="text-xl font-bold mt-1">{formData.estado}</p>
        </div>
      </div>

      <div className="mt-16 flex justify-between items-end relative z-10">
        <div className="text-center">
          <div className="w-40 border-t border-slate-800 mx-auto mt-12 pt-2">
            <p className="text-xs font-bold uppercase">Firma del Oficial</p>
          </div>
        </div>
        <div>
          <Stamp className="w-24 h-24 text-red-800 opacity-80 -rotate-12" />
        </div>
      </div>
    </div>
    </div>
  );
}