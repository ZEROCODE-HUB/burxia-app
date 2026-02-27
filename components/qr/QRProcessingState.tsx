import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { LogoIcon } from '../LogoIcon';

export const QRProcessingState = () => {
    const { colors } = useTheme();
    const styles = createStyles(colors);

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }]
                    }
                ]}
            >
                <View style={styles.iconContainer}>
                    <LogoIcon size={56} />
                </View>

                <ActivityIndicator
                    size="large"
                    color={colors.accent}
                    style={styles.spinner}
                />

                <View style={styles.textContainer}>
                    <Text style={styles.title}>Verificando QR</Text>
                    <Text style={styles.subtitle}>Buscando información de la cuenta...</Text>
                </View>
            </Animated.View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.background + '80', // Backdrop dim
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },
    content: {
        backgroundColor: colors.card,
        padding: spacing.xl,
        borderRadius: 24,
        alignItems: 'center',
        width: 280,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        marginBottom: spacing.md,
    },
    spinner: {
        marginBottom: spacing.md,
    },
    textContainer: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    title: {
        color: colors.foreground,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        color: colors.mutedForeground,
        fontSize: 14,
        textAlign: 'center',
    },
});
