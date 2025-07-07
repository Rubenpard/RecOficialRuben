// src/navigation/HomeStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Importa el tipo AsistenciaListItem ---
import type { AsistenciaListItem } from '../types/asistencia'; // Ajusta ruta si es necesario

// --- Importa TODAS las pantallas que maneja este Stack ---
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CalendarScreen from '../screens/CalendarScreen';
import PromoScreen from '../screens/PromoScreen';
import AIChatScreen from '../screens/AIChatScreen';
import CallMeScreen from '../screens/CallMeScreen';
import IncidentListScreen from '../screens/IncidentListScreen';
import IncidentDetailScreen from '../screens/IncidentDetailScreen';
import IncidentCreationStackNavigator from './IncidentCreationStackNavigator'; // Flujo anidado

// --- Importa InnerHeader si lo usas para alguna pantalla ---
// import InnerHeader from './headers/InnerHeader';

// --- Tipos de Navegación para ESTE Stack ---
export type HomeStackParamList = {
  Home: undefined;
  Profile: undefined; // Accedida desde header en Home
  Calendar: undefined; // Accedida desde header en Home
  Promo: undefined; // Accedida desde header en Home
  AIChat: undefined; // Accedida desde cuadrícula Home
  CallMe: undefined; // Accedida desde cuadrícula Home
  IncidentList: { type: 'Abiertas' | 'Cerradas' | 'Globales' }; // Recibe tipo (quitamos 'Expres' si va a IncidentCreation)
  IncidentDetail: { incident: AsistenciaListItem }; // Recibe objeto completo
  IncidentCreation: undefined; // Lanza el flujo de creación (accedido desde cuadrícula Home)
   FormationDetail: { formationData: Formacion }; 
};

// Crea el Stack
const Stack = createNativeStackNavigator<HomeStackParamList>();

// --- Componente Navegador ---
const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home" // Empieza en la cuadrícula
      screenOptions={{
        // Opciones por defecto para las pantallas de este stack
        headerShadowVisible: true,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#0033A0', // Color flecha atrás y título (si se muestra)
        headerTitleStyle: { fontWeight: 'bold', color: '#333333' },
      }}
    >
      {/* Pantalla Home (sin header de navegación, tiene el suyo propio) */}
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />

      {/* Pantallas Principales (accedidas desde header en Home) */}
      {/* Usan el header por defecto de este StackNavigator */}
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendario' }} />
      <Stack.Screen name="Promo" component={PromoScreen} options={{ title: 'Promociones' }} />

      {/* Pantallas Internas accedidas desde cuadrícula */}
      <Stack.Screen name="AIChat" component={AIChatScreen} options={{ title: 'Inteligencia Artificial' }} />
      <Stack.Screen name="CallMe" component={CallMeScreen} options={{ title: 'Solicitar Llamada' }} />
      {/* Pantallas de Lista y Detalle usan su propio header interno */}
      <Stack.Screen name="IncidentList" component={IncidentListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="IncidentDetail" component={IncidentDetailScreen} options={{ headerShown: false }} />

      {/* Flujo de Creación Anidado (sin header aquí) */}
      <Stack.Screen name="IncidentCreation" component={IncidentCreationStackNavigator} options={{ headerShown: false }} />

    </Stack.Navigator>
  );
};

export default HomeStackNavigator;