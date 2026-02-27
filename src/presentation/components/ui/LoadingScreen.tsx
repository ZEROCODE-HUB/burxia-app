/**
 * Loading Screen Component
 * Full-screen loading indicator with message
 */
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../../theme';

interface LoadingScreenProps {
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Cargando...' }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.accent} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    message: {
        marginTop: spacing.lg,
        fontSize: 16,
        color: colors.mutedForeground,
        textAlign: 'center',
    },
});
