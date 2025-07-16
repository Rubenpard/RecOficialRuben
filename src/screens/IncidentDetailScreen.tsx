// src/screens/IncidentDetailScreen.tsx
import React, { useState, useCallback, useLayoutEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert, SafeAreaView, LayoutAnimation,
  Platform, UIManager, StatusBar, Modal, TextInput
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStackNavigator'; // Asegúrate de importar MainStackParamList
import type { AsistenciaListItem, AsistenciaSeguimiento } from '../types/asistencia';

import VolverIcon from '../assets/icons/volver.svg';
import RefreshIcon from '../assets/icons/refresh.svg';
import CerrarIcon from '../assets/icons/cerrar.svg';

import AbiertasIcon from '../assets/icons/abiertas.svg';
import CerradasIcon from '../assets/icons/cerradas.svg';
import GlobalesIcon from '../assets/icons/globales.svg'; // Importa GlobalesIcon
import HomeIcon from '../assets/icons/home.svg';
import CheckIcon from '../assets/icons/check.svg'

const gridPaddingVertical = 15;
const gridPaddingHorizontal = 15;
const headerIconSize = 60;
const gridIconSize = 90;

// La interfaz TopHeaderButtonData ya no es estrictamente necesaria para el primer botón,
// ya que será dinámico. La mantenemos por si el HomeIcon sigue usándola.
interface TopHeaderButtonData {
  id: keyof MainStackParamList;
  title: string;
  iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

// Este array solo necesita el botón 'Inicio' ahora, el primero será dinámico
// Se eliminó la definición de topHeaderButtons estática de aquí ya que el primer botón es dinámico.

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Actualiza el tipo de las props de la pantalla para recibir 'incident' y 'cameFromType'
type IncidentDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'IncidentDetail'>;



const IncidentDetailScreen: React.FC<IncidentDetailScreenProps> = ({ route, navigation }) => {
  // Ahora recibimos el objeto 'incident' completo y 'cameFromType'
  const { incident, cameFromType } = route.params; //
  const [isExpanded, setIsExpanded] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [responseText, setResponseText] = useState('');

   const isClosed = incident.estado !== 0;
const parentListName = isClosed ? 'Cerradas' : 'Abiertas';

const buttonsVisibility = {
  Abiertas: { showVolver: true, showResponder: true, showCerrar: true, showReabrir: false },
  Cerradas: { showVolver: true, showResponder: false, showCerrar: false,showReabrir: true },
  Globales: { showVolver: true, showResponder: true, showCerrar: false, showReabrir: true },
  Expres: { showVolver: true, showResponder: false, showCerrar: true,showReabrir: true },
};

const { showVolver, showResponder, showCerrar, showReabrir } =
  buttonsVisibility[parentListName] || {
    showVolver: true,
    showResponder: true,
    showCerrar: true,
    showReabrir: true,
  };


  if (!incident || typeof incident !== 'object') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.centered}>
          <Text style={styles.errorText}>Error: Datos inválidos.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <VolverIcon width={50} height={50} />
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- Lógica para el encabezado dinámico ---
  let HeaderIconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  let headerTitle: string;
  // La pantalla a la que volverás (en este caso, 'IncidentList' para todas las listas)
  let navigateBackScreen: 'IncidentList' = 'IncidentList'; 

  switch (cameFromType) { //
    case 'Abiertas':
      HeaderIconComponent = AbiertasIcon;
      headerTitle = 'Abiertas';
      break;
    case 'Cerradas':
      HeaderIconComponent = CerradasIcon;
      headerTitle = 'Cerradas';
      break;
    case 'Globales':
      HeaderIconComponent = GlobalesIcon;
      headerTitle = 'Globales';
      break;
    case 'Expres': // Si también tienes un tipo 'Expres' que navega aquí
      HeaderIconComponent = AbiertasIcon; // O un icono específico para 'Expres'
      headerTitle = 'Expres';
      break;
    default:
      // Fallback si cameFromType no es reconocido (o no se proporciona)
      HeaderIconComponent = HomeIcon; // O un icono genérico
      headerTitle = 'Detalle';
      // Considera a dónde ir si cameFromType es nulo/inválido
      // navigation.goBack() podría ser una alternativa aquí si no hay una lista específica.
      break;
  }
  // --- Fin lógica encabezado dinámico ---

  // Ocultar el header por defecto del Stack Navigator
  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(prev => !prev);
  };

  const handleOpenLink = async (url: string | undefined | null) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert("Error", `No se puede abrir URL: ${url}`);
    } catch {
      Alert.alert("Error", "Error al abrir enlace.");
    }
  };

  const renderDetailSection = (title: string, content: string | null | undefined, linkUrl?: string | null) => {
    // Permitir mostrar "Sin archivo adjunto" incluso si content y linkUrl son nulos
    if (!content && !linkUrl && title !== 'Archivo Adjunto') return null; 
    return (
      <View style={styles.detailSection}>
        <Text style={styles.detailTitle}>{title}</Text>
        {content && <Text style={styles.detailContent}>{content}</Text>}
        {linkUrl && (
          <TouchableOpacity onPress={() => handleOpenLink(linkUrl)} style={styles.linkButton}>
            <Ionicons name={title === 'Archivo Adjunto' ? "attach-outline" : "volume-medium-outline"} size={18} color="#0056b3" />
            <Text style={styles.linkText}> {title === 'Archivo Adjunto' ? 'Ver Archivo' : 'Escuchar Audio'}</Text>
          </TouchableOpacity>
        )}
        {title === 'Archivo Adjunto' && !linkUrl && <Text style={styles.noAttachmentText}>Sin archivo adjunto</Text>}
      </View>
    );
  };

  const cardTitle = incident.marca && incident.modelo ? `${incident.marca} ${incident.modelo}` : incident.vehiculo?.trim() || incident.titulo || 'Incidencia';
  const cardSubtitle = incident.titulo === cardTitle ? (incident.sintomas || '') : (incident.titulo || '');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.topHeaderContainer}>
        {/* Botón Dinámico: Vuelve a la lista de origen */}
        <TouchableOpacity
          style={[styles.topHeaderButton, styles.firstButton]}
          onPress={() => navigation.navigate(navigateBackScreen, { type: cameFromType })} //
          activeOpacity={0.7}
        >
          <HeaderIconComponent width={headerIconSize} height={headerIconSize} fill={'#2c4391'} />
          <Text style={[styles.topHeaderText, { color: '#000000' }]}>{headerTitle}</Text>
        </TouchableOpacity>

        {/* Botón Estático: Inicio */}
        <TouchableOpacity
          key="Home" // Asegura una key única si no se mapea un array
          style={[
            styles.topHeaderButton,
            styles.lastButton // Asumiendo que es el último (y único) botón estático
          ]}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.7}
        >
          <HomeIcon width={headerIconSize} height={headerIconSize} fill={'#ffffff'} />
          <Text style={[styles.topHeaderText, { color: '#ffffff' }]}>Inicio</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.mainCard} onPress={toggleExpand} activeOpacity={0.9}>
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle} numberOfLines={1}>{cardTitle}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>{cardSubtitle}</Text>
              </View>
              <Text style={styles.cardIconText}>-</Text>
            </View>
            {isExpanded && (
              <View style={styles.cardDetails}>
                <Text>Datos de Incidencia</Text>
                <View style={styles.detailSubSection}>
                  <Text style={styles.detailSubTitle}>Vehículo</Text>
                  <Text style={styles.detailText}><Text style={styles.detailLabel}>Marca:</Text> {incident.marca || ''}</Text>
                  <Text style={styles.detailText}><Text style={styles.detailLabel}>Potencia:</Text> {incident.potencia || ''}</Text>
                  <Text style={styles.detailText}><Text style={styles.detailLabel}>Sistema:</Text> {incident.sistema || ''}</Text>
                  <Text style={styles.detailText}><Text style={styles.detailLabel}>Modelo:</Text> {incident.modelo || ''}</Text>
                  <Text style={styles.detailText}><Text style={styles.detailLabel}>Creacion:</Text> {incident.creacionAsistencia || ''}</Text>
                  <Text style={styles.detailText}><Text style={styles.detailLabel}>Código Motor:</Text> {incident.codigomotor || ''}</Text>
                </View>
                {renderDetailSection("Título de la Incidencia", incident.titulo)}
                {renderDetailSection("Síntomas", incident.sintomas)}
                {Array.isArray(incident.asistenciaSeguimientos) && incident.asistenciaSeguimientos.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailTitle}>Seguimiento</Text>
                    {incident.asistenciaSeguimientos.map((item, index) => (
                      <View key={`seg-${item.id || index}`} style={styles.commentBox}>
                        {item.fechacomentario && <Text style={styles.detailDate}>({item.fechacomentario})</Text>}
                        {item.comentario ? <Text style={styles.detailContent}>{item.comentario}</Text> : <Text style={styles.noDataText}>(Sin comentario)</Text>}
                        {item.solucion && <Text style={styles.detailSolution}><Text style={styles.detailLabel}>Solución:</Text> {item.solucion}</Text>}
                      </View>
                    ))}
                  </View>
                )}
                {renderDetailSection("Archivo Adjunto", null, incident.archivo || incident.documentacion)}
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.contentButtoms}>
            {showVolver && (
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <VolverIcon width={50} height={50} />
              <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
              )}
             {showResponder && (
            <TouchableOpacity style={styles.backButton} onPress={() => setModalVisible(true)} activeOpacity={0.7}>
              <RefreshIcon width={50} height={50} />
              <Text style={styles.backButtonText}>Responder</Text>
            </TouchableOpacity>
               )}

            {showCerrar && (
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <CerrarIcon width={50} height={50} />
              <Text style={styles.backButtonText}>Cerrar</Text>
            </TouchableOpacity>         
            )}
              {showReabrir && (
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <CerrarIcon width={50} height={50} />
              <Text style={styles.backButtonText}>Reabrir Incidencia</Text>
            </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal de Respuesta */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
                <View style={styles.cardContent}>
                    <Text style={styles.modalTitle}>{cardTitle}</Text>
                    <TextInput
                    style={styles.modalInput}
                    placeholder="Escribe tu respuesta..."
                    value={responseText}
                    onChangeText={setResponseText}
                    multiline
                    />
             </View>
                    <View style={styles.modalButtons}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                            <VolverIcon width={50} height={50} />
                            <Text style={styles.modalCloseButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { setModalVisible(false); Alert.alert("Respuesta enviada", responseText); }}
                        style={styles.modalSubmitButton}
                        >
                            <Text style={styles.modalSubmitButtonText}>Responder</Text>
                             <CheckIcon width={60} height={60} />
                        </TouchableOpacity>
                    </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};



const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#3f4c53',
        marginTop: 40,
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
    marginTop: 20,
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
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: 'red', textAlign: 'center'},
    // --- Header Personalizado (Igual que en IncidentListScreen) ---
    customHeaderContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 5, paddingVertical: 8, margin: 10, borderRadius: 25, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
    customHeaderButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 20, backgroundColor: '#E9ECEF', },
    customHeaderButtonActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 1.5, },
    customHeaderText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold', color: '#6C757D', },
    customHeaderTextActive: { color: '#0033A0', },
    // --- Contenido Principal ---
    scrollContainer: { paddingHorizontal: 15, paddingVertical: 10, paddingBottom: 80 }, // Espacio para botón volver
        card: { 
      backgroundColor: '#ffffff',
      borderRadius: 20,
      padding: 20,
      borderTopLeftRadius: 0,
      borderTopEndRadius: 0,
      borderWidth: 5,
      borderTopWidth: 0,
      borderColor: '#ffffff',
    },

    mainCard: {
        backgroundColor: '#ededed',
        padding: 20,
        marginBottom: 20,
        borderRadius: 20,
        borderTopEndRadius: 0,
        borderTopLeftRadius: 0,
        marginTop: -20,
        overflow: 'hidden', // Importante para la animación
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        // borderBottomWidth: 1, // Separador opcional si no está expandido
        // borderBottomColor: '#EAEAEA',
    },
    cardHeaderText: {
        flex: 1, // Ocupa espacio
        marginRight: 10,
        justifyContent: 'center',
    },

    cardIconText:{
      padding: 20,
       fontSize: 50,
       fontWeight: 800,
       color: '#0132ab',
    },
    cardTitle: { fontSize: 17, fontWeight: 'bold', color: '#212529', marginBottom: 2, },
    cardSubtitle: { fontSize: 14, color: '#495057', },
    cardDetails: {
        paddingHorizontal: 15,
        paddingTop: 0, // Sin padding superior extra
        paddingBottom: 15,
        borderTopWidth: 1, // Separador cuando está expandido
        borderTopColor: '#EAEAEA',
    },
    detailSection: {
        marginTop: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0', // Separador más sutil entre secciones
    },
    detailSubSection: { // Para 'Vehículo'
        marginTop: 10,
        marginBottom: 10,
    },
    detailTitle: { fontSize: 14, fontWeight: 'bold', color: '#0056b3', marginBottom: 8, },
    detailSubTitle: { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 8, },
    detailContent: { fontSize: 15, color: '#333', lineHeight: 22, },
    detailText: { fontSize: 15, color: '#333', lineHeight: 21, marginBottom: 3, },
    detailLabel: { fontWeight: '600', color: '#555', },
    detailDate: { fontSize: 12, color: '#888', marginBottom: 4, fontStyle: 'italic'},
    linkButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingVertical: 4, },
    linkText: { color: '#0056b3', fontSize: 15, marginLeft: 6, textDecorationLine: 'underline', },
    noAttachmentText: { color: '#D32F2F', fontStyle: 'italic', fontSize: 15, },
    
    contentButtoms:{
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    // --- Botón Volver ---
    backButton: {
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'flex-start', // Alineado a la izquierda
        marginTop: 10, // Espacio después de la tarjeta
        paddingHorizontal: 10, // Padding para área de toque
        paddingVertical: 5,
    },

    // MODAL

    backButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0033A0',
        marginLeft: 5,
    },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
},
  modalContainer: {
      backgroundColor: 'white',
      borderRadius: 20,
      borderTopLeftRadius: 0,
      borderTopEndRadius: 0,
      padding: 20,
      margin: 1,
  },

      cardContent: { 
      backgroundColor: '#ededed',
      marginTop: -20,
      borderRadius: 20,
      borderTopLeftRadius: 0,
      borderTopEndRadius: 0,
    },

  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
    marginTop: 20,
  },
  modalInput: {
    borderRadius: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
    backgroundColor: '#ffffff',
    margin: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCloseButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 6,
  },
  modalCloseButtonText: {
  alignSelf: 'center',
  padding: 5,
  fontSize: 16,
  },
  modalSubmitButton: {
    flexDirection:'row',
    padding: 10,
    borderRadius: 6,
  },
  modalSubmitButtonText: {
      alignSelf: 'center',
      fontSize: 16,
       padding: 5,
  },
});

export default IncidentDetailScreen;