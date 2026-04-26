import { useState, type FormEvent } from 'react';
import { CheckCircle, Shield } from 'lucide-react';
import { useAppStore } from '../store/store';
import { DocumentoSchema } from '../types/types';

export function Formulario() {
  const { formData, updateField, setFormValid } = useAppStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Zod hace el trabajo pesado de validar
    const result = DocumentoSchema.safeParse(formData);
    
    if (!result.success) {
      // Extraemos los errores de Zod y los formateamos para React
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) {
          newErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(newErrors);
      setFormValid(false);
    } else {
      setErrors({});
      // Guardamos la data validada
      setFormValid(true, result.data);
      alert("¡Datos validados por Zod y guardados en Zustand exitosamente!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-xl border border-slate-200">
      <div className="flex items-center gap-3 mb-6 border-b pb-4">
        <Shield className="text-slate-800 w-8 h-8" />
        <h2 className="text-2xl font-serif text-slate-800 font-bold">Registro de Identidad Ciudadana</h2>
      </div>
      
      <p className="text-slate-500 mb-8 text-sm">
        Sistema de validación estricta con Zod. Ingrese los datos para habilitar la generación de documentos.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 md:col-span-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre(s) *</label>
            <input 
              type="text" 
              value={formData.nombres || ''}
              onChange={(e) => updateField('nombres', e.target.value)}
              className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-slate-800 focus:outline-none uppercase ${errors.nombres ? 'border-red-500' : 'border-slate-300'}`}
              placeholder="EJ. JUAN CARLOS"
            />
            {errors.nombres && <span className="text-red-500 text-xs mt-1 font-medium">{errors.nombres}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Apellido Paterno *</label>
            <input 
              type="text" 
              value={formData.apellidoPaterno || ''}
              onChange={(e) => updateField('apellidoPaterno', e.target.value)}
              className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-slate-800 focus:outline-none uppercase ${errors.apellidoPaterno ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errors.apellidoPaterno && <span className="text-red-500 text-xs mt-1 font-medium">{errors.apellidoPaterno}</span>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Apellido Materno *</label>
            <input 
              type="text" 
              value={formData.apellidoMaterno || ''}
              onChange={(e) => updateField('apellidoMaterno', e.target.value)}
              className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-slate-800 focus:outline-none uppercase ${errors.apellidoMaterno ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errors.apellidoMaterno && <span className="text-red-500 text-xs mt-1 font-medium">{errors.apellidoMaterno}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento *</label>
            <input 
              type="date" 
              value={formData.fechaNacimiento || ''}
              onChange={(e) => updateField('fechaNacimiento', e.target.value)}
              className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-slate-800 focus:outline-none uppercase ${errors.fechaNacimiento ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errors.fechaNacimiento && <span className="text-red-500 text-xs mt-1 font-medium">{errors.fechaNacimiento}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sexo *</label>
            <select 
              value={formData.sexo || ''}
              onChange={(e) => updateField('sexo', e.target.value)}
              className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-slate-800 focus:outline-none uppercase ${errors.sexo ? 'border-red-500' : 'border-slate-300'}`}
            >
              <option value="">Seleccionar...</option>
              <option value="H">HOMBRE</option>
              <option value="M">MUJER</option>
              <option value="X">NO BINARIO</option>
            </select>
            {errors.sexo && <span className="text-red-500 text-xs mt-1 font-medium">{errors.sexo}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado de Nacimiento *</label>
            <select 
              value={formData.estado || ''}
              onChange={(e) => updateField('estado', e.target.value)}
              className={`w-full px-4 py-2 border rounded focus:ring-2 focus:ring-slate-800 focus:outline-none uppercase ${errors.estado ? 'border-red-500' : 'border-slate-300'}`}
            >
              <option value="">Seleccionar...</option>
              <option value="CDMX">CIUDAD DE MÉXICO</option>
              <option value="JAL">JALISCO</option>
              <option value="NL">NUEVO LEÓN</option>
              <option value="BC">BAJA CALIFORNIA</option>
              <option value="NE">EXTRANJERO</option>
            </select>
            {errors.estado && <span className="text-red-500 text-xs mt-1 font-medium">{errors.estado}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nacionalidad</label>
            <input 
              type="text" 
              value={formData.nacionalidad || ''}
              onChange={(e) => updateField('nacionalidad', e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded focus:ring-2 focus:ring-slate-800 focus:outline-none uppercase"
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button 
            type="submit" 
            className="bg-slate-800 text-white px-8 py-3 rounded hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <CheckCircle className="w-5 h-5" />
            Validar y Procesar (Zod)
          </button>
        </div>
      </form>
    </div>
  );
}