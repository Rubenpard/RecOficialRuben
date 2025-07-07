// src/screens/IncidentCreation/MediaScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Alert, Platform, PermissionsAndroid, StatusBar, ActivityIndicator,SafeAreaView,
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { IncidentCreationStackParamList } from '../../navigation/IncidentCreationStackNavigator';
import { useIncidentCreation } from '../../context/IncidentCreationContext';
import { useAuth } from '../../context/AuthContext'; // Ajusta ruta (una carpeta arriba desde /src/screens/IncidentCreation)
import uuid from 'react-native-uuid';
import RNFS from 'react-native-fs';
import { createIncidentExpressApi } from '../../api/incidenciasService'; // Ajusta ruta

// --- Importa Iconos SVG para el Header ---
import ExpresIcon from '../../assets/icons/expres.svg'; // Ajusta ruta
import HomeIcon from '../../assets/icons/home.svg';     // Ajusta ruta
// --- ---

type MediaScreenProps = NativeStackScreenProps<IncidentCreationStackParamList, 'IncidentMedia'>;

const MediaScreen: React.FC<MediaScreenProps> = ({ navigation }) => {
  const { incidentData, updateField, clearData } = useIncidentCreation();
  const { userId } = useAuth();
  const { mediaAsset } = incidentData; // Asset de ESTA pantalla

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- Permisos (Funciones completas) ---
  const requestCameraPermission = useCallback(async (): Promise<boolean> => { if (Platform.OS !== 'android') return true; try { const g = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {title:"Permiso Cámara",message:"Acceso para foto/video.",buttonPositive:"OK"}); return g === PermissionsAndroid.RESULTS.GRANTED; } catch (e) { return false; } }, []);
  const requestStoragePermission = useCallback(async (): Promise<boolean> => { if (Platform.OS !== 'android') return true; try { const p = Platform.Version >= 33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE; const g = await PermissionsAndroid.request(p, {title:"Permiso Galería",message:"Acceso para seleccionar media.",buttonPositive:"OK"}); return g === PermissionsAndroid.RESULTS.GRANTED; } catch (e) { return false; } }, []);

  // --- Manejadores Media (Actualizan 'mediaAsset' en contexto) ---
  const handleTakeMedia = useCallback(async () => { const p = await requestCameraPermission(); if(!p)return; try { const r = await launchCamera({mediaType:'mixed',videoQuality:'high',saveToPhotos:true}); if(!r.didCancel&&r.assets&&r.assets.length>0){updateField('mediaAsset',r.assets[0]);}} catch(e){Alert.alert("Error Cámara");}}, [requestCameraPermission, updateField]);
  const handleBrowseMedia = useCallback(async () => { const p = await requestStoragePermission(); if(!p)return; try { const r = await launchImageLibrary({mediaType:'mixed',selectionLimit:1}); if(!r.didCancel&&r.assets&&r.assets.length>0){updateField('mediaAsset',r.assets[0]);}} catch(e){Alert.alert("Error Galería");}}, [requestStoragePermission, updateField]);
  const removeMediaFile = useCallback(() => { updateField('mediaAsset', null); }, [updateField]);

  // --- Navegación ---
  const handlePrevious = (): void => { navigation.goBack(); };

  // --- Finalizar y Enviar a API ---
    // --- Finalizar y Enviar a API ---
  const handleFinish = async () => {
    if (!userId) { Alert.alert("Error", "ID de usuario no encontrado."); return; }
    if (isSubmitting) return;
    setIsSubmitting(true); console.log('Finalizing incident...');

    try {
        const apiPayload: any = { idUsuario: parseInt(userId, 10), matricula: incidentData.matricula || null, image: null, imageName: null, audio: null, audioName: null, archivo: null, archivoName: null, };
        const processAsset = async (asset: Asset | null, typePrefix: 'image' | 'audio' | 'archivo') => {
            if (!asset?.uri) return;
            try {
                const extension = asset.fileName?.split('.').pop()?.toLowerCase() || (asset.type?.startsWith('video') ? 'mp4' : (asset.type?.startsWith('audio') ? 'mp4' : 'jpg'));
                const guidName = `${uuid.v4()}.${extension}`;
                if (typePrefix === 'archivo' && asset.fileSize && asset.fileSize > 100 * 1024 * 1024) { throw new Error("El archivo final excede los 100 MB."); }
                const base64Data = await RNFS.readFile(asset.uri, 'base64');
                apiPayload[typePrefix] = base64Data; apiPayload[`${typePrefix}Name`] = guidName;
            } catch (fsError) { console.error(`Error reading ${typePrefix} file (${asset.uri}):`, fsError); throw new Error(`Error al procesar archivo ${typePrefix}.`); }
        };
        await processAsset(incidentData.docAsset, 'image'); await processAsset(incidentData.audioAsset, 'audio'); await processAsset(incidentData.mediaAsset, 'archivo');
        console.log('Final API Payload Prepared:', { ...apiPayload, image: '...', audio: '...', archivo: '...' });

        // --- >>> LLAMADA A LA API REAL (DEBES CREAR ESTA FUNCIÓN) <<< ---
        await processAsset(incidentData.docAsset, 'image');
        await processAsset(incidentData.audioAsset, 'audio');
        await processAsset(incidentData.mediaAsset, 'archivo');
        const apiResponse = await createIncidentExpressApi(apiPayload);
       

        console.log("API Response:", apiResponse); // Loguea la respuesta de la API

        // Verifica la respuesta (ajusta según lo que devuelva tu API)
        if (apiResponse) { // Asume que devuelve { success: boolean, ... }
             Alert.alert("Incidencia Creada", apiResponse.message || "Tu incidencia exprés ha sido enviada.");
             clearData(); // Limpia el contexto
             navigation.getParent()?.goBack(); // Sale del flujo
        } else {
            // Muestra el mensaje de error de la API si existe
             throw new Error(apiResponse?.message || "Error desconocido del servidor al crear incidencia.");
        }
    } catch (error: any) { console.error("Error finishing incident:", error); Alert.alert("Error", `No se pudo crear la incidencia: ${error.message}`);
    } finally { setIsSubmitting(false); }
  };

  // --- Renderizado del Header Interno ---
  const renderCustomHeader = () => ( <View style={styles.customHeaderContainer}> <View style={[styles.customHeaderButton, styles.customHeaderButtonActive]}> <ExpresIcon width={28} height={28} fill="#0033A0" /> <Text style={[styles.customHeaderText, styles.customHeaderTextActive]}>Exprés</Text> </View> <TouchableOpacity style={styles.customHeaderButton} onPress={() => navigation.getParent()?.navigate('Home')}> <HomeIcon width={28} height={28} fill="#6C757D" /> <Text style={styles.customHeaderText}>Inicio</Text> </TouchableOpacity> </View> );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#F0F2F5"/>
      {renderCustomHeader()}
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.contentCard}>
          <View style={styles.headerSection}>
            <Ionicons name="images-outline" size={70} color="#0033A0" />
            <Text style={styles.cardTitle}>Fotos / Vídeo (Opcional)</Text>
            <Text style={styles.description}> Adjunta una foto o vídeo adicional si es necesario. </Text>
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={handleTakeMedia} activeOpacity={0.7}> <Ionicons name="camera-outline" size={24} color="#FFFFFF" style={styles.buttonIcon}/> <Text style={styles.actionButtonText}>Hacer Foto / Vídeo</Text> </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleBrowseMedia} activeOpacity={0.7}> <Ionicons name="folder-open-outline" size={24} color="#FFFFFF" style={styles.buttonIcon}/> <Text style={styles.actionButtonText}>Buscar en Galería</Text> </TouchableOpacity>

          {mediaAsset && ( <View style={styles.previewArea}> <Text style={styles.previewText}>Adjunto:</Text> <View style={styles.previewItem}> {mediaAsset.type?.startsWith('video/') ? ( <Ionicons name="film-outline" size={30} color="#555" style={styles.previewImage} /> ) : ( <Image source={{ uri: mediaAsset.uri }} style={styles.previewImage} resizeMode="cover" /> )} <View style={styles.previewDetails}><Text style={styles.previewFileName} numberOfLines={1}> {mediaAsset.fileName || (mediaAsset.type?.startsWith('video/') ? 'Vídeo' : 'Archivo')} </Text>{mediaAsset.type && <Text style={styles.previewFileType}>{mediaAsset.type}</Text>}</View> <TouchableOpacity onPress={removeMediaFile} style={styles.removeButton}> <Ionicons name="close-circle" size={28} color="#DC3545" /> </TouchableOpacity> </View> </View> )}

          <View style={styles.cardFooter}>
             <TouchableOpacity style={styles.navigationButton} onPress={handlePrevious}> <Ionicons name="arrow-back-outline" size={24} color="#0033A0" /> <Text style={styles.navigationButtonText}>Anterior</Text> </TouchableOpacity>
             <TouchableOpacity style={[styles.navigationButton, styles.finishButton, isSubmitting && styles.actionButtonDisabled]} onPress={handleFinish} disabled={isSubmitting} >
                {isSubmitting ? ( <ActivityIndicator color="#FFFFFF" size="small" style={{marginRight: 5}}/> ) : ( <Ionicons name="checkmark-circle-outline" size={26} color="#FFFFFF" style={{marginRight: 5}}/> )}
                <Text style={[styles.navigationButtonText, styles.finishButtonText]}> {isSubmitting ? 'Enviando...' : 'Finalizar'} </Text>
             </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Estilos (Igual que DocumentationScreen, con .finishButton y .actionButtonDisabled) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F0F2F5', },
    customHeaderContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 5, paddingVertical: 8, marginHorizontal: 10, marginTop: Platform.OS === 'android' ? 10 : 0, marginBottom: 5, borderRadius: 25, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
    customHeaderButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 20, backgroundColor: '#E9ECEF', },
    customHeaderButtonActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 1.5, },
    customHeaderText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold', color: '#6C757D', },
    customHeaderTextActive: { color: '#0033A0', },
    scrollContainer: { flexGrow: 1, padding: 15, paddingTop: 10, },
    contentCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, paddingBottom: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, },
    headerSection: { alignItems: 'center', marginBottom: 25, },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#0033A0', marginTop: 15, marginBottom: 8, textAlign: 'center' },
    description: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 21, marginBottom: 20, },
    actionButton: { flexDirection: 'row', backgroundColor: '#0033A0', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
    actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10, },
    buttonIcon: {},
    actionButtonDisabled: { backgroundColor: '#A0B5D3', opacity: 0.7, }, // Reutilizado
    previewArea: { marginTop: 15, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEE', },
    previewText: { fontSize: 12, color: '#666', marginBottom: 5, },
    previewItem: { flexDirection: 'row', alignItems: 'center', },
    previewImage: { width: 40, height: 40, borderRadius: 3, marginRight: 8, backgroundColor: '#EAEAEA', }, // Placeholder color
    previewDetails: { flex: 1, justifyContent: 'center', },
    previewFileName: { flex: 1, fontSize: 13, color: '#444', },
    previewFileType: { fontSize: 12, color: '#888', },
    removeButton: { padding: 5, marginLeft: 5, },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 20, borderTopWidth: 1, borderTopColor: '#EEE', },
    navigationButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, },
    navigationButtonText: { fontSize: 17, fontWeight: '600', color: '#0033A0', marginHorizontal: 5, },
    finishButton: { backgroundColor: '#28a745', },
    finishButtonText: { color: '#FFFFFF', },
});
export default MediaScreen;