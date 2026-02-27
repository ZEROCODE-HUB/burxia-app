/**
 * Reusable Card Component
 * Professional card with consistent styling
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius } from '../../../theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    padding = 'md',
    variant = 'default',
}) => {
    return (
        <View
            style={[
                styles.base,
                styles[variant],
                styles[`padding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
                style,
            ]}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    base: {
        borderRadius: borderRadius.xl,
        backgroundColor: colors.card,
    },
    default: {
        borderWidth: 1,
        borderColor: colors.border,
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    outlined: {
        borderWidth: 2,
        borderColor: colors.border,
    },
    paddingNone: {
        padding: 0,
    },
    paddingSm: {
        padding: spacing.sm,
    },
    paddingMd: {
        padding: spacing.md,
    },
    paddingLg: {
        padding: spacing.lg,
    },
});
