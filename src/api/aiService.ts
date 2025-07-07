// src/api/aiService.ts (Nuevo archivo o añadir a uno existente)
import axios, { isAxiosError } from 'axios';
import apiClient from './client'; // Tu instancia de Axios configurada

// Define el tipo de respuesta esperado de la API del ChatGpt
// Ajusta esto según lo que realmente devuelva tu API (ej. si es un objeto con una propiedad 'respuesta')
export interface AIChatResponse {
  // Ejemplo: si la API devuelve { "respuesta": "Texto de la IA" }
  // respuesta?: string | null;
  // O si devuelve el string directamente:
  message?: string | null; // Asumiremos que devuelve un string o un objeto con 'message'
  // Otros campos si la API los devuelve...
  success?: boolean; // Es bueno tener un indicador de éxito
}

export const getAIChatResponseApi = async (mensaje: string,
    idUsuario: string
): Promise<AIChatResponse> => { // Devuelve el tipo definido
  if (!idUsuario) { throw new Error("ID de Usuario es requerido para el chat AI."); }
  if (!mensaje.trim()) { throw new Error("El mensaje no puede estar vacío."); }

  const endpoint = `/ChatGpt/mensaje`; // Verifica esta ruta en tu Swagger
  console.log(`API Call: GET ${endpoint} for UserID: ${idUsuario}, Mensaje: ${mensaje}`);

  try {
    const response = await apiClient.get<AIChatResponse>(endpoint, {
      params: {
        idUsuario: idUsuario,
        mensaje: mensaje, // Axios codificará esto para la URL
      }
    });

    // Valida la respuesta
    if (response.data) { // Asumiendo que devuelve AIChatResponse directamente
      console.log(`AIChat API successful. Response:`, response.data);
      return response.data;
    } else {
      console.error("AIChat API returned invalid data structure:", response.data);
      throw new Error('Respuesta inesperada del servidor del chat AI.');
    }
  } catch (error) {
    let errorMessage = `Error al consultar la IA.`;
    if (isAxiosError(error)) {
        console.error('Axios error getAIChatResponse:', error.response?.status, error.response?.data, error.config?.url);
        errorMessage = error.response?.data?.message || error.message || `Error ${error.response?.status}`;
    } else if (error instanceof Error) {
        console.error('Generic error getAIChatResponse:', error.message);
        errorMessage = error.message;
    } else { console.error('Unknown error type getAIChatResponse:', error); }
    throw new Error(errorMessage);
  }
};