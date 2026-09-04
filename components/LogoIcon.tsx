import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

interface LogoIconProps {
    size?: number;
}

/**
 * Isotipo SVG de Proxpera - Letra M con flecha de crecimiento
 */
export const LogoIcon: React.FC<LogoIconProps> = ({ size = 56 }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
            {/* Fondo redondeado azul oscuro */}
            <Rect width="100" height="100" rx="20" fill="#0A2540" />

            {/* Pata izquierda de la M */}
            <Path d="M18 75V30L32 44V75H18Z" fill="white" />

            {/* Diagonal izquierda de la M (hacia el centro) */}
            <Path
                d="M18 30L50 58"
                stroke="white"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Pata derecha de la M */}
            <Path d="M68 44V75H82V30L68 44Z" fill="white" />

            {/* Diagonal derecha de la M - en azul claro formando la flecha */}
            <Path
                d="M50 58L75 22"
                stroke="#5BA3E8"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Punta de flecha */}
            <Path
                d="M64 18H82V36"
                stroke="#5BA3E8"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />
        </Svg>
    );
};
