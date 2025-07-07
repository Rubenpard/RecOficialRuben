// src/api/authService.ts
import axios from 'axios';
import apiClient from './client';
// Importa los tipos User y Login...
import type { LoginCredentials, LoginApiResponse, User } from '../types/api/auth';

// --- Función Login (sin cambios) ---
export const loginApi = async (credentials: LoginCredentials): Promise<LoginApiResponse> => {
  try {
      const response = await apiClient.post<LoginApiResponse>('/User/Login', credentials); // O /User/Login si es esa
      console.log('Login API call successful');
      return response.data;
  } catch (error) { /* ... manejo de error ... */ throw new Error(/*...*/); }
};
// --- FUNCIÓN ACTUALIZADA: Obtener Datos del Usuario (y Empresa anidada) ---
// Devuelve directamente el objeto User
export const getUserProfileApi = async (userId: string): Promise<User> => {
  console.log(`API Call: GetUserProfile for ID: ${userId}`);
  try {
    // Llama al endpoint y espera directamente el objeto User
    // Axios devolverá error si el status no es 2xx
    const response = await apiClient.get<User>(`/User/GetUser`, { // Ajusta ruta si es /Auth/GetUser
        params: { idUsuario: userId }
    });
    // Si llega aquí, el status fue 2xx y la respuesta tiene forma de User
    return response.data; // Devuelve el objeto User directamente
  } catch (error) {
    let errorMessage = `Error al obtener el perfil del usuario (ID: ${userId}).`;
    if (axios.isAxiosError(error)) {
        // Podemos verificar el status code si queremos diferenciar errores
        console.error('Axios error getUserProfile:', error.response?.status, error.response?.data);
        if (error.response?.status === 401 || error.response?.status === 403) {
            errorMessage = "No autorizado para ver este perfil.";
        } else if (error.response?.status === 404) {
             errorMessage = "Usuario no encontrado.";
        } else {
             // Intenta obtener un mensaje del cuerpo del error si existe
             errorMessage = error.response?.data?.message || error.response?.data?.title || error.message || `Error ${error.response?.status}`;
        }
    } else if (error instanceof Error) {
        console.error('Generic error getUserProfile:', error.message); errorMessage = error.message;
    } else { console.error('Unknown error type:', error); }
    throw new Error(errorMessage);
  }
};

// --- ¡YA NO NECESITAMOS getCompanyProfileApi para obtener estos datos! ---
// export const getCompanyProfileApi = async (userId: string): Promise<Company> => { ... }

// --- Función Update (si la implementas) ---
// export const updateUserProfileApi = async (userId: string, data: Partial<User>) => { ... }