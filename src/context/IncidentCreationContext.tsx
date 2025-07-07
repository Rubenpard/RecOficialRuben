// src/context/IncidentCreationContext.tsx
import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react';
import type { Asset } from 'react-native-image-picker'; // Importa el tipo Asset

// Define la estructura de los datos que acumularemos
interface IncidentCreationData {
  matricula: string | null;
  docAsset: Asset | null;     // Asset de la pantalla de documentación
  audioAsset: Asset | null;   // Asset de la pantalla de audio
  mediaAsset: Asset | null;   // Asset de la pantalla de media (foto/video/archivo final)
}

// Define lo que el contexto proveerá: el estado y funciones para modificarlo
interface IncidentCreationContextType {
  incidentData: IncidentCreationData;
  setIncidentData: Dispatch<SetStateAction<IncidentCreationData>>; // Para actualizaciones complejas
  updateField: <K extends keyof IncidentCreationData>(field: K, value: IncidentCreationData[K]) => void; // Para actualizar un solo campo
  clearData: () => void; // Para limpiar al salir o finalizar
}

// Valor inicial del estado
const initialState: IncidentCreationData = {
  matricula: null,
  docAsset: null,
  audioAsset: null,
  mediaAsset: null,
};

// Crea el Contexto
const IncidentCreationContext = createContext<IncidentCreationContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useIncidentCreation = (): IncidentCreationContextType => {
  const context = useContext(IncidentCreationContext);
  if (!context) {
    throw new Error('useIncidentCreation debe usarse dentro de un IncidentCreationProvider');
  }
  return context;
};

// Componente Provider
interface IncidentCreationProviderProps {
  children: ReactNode;
}

export const IncidentCreationProvider: React.FC<IncidentCreationProviderProps> = ({ children }) => {
  const [incidentData, setIncidentData] = useState<IncidentCreationData>(initialState);

  // Función helper para actualizar un campo específico
  const updateField = <K extends keyof IncidentCreationData>(field: K, value: IncidentCreationData[K]) => {
    setIncidentData(prevData => ({
      ...prevData,
      [field]: value,
    }));
  };

  // Función para limpiar todos los datos
  const clearData = () => {
    setIncidentData(initialState);
    console.log('IncidentCreationContext: Data cleared');
  };

  // Valor a proveer por el contexto
  const value = {
    incidentData,
    setIncidentData, // Permite actualizaciones más complejas si es necesario
    updateField,
    clearData,
  };

  return (
    <IncidentCreationContext.Provider value={value}>
      {children}
    </IncidentCreationContext.Provider>
  );
};