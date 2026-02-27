import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius, shadows } from '../../theme';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface SummaryData {
    income: number;
    expenses: number;
}

interface SummaryCardsProps {
    data: SummaryData;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ data }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <View style={styles.container}>
            {/* Income Card */}
            <View style={styles.card}>
                <View style={[styles.iconBubble, styles.incomeBubble]}>
                    <Ionicons name="arrow-down-outline" size={16} color={colors.success} />
                </View>
                <Text style={styles.label}>Total Ingresos</Text>
                <Text style={styles.value}>{formatCurrency(data.income, { compact: true })}</Text>
            </View>

            {/* Expenses Card */}
            <View style={styles.card}>
                <View style={[styles.iconBubble, styles.expenseBubble]}>
                    <Ionicons name="arrow-up-outline" size={16} color={colors.destructive} />
                </View>
                <Text style={styles.label}>Total Egresos</Text>
                <Text style={styles.value}>{formatCurrency(data.expenses, { compact: true })}</Text>
            </View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    card: {
        flex: 1,
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconBubble: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    incomeBubble: {
        backgroundColor: colors.successAlpha[10],
    },
    expenseBubble: {
        backgroundColor: colors.destructiveAlpha[10],
    },
    label: {
        fontSize: 10,
        color: colors.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.foreground,
    },
});
