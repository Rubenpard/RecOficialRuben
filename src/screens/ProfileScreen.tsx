// src/screens/ProfileScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, useWindowDimensions, Alert, Platform,
  RefreshControl // Asegúrate de importar RefreshControl si lo usas
} from 'react-native';
import { TabView, SceneMap, TabBar, TabBarProps, Route, SceneRendererProps } from 'react-native-tab-view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext'; // Hook del contexto

// Importa las funciones API si las llamas DIRECTAMENTE desde aquí (mejor si el contexto maneja esto)
import { getUserProfileApi } from '../api/authService';// Importa los tipos User y Company (asegúrate que estén actualizados)
import type { User } from '../types/api/auth';// --- Importa Iconos SVG para el Header Superior ---
import MPerfilIcon from '../assets/icons/usuarioSvg.svg';
import CalendarioIcon from '../assets/icons/calendario.svg';
import PromoIcon from '../assets/icons/promoHome.svg';
import MasIcon from '../assets/icons/mas.svg';
import homeIcon from '../assets/icons/home.svg';

// --- Tipos ---
// Asegúrate de importar MainStackParamList desde donde esté definido, por ejemplo:
import type { MainStackParamList } from '../navigation/types'; // Ajusta la ruta según tu proyecto

interface TopHeaderButtonData {
    id: keyof MainStackParamList;
    title: string;
    iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

// --- Datos ---
const topHeaderButtons: TopHeaderButtonData[] = [
    { id: 'Profile', title: 'Mi Perfil',  iconComponent: MPerfilIcon },
    { id: 'Calendar', title: 'Inicio',  iconComponent: homeIcon },

];

/* ==========================================================================
   Componente Helper para Renderizar Campos
   ========================================================================== */
const renderProfileField = ( label: string, value: string | undefined | null, isEditable: boolean = false, isSecure: boolean = false, onChangeText?: (text: string) => void, key?: string ) => (
    <View key={key || label} style={styles.fieldContainer}>
      {/* <Text style={styles.fieldLabel}>{label}:</Text> */}
      {isEditable ? (
        <TextInput style={styles.textInput} value={value ?? ''} onChangeText={onChangeText} secureTextEntry={isSecure} placeholder={`Introduce ${label.toLowerCase()}`} placeholderTextColor="#A0A0A0" autoCapitalize="none" />
      ) : (
        <View style={[styles.textInput, styles.fieldValueContainer]}>
          <Text style={styles.fieldValueText}>{value || 'N/A'}</Text>
        </View>
      )}
    </View>
);

/* ==========================================================================
   Componentes para cada Pestaña (Scenes)
   ========================================================================== */

// --- Pestaña Usuario ---
interface UserTabSceneProps { userProfile: User | null; isLoading: boolean; }
const UserTabScene: React.FC<UserTabSceneProps> = ({ userProfile, isLoading }) => {
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

   const handleUpdateProfile = async () => { /* ... (lógica de guardar simulada o con API) ... */ };

   if (isLoading && ! userProfile) { return <ActivityIndicator style={styles.loader} size="large" color="#0033A0"/>; }
   if (!userProfile) { return <Text style={styles.errorTextScene}>Datos de usuario no disponibles.</Text>; }
 
   return (
   
     <ScrollView contentContainerStyle={styles.sceneContainer} keyboardShouldPersistTaps="handled">
       {renderProfileField('Usuario (Email)', userProfile.email)}
       {renderProfileField('Nueva Contraseña', password, true, true, setPassword)}
       {renderProfileField('Repetir Contraseña', repeatPassword, true, true, setRepeatPassword)}
       {renderProfileField('Nombre Completo', userProfile.name)}
       {renderProfileField('Primer Apellido', userProfile.apellido1)}
       {renderProfileField('Segundo Apellido', userProfile.apellido2)}
       {renderProfileField('NIF', userProfile.nif)}
       {renderProfileField('Teléfono Personal', userProfile.telefono)}
       {renderProfileField('Domicilio Personal', userProfile.domicilio)}
       {/* ... otros campos personales ... */}
       <TouchableOpacity style={[styles.actionButton, styles.saveButton, isSaving && styles.actionButtonDisabled]} onPress={handleUpdateProfile} disabled={isSaving} activeOpacity={0.7}>{/* ... */}</TouchableOpacity>
       <View style={{ height: 30 }} />
     </ScrollView>);
 };
 
 // --- Pestaña Empresa ---
 interface CompanyTabSceneProps { userProfile: User | null; isLoading: boolean; } // Recibe User completo
 const CompanyTabScene: React.FC<CompanyTabSceneProps> = ({ userProfile, isLoading }) => {
     if (isLoading && !userProfile) { return <ActivityIndicator style={styles.loader} size="large" color="#0033A0"/>; }
     if (!userProfile) { return <Text style={styles.errorTextScene}>Datos de empresa no disponibles.</Text>; }
     // Extrae los datos de empresa DESDE userProfile
     return (
     
     <ScrollView contentContainerStyle={styles.sceneContainer}>
       {renderProfileField('Nombre Empresa', userProfile.empresa)}
       {renderProfileField('CIF', userProfile.cif)}
       {renderProfileField('Domicilio Trabajo', userProfile.domiciliotrabajo)}
       {renderProfileField('CP Trabajo', userProfile.cptrabajo)}
       {renderProfileField('Localidad Trabajo', userProfile.localidadtrabajo)}
       {renderProfileField('Teléfono Trabajo', userProfile.telefonotrabajo)}
       {renderProfileField('Provincia Trabajo', userProfile.provinciatrabajo)}
       {renderProfileField('Email Trabajo', userProfile.emailtrabajo)}
        <View style={{ height: 30 }} />
     </ScrollView> );
 };
/* ==========================================================================
   Componente Principal ProfileScreen
   ========================================================================== */
   const ProfileScreen: React.FC = () => {
    const { userId, logout } = useAuth(); // Solo necesitamos userId y logout
  
    // --- Estado local para el perfil completo y carga/error ---
    const [userProfile, setUserProfile] = useState<User | null>(null); // Un solo estado para todo
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    // --- Estado del TabView (sin cambios) ---
    const [index, setIndex] = useState(0);
    const [routes] = useState<{ key: string; title: string }[]>([ { key: 'user', title: 'Usuario' }, { key: 'company', title: 'Empresa' }, ]);
    const layout = useWindowDimensions();
  
    // --- Carga de Datos (Llama solo a getUserProfileApi) ---
    const loadProfileData = useCallback(async (showLoading = true) => {
      if (!userId) { setUserProfile(null); setError(null); return; }
      if (showLoading) setIsLoading(true);
      setError(null);
      console.log(`loadProfileData: Fetching data for userId: ${userId}`);
      try {
        // --- Llamada API ÚNICA ---
        const userResult = await getUserProfileApi(userId);
        setUserProfile(userResult); // Guarda el objeto User completo
      } catch (err: any) {
        console.error("Error loading profile data:", err);
        setError(err.message || "Error al cargar el perfil.");
      } finally {
        if (showLoading) setIsLoading(false);
      }
    }, [userId]);

 // Carga detalles cuando la pantalla se enfoca
 useFocusEffect( useCallback(() => { if (userId) { loadProfileData(!userProfile); } else { setUserProfile(null); setError(null); } }, [userId, loadProfileData, userProfile]) );
  // Manejador de Logout
  const handleLogout = useCallback(() => { Alert.alert( "Cerrar Sesión", "¿Estás seguro?", [ { text: "Cancelar", style: "cancel" }, { text: "Cerrar Sesión", onPress: async () => { await logout(); }, style: 'destructive', }, ] ); }, [logout]);

  // Render TabBar
  const renderTabBar = ( props: SceneRendererProps & { navigationState: { routes: Route[] } } ) => {
     const ACTIVE_COLOR = '#0033A0';
     const INACTIVE_COLOR = '#666666';
     return (
     <TabBar {...props}
     indicatorStyle={styles.tabIndicator}
     style={styles.tabBar}
     renderLabel={({ route, focused }: { route: { key: string; title: string }; focused: boolean }) => (
     <Text style={[ styles.tabLabel, { color: focused ? ACTIVE_COLOR : INACTIVE_COLOR } ]}>
     {route.title}
      </Text>
      )}
      />
     );
    };

   // Mapeo de Escenas (Pasa los detalles cargados)
   const memoizedRenderScene = useCallback(
    SceneMap({
        user: () => <UserTabScene userProfile={userProfile} isLoading={isLoading} />,
        company: () => <CompanyTabScene userProfile={userProfile} isLoading={isLoading} />,
    }), [userProfile, isLoading] // Dependencias simplificadas
);

  // Renderizado Principal
  // --- Renderizado Principal ---
  if (error && !userProfile) { /* ... (Render error como antes) ... */ }
  if (isLoading && !userProfile && !error) { /* ... (Render loader inicial como antes) ... */ }

    // --- Renderizado ---
  const headerIconSize = 60; // Tamaño iconos header superior
  const gridIconSize = 90;  // Tamaño iconos cuadrícula

 return (

  <View style={styles.safeArea}>
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
   <View style={styles.container}>
       {/* TabView con las pestañas Usuario/Empresa */}
       <TabView
         navigationState={{ index, routes }}
         renderScene={memoizedRenderScene} // Usa el mapeo memoizado
         onIndexChange={setIndex}
         initialLayout={{ width: layout.width }}
         renderTabBar={renderTabBar}
         style={styles.tabView}
         lazy />

       {/* --- Botón Cerrar Sesión (SIEMPRE VISIBLE FUERA DEL IF/ELSE DE ERROR) --- */}
       <View style={styles.logoutContainer}>
         <TouchableOpacity
           style={[styles.actionButton, styles.logoutButton]}
           onPress={handleLogout} // Llama a la función del contexto
           activeOpacity={0.7}
         >
           <Text style={styles.actionButtonText}>Cerrar sesión</Text>
           <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={styles.logoutIcon} />
         </TouchableOpacity>
       </View>
       <View style={styles.butoonContainer} >
                  <View style={styles.buttonSave}>
                    <MasIcon width={40} height={40} style={{ marginRight: 4 }} />
                    <Text style= {styles.butotonText}>Cancelar</Text>
                    </View>

         <View style={styles.buttonSave}>
          <Text style= {styles.butotonText}>Guardar</Text>
          <MasIcon width={40} height={40} style={{ marginRight: 4 }} />
          </View>
       </View>
     </View>
</View>
 );
};

const gridPaddingHorizontal = 15;

const styles = StyleSheet.create({

    safeArea: {
    flex: 1,
    backgroundColor: '#3f4c53', // Fondo oscuro general
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

    container: {
      flex: 1,
      margin: 20,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
    },
    tabView: {
      flex: 1,
      color: 'red', // Color de texto general
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

    tabBar: {
      fontSize: 16,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
      elevation: 2, 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 1.5,
      borderTopStartRadius: 20,
      borderTopEndRadius: 20,
    },
    tabIndicator: {
      backgroundColor: '#0033A0',
      height: 50,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
    },
    tabLabel: {
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
      paddingHorizontal: 5,
      marginVertical: 10,
      textTransform: 'none',
    },
    sceneContainer: {
      flexGrow: 1,
    },
    fieldContainer: {
    },
    fieldLabel: {
      fontSize: 13,
      color: '#555',
      marginBottom: 6,
      fontWeight: '500',
    },
    fieldValueContainer: { 
      backgroundColor: '#FFFFFF', 
      paddingHorizontal: 14, 
      borderRadius: 6, 
      borderWidth: 1, 
      borderColor: '#E0E0E0', 
      minHeight: 48, 
      justifyContent: 'center', 
    },
    fieldValueText: { 
      fontSize: 16, 
      color: '#333', 
    },
    
    textInput: { 
      fontSize: 16, 
      color: '#333', 
      borderWidth: 1, 
      borderColor: '#B0B0B0', 
      borderRadius: 6, 
      paddingHorizontal: 14, 
      backgroundColor: '#FFFFFF', 
      minHeight: 48, 
      top: 0,
    },

    actionButton: { 
      width: '50%',
      flexDirection: 'row', 
      paddingVertical: 14, 
      borderTopRightRadius: 20,
      borderBottomRightRadius: 20,
      alignItems: 'center', 
      justifyContent: 'center', 
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.23, 
      shadowRadius: 2.62, 
      elevation: 4, },

    actionButtonText: { 
      color: '#FFFFFF', 
      fontSize: 16, 
      fontWeight: 'bold', 
    },

    actionButtonDisabled: { 
      backgroundColor: '#A0A0A0', 
      elevation: 0, 
    },
    saveButton: { 
      backgroundColor: '#28a745', 
      marginTop: 25, 
    },
    logoutContainer: { 
      width: '100%',
      height: 70,
      paddingBottom: Platform.OS === 'ios' ? 30 : 15,  
    },
    logoutButton: { backgroundColor: '#2c4391', marginTop: 0, },
    logoutIcon: { marginLeft: 10, },
    
     butoonContainer:{
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 20,
     },

     buttonSave: {
       height: 30,
       flexDirection: 'row', 
       alignItems: 'center', 
       gap: 10, 
       fontSize: 80,
    },

    butotonText: {
      fontSize: 20, 
    }

});

export default ProfileScreen;