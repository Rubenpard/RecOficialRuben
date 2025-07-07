// src/navigation/headers/InnerHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../createNativeStackNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Para el icono de atrás

// Define las props, incluyendo la ruta padre opcional
interface InnerHeaderProps extends NativeStackHeaderProps {
  parentRoute?: keyof MainStackParamList; // Para saber de qué sección viene
}

// Mapeo de rutas a nombres de sección visibles
const sectionNames: Partial<Record<keyof MainStackParamList, string>> = {
    Profile: "Mi Perfilxxxxx",
    Calendar: "Calendario",
    Promo: "Promos",
    Home: "Inicio", // También mapeamos Home
    // Añade mapeos si una pantalla interna puede venir de diferentes secciones principales
};

const InnerHeader: React.FC<InnerHeaderProps> = ({ navigation, route, options, parentRoute }) => {
  // Intenta obtener el nombre de la sección del parentRoute, o usa el título de la pantalla actual
  const currentSectionKey = parentRoute || (route.name as keyof MainStackParamList);
  const currentSectionName = sectionNames[currentSectionKey] || options.title || route.name;

  // Título a mostrar (el de la pantalla actual)
  const title = options.title || route.name;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Botón "Atrás" (usa el de React Navigation) */}
        {navigation.canGoBack() && (
             <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                 <Ionicons name="arrow-back" size={26} color="#0033A0" />
             </TouchableOpacity>
        )}

        {/* Título de la Pantalla Actual (Centrado) */}
        <View style={styles.titleContainer}>
            <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        </View>

        {/* Botones/Tabs Contextuales (Inicio y Sección Actual) */}
        <View style={styles.tabsContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.tabButton}>
                <Text style={styles.tabText}>Inicio</Text>
                {/* Podríamos añadir indicador si la ruta actual es 'Home', aunque es raro llegar aquí desde Home */}
            </TouchableOpacity>
            <TouchableOpacity
                // Podría navegar a la raíz de la sección si quisiéramos: navigation.navigate(currentSectionKey)
                style={styles.tabButton}
                disabled={true} // Hacemos que la pestaña actual no sea clickeable aquí
            >
                <Text style={[styles.tabText, styles.tabTextActive]}>{currentSectionName}</Text>
                 <View style={styles.activeIndicator} />
            </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  container: {
    flexDirection: 'row',
    height: 55,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5, // Menos padding para dar espacio
  },
  backButton: {
      paddingHorizontal: 10,
      paddingVertical: 5,
  },
  titleContainer: {
      flex: 1, // Ocupa el espacio central
      alignItems: 'center', // Centra el título
      marginHorizontal: 5, // Espacio respecto a botones/tabs
  },
  titleText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333333',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 8, // Menos padding horizontal
    alignItems: 'center',
    justifyContent: 'center',
     position: 'relative',
  },
  tabText: {
    fontSize: 14, // Ligeramente más pequeño
    fontWeight: '500',
    color: '#6c757d',
  },
  tabTextActive: {
    color: '#0033A0',
    fontWeight: 'bold',
  },
   activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: '#0033A0',
    borderRadius: 1.5,
  },
});

export default InnerHeader;