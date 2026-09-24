import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/layout';
import { SummaryCards } from '../../components/statistics/SummaryCards';
import { BalanceChart } from '../../components/statistics/BalanceChart';
import { TimeRangeSelector } from '../../components/statistics/TimeRangeSelector';
import { InlineDateRangePicker } from '../../components/statistics/InlineDateRangePicker';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { useAccountRefreshOnFocus } from '../../hooks/useAccountRefreshOnFocus';
import { DesktopBackground } from '../../components/layout/DesktopPage';
import { transactionService } from '../../services/transaction.service';
import { formatCurrency } from '../../utils/formatters';
import { Ionicons } from '@expo/vector-icons';

const TIME_RANGES = [
    { id: "1d", label: "1 Día" },
    { id: "7d", label: "7 Días" },
    { id: "1m", label: "1 Mes" },
    { id: "custom", label: "Personalizado" }
];

const RANGE_LABELS: Record<string, string> = {
    "1d": "Últimas 24 horas",
    "7d": "Últimos 7 días",
    "1m": "Último mes",
    "custom": "Rango Personalizado"
};

export default function StatisticsScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const { account } = useAuth();
    const isDesktop = useIsDesktop();
  useAccountRefreshOnFocus();
    const [selectedRange, setSelectedRange] = useState("1d");
    const [customRange, setCustomRange] = useState<{ start: Date; end: Date } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({
        chartData: [] as any[],
        summaryData: { income: 0, expenses: 0 },
        currentBalance: 0
    });

    const styles = useMemo(() => createStyles(colors), [colors]);

    // Effect to clear custom range when switching to standard ranges
    useEffect(() => {
        if (selectedRange !== 'custom') {
            setCustomRange(null);
        }
    }, [selectedRange]);

    useEffect(() => {
        loadStatistics();
    }, [account, selectedRange, customRange]);

    const loadStatistics = async () => {
        if (!account) return;

        // Don't load if custom but no range selected
        if (selectedRange === 'custom' && !customRange) {
            setStats({
                chartData: [],
                summaryData: { income: 0, expenses: 0 },
                currentBalance: account.balance
            });
            return;
        }

        setIsLoading(true);
        try {
            const now = new Date();
            let start = new Date();
            let end = now;

            if (selectedRange === "1d") {
                start.setDate(now.getDate() - 1);
            }
            if (selectedRange === "7d") {
                start.setDate(now.getDate() - 7);
                start.setHours(0, 0, 0, 0);
            }
            if (selectedRange === "1m") {
                start.setDate(now.getDate() - 30);
                start.setHours(0, 0, 0, 0);
            }



            if (selectedRange === "custom" && customRange) {
                start = customRange.start;
                end = customRange.end;
            }

            const data = await transactionService.getStatistics(account.id, start, end, account.balance);

            setStats({
                chartData: data.chartData,
                summaryData: {
                    income: data.summary.income,
                    expenses: data.summary.expense
                },
                currentBalance: account.balance
            });

        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => setIsLoading(false), 300);
        }
    };

    const handleCustomApply = (start: Date, end: Date) => {
        setCustomRange({ start, end });
    };

    const showContent = selectedRange !== 'custom' || (selectedRange === 'custom' && customRange);

    const netBalance = stats.summaryData.income - stats.summaryData.expenses;

    // Tarjeta de métrica (compacta, horizontal) para la columna lateral de escritorio.
    const renderStat = (icon: keyof typeof Ionicons.glyphMap, label: string, value: string, color: string) => (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: color + '22' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{value}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, isDesktop && { backgroundColor: 'transparent' }]} edges={['top']}>
            {isDesktop && <DesktopBackground />}
            {!isDesktop && <ScreenHeader title="Estadísticas" showBackButton={true} showAvatar={true} />}

            {isDesktop && (
                <View style={[styles.dtHeader, styles.desktopCentered]}>
                    <Text style={styles.dtTitle}>Estadísticas</Text>
                    <Text style={styles.dtSub}>Análisis de tus ingresos, egresos y balance</Text>
                </View>
            )}

            <View style={[styles.tabsContainer, isDesktop && styles.desktopCentered]}>
                <View style={isDesktop ? styles.dtFilterWrap : undefined}>
                    <TimeRangeSelector
                        options={TIME_RANGES}
                        selected={selectedRange}
                        onSelect={setSelectedRange}
                    />
                </View>

                {selectedRange === 'custom' && (
                    <View style={styles.customPickerContainer}>
                        {customRange ? (
                            <View style={styles.activeRangeContainer}>
                                <Text style={styles.activeRangeText}>
                                    {customRange.start.toLocaleDateString()} - {customRange.end.toLocaleDateString()}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setCustomRange(null)}
                                    style={styles.changeRangeButton}
                                >
                                    <Ionicons name="create-outline" size={16} color={colors.accent} />
                                    <Text style={styles.changeRangeText}>Cambiar</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <InlineDateRangePicker
                                startDate={undefined}
                                endDate={undefined}
                                onApply={handleCustomApply}
                            />
                        )}
                    </View>
                )}
            </View>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }, isDesktop && styles.desktopCentered]}
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text style={styles.loadingText}>Cargando datos...</Text>
                    </View>
                ) : showContent ? (
                    isDesktop ? (
                        <View style={styles.dtGrid}>
                            <View style={styles.dtChartCol}>
                                <BalanceChart
                                    data={stats.chartData}
                                    currentBalance={stats.currentBalance}
                                    label={RANGE_LABELS[selectedRange]}
                                />
                            </View>
                            <View style={styles.dtStatsCol}>
                                {renderStat('arrow-down-outline', 'Total Ingresos', formatCurrency(stats.summaryData.income), colors.success)}
                                {renderStat('arrow-up-outline', 'Total Egresos', formatCurrency(stats.summaryData.expenses), colors.destructive)}
                                {renderStat('swap-vertical-outline', 'Balance neto', formatCurrency(netBalance), netBalance >= 0 ? colors.success : colors.destructive)}
                                {renderStat('wallet-outline', 'Saldo actual', formatCurrency(stats.currentBalance), colors.accent)}
                            </View>
                        </View>
                    ) : (
                        <>
                            <SummaryCards data={stats.summaryData} />

                            <BalanceChart
                                data={stats.chartData}
                                currentBalance={stats.currentBalance}
                                label={RANGE_LABELS[selectedRange]}
                            />
                        </>
                    )
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="calendar" size={48} color={colors.mutedAlpha[40]} />
                        <Text style={styles.placeholderText}>
                            Selecciona un rango de fechas para ver las estadísticas
                        </Text>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    tabsContainer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    customPickerContainer: {
        marginTop: spacing.sm,
    },
    activeRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.card,
        padding: spacing.md,
        borderRadius: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginTop: spacing.sm,
    },
    activeRangeText: {
        fontSize: 14,
        color: colors.foreground,
        fontWeight: '500',
    },
    changeRangeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        padding: 4,
    },
    changeRangeText: {
        fontSize: 12,
        color: colors.accent,
        fontWeight: '600',
    },
    content: {
        padding: spacing.lg,
        paddingTop: 0,
    },
    desktopCentered: {
        width: '100%',
        maxWidth: 1160,
        alignSelf: 'center',
    },
    dtFilterWrap: { width: 440, maxWidth: '100%' },
    dtGrid: {
        flexDirection: 'row',
        gap: spacing.xl,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    dtChartCol: { flex: 1.7, minWidth: 420 },
    dtStatsCol: { flex: 1, minWidth: 260, gap: spacing.md },
    statCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
    },
    statIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        fontSize: 11,
        color: colors.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        fontWeight: '700',
        marginBottom: 2,
    },
    statValue: { fontSize: 20, fontWeight: '800', color: colors.foreground, letterSpacing: -0.3 },
    dtHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
    dtTitle: { fontSize: 28, fontWeight: '800', color: colors.foreground, letterSpacing: -0.5 },
    dtSub: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: spacing.md,
    },
    placeholderText: {
        color: colors.mutedForeground,
        textAlign: 'center',
        fontSize: 14,
    },
    loadingContainer: {
        paddingVertical: 50,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    loadingText: {
        color: colors.mutedForeground,
        fontSize: 14,
    },
});
