// src/api/client.ts
import axios, { InternalAxiosRequestConfig } from 'axios';
import EncryptedStorage from 'react-native-encrypted-storage'; // Asegúrate que esté instalado e importado

const API_BASE_URL = 'https://desarrollo.appacademy.es/api/'; // Verifica la URL base

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let requestInterceptorId: number | null = null;

// Exportar la función para configurar interceptors
export const setupAxiosInterceptors = (token: string): void => {
  if (requestInterceptorId !== null) {
    apiClient.interceptors.request.eject(requestInterceptorId);
    console.log('Previous Axios interceptor ejected.');
  }

  requestInterceptorId = apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // console.log('Interceptor: Token added to header for:', config.url); // Descomenta para debug detallado
      } else {
        console.warn('Interceptor: No token found when setting up.');
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  console.log('Axios interceptors configured successfully.');
};

// Exportar la función para limpiar interceptors
export const clearAxiosInterceptors = (): void => {
  if (requestInterceptorId !== null) {
    apiClient.interceptors.request.eject(requestInterceptorId);
    requestInterceptorId = null;
    console.log('Axios interceptors cleared.');
  }
};

// Exportar la función para configurar al inicio (opcional pero útil)
export const configureAxiosOnAppStart = async (): Promise<void> => {
  try {
    const storedToken = await EncryptedStorage.getItem("user_session_token");
    if (storedToken) {
      console.log('Token found on app start, configuring interceptors...');
      setupAxiosInterceptors(storedToken);
    } else {
      console.log('No token found on app start.');
    }
  } catch (error) {
    console.error("Error retrieving token on app start:", error);
    // Considerar limpiar cualquier interceptor viejo si falla la recuperación
    clearAxiosInterceptors();
  }
};

// Exportar la instancia de cliente como default
export default apiClient;