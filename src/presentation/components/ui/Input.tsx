/**
 * Reusable Input Component
 * Professional input with validation states and icons
 */
import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TextInputProps,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../../theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    icon,
    rightIcon,
    onRightIconPress,
    helperText,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = !!error;

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputContainerFocused,
                    hasError && styles.inputContainerError,
                ]}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={hasError ? colors.destructive : colors.mutedForeground}
                        style={styles.leftIcon}
                    />
                )}

                <TextInput
                    style={[styles.input, icon && styles.inputWithLeftIcon, style]}
                    placeholderTextColor={colors.mutedForeground}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {rightIcon && (
                    <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconContainer}>
                        <Ionicons
                            name={rightIcon}
                            size={20}
                            color={colors.mutedForeground}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {(error || helperText) && (
                <Text style={[styles.helperText, hasError && styles.errorText]}>
                    {error || helperText}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        height: 48,
    },
    inputContainerFocused: {
        borderColor: colors.accent,
        borderWidth: 2,
    },
    inputContainerError: {
        borderColor: colors.destructive,
    },
    leftIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.foreground,
        height: '100%',
    },
    inputWithLeftIcon: {
        paddingLeft: 0,
    },
    rightIconContainer: {
        marginLeft: spacing.sm,
        padding: spacing.xs,
    },
    helperText: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: spacing.xs,
        marginLeft: spacing.sm,
    },
    errorText: {
        color: colors.destructive,
    },
});
