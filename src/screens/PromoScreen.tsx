// src/screens/PromoScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Image, Dimensions, Alert, RefreshControl
} from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { MainAppTabParamList } from '../navigation/MainAppNavigator';
// --- Importaciones Necesarias ---
import { useAuth } from '../context/AuthContext'; // Hook para obtener userEmail
import { getPromotionsApi } from '../api/promoService'; // Nueva función API
import type { Promotion } from '../types/promotion'; // O donde tengas el tipo Promotion
// -----------------------------

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


  const handlePromoPress = (promo: Promotion) => {
    console.log("Promo pressed:", promo.id, promo.nombre);
    Alert.alert("Promoción", `Has pulsado: ${promo.nombre}\n(Navegación a detalle pendiente)`);
    // navigation.navigate('PromoDetail', { promoId: promo.id }); // Futura navegación
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
  );
};

/* ==========================================================================
   Estilos (Revisados y ajustados)
   ========================================================================== */
const { width } = Dimensions.get('window');
const numColumns = 2;
const gap = 12; // Espacio entre tarjetas y con los bordes
const totalHorizontalGap = gap * (numColumns + 1); // Espacio total ocupado por márgenes horizontales
const availableWidth = width - totalHorizontalGap;
const itemWidth = availableWidth / numColumns;

const styles = StyleSheet.create({
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
});

export default PromoScreen;