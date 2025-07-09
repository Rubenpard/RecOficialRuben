  // src/screens/PromoScreen.tsx
  import React, { useState, useEffect, useCallback } from 'react';
  import {
    View, Text, StyleSheet, FlatList,
    TouchableOpacity, ActivityIndicator, Image, Dimensions, Alert, RefreshControl, Modal
  } from 'react-native';
  import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
  import type { MainAppTabParamList } from '../navigation/MainAppNavigator';
  // --- Importaciones Necesarias ---
  import { useAuth } from '../context/AuthContext'; // Hook para obtener userEmail
  import { getPromotionsApi } from '../api/promoService'; // Nueva función API
  import type { Promotion } from '../types/promotion'; // O donde tengas el tipo Promotion
  import type { MainStackParamList } from '../navigation/types'; 
  import MPerfilIcon from '../assets/icons/usuarioSvg.svg';
  import HeaderRoutes from '../navigation/headers/HeaderRoutes';
  import PromoIcon from '../assets/icons/promoHomeBlue.svg';
  import MasIcon from '../assets/icons/mas.svg';
  import homeIcon from '../assets/icons/home.svg';
  import LogOutIcon from '../assets/icons/logout.svg'; 
  import VolverIcon from '../assets/icons/volver.svg';
  import MasInfoIcon from '../assets/icons/masinfo.svg';
  // -----------------------------


      // --- Renderizado ---
    const headerIconSize = 60; // Tamaño iconos header superior
    const gridIconSize = 90;  // Tamaño iconos cuadrícula
    const gridPaddingHorizontal = 15;



  // Tipo Props (sin cambios)
  type PromoScreenProps = BottomTabScreenProps<MainAppTabParamList, 'PromosTab'>;

  // Componente PromoScreen
  const PromoScreen: React.FC<PromoScreenProps> = ({ navigation }) => {
    // --- Estados (sin cambios) ---
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false); // Empezar sin cargar, usar useFocusEffect
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false); // Para pull-to-refresh
    const [error, setError] = useState<string | null>(null);

    // --- Obtiene datos del Contexto ---
    const { userEmail, isAuthenticated } = useAuth(); // Necesitamos userEmail y saber si está autenticado
    interface TopHeaderButtonData {
      id: keyof MainStackParamList;
      title: string;
      iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  }

  // --- Datos ---
  const topHeaderButtons: TopHeaderButtonData[] = [
      { id: 'Promo', title: 'Promociones',  iconComponent: PromoIcon },
      { id: 'Calendar', title: 'Inicio',  iconComponent: homeIcon },

  ];

    // --- Carga de Datos (Ahora usa userEmail) ---
    const loadPromotions = useCallback(async (isRefresh = false) => {
      // No cargar si no está autenticado o no hay email
      if (!isAuthenticated || !userEmail) {
          console.log("PromoScreen: User not authenticated or email missing, skipping fetch.");
          setPromotions([]); // Limpia promociones si no está autenticado
          setIsLoading(false);
          setIsRefreshing(false);
          return;
      }

      // Evita cargas múltiples si no es refresh
      if (isLoading && !isRefresh) return;

      console.log(isRefresh ? "Refreshing promotions..." : "Loading promotions...");
      if (!isRefresh) setIsLoading(true); // Indicador principal solo al inicio
      else setIsRefreshing(true); // Indicador de refresh
      setError(null);

      try {
        // Llama a la API pasando el userEmail del contexto
        const data = await getPromotionsApi(userEmail);
        setPromotions(data);
      } catch (err: any) {
        console.error("Error fetching promotions:", err);
        setError(err.message || "No se pudieron cargar las promociones.");
        // No limpiar datos si falla el refresh
        // if (!isRefresh) setPromotions([]);
      } finally {
        if (!isRefresh) setIsLoading(false);
        setIsRefreshing(false);
      }
    }, [isAuthenticated, userEmail, isLoading]); // Dependencias

    // Carga datos cuando la pantalla obtiene el foco (si está autenticado)
    useEffect(() => {
        if (isAuthenticated && userEmail) {
            loadPromotions(!promotions.length); // Mostrar loader solo la primera vez que carga
        } else {
            // Limpiar si el usuario cierra sesión mientras ve la pantalla
            setPromotions([]);
        }
    }, [isAuthenticated, userEmail, loadPromotions]); // Depende del estado de autenticación

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);

    const handlePromoPress = (promo: Promotion) => {
      console.log("Promo pressed:", promo.id, promo.nombre);
        setSelectedPromo(promo);
        setIsModalVisible(true);
    };

    // --- Renderizado de cada Tarjeta ---
    const renderPromoItem = ({ item }: { item: Promotion }) => (
      <TouchableOpacity
          style={styles.card}
          onPress={() => handlePromoPress(item)}
          activeOpacity={0.8}
      >
        <Image
          source={{ uri: 'https://aseip.es/images/promo/'+ item.imagen}} // Carga desde URL
          style={styles.cardImage}
          resizeMode="cover"
          // Considera añadir un indicador de carga o imagen por defecto para cada imagen
        />
        <View style={styles.cardContent}>        
          <Text style={styles.cardTitle} numberOfLines={2}>{item.nombre}</Text>
          <Text style={styles.cardExpiry}>Válido hasta {item.fin}</Text>
        </View>
      </TouchableOpacity>
    );

    // --- Renderizado Principal ---
    // Muestra indicador solo en la carga inicial
    if (isLoading && promotions.length === 0) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0033A0" />
          <Text style={styles.loadingText}>Cargando Promociones...</Text>
        </View>
      );
    }

    // Muestra error si ocurrió y no hay datos previos
    if (error && promotions.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => loadPromotions()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Muestra la lista (o el estado vacío si no hay promociones)
    return (
      <>
      <View style={styles.safeArea}>
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
      <FlatList
        data={promotions}
        renderItem={renderPromoItem}
        keyExtractor={(item) => item.image.toString()}
        numColumns={2} // Cuadrícula de 2 columnas
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={ // Se muestra si 'promotions' está vacío después de cargar
          <View style={styles.centered}>
              <Text style={styles.emptyText}>No hay promociones disponibles.</Text>
          </View>
        }
        // Pull-to-refresh
        onRefresh={() => loadPromotions(true)} // Llama a loadPromotions indicando que es un refresh
        refreshing={isLoading} // Muestra el indicador de carga durante el refresh
      />
    </View>
    {selectedPromo && (
    <Modal
      transparent
      animationType="slide"
      visible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Promoción</Text>
          <Text style={styles.modalText}>Has pulsado: {selectedPromo.nombre}</Text>
          <Text style={styles.modalTextSmall}>(Navegación a detalle pendiente)</Text>
          <View style={styles.buttonContent}>
          <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalButton}>
              <View style={styles.buttonContent}>
                <VolverIcon width={30} height={30} />
                <Text style={styles.modalButtonText}>Volver</Text>
              </View>
          </TouchableOpacity>
             <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.modalButton}>
            <MasInfoIcon width={80} height={80} />
          </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )}

    </>
    );
  };

  /* ==========================================================================
    Estilos (Revisados y ajustados)
    ========================================================================== */
  const { width } = Dimensions.get('window');
  const numColumns = 2;
  const gap = 15; // Espacio entre tarjetas y con los bordes
  const totalHorizontalGap = gap * (numColumns + 3); // Espacio total ocupado por márgenes horizontales
  const availableWidth = width - totalHorizontalGap;
  const itemWidth = availableWidth / numColumns;

  const styles = StyleSheet.create({
    
      safeArea: {
      flex: 1,
      backgroundColor: '#3f4c53', // Fondo oscuro general
    },
    centered: {
      flex: 1, // Ocupa todo el espacio disponible si la lista está vacía
      height: Dimensions.get('window').height * 0.7, // Ocupa una buena parte de la pantalla
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: { marginTop: 10, color: '#555', fontSize: 16, },
    errorText: { color: '#D8000C', textAlign: 'center', marginBottom: 15, fontSize: 16, },
    retryButton: { backgroundColor: '#0033A0', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginTop: 10, },
    retryButtonText: { color: '#FFFFFF', fontSize: 16, },
    emptyText: { fontSize: 16, color: '#888', textAlign: 'center', },
    listContainer: {
      paddingHorizontal: gap / 2, // Padding lateral consistente con el gap
      paddingVertical: gap, // Padding vertical
      backgroundColor: '#F0F2F5', // Fondo de la lista
      marginHorizontal: 15,
      borderRadius: 20,
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

    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      marginHorizontal: gap / 2, // Espacio lateral desde el padding del container
      marginBottom: gap, // Espacio vertical entre filas
      width: itemWidth, // Ancho calculado
      overflow: 'hidden',
      // Sombra
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    cardImage: {
      width: '100%',
      // Altura basada en una relación de aspecto (ej. 4:3 o 16:9)
      aspectRatio: 4 / 3,
      backgroundColor: '#EAEAEA', // Placeholder mientras carga
    },
    cardContent: {
      padding: 12, // Padding interno para el texto
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#333',
      marginBottom: 5,
      // Permitir hasta 2 líneas, pero no forzar altura fija
      // minHeight: 34,
    },
    cardExpiry: {
      fontSize: 12,
      color: '#777',
    },

    // MODAL ESTILOS
    modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
modalContainer: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
  width: '80%',
  alignItems: 'center',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},
modalText: {
  fontSize: 16,
  marginBottom: 10,
  textAlign: 'center',
},
modalTextSmall: {
  fontSize: 14,
  color: '#555',
  marginBottom: 20,
  textAlign: 'center',
},
modalButton: {
  paddingVertical: 10,
  paddingHorizontal: 20,
},
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5, // solo si tu versión de React Native lo permite
  },
modalButtonText: {
  fontSize: 16,
},

  });

  export default PromoScreen;