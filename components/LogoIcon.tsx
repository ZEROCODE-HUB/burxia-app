import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface LogoIconProps {
    size?: number;
    style?: StyleProp<ImageStyle>;
}

/**
 * Isotipo de Burxia (letras "BX", violeta facetado). Imagen del manual de
 * marca; para cambiarlo, reemplazá `assets/brand-isotipo.png`.
 */
export const LogoIcon: React.FC<LogoIconProps> = ({ size = 56, style }) => (
    <Image
        source={require('../assets/brand-isotipo.png')}
        style={[{ width: size, height: size }, style]}
        resizeMode="contain"
    />
);
