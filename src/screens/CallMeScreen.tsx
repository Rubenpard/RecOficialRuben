// src/screens/CallMeScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform, SafeAreaView, StatusBar, Alert, Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Para icono del coche si no usas SVG
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
// Asegúrate que MainStackParamList sea el correcto donde CallMe está definido
import type { MainStackParamList } from '../navigation/MainStackNavigator';
import { useAuth } from '../context/AuthContext';
import { createCallRequestApi  } from '../api/callService';
import CarReportIcon from '../assets/icons/carRepair.svg'
// import type { RequestCallApiResponse } from '../api/callService'; // Ya no es estrictamente necesario si solo verificamos success

// --- Importa Iconos SVG para el Header ---
import LlamameHeaderIcon from '../assets/icons/llamameheader.svg';
import HomeIcon from '../assets/icons/home.svg';
import { HttpStatusCode } from 'axios';
import ExpresIcon from '../assets/icons/expres.svg';
// --- ---


// Placeholder para la ilustración del coche (si la tienes)
// const callIllustration = require('../../assets/images/call_illustration.png');
const callIllustration: any = null; // Usar 'any' o ImageSourcePropType

// Tipo Props (Asegúrate que CallMe esté en MainStackParamList)
type CallMeScreenProps = NativeStackScreenProps<MainStackParamList, 'CallMe'>;

const CallMeScreen: React.FC<CallMeScreenProps> = ({ navigation }) => {
  const { userId, userEmail } = useAuth(); // Obtiene ID y email

  const [callRequested, setCallRequested] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
     const navigateTo = (screen: keyof MainStackParamList) => {
        navigation.navigate(screen);
      };
  



// --- ---

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
    { id: 'Profile', title: 'Llamame',  iconComponent: LlamameHeaderIcon },
    { id: 'Home', title: 'Inicio',  iconComponent: HomeIcon },

];

  // Intenta obtener un nombre para mostrar (ej. de la parte local del email)
  const displayName = userEmail?.split('@')[0] || "Usuario";

  // --- Manejador de Solicitud de Llamada ---
  const handleRequestCall = useCallback(async () => {
    if (callRequested || isLoading) return; // Evita múltiples clics
    if (!userId) {
      Alert.alert("Error", "No se pudo identificar al usuario. Por favor, reinicia la aplicación.");
      return;
    }

    setIsLoading(true);
    setError(null);
    console.log(`Requesting call for User ID: ${userId}`);

    try {
      // Llama a la API
      const response = await createCallRequestApi({ idusuario: parseInt(userId, 10) });

      if (response===true) {
        console.log("Call request successful:", response.message);
        setCallRequested(true);
        // Opcional: Mostrar mensaje de éxito de la API
         Alert.alert("Solicitud Enviada", response.message || "Un técnico se pondrá en contacto.");
      } else {
        // Si la API devuelve success: false pero con un mensaje
        console.error("Call request API returned false:", response.message);
        setError(response.message || "No se pudo procesar la solicitud en este momento.");
      }
    } catch (apiError: any) {
      console.error("Create Call API error:", apiError);
      setError(apiError.message || 'Error de conexión al solicitar llamada.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, isLoading, callRequested]); // Dependencias del useCallback

  // --- Renderizado del Header Interno ---
  const renderCustomHeader = () => (
    <View style={styles.customHeaderContainer}>
         <View style={[styles.customHeaderButton, styles.customHeaderButtonActive]}>
             <Text style={[styles.customHeaderText, styles.customHeaderTextActive]}>Llámame</Text>
         </View>
         <TouchableOpacity style={styles.customHeaderButton} onPress={() => navigation.navigate('Home')}>
             <HomeIcon width={28} height={28} fill="#6C757D" />
             <Text style={styles.customHeaderText}>Inicio</Text>
         </TouchableOpacity>
    </View>
  );
  
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
                             onPress={() => navigateTo('Home')}
                             activeOpacity={0.7}
                           >
                            <View style={styles.headerContent}>
                                <Icon
                                 width={headerIconSize}
                                 height={headerIconSize}
                                 fill={isFirst ? '#2c4391' : '#ffffff'}
                                />
                                <View>
                                  <Text style={[
                                    styles.topHeaderText,
                                    isFirst && { color: '#000000' },
                                    !isFirst && { color: '#ffffff' }
                                    ]}>{button.title}
                                  </Text>
                                </View>
                                </View>
                           </TouchableOpacity>
                         );
                       })}
                     </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Tarjeta Blanca de Contenido */}
        <View style={styles.contentCard}>
          {/* Caja Pulsable */}
            {isLoading ? (
              <ActivityIndicator size="large" color={callRequested ? "#155724" : "#0033A0"} />
            ) : callRequested ? (
              <>
              <TouchableOpacity
                style={[styles.callBox, callRequested && styles.callBoxRequested, isLoading && styles.callBoxDisabled]}
                onPress={handleRequestCall}
                disabled={callRequested || isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.callBoxTitle}>Recibido</Text>
                <Text style={styles.callBoxSubtitle}>{displayName}</Text>
          </TouchableOpacity>
                        <View style={styles.illustrationContainer}>
            <CarReportIcon width={150} height={150} />
          </View>
              </>
            ) : (
              <>
                    <TouchableOpacity
                style={[styles.callBox, callRequested && styles.callBoxRequested, isLoading && styles.callBoxDisabled]}
                onPress={handleRequestCall}
                disabled={callRequested || isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.callBoxTitle}>¿Te llamamos?</Text>
                <Text style={styles.callBoxSubtitle}>Pulsa aquí</Text>
                <Text>Esta opción no permite crear consultas o resolver incidencias</Text>
                </TouchableOpacity>
                <View style={styles.illustrationContainer}>
                  <LlamameHeaderIcon width={150} height={150} />
              </View>
              </>
            )}

          {/* Mensaje de Error o Confirmación */}
          {error && !isLoading && (
            <Text style={styles.messageTextError}>{error}</Text>
          )}
          {callRequested && !error && !isLoading && (
            <Text style={styles.messageTextSuccess}>
              Uno de nuestros técnicos se pondrá en contacto contigo lo antes posible.
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const gridPaddingVertical = 15;
const gridPaddingHorizontal = 15;

/* ==========================================================================
   Estilos (Igual que en la versión anterior, pero revisados)
   ========================================================================== */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3f4c53',
    marginTop: 40,
   },
  customHeaderContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 5, paddingVertical: 8, marginHorizontal: 10, marginTop: Platform.OS === 'android' ? 10 : 0, marginBottom: 5, borderRadius: 25, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
  
  // --- Header Superior ---
  topHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribuye los 3 botones
    alignItems: 'center',
    experimental_backgroundImage: 'linear-gradient(to right, #b1b1ae, #9c9c9c)',
    // height: height * topHeaderHeightRatio, // Altura basada en ratio
    borderRadius: 20, // Bordes redondeados
    marginVertical: gridPaddingVertical, // Espacio antes de la cuadrícula
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
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  middleButton: {
    backgroundColor: '#b1b1ae',
  },
  lastButton: {
    backgroundColor: '#9c9c9c',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent:{
    flexDirection: 'column',
    gap: 20,
  },

  customHeaderButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 20, backgroundColor: '#E9ECEF', },
  customHeaderButtonActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 1.5, },
  customHeaderText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold', color: '#6C757D', },
  customHeaderTextActive: { color: '#0033A0', },
  scrollContainer: { 
    flexGrow: 1, padding: 15,
     paddingTop: 10,  }, // Centrar contenido si es poco
  contentCard: {
    // flex: 1, // No necesita flex: 1 si el scrollContainer ya lo centra
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    marginHorizontal: 10, // Añadir un poco de margen si el scrollContainer no tiene padding
  },
  callBox: {
    width: '95%',
    maxWidth: 380,
    aspectRatio: 1.6, // Para mantener proporción
    backgroundColor: '#E0E8F5', // Azul muy pálido
    borderWidth: 3,
    borderColor: '#A0B5D3', // Borde azul grisáceo
    borderRadius: 25,

    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    flexDirection: 'column',
    gap: 10,
    textAlign: 'center',
  },
  callBoxRequested: {
    backgroundColor: '#E0E8F5',
    borderColor: '#C3E6CB',
  },
  callBoxDisabled: { // Para cuando isLoading es true
    opacity: 0.7,
  },
  callBoxTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212529', // Casi negro
    textAlign: 'center',
    marginBottom: 8,
  },
  callBoxSubtitle: {
    fontSize: 18,
    color: '#495057', // Gris oscuro
    textAlign: 'center',
  },
  illustrationContainer: {
    width: '70%',
    maxWidth: 280,
    aspectRatio: 1.3,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  illustrationPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F2F5', // Gris muy claro
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageTextSuccess: {
    fontSize: 16,
    color: '#155724', // Verde oscuro para texto éxito
    textAlign: 'center',
    paddingHorizontal: 15,
    lineHeight: 22,
    marginTop: 10, // Espacio si se muestra después de la ilustración
  },
  messageTextError: {
    fontSize: 16,
    color: '#721C24', // Rojo oscuro para texto error
    textAlign: 'center',
    paddingHorizontal: 15,
    lineHeight: 22,
    backgroundColor: '#F8D7DA', // Fondo rosa pálido
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#F5C6CB', // Borde rosa
    marginTop: 10,
  },
});

export default CallMeScreen;