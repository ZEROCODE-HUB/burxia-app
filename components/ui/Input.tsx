import React, { useMemo } from 'react';
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { typography, borderRadius, spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends TextInputProps {
    label?: string;
    icon?: React.ReactNode;
    error?: string;
    containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
    label,
    icon,
    error,
    containerStyle,
    style,
    ...props
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[
                        styles.input,
                        icon ? styles.inputWithIcon : undefined,
                        error ? styles.inputError : undefined,
                        style,
                    ]}
                    placeholderTextColor={colors.mutedForeground}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        width: '100%',
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: '500',
        color: colors.mutedForeground,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    inputContainer: {
        position: 'relative',
        width: '100%',
    },
    input: {
        height: 48,
        backgroundColor: colors.mutedAlpha[20],
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.base,
        fontSize: typography.sizes.base,
        color: colors.foreground,
    },
    inputWithIcon: {
        paddingLeft: 40,
    },
    inputError: {
        borderColor: colors.destructive,
    },
    iconContainer: {
        position: 'absolute',
        left: 12,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        zIndex: 1,
    },
    errorText: {
        fontSize: typography.sizes.xs,
        color: colors.destructive,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
});
