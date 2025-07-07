// src/screens/IncidentListScreen.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Pressable, ScrollView,
  SafeAreaView, RefreshControl, Platform, StatusBar, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/HomeStackNavigator';
import { useAuth } from '../context/AuthContext';
import { getAsistenciasApi, getAsistenciasFilteredGetApi } from '../api/incidenciasService';
import type { AsistenciaListItem, IncidentFilters, IncidentFilterField } from '../types/asistencia';

// --- Importa Iconos SVG para el Header ---
import AbiertasIcon from '../assets/icons/abiertas.svg';
import CerradasIcon from '../assets/icons/cerradas.svg';
import GlobalesIcon from '../assets/icons/globales.svg';
import HomeIcon from '../assets/icons/home.svg';
// --- ---

type IncidentListScreenProps = NativeStackScreenProps<HomeStackParamList, 'IncidentList'>;
const PAGE_LIMIT = 10;

const IncidentListScreen: React.FC<IncidentListScreenProps> = ({ route, navigation }) => {
  const { type: incidentType } = route.params;
  const { userId } = useAuth();

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
    } finally { if (isRefresh) setIsRefreshing(false); else if (loadMore) setIsLoadingMore(false); else setIsLoading(false); }
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
  const handleIncidentPress = (incidentItem: AsistenciaListItem) => { if (!incidentItem) { Alert.alert("Error", "Datos inválidos."); return; } navigation.navigate('IncidentDetail', { incident: incidentItem }); };

  // --- Lógica de Filtros ---
  const filterOptionsData: Record<IncidentFilterField, string[]> = { /* ... Tus opciones de filtro simuladas o reales ... */ };
  const getModelosForMarca = (marca: string | null): string[] => { /* ... Tu lógica para modelos ... */ return ['(Selecciona Marca)']; };
  const showFilterModal = (filterType: IncidentFilterField) => { if (filterType === 'titulo') { Alert.alert("Filtro Título", "Búsqueda por título pendiente."); return; } setCurrentFilterEditing(filterType); setIsFilterModalVisible(true); };
  const handleFilterSelect = (value: string | null) => { if (currentFilterEditing) { setFilters(prev => ({ ...prev, [currentFilterEditing]: value, /* Limpiar dependientes */ })); } setIsFilterModalVisible(false); setCurrentFilterEditing(null); };
  const resetFilters = () => { setFilters({}); };

  // --- Paginación ---
  const handleLoadMore = () => { if (showFilters && canLoadMore && !isLoading && !isLoadingMore && !isRefreshing && !onEndReachedCalledDuringMomentum.current) { onEndReachedCalledDuringMomentum.current = true; loadIncidents(false, true); } };

  // --- Renderizado de Componentes Internos ---
  const renderCustomHeader = () => ( <View style={styles.customHeaderContainer}> <View style={[styles.customHeaderButton, styles.customHeaderButtonActive]}> <HeaderIcon width={28} height={28} fill="#0033A0" /> <Text style={[styles.customHeaderText, styles.customHeaderTextActive]}>{headerTitle}</Text> </View> <TouchableOpacity style={styles.customHeaderButton} onPress={() => navigation.navigate('Home')}> <HomeIcon width={28} height={28} fill="#6C757D" /> <Text style={styles.customHeaderText}>Inicio</Text> </TouchableOpacity> </View> );
  const renderFilterBar = () => { if (!showFilters) return null; const renderFilterButton = (fType: IncidentFilterField, lbl: string) => ( <TouchableOpacity key={fType} style={styles.filterButton} onPress={() => showFilterModal(fType)} disabled={fType === 'titulo'}> <Text style={styles.filterButtonText}>{filters[fType] || lbl}</Text> </TouchableOpacity> ); return ( <View style={styles.filterBarContainer}> <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}> {renderFilterButton('marca', 'Marca')} {renderFilterButton('modelo', 'Modelo')} {renderFilterButton('periodo', 'Periodo')} {renderFilterButton('sistema', 'Sistema')} </ScrollView> {Object.values(filters).some(v => v) && ( <TouchableOpacity onPress={resetFilters} style={styles.resetButton}><Text style={styles.resetButtonText}>Restablecer</Text></TouchableOpacity> )} </View> ); };
  const renderIncidentItem = ({ item }: { item: AsistenciaListItem }) => { const displayTitle = item.marca && item.modelo ? `${item.marca} ${item.modelo}` : item.vehiculo?.trim() || item.titulo || 'Incidencia'; const displaySubtitle = item.titulo === displayTitle ? (item.sintomas || '') : (item.titulo || ''); return ( <TouchableOpacity style={styles.card} onPress={() => handleIncidentPress(item)} activeOpacity={0.7}> <View style={styles.cardContent}> <Text style={styles.cardTitle} numberOfLines={1}>{displayTitle}</Text> <Text style={styles.cardSubtitle} numberOfLines={1}>{displaySubtitle}</Text> </View> <TouchableOpacity style={styles.cardIconTouchable} onPress={() => handleIncidentPress(item)}> <Ionicons name="add-circle-outline" size={28} color="#0056b3" /> </TouchableOpacity> </TouchableOpacity> ); };
  const renderFilterModalContent = () => { if (!currentFilterEditing) return null; let options: string[] = []; if (currentFilterEditing === 'modelo') { options = getModelosForMarca(filters.marca ?? null); } else { options = filterOptionsData[currentFilterEditing] || []; } const optionsWithClear = ["(Limpiar Filtro)", ...options]; return ( <TouchableOpacity activeOpacity={1} style={styles.modalContainer}> <Text style={styles.modalTitle}>Seleccionar {currentFilterEditing}</Text> <FlatList data={optionsWithClear} keyExtractor={(item) => item} renderItem={({ item }) => ( <TouchableOpacity style={styles.modalOption} onPress={() => handleFilterSelect(item === "(Limpiar Filtro)" ? null : item)} disabled={item.startsWith('(') && item !== "(Limpiar Filtro)"}> <Text style={[styles.modalOptionText, (item.startsWith('(') && item !== "(Limpiar Filtro)") && styles.modalOptionDisabled]}>{item}</Text> </TouchableOpacity> )} ItemSeparatorComponent={() => <View style={styles.separator} />} /> <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsFilterModalVisible(false)}><Text style={styles.modalCloseButtonText}>Cancelar</Text></TouchableOpacity> </TouchableOpacity> ); };
  const renderFilterModal = () => { if (!showFilters) return null; return ( <Modal transparent={true} visible={isFilterModalVisible} animationType="fade" onRequestClose={() => setIsFilterModalVisible(false)}> <Pressable style={styles.modalOverlay} onPress={() => setIsFilterModalVisible(false)}> {renderFilterModalContent()} </Pressable> </Modal> ); };
  const renderFooter = () => { if (!isLoadingMore || !canLoadMore) return null; return ( <View style={styles.footerLoader}><ActivityIndicator size="small" color="#0033A0" /></View> ); };

  // --- Renderizado Principal ---
  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF"/>
        {renderCustomHeader()}
        {renderFilterBar()}
        {isLoading && !isRefreshing && incidents.length === 0 && !error && ( <View style={styles.centered}><ActivityIndicator size="large" color="#0033A0" /><Text style={styles.loadingText}>Cargando...</Text></View> )}
        {error && incidents.length === 0 && ( <View style={styles.centered}><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={() => loadIncidents(false, false)} style={styles.retryButton}><Text style={styles.retryButtonText}>Reintentar</Text></TouchableOpacity></View> )}
        {(!error || incidents.length > 0) && (
            <FlatList data={incidents} renderItem={renderIncidentItem} keyExtractor={(item) => item.id.toString()} contentContainerStyle={styles.listContentContainer} ListEmptyComponent={ (!isLoading && !isRefreshing && hasLoadedOnce && !error) ? <View style={styles.centered}><Text style={styles.emptyText}>No se encontraron incidencias</Text></View> : null } refreshControl={ <RefreshControl refreshing={isRefreshing} onRefresh={() => { setOffset(0); loadIncidents(true, false); }} colors={["#0033A0"]} /> } onEndReached={showFilters ? handleLoadMore : undefined} onEndReachedThreshold={0.5} ListFooterComponent={showFilters ? renderFooter : undefined} onMomentumScrollBegin={() => { onEndReachedCalledDuringMomentum.current = false; }} /> )}
        {renderFilterModal()}
    </SafeAreaView>
  );
};



// --- Estilos (Igual que la versión completa anterior, incluyendo .footerLoader) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#DDE2E7' },
    customHeaderContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 5, paddingVertical: 8, margin: 10, borderRadius: 25, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
    customHeaderButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 20, backgroundColor: '#E9ECEF', },
    customHeaderButtonActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 1.5, },
    customHeaderText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold', color: '#6C757D', },
    customHeaderTextActive: { color: '#0033A0', },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
    loadingText: { marginTop: 10, fontSize: 16, color: '#555', },
    errorText: { color: '#D8000C', textAlign: 'center', marginBottom: 15, fontSize: 16, },
    retryButton: { backgroundColor: '#0033A0', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginTop: 10, },
    retryButtonText: { color: '#FFFFFF', fontSize: 16, },
    emptyText: { fontSize: 16, color: '#888', textAlign: 'center', marginTop: 50, },
    filterBarContainer: { backgroundColor: '#FFFFFF', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0', shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 1.00, elevation: 1, },
    filterBar: { paddingHorizontal: 10, paddingVertical: 10, alignItems: 'center', },
    filterButton: { backgroundColor: '#E8E8E8', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 15, marginRight: 10, borderWidth: 1, borderColor: '#D0D0D0', minWidth: 80, alignItems: 'center', },
    filterButtonText: { color: '#444', fontSize: 13, fontWeight: '500', },
    resetButton: { alignSelf: 'flex-start', marginLeft: 15, marginTop: 5, },
    resetButtonText: { color: '#0056b3', fontSize: 13, textDecorationLine: 'underline', },
    listContentContainer: { padding: 15, flexGrow: 1, },
    card: { backgroundColor: '#F8F9FA', borderRadius: 15, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E9ECEF', },
    cardContent: { flex: 1, marginRight: 10, },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#212529', marginBottom: 3, },
    cardSubtitle: { fontSize: 14, color: '#495057', },
    cardIconTouchable:{ padding: 5, },
    footerLoader: { paddingVertical: 20, alignItems: 'center' },
    // --- Estilos Modal (copia de versión anterior) ---
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', },
    modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 0, paddingTop: 20, paddingBottom: 10, width: '90%', maxWidth: 400, maxHeight: '80%', elevation: 5, overflow: 'hidden', },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333', paddingHorizontal: 20, },
    modalOption: { paddingVertical: 14, paddingHorizontal: 20, },
    modalOptionText: { fontSize: 16, color: '#444', },
    modalOptionDisabled: { color: '#A0A0A0', },
    separator: { height: 1, backgroundColor: '#EFEFEF', marginHorizontal: 15, },
    modalCloseButton: { marginTop: 10, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EFEFEF', },
    modalCloseButtonText: { fontSize: 16, fontWeight: '500', color: '#888', }
});

export default IncidentListScreen;