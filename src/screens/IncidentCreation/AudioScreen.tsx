// src/screens/IncidentCreation/AudioScreen.tsx
import React, { useState, useEffect, useCallback  } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,SafeAreaView,StatusBar ,
  PermissionsAndroid, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { IncidentCreationStackParamList } from '../../navigation/IncidentCreationStackNavigator';
import AudioRecorderPlayer, { AudioEncoderAndroidType, AudioSourceAndroidType, OutputFormatAndroidType, AVEncoderAudioQualityIOSType, AVEncodingOption } from 'react-native-audio-recorder-player';
import type { Asset } from 'react-native-image-picker';
import { useIncidentCreation } from '../../context/IncidentCreationContext';
import uuid from 'react-native-uuid'; // Necesario para nombre de archivo en stopRecord
import ExpresIcon from '../../assets/icons/expres.svg'; // Ajusta ruta
import HomeIcon from '../../assets/icons/home.svg';     // Ajusta ruta
import AudioIcon from '../../assets/icons/audio.svg';
import MPerfilIcon from '../../assets/icons/usuarioSvg.svg';
import SiguienteIcon from '../../assets/icons/siguiente.svg';
import VolverIcon from '../../assets/icons/volver.svg';

  const gridPaddingVertical = 15;
  const gridPaddingHorizontal = 15;

type AudioScreenProps = NativeStackScreenProps<IncidentCreationStackParamList, 'IncidentAudio'>;

const audioRecorderPlayer = new AudioRecorderPlayer();
audioRecorderPlayer.setSubscriptionDuration(0.1);
const MAX_RECORD_DURATION_SEC = 30;

const AudioScreen: React.FC<AudioScreenProps> = ({ navigation }) => {
  const { incidentData, updateField } = useIncidentCreation();
  const { audioAsset } = incidentData;

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSecs, setRecordSecs] = useState<number>(0);
  const [recordTime, setRecordTime] = useState<string>(audioRecorderPlayer.mmss(MAX_RECORD_DURATION_SEC));
  const [isNextEnabled, setIsNextEnabled] = useState<boolean>(!!audioAsset);


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
      { id: 'Profile', title: 'Mi Perfil',  iconComponent: MPerfilIcon },
      { id: 'Calendar', title: 'Inicio',  iconComponent: HomeIcon },
  
  ];

  useEffect(() => {
    return () => {
      console.log('AudioScreen unmounting, stopping recorder and listener.');
      audioRecorderPlayer.stopRecorder().catch(() => {}); // Ignora error si ya estaba parado
      audioRecorderPlayer.removeRecordBackListener();
    };
  }, []);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, { title: "Permiso Micrófono", message: "Necesitamos acceso para grabar audio.", buttonPositive: "Aceptar", buttonNegative: "Cancelar" } );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) { return true; }
      else { Alert.alert("Permiso Denegado", "No se puede grabar sin permiso."); return false; }
    } catch (err) { console.warn(err); Alert.alert("Error Permisos", "Error pidiendo permiso de micrófono."); return false; }
  }, []);

  const onStartRecord = useCallback(async (): Promise<void> => {
    const hasPermission = await requestMicrophonePermission(); if (!hasPermission) return;
    const audioSet = { AudioEncoderAndroid: AudioEncoderAndroidType.AAC, AudioSourceAndroid: AudioSourceAndroidType.MIC, AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high, AVNumberOfChannelsKeyIOS: 2, AVFormatIDKeyIOS: AVEncodingOption.aac, OutputFormatAndroid: OutputFormatAndroidType.AAC_ADTS };
    const uri = Platform.select({ ios: 'audio.m4a', android: undefined }); // Ruta por defecto en Android

    try {
      const result = await audioRecorderPlayer.startRecorder(uri, audioSet);
      setIsRecording(true); updateField('audioAsset', null); setIsNextEnabled(false); setRecordSecs(0);
      audioRecorderPlayer.addRecordBackListener((e) => {
        const currentSecs = Math.floor(e.currentPosition / 1000);
        setRecordSecs(currentSecs); setRecordTime(audioRecorderPlayer.mmssss(Math.floor(e.currentPosition)));
        if (currentSecs >= MAX_RECORD_DURATION_SEC) { onStopRecord(); } // Llama a onStopRecord aquí
      });
      console.log(`Grabación iniciada: ${result}`);
    } catch (error) { console.error('Error al iniciar grabación:', error); Alert.alert("Error", "No se pudo iniciar la grabación."); }
  }, [requestMicrophonePermission, updateField, onStopRecord]); // Añade onStopRecord a dependencias

  // onStopRecord necesita ser useCallback también porque se usa en onStartRecord
  const onStopRecordCallback = useCallback(async (): Promise<void> => {
      if (!isRecording) return; // Evita llamadas múltiples si se detiene desde el listener y el botón
      console.log('Stopping record...');
    try {
        const resultUri = await audioRecorderPlayer.stopRecorder();
        setIsRecording(false); audioRecorderPlayer.removeRecordBackListener();
        const fileExtension = Platform.OS === 'ios' ? 'm4a' : 'mp4'; // Ajusta según OutputFormatAndroid
        const fileName = `audio_${uuid.v4()}.${fileExtension}`;
        const newAudioAsset: Asset = { uri: resultUri, type: `audio/${fileExtension}`, fileName: fileName };
        updateField('audioAsset', newAudioAsset);
        setIsNextEnabled(true);
        console.log(`Grabación detenida, archivo en: ${resultUri}`);
    } catch(error) {
        console.error('Error al detener grabación:', error); Alert.alert("Error", "No se pudo detener la grabación.");
        setIsRecording(false); audioRecorderPlayer.removeRecordBackListener();
        setIsNextEnabled(!!incidentData.audioAsset); // Restaura estado del botón
    }
  }, [updateField, incidentData.audioAsset, isRecording]); // Añade isRecording

  // Renombra la función para evitar conflictos de nombre en el scope de useCallback
  const onStopRecord = onStopRecordCallback;

  const handlePrevious = (): void => { navigation.goBack(); };
  const handleNext = (): void => { if (!isNextEnabled) return; navigation.navigate('IncidentMedia'); };

  const remainingTime = MAX_RECORD_DURATION_SEC - recordSecs;
  const displayTime = isRecording ? audioRecorderPlayer.mmss(remainingTime >= 0 ? remainingTime : 0) : audioRecorderPlayer.mmss(MAX_RECORD_DURATION_SEC);

  // --- Renderizado del Header Interno ---
  // const renderCustomHeader = () => (
  //   <View style={styles.customHeaderContainer}>
  //        <View style={[styles.customHeaderButton, styles.customHeaderButtonActive]}>
  //            <ExpresIcon width={28} height={28} fill="#0033A0" />
  //            <Text style={[styles.customHeaderText, styles.customHeaderTextActive]}>Exprés</Text>
  //        </View>
  //        <TouchableOpacity style={styles.customHeaderButton} onPress={() => navigation.getParent()?.navigate('Home')}>
  //            <HomeIcon width={28} height={28} fill="#6C757D" />
  //            <Text style={styles.customHeaderText}>Inicio</Text>
  //        </TouchableOpacity>
  //   </View>
  // );


  // --- Renderizado Principal ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#F0F2F5"/>
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
        {/* Tarjeta Blanca de Contenido */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentCard}>
          {/* Sección Superior */}
          <View style={styles.headerSection}>
            <View>
            <AudioIcon width={80} height={80} />
            </View>
            <View>
            <Text style={styles.cardTitle}>Audio</Text>
            <Text style={styles.description}>
              Envíanos una nota de audio, coméntanos el problema y tus comprobaciones. Cuentas con {MAX_RECORD_DURATION_SEC} segundos.
            </Text>
            </View>
          </View>

          {/* Botón de Grabar / Detener */}
          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={isRecording ? onStopRecord : onStartRecord}
            activeOpacity={0.7}
          >
            <Ionicons name={isRecording ? "stop-circle-outline" : "mic-outline"} size={30} color="#FFFFFF" style={styles.buttonIcon}/>
            <Text style={styles.recordButtonText}>{isRecording ? 'Detener Grabación' : 'Grabar audio'}</Text>
            <Text style={styles.timerText}>{displayTime}</Text>
          </TouchableOpacity>

          {/* Indicador de audio grabado */}
          {audioAsset && !isRecording && (
              <View style={styles.playbackSection}>
                  <Text style={styles.infoText}>Audio grabado.</Text>
                  <TouchableOpacity onPress={() => { updateField('audioAsset', null); setIsNextEnabled(false); }}>
                      <AudioIcon width={30} height={30} fill="#28a745" />
                  </TouchableOpacity>
              </View>
          )}

          {/* Footer de la Tarjeta (con botones Anterior/Siguiente) */}
          <View style={styles.cardFooter}>
             <TouchableOpacity style={styles.navigationButton} onPress={handlePrevious}>
                <VolverIcon width={50} height={50} fill="#0033A0" />
                <Text style={styles.navigationButtonText}>Anterior</Text>
             </TouchableOpacity>
             <TouchableOpacity style={[styles.navigationButton, !isNextEnabled && styles.navigationButtonDisabled]} onPress={handleNext} disabled={!isNextEnabled} >
                 <Text style={[styles.navigationButtonText, !isNextEnabled && styles.navigationButtonTextDisabled]}>Siguiente</Text>
                 <SiguienteIcon width={50} height={50} color={isNextEnabled ? "#0033A0" : "#A0A0A0"} />
             </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Estilos (Usa los mismos estilos que DocumentationScreen para safeArea, customHeader..., contentCard, cardFooter, etc.) ---
const styles = StyleSheet.create({
    safeArea: { 
      flex: 1, 
      backgroundColor: '#3f4c53', 
    },
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
    contentCard: { 
      flex: 1, 
      backgroundColor: '#FFFFFF', 
      borderRadius: 15, 
      padding: 20, 
      paddingBottom: 10, 
      elevation: 4, 
      shadowColor: '#000', 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.15, 
      shadowRadius: 4, },
    // --- Estilos específicos de AudioScreen ---
    headerSection: {  
      marginBottom: 30,
      flexDirection: 'row',  
    }, // Menos margen que DocScreen

    cardTitle: { 
      fontSize: 22, 
      fontWeight: 'bold', 
      color: '#0033A0', 
      marginTop: 15,
      marginBottom: 10, 
    },
    description: { 
      fontSize: 15, 
      color: '#555', 
      lineHeight: 22, 
      marginBottom: 30,
      paddingHorizontal: 15, 
      paddingRight: 50, 
    }, // Más margen
    recordButton: { 
      flexDirection: 'row', 
      backgroundColor: '#0033A0', 
      paddingVertical: 18, 
      paddingHorizontal: 30, 
      alignItems: 'center', 
      justifyContent: 'center', 
      minWidth: '80%', 
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.25, 
      shadowRadius: 3.84, 
      elevation: 5, 
      borderTopLeftRadius: 20,
      borderBottomLeftRadius: 20,
      marginRight: -20,},
    recordingButton: { backgroundColor: '#DC3545', },
    buttonIcon: { marginRight: 10, },
    recordButtonText: { 
      color: '#FFFFFF', 
      fontSize: 17, 
      fontWeight: 'bold', 
      marginRight: 15, 
    },
    timerText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', minWidth: 50, textAlign: 'right', },
    playbackSection: { marginTop: 25, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
    infoText:{ fontSize: 15, color: '#28a745', marginRight: 10, },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', // Empuja al final
                 paddingTop: 20, borderTopWidth: 1, borderTopColor: '#EEE', }, // Margen superior en lugar de inferior en el último elemento
    navigationButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, },
    navigationButtonDisabled: { opacity: 0.4, },
    navigationButtonText: { fontSize: 17, fontWeight: '600', color: '#0033A0', marginHorizontal: 5, },
    navigationButtonTextDisabled: { color: '#A0A0A0', },
});

export default AudioScreen;