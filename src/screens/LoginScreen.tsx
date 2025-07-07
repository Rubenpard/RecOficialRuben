// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image, StyleSheet,
  ActivityIndicator, ImageBackground, StatusBar, Platform,
  KeyboardAvoidingView, ScrollView, Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

// Importaciones de API y Contexto (verifica rutas)
import { useAuth } from '../context/AuthContext'; // Hook del contexto
import { loginApi } from '../api/authService';     // Función API
import type { LoginApiResponse } from '../types/api/auth'; // Tipo Respuesta API

// Placeholders de Imagen (reemplaza con require si tienes las imágenes)
const logoRecoficial: any = null;
const loginBackground: any = null;

// Tipo Props (aunque navigation se usa menos directamente)
type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

// Componente LoginScreen
const LoginScreen: React.FC<LoginScreenProps> = () => {
  // Hook de autenticación
  const { login } = useAuth();

  // Estados locales del formulario
  const [username, setUsername] = useState<string>('aseippruebaapp');
  const [password, setPassword] = useState<string>('aseippruebaapp');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loader para la llamada API
  const [error, setError] = useState<string | null>(null);

  // Manejador de Login
  const handleLogin = async (): Promise<void> => {
    if (isLoading) return;
    if (!username.trim() || !password) { setError("Introduce usuario y contraseña."); return; }

    setIsLoading(true);
    setError(null);

    try {
      const response: LoginApiResponse = await loginApi({
          user: username.trim(),
          password: password,
          app: "3" // Campo fijo
      });

      if (response?.success && response?.bearerToken) {
        // Llama a la función login del contexto (maneja storage, estado, interceptors)
        await login( response.bearerToken, response.id, username.trim() );
        // La navegación ocurrirá automáticamente cuando cambie el estado en App.tsx
        // No necesitamos setIsLoading(false) aquí, el contexto lo maneja
      } else {
        setError('Usuario o contraseña incorrectos.');
        setIsLoading(false); // Detiene loader local en caso de fallo lógico
      }
    } catch (apiError: any) {
      setError(apiError.message || 'Error de conexión.');
      setIsLoading(false); // Detiene loader local en caso de fallo de red/API
    }
  };

  // Manejador Olvidé Contraseña (simulado)
  const handleForgotPassword = (): void => { Alert.alert("Contraseña Olvidada", "Funcionalidad pendiente."); };

  // JSX del componente (sin cambios respecto a la versión anterior completa)
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
      <StatusBar barStyle="light-content" />
      {loginBackground ? (
        <ImageBackground source={loginBackground} resizeMode="cover" style={styles.background}>
            {/* ... contenido con fondo ... */}
             <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                 {logoRecoficial ? ( <Image source={logoRecoficial} style={styles.logo} resizeMode="contain" /> )
                    : ( <Text style={[styles.logoPlaceholder, styles.textShadow]}>RecOficial Service</Text> )}
                 <View style={styles.formContainer}>
                    <Text style={styles.title}>Login</Text>
                    {/* ... Inputs y Botones ... */}
                    <TextInput style={styles.input} placeholder="Usuario (Email)" value={username} onChangeText={setUsername} placeholderTextColor="#A0A0A0" keyboardType="email-address" autoCapitalize="none" returnKeyType="next"/>
                    <View style={styles.passwordContainer}>
                      <TextInput style={[styles.input, styles.inputPassword]} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} placeholderTextColor="#A0A0A0" returnKeyType="done" onSubmitEditing={handleLogin}/>
                      <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsPasswordVisible(prev => !prev)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} >
                        <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#555" />
                      </TouchableOpacity>
                    </View>
                    {error && <Text style={styles.errorText}>{error}</Text>}
                    <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
                        <Text style={styles.forgotPasswordText}>He olvidado la contraseña</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} onPress={handleLogin} disabled={isLoading} activeOpacity={0.7} >
                      {isLoading ? ( <ActivityIndicator color="#FFFFFF" size="small"/> ) : ( <Text style={styles.loginButtonText}>Entrar</Text> )}
                    </TouchableOpacity>
                 </View>
                  <View style={{ height: 50 }} />
             </ScrollView>
        </ImageBackground>
      ) : (
        <View style={[styles.background, styles.centeredFallback, { backgroundColor: '#EAEAEA' }]}>
            {/* ... contenido sin fondo ... */}
             <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                 {logoRecoficial ? ( <Image source={logoRecoficial} style={styles.logo} resizeMode="contain" /> )
                    : ( <Text style={[styles.logoPlaceholder]}>RecOficial Service</Text> )}
                 <View style={styles.formContainer}>
                     <Text style={styles.title}>Login</Text>
                    <TextInput style={styles.input} placeholder="Usuario (Email)" value={username} onChangeText={setUsername} placeholderTextColor="#A0A0A0" keyboardType="email-address" autoCapitalize="none" returnKeyType="next"/>
                    <View style={styles.passwordContainer}>
                      <TextInput style={[styles.input, styles.inputPassword]} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} placeholderTextColor="#A0A0A0" returnKeyType="done" onSubmitEditing={handleLogin}/>
                      <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsPasswordVisible(prev => !prev)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} >
                        <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#555" />
                      </TouchableOpacity>
                    </View>
                    {error && <Text style={styles.errorText}>{error}</Text>}
                    <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
                        <Text style={styles.forgotPasswordText}>He olvidado la contraseña</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.loginButton, isLoading && styles.loginButtonDisabled]} onPress={handleLogin} disabled={isLoading} activeOpacity={0.7} >
                      {isLoading ? ( <ActivityIndicator color="#FFFFFF" size="small"/> ) : ( <Text style={styles.loginButtonText}>Entrar</Text> )}
                    </TouchableOpacity>
                 </View>
                  <View style={{ height: 50 }} />
             </ScrollView>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: { flex: 1, },
  background: { flex: 1, width: '100%', },
  centeredFallback: { flex: 1, justifyContent: 'center', alignItems: 'center'},
  overlay: { flex: 1, },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20, },
  logo: { width: '75%', maxWidth: 300, height: 70, marginBottom: 30, },
  logoPlaceholder: { fontSize: 32, fontWeight: 'bold', color: '#0033A0', textAlign: 'center', marginBottom: 30, },
  textShadow: { textShadowColor: 'rgba(0, 0, 0, 0.4)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, },
  formContainer: { width: '100%', maxWidth: 400, padding: 25, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 15, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 3, }, shadowOpacity: 0.27, shadowRadius: 4.65, elevation: 6, },
  title: { fontSize: 26, fontWeight: '600', marginBottom: 30, color: '#222222', },
  input: { width: '100%', height: 55, backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 18, marginBottom: 18, fontSize: 16, borderWidth: 1, borderColor: '#D0D0D0', color: '#333333', },
  passwordContainer: { width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 8, },
  inputPassword: { flex: 1, marginBottom: 0, paddingRight: 50, },
  eyeIcon: { position: 'absolute', right: 0, height: 55, width: 55, justifyContent: 'center', alignItems: 'center', },
  errorText: { color: '#D8000C', backgroundColor: '#FFD2D2', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5, textAlign: 'center', marginBottom: 15, width: '100%', fontSize: 14, },
  forgotPasswordButton: { alignSelf: 'flex-start', marginBottom: 25, paddingVertical: 5, },
  forgotPasswordText: { color: '#0056b3', fontSize: 14, textDecorationLine: 'underline', },
  loginButton: { width: '100%', height: 55, backgroundColor: '#0033A0', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, },
  loginButtonDisabled: { backgroundColor: '#A0B5D3', elevation: 0, },
  loginButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, },
});
// Exportación por defecto
export default LoginScreen;