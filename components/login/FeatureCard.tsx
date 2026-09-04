import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';

interface FeatureCardProps {
    icon: React.ReactNode;
    label: string;
    gradientColors: [string, string, ...string[]]; // Fuerza al menos 2 colores
    onPress?: () => void;
    style?: ViewStyle;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
    icon,
    label,
    gradientColors,
    onPress,
    style,
}) => {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                { opacity: pressed ? 0.8 : 1 }, // Feedback visual simple
                styles.wrapper,
                style
            ]}
        >
            <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.container}
            >
                {/* Si querías el efecto de brillo, actívalo aquí: */}
                <View style={styles.overlay} />

                <View style={styles.content}>
                    {icon}
                    <Text
                        style={styles.label}
                        numberOfLines={2}
                    >
                        {label}
                    </Text>
                </View>
            </LinearGradient>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        aspectRatio: 1,
        ...shadows.sm,
    },
    container: {
        flex: 1, // Ocupa todo el espacio del Pressable
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Un toque sutil
    },
    content: {
        gap: spacing.sm,
        alignItems: 'center',
    },
    label: {
        color: colors.primaryForeground,
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        textAlign: 'center',
    },
});