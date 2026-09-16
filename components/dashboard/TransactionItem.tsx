import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../theme';
import { DashboardTransaction } from '../../types/dashboard';
import { useTheme } from '../../context/ThemeContext';

interface TransactionItemProps extends DashboardTransaction {
    onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
    iconName,
    title,
    description,
    amount,
    type,
    onPress,
}) => {
    const { colors } = useTheme();
    const isIncome = type === 'income';
    const styles = useMemo(() => createStyles(colors, isIncome), [colors, isIncome]);

    const content = (
        <>
            {/* Icon + Info */}
            <View style={styles.leftContent}>
                <View style={[styles.iconBox, isIncome ? styles.incomeIconBox : styles.expenseIconBox]}>
                    <Ionicons
                        name={iconName as any}
                        size={20}
                        color={isIncome ? colors.accent : colors.mutedForeground}
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title} numberOfLines={1}>{title}</Text>
                    <Text style={styles.description} numberOfLines={1}>{description}</Text>
                </View>
            </View>

            {/* Amount */}
            <Text style={[styles.amount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>
                {amount}
            </Text>
        </>
    );

    if (!onPress) {
        return <View style={styles.container}>{content}</View>;
    }

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {content}
        </TouchableOpacity>
    );
};

const createStyles = (colors: any, isIncome: boolean) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.base,
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        // Sin marginBottom: el espaciado entre filas lo define SOLO el contenedor
        // (gap en el dashboard / ItemSeparator en Movimientos). Así el hueco es
        // idéntico entre movimientos y solicitudes (antes se sumaban y quedaba disparejo).
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        flex: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    incomeIconBox: {
        backgroundColor: colors.accentAlpha[10],
    },
    expenseIconBox: {
        backgroundColor: colors.mutedAlpha[20],
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
        marginBottom: 2,
    },
    description: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    amount: {
        fontSize: 14,
        fontWeight: '700',
        marginLeft: spacing.sm,
    },
    incomeAmount: {
        color: colors.success,
    },
    expenseAmount: {
        color: colors.foreground,
    },
});
