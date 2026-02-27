import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { TransactionItem } from './TransactionItem';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { transactionService } from '../../services/transaction.service';
import { formatBalance } from '../../utils/formatters';

export const TransactionsList = () => {
    const { colors } = useTheme();
    const { account } = useAuth();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [transactions, setTransactions] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadTransactions();
    }, [account]);

    const loadTransactions = async () => {
        if (!account) return;
        try {
            const data = await transactionService.getRecentTransactions(account.id);
            // Map DB transaction to Component props
            const mapped = data.map(t => {
                const isIncome = t.to_account_id === account.id;
                // Si es ingreso externo, mostrar nombre del remitente, sino tipo de transacción
                const title = isIncome
                    ? (t.external_holder_name || t.transaction_types.name)
                    : (t.external_holder_name || t.transaction_types.name);

                return {
                    id: t.id,
                    title: title,
                    description: t.concept || t.transaction_types.name,
                    amount: formatBalance(t.amount),
                    type: isIncome ? 'income' : 'expense',
                    iconName: isIncome ? 'arrow-down' : 'arrow-up', // Simple mapping for now
                };
            });
            setTransactions(mapped);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <View style={styles.container}><Text style={{ color: colors.mutedForeground }}>Cargando...</Text></View>;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Últimos Movimientos</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/movements')}>
                    <Text style={styles.link}>Ver todo</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            <View style={styles.list}>
                {transactions.length === 0 ? (
                    <Text style={{ color: colors.mutedForeground }}>No hay movimientos recientes</Text>
                ) : (
                    transactions.map((transaction) => (
                        <TransactionItem key={transaction.id} {...transaction} />
                    ))
                )}
            </View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.lg,
        paddingBottom: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.foreground,
    },
    link: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        color: colors.accent,
    },
    list: {
        gap: spacing.xs,
    },
});
