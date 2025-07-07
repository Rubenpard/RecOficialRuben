// src/navigation/IncidentCreationStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IncidentCreationProvider } from '../context/IncidentCreationContext';

// Importa las pantallas de este flujo (¡Aún no existen!)
//import PlaceholderScreen from '../screens/PlaceholderScreen'; // Usaremos placeholder por ahora
import DocumentationScreen from '../screens/IncidentCreation/DocumentationScreen';
 import AudioScreen from '../screens/IncidentCreation/AudioScreen';
 import MediaScreen from '../screens/IncidentCreation/MediaScreen';
// import SummaryScreen from '../screens/IncidentCreation/SummaryScreen'; // Opcional

/* ==========================================================================
   Tipos de Navegación (Incident Creation Stack)
   ========================================================================== */

// Define los parámetros que se pueden pasar entre pantallas de este flujo
// Es útil para pasar datos recopilados de un paso al siguiente
export type IncidentCreationStackParamList = {
  IncidentDoc: undefined; // Primer paso: Documentación/Matrícula
  IncidentAudio: { formData: Record<string, any> }; // Segundo paso: Audio (recibe datos del paso anterior)
  IncidentMedia: { formData: Record<string, any> }; // Tercer paso: Fotos/Vídeo (recibe datos acumulados)
  // IncidentSummary: { formData: Record<string, any> }; // Paso final opcional: Resumen
};

// Crea el Stack Navigator específico para este flujo
const Stack = createNativeStackNavigator<IncidentCreationStackParamList>();

/* ==========================================================================
   Componente IncidentCreationStackNavigator
   ========================================================================== */
const IncidentCreationStackNavigator: React.FC = () => {
  return (
    <IncidentCreationProvider>
    <Stack.Navigator
      initialRouteName="IncidentDoc" // Empieza en la pantalla de Documentación
      screenOptions={{
        // Opciones de header para este flujo (pueden ser diferentes del HomeStack)
        headerShown: true,
        headerStyle: { backgroundColor: '#0033A0' }, // Mantenemos el azul
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        // Podríamos querer personalizar el botón "Atrás" aquí si es necesario
        // headerBackTitle: 'Atrás',
      }}
    >
      {/* --- Pantallas del Flujo de Creación --- */}

      <Stack.Screen  name="IncidentDoc"  component={DocumentationScreen}  options={{ title: 'Documentación' }}/>        
      <Stack.Screen  name="IncidentAudio" component={AudioScreen}  options={{ title: 'Audio Síntomas' }}/>
      <Stack.Screen  name="IncidentMedia" component={MediaScreen}  options={{ title: 'Fotos / Vídeo' }} />
  {/* ... */}
      {/* <Stack.Screen
        name="IncidentSummary"
        component={PlaceholderScreen} // Reemplazar con SummaryScreen si existe
        options={{ title: 'Resumen Incidencia' }}
      /> */}

    </Stack.Navigator>
    </IncidentCreationProvider>
  );
};

export default IncidentCreationStackNavigator;