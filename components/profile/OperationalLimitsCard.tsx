import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, typography, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/formatters";
import { useTheme } from "../../context/ThemeContext";

interface OperationalLimitsProps {
  monthlyLimit?: number;
  amountOperated?: number;
  dailyLimit?: number | null;
  dailySpent?: number;
  perTransactionLimit?: number | null;
}

export const OperationalLimitsCard: React.FC<OperationalLimitsProps> = ({
  monthlyLimit = 800000,
  amountOperated = 0,
  dailyLimit = null,
  dailySpent = 0,
  perTransactionLimit = null,
}) => {
  const { colors } = useTheme();
  const remainingBalance = monthlyLimit - amountOperated;
  const progressPercentage =
    monthlyLimit > 0 ? (amountOperated / monthlyLimit) * 100 : 0;
  const dailyAvailable = dailyLimit != null ? dailyLimit - dailySpent : null;
  const dailyProgress =
    dailyLimit != null && dailyLimit > 0 ? (dailySpent / dailyLimit) * 100 : 0;

  const styles = useMemo(() => createStyles(colors), [colors]);

  // Color based on percentage
  let progressColor = colors.accent;
  if (progressPercentage >= 90) progressColor = colors.destructive;
  else if (progressPercentage >= 70) progressColor = colors.warning;

  let dailyProgressColor = colors.accent;
  if (dailyProgress >= 90) dailyProgressColor = colors.destructive;
  else if (dailyProgress >= 70) dailyProgressColor = colors.warning;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name="trending-up" size={16} color={colors.accent} />
        </View>
        <Text style={styles.title}>Perfil Operacional</Text>
      </View>

      {/* Monthly Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Operado este mes</Text>
          <Text style={styles.progressLabel}>
            {progressPercentage.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(100, progressPercentage)}%`,
                backgroundColor: progressColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Daily Progress */}
      {dailyLimit != null && (
        <View style={styles.progressSection}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>Operado hoy</Text>
            <Text style={styles.progressLabel}>
              {dailyProgress.toFixed(0)}%
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(100, dailyProgress)}%`,
                  backgroundColor: dailyProgressColor,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* Stats Grid */}
      <View style={styles.grid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Límite Mensual</Text>
          <Text style={styles.statValue}>
            {formatCurrency(monthlyLimit, { compact: true })}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Operado</Text>
          <Text style={[styles.statValue, { color: colors.accent }]}>
            {formatCurrency(amountOperated, { compact: true })}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Disponible</Text>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  remainingBalance > 0 ? colors.success : colors.destructive,
              },
            ]}
          >
            {formatCurrency(remainingBalance, { compact: true })}
          </Text>
        </View>
      </View>

      {/* Extra limits row */}
      {(dailyLimit != null || perTransactionLimit != null) && (
        <View style={[styles.grid, { marginTop: spacing.sm }]}>
          {dailyLimit != null && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Límite Diario</Text>
              <Text style={styles.statValue}>
                {formatCurrency(dailyLimit, { compact: true })}
              </Text>
            </View>
          )}
          {dailyLimit != null && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Disp. Hoy</Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      (dailyAvailable ?? 0) > 0
                        ? colors.success
                        : colors.destructive,
                  },
                ]}
              >
                {formatCurrency(dailyAvailable ?? 0, { compact: true })}
              </Text>
            </View>
          )}
          {perTransactionLimit != null && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Máx. x Transac.</Text>
              <Text style={styles.statValue}>
                {formatCurrency(perTransactionLimit, { compact: true })}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    iconBox: {
      padding: spacing.xs,
      backgroundColor: colors.accentAlpha[10],
      borderRadius: borderRadius.lg,
    },
    title: {
      fontSize: typography.sizes.sm,
      fontWeight: "600",
      color: colors.foreground,
    },
    progressSection: {
      marginBottom: spacing.md,
    },
    progressLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacing.xs,
    },
    progressLabel: {
      fontSize: 10,
      color: colors.mutedForeground,
    },
    progressBarBackground: {
      height: 12,
      backgroundColor: colors.mutedAlpha[30],
      borderRadius: borderRadius.full,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      borderRadius: borderRadius.full,
    },
    grid: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    statItem: {
      flex: 1,
      backgroundColor: colors.mutedAlpha[20],
      borderRadius: borderRadius.lg,
      padding: spacing.sm,
      alignItems: "center",
      justifyContent: "space-between",
      height: 70,
    },
    statLabel: {
      fontSize: 10,
      color: colors.mutedForeground,
      textAlign: "center",
      marginBottom: 4,
    },
    statValue: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.foreground,
    },
  });
