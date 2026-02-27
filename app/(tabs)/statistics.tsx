import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../components/layout';
import { SummaryCards } from '../../components/statistics/SummaryCards';
import { BalanceChart } from '../../components/statistics/BalanceChart';
import { TimeRangeSelector } from '../../components/statistics/TimeRangeSelector';
import { InlineDateRangePicker } from '../../components/statistics/InlineDateRangePicker';
import { spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { transactionService } from '../../services/transaction.service';
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
    const { account } = useAuth();
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

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenHeader title="Estadísticas" showBackButton={true} showAvatar={true} />

            <View style={styles.tabsContainer}>
                <TimeRangeSelector
                    options={TIME_RANGES}
                    selected={selectedRange}
                    onSelect={setSelectedRange}
                />

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

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.accent} />
                        <Text style={styles.loadingText}>Cargando datos...</Text>
                    </View>
                ) : showContent ? (
                    <>
                        <SummaryCards data={stats.summaryData} />

                        <BalanceChart
                            data={stats.chartData}
                            currentBalance={stats.currentBalance}
                            label={RANGE_LABELS[selectedRange]}
                        />
                    </>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="calendar" size={48} color={colors.mutedAlpha[40]} />
                        <Text style={styles.placeholderText}>
                            Selecciona un rango de fechas para ver las estadísticas
                        </Text>
                    </View>
                )}

                {/* Bottom padding */}
                <View style={{ height: 40 }} />
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
