// Dentro de src/types/...
export interface Promotion {
    id: string | number;
    imagen: string; // URL de la imagen de la promoción
    nombre: string;    // Título corto (ej. "Anticongelante 9...")
    fin?: string; // Fecha de validez (ej. "Válido hasta 08/08/2025")
    // Puedes añadir más campos como descripción, enlace de detalle, etc.
  }