import { Fingerprint, Shield, Download } from 'lucide-react';
import { useRef } from 'react';
import { useAppStore } from '../store/store';
import type { DocumentoData } from '../types/types';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import escudo from '../assets/escudo-nacional.svg';

const BARCODE_WIDTHS = Array.from({ length: 40 }, (_, i) => ((i * 7) % 5) + 1);

const generarCURPLocal = (data: Partial<DocumentoData>): string => {
  if (!data.nombres || !data.apellidoPaterno || !data.apellidoMaterno) return "__________________";
  const vocal = data.apellidoPaterno.match(/[AEIOU]/i)?.[0] || 'X';
  const aP = (data.apellidoPaterno[0] || 'X') + vocal;
  const aM = data.apellidoMaterno[0] || 'X';
  const n = data.nombres[0] || 'X';
  const fecha = data.fechaNacimiento ? data.fechaNacimiento.replace(/-/g, '').substring(2) : 'XXXXXX';
  const sx = data.sexo || 'X';
  const est = data.estado ? data.estado.substring(0,2) : 'XX';
  // primeras consonantes del apellido paterno y materno que no son la primera letra
  const cons = (str: string) => {
    const match = str.substring(1).match(/[^AEIOU]/i);
    return match ? match[0] : 'X';
  };
  const c1 = cons(data.apellidoPaterno || '');
  const c2 = cons(data.apellidoMaterno || '');
  const cn = cons(data.nombres || '');
  return `${aP}${aM}${n}${fecha}${sx}${est}${c1}${c2}${cn}X1`.toUpperCase();
};

export function DocumentoCURP() {
  const { formData } = useAppStore();
  const documentRef = useRef<HTMLDivElement>(null);
  const curp = generarCURPLocal(formData);

  const descargarPDF = async () => {
    if (!documentRef.current) return;

    try {
      const element = documentRef.current;
      
      const captureWidth = 1024;
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2, // Mayor calidad
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
      
      // Márgenes más generosos
      const marginSides = 15; // 15mm en cada lado
      const marginTop = 15;
      const marginBottom = 15;
      
      const maxWidth = pageWidth - (marginSides * 2);
      const maxHeight = pageHeight - marginTop - marginBottom;
      
      // Calcular proporciones manteniendo aspecto
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
      pdf.save(`CURP_${formData.nombres}_${formData.apellidoPaterno}.pdf`);
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
      <div ref={documentRef} className="max-w-3xl mx-auto bg-white p-0 rounded-xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-[#115E59] text-white p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Shield className="w-10 h-10" />
          <div>
            <h2 className="text-sm font-semibold tracking-widest text-emerald-100">GOBIERNO DE MÉXICO</h2>
            <h1 className="text-lg font-bold">Clave Única de Registro de Población</h1>
          </div>
        </div>
        <img src={escudo} alt="Escudo" className="w-16 h-16" />
      </div>

      <div className="p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-emerald-50/30">
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="bg-slate-100 p-4 rounded-lg shadow-inner">
            <Fingerprint className="w-32 h-32 text-slate-400" />
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">CURP Generada</p>
              <p className="text-3xl font-mono font-bold text-slate-800 tracking-widest bg-slate-100 px-4 py-2 inline-block rounded border border-slate-200 mt-1">{curp}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</p>
                <p className="font-semibold text-slate-800">{formData.nombres} {formData.apellidoPaterno} {formData.apellidoMaterno}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Entidad de Registro</p>
                <p className="font-semibold text-slate-800">{formData.estado}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center">
          <div className="flex gap-1 items-end h-16 w-full max-w-md justify-center">
             {BARCODE_WIDTHS.map((width, i) => (
                <div key={i} className="bg-slate-800 h-full" style={{ width: `${width}px` }}></div>
             ))}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}