import { StyleSheet } from 'react-native';
// --- Estilos ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5', },
    scrollContent: { flexGrow: 1, padding: 20, paddingBottom: 80, }, // Más paddingBottom
    headerSection: { alignItems: 'center', marginBottom: 30, },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0033A0', marginTop: 15, marginBottom: 10, },
    description: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22, },
    actionButton: { flexDirection: 'row', backgroundColor: '#0033A0', paddingVertical: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.23, shadowRadius: 2.62, elevation: 4, },
    actionButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 10, },
    buttonIcon: {},
    previewArea: { marginTop: 25, borderTopWidth: 1, borderTopColor: '#E0E0E0', paddingTop: 15, },
    previewTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10, },
    previewItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, padding: 10, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.18, shadowRadius: 1.00, elevation: 1, },
    previewImage: { width: 50, height: 50, borderRadius: 5, marginRight: 10, backgroundColor: '#EAEAEA', },
    previewDetails: { flex: 1, justifyContent: 'center', },
    previewFileName: { fontSize: 14, color: '#444', marginBottom: 3, },
    previewFileType: { fontSize: 12, color: '#888', },
    removeButton: { padding: 5, marginLeft: 10, },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 25 : 10, borderTopWidth: 1, borderTopColor: '#E0E0E0', backgroundColor: '#FFFFFF', },
    navigationButton: { flexDirection: 'row', alignItems: 'center', padding: 10, },
    navigationButtonText: { fontSize: 16, fontWeight: '600', color: '#0033A0', marginHorizontal: 5, },
    finishButton: { backgroundColor: '#28a745', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, },
    finishButtonText: { color: '#FFFFFF', },
    actionButtonDisabled: { backgroundColor: '#A0A0A0', }, // Reutilizado para el botón Finalizar
});