// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { setupAxiosInterceptors, clearAxiosInterceptors, apiClient } from '../api/client'; // Importa funciones de Axios

// Define la forma del estado de autenticación
interface AuthState {
  token: string | null;
  userId: string | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Para saber si estamos comprobando el estado inicial
}

// Define las acciones que se pueden realizar
interface AuthActions {
  login: (token: string, userId: string | number | undefined | null, email: string) => Promise<void>;
  logout: () => Promise<void>;
  // Podríamos añadir funciones para refrescar token, etc.
}

// Crea el Context
const AuthContext = createContext<AuthState & AuthActions | undefined>(undefined);

// Define las props del Provider
interface AuthProviderProps {
  children: ReactNode;
}

// Crea el componente Provider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<true>(true); // Empieza cargando

  // Función para cargar datos del storage al iniciar la app
  const loadAuthDataFromStorage = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedToken = await EncryptedStorage.getItem("user_session_token");
      const storedUserId = await AsyncStorage.getItem("user_id");
      const storedUserEmail = await AsyncStorage.getItem("user_email");

      if (storedToken) {
        setToken(storedToken);
        setUserId(storedUserId); // Puede ser null si no se guardó
        setUserEmail(storedUserEmail); // Puede ser null si no se guardó
        console.log('AuthContext: Datos cargados del storage.', { hasToken: !!storedToken, userId: storedUserId, email: storedUserEmail });
        setupAxiosInterceptors(storedToken); // Configura Axios con el token cargado
      } else {
          console.log('AuthContext: No se encontró token en storage.');
          // Asegurarse de limpiar interceptors si no hay token
          clearAxiosInterceptors();
      }
    } catch (error) {
      console.error("AuthContext: Error cargando datos del storage:", error);
      // Limpiar todo en caso de error de lectura
      setToken(null); setUserId(null); setUserEmail(null);
      clearAxiosInterceptors();
    } finally {
      setIsLoading(false); // Termina la carga inicial
    }
  }, []);

  // Ejecuta la carga de datos cuando el provider se monta por primera vez
  useEffect(() => {
    loadAuthDataFromStorage();
  }, [loadAuthDataFromStorage]);

  // Acción de Login: Guarda en storage, actualiza estado, configura Axios
  const login = async (newToken: string, newUserId: string | number | undefined | null, email: string) => {
    setIsLoading(true); // Podríamos tener un estado de loading específico para login
    try {
      const userIdString = (newUserId !== undefined && newUserId !== null) ? newUserId.toString() : null;

      // Guardar en paralelo
      await Promise.all([
        EncryptedStorage.setItem("user_session_token", newToken),
        userIdString ? AsyncStorage.setItem('user_id', userIdString) : AsyncStorage.removeItem('user_id'), // Guarda o borra si es null
        AsyncStorage.setItem('user_email', email)
      ]);

      setToken(newToken);
      setUserId(userIdString);
      setUserEmail(email);
      setupAxiosInterceptors(newToken); // Configura Axios
      console.log('AuthContext: Login exitoso, estado actualizado.');
    } catch (error) {
      console.error("AuthContext: Error durante el proceso de login (storage):", error);
      // Considerar revertir estado o mostrar error
      // Quizás lanzar el error para que LoginScreen lo maneje?
      throw error; // Lanza el error para que LoginScreen lo capture
    } finally {
        setIsLoading(false);
    }
  };

  // Acción de Logout: Limpia storage, limpia estado, limpia Axios
  const logout = async () => {
    setIsLoading(true); // Indicador mientras limpia
    try {
      await Promise.all([
        EncryptedStorage.removeItem("user_session_token"),
        AsyncStorage.removeItem('user_id'),
        AsyncStorage.removeItem('user_email')
      ]);
      setToken(null);
      setUserId(null);
      setUserEmail(null);
      clearAxiosInterceptors(); // Limpia interceptors
      console.log('AuthContext: Logout exitoso, estado limpiado.');
    } catch (error) {
      console.error("AuthContext: Error durante el logout (storage):", error);
      // Informar al usuario podría ser bueno aquí
    } finally {
        setIsLoading(false);
    }
  };

  // Determina si el usuario está autenticado basándose en la presencia del token
  const isAuthenticated = !!token;

  // Proporciona el estado y las acciones al resto de la app
  const value = {
    token,
    userId,
    userEmail,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para consumir el contexto fácilmente
export const useAuth = (): AuthState & AuthActions => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
 export default AuthContext;
