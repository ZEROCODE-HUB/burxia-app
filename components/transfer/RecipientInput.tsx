import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { transactionService } from '../../services/transaction.service';

interface RecipientInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onValidationChange: (isValid: boolean, data?: any) => void;
}

export const RecipientInput: React.FC<RecipientInputProps> = ({
    value,
    onChangeText,
    onValidationChange,
}) => {
    const { colors } = useTheme();
    const [validating, setValidating] = useState(false);
    const [recipientData, setRecipientData] = useState<{ holder: string; isExternal: boolean } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (value.trim().length >= 3) {
                setValidating(true);
                setTouched(true);
                setError(null);
                try {
                    const result = await transactionService.validateIdentifier(value);
                    if (result && result.valid) {
                        setRecipientData({
                            holder: result.holder || 'Desconocido',
                            isExternal: result.isExternal || false
                        });
                        onValidationChange(true, result);
                    } else {
                        setRecipientData(null);
                        setError('Cuenta no encontrada');
                        onValidationChange(false);
                    }
                } catch (e) {
                    setRecipientData(null);
                    setError('Error al validar');
                    onValidationChange(false);
                } finally {
                    setValidating(false);
                }
            } else {
                setRecipientData(null);
                setError(null);
                onValidationChange(false);
                if (value.length > 0) setTouched(true);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [value]);

    const isValid = !!recipientData;
    const styles = useMemo(() => createStyles(colors, isValid, !!error), [colors, isValid, error]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>DESTINATARIO</Text>

            <View style={styles.inputWrapper}>
                <View style={[
                    styles.inputContainer,
                    isValid ? styles.inputValid : (error ? styles.inputError : styles.inputNormal)
                ]}>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={onChangeText}
                        placeholder="Ingresá número de cuenta o alias"
                        placeholderTextColor={colors.mutedForeground}
                        autoCapitalize="none"
                    />
                    <View style={styles.iconContainer}>
                        {validating ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : isValid ? (
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        ) : error ? (
                            <Ionicons name="alert-circle" size={20} color={colors.destructive} />
                        ) : (
                            <Ionicons name="search" size={20} color={colors.mutedForeground} />
                        )}
                    </View>
                </View>

                {isValid && recipientData && (
                    <View style={styles.successMessage}>
                        <Ionicons name="person" size={12} color={colors.success} />
                        <Text style={styles.successText}>
                            {recipientData.holder} {recipientData.isExternal ? '(Externa)' : ''}
                        </Text>
                    </View>
                )}

                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}
            </View>
        </View>
    );
};

const createStyles = (colors: any, isValid: boolean, hasError: boolean) => StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        color: colors.mutedForeground,
        marginBottom: spacing.sm,
        marginLeft: spacing.md,
        opacity: 0.9,
    },
    inputWrapper: {
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.mutedAlpha[20],
        borderRadius: borderRadius.full,
        borderWidth: 1,
        height: 56,
        paddingHorizontal: spacing.lg,
    },
    inputNormal: {
        borderColor: colors.border,
    },
    inputValid: {
        borderColor: colors.success,
    },
    inputError: {
        borderColor: colors.destructive,
    },
    input: {
        flex: 1,
        fontSize: typography.sizes.base,
        fontWeight: '500',
        color: colors.foreground,
        paddingRight: spacing.sm,
    },
    iconContainer: {
        paddingLeft: spacing.sm,
    },
    successMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: spacing.xs,
        marginLeft: spacing.md,
    },
    successText: {
        fontSize: 12,
        color: colors.success,
        fontWeight: '500',
    },
    errorText: {
        fontSize: 12,
        color: colors.destructive,
        marginTop: spacing.xs,
        marginLeft: spacing.md,
    }
});
