// src/api/incidenciasService.ts
import axios, { HttpStatusCode, isAxiosError } from 'axios'; // <--- IMPORTACIÓN COMPLETA Y AL PRINCIPIO
import apiClient from './client';
// Importa los tipos necesarios (asegúrate que la ruta sea correcta y los tipos existan)
import type { AsistenciaListItem, IncidentFilters } from '../types/asistencia';

/* ==========================================================================
   Tipos para este Servicio (Payload y Respuestas)
   ========================================================================== */

// Payload para la creación de incidencia exprés
interface IncidentExpressPayload {
    idUsuario: number;
    matricula: string | null;
    image?: string | null;      // Base64
    imageName?: string | null;
    audio?: string | null;      // Base64
    audioName?: string | null;
    archivo?: string | null;    // Base64
    archivoName?: string | null;
}

// Respuesta esperada de la API de creación
interface CreateIncidentApiResponse {
    success: boolean;
    message?: string;
    // Otros campos si los devuelve...
}

/* ==========================================================================
   Funciones API Exportadas
   ========================================================================== */

// --- Obtener Asistencias Abiertas (GET sin filtros/paginación) ---
export const getAsistenciasApi = async (userId: string): Promise<AsistenciaListItem[]> => {
  if (!userId) { console.warn("getAsistenciasApi: userId is missing."); return []; }
  console.log(`API Call: GET /Incidencias/GetAsistencias/${userId}`);
  try {
    const response = await apiClient.get<AsistenciaListItem[]>(`/Incidencias/GetAsistencias/${userId}`);
    if (Array.isArray(response.data)) {
      console.log(`GetAsistencias successful. Received ${response.data.length} items.`);
      return response.data;
    } else {
      console.error("GetAsistencias API returned invalid data structure:", response.data);
      throw new Error('Respuesta inesperada del servidor.');
    }
  } catch (error) {
    let errorMessage = `Error al obtener asistencias abiertas (ID: ${userId}).`;
    // --- Manejo de error COMPLETO ---
    if (isAxiosError(error)) { // Usa el type guard importado
        console.error('Axios error getAsistenciasApi:', error.response?.status, error.response?.data);
        if (error.response?.status === 401 || error.response?.status === 403) { errorMessage = "No autorizado."; }
        else if (error.response?.status === 404) { errorMessage = "Recurso no encontrado."; }
        else { errorMessage = error.response?.data?.message || error.message || `Error ${error.response?.status}`; }
    } else if (error instanceof Error) { console.error('Generic error getAsistenciasApi:', error.message); errorMessage = error.message; }
    else { console.error('Unknown error type getAsistenciasApi:', error); }
    // -------------------------------
    throw new Error(errorMessage);
  }
};

// --- Obtener Asistencias Filtradas (Cerradas/Globales - GET con query params) ---
export const getAsistenciasFilteredGetApi = async (
    endpoint: string, // '/Incidencias/GetAsistenciasCerradas' o '/Incidencias/GetAsistenciasGlobales'
    userId: string,
    filters: IncidentFilters,
    offset: number = 0,
    limit: number = 10
): Promise<AsistenciaListItem[]> => {
     if (!userId) { throw new Error("User ID es requerido."); }

     const params: Record<string, any> = {
         idUsuario: userId,
         marca: filters.marca || undefined,
         modelo: filters.modelo || undefined,
         potencia: filters.potencia || undefined,
         // Falta lógica para periodoDesde/periodoHasta a partir de filters.periodo
         periodoDesde: undefined,
         periodoHasta: undefined,
         sistema: filters.sistema || undefined,
         titulo: filters.titulo || undefined,
         offset: offset,
         maxItems: limit, // Usa el nombre correcto
     };
     Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

     console.log(`API Call: GET ${endpoint}. Params:`, params);

     try {
         const response = await apiClient.get<AsistenciaListItem[]>(endpoint, { params });
         if (Array.isArray(response.data)) {
             console.log(`GET ${endpoint} successful. Received ${response.data.length} items.`);
             return response.data;
         } else {
             console.error(`GET ${endpoint} API returned invalid data structure:`, response.data);
             throw new Error('Respuesta inesperada del servidor.');
         }
     } catch (error) {
         let errorMessage = `Error al obtener ${endpoint}.`;
         // --- Manejo de error COMPLETO ---
         if (isAxiosError(error)) { // Usa el type guard importado
            console.error(`Axios error ${endpoint}:`, error.response?.status, error.response?.data);
            if (error.response?.status === 401 || error.response?.status === 403) { errorMessage = "No autorizado."; }
            else if (error.response?.status === 404) { errorMessage = "Recurso no encontrado (404). Revisa la URL y los parámetros."; } // Error 404 específico
            else { errorMessage = error.response?.data?.message || error.message || `Error ${error.response?.status}`; }
         } else if (error instanceof Error) { console.error(`Generic error ${endpoint}:`, error.message); errorMessage = error.message; }
         else { console.error(`Unknown error type ${endpoint}:`, error); }
         // -------------------------------
         throw new Error(errorMessage);
     }
};

// --- Crear Incidencia Express (POST con payload JSON + Base64) ---
export const createIncidentExpressApi = async (payload: IncidentExpressPayload): Promise<CreateIncidentApiResponse> => {
    console.log('API Call: POST /Incidencias/IncidenciaRapida'); // Verifica esta ruta
    try {
        // --- LLAMADA POST ---
        // Ajusta la ruta si es diferente (ej. /Incidencias/AltaIncidenciaExpress)
        const response = await apiClient.post<CreateIncidentApiResponse>('/Incidencias/IncidenciaRapida', payload);

        // Verifica la respuesta (ej. si devuelve success)
        if (response.status === HttpStatusCode.Ok) {            console.log("Create Incident Express successful:", response.data);
            return response.data;
        } else {
            console.error("Invalid response structure from IncidenciaRapida", response.data);
            throw new Error("Respuesta inesperada del servidor al crear la incidencia.");
        }
    } catch (error: any) {
         let errorMessage = 'Error al crear la incidencia.';
         // --- Manejo de error COMPLETO ---
         if (isAxiosError(error)) {
            console.error('Axios error createIncident:', error.response?.status, error.response?.data);
            errorMessage = error.response?.data?.message || error.message || `Error ${error.response?.status}`;
         } else if (error instanceof Error) { errorMessage = error.message; }
         // -------------------------------
         console.error("Error in createIncidentExpressApi:", errorMessage, error);
         throw new Error(errorMessage);
    }
};
// --- >>> NUEVA FUNCIÓN: Obtener Detalle de Incidencia <<< ---
export const getIncidenciaDetalleApi = async (idIncidencia: number | string): Promise<AsistenciaListItem> => {
    console.log(`API Call: GetIncidenciaDetalle for ID: ${idIncidencia}`);
    try {
        // Llama al endpoint GET, pasando el ID en la ruta
        // Asume que devuelve directamente el objeto AsistenciaListItem
        const response = await apiClient.get<AsistenciaListItem>(`/Incidencias/GetIncidenciaDetalle/${idIncidencia}`);

        // Valida si la respuesta tiene datos (ej. un ID)
        if (response.data && response.data.id) {
             console.log('GetIncidenciaDetalle successful. Data:', response.data);
            return response.data;
        } else {
            console.error("GetIncidenciaDetalle API returned invalid data structure:", response.data);
            throw new Error('Respuesta inesperada del servidor al obtener detalles.');
        }
    } catch (error) {
        let errorMessage = `Error al obtener detalles de la incidencia (ID: ${idIncidencia}).`;
        if (isAxiosError(error)) { // Usa el type guard importado
            console.error('Axios error getIncidenciaDetalle:', error.response?.status, error.response?.data);
            if (error.response?.status === 404) { errorMessage = "Incidencia no encontrada (404)."; }
            else if (error.response?.status === 401 || error.response?.status === 403) { errorMessage = "No autorizado."; }
            else { errorMessage = error.response?.data?.message || error.message || `Error ${error.response?.status}`; }
        } else if (error instanceof Error) { console.error('Generic error getIncidenciaDetalle:', error.message); errorMessage = error.message;
        } else { console.error('Unknown error type getIncidenciaDetalle:', error); }
        throw new Error(errorMessage);
    }
};