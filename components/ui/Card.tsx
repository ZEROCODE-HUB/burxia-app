import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { borderRadius, shadows } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined';
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    style,
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const cardStyles = [
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        style,
    ];

    return <View style={cardStyles}>{children}</View>;
};

const createStyles = (colors: any) => StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        ...shadows.card,
    },
    elevated: {
        ...shadows.elevated,
    },
    outlined: {
        borderWidth: 1,
        borderColor: colors.border,
        shadowOpacity: 0,
        elevation: 0,
    },
});
