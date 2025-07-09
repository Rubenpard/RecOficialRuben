// src/navigation/headers/HeaderRoutes.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import type { MainStackParamList } from '../types/navigation';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import PromoIcon from '../assets/icons/promoHome.svg';
import MasIcon from '../assets/icons/mas.svg';
import homeIcon from '../assets/icons/home.svg';
import LogOutIcon from '../assets/icons/logout.svg'; 

// Tamaños y paddings
const headerIconSize = 60;
const gridPaddingVertical = 20;
const gridPaddingHorizontal = 16;

interface TopHeaderButtonData {
    id: keyof MainStackParamList;
    title: string;
    iconComponent: React.FC<React.SVGProps<SVGSVGElement>>;
}

const HeaderRoutes = () => {
  const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

  // --- Datos ---
  const topHeaderButtons = [
    { id: 'Profile', title: 'Mi Perfil', iconComponent: MPerfilIcon },
    { id: 'Calendar', title: 'Inicio', iconComponent: HomeIcon },
  ];

  const navigateTo = (screen: keyof MainStackParamList) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.topHeaderContainer}>
        {topHeaderButtons.map((button, index) => {
          const Icon = button.iconComponent;
          const isFirst = index === 0;
          const isLast = index === topHeaderButtons.length - 1;

          return (
            <TouchableOpacity
              key={button.id}
              style={[
                styles.topHeaderButton,
                isFirst && styles.firstButton,
                isLast && styles.lastButton,
                !isFirst && !isLast && styles.middleButton,
              ]}
              onPress={() => navigateTo(button.id)}
              activeOpacity={0.7}
            >
              <Icon
                width={headerIconSize}
                height={headerIconSize}
                fill={isFirst ? '#2c4391' : '#ffffff'}
              />
              <Text
                style={[
                  styles.topHeaderText,
                  isFirst && { color: '#000000' },
                  !isFirst && { color: '#ffffff' },
                ]}
              >
                {button.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    backgroundColor: '#f2f2f2',
  },
  topHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#b1b1ae',
    borderRadius: 20,
    marginVertical: gridPaddingVertical,
    marginHorizontal: gridPaddingHorizontal,
    padding: 10,
  },
  topHeaderButton: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#c1c1c1',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  topHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: -14,
  },
  firstButton: {},
  middleButton: {},
  lastButton: {},
});

export default HeaderRoutes;
