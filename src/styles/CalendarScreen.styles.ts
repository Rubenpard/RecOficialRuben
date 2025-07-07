import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F0F2F5',
    },
    scrollContent: {
      padding: 15,
      paddingBottom: 30, // Espacio extra al final
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      marginTop: 10,
      color: '#555',
      fontSize: 16,
    },
    errorText: {
      color: '#D8000C',
      textAlign: 'center',
      marginBottom: 15,
      fontSize: 16,
    },
    retryButton: {
        backgroundColor: '#0033A0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 10,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    // --- Estilos de Sección ---
    sectionContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      marginBottom: 15,
      overflow: 'hidden', // Para que el borde redondeado recorte el contenido
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.00,
      elevation: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0', // Separador muy sutil
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerIcon: {
      marginRight: 12, // Espacio entre icono y texto
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '600', // Semi-bold
      color: '#333',
    },
    sectionContent: {
      paddingHorizontal: 15,
      paddingTop: 10,
      paddingBottom: 5, // Menos padding abajo
    },
    eventItem: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#F5F5F5', // Separador aún más sutil
    },
    eventTitle: {
      fontSize: 15,
      color: '#444',
      marginBottom: 3,
    },
    eventDate: {
      fontSize: 13,
      color: '#888',
    },
    noDataText: {
      fontSize: 15,
      color: '#888',
      textAlign: 'center',
      paddingVertical: 15,
      fontStyle: 'italic',
    },
  });