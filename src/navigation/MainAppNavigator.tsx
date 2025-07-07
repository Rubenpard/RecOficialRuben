// src/navigation/MainAppNavigator.tsx
import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs'; // Importar BottomTabBarProps si se usa tabBar
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { RouteProp } from '@react-navigation/native';

/* ==========================================================================
   Importación de Pantallas/Navegadores para las Pestañas
   ========================================================================== */

// Importamos los componentes y navegadores que SÍ hemos creado
import HomeStackNavigator from './HomeStackNavigator'; // El Stack para la sección Inicio
import ProfileScreen from '../screens/ProfileScreen';    // La pantalla para la sección Perfil
import CalendarScreen from '../screens/CalendarScreen'; // <-- Importa la pantalla real
// Importamos el Placeholder para las pestañas que AÚN NO hemos creado
//import PlaceholderScreen from '../screens/PlaceholderScreen';
 import PromoScreen from '../screens/PromoScreen';       // <-- Futuro reemplazo


/* ==========================================================================
   Tipos de Navegación (Tab Navigator)
   ========================================================================== */

// Define las pantallas/pestañas y sus parámetros (si los tuvieran)
// Asegúrate que los nombres de ruta (claves) sean únicos
export type MainAppTabParamList = {
  InicioTab: undefined;     // Pestaña que muestra HomeStackNavigator
  PerfilTab: undefined;     // Pestaña que muestra ProfileScreen
  CalendarioTab: undefined; // Pestaña temporal con PlaceholderScreen
  PromosTab: undefined;     // Pestaña temporal con PlaceholderScreen
};

// Crea el Navegador de Pestañas Inferiores
const Tab = createBottomTabNavigator<MainAppTabParamList>();

/* ==========================================================================
   Configuración de Estilo y Apariencia (Ajusta según tu diseño)
   ========================================================================== */

const ACTIVE_COLOR = '#0033A0'; // Azul principal de RecOficial
const INACTIVE_COLOR = '#6c757d'; // Un gris más estándar para inactivo
const TAB_BAR_BACKGROUND = '#FFFFFF'; // Fondo blanco
const BORDER_COLOR = '#DEE2E6'; // Color de borde sutil

/* ==========================================================================
   Componente MainAppNavigator
   ========================================================================== */

const MainAppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      // screenOptions se aplica a todas las pestañas
      screenOptions={({ route }: { route: RouteProp<MainAppTabParamList, keyof MainAppTabParamList> }) => ({
        headerShown: false, // Ocultamos el header del Tab Navigator, cada Stack interno puede tener el suyo
        tabBarActiveTintColor: ACTIVE_COLOR,
        tabBarInactiveTintColor: INACTIVE_COLOR,
        tabBarStyle: {
          backgroundColor: TAB_BAR_BACKGROUND,
          borderTopColor: BORDER_COLOR,
          borderTopWidth: 1, // Borde visible pero sutil
          height: Platform.OS === 'ios' ? 85 : 65, // Más altura en iOS por el área segura
          paddingBottom: Platform.OS === 'ios' ? 30 : 5, // Padding inferior para iOS
          paddingTop: 5, // Padding superior
          // Sombra ligera
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.10,
          shadowRadius: 2.00,
          elevation: 5, // Sombra en Android
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginBottom: Platform.OS === 'ios' ? -5 : 5, // Ajuste fino de posición de etiqueta
        },
        // Función para definir el icono de cada pestaña
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: string = 'ellipse-outline'; // Icono por defecto

          switch (route.name) {
            case 'InicioTab':
              // Usamos un icono que represente la sección principal/cuadrícula
              iconName = focused ? 'apps' : 'apps-outline';
              break;
            case 'PerfilTab':
              iconName = focused ? 'person-circle' : 'person-circle-outline';
              break;
            case 'CalendarioTab':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'PromosTab':
              iconName = focused ? 'pricetag' : 'pricetag-outline';
              break;
          }
          // Retorna el componente de icono
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {/* --- Definición de cada Pestaña --- */}

      {/* Pestaña de Inicio: Usa HomeStackNavigator */}
      <Tab.Screen
        name="InicioTab"
        component={HomeStackNavigator} // <-- ¡CORRECTO! Usa el Stack Navigator
        options={{
          title: 'Inicio', // Etiqueta de la pestaña
        }}
      />

      {/* Pestaña de Perfil: Usa ProfileScreen */}
      <Tab.Screen
        name="PerfilTab"
         component={ProfileScreen} // <-- ¡CORRECTO! Usa la pantalla de perfil
         options={{ title: 'Mi Perfilxxxxxxxx' }}
      />

      {/* Pestaña de Calendario: Aún usa Placeholder */}
      <Tab.Screen
        name="CalendarioTab"
         component={CalendarScreen}     // <-- Temporal
         options={{ title: 'Calendariorrr' }}
      />

       {/* Pestaña de Promociones: Aún usa Placeholder */}
       <Tab.Screen
        name="PromosTab"
         component={PromoScreen}    // <-- Temporal
         options={{ title: 'Promos' }}
      />
    </Tab.Navigator>
  );
}

export default MainAppNavigator;