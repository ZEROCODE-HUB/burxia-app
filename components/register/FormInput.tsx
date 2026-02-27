import React, { useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface FormInputProps extends TextInputProps {
    label?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    error?: string;
    rightElement?: React.ReactNode;
    containerStyle?: any;
    inputContainerStyle?: any;
    showLabel?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({
    label,
    icon,
    error,
    rightElement,
    containerStyle,
    inputContainerStyle,
    showLabel = true,
    style,
    ...props
}) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={[styles.container, containerStyle]}>
            {showLabel && label && (
                <View style={styles.labelRow}>
                    <Text style={styles.label}>{label}</Text>
                    {rightElement}
                </View>
            )}

            <View style={[
                styles.inputContainer,
                inputContainerStyle,
                error ? styles.inputError : null
            ]}>
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={colors.mutedForeground}
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[styles.input, style]}
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
        gap: spacing.xs,
        width: '100%',
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: typography.sizes.sm,
        fontWeight: '500',
        color: colors.foreground,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        height: 54,
    },
    inputError: {
        borderColor: colors.destructive,
    },
    icon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: typography.sizes.base,
        color: colors.foreground,
    },
    errorText: {
        fontSize: 12,
        color: colors.destructive,
        marginTop: 2,
    },
});
