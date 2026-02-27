/**
 * Reusable Button Component
 * Professional button with variants and loading states
 */
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    View,
} from 'react-native';
import { colors, spacing, borderRadius } from '../../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    style,
    textStyle,
    fullWidth = false,
}) => {
    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            style={[
                styles.base,
                styles[variant],
                styles[size],
                fullWidth && styles.fullWidth,
                isDisabled && styles.disabled,
                style,
            ]}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.primaryForeground : colors.accent}
                    size="small"
                />
            ) : (
                <Text style={[styles.text, styles[`${variant}Text`], styles[`${size}Text`], textStyle]}>
                    {children}
                </Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
    },
    fullWidth: {
        width: '100%',
    },

    // Variants
    primary: {
        backgroundColor: colors.accent,
    },
    secondary: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    destructive: {
        backgroundColor: colors.destructive,
    },
    ghost: {
        backgroundColor: 'transparent',
    },

    // Sizes
    sm: {
        height: 40,
        paddingHorizontal: spacing.md,
    },
    md: {
        height: 48,
    },
    lg: {
        height: 56,
    },

    // Text styles
    text: {
        fontWeight: '600',
    },
    primaryText: {
        color: colors.accentForeground,
        fontSize: 16,
    },
    secondaryText: {
        color: colors.foreground,
        fontSize: 16,
    },
    destructiveText: {
        color: colors.destructiveForeground,
        fontSize: 16,
    },
    ghostText: {
        color: colors.accent,
        fontSize: 16,
    },
    smText: {
        fontSize: 14,
    },
    mdText: {
        fontSize: 16,
    },
    lgText: {
        fontSize: 16,
    },

    // States
    disabled: {
        opacity: 0.5,
    },
});
