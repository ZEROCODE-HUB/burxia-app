import React, { useMemo } from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { typography, borderRadius, shadows as staticShadows } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    children,
    variant = 'primary',
    disabled = false,
    loading = false,
    style,
    textStyle,
}) => {
    const { colors, isDark } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const buttonStyles = [
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        variant === 'ghost' && styles.ghostButton,
        variant === 'destructive' && styles.destructiveButton,
        (disabled || loading) && styles.disabledButton,
        style,
    ];

    const textStyles = [
        styles.text,
        variant === 'primary' && styles.primaryText,
        variant === 'secondary' && styles.secondaryText,
        variant === 'outline' && styles.outlineText,
        variant === 'ghost' && styles.ghostText,
        variant === 'destructive' && styles.destructiveText,
        (disabled || loading) && styles.disabledText,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.accentForeground : colors.accent}
                    size="small"
                />
            ) : (
                <Text style={textStyles}>{children}</Text>
            )}
        </TouchableOpacity>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    button: {
        height: 48,
        borderRadius: borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        flexDirection: 'row',
    },
    primaryButton: {
        backgroundColor: colors.accent,
        // Forzar sombra oscura incluso en dark mode o quitarla
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryButton: {
        backgroundColor: colors.muted,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: colors.border,
    },
    ghostButton: {
        backgroundColor: 'transparent',
    },
    destructiveButton: {
        backgroundColor: colors.destructive,
    },
    disabledButton: {
        opacity: 0.5,
    },
    text: {
        fontSize: typography.sizes.base,
        fontWeight: '700',
    },
    primaryText: {
        color: colors.accentForeground,
    },
    secondaryText: {
        color: colors.foreground,
    },
    outlineText: {
        color: colors.accent,
    },
    ghostText: {
        color: colors.accent,
    },
    destructiveText: {
        color: colors.destructiveForeground,
    },
    disabledText: {
        opacity: 0.7,
    },
});
