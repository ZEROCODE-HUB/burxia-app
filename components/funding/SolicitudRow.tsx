import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { spacing, borderRadius } from "../../theme";
import { useTheme } from "../../context/ThemeContext";
import { formatBalance } from "../../utils/formatters";
import { SolicitudItem } from "../../services/solicitudes.service";

const STATUS: Record<string, { label: string; tone: "warn" | "ok" | "bad" }> = {
  pending: { label: "Pendiente", tone: "warn" },
  rejected: { label: "Rechazada", tone: "bad" },
  approved: { label: "Aprobada", tone: "ok" },
  completed: { label: "Completada", tone: "ok" },
};

export function SolicitudRow({ item, onPress }: { item: SolicitudItem; onPress?: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const st = STATUS[item.status] ?? { label: item.status, tone: "warn" as const };
  const toneColor = st.tone === "ok" ? colors.success : st.tone === "bad" ? colors.destructive : colors.warning;
  const accent = item.isIncome ? colors.success : colors.accent;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={[styles.icon, { backgroundColor: accent + "22" }]}>
        <Ionicons name={item.isIncome ? "arrow-down" : "arrow-up"} size={18} color={accent} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {item.subtitle ? <Text style={styles.sub} numberOfLines={1}>{item.subtitle}</Text> : null}
        {item.adminComment ? <Text style={styles.sub} numberOfLines={1}>Operador: {item.adminComment}</Text> : null}
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.amount}>{formatBalance(item.amountFiat)}</Text>
        <View style={[styles.badge, { backgroundColor: toneColor + "22" }]}>
          <Text style={[styles.badgeText, { color: toneColor }]}>{st.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.base,
    },
    icon: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 14, fontWeight: "600", color: colors.foreground },
    sub: { fontSize: 12, color: colors.mutedForeground, marginTop: 1 },
    amount: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    badge: { marginTop: 4, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
    badgeText: { fontSize: 10, fontWeight: "700" },
  });
