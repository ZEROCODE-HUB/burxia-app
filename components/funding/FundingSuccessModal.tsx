import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Modal, Button } from "../ui";
import { useTheme } from "../../context/ThemeContext";
import { spacing, borderRadius } from "../../theme";
import { formatCurrency } from "../../utils/formatters";

export interface FundingSummaryRow {
  label: string;
  value: string;
}

interface FundingSuccessModalProps {
  visible: boolean;
  kind: "deposit" | "withdrawal";
  amount: number;
  rows: FundingSummaryRow[];
  onClose: () => void;
  /** Overrides opcionales (p. ej. OTC). Si faltan, se derivan de kind. */
  title?: string;
  subtitle?: string;
  amountLabel?: string;
  ctaLabel?: string;
}

/**
 * Resumen de una solicitud de depósito/retiro recién enviada. Reutilizable
 * por deposit.tsx y withdraw.tsx para no duplicar la vista de confirmación.
 */
export function FundingSuccessModal({
  visible,
  kind,
  amount,
  rows,
  onClose,
  title: titleProp,
  subtitle: subtitleProp,
  amountLabel = "Monto",
  ctaLabel = "Ver mis solicitudes",
}: FundingSuccessModalProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isDeposit = kind === "deposit";
  const title = titleProp ?? (isDeposit ? "¡Depósito solicitado con éxito!" : "¡Retiro solicitado con éxito!");
  const subtitle = subtitleProp ?? (isDeposit
    ? "Tu solicitud de depósito quedó registrada. Te avisaremos cuando el operador la revise."
    : "Tu solicitud de retiro quedó registrada y el monto fue retenido de tu saldo. Te avisaremos cuando se apruebe.");

  return (
    <Modal visible={visible} onClose={onClose} anchor="center">
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={36} color={colors.success} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>{amountLabel}</Text>
          <Text style={styles.amountValue}>{formatCurrency(amount)}</Text>
        </View>

        {rows.length > 0 && (
          <View style={styles.rows}>
            {rows.map((r) => (
              <View key={r.label} style={styles.row}>
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowValue} numberOfLines={2}>{r.value}</Text>
              </View>
            ))}
          </View>
        )}

        <Button onPress={onClose} variant="primary" style={{ width: "100%", marginTop: spacing.lg }}>
          {ctaLabel}
        </Button>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { alignItems: "center", padding: spacing.lg },
    iconCircle: {
      width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center",
      backgroundColor: colors.success + "22", marginBottom: spacing.md,
    },
    title: { fontSize: 18, fontWeight: "700", color: colors.foreground, textAlign: "center" },
    subtitle: {
      fontSize: 13, color: colors.mutedForeground, textAlign: "center",
      marginTop: spacing.sm, lineHeight: 19, marginBottom: spacing.md,
    },
    amountBox: {
      width: "100%", alignItems: "center", backgroundColor: colors.card,
      borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
      paddingVertical: spacing.md, marginBottom: spacing.md,
    },
    amountLabel: { fontSize: 11, color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5 },
    amountValue: { fontSize: 24, fontWeight: "800", color: colors.foreground, marginTop: 2 },
    rows: { width: "100%", gap: spacing.sm },
    row: {
      flexDirection: "row", justifyContent: "space-between", gap: spacing.md,
      borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm,
    },
    rowLabel: { fontSize: 13, color: colors.mutedForeground, flexShrink: 0 },
    rowValue: { fontSize: 13, color: colors.foreground, fontWeight: "600", flex: 1, textAlign: "right" },
  });
