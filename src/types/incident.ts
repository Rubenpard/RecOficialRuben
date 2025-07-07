// src/types/incident.ts

/**
 * Representa la información detallada de una incidencia.
 * Los campos son opcionales para manejar casos donde la API no devuelva toda la información.
 */
export interface Incident {
  // --- Identificación y Estado ---
  id: string | number; // Identificador único, puede ser numérico o string
  title: string;       // Título principal/corto mostrado en listas
  subtitle?: string;    // Subtítulo mostrado en listas (ej. marca/modelo/fecha)
  status?: 'Abierta' | 'Cerrada' | 'Expres' | 'Global'; // Estado de la incidencia

  // --- Información del Vehículo ---
  vehicleInfo?: {
    matricula?: string;
    marca?: string;
    modelo?: string;
    potencia?: string;
    sistema?: string;         // Sistema afectado (Motor, Transmisión, etc.) - Usado en filtros y detalle
    periodo?: string;         // Periodo/Rango de fechas - Usado en filtros y detalle
    fechaMatriculacion?: string;
    codigoMotor?: string;
    // Añadir cualquier otro dato relevante del vehículo
  };

  // --- Detalles Específicos de la Incidencia ---
  tituloIncidencia?: string; // Título descriptivo largo mostrado en el detalle
  sintomas?: string;         // Descripción de los síntomas
  audioUrl?: string;         // URL al archivo de audio de los síntomas

  // Comentarios, pruebas realizadas, o historial
  pruebasComentarios?: {
    texto: string;           // El contenido del comentario/prueba
    fecha?: string;          // Fecha y hora del comentario (formato string)
  }[]; // Puede haber múltiples comentarios

  // Solución propuesta o final
  posibleSolucion?: {
    texto: string;           // La descripción de la solución
    fecha?: string;          // Fecha y hora de la propuesta/solución
  };

  // Archivos adjuntos
  archivoAdjuntoUrl?: string; // URL al archivo adjunto principal

  // --- Metadatos Adicionales ---
  fechaCreacion?: string;     // Fecha de creación (formato string)
  // Puedes añadir más campos como fechaUltimaActualizacion, tecnicoAsignado, etc.
}


/* ==========================================================================
   Tipos Relacionados con los Filtros de Incidencias
   ========================================================================== */

/**
 * Define los campos por los cuales se puede filtrar la lista de incidencias.
 * Asegúrate de que coincidan con las claves usadas en la UI de filtros
 * y potencialmente con los campos en `vehicleInfo` o nivel raíz de `Incident`.
 */
export type IncidentFilterField =
  | 'marca'
  | 'modelo'
  | 'potencia'
  | 'periodo'
  | 'sistema'
  | 'titulo'; // El filtro por título podría manejarse diferente (búsqueda de texto libre)

/**
 * Define la estructura del objeto que contiene los filtros activos.
 * Es un objeto donde cada clave es un campo de filtro válido (`IncidentFilterField`),
 * y el valor es el criterio de filtro (un `string`) o `null` si el filtro no está activo
 * o ha sido limpiado. `Partial` hace que todas las claves sean opcionales.
 */
export type IncidentFilters = Partial<Record<IncidentFilterField, string | null>>;