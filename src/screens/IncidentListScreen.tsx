import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Pressable, ScrollView,
  SafeAreaView, RefreshControl, Platform, StatusBar, Alert, Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/HomeStackNavigator'; // Asumiendo que IncidentList está en HomeStack
import type { MainStackParamList } from '../navigation/MainStackNavigator'; // Importar si necesitas navegar a otras pantallas del MainStack directamente

import { useAuth } from '../context/AuthContext';
import { getAsistenciasApi, getAsistenciasFilteredGetApi } from '../api/incidenciasService';
import type { AsistenciaListItem, IncidentFilters, IncidentFilterField } from '../types/asistencia';

// --- Importa Iconos SVG para el Header ---
import AbiertasIcon from '../assets/icons/abiertas.svg';
import CerradasIcon from '../assets/icons/cerradas.svg';
import GlobalesIcon from '../assets/icons/globales.svg';
import HomeIcon from '../assets/icons/home.svg';
import MPerfilIcon from '../assets/icons/usuarioSvg.svg';
// --- ---
const gridPaddingVertical = 15;
const gridPaddingHorizontal = 15;
    // --- Renderizado ---
  const headerIconSize = 60; // Tamaño iconos header superior
  const gridIconSize = 90;  // Tamaño iconos cuadrícula


interface TopHeaderButtonData {
    id: keyof MainStackParamList | keyof HomeStackParamList; // Puede ser de ambos si navegas entre ellos
    title: string;
    iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

// --- Datos ---
// Nota: Tu navegación superior en IncidentListScreen parece ir a 'Home'
// Si necesitas 'Abiertas' aquí, el 'id' debería ser 'IncidentList' con type 'Abiertas'

//Renderizado de filterButton

// const screenWidth = Dimensions.get('window').width;
// const spacing = 0; // Espacio entre columnas
// const columns = 3;

// const itemWidth = (screenWidth - spacing * (columns - 1)) / columns;

const buttonStyles = {
  marca: {
    backgroundColor: '#b3b3af',
    borderTopLeftRadius: 12,
  },
  modelo: {
    backgroundColor: '#c5c5c5',

  },
  potencia: {
    backgroundColor: '#dadada',
    borderTopRightRadius: 20,
  },
  periodo: {
    backgroundColor: '#a4aad6',

  },
  sistema: {
    backgroundColor: '#babedf',
  },
  titulo: {
    backgroundColor: '#d5d3ed',
  },
};


type IncidentListScreenProps = NativeStackScreenProps<HomeStackParamList, 'IncidentList'>;
const PAGE_LIMIT = 10;

const IncidentListScreen: React.FC<IncidentListScreenProps> = ({ route, navigation }) => {
  const { type: incidentType } = route.params;

    const [selectedType, setSelectedType] = useState(incidentType);
  // --- Datos ---
const topHeaderButtons: TopHeaderButtonData[] = [
  {
    id: 'IncidentList',
    title: 'Abiertas',
    iconComponent: AbiertasIcon,
  },
  {
    id: 'IncidentList',
    title: 'Cerradas',
    iconComponent: CerradasIcon,
  },
  {
    id: 'IncidentList',
    title: 'Globales',
    iconComponent: GlobalesIcon,
    
  },
  { id: 'Home',
    title: 'Inicio',
    iconComponent: HomeIcon,
  },
];

  const { userId } = useAuth();
     const navigateTo = (screen: keyof MainStackParamList | keyof HomeStackParamList, params?: any) => { //
        // Asume que 'Home' es del MainStack y 'IncidentList' es del HomeStack
        if (screen === 'Home') { //
            (navigation as any).navigate(screen); // Casteo para que funcione la navegación entre stacks
        } else if (screen === 'IncidentList') { //
            navigation.navigate(screen, params); //
        } else {
            // Si hay otras pantallas del MainStack
            (navigation as any).navigate(screen, params); //
        }
      };
  

  // --- Estados ---
  const [incidents, setIncidents] = useState<AsistenciaListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [currentFilterEditing, setCurrentFilterEditing] = useState<IncidentFilterField | null>(null);
  const [offset, setOffset] = useState<number>(0);
  const [canLoadMore, setCanLoadMore] = useState<boolean>(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
  const onEndReachedCalledDuringMomentum = useRef(true);

  const showFilters = incidentType === 'Cerradas' || incidentType === 'Globales';
  const HeaderIcon = incidentType === 'Abiertas' ? AbiertasIcon : (incidentType === 'Cerradas' ? CerradasIcon : GlobalesIcon);
  const headerTitle = incidentType; // Usa el tipo como título para el header personalizado

  // --- Función de Carga de Datos ---
  const loadIncidents = useCallback(async (isRefresh = false, loadMore = false) => {
    if (!userId) { setError("Usuario no identificado."); return; }
    if ((isLoading || isLoadingMore) && !isRefresh) return;

    const currentOffset = loadMore ? offset : 0;
    console.log(`LoadIncidents - Type: ${incidentType}, Refresh: ${isRefresh}, LoadMore: ${loadMore}, Offset: ${currentOffset}, Filters:`, filters);

    if (isRefresh) setIsRefreshing(true); else if (loadMore) setIsLoadingMore(true); else setIsLoading(true);
    setError(null);
    if (!loadMore) setCanLoadMore(true);

    try {
      let newIncidents: AsistenciaListItem[] = [];
       if (incidentType === 'Abiertas') {
        if (loadMore || currentOffset > 0) { setCanLoadMore(false); } // No hay paginación
        else { newIncidents = await getAsistenciasApi(userId); setCanLoadMore(false); } // Carga todo
      } else { // Cerradas o Globales
        const endpoint = incidentType === 'Cerradas' ? '/Incidencias/GetAsistenciasCerradas' : '/Incidencias/GetAllAsistencias';
        newIncidents = await getAsistenciasFilteredGetApi(endpoint,userId, filters, currentOffset, PAGE_LIMIT);
        if (newIncidents.length < PAGE_LIMIT) { setCanLoadMore(false); } // No hay más páginas
        else { setCanLoadMore(true); } // Podría haber más
      }
      setIncidents(prev => (currentOffset === 0) ? newIncidents : [...prev, ...newIncidents]);
      setOffset(currentOffset + newIncidents.length);
      setHasLoadedOnce(true);
    } catch (err: any) { setError(err.message || `Error al cargar ${incidentType}.`); setCanLoadMore(false);
    } finally { if (isRefresh) setIsRefreshing(false); else if (loadMore) setIsLoadingMore(false); else setIsLoading(true); } // Corregido: setIsLoading(true) -> setIsLoading(false)
  }, [userId, incidentType, filters, offset, isLoading, isLoadingMore]);

  // --- useEffect Carga Inicial/Filtros ---
  useEffect(() => {
    if (userId) {
      console.log(`Filters/Type/User changed for ${incidentType}. Resetting.`);
      setOffset(0); setIncidents([]); setCanLoadMore(true); setHasLoadedOnce(false); setError(null);
      loadIncidents(false, false);
    } else { setIncidents([]); setError("Usuario no identificado."); setHasLoadedOnce(false); }
    // navigation.setOptions({ title: `Incidencias ${incidentType}` }); // Ya no necesario, usamos header custom
  }, [userId, incidentType, filters, navigation]);

  // --- Navegación ---
  const handleIncidentPress = (incidentItem: AsistenciaListItem) => {
    if (!incidentItem) {
      Alert.alert("Error", "Datos inválidos.");
      return;
    }
    // PASANDO cameFromType A LA PANTALLA DE DETALLES
    navigation.navigate('IncidentDetail', { incident: incidentItem, cameFromType: incidentType }); //
  };

  // --- Lógica de Filtros ---
  const filterOptionsData: Record<IncidentFilterField, string[]> = {
    marca: ['Marca A', 'Marca B', 'Marca C'],
    modelo: ['Modelo X', 'Modelo Y', 'Modelo Z'],
    potencia: ['100 CV', '150 CV', '200 CV'],
    periodo: ['2023', '2024'],
    sistema: ['Sistema 1', 'Sistema 2'],
    titulo: [], // Vacío porque la búsqueda por título es diferente
  };
  const getModelosForMarca = (marca: string | null): string[] => {
    if (marca === 'Marca A') return ['Modelo X', 'Modelo Y'];
    if (marca === 'Marca B') return ['Modelo Z'];
    return ['(Selecciona Modelo)'];
  };
  const showFilterModal = (filterType: IncidentFilterField) => {
    if (filterType === 'titulo') { Alert.alert("Filtro Título", "Búsqueda por título pendiente."); return; } setCurrentFilterEditing(filterType); setIsFilterModalVisible(true); };
  const handleFilterSelect = (value: string | null) => { if (currentFilterEditing) { setFilters(prev => ({ ...prev, [currentFilterEditing]: value, /* Limpiar dependientes */ })); } setIsFilterModalVisible(false); setCurrentFilterEditing(null); };
  const resetFilters = () => { setFilters({}); };

  // --- Paginación ---
  const handleLoadMore = () => { if (showFilters && canLoadMore && !isLoading && !isLoadingMore && !isRefreshing && !onEndReachedCalledDuringMomentum.current) { onEndReachedCalledDuringMomentum.current = true; loadIncidents(false, true); } };

  // --- Renderizado de Componentes Internos ---
  const renderCustomHeader = () => ( 
  <View style={styles.customHeaderContainer}> 
  <View style={[styles.customHeaderButton, styles.customHeaderButtonActive]}> 
    <HeaderIcon width={28} height={28} fill="#0033A0" /> 
    <Text style={[styles.customHeaderText, styles.customHeaderTextActive]}>{headerTitle}</Text> 
    </View> 
    <TouchableOpacity style={styles.customHeaderButton} onPress={() => navigateTo('Home')}>
       <HomeIcon width={28} height={28} fill="#6C757D" /> 
       <Text style={styles.customHeaderText}>Inicio</Text> 
       </TouchableOpacity> 
       </View> );
  const renderFilterBar = () => { if (!showFilters) return null; const renderFilterButton = 
  (fType: IncidentFilterField, lbl: string) => 
  ( <TouchableOpacity key={fType} 
   style={[styles.filterButton, buttonStyles[fType]]}
  onPress={() => showFilterModal(fType)} 
  disabled={fType === 'titulo'}> 
  <Text style={styles.filterButtonText}>
    {filters[fType] || lbl}</Text> </TouchableOpacity> ); 
    return ( <View style={styles.filterBarContainer}> 
    <ScrollView horizontal showsHorizontalScrollIndicator={false} 
    contentContainerStyle={styles.filterBar}> 
  {renderFilterButton('marca', 'Marca')} 
  {renderFilterButton('modelo', 'Modelo')} 
  {renderFilterButton('potencia', 'Potencia')} 
  {renderFilterButton('periodo', 'Periodo')}
   {renderFilterButton('sistema', 'Sistema')} 
     {renderFilterButton('titulo', 'Titulo')} 
   </ScrollView> 
   {Object.values(filters).some(v => v) && ( <TouchableOpacity onPress={resetFilters} style={styles.resetButton}><Text style={styles.resetButtonText}>Restablecer</Text></TouchableOpacity> )} </View> ); };
  const renderIncidentItem = ({ item }: { item: AsistenciaListItem }) => { const displayTitle = item.marca && item.modelo ? `${item.marca} ${item.modelo}` : item.vehiculo?.trim() || item.titulo || 'Incidencia'; const displaySubtitle = item.titulo === displayTitle ? (item.sintomas || '') : (item.titulo || ''); 
  return ( 
  <>  
  <TouchableOpacity 
  style={styles.card} 
  onPress={() => handleIncidentPress(item)} 
  activeOpacity={0.7}> 
  <View style={styles.cardContent}> 
  <Text style={styles.cardTitle} 
  numberOfLines={1}>{displayTitle}
  </Text> 
  <Text style={styles.cardSubtitle} numberOfLines={1}>
    {displaySubtitle}</Text> 
    </View> 
    <TouchableOpacity style={styles.cardIconTouchable} 
    onPress={() => handleIncidentPress(item)}> 
    <Text style={styles.cardIconText}>+</Text> 
    </TouchableOpacity> 
    </TouchableOpacity>
    <View style={styles.cardBottom}></View>
    </>
     );
    };
  const renderFilterModalContent = () => { if (!currentFilterEditing) return null; let options: string[] = []; if (currentFilterEditing === 'modelo') { options = getModelosForMarca(filters.marca ?? null); } else { options = filterOptionsData[currentFilterEditing] || []; } const optionsWithClear = ["(Limpiar Filtro)", ...options]; return ( <TouchableOpacity activeOpacity={1} style={styles.modalContainer}> 
  <Text style={styles.modalTitle}>Seleccionar {currentFilterEditing}</Text> 
  <FlatList data={optionsWithClear} keyExtractor={(item) => item} renderItem={({ item }) => ( <TouchableOpacity style={styles.modalOption} onPress={() => handleFilterSelect(item === "(Limpiar Filtro)" ? null : item)} disabled={item.startsWith('(') && item !== "(Limpiar Filtro)"}> <Text style={[styles.modalOptionText, (item.startsWith('(') && item !== "(Limpiar Filtro)") && styles.modalOptionDisabled]}>{item}</Text> </TouchableOpacity> )} ItemSeparatorComponent={() => <View style={styles.separator} />} /> <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsFilterModalVisible(false)}><Text style={styles.modalCloseButtonText}>Cancelar</Text></TouchableOpacity> </TouchableOpacity> ); };
  const renderFilterModal = () => { if (!showFilters) return null; return ( <Modal transparent={true} visible={isFilterModalVisible} animationType="fade" onRequestClose={() => setIsFilterModalVisible(false)}> <Pressable style={styles.modalOverlay} onPress={() => setIsFilterModalVisible(false)}> {renderFilterModalContent()} </Pressable> </Modal> ); };
  const renderFooter = () => { if (!isLoadingMore || !canLoadMore) return null; return ( <View style={styles.footerLoader}><ActivityIndicator size="small" color="#0033A0" /></View> ); };

  // --- Renderizado Principal ---
  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF"/>
          {/* Header Superior (3 Botones) */}
                 <View style={styles.topHeaderContainer}>
                   {topHeaderButtons.filter(button => button.title === incidentType || button.id === 'Home').map((button, index) => {
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
                           !isFirst && !isLast && styles.middleButton // Si hay un botón en el medio
                         ]}
                         // Ajusta la navegación aquí:
                         onPress={() => {
                            if (button.id === 'Home') {
                                navigateTo('Home');
                            } else if (button.id === 'IncidentList') {
                                navigateTo('IncidentList', { type: 'Abiertas' }); // Navega a la lista de "Abiertas"
                            }
                         }}
                         activeOpacity={0.7}
                       >
                            <Icon
                             width={headerIconSize}
                             height={headerIconSize}
                             fill={isFirst ? '#2c4391' : '#ffffff'}
                            />
                           <Text style={[
                             styles.topHeaderText,
                             isFirst && { color: '#000000' },
                             !isFirst && { color: '#ffffff' }
                            ]}>{button.title}</Text>
                       </TouchableOpacity>
                     );
                   })}
                 </View>
        {renderFilterBar()}
        {isLoading && !isRefreshing && incidents.length === 0 && !error && ( <View style={styles.centered}><ActivityIndicator size="large" color="#0033A0" /><Text style={styles.loadingText}>Cargando...</Text></View> )}
        {error && incidents.length === 0 && ( <View style={styles.centered}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => loadIncidents(false, false)} style={styles.retryButton}><Text style={styles.retryButtonText}>Reintentar</Text></TouchableOpacity></View> )}
        {(!error || incidents.length > 0) && (
            <FlatList data={incidents} 
            renderItem={renderIncidentItem} 
            keyExtractor={(item) => item.id.toString()} 
            contentContainerStyle={styles.listContentContainer} 
            ListEmptyComponent={ (!isLoading && !isRefreshing && hasLoadedOnce && !error) ? 
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No se encontraron incidencias</Text>
              </View> : null } refreshControl={ <RefreshControl refreshing={isRefreshing} 
              onRefresh={() => { setOffset(0); loadIncidents(true, false); }} colors={["#0033A0"]} /> } 
              onEndReached={showFilters ? handleLoadMore : undefined} 
              onEndReachedThreshold={0.5} ListFooterComponent={showFilters ? renderFooter : undefined} 
              onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false; }} /> )}
        {renderFilterModal()}
    </SafeAreaView>
  );
};



// --- Estilos (Igual que la versión completa anterior, incluyendo .footerLoader) ---
const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#3f4c53',
      marginTop: 40,
      paddingBottom: 30,
    },
    customHeaderContainer: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 5,
      paddingVertical: 8,
      margin: 10,
      borderRadius: 25,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      marginTop: 20,
     },
    
     // --- Header Superior ---
  topHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribuye los 3 botones
    alignItems: 'center',
    backgroundColor: '#b1b1ae', // Fondo gris medio
    // height: height * topHeaderHeightRatio, // Altura basada en ratio
    borderRadius: 20, // Bordes redondeados
    marginVertical: 16, // Espacio antes de la cuadrícula (valor fijo)
    marginHorizontal: gridPaddingHorizontal, // Espacio lateral
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
    backgroundColor: '#ffffff',
    color: '#000000',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  middleButton: {
    backgroundColor: '#b1b1ae',

  },
  lastButton: {
    backgroundColor: '#b1b1ae',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },

    customHeaderButton: { 
      flex: 1, 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      paddingVertical: 10, 
      paddingHorizontal: 5, 
      borderRadius: 20, 
      backgroundColor: '#E9ECEF', 
    },
    customHeaderButtonActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 1.5, },
    customHeaderText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold', color: '#6C757D', },
    customHeaderTextActive: { color: '#0033A0', },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
    loadingText: { marginTop: 10, fontSize: 16, color: '#555', },
    errorText: { color: '#D8000C', textAlign: 'center', marginBottom: 15, fontSize: 16, },
    retryButton: { backgroundColor: '#0033A0', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginTop: 10, },
    retryButtonText: { color: '#FFFFFF', fontSize: 16, },
    emptyText: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 50, },
    filterBarContainer: { 
      backgroundColor: '#FFFFFF', 
      paddingBottom: 10, 
      margin: 20,
      borderTopEndRadius: 20,
      borderTopLeftRadius: 20,
      marginBottom: -36,
      zIndex: 1000,
    },
    filterBar: { 
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    filterButton: {
      paddingVertical: 8,
      alignItems: 'center',
       width: '33.32%',
       left: 0,
       paddingHorizontal: 9,
    },
    filterButtonText: { color: '#444', fontSize: 13, fontWeight: '500', },
    resetButton: { alignSelf: 'flex-start', marginLeft: 15, marginTop: 5, },
    resetButtonText: { color: '#0056b3', fontSize: 13, textDecorationLine: 'underline', },
    listContentContainer: { 
      padding: 15, 
      flexGrow: 1, 
      backgroundColor: '#ffffff', 
      margin: 20,
      borderRadius: 20, 
      paddingBottom: 60,
    },
    card: { 
      backgroundColor: '#ededed', 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      height: 90,
      marginBottom: 20,
      marginTop: -15,
      borderTopLeftRadius: 0,
      borderTopEndRadius: 0,
      borderWidth: 5,
      borderTopWidth: 0,
      borderColor: '#ffffff',
      // borderWidth: 10,
      // borderTopWidth: 0,
      // borderColor: '#ffffff',
    },

    cardBottom: {
       backgroundColor: '#ededed', 
       marginTop: -25,
      borderRadius: 20,
      borderTopLeftRadius: 0,
      borderTopEndRadius: 0,
      borderWidth: 7,
      borderTopWidth: 0,
      borderColor: '#ffffff',
      zIndex:999,
      height: 20,
    },
    cardContent: { 
      flex: 1, 
      marginRight: 10,
      marginTop: 50,
      paddingHorizontal: 20,
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#212529', },
    cardSubtitle: { fontSize: 14, color: '#495057', },
    cardIconTouchable:{
      padding: 5,
    },
      cardIconText:{
      padding: 20,
       fontSize: 30,
       fontWeight: 800,
       color: '#0132ab',
       
    },
    footerLoader: { paddingVertical: 20, alignItems: 'center' },
    // --- Estilos Modal (copia de versión anterior) ---
    modalOverlay: { 
      flex: 1, 
      backgroundColor: 'rgba(0, 0, 0, 0.6)', 
      justifyContent: 'center', 
      alignItems: 'center', 
    },
    modalContainer: { 
      backgroundColor: '#FFFFFF', 
      borderRadius: 10, 
      paddingHorizontal: 0, 
      paddingTop: 20, 
      paddingBottom: 10, 
      width: '90%', 
      maxWidth: 400, 
      maxHeight: '80%', 
      elevation: 5, 
      overflow: 'hidden', 
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333', paddingHorizontal: 20, },
    modalOption: { paddingVertical: 14, paddingHorizontal: 20, },
    modalOptionText: { fontSize: 16, color: '#444', },
    modalOptionDisabled: { color: '#A0A0A0', },
    separator: { height: 1, backgroundColor: '#EFEFEF', marginHorizontal: 15, },
    modalCloseButton: { marginTop: 10, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EFEFEF', },
    modalCloseButtonText: { fontSize: 16, fontWeight: '500', color: '#888', }
});
export default IncidentListScreen;