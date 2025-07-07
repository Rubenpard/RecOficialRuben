// src/types/asistencia.ts (O añádelo a incident.ts si prefieres)

// Estructura para los elementos de la lista de GetAsistencias
export interface AsistenciaListItem {
    id: number; // Es número en el JSON
    idusuario: number;
    marca?: string | null;
    modelo?: string | null;
    potencia?: string | null;
    periodo?: string | null;
    sistema?: string | null;
    titulo?: string | null; // Título principal de la incidencia
    sintomas?: string | null;
    matricula?: string | null;
    archivo?: string | null; // URL imagen/video final?
    documentacion?: string | null; // URL doc/foto inicial?
    audio?: string | null; // URL audio
    creacion?: number | null; // Timestamp
    creacionAsistencia?: string | null; // Fecha formateada
    estado?: number | null; // 0 para abierta?
    cierre?: number | null;
    cierreAsistencia?: string | null;
    incidencia?: string | null; // ej. "66/2025"
    acceso?: number | null;
    codigomotor?: string | null;
    observacionesadmin?: string | null;
    idadmin?: number | null;
    registrollamadas?: string | null; // Ajusta el tipo si es diferente
    otrainfo?: string | null;
    cierreautomatico?: number | null;
    vehiculo?: string | null; // Contiene "   " en los ejemplos, ¿podría tener marca/modelo?
    files?: any | null; // Tipo desconocido
    asistenciaSeguimientos?: AsistenciaSeguimiento[] | null; // Array de seguimientos
  }
  
  // Estructura interna para asistenciaSeguimientos (simplificada)
  export interface AsistenciaSeguimiento {
      id: number;
      idasistencia: number;
      comentario?: string | null;
      fechacomentario?: string | null;
      solucion?: string | null;
      // Añade más campos si los necesitas del seguimiento
  }
  export interface IncidenciasFilteredApiResponse {
    // Asume que la API devuelve un array de items y el conteo total
    items: AsistenciaListItem[];
    totalCount: number;
    // Añade otros campos si la API los devuelve (ej. offset, limit)
}
  // Tipos para filtros (los usaremos para Cerradas/Globales más tarde)
  export type IncidentFilterField = 'marca' | 'modelo' | 'potencia' | 'periodo' | 'sistema' | 'titulo';
  export type IncidentFilters = Partial<Record<IncidentFilterField, string | null>>;