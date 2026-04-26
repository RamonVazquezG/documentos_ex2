import { create } from 'zustand';
import type { DocumentoData } from '../types/types';

interface AppState {
  // Usamos Partial porque al inicio el formulario está vacío
  formData: Partial<DocumentoData>;
  isFormValid: boolean;
  updateField: (field: keyof DocumentoData, value: string) => void;
  setFormValid: (isValid: boolean, data?: DocumentoData) => void;
}

export const useAppStore = create<AppState>((set) => ({
  formData: { nacionalidad: 'MEXICANA' }, // Valor por defecto
  isFormValid: false,
  updateField: (field, value) => set((state) => ({
    formData: { ...state.formData, [field]: value.toUpperCase() },
    isFormValid: false // Si el usuario edita algo, invalidamos hasta que vuelva a guardar
  })),
  setFormValid: (isValid, data) => set((state) => ({
    isFormValid: isValid,
    formData: data ? data : state.formData
  }))
}));
