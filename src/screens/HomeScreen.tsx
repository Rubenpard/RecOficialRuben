// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar, Dimensions } from 'react-native'; // Añadir SafeAreaView, Platform, StatusBar
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStackNavigator'; // Importa tipos del Stack principal

// --- Importa Iconos SVG para la Cuadrícula ---
import ExpresIcon from '../assets/icons/expres.svg';
import AiIcon from '../assets/icons/ai.svg';
import AbiertasIcon from '../assets/icons/abiertas.svg';
import CerradasIcon from '../assets/icons/cerradas.svg';
import GlobalesIcon from '../assets/icons/globales.svg';
import LlamameIcon from '../assets/icons/llamame.svg';
// --- Importa Iconos SVG para el Header Superior ---
import MPerfilIcon from '../assets/icons/usuarioSvg.svg';
import CalendarioIcon from '../assets/icons/calendario.svg';
import PromoIcon from '../assets/icons/promoHome.svg';
import HeaderRoutes from '../navigation/headers/HeaderRoutes';
import MasIcon from '../assets/icons/mas.svg';
import homeIcon from '../assets/icons/home.svg';
import LogOutIcon from '../assets/icons/logout.svg'; 
// --- ---

// --- Tipos ---
interface TopHeaderButtonData {
    id: keyof MainStackParamList;
    title: string;
    iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}
interface GridItemData {
  id: string;
  title: string;
  iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  targetScreen: keyof MainStackParamList;
  params?: MainStackParamList[GridItemData['targetScreen']];
}
type HomeScreenProps = NativeStackScreenProps<MainStackParamList, 'Home'>;
// --- ---

// --- Datos ---
const topHeaderButtons: TopHeaderButtonData[] = [
    { id: 'Profile', title: 'Mi Perfil',  iconComponent: MPerfilIcon },
    { id: 'Calendar', title: 'Calendario',  iconComponent: CalendarioIcon },
    { id: 'Promo', title: 'Promoción',   iconComponent: PromoIcon },
];
const gridItems: GridItemData[] = [
  { id: 'expres',  iconComponent: ExpresIcon, title: 'Exprés', targetScreen: 'IncidentCreation' },
  { id: 'ai',  iconComponent: AiIcon, title: 'Inteligencia Artificial', targetScreen: 'AIChat' },
  { id: 'abiertas', iconComponent: AbiertasIcon, title: 'Abiertas', targetScreen: 'IncidentList', params: { type: 'Abiertas' } },
  { id: 'cerradas',  iconComponent: CerradasIcon, title:'cerradas', targetScreen: 'IncidentList', params: { type: 'Cerradas' } },
  { id: 'globales',  iconComponent: GlobalesIcon, title:'Global', targetScreen: 'IncidentList', params: { type: 'Globales' } }, // Título Global
  { id: 'llamar',  iconComponent: LlamameIcon, title:'Llámame', targetScreen: 'CallMe' },
];
// --- ---

/* ==========================================================================
   Componente HomeScreen
   ========================================================================== */
const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {

  // --- Navegación ---
  const navigateTo = (screen: keyof MainStackParamList, params?: any) => {
    navigation.navigate(screen, params);
  };

  // --- Renderizado ---
  const headerIconSize = 60; // Tamaño iconos header superior
  const gridIconSize = 120;  // Tamaño iconos cuadrícula

  return (
    // SafeAreaView para evitar solapamiento con notch/barra de estado en iOS
    <SafeAreaView style={styles.safeArea}>
        {/* StatusBar para controlar color (opcional si ya lo haces en App.tsx) */}
        <StatusBar barStyle="dark-content" backgroundColor="black" />
        {/* Contenedor Principal con Flexbox */}
        <View style={styles.mainContainer}>

            {/* Header Superior (3 Botones) */}
<View style={styles.topHeaderContainer}>
  {topHeaderButtons.map((button, index) => {
    const Icon = button.iconComponent;

    // Determinar estilos por posición
    const isFirst = index === 0;
    const isLast = index === topHeaderButtons.length - 1;

    return (
      <TouchableOpacity
        key={button.id}
        style={[
          styles.topHeaderButton,
          isFirst && styles.firstButton,
          isLast && styles.lastButton,
          !isFirst && !isLast && styles.middleButton
        ]}
        onPress={() => navigateTo(button.id)}
        activeOpacity={0.7}
      >
        <Icon width={headerIconSize} height={headerIconSize} fill={'#ffffff'} />
        <Text style={styles.topHeaderText}>{button.title}</Text>
      </TouchableOpacity>
    );
  })}
</View>


            {/* Cuadrícula Inferior (6 Botones) */}
            <View style={styles.gridContainer}>
                 {gridItems.map((item) => {
                    const Icon = item.iconComponent;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.gridItem}
                            onPress={() => navigateTo(item.targetScreen, item.params)}
                            activeOpacity={0.7}
                        >
                          <View style={styles.iconContainer}>
                              <Icon width={gridIconSize} height={gridIconSize} />
                          </View>
                          <View style={styles.textContainer}>
                            <Text style={styles.gridItemText}>{item.title}</Text>
                          </View>
                        </TouchableOpacity>
                    );
                 })}
            </View>
        </View>
    </SafeAreaView>
  );
};

/* ==========================================================================
   Estilos
   ========================================================================== */
const { width, height } = Dimensions.get('window');
// Distribución de altura (aproximada, ajustar según necesidad)
const topHeaderHeightRatio = 0.15; // 15% para el header superior
const gridPaddingVertical = 15;
const gridPaddingHorizontal = 15;
const gridAvailableHeight = height * (1 - topHeaderHeightRatio) - (gridPaddingVertical * 2) - (Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0) - 60; // Restar aprox. StatusBar y espacio inferior

// Cálculo para cuadrícula (asumiendo 3 filas, 2 columnas)
const gridNumRows = 3;
const gridNumColumns = 2;
const gridGap = 15; // Espacio entre botones de la cuadrícula
const gridItemHeight = (gridAvailableHeight - (gridGap * (gridNumRows -1))) / gridNumRows;
const gridItemWidth = (width - (gridGap * (gridNumColumns + 1))) / gridNumColumns; // Ancho depende del ancho de pantalla
const iconSize = Math.min(gridItemWidth, gridItemHeight) * 0.2; //

//Variables


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3f4c53', // Fondo oscuro general
    marginTop: 40,
  },
  mainContainer: {
    flex: 1, // Ocupa todo el espacio de SafeAreaView
    // No usar padding aquí si quieres que el header toque los bordes
  },
  // --- Header Superior ---
  topHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribuye los 3 botones
    alignItems: 'center',
    experimental_backgroundImage: 'linear-gradient(to right, #b1b1ae, #9c9c9c)',
    // height: height * topHeaderHeightRatio, // Altura basada en ratio
    borderRadius: 20, // Bordes redondeados
    marginVertical: gridPaddingVertical, // Espacio antes de la cuadrícula
    marginHorizontal: gridPaddingHorizontal, // Espacio lateral
    marginTop: 20,
  },
  topHeaderButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20, // Padding interno 
    backgroundColor: '#c1c1c1', // Fondo gris claro para botones
    borderRadius: 10, // Bordes redondeados
  },
  topHeaderText: {
    color: '#FFFFFF', // Texto blanco
    fontSize: 16, // Texto pequeño
    fontWeight: '600',
    marginTop: -14, // Espacio icono-texto
  },
   firstButton: {
    backgroundColor: '#c1c1c1',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  middleButton: {
    backgroundColor: '#b1b1ae',
  },
  lastButton: {
    backgroundColor: '#9c9c9c',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  // --- Cuadrícula Inferior ---
    gridContainer: {
      flex: 1, // Ocupa el espacio restante
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignContent: 'center', // Centra las filas verticalmente
      paddingHorizontal: gridGap / 2, // Padding lateral para la cuadrícula
      // paddingVertical: gridPaddingVertical, // Padding vertical ya aplicado arriba/abajo
      marginTop: -70,
    },
  gridItem: {
    width: gridItemWidth,
    height: gridItemHeight, // Altura calculada para llenar espacio
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Bordes bien redondeados
    margin: gridGap / 2, // Espacio alrededor de cada item
    // Sombra
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    paddingVertical: 40,
    paddingTop: 30,
  },

  iconContainer: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 50,
},

textContainer: {
  flex: 1,
  justifyContent: 'center', // Para alinear el texto hacia el fondo si hay espacio
   alignItems: 'center',
},
  gridItemText: {
    fontSize: 20, // Texto más grande en cuadrícula
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
  },

});

export default HomeScreen;