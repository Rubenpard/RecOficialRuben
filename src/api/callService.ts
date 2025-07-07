// src/api/callService.ts (Nuevo archivo)
import axios, { HttpStatusCode, isAxiosError } from 'axios';
import apiClient from './client'; // Tu instancia de Axios

// Define el payload para la solicitud POST
interface CreateCallPayload {
  idusuario: number; // O string si tu API espera string
}

// Define la respuesta esperada (ajusta si tu API devuelve algo más)
interface CreateCallApiResponse {
  success: boolean;
  message?: string;
  // Otros campos si los devuelve...
  // Ejemplo: Si devuelve el nombre del usuario para "Recibido Alberto Alberto"
  // userName?: string;
}

export const createCallRequestApi = async (payload: CreateCallPayload): Promise<CreateCallApiResponse> => {
  const endpoint = '/Llamada/CrearLlamada'; // Revisa esta ruta en tu Swagger
  console.log(`API Call: POST ${endpoint} with payload:`, payload);

  try {
    const response = await apiClient.post<CreateCallApiResponse>(endpoint, payload);

    if (response.status===HttpStatusCode.Ok) {
      console.log(`CreateCallRequest successful. Response:`, response.data);
      return true; // Devuelve la respuesta completa
    } else {
      console.error("CreateCallRequest API returned invalid data structure:", response.data);
      throw new Error('Respuesta inesperada del servidor al solicitar llamada.');
    }
  } catch (error) {
    let errorMessage = 'Error al solicitar la llamada.';
    if (isAxiosError(error)) {
        console.error('Axios error createCallRequest:', error.response?.status, error.response?.data, error.config?.url);
        errorMessage = error.response?.data?.message || error.message || `Error ${error.response?.status}`;
    } else if (error instanceof Error) {
        console.error('Generic error createCallRequest:', error.message); errorMessage = error.message;
    } else { console.error('Unknown error type createCallRequest:', error); }
    throw new Error(errorMessage);
  }
};
