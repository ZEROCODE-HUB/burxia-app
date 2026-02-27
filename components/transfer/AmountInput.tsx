import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { typography, spacing, borderRadius } from '../../theme';
import { formatCurrency, parseAmount } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface AmountInputProps {
    value: string;
    onChange: (value: string) => void;
    availableBalance: number;
}

const formatWhileTyping = (input: string): string => {
    if (!input || input === "") return "";

    const parts = input.split(",");
    let integerPart = parts[0] || "";
    const decimalPart = parts[1];

    integerPart = integerPart.replace(/\./g, "");

    if (integerPart.length > 3) {
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    if (decimalPart !== undefined) {
        return `${integerPart},${decimalPart}`;
    }

    return integerPart;
};

export const AmountInput: React.FC<AmountInputProps> = ({
    value,
    onChange,
    availableBalance
}) => {
    const { colors } = useTheme();
    const [displayValue, setDisplayValue] = useState("");
    const numericAmount = parseAmount(value);
    const isInsufficientBalance = numericAmount > availableBalance;

    const styles = useMemo(() => createStyles(colors), [colors]);

    // Sincronizar
    useEffect(() => {
        // Si viene value limpia "0", mostramos vacío o "0"
        if (value === "0" && displayValue === "") return;
    }, [value]);

    const handleChangeText = (text: string) => {
        let inputValue = text;
        // Permitir solo números y comas
        inputValue = inputValue.replace(/[^\d,]/g, "");

        // Asegurar una sola coma
        const parts = inputValue.split(',');
        if (parts.length > 2) {
            inputValue = parts[0] + ',' + parts.slice(1).join('');
        }

        // Validar decimales
        if (parts[1] && parts[1].length > 2) {
            inputValue = parts[0] + ',' + parts[1].substring(0, 2);
        }

        const formatted = formatWhileTyping(inputValue);
        setDisplayValue(formatted);
        onChange(inputValue.replace(/\./g, ""));
    };

    const digitCount = displayValue.replace(/[^\d]/g, "").length;
    const getFontSize = () => {
        if (digitCount > 10) return 32;
        if (digitCount > 8) return 40;
        if (digitCount > 5) return 48;
        return 56;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>MONTO A TRANSFERIR</Text>

            <View style={styles.inputWrapper}>
                <Text style={[styles.currencySymbol, { fontSize: getFontSize() * 0.6 }]}>$</Text>
                <TextInput
                    value={displayValue}
                    onChangeText={handleChangeText}
                    keyboardType="numeric" // En iOS numeric no tiene coma, usar decimal-pad
                    style={[
                        styles.input,
                        { fontSize: getFontSize() },
                        isInsufficientBalance && styles.inputError
                    ]}
                    placeholder="0,00"
                    placeholderTextColor={colors.mutedForeground + '66'}
                    selectionColor={colors.accent}
                />
            </View>

            <View style={[
                styles.balanceBadge,
                isInsufficientBalance ? styles.balanceError : styles.balanceNormal
            ]}>
                {isInsufficientBalance ? (
                    <>
                        <Ionicons name="alert-circle" size={16} color={colors.destructive} />
                        <Text style={styles.errorText}>Saldo insuficiente</Text>
                    </>
                ) : (
                    <>
                        <Ionicons name="wallet-outline" size={16} color={colors.accent} />
                        <Text style={styles.balanceText}>
                            Disponible: <Text style={styles.balanceValue}>{formatCurrency(availableBalance)}</Text>
                        </Text>
                    </>
                )}
            </View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.5,
        color: colors.mutedForeground,
        marginBottom: spacing.xs,
        opacity: 0.8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        height: 80, // Fijo para evitar saltos
    },
    currencySymbol: {
        color: colors.mutedForeground,
        marginRight: spacing.xs,
        fontWeight: '500',
        opacity: 0.5,
    },
    input: {
        fontWeight: '700',
        color: colors.foreground,
        minWidth: 100,
        textAlign: 'center',
        padding: 0,
    },
    inputError: {
        color: colors.destructive,
    },
    balanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        marginTop: spacing.md,
    },
    balanceNormal: {
        backgroundColor: colors.mutedAlpha[10],
        borderColor: colors.border,
    },
    balanceError: {
        backgroundColor: colors.destructiveAlpha[10],
        borderColor: colors.destructiveAlpha[20],
    },
    balanceText: {
        fontSize: 12, // sm
        color: colors.mutedForeground,
        fontWeight: '500',
    },
    balanceValue: {
        fontWeight: '700',
        color: colors.foreground,
    },
    errorText: {
        fontSize: 12,
        color: colors.destructive,
        fontWeight: '600',
    },
});
