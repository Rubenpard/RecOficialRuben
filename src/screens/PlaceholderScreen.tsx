// src/screens/PlaceholderScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Recibe la ruta para saber qué pantalla debería ser (útil para depurar)
interface PlaceholderScreenProps {
  route?: {
    name?: string;
  };
}

const PlaceholderScreen: React.FC<PlaceholderScreenProps> = ({ route }) => {
  const screenName = route?.name ?? 'Placeholder'; // Obtiene el nombre de la ruta si está disponible

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla:</Text>
      <Text style={[styles.text, styles.screenName]}>{screenName}</Text>
      <Text style={styles.subText}>(Contenido pendiente)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECECEC', // Fondo gris claro
    padding: 20,
  },
  text: {
    fontSize: 20,
    color: '#555',
    textAlign: 'center',
  },
  screenName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#0033A0', // Azul RecOficial
      marginVertical: 10,
  },
  subText: {
      fontSize: 16,
      color: '#888',
      marginTop: 5,
  }
});

export default PlaceholderScreen;