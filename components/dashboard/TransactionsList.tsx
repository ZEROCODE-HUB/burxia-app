import React, { useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { TransactionItem } from './TransactionItem';
import { SolicitudRow } from '../funding/SolicitudRow';
import { Voucher, type VoucherModel } from '../Voucher';
import { buildOtcVoucher, buildFundingVoucher, buildTxVoucher } from '../voucher.builders';
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

// Comprobante ÚNICO para cualquier solicitud (OTC / depósito / retiro).
const solToVoucher = (s: SolicitudItem, user: any): VoucherModel =>
    s.source === 'otc' && s.rawOtc
        ? buildOtcVoucher(s.rawOtc, user)
        : buildFundingVoucher(s.rawFunding as any, user);

export interface TransactionsListHandle {
    /** Recarga la lista bajo demanda (p.ej. desde el pull-to-refresh del Dashboard). */
    refresh: () => Promise<void>;
}

export const TransactionsList = forwardRef<TransactionsListHandle>((_props, ref) => {
    const { colors } = useTheme();
    const { account, user } = useAuth();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [feed, setFeed] = React.useState<FeedItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [voucher, setVoucher] = React.useState<VoucherModel | null>(null);
    const solsRef = React.useRef<SolicitudItem[]>([]);

    // Al tocar un movimiento (transacción): si corresponde a una solicitud
    // (OTC/fondeo) ya resuelta, mostramos SU comprobante rico; si no, el de
    // transacción. Así el MISMO comprobante y campos se ven en todos lados.
    const abrirMov = (t: any) => {
        const sol = solsRef.current.find((s) => s.transactionId && s.transactionId === t.id);
        setVoucher(sol ? solToVoucher(sol, user) : buildTxVoucher(t, account?.id, user));
    };

    // Refresca al montar y CADA VEZ que la pantalla recupera foco (así se ve el
    // saldo/movimientos frescos y se auto-recupera si una carga quedó a medias).
    useFocusEffect(
        useCallback(() => {
            loadFeed();
        }, [account?.id])
    );

    // Permite que el Dashboard dispare la recarga de la lista en su pull-to-refresh.
    // Sin esto, el gesto de refrescar solo actualizaba el saldo y el estado de las
    // solicitudes quedaba viejo (ej: "Pendiente" ya aprobado).
    useImperativeHandle(ref, () => ({ refresh: async () => { await loadFeed(); } }));

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
            solsRef.current = sols; // para vincular una transacción con su solicitud

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
                            ? <SolicitudRow key={item.key} item={item.sol} onPress={() => setVoucher(solToVoucher(item.sol, user))} />
                            : <TransactionItem key={item.key} {...(item.mov as any)} onPress={() => abrirMov(item.raw)} />
                    )
                )}
            </View>

            <Voucher model={voucher} visible={!!voucher} onClose={() => setVoucher(null)} />
        </View>
    );
});
TransactionsList.displayName = 'TransactionsList';

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
