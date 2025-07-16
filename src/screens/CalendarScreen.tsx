// src/screens/CalendarScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, LayoutAnimation, Platform, UIManager,
  SafeAreaView, StatusBar, RefreshControl
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'; // O Stack si se navega desde HomeStack
// import type { MainAppTabParamList } from '../navigation/MainAppNavigator'; // Si era Tab
import type { MainStackParamList } from '../navigation/MainStackNavigator'; // Si es Stack
import { useAuth } from '../context/AuthContext'; // Para userId/username
import { getFormacionesApi } from '../api/formacionService'; // API call
import type { Formacion } from '../types/formacion'; // Tipo de datos
import dayjs from 'dayjs'; // Librería para manejo fácil de fechas
import customParseFormat from 'dayjs/plugin/customParseFormat'; // Plugin para parsear DD/MM/YYYY
import MasIcon from '../assets/icons/mas.svg';
import homeIcon from '../assets/icons/home.svg';
import CalendarioIcon from '../assets/icons/calendario.svg';
import CalendarioCard from '../assets/icons/CalendarioCards.svg';
import ChevronDownIcon from '../assets/icons/ChevronDownIcon.svg';
import ChevronForwardIcon from '../assets/icons/ChevronForwardIcon.svg';


// --- Tipos ---
interface TopHeaderButtonData {
    id: keyof MainStackParamList;
    title: string;
    iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface CalendarioData {
    id: keyof MainStackParamList;
    title: string;
    iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

// --- Datos ---
const topHeaderButtons: TopHeaderButtonData[] = [
    { id: 'Calendar', title: 'Calendario',  iconComponent: CalendarioIcon },
    { id: 'Home', title: 'Inicio',  iconComponent: homeIcon },

];


// Importa Iconos SVG para el Header
// import HeaderIcon from '../assets/icons/calendario.svg';
// import HomeIcon from '../assets/icons/home.svg';

    // --- Renderizado ---
  const headerIconSize = 60; // Tamaño iconos header superior
  const gridIconSize = 90;  // Tamaño iconos cuadrícula
  const gridPaddingHorizontal = 20;

// Habilita LayoutAnimation y Dayjs plugin
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) { UIManager.setLayoutAnimationEnabledExperimental(true); }
dayjs.extend(customParseFormat);

// Tipo Props (ajusta según cómo llegues a esta pantalla)
// type CalendarScreenProps = BottomTabScreenProps<MainAppTabParamList, 'CalendarioTab'>;
type CalendarScreenProps = NativeStackScreenProps<MainStackParamList, 'Calendar'>; // Si es Stack

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { userEmail, userId, isAuthenticated } = useAuth(); // Usaremos userEmail como username
  const username = userEmail; // O userId si la API espera el ID numérico

  // --- Estados ---
  const [allFormaciones, setAllFormaciones] = useState<Formacion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpcomingExpanded, setIsUpcomingExpanded] = useState<boolean>(true);
  const [isPastExpanded, setIsPastExpanded] = useState<boolean>(true);

    const navigateTo = (screen: keyof MainStackParamList) => {
      navigation.navigate(screen);
    };

  // --- Carga de Datos ---
  const loadCalendarData = useCallback(async (isRefresh = false) => {
    if (!isAuthenticated || !username) { setAllFormaciones([]); setError(null); return; }
    if (isLoading && !isRefresh) return;

    console.log(isRefresh ? "Refreshing calendar..." : "Loading calendar...");
    if (isRefresh) setIsRefreshing(true); else setIsLoading(true);
    setError(null);

    try {
      const data = await getFormacionesApi(username); // Llama a la API
      setAllFormaciones(data); // Guarda TODOS los resultados
    } catch (err: any) { setError(err.message || "Error al cargar calendario."); }
    finally { if (isRefresh) setIsRefreshing(false); else setIsLoading(false); }
  }, [isAuthenticated, username, isLoading]); // Dependencias

  // Carga inicial
  useEffect(() => { loadCalendarData(); }, [loadCalendarData]);

  // --- Filtrado Local de Datos (usando useMemo para eficiencia) ---
  const { upcomingEvents, pastEvents } = useMemo(() => {
    const today = dayjs(); // Fecha actual
    const upcoming: Formacion[] = [];
    const past: Formacion[] = [];

    allFormaciones.forEach(formacion => {
      // Intenta parsear la fecha (formato DD/MM/YYYY)
      const eventDate = dayjs(formacion.fecha, "DD/MM/YYYY", true); // 'true' para parseo estricto
      if (eventDate.isValid()) {
        // Compara con 'today' (ignorando la hora)
        if (eventDate.isSame(today, 'day') || eventDate.isAfter(today, 'day')) {
          upcoming.push(formacion);
        } else {
          past.push(formacion);
        }
      } else {
        console.warn(`Fecha inválida encontrada: ${formacion.fecha}`);
        // Decide si incluir fechas inválidas en alguna lista (ej. pasadas)
        past.push(formacion);
      }
    });
    // Ordena las listas si quieres (ej. por fecha)
    // upcoming.sort((a, b) => dayjs(a.fecha, "DD/MM/YYYY").diff(dayjs(b.fecha, "DD/MM/YYYY")));
    // past.sort((a, b) => dayjs(b.fecha, "DD/MM/YYYY").diff(dayjs(a.fecha, "DD/MM/YYYY"))); // Descendente

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [allFormaciones]); // Se recalcula solo si allFormaciones cambia

  // --- Manejadores UI ---
  const toggleSection = (section: 'upcoming' | 'past') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'upcoming') setIsUpcomingExpanded(prev => !prev);
    else setIsPastExpanded(prev => !prev);
  };

  const handleEventPress = (formacion: Formacion) => {
      console.log("Navigating to Formation Detail:", formacion.titulo);
      navigation.navigate('FormationDetail', { formationData: formacion });
  };

  // --- Renderizado de Componentes Internos ---
  // const renderCustomHeader = () => ( <View style={styles.customHeaderContainer}> <View style={[styles.customHeaderButton, styles.customHeaderButtonActive]}> <HeaderIcon width={28} height={28} fill="#0033A0" /> <Text style={[styles.customHeaderText, styles.customHeaderTextActive]}>FORMACIONES</Text> </View> <TouchableOpacity style={styles.customHeaderButton} onPress={() => navigation.navigate('Home')}> <HomeIcon width={28} height={28} fill="#6C757D" /> <Text style={styles.customHeaderText}>Inicio</Text> </TouchableOpacity> </View> );
 
  const renderEventItem = (item: Formacion, index: number) => (
    <TouchableOpacity key={item.id || `form-${index}`} style={styles.eventItem} onPress={() => handleEventPress(item)}>
      <Text style={styles.eventTitle}>{item.titulo || 'Sin título'}</Text>
      <Text style={styles.eventDate}>{item.fecha || 'Fecha no disponible'}</Text>
    </TouchableOpacity>
  );
  const renderSection = ( title: string, iconName: string, events: Formacion[], isExpanded: boolean, toggleFn: () => void ) => (
    <View style={styles.sectionContainer}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggleFn} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <View style={{ padding: 3 }}>
          <CalendarioCard width={50} height={50}  fill="#0033A0" />
          </View>
          {/* <Ionicons name={iconName} size={24} color="#0033A0" style={styles.headerIcon} /> */}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
       {isExpanded ?  (
          <ChevronDownIcon width={24} height={24} fill="#666" />
        ) : (
          <ChevronForwardIcon width={24} height={24} fill="#666" />
        )}
      </TouchableOpacity>
      {isExpanded && ( <View style={styles.sectionContent}>
          {events.length > 0 ? ( events.map(renderEventItem) ) : ( <Text style={styles.noDataText}>Datos no encontrados</Text> )}
        </View> )}
    </View>
  );

  // --- Renderizado Principal ---
  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false}/>
        {/* {renderCustomHeader()} */}  
        
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
  
        {/* Contenido principal (Scroll si hay datos o si no está cargando/error) */}
        {(!isLoading || allFormaciones.length > 0) && !error && (
             <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}
                refreshControl={ <RefreshControl refreshing={isRefreshing} onRefresh={() => loadCalendarData(true)} colors={["#0033A0"]} /> }
            >
                {renderSection( 'Próximas Convocatorias', 'time-outline', upcomingEvents, isUpcomingExpanded, () => toggleSection('upcoming') )}
                {renderSection( 'Antiguas Convocatorias', 'checkmark-done-outline', pastEvents, isPastExpanded, () => toggleSection('past') )}
            </ScrollView>
        )}
    </SafeAreaView>
  );
};

// --- Estilos (Similares a los de CalendarScreen anterior, ajusta si es necesario) ---
const styles = StyleSheet.create({
        safeArea: {
    flex: 1,
    backgroundColor: '#3f4c53', 
     marginTop: 40,
  },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 10, color: '#555', fontSize: 16, },
    errorText: { color: '#D8000C', textAlign: 'center', marginBottom: 15, fontSize: 16, },
    retryButton: { backgroundColor: '#0033A0', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginTop: 10, },
    retryButtonText: { color: '#FFFFFF', fontSize: 16, },
    
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
     marginTop: 20,
  },
  topHeaderButton: {
    flex: 1,
    alignItems: 'center',
    padding: 15, // Padding interno 
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
    // --- Contenido ---
    scrollContainer: { 
      flex: 1,
     }, // Para que el ScrollView ocupe espacio
    scrollContent: { 
      padding: 15, 
      paddingBottom: 30,
    },
    sectionContainer: { 
      backgroundColor: '#ececec', 
      borderRadius: 10, 
      marginBottom: 15, 
      overflow: 'hidden', 
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 1 }, 
      shadowOpacity: 0.18, 
      shadowRadius: 1.00, 
      elevation: 1, 
    },
    sectionContainerBottom:{
      marginBottom: 70,
    },
    sectionHeader: { 
      backgroundColor: '#FFFFFF',
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      paddingVertical: 15, 
      paddingHorizontal: 15, 
      marginTop: 20,
      marginHorizontal: 20,
      marginBottom: 0,
      borderBottomWidth: 1, 
      borderBottomColor: '#F0F0F0', 
    },
    headerLeft: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      paddingRight: 50,
    },
    sectionTitle: { 
      fontSize: 17, 
      fontWeight: '600', 
      color: '#333', 
    },
    sectionContent: { 
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 15, 
      paddingTop: 5, 
      paddingBottom: 5, 
      marginHorizontal: 20,
      marginBottom: 20,
      
    }, // Reducido padding top
    eventItem: { 
      paddingVertical: 12, 
      borderBottomWidth: 1, 
      borderBottomColor: '#222', 
    }, // Aumentado padding vertical
    eventTitle: { fontSize: 15, color: '#444', marginBottom: 4, fontWeight: '500'}, // Un poco más de peso
    eventDate: { fontSize: 13, color: '#888', },
    noDataText: { 
      fontSize: 15, 
      color: '#888', 
      textAlign: 'center', 
      paddingVertical: 20, 
      fontStyle: 'italic',
      borderBottomWidth: 1,   
      borderBottomColor: '#222', 
    }, // Más padding
});

export default CalendarScreen;