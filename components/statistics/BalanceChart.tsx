import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { LineChart } from "react-native-gifted-charts";
import { spacing, borderRadius, shadows } from '../../theme';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../context/ThemeContext';

interface ChartDataPoint {
    label: string;
    value: number;
}

interface BalanceChartProps {
    data: ChartDataPoint[];
    currentBalance: number;
    label: string;
}

// Extended interface for chart data with original label preserved
interface ExtendedChartDataPoint {
    value: number;
    label: string;
    originalLabel: string;
    labelTextStyle: { color: string; fontSize: number };
    dataPointLabelComponent: () => null;
}

export const BalanceChart: React.FC<BalanceChartProps> = ({ data, currentBalance, label }) => {
    const { colors } = useTheme();
    const { width: windowWidth } = useWindowDimensions();
    // En web la ventana puede ser mucho más ancha que el marco (WebFrame, 480).
    // Se acota para que el gráfico no se desborde; en móvil usa el ancho real.
    const screenWidth = Math.min(windowWidth, 480);
    const styles = useMemo(() => createStyles(colors), [colors]);

    const dynamicSpacing = useMemo(() => {
        if (!data || data.length <= 1) return 100;
        // Optimization: For long lists (like 1 month), we need small spacing to fit, OR scrollable.
        // The user wants it "pretty". Scrolling is better than overcrowding.
        // Let's force a minimum spacing of 50 per point so it scrolls nicely.
        // BUT if it fits in screen, fit it.

        const availableWidth = screenWidth - 60;
        const items = data.length;

        const fitSpacing = availableWidth / items;

        // If fitSpacing is too small (<30), force scrolling with wider spacing
        if (fitSpacing < 40) return 50;

        return fitSpacing;
    }, [data, screenWidth]);

    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Label Logic: Ensure we don't show too many labels

        // If scrolling (large spacing), we can show labels more frequently (e.g. every 2-3 items)
        // If fitted (small spacing), we must skip more.

        let skip = 1;

        if (dynamicSpacing >= 40) {
            // Scrolling: Show label every 100-150px approx.
            // 50px spacing -> skip 2 means label every 150px.
            skip = 2;
        } else {
            // Fitted: Calculate max visible labels
            const maxLabels = Math.floor(screenWidth / 40); // assume 40px min width for label
            skip = Math.ceil(data.length / maxLabels);
        }

        const totalPoints = data.length;

        return data.map((d, i) => ({
            value: d.value,
            label: (i === 0 || i === totalPoints - 1 || i % skip === 0) ? d.label : '',
            originalLabel: d.label,
            labelTextStyle: { color: colors.mutedForeground, fontSize: 10 },
            dataPointLabelComponent: () => null,
            hideDataPoint: totalPoints > 15, // Hide dots if dense
        })) as ExtendedChartDataPoint[];
    }, [data, colors, screenWidth, dynamicSpacing]);

    if (!data || data.length === 0) return null;

    const safeBalance = currentBalance ?? 0;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Balance Neto</Text>
                    <Text style={styles.balance}>{formatCurrency(safeBalance)}</Text>
                </View>
            </View>

            <View style={styles.chartWrapper}>
                <LineChart
                    // Force re-render when range changes to reset scroll position
                    key={label}
                    areaChart
                    scrollToEnd
                    data={chartData}
                    width={screenWidth - 48}
                    height={220}
                    spacing={dynamicSpacing}
                    initialSpacing={20}
                    endSpacing={20}

                    // Colors & Styling
                    color={colors.accent}
                    thickness={3}
                    startFillColor={colors.accent}
                    endFillColor={colors.accent}
                    startOpacity={0.15}
                    endOpacity={0.01}
                    noOfSections={4}

                    // Aesthetics
                    curved
                    isAnimated
                    animationDuration={600}
                    hideDataPoints={chartData.length > 10}
                    dataPointsColor={colors.accent}
                    dataPointsRadius={4}

                    // Axis & Rules
                    yAxisThickness={0}
                    xAxisThickness={0}
                    rulesType="dashed"
                    rulesColor={colors.border}
                    rulesThickness={1}
                    yAxisTextStyle={{ color: colors.mutedForeground, fontSize: 10 }}
                    showVerticalLines={false}
                    xAxisLabelTextStyle={{ color: colors.mutedForeground, fontSize: 10, marginTop: 4 }}

                    // Interaction / Pointer
                    pointerConfig={{
                        pointerStripUptoDataPoint: true,
                        pointerStripColor: colors.accent,
                        pointerStripWidth: 2,
                        strokeDashArray: [2, 5],
                        pointerColor: colors.card,
                        radius: 8, // Larger radius for easier target
                        pointerLabelWidth: 100,
                        pointerLabelHeight: 120,
                        // UX IMPROVEMENT: Enable scrolling by requiring long press for tooltip
                        activatePointersOnLongPress: true,
                        activatePointersDelay: 100, // Short delay for easier activation
                        autoAdjustPointerLabelPosition: true,
                        pointerComponent: () => (
                            <View style={{
                                height: 12,
                                width: 12,
                                borderRadius: 6,
                                backgroundColor: colors.accent,
                                borderWidth: 2,
                                borderColor: colors.card
                            }} />
                        ),
                        pointerLabelComponent: (items: ExtendedChartDataPoint[]) => {
                            if (!items || items.length === 0) return null;
                            const item = items[0];
                            return (
                                <View
                                    style={{
                                        width: 120,
                                        backgroundColor: colors.card,
                                        borderRadius: 12,
                                        padding: 8,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        ...shadows.card
                                    }}
                                >
                                    <Text style={{ color: colors.mutedForeground, fontSize: 10, marginBottom: 2 }}>
                                        {item.originalLabel || item.label}
                                    </Text>
                                    <Text style={{ color: colors.foreground, fontSize: 14, fontWeight: 'bold' }}>
                                        {formatCurrency(item.value)}
                                    </Text>
                                </View>
                            );
                        },
                    }}
                />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>{label}</Text>
            </View>
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        padding: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    header: {
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 12,
        color: colors.mutedForeground,
        fontWeight: '500',
    },
    balance: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
    },
    chartWrapper: {
        marginLeft: -10,
        marginVertical: 10,
        overflow: 'hidden',
    },
    footer: {
        marginTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: spacing.sm,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 10,
        color: colors.mutedForeground,
    },
});
