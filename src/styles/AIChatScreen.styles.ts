import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1, // Importante para que el ScrollView funcione bien con KeyboardAvoidingView
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F2F5', // Fondo gris claro
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10, // Evita que el texto largo se pegue a los bordes
  },
  headerIcon: {
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0033A0', // Azul RecOficial
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 21, // Mejora legibilidad
  },
  inputContainer: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    minHeight: 120, // Altura mínima para el área de texto
    maxHeight: 250, // Altura máxima antes de scroll interno (si lo hubiera)
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top', // Alinea el texto arriba en Android
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#0033A0', // Azul principal
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20, // Espacio antes de la respuesta/error
  },
  sendButtonDisabled: {
    backgroundColor: '#A0B5D3', // Azul grisáceo deshabilitado
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginTop: 10, // Espacio respecto al botón o error previo
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: "#000", // Sombra ligera para la respuesta
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0033A0',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  errorText: {
    color: '#D8000C', // Rojo error
    fontSize: 15,
    textAlign: 'center',
  },
});

export default styles;