// src/api/promoService.ts
import axios from 'axios';
import apiClient from './client'; // Tu instancia de Axios configurada (con interceptor)
// Importa el tipo Promotion (asegúrate que esté definido y exportado en tus tipos)
import type { Promotion } from '../types/promotion'; // O '../types/incident', o donde la tengas

// Define el tipo esperado para la respuesta de la API de Promociones
// Ajusta esto si tu API devuelve una estructura diferente (ej. { success: boolean, data: Promotion[] })
type PromotionsApiResponse = Promotion[]; // Asume que devuelve directamente un array de Promotion

export const getPromotionsApi = async (username: string): Promise<Promotion[]> => {
  // Verifica que el username no sea nulo o vacío antes de llamar
  if (!username) {
    console.error('getPromotionsApi: Username is required.');
    // Puedes lanzar un error o devolver un array vacío según prefieras manejarlo
    // throw new Error('Nombre de usuario no disponible para obtener promociones.');
    return []; // Devuelve array vacío si no hay username
  }

  console.log(`API Call: GetPromotions for username: ${username}`);
  try {
    // Construye la URL con el username en la ruta
    // Asegúrate que la ruta base en apiClient no termine en '/' si aquí empiezas con '/'
    const endpointUrl = `/Promos/GetPromociones/${encodeURIComponent(username)}`; // Codifica el username por si tiene caracteres especiales

    // Llama al endpoint GET. Espera directamente un array de Promotion
    const response = await apiClient.get<PromotionsApiResponse>(endpointUrl);

    // Valida mínimamente la respuesta (Axios ya maneja errores de status no-2xx)
    if (Array.isArray(response.data)) {
        console.log(`GetPromotions successful. Received ${response.data.length} promotions.`);
        return response.data; // Devuelve el array de promociones
    } else {
        console.error('GetPromotions API returned invalid data structure:', response.data);
        throw new Error('Respuesta inesperada del servidor al obtener promociones.');
    }

  } catch (error) {
    let errorMessage = `Error al obtener las promociones para ${username}.`;
    if (axios.isAxiosError(error)) {
        console.error('Axios error getPromotions:', error.response?.status, error.response?.data);
        if (error.response?.status === 401 || error.response?.status === 403) { errorMessage = "No autorizado."; }
        else if (error.response?.status === 404) { errorMessage = "Promociones no encontradas."; }
        else { errorMessage = error.response?.data?.message || error.message || `Error ${error.response?.status}`; }
    } else if (error instanceof Error) { console.error('Generic error getPromotions:', error.message); errorMessage = error.message;
    } else { console.error('Unknown error type:', error); }
    throw new Error(errorMessage);
  }
};