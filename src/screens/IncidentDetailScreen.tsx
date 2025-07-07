// src/screens/IncidentDetailScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Linking, Alert, SafeAreaView, LayoutAnimation,
  Platform, UIManager, StatusBar
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStackNavigator';
import type { AsistenciaListItem, AsistenciaSeguimiento } from '../types/asistencia';

// --- Importa Iconos SVG para el Header ---
import AbiertasIcon from '../assets/icons/abiertas.svg';
import CerradasIcon from '../assets/icons/cerradas.svg';
import GlobalesIcon from '../assets/icons/globales.svg';
import HomeIcon from '../assets/icons/home.svg';
// --- ---

// Habilita LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) { UIManager.setLayoutAnimationEnabledExperimental(true); }

// Tipo Props
type IncidentDetailScreenProps = NativeStackScreenProps<MainStackParamList, 'IncidentDetail'>;

/* ==========================================================================
   Componente IncidentDetailScreen (SIN Carga API)
   ========================================================================== */
const IncidentDetailScreen: React.FC<IncidentDetailScreenProps> = ({ route, navigation }) => {
  const { incident } = route.params; // Obtiene el objeto directamente

  const [isExpanded, setIsExpanded] = useState<boolean>(true); // Estado para desplegar

  // Comprobación inicial
  if (!incident || typeof incident !== 'object') {
    return ( <SafeAreaView style={styles.safeArea}><StatusBar barStyle="dark-content" backgroundColor="#FFFFFF"/><View style={styles.centered}><Text style={styles.errorText}>Error: Datos inválidos.</Text><TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><Ionicons name="arrow-back-circle" size={40} color="#0033A0"/><Text style={styles.backButtonText}>Volver</Text></TouchableOpacity></View></SafeAreaView> );
  }

  // Lógica para Header (simplificada)
  const isClosed = incident.estado !== 0;
  const parentListName = isClosed ? 'Cerradas' : 'Abiertas'; // Ajusta si viene de Globales
  const ParentIcon = isClosed ? CerradasIcon : AbiertasIcon;

  // Manejadores
  const toggleExpand = () => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setIsExpanded(prev => !prev); };
  const handleOpenLink = async (url: string | undefined | null) => { if (!url) return; try { const supported = await Linking.canOpenURL(url); if (supported) await Linking.openURL(url); else Alert.alert("Error", `No se puede abrir URL: ${url}`); } catch (e) { Alert.alert("Error", "Error al abrir enlace."); }};

  // Renderizado Interno
  const renderCustomHeader = () => ( <View style={styles.customHeaderContainer}><View style={[styles.customHeaderButton, styles.customHeaderButtonActive]}><ParentIcon width={28} height={28} fill="#0033A0" /><Text style={[styles.customHeaderText, styles.customHeaderTextActive]}>{parentListName}</Text></View><TouchableOpacity style={styles.customHeaderButton} onPress={() => navigation.navigate('Home')}><HomeIcon width={28} height={28} fill="#6C757D" /><Text style={styles.customHeaderText}>Inicio</Text></TouchableOpacity></View> );
  const renderDetailSection = (title: string, content: string | null | undefined, linkUrl?: string | null) => { if (!content && !linkUrl) return null; return ( <View style={styles.detailSection}><Text style={styles.detailTitle}>{title}</Text> {content && <Text style={styles.detailContent}>{content}</Text>} {linkUrl && ( <TouchableOpacity onPress={() => handleOpenLink(linkUrl)} style={styles.linkButton}><Ionicons name={title === 'Archivo Adjunto' ? "attach-outline" : "volume-medium-outline"} size={18} color="#0056b3" /> <Text style={styles.linkText}> {title === 'Archivo Adjunto' ? 'Ver Archivo' : 'Escuchar Audio'}</Text> </TouchableOpacity> )} {title === 'Archivo Adjunto' && !linkUrl && <Text style={styles.noAttachmentText}>Sin archivo adjunto</Text>} </View> ); };

  // Datos para la tarjeta
  const cardTitle = incident.marca && incident.modelo ? `${incident.marca} ${incident.modelo}` : incident.vehiculo?.trim() || incident.titulo || 'Detalle';
  const cardSubtitle = incident.titulo === cardTitle ? (incident.sintomas || '') : (incident.titulo || '');

  // --- Renderizado Principal ---
  return (
    <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF"/>
        {renderCustomHeader()}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <TouchableOpacity style={styles.mainCard} onPress={toggleExpand} activeOpacity={0.9}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderText}><Text style={styles.cardTitle}>{cardTitle}</Text><Text style={styles.cardSubtitle}>{cardSubtitle}</Text></View>
                    <Ionicons name={isExpanded ? "remove-circle-outline" : "add-circle-outline"} size={28} color="#0056b3" />
                </View>
                {isExpanded && (
                    <View style={styles.cardDetails}>
                        {/* --- Renderiza detalles usando 'incident' --- */}
                        <View style={styles.detailSubSection}>
                            <Text style={styles.detailSubTitle}>Vehículo</Text>
                            {/* Usa optional chaining por seguridad */}
                            <Text style={styles.detailText}><Text style={styles.detailLabel}>Marca:</Text> {incident.marca || ''}</Text>
                            <Text style={styles.detailText}><Text style={styles.detailLabel}>Potencia:</Text> {incident.potencia || ''}</Text>
                            <Text style={styles.detailText}><Text style={styles.detailLabel}>Sistema:</Text> {incident.sistema || ''}</Text>
                            <Text style={styles.detailText}><Text style={styles.detailLabel}>Modelo:</Text> {incident.modelo || ''}</Text>
                            <Text style={styles.detailText}><Text style={styles.detailLabel}>Creacion:</Text> {incident.creacionAsistencia || ''}</Text> {/* Ajustado a fecha asistencia */}
                            <Text style={styles.detailText}><Text style={styles.detailLabel}>Código Motor:</Text> {incident.codigomotor || ''}</Text>
                        </View>
                        {renderDetailSection("Título de la Incidencia", incident.titulo)}
                        {renderDetailSection("Síntomas", incident.sintomas)}
                        {/* Muestra seguimientos */}
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
                         {/* Archivo Adjunto (Prioriza 'archivo' sobre 'documentacion') */}
                         {renderDetailSection("Archivo Adjunto", null, incident.archivo || incident.documentacion)}
                    </View>
                )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Ionicons name="arrow-back-circle" size={40} color="#0033A0"/> <Text style={styles.backButtonText}>Volver</Text>
            </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#DDE2E7' /* Fondo gris oscuro */ },
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
    mainCard: {
        backgroundColor: '#F8F9FA', // Gris más claro que el fondo
        borderRadius: 15,
        marginBottom: 20,
        overflow: 'hidden', // Importante para la animación
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 1, // Sombra sutil
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
    // --- Botón Volver ---
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start', // Alineado a la izquierda
        marginTop: 10, // Espacio después de la tarjeta
        paddingHorizontal: 10, // Padding para área de toque
        paddingVertical: 5,
    },
    backButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0033A0',
        marginLeft: 5,
    }
});

export default IncidentDetailScreen;