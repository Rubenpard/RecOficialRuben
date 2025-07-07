// src/navigation/headers/HeaderRoutes.tsx
import React from 'react'; // Importación base de React
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import MasIcon from '../assets/icons/mas.svg';
import homeIcon from '../assets/icons/home.svg';

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
    </View>
    );

export default HeaderRoutes;