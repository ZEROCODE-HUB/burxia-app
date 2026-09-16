import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { TransactionItem } from './TransactionItem';
import { TransactionDetailModal } from './TransactionDetailModal';
import { SolicitudRow } from '../funding/SolicitudRow';
import { spacing, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { transactionService } from '../../services/transaction.service';
import { getMySolicitudes, enCurso, SolicitudItem } from '../../services/solicitudes.service';
import { formatBalance } from '../../utils/formatters';

type MovProps = { id: string; title: string; description: string; amount: string; type: 'income' | 'expense'; iconName: 'arrow-down' | 'arrow-up' };
type FeedItem =
    | { kind: 'mov'; key: string; createdAt: string; mov: MovProps; raw: any }
    | { kind: 'sol'; key: string; createdAt: string; sol: SolicitudItem };

// Mapea una transacción cruda / una solicitud al shape del comprobante
// (TransactionDetailModal), para abrir el detalle al tocar cualquier fila.
const txToDetail = (t: any, accountId?: string) => {
    const isIncome = t.to_account_id === accountId;
    return {
        transaction_id: t.id,
        created_at: t.created_at,
        amount: t.amount,
        movement_type: (isIncome ? 'income' : 'expense') as 'income' | 'expense',
        status: t.status as any,
        transaction_type_name: t.transaction_types?.name,
        concept: t.concept || undefined,
        counterpart_name: t.external_holder_name || undefined,
        reference_number: t.reference_number,
        payment_method: t.payment_method,
        title: t.external_holder_name || t.transaction_types?.name || 'Movimiento',
        description: t.concept || t.transaction_types?.name || '',
    };
};
const solToDetail = (s: SolicitudItem) => ({
    transaction_id: s.transactionId || s.id,
    created_at: s.createdAt,
    amount: s.amountFiat,
    movement_type: (s.isIncome ? 'income' : 'expense') as 'income' | 'expense',
    status: s.status as any,
    transaction_type_name: s.title,
    concept: s.adminComment ? `Operador: ${s.adminComment}` : s.subtitle || undefined,
    counterpart_name: s.subtitle || undefined,
    title: s.title,
    description: s.subtitle || s.title,
    category: s.kind,
});

export const TransactionsList = () => {
    const { colors } = useTheme();
    const { account } = useAuth();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [feed, setFeed] = React.useState<FeedItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selected, setSelected] = React.useState<any | null>(null);

    // Refresca al montar y CADA VEZ que la pantalla recupera foco (así se ve el
    // saldo/movimientos frescos y se auto-recupera si una carga quedó a medias).
    useFocusEffect(
        useCallback(() => {
            loadFeed();
        }, [account?.id])
    );

    // "Últimos Movimientos" = transacciones completadas + solicitudes EN CURSO
    // (pendientes/rechazadas), unificadas y deduplicadas, igual que la pantalla
    // Movimientos. Así un retiro/depósito PENDIENTE también aparece acá.
    const loadFeed = async () => {
        if (!account) return;
        try {
            const [txs, sols] = await Promise.all([
                transactionService.getRecentTransactions(account.id),
                getMySolicitudes().catch(() => [] as SolicitudItem[]),
            ]);

            const txIds = new Set(txs.map((t: any) => t.id));
            const movItems: FeedItem[] = txs.map((t: any) => {
                const isIncome = t.to_account_id === account.id;
                return {
                    kind: 'mov',
                    key: `m_${t.id}`,
                    createdAt: t.created_at,
                    raw: t,
                    mov: {
                        id: t.id,
                        title: t.external_holder_name || t.transaction_types?.name || 'Movimiento',
                        description: t.concept || t.transaction_types?.name || '',
                        amount: formatBalance(t.amount),
                        type: isIncome ? 'income' : 'expense',
                        iconName: isIncome ? 'arrow-down' : 'arrow-up',
                    },
                };
            });

            // Solicitudes en curso, salteando las que ya tienen su transacción
            // reflejada como movimiento (para no verlas dos veces).
            const solItems: FeedItem[] = enCurso(sols)
                .filter((s) => !(s.transactionId && txIds.has(s.transactionId)))
                .map((s) => ({ kind: 'sol', key: `s_${s.id}`, createdAt: s.createdAt, sol: s }));

            const combined = [...movItems, ...solItems]
                .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
                .slice(0, 5);

            setFeed(combined);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // "Cargando…" solo en la PRIMERA carga (sin datos); en refrescos se mantiene la lista.
    if (loading && feed.length === 0) return <View style={styles.container}><Text style={{ color: colors.mutedForeground }}>Cargando...</Text></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Últimos Movimientos</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/movements')}>
                    <Text style={styles.link}>Ver todo</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.list}>
                {feed.length === 0 ? (
                    <Text style={{ color: colors.mutedForeground }}>No hay movimientos recientes</Text>
                ) : (
                    feed.map((item) =>
                        item.kind === 'sol'
                            ? <SolicitudRow key={item.key} item={item.sol} onPress={() => setSelected(solToDetail(item.sol))} />
                            : <TransactionItem key={item.key} {...(item.mov as any)} onPress={() => setSelected(txToDetail(item.raw, account?.id))} />
                    )
                )}
            </View>

            <TransactionDetailModal visible={!!selected} onClose={() => setSelected(null)} transaction={selected} />
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
        gap: spacing.sm,
    },
});
