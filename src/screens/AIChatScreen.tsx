// src/screens/AIChatScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform,
  SafeAreaView, StatusBar, Alert // Importa Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Para icono de enviar
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../navigation/MainStackNavigator'; // Ajusta si está en HomeStackParamList
import { useAuth } from '../context/AuthContext';
import { getAIChatResponseApi } from '../api/aiService'; // Importa la función API
import SiguienteIcon from '../assets/icons/siguiente.svg';



// --- Importa Iconos SVG para el Header ---
import HomeIcon from '../assets/icons/home.svg'; 
import MPerfilIcon from '../../assets/icons/usuarioSvg.svg';
import AiIcon from '../assets/icons/ai.svg';


import ExpresIcon from '../../assets/icons/expres.svg'; // Ajusta ruta
// --- ---

const gridPaddingVertical = 15;
const gridPaddingHorizontal = 15;
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
    { id: 'Profile', title: 'Mi Perfil',  iconComponent: AiIcon},
    { id: 'Calendar', title: 'Inicio',  iconComponent: HomeIcon },

];


// Tipo Props
type AIChatScreenProps = NativeStackScreenProps<MainStackParamList, 'AIChat'>; // Ajusta si es HomeStackParamList

const AIChatScreen: React.FC<AIChatScreenProps> = ({ navigation }) => {
  const { userId } = useAuth(); // Obtiene el ID del usuario

  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // --- Manejador de Envío de Mensaje ---
  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim()) { Alert.alert("Entrada Vacía", "Por favor, escribe tu consulta."); return; }
    if (isLoading) return;
    if (!userId) { Alert.alert("Error Usuario", "No se pudo identificar al usuario. Intenta reiniciar la app."); return; }

    setIsLoading(true);
    setError(null);
    setAiResponse(null); // Limpia respuesta anterior
    console.log(`Sending to AI for UserID ${userId}: "${inputText}"`);

    try {
      const responseText = await getAIChatResponseApi(inputText, userId); // Llama a la API
      setAiResponse(responseText); // Asume que getAIChatResponseApi devuelve el string de la respuesta directamente
    } catch (apiError: any) {
      console.error("AI Chat API error:", apiError);
      setError(apiError.message || 'Error al conectar con la IA. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
      // Opcional: Limpiar inputText después de enviar
      // setInputText('');
    }
  }, [userId, inputText, isLoading]); // Dependencias del useCallback

  // --- Renderizado del Header Interno ---
  const renderCustomHeader = () => (
    <View style={styles.customHeaderContainer}>
         <View style={[styles.customHeaderButton, styles.customHeaderButtonActive]}>
             <AiIcon width={28} height={28} fill="#0033A0" />
             <Text style={[styles.customHeaderText, styles.customHeaderTextActive]}>IA</Text>
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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            {/* Tarjeta Blanca de Contenido */}
            <View style={styles.contentCard}>
                <View style={styles.infoSection}>
                   <View>
                    <AiIcon width={60} height={60} fill="#0033A0" style={styles.headerIconLarge} />
                     </View>
                     <View>
                    <Text style={styles.cardTitle}>Chat AI</Text>
                    <Text style={styles.cardDescription}>
                        Nuestro motor de Inteligencia Artificial te dará respuesta con la fiabilidad de la experiencia.
                    </Text>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Escribe tu problema o pregunta..."
                        placeholderTextColor="#A0A0A0"
                        multiline={true}
                        value={inputText}
                        onChangeText={setInputText}
                        editable={!isLoading}
                        textAlignVertical="top" // Para Android
                    />
                </View>
                <View style={styles.parentButton}>
                  <TouchableOpacity
                      style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                      onPress={handleSendMessage}
                      disabled={!inputText.trim() || isLoading}
                      activeOpacity={0.7}
                    >
                      {isLoading ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                          <>
                              <Text style={styles.sendButtonText}>Consultar a la IA</Text>
                              <SiguienteIcon width={50} height={50} />
                          </>
                      )}
                  </TouchableOpacity>
                </View>

                {error && !isLoading && (
                    <View style={styles.responseContainerError}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {aiResponse && !error && !isLoading && (
                   <View style={styles.responseContainer}>
                       <Text style={styles.responseLabel}>Respuesta AI:</Text>
                       <Text style={styles.responseText}>{aiResponse}</Text>
                   </View>
                )}
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/* ==========================================================================
   Estilos Completos
   ========================================================================== */
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
    backgroundColor: '#3f4c53',
   }, // Fondo claro general
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

  // --- Header Interno ---
  customHeaderContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingHorizontal: 5, paddingVertical: 8, marginHorizontal: 10, marginTop: Platform.OS === 'android' ? 10 : 0, marginBottom: 5, borderRadius: 25, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, },
  customHeaderButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, paddingHorizontal: 5, borderRadius: 20, backgroundColor: '#E9ECEF', },
  customHeaderButtonActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15, shadowRadius: 1.5, },
  customHeaderText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold', color: '#6C757D', },
  customHeaderTextActive: { color: '#0033A0', },
  // --- Contenido ---
  keyboardAvoidingView: { flex: 1, },
  scrollContainer: { flexGrow: 1, padding: 15, paddingTop: 10, },
  contentCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, },
  infoSection: { 
    alignItems: 'center', 
    marginBottom: 25, 
    flexDirection: 'row' 
  },
  headerIconLarge: { marginBottom: 10, },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#0033A0', marginBottom: 8, },
  cardDescription: { 
    fontSize: 15, 
    color: '#555',  
    lineHeight: 21, 
    flex: 1,
    paddingHorizontal: 15, 
    paddingRight: 20,
  },
  inputContainer: { marginBottom: 20, borderWidth: 1, borderColor: '#D0D0D0', borderRadius: 10, backgroundColor: '#FFFFFF', },
  textInput: { minHeight: 100, maxHeight: 200, padding: 15, fontSize: 16, color: '#333', textAlignVertical: 'top' },
  sendButton: { 
    flexDirection: 'row',
    alignItems: 'center',
  },

  parentButton:{
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 80,
  },

  sendButtonDisabled: { 
    backgroundColor: '',
    opacity: 0.2,
   },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
  responseContainer: { backgroundColor: '#E9F5FF', borderRadius: 8, padding: 15, marginTop: 10, borderWidth: 1, borderColor: '#BEE3F8', },
  responseContainerError: { backgroundColor: '#FFF3F3', borderRadius: 8, padding: 15, marginTop: 10, borderWidth: 1, borderColor: '#FFD6D6', },
  responseLabel: { fontSize: 14, fontWeight: 'bold', color: '#0033A0', marginBottom: 8, },
  responseText: { fontSize: 15, color: '#333', lineHeight: 22, },
  errorText: { color: '#D8000C', fontSize: 15, textAlign: 'center', },
});

export default AIChatScreen;