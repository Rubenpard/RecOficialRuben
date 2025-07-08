// src/screens/FormationDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStackNavigator'; // Tipos del Stack
import type { Formacion } from '../types/formacion'; // Tipo de datos
import VolverIcon from '../assets/icons/volver.svg'; 
import homeIcon from '../assets/icons/home.svg';
import CalendarioIcon from '../assets/icons/calendario.svg';
import CalendarioCard from '../assets/icons/CalendarioCards.svg';

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



    // --- Renderizado ---
  const headerIconSize = 60; // Tamaño iconos header superior
  const gridIconSize = 90;  // Tamaño iconos cuadrícula
  const gridPaddingHorizontal = 20;

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
       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF"/>
       {/* El header lo provee MainStackNavigator ahora */}
       <ScrollView contentContainerStyle={styles.scrollContainer}>
        
            <View style={styles.card}>
                <TouchableOpacity style={styles.sectionHeader} activeOpacity={0.7}>
                    <View style={styles.headerLeft}>
                  <View style={{ padding: 3 }}>
                    <CalendarioCard width={50} height={50}  fill="#0033A0" />
                  </View>
                    {/* <Ionicons name={iconName} size={24} color="#0033A0" style={styles.headerIcon} /> */}
                    <Text style={styles.sectionTitle}>Próximas convocatorias</Text>
                  </View>
                </TouchableOpacity>
                 <Text style={styles.noDataText}>Datos no encontrados</Text>               
                {/* Usamos el helper para mostrar cada campo */}
                <DetailRow label="Título" value={formationData.titulo} />
                <DetailRow label="Ciudad" value={formationData.ciudad} />
                <DetailRow label="Docente" value={formationData.docente} />
                <DetailRow label="Horario" value={formationData.numdias} />
                <DetailRow label="Fecha" value={formationData.fecha} />
                <DetailRow label="Centro" value={formationData.centro} />
                {/* Añade más campos si es necesario */}
                     {/* Botón Volver (opcional, ya que el header tiene flecha) */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                {/* <Ionicons name="arrow-back-circle" size={40} color="#0033A0"/> */}
                <VolverIcon width={40} height={40} fill="#0033A0" />
                <Text style={styles.backButtonText}>Volve</Text>
            </TouchableOpacity>
            </View>

       
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
    backgroundColor: '#3f4c53', // Fondo gris claro
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
      noDataText: { 
      fontSize: 15, 
      color: '#888', 
      textAlign: 'center', 
      paddingVertical: 20, 
      fontStyle: 'italic',
      borderBottomWidth: 1,   
      borderBottomColor: '#222', 
      marginBottom: 20, // Espacio antes del botón volver
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