// src/navigation/MainStackNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importa TODAS las pantallas y navegadores secundarios
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CalendarScreen from '../screens/CalendarScreen';
import PromoScreen from '../screens/PromoScreen';
import AIChatScreen from '../screens/AIChatScreen';
import CallMeScreen from '../screens/CallMeScreen';
import IncidentListScreen from '../screens/IncidentListScreen';
import IncidentDetailScreen from '../screens/IncidentDetailScreen';
import IncidentCreationStackNavigator from './IncidentCreationStackNavigator'; // El flujo anidado
import FormationDetailScreen from '../screens/FormationDetailScreen'; 

// Importa los headers personalizados (¡LOS CREAREMOS A CONTINUACIÓN!)
import MainHeader from './headers/MainHeader';
import InnerHeader from './headers/InnerHeader';

// Importa el tipo AsistenciaListItem para usarlo en los parámetros
import type { AsistenciaListItem } from '../types/asistencia'; 

// --- Tipos para este Stack Principal ---
// Incluye TODAS las pantallas y los parámetros que reciben
export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  Calendar: undefined;
  Promo: undefined;
  AIChat: undefined;
  CallMe: undefined;
  IncidentList: { type: 'Abiertas' | 'Cerradas' | 'Globales' | 'Expres' };
  // *** CAMBIO CRÍTICO AQUÍ: Actualiza los parámetros para IncidentDetail ***
  IncidentDetail: { incident: AsistenciaListItem; cameFromType: 'Abiertas' | 'Cerradas' | 'Globales' | 'Expres' }; //
  // *******************************************************************
  IncidentCreation: undefined; // Para lanzar el flujo de creación
  FormationDetail: undefined; // Asegúrate de que el tipo sea consistente si recibe parámetros
  // Añade otras si las tienes
};

const Stack = createNativeStackNavigator<MainStackParamList>();

const MainStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home" // La cuadrícula es la pantalla inicial
      screenOptions={{
          // Opciones por defecto (pueden ser sobrescritas por pantalla)
          headerShadowVisible: true, // Muestra sombra bajo el header
          headerStyle: { backgroundColor: '#FFFFFF' }, // Fondo blanco para header por defecto
          headerTintColor: '#0033A0', // Color de flecha/texto por defecto (azul)
          headerTitleStyle: { fontWeight: 'bold', color: '#333333' }, // Estilo título
          headerBackTitleVisible: false, // Sin texto "Atrás" en iOS
      }}
    >
      {/* --- Pantallas Principales (usan MainHeader) --- */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false}}/>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false}}/>
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
       options={{ headerShown: false}}/>
       <Stack.Screen
        name="Promo"
        component={PromoScreen}
        options={{ headerShown: false}}/>

       {/* --- Pantallas Internas (usan InnerHeader) --- */}
       <Stack.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{ headerShown: false}}/>
       <Stack.Screen
        name="CallMe"
        component={CallMeScreen}
        options={{ headerShown: false}}/>
       <Stack.Screen
        name="IncidentList"
        component={IncidentListScreen}       
         options={{ headerShown: false }}/>
       <Stack.Screen
        name="IncidentDetail"
        component={IncidentDetailScreen}
       options={{ headerShown: false }}/>
       <Stack.Screen
        name="IncidentCreation" // Lanza el flujo de creación
        component={IncidentCreationStackNavigator}
         options={{ headerShown: false }}/>
      <Stack.Screen
        name="FormationDetail" // <-- El nombre debe ser EXACTO
        component={FormationDetailScreen} // <-- Asegúrate de importar FormationDetailScreen al principio del archivo
        options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
};

export default MainStackNavigator;