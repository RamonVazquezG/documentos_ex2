import { z } from 'zod';

export const DocumentoSchema = z.object({
  nombres: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellidoPaterno: z.string().min(2, "El apellido paterno es obligatorio"),
  apellidoMaterno: z.string().min(2, "El apellido materno es obligatorio"),
  fechaNacimiento: z.string().min(1, "La fecha es obligatoria"),
  sexo: z.enum(['H', 'M', 'X'], { message: 'Selecciona un sexo valido' }),
  estado: z.string().min(2, "Selecciona un estado de nacimiento"),
  nacionalidad: z.string().min(4, "La nacionalidad es requerida")
});

// Inferimos el tipo de TypeScript directamente desde el esquema de Zod
export type DocumentoData = z.infer<typeof DocumentoSchema>;