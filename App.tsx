// App.tsx
import React from 'react';
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
// --- IMPORTA LA FUNCIÓN DE LA LIBRERÍA ---
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// --- Importa el Contexto ---
import { AuthProvider, useAuth } from './src/context/AuthContext';
// --- Importa tus Componentes/Navegadores ---
import LoginScreen from './src/screens/LoginScreen';
import MainStackNavigator from './src/navigation/MainStackNavigator'; // <-- Usa el nombre de archivo correcto

// Tipos para el Stack Raíz
export type RootStackParamList = { Login: undefined; MainApp: undefined; };
// Crea el Stack Raíz USANDO LA FUNCIÓN IMPORTADA
const Stack = createNativeStackNavigator<RootStackParamList>();



// Componente Interno AppNavigator
const AppNavigator: React.FC = () => {
    const { isAuthenticated, isLoading } = useAuth();
      if (isLoading) { return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0033A0"/>
      </View> );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                // Usa MainStackNavigator (tu navegador principal post-login)
                <Stack.Screen name="MainApp" component={MainStackNavigator} />
            ) : (
                <Stack.Screen name="Login" component={LoginScreen} />
            )}
        </Stack.Navigator>
    );
};



// Componente App principal
function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <StatusBar barStyle={'light-content'} backgroundColor={'#002266'}/>
      <NavigationContainer>
         <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;

// Estilos
const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F2F5' }
});