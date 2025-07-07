import { StyleSheet } from 'react-native';
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