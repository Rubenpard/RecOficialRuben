// src/types/formacion.ts (Nuevo archivo o añadir a uno existente)

export interface Formacion {
    // Asume que la API devuelve estos campos directamente en el array
    titulo: string;
    ciudad: string;
    docente: string;
    numdias: string; // Parece un string con el horario
    fecha: string; // Formato "DD/MM/YYYY"
    centro: string;
    // Podría haber un ID si lo necesitas para keyExtractor, si no, usaremos el índice o combinación
    id?: number | string; // Opcional
  }
  
  // Tipo para la respuesta de la API (asume que es un array directo)
  export type FormacionesApiResponse = Formacion[];