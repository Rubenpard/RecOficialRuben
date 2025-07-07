// src/screens/FormationDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStackNavigator'; // Tipos del Stack
import type { Formacion } from '../types/formacion'; // Tipo de datos

// Tipo Props (recibe formationData)
type FormationDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'FormationDetail'>;

/* ==========================================================================
   Componente Helper para Renderizar Filas de Detalle
   ========================================================================== */
const DetailRow: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => {
    if (!value) return null; // No renderizar si no hay valor
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}:</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    );
};

/* ==========================================================================
   Componente FormationDetailScreen
   ========================================================================== */
const FormationDetailScreen: React.FC<FormationDetailScreenProps> = ({ route, navigation }) => {
  // Obtiene el objeto Formacion de los parámetros de ruta
  const { formationData } = route.params;

  // Comprobación inicial por si acaso
  if (!formationData) {
    return (
      <SafeAreaView style={styles.containerCentered}>
        <Text style={styles.errorText}>Error: No se recibieron datos de la formación.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-circle" size={40} color="#0033A0"/>
            <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF"/>
       {/* El header lo provee MainStackNavigator ahora */}
       <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.card}>
                {/* Usamos el helper para mostrar cada campo */}
                <DetailRow label="Título" value={formationData.titulo} />
                <DetailRow label="Ciudad" value={formationData.ciudad} />
                <DetailRow label="Docente" value={formationData.docente} />
                <DetailRow label="Horario" value={formationData.numdias} />
                <DetailRow label="Fecha" value={formationData.fecha} />
                <DetailRow label="Centro" value={formationData.centro} />
                {/* Añade más campos si es necesario */}
            </View>

            {/* Botón Volver (opcional, ya que el header tiene flecha) */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Ionicons name="arrow-back-circle" size={40} color="#0033A0"/>
                <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
       </ScrollView>
    </SafeAreaView>
  );
};

/* ==========================================================================
   Estilos
   ========================================================================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F2F5', // Fondo gris claro
  },
  containerCentered: { // Para estado de error
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F0F2F5',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40, // Espacio al final
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.00,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row', // Etiqueta y valor en la misma fila (opcional)
    marginBottom: 12, // Espacio entre filas
    paddingBottom: 12, // Espacio antes de la línea
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', // Separador sutil
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0033A0', // Azul
    marginRight: 8, // Espacio entre etiqueta y valor
    // width: 100, // Ancho fijo opcional para alinear valores
  },
  detailValue: {
    flex: 1, // Ocupa el resto del espacio
    fontSize: 15,
    color: '#333',
    lineHeight: 21, // Espaciado de línea
  },
  errorText: {
    color: '#D8000C',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start', // A la izquierda
    marginTop: 10,
    padding: 5,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0033A0',
    marginLeft: 5,
  },
});

export default FormationDetailScreen;