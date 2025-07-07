// src/navigation/MainStackNavigator.tsx
import React from 'react';
import { createNativeStackNavigator, NativeStackHeaderProps } from '@react-navigation/native-stack';

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

// Importa los headers personalizados (¡LOS CREAREMOS A CONTINUACIÓN!)
import MainHeader from './headers/MainHeader';
import InnerHeader from './headers/InnerHeader';

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
  IncidentDetail: { incidentId: number | string };
  IncidentCreation: undefined; // Para lanzar el flujo de creación
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
        options={{ header: (props) => <MainHeader {...props} currentRoute="Home"/> }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ header: (props) => <MainHeader {...props} currentRoute="Profile"/> }}
      />
      <Stack.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ header: (props) => <MainHeader {...props} currentRoute="Calendar"/> }}
      />
       <Stack.Screen
        name="Promo"
        component={PromoScreen}
        options={{ header: (props) => <MainHeader {...props} currentRoute="Promo"/> }}
      />

       {/* --- Pantallas Internas (usan InnerHeader) --- */}
       <Stack.Screen
        name="AIChat"
        component={AIChatScreen}
        options={(props) => ({ header: (navProps) => <InnerHeader {...navProps} parentRoute="Home"/>, title: 'Inteligencia Artificial' })} // Indica padre y título
      />
       <Stack.Screen
        name="CallMe"
        component={CallMeScreen}
        options={(props) => ({ header: (navProps) => <InnerHeader {...navProps} parentRoute="Home"/>, title: 'Solicitar Llamada' })}
      />
       <Stack.Screen
        name="IncidentList"
        component={IncidentListScreen}
        // El título se pone dinámicamente dentro de la pantalla
        options={(props) => ({ header: (navProps) => <InnerHeader {...navProps} parentRoute="Home"/> })} // Asume padre "Home" por defecto
      />
       <Stack.Screen
        name="IncidentDetail"
        component={IncidentDetailScreen}
        options={(props) => ({ header: (navProps) => <InnerHeader {...navProps} parentRoute="Home"/>, title: 'Detalle Incidencia' })}
      />
       <Stack.Screen
        name="IncidentCreation" // Lanza el flujo de creación
        component={IncidentCreationStackNavigator}
         options={{ headerShown: false }} // El stack anidado tendrá su propio header
      />

    </Stack.Navigator>
  );
};

export default MainStackNavigator;