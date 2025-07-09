// src/navigation/headers/MainHeader.tsx
import React from 'react'; // Importación base de React
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
// Importación de tipos de React Navigation (usa 'import type')
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../MainStackNavigator'; // Tipos del Stack principal
import Ionicons from 'react-native-vector-icons/Ionicons';
// --- Importa Iconos SVG para las pestañas ---
// Asegúrate que las rutas sean correctas (desde src/navigation/headers/ -> ../../)

import CalendarioIcon from '../../assets/icons/calendario.svg';
import PromoIcon from '../../assets/icons/promoHome.svg';
import HomeIcon from '../../assets/icons/home.svg'; // Asume que existe home.svg
// --- ---

// --- Tipos y Constantes ---
interface MainHeaderProps extends NativeStackHeaderProps {
  currentRoute: keyof MainStackParamList;
}

interface TabData {
    name: string;
    route: keyof MainStackParamList;
    iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

const ACTIVE_COLOR = '#0033A0';
const INACTIVE_COLOR = '#6c757d';
// --- ---

/* ==========================================================================
   Componente MainHeader
   ========================================================================== */
const MainHeader: React.FC<MainHeaderProps> = ({ navigation, currentRoute }) => {

  const tabs: TabData[] = [
    { name: 'Mi Perfilxxx', route: 'Profile', iconComponent: MPerfilIcon },
    { name: 'Calendario', route: 'Calendar', iconComponent: CalendarioIcon },
    { name: 'Promos', route: 'Promo', iconComponent: PromoIcon },
  ];

  const navigateTo = (route: keyof MainStackParamList) => {
    if (route !== currentRoute) { navigation.navigate(route); }
  };

  const iconSize = 26; // Tamaño iconos header

  // --- RETURN PRINCIPAL DEL COMPONENTE ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Botón Inicio */}
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.tabButton} disabled={currentRoute === 'Home'} >
            <HomeIcon width={iconSize} height={iconSize} color={currentRoute === 'Home' ? ACTIVE_COLOR : INACTIVE_COLOR} />
            <Text style={[styles.tabText, currentRoute === 'Home' && styles.tabTextActive]}> Inicio </Text>
        </TouchableOpacity>

        <View style={styles.spacer} />

        {/* Tabs Principales */}
        <View style={styles.mainTabsContainer}>
            {tabs.map((tab) => {
                const isActive = currentRoute === tab.route;
                const IconComponent = tab.iconComponent;
                const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
                return ( <TouchableOpacity key={tab.route} onPress={() => navigateTo(tab.route)} style={styles.tabButton} disabled={isActive} >
                        <IconComponent width={iconSize} height={iconSize} color={color} />
                        <Text style={[styles.tabText, isActive && styles.tabTextActive]}> {tab.name} </Text>
                    </TouchableOpacity> );
            })}
        </View>
      </View>
    </SafeAreaView>
  );
  // --- FIN DEL RETURN ---

}; // <-- LLAVE DE CIERRE DE LA FUNCIÓN MainHeader

/* ==========================================================================
   Estilos
   ========================================================================== */
const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', },
  container: { flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5, },
  mainTabsContainer: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
  tabButton: { paddingVertical: 5, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', minWidth: 70, },
  tabText: { fontSize: 10, fontWeight: '500', color: INACTIVE_COLOR, marginTop: 2, },
  tabTextActive: { color: ACTIVE_COLOR, fontWeight: '600', },
  spacer: { flex: 1, },
});

// --- EXPORTACIÓN POR DEFECTO ---
export default MainHeader;
// --- ---