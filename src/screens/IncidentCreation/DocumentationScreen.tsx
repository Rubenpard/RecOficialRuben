// src/screens/IncidentCreation/DocumentationScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, SafeAreaView,
  TouchableOpacity, Image, Alert, Platform, PermissionsAndroid, StatusBar
} from 'react-native';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { IncidentCreationStackParamList } from '../../navigation/IncidentCreationStackNavigator';
import { useIncidentCreation } from '../../context/IncidentCreationContext';

// --- Importa Iconos SVG para el Header ---
import ExpresIcon from '../../assets/icons/expres.svg'; // Ajusta ruta desde src/screens/IncidentCreation/
import HomeIcon from '../../assets/icons/home.svg';     // Ajusta ruta
// --- ---

// Placeholder para la ilustración interna
const docIllustration = null; // O require('../../../assets/images/doc_illustration.png');

type DocumentationScreenProps = NativeStackScreenProps<IncidentCreationStackParamList, 'IncidentDoc'>;

const DocumentationScreen: React.FC<DocumentationScreenProps> = ({ navigation }) => {
  const { incidentData, updateField } = useIncidentCreation();
  const { matricula, docAsset } = incidentData;

  const [isNextEnabled, setIsNextEnabled] = useState<boolean>(false);

  useEffect(() => {
    setIsNextEnabled(!!matricula?.trim() || !!docAsset);
  }, [matricula, docAsset]);

  // --- Permisos ---
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.CAMERA, { title: "Permiso Cámara", message: "Acceso a cámara para foto.", buttonPositive: "Aceptar", buttonNegative: "Cancelar" } );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) { console.log("Permiso cámara OK"); return true; }
      else { console.log("Permiso cámara DENEGADO"); Alert.alert("Permiso Denegado", "No se puede usar la cámara."); return false; }
    } catch (err) { console.warn(err); Alert.alert("Error Permisos", "Error pidiendo permiso de cámara."); return false; }
  }, []);

  const requestStoragePermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
        const permission = Platform.Version >= 33 ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const granted = await PermissionsAndroid.request( permission, { title: "Permiso Almacenamiento", message: "Acceso a galería para seleccionar imagen.", buttonPositive: "Aceptar", buttonNegative: "Cancelar" } );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) { console.log("Permiso storage OK"); return true; }
        else { console.log("Permiso storage DENEGADO"); Alert.alert("Permiso Denegado", "No se puede acceder a galería."); return false; }
    } catch (err) { console.warn(err); Alert.alert("Error Permisos", "Error pidiendo permiso de storage."); return false; }
  }, []);

  // --- Manejadores ---
  const handleTakePhoto = useCallback(async () => {
    const hasPermission = await requestCameraPermission(); if (!hasPermission) return;
    try {
      const result = await launchCamera({ mediaType: 'photo', saveToPhotos: true, quality: 0.7 });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        updateField('docAsset', result.assets[0]); updateField('matricula', null);
      }
    } catch (error) { console.error("Error launchCamera:", error); Alert.alert("Error Cámara", "No se pudo iniciar la cámara."); }
  }, [requestCameraPermission, updateField]);

  const handleBrowseFiles = useCallback(async () => {
     const hasPermission = await requestStoragePermission(); if (!hasPermission) return;
     try {
       const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 1, quality: 0.7 });
       if (!result.didCancel && result.assets && result.assets.length > 0) {
         updateField('docAsset', result.assets[0]); updateField('matricula', null);
       }
     } catch (error) { console.error("Error launchImageLibrary:", error); Alert.alert("Error Galería", "No se pudo abrir la galería."); }
  }, [requestStoragePermission, updateField]);

  const handleMatriculaChange = (text: string) => {
      updateField('matricula', text.toUpperCase());
      if (text.trim().length > 0) { updateField('docAsset', null); }
  };

  const handleNext = () => { if (!isNextEnabled) return; navigation.navigate('IncidentAudio'); };

  const renderCustomHeader = () => (
    <View style={styles.customHeaderContainer}>
         <View style={[styles.customHeaderButton, styles.customHeaderButtonActive]}>
             <ExpresIcon width={28} height={28} fill="#0033A0" />
             <Text style={[styles.customHeaderText, styles.customHeaderTextActive]}>Exprés</Text>
         </View>
         <TouchableOpacity style={styles.customHeaderButton} onPress={() => navigation.getParent()?.navigate('Home')}>
             <HomeIcon width={28} height={28} fill="#6C757D" />
             <Text style={styles.customHeaderText}>Inicio</Text>
         </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F2F5"/>
      {renderCustomHeader()}
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.contentCard}>
          <View style={styles.headerSection}>
            {docIllustration ? ( <Image source={docIllustration} style={styles.illustration} resizeMode="contain"/> )
             : ( <View style={styles.illustrationPlaceholder}> <Ionicons name="document-attach-outline" size={50} color="#A0B5D3" /> </View> )}
            <Text style={styles.cardTitle}>Documentación</Text>
            <Text style={styles.description}> Haz una foto a la Ficha Técnica/Permiso de Circulación O introduce la matrícula. </Text>
          </View>

          <View style={styles.inputGroup}>
             <View style={styles.matriculaPrefix}><Text style={styles.matriculaPrefixText}>E</Text></View>
             <TextInput
                style={styles.inputMatricula}
                placeholder="Introduce Matrícula"
                value={matricula ?? ''}
                onChangeText={handleMatriculaChange}
                editable={!docAsset}
                placeholderTextColor="#A0A0A0" autoCapitalize="characters" maxLength={8} returnKeyType="done" onSubmitEditing={handleNext}
            />
          </View>

          <TouchableOpacity
            style={[styles.actionButton, !!matricula?.trim() && styles.actionButtonDisabled]}
            onPress={handleTakePhoto} activeOpacity={0.7} disabled={!!matricula?.trim()}
          >
            <Ionicons name="camera-outline" size={24} color="#FFFFFF" style={styles.buttonIcon}/>
            <Text style={styles.actionButtonText}>Hacer Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !!matricula?.trim() && styles.actionButtonDisabled]}
            onPress={handleBrowseFiles} activeOpacity={0.7} disabled={!!matricula?.trim()}
          >
            <Ionicons name="folder-open-outline" size={24} color="#FFFFFF" style={styles.buttonIcon}/>
            <Text style={styles.actionButtonText}>Buscar Foto en Galería</Text>
          </TouchableOpacity>

          {docAsset && ( <View style={styles.previewArea}> <Text style={styles.previewText}>Foto adjunta:</Text> <View style={styles.previewItem}> <Image source={{uri: docAsset.uri}} style={styles.previewImage} /> <Text style={styles.previewFileName} numberOfLines={1}>{docAsset.fileName || 'Foto'}</Text> <TouchableOpacity onPress={() => updateField('docAsset', null)} style={styles.removeButton}> <Ionicons name="close-circle" size={24} color="#DC3545" /> </TouchableOpacity> </View> </View> )}

          <View style={styles.cardFooter}>
             <TouchableOpacity style={[styles.navigationButton, !isNextEnabled && styles.navigationButtonDisabled]} onPress={handleNext} disabled={!isNextEnabled} >
                <Text style={[styles.navigationButtonText, !isNextEnabled && styles.navigationButtonTextDisabled]}>Siguiente</Text>
                <Ionicons name="arrow-forward-outline" size={24} color={isNextEnabled ? "#0033A0" : "#A0A0A0"} />
             </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    illustration: { width: 100, height: 70, marginBottom: 10, },
    illustrationPlaceholder: { width: 100, height: 70, backgroundColor: '#EAEAEA', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10, },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#0033A0', marginBottom: 8, textAlign: 'center' },
    description: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 21, marginBottom: 20, },
    inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#B0B0B0', borderRadius: 8, backgroundColor: '#FFFFFF', marginBottom: 20, overflow: 'hidden', },
    matriculaPrefix: { backgroundColor: '#0033A0', paddingHorizontal: 15, height: 50, justifyContent: 'center', alignItems: 'center', borderTopLeftRadius: 7, borderBottomLeftRadius: 7, },
    matriculaPrefixText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', },
    inputMatricula: { flex: 1, height: 50, paddingHorizontal: 15, fontSize: 18, fontWeight: 'bold', color: '#333', textTransform: 'uppercase', backgroundColor: '#FFFFFF', },
    actionButton: { flexDirection: 'row', backgroundColor: '#0033A0', paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
    actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10, },
    buttonIcon: {},
    actionButtonDisabled: { backgroundColor: '#A0B5D3', opacity: 0.7, },
    previewArea: { marginTop: 15, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EEE', },
    previewText: { fontSize: 12, color: '#666', marginBottom: 5, },
    previewItem: { flexDirection: 'row', alignItems: 'center', },
    previewImage: { width: 40, height: 40, borderRadius: 3, marginRight: 8, },
    previewFileName: { flex: 1, fontSize: 13, color: '#444', },
    removeButton: { padding: 5, marginLeft: 5, },
    cardFooter: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 20, paddingTop: 10, },
    navigationButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, },
    navigationButtonDisabled: { opacity: 0.4, },
    navigationButtonText: { fontSize: 17, fontWeight: '600', color: '#0033A0', marginRight: 5, },
    navigationButtonTextDisabled: { color: '#A0A0A0', },
});
export default DocumentationScreen;