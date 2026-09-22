import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { spacing, typography, borderRadius } from '../../theme';
import { ScreenHeader } from '../../components/layout';
import { SearchBar, FilterChips, FilterType, DateRangeFilter } from '../../components/movements';
import { TransactionItem } from '../../components/dashboard';
import { SolicitudRow } from '../../components/funding/SolicitudRow';
import { Voucher, type VoucherModel } from '../../components/Voucher';
import { buildOtcVoucher, buildFundingVoucher, buildTxVoucher } from '../../components/voucher.builders';
import { formatBalance } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { useAccountRefreshOnFocus } from '../../hooks/useAccountRefreshOnFocus';
import { DesktopMovements } from '../../components/movements/DesktopMovements';
import { transactionService } from '../../services/transaction.service';
import { statementService } from '../../services/statement.service';
import { getMySolicitudes, enCurso, SolicitudItem } from '../../services/solicitudes.service';

type FeedItem =
    | { kind: 'mov'; key: string; created_at: string; mov: any }
    | { kind: 'sol'; key: string; created_at: string; sol: SolicitudItem };

// Comprobante ÚNICO para cualquier solicitud (OTC / depósito / retiro).
const solToVoucher = (s: SolicitudItem, user: any): VoucherModel =>
    s.source === 'otc' && s.rawOtc
        ? buildOtcVoucher(s.rawOtc, user)
        : buildFundingVoucher(s.rawFunding as any, user);

export default function MovementsScreen() {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const { account, user } = useAuth();
    const isDesktop = useIsDesktop();
  useAccountRefreshOnFocus();
    const [activeFilter, setActiveFilter] = useState<FilterType>('todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [showBalance, setShowBalance] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [solicitudes, setSolicitudes] = useState<SolicitudItem[]>([]);
    const [voucher, setVoucher] = useState<VoucherModel | null>(null);

    // Al tocar un movimiento: si corresponde a una solicitud (OTC/fondeo) resuelta,
    // muestra SU comprobante rico; si no, el de transacción.
    const abrirMov = (t: any) => {
        const sol = solicitudes.find((s) => s.transactionId && s.transactionId === t.transaction_id);
        setVoucher(sol ? solToVoucher(sol, user) : buildTxVoucher(t, account?.id, user));
    };

    const [showDateFilter, setShowDateFilter] = useState(false);
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);

    const styles = useMemo(() => createStyles(colors), [colors]);

    const loadMovements = useCallback(async () => {
        if (!account) return;
        setIsLoading(true);
        try {
            const filters: any = {};
            if (activeFilter === 'ingresos') filters.type = 'income';
            if (activeFilter === 'egresos') filters.type = 'expense';
            if (dateRange) { filters.startDate = dateRange.from; filters.endDate = dateRange.to; }
            const data = await transactionService.getAccountMovements(account.id, 50, 0, filters);
            setTransactions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [account, activeFilter, dateRange]);

    const loadSolicitudes = useCallback(async () => {
        try {
            setSolicitudes(await getMySolicitudes());
        } catch (e) {
            console.error('[movements] solicitudes', e);
        }
    }, []);

    React.useEffect(() => { loadMovements(); }, [loadMovements]);
    // Refresca al volver a la pantalla (p.ej. tras crear un depósito/retiro/OTC).
    useFocusEffect(useCallback(() => { loadSolicitudes(); }, [loadSolicitudes]));

    const handleFilterChange = (filter: FilterType) => {
        if (filter === 'fechas') setShowDateFilter(true);
        else { setActiveFilter(filter); setDateRange(null); }
    };

    const applyDateFilter = (range: { from: Date; to: Date }) => {
        setDateRange(range);
        setActiveFilter('fechas');
        setShowDateFilter(false);
    };

    const handleDownloadStatement = async () => {
        if (!account) return;
        setIsDownloading(true);
        try {
            const filters: { type?: 'income' | 'expense'; startDate?: Date; endDate?: Date } = {};
            if (activeFilter === 'ingresos') filters.type = 'income';
            if (activeFilter === 'egresos') filters.type = 'expense';
            if (dateRange) { filters.startDate = dateRange.from; filters.endDate = dateRange.to; }
            const result = await statementService.generateAndShare({
                accountId: account.id,
                accountHolderName: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Usuario',
                balance: account.balance,
                filters,
            });
            Alert.alert('Estado de cuenta', `PDF generado con ${result.count} movimientos.\n\nIngresos: ${formatBalance(result.income)}\nEgresos: ${formatBalance(result.expense)}`);
        } catch (error: any) {
            console.error('Error generando estado de cuenta:', error);
            Alert.alert('Error', error?.message || 'No se pudo generar el estado de cuenta. Intente nuevamente.');
        } finally {
            setIsDownloading(false);
        }
    };

    const dateKeyOf = (iso: string) => {
        const date = new Date(iso);
        const today = new Date();
        if (date.toDateString() === today.toDateString()) return 'Hoy';
        const day = date.getDate();
        const month = date.toLocaleString('es-ES', { month: 'short' });
        return `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`;
    };

    // Feed único: movimientos (completados) + solicitudes en curso, interleaved.
    const sections = useMemo(() => {
        // 1) Movimientos, con filtro de búsqueda local
        let movs = transactions;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            movs = movs.filter((t) => {
                // Buscar en todo lo visible: contraparte (nombre mostrado), tipo, concepto y monto.
                const haystack = [t.counterpart_name, t.transaction_type_name, t.concept]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(query) || t.amount.toString().includes(query);
            });
        }
        const movItems: FeedItem[] = movs.map((t) => ({ kind: 'mov', key: `m_${t.transaction_id}`, created_at: t.created_at, mov: t }));

        // 2) Solicitudes en curso (solo sin filtros activos; se deduplican contra
        //    los movimientos: una solicitud que ya generó su transacción se ve
        //    como movimiento, no dos veces).
        const filtering = activeFilter !== 'todos' || !!dateRange || !!searchQuery.trim();
        let solItems: FeedItem[] = [];
        if (!filtering) {
            const movTxIds = new Set(transactions.map((t) => t.transaction_id));
            solItems = enCurso(solicitudes)
                .filter((s) => !(s.transactionId && movTxIds.has(s.transactionId)))
                .map((s) => ({ kind: 'sol', key: s.id, created_at: s.createdAt, sol: s }));
        }

        const all = [...movItems, ...solItems].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

        const linear: { title: string; data: FeedItem[] }[] = [];
        let current: { title: string; data: FeedItem[] } | null = null;
        all.forEach((it) => {
            const dk = dateKeyOf(it.created_at);
            if (!current || current.title !== dk) { current = { title: dk, data: [] }; linear.push(current); }
            current.data.push(it);
        });
        return linear;
    }, [transactions, solicitudes, searchQuery, activeFilter, dateRange]);

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <View style={styles.sectionHeader}><Text style={styles.sectionHeaderText}>{title}</Text></View>
    );

    const renderItem = ({ item }: { item: FeedItem }) => {
        if (item.kind === 'sol') return <SolicitudRow item={item.sol} onPress={() => setVoucher(solToVoucher(item.sol, user))} />;
        const t = item.mov;
        const props: any = {
            id: t.transaction_id,
            title: t.counterpart_name || t.transaction_type_name,
            description: t.concept || t.transaction_type_name,
            amount: formatBalance(t.amount),
            type: t.movement_type === 'income' ? 'income' : 'expense',
            iconName: t.movement_type === 'income' ? 'arrow-down' : 'arrow-up',
        };
        return <TransactionItem {...props} onPress={() => abrirMov(t)} />;
    };

    // Abre el comprobante correcto según el tipo de fila (usado por la tabla desktop).
    const openFeedItem = (item: FeedItem) => {
        if (item.kind === 'sol') setVoucher(solToVoucher(item.sol, user));
        else abrirMov(item.mov);
    };

    if (isDesktop) {
        return (
            <>
                <DesktopMovements
                    sections={sections}
                    account={account}
                    showBalance={showBalance}
                    onToggleBalance={() => setShowBalance(!showBalance)}
                    searchQuery={searchQuery}
                    onSearch={setSearchQuery}
                    activeFilter={activeFilter}
                    onFilterChange={handleFilterChange}
                    isLoading={isLoading}
                    isDownloading={isDownloading}
                    onDownload={handleDownloadStatement}
                    onRowPress={openFeedItem}
                />
                <DateRangeFilter visible={showDateFilter} onClose={() => setShowDateFilter(false)} onApply={applyDateFilter} />
                <Voucher model={voucher} visible={!!voucher} onClose={() => setVoucher(null)} />
            </>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <ScreenHeader variant="simple" title="Movimientos" showBackButton showAvatar />

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.key}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                stickySectionHeadersEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 90 }]}
                showsVerticalScrollIndicator={false}
                refreshing={isLoading}
                onRefresh={() => { loadMovements(); loadSolicitudes(); }}
                ListHeaderComponent={
                    <>
                        <View style={styles.balanceSection}>
                            <View>
                                <Text style={styles.balanceLabel}>Saldo disponible</Text>
                                <Text style={styles.balanceAmount}>
                                    {showBalance ? formatBalance(account?.balance || 0) : '••••••'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={styles.eyeButton}>
                                <Ionicons name={showBalance ? 'eye-off-outline' : 'eye-outline'} size={24} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.statementButton} onPress={handleDownloadStatement} disabled={isDownloading} activeOpacity={0.7}>
                            {isDownloading ? <ActivityIndicator size="small" color={colors.accent} /> : <Ionicons name="download-outline" size={20} color={colors.accent} />}
                            <Text style={styles.statementButtonText}>{isDownloading ? 'Generando PDF...' : 'Descargar estado de cuenta'}</Text>
                        </TouchableOpacity>

                        <View style={styles.filtersSection}>
                            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
                            <FilterChips activeFilter={activeFilter} onFilterChange={handleFilterChange} />
                        </View>
                    </>
                }
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color={colors.mutedAlpha[40]} />
                            <Text style={styles.emptyTitle}>Sin movimientos</Text>
                            <Text style={styles.emptyText}>
                                {searchQuery || activeFilter !== 'todos'
                                    ? 'No encontramos resultados con esos filtros'
                                    : 'Aún no tenés movimientos ni solicitudes'}
                            </Text>
                        </View>
                    ) : null
                }
                ListFooterComponent={<View style={{ height: 80 }} />}
            />

            <DateRangeFilter visible={showDateFilter} onClose={() => setShowDateFilter(false)} onApply={applyDateFilter} />
            <Voucher model={voucher} visible={!!voucher} onClose={() => setVoucher(null)} />
        </View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    listContent: { paddingHorizontal: spacing.lg },
    desktopCentered: { width: '100%', maxWidth: 860, alignSelf: 'center' },
    dtHeader: { marginBottom: spacing.lg, paddingTop: spacing.md },
    dtTitle: { fontSize: 28, fontWeight: '800', color: colors.foreground, letterSpacing: -0.5 },
    dtSub: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
    balanceSection: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: spacing.md, backgroundColor: colors.card, borderRadius: borderRadius.lg,
        borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
    },
    balanceLabel: { fontSize: typography.sizes.sm, color: colors.mutedForeground, marginBottom: 4 },
    balanceAmount: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.foreground },
    eyeButton: { padding: 8, borderRadius: borderRadius.full, backgroundColor: colors.mutedAlpha[20] },
    statementButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
        paddingVertical: spacing.base, borderRadius: borderRadius.lg, borderWidth: 1.5,
        borderColor: colors.border, backgroundColor: colors.card, marginBottom: spacing.md,
    },
    statementButtonText: { fontSize: typography.sizes.base, fontWeight: '600', color: colors.accent },
    filtersSection: { gap: spacing.md, marginBottom: spacing.md },
    sectionHeader: { paddingVertical: spacing.sm, backgroundColor: 'transparent', marginBottom: spacing.xs },
    sectionHeaderText: { fontSize: typography.sizes.sm, fontWeight: '600', color: colors.mutedForeground, textTransform: 'uppercase' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing['3xl'], gap: spacing.sm },
    emptyTitle: { fontSize: typography.sizes.lg, fontWeight: '600', color: colors.foreground },
    emptyText: { color: colors.mutedForeground, textAlign: 'center' },
});
