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
import { useNavigation } from '@react-navigation/native';

// --- Importa Iconos SVG para el Header ---
import MPerfilIcon from '../../assets/icons/usuarioSvg.svg';
import ExpresIcon from '../../assets/icons/expres.svg';
import HomeIcon from '../../assets/icons/home.svg';
import CameraIcon from '../../assets/icons/camera.svg';
import PicturesIcon from '../../assets/icons/pictures.svg';
import SiguienteIcon from '../../assets/icons/siguiente.svg';
import ExpresIconHeader from '../../assets/icons/expressheader.svg'
// --- ---

const gridPaddingVertical = 15;
const gridPaddingHorizontal = 15;
    // --- Renderizado ---
  const headerIconSize = 60; // Tamaño iconos header superior
  const gridIconSize = 90;  // Tamaño iconos cuadrícula


interface TopHeaderButtonData {
    id: keyof MainStackParamList;
    title: string;
    iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}


// --- Datos ---
const topHeaderButtons: TopHeaderButtonData[] = [
    { id: 'Profile', title: 'Abiertas',  iconComponent: ExpresIconHeader },
    { id: 'Calendar', title: 'Inicio',  iconComponent: HomeIcon },

];



// Placeholder para la ilustración interna
const DocumentationScreen: React.FC<DocumentationScreenProps> = ({ navigation }) => {
  const { incidentData, updateField } = useIncidentCreation();
  const { matricula, docAsset } = incidentData;

  const [isNextEnabled, setIsNextEnabled] = useState<boolean>(false);
  
  const navigateTo = (screen: keyof MainStackParamList) => {
      navigation.navigate(screen);
    };
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


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0F2F5"/>
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
                 onPress={() => navigateTo('Home')}
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
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.contentCard}>
          <View style={styles.headerSection}>
            <View>
            <Image
                source={require('../../assets/images/documentacion.png')}
               style={styles.illustration}
            />
            </View>
            <View style={styles.textContent}>
              <Text style={styles.cardTitle}>Documentación</Text>
              <Text style={styles.description}> Haz una foto a la Ficha Técnica/Permiso de Circulación O introduce la matrícula. </Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
             <View style={styles.matriculaPrefix}>
                 <Image
                  source={require('../../assets/images/banderaUe.png')}
                  style={styles.bandera}
                />
               <Text style={styles.matriculaPrefixText}>
                E
                </Text>
              </View>
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
            <CameraIcon width={50} height={50} />
            <Text style={styles.actionButtonText}>Hacer Foto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !!matricula?.trim() && styles.actionButtonDisabled]}
            onPress={handleBrowseFiles} activeOpacity={0.7} disabled={!!matricula?.trim()}
          >
            <PicturesIcon width={50} height={50} />
            <Text style={styles.actionButtonText}>Buscar Foto en Galería</Text>
          </TouchableOpacity>

          {docAsset && ( <View style={styles.previewArea}> <Text style={styles.previewText}>Foto adjunta:</Text> <View style={styles.previewItem}> <Image source={{uri: docAsset.uri}} style={styles.previewImage} /> <Text style={styles.previewFileName} numberOfLines={1}>{docAsset.fileName || 'Foto'}</Text> <TouchableOpacity onPress={() => updateField('docAsset', null)} style={styles.removeButton}> <Ionicons name="close-circle" size={24} color="#DC3545" /> </TouchableOpacity> </View> </View> )}

          <View style={styles.cardFooter}>
             <TouchableOpacity style={[styles.navigationButton, !isNextEnabled && styles.navigationButtonDisabled]} onPress={handleNext} disabled={!isNextEnabled} >
                <Text style={[styles.navigationButtonText, !isNextEnabled && styles.navigationButtonTextDisabled]}>Siguiente</Text>
                <SiguienteIcon width={50} height={50} />
             </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#3f4c53', },
    customHeaderContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 5, paddingVertical: 8, marginHorizontal: 10, marginTop: Platform.OS === 'android' ? 10 : 0, marginBottom: 5, borderRadius: 25, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
    
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
    customHeaderButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 20, backgroundColor: '#E9ECEF', },
    customHeaderButtonActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 1.5, },
    customHeaderText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold', color: '#6C757D', },
    customHeaderTextActive: { color: '#0033A0', },
    scrollContainer: { flexGrow: 1, padding: 15, paddingTop: 10, },
    contentCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, paddingBottom: 10, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, },
    headerSection: { 
      alignItems: 'center', 
      marginBottom: 25, 
      flexDirection: 'row' 
    },
    illustration: {
      width: 80,
      height: 80,
      marginBottom: 10,
    },
    bandera: { width: 30, 
      height: 20, 
      resizeMode: 'contain', 
    },
    textContent: { 
      flex: 1,
      paddingHorizontal: 15, 
      paddingRight: 20, 
    },
    illustrationPlaceholder: { width: 100, height: 70, backgroundColor: '#EAEAEA', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 10, },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#0033A0', marginBottom: 8 },
    description: { fontSize: 15, color: '#555', lineHeight: 21, marginBottom: 20, },
    inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#B0B0B0', borderRadius: 8, backgroundColor: '#FFFFFF', marginBottom: 20, overflow: 'hidden', },
    matriculaPrefix: { 
      flexDirection: 'column',
      backgroundColor: '#0033A0', 
      paddingHorizontal: 15, 
      height: 80, 
      width: 40,
      justifyContent: 'center', 
      alignItems: 'center', 
      borderTopLeftRadius: 7, 
      borderBottomLeftRadius: 7, 
    },
    matriculaPrefixText: { 
      marginTop: 5,
      color: '#FFFFFF', 
      fontSize: 18, 
      fontWeight: 'bold', 
    },
    inputMatricula: { flex: 1, height: 50, paddingHorizontal: 15, fontSize: 18, fontWeight: 'bold', color: '#333', textTransform: 'uppercase', backgroundColor: '#FFFFFF', },
    actionButton: { 
      flexDirection: 'row', 
      backgroundColor: '#0033A0', 
      paddingVertical: 14, 
      borderTopLeftRadius: 20,
      borderBottomLeftRadius: 20,
      marginRight: -20,
      alignItems: 'center', 
      paddingLeft: 20,
      marginBottom: 12, 
      elevation: 2, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 1 }, 
      shadowOpacity: 0.2, 
      shadowRadius: 2,
    },
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
    navigationButtonText: { 
      fontSize: 17, 
      fontWeight: '800', 
      marginRight: 5, 
    },
    navigationButtonTextDisabled: {color: '#A0A0A0', },
});
export default DocumentationScreen;