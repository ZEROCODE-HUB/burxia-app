import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatBalance } from '../../utils/formatters';
import { useAccount } from '../../hooks/useAccount';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export const BalanceCard = () => {
    const { colors, isDark } = useTheme();
    const { balance } = useAccount();
    const [showBalance, setShowBalance] = useState(false);
    const styles = useMemo(() => createStyles(colors), [colors]);

    const formattedBalance = formatBalance(balance);

    // Ajusta el tamaño del texto según la cantidad de caracteres
    const balanceFontSize = useMemo(() => {
        const length = formattedBalance.length;
        if (length <= 12) return typography.sizes['4xl'];
        if (length <= 16) return typography.sizes['3xl'];
        if (length <= 20) return typography.sizes['2xl'];
        return typography.sizes.xl;
    }, [formattedBalance]);

    return (
        <View style={styles.card}>
            {/* Decorative blurs */}
            <View style={[styles.blurCircle, styles.blurTopRight, { backgroundColor: colors.accentAlpha[5] }]} />
            <View style={[styles.blurCircle, styles.blurBottomLeft, { backgroundColor: colors.accentAlpha[5] }]} />

            <Text style={styles.label}>Saldo Disponible</Text>

            <View style={styles.balanceContainer}>
                <Text
                    style={[styles.balanceText, { fontSize: balanceFontSize, color: colors.foreground }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                >
                    {showBalance ? formattedBalance : "$ ••••••••"}
                </Text>

                <TouchableOpacity
                    onPress={() => setShowBalance(!showBalance)}
                    style={styles.eyeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name={showBalance ? "eye-outline" : "eye-off-outline"}
                        size={24}
                        color={colors.mutedForeground}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        marginHorizontal: spacing.lg,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    blurCircle: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    blurTopRight: {
        top: -30,
        right: -30,
    },
    blurBottomLeft: {
        bottom: -30,
        left: -30,
    },
    label: {
        color: colors.mutedForeground,
        fontSize: typography.sizes.sm,
        fontWeight: '500',
        marginBottom: spacing.sm,
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: 4,
    },
    balanceText: {
        fontWeight: '700',
        letterSpacing: -0.5,
    },
    eyeButton: {
        padding: 4,
    },
});
