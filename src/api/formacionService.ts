// src/api/formacionService.ts (Nuevo archivo)
import axios, { isAxiosError } from 'axios';
import apiClient from './client';
import type { Formacion } from '../types/formacion'; // Ajusta ruta

// Asume que la respuesta es directamente Formacion[]
export const getFormacionesApi = async (username: string): Promise<Formacion[]> => {
  if (!username) { console.warn("getFormacionesApi: username is missing."); return []; }
  // Ajusta el nombre del endpoint si es diferente
  const endpoint = `/Formacion/GetFormacionesPasadas/${encodeURIComponent(username)}`;
  console.log(`API Call: GET ${endpoint}`);
  try {
    const response = await apiClient.get<Formacion[]>(endpoint); // Espera un array de Formacion
    if (Array.isArray(response.data)) {
      console.log(`GetFormaciones successful. Received ${response.data.length} items.`);
      return response.data;
    } else {
      console.error("GetFormaciones API returned invalid data structure:", response.data);
      throw new Error('Respuesta inesperada del servidor.');
    }
  } catch (error) {
    let errorMessage = `Error al obtener formaciones para ${username}.`;
    if (isAxiosError(error)) { /* ... manejo error axios ... */ }
    else if (error instanceof Error) { /* ... */ } else { /* ... */ }
    console.error("Error in getFormacionesApi:", errorMessage, error);
    throw new Error(errorMessage);
  }
};