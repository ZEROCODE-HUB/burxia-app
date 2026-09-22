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
import { DataTable, Cell, StatusChip, type Column } from '../layout/DataTable';
import { Ionicons } from '@expo/vector-icons';

type MovProps = { id: string; title: string; description: string; amount: string; type: 'income' | 'expense'; iconName: 'arrow-down' | 'arrow-up' };
type FeedItem =
    | { kind: 'mov'; key: string; createdAt: string; mov: MovProps; raw: any }
    | { kind: 'sol'; key: string; createdAt: string; sol: SolicitudItem };

// Comprobante ÚNICO para cualquier solicitud (OTC / depósito / retiro).
const solToVoucher = (s: SolicitudItem, user: any): VoucherModel =>
    s.source === 'otc' && s.rawOtc
        ? buildOtcVoucher(s.rawOtc, user)
        : buildFundingVoucher(s.rawFunding as any, user);

const SOL_STATUS: Record<string, { label: string; tone: 'ok' | 'bad' | 'warn' }> = {
    pending: { label: 'Pendiente', tone: 'warn' },
    rejected: { label: 'Rechazada', tone: 'bad' },
    approved: { label: 'Aprobada', tone: 'ok' },
    completed: { label: 'Completada', tone: 'ok' },
};

// Campos normalizados de una fila (movimiento o solicitud) para la tabla desktop.
const normalizeFeed = (item: FeedItem) => {
    if (item.kind === 'sol') {
        const s = item.sol;
        const st = SOL_STATUS[s.status] ?? { label: s.status, tone: 'warn' as const };
        return { isIncome: s.isIncome, title: s.title, subtitle: s.subtitle || '', amountText: formatBalance(s.amountFiat), status: st };
    }
    return {
        isIncome: item.mov.type === 'income',
        title: item.mov.title,
        subtitle: item.mov.description || '',
        amountText: item.mov.amount,
        status: { label: 'Completado', tone: 'ok' as const },
    };
};

const formatShortDate = (iso: string) => {
    const d = new Date(iso);
    const month = d.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
    return `${d.getDate()} ${month.charAt(0).toUpperCase() + month.slice(1)}`;
};

export interface TransactionsListHandle {
    /** Recarga la lista bajo demanda (p.ej. desde el pull-to-refresh del Dashboard). */
    refresh: () => Promise<void>;
}

export const TransactionsList = forwardRef<TransactionsListHandle, { desktop?: boolean }>((props, ref) => {
    const { desktop } = props;
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

    // Escritorio: los últimos movimientos se ven como TABLA (no lista estirada).
    if (desktop) {
        const columns: Column<FeedItem>[] = [
            { key: 'fecha', header: 'Fecha', width: 96, render: (it) => <Cell text={formatShortDate(it.createdAt)} muted /> },
            {
                key: 'detalle', header: 'Detalle', flex: 2.2, render: (it) => {
                    const n = normalizeFeed(it);
                    const accent = n.isIncome ? colors.success : colors.accent;
                    return (
                        <View style={styles.dtDetail}>
                            <View style={[styles.dtIcon, { backgroundColor: accent + '22' }]}>
                                <Ionicons name={n.isIncome ? 'arrow-down' : 'arrow-up'} size={15} color={accent} />
                            </View>
                            <View style={{ flex: 1, minWidth: 0 }}>
                                <Cell text={n.title} strong />
                                {n.subtitle ? <Cell text={n.subtitle} muted /> : null}
                            </View>
                        </View>
                    );
                },
            },
            { key: 'tipo', header: 'Tipo', width: 110, render: (it) => <Cell text={normalizeFeed(it).isIncome ? 'Ingreso' : 'Egreso'} muted /> },
            { key: 'estado', header: 'Estado', width: 120, render: (it) => { const n = normalizeFeed(it); return <StatusChip label={n.status.label} tone={n.status.tone} />; } },
            {
                key: 'monto', header: 'Monto', width: 150, align: 'right', render: (it) => {
                    const n = normalizeFeed(it);
                    return <Text style={[styles.dtAmount, { color: n.isIncome ? colors.success : colors.foreground }]}>{n.isIncome ? '+' : '-'}{n.amountText}</Text>;
                },
            },
            { key: 'accion', header: '', width: 40, align: 'right', render: () => <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} /> },
        ];
        return (
            <View style={styles.dtContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Últimos Movimientos</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/movements')}>
                        <Text style={styles.link}>Ver todo</Text>
                    </TouchableOpacity>
                </View>
                <DataTable
                    columns={columns}
                    rows={feed}
                    keyExtractor={(it) => it.key}
                    onRowPress={(it) => (it.kind === 'sol' ? setVoucher(solToVoucher(it.sol, user)) : abrirMov(it.raw))}
                    emptyIcon="receipt-outline"
                    emptyText="No hay movimientos recientes"
                />
                <Voucher model={voucher} visible={!!voucher} onClose={() => setVoucher(null)} />
            </View>
        );
    }

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
    dtContainer: {
        marginTop: spacing.md,
    },
    dtDetail: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1, minWidth: 0 },
    dtIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    dtAmount: { fontSize: typography.sizes.sm, fontWeight: '700' },
});
