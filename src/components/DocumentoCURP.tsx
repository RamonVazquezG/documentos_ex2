import { Fingerprint, Shield } from 'lucide-react';
import { useAppStore } from '../store/store';
import type { DocumentoData } from '../types/types';

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
  return `${aP}${aM}${n}${fecha}${sx}${est}XXX1`.toUpperCase();
};

export function DocumentoCURP() {
  const { formData } = useAppStore();
  const curp = generarCURPLocal(formData);

  return (
    <div className="max-w-3xl mx-auto bg-white p-0 rounded-xl shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-[#115E59] text-white p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Shield className="w-10 h-10" />
          <div>
            <h2 className="text-sm font-semibold tracking-widest text-emerald-100">GOBIERNO DE MÉXICO</h2>
            <h1 className="text-lg font-bold">Clave Única de Registro de Población</h1>
          </div>
        </div>
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/22/Escudo_Nacional_de_M%C3%A9xico.svg" alt="Escudo" className="w-12 h-12 opacity-80 brightness-0 invert" />
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
  );
}