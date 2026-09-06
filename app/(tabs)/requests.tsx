import React, { useCallback, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { spacing, borderRadius } from "../../theme";
import { ScreenHeader } from "../../components/layout";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency } from "../../utils/formatters";
import { getMyRequests, FundingRequest } from "../../services/funding.service";

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export default function RequestsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [items, setItems] = useState<FundingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getMyRequests();
      setItems(data);
    } catch (e) {
      console.error("[requests] load error", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const statusColor = (s: string) =>
    s === "approved" ? colors.success : s === "rejected" ? colors.destructive : colors.warning;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Mis solicitudes" showBackButton showAvatar={false} />

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.accent} />
          }
        >
          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="documents-outline" size={40} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>Todavía no tenés solicitudes de depósito o retiro.</Text>
            </View>
          ) : (
            items.map((r) => {
              const isDeposit = r.kind === "deposit";
              return (
                <View key={r.id} style={styles.card}>
                  <View style={styles.row}>
                    <View style={[styles.iconBox, { backgroundColor: (isDeposit ? colors.success : colors.accent) + "22" }]}>
                      <Ionicons
                        name={isDeposit ? "arrow-down" : "arrow-up"}
                        size={20}
                        color={isDeposit ? colors.success : colors.accent}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{isDeposit ? "Depósito" : "Retiro"}</Text>
                      <Text style={styles.date}>{fmtDate(r.created_at)}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.amount}>{formatCurrency(r.amount)}</Text>
                      <View style={[styles.badge, { backgroundColor: statusColor(r.status) + "22" }]}>
                        <Text style={[styles.badgeText, { color: statusColor(r.status) }]}>
                          {STATUS_LABEL[r.status] ?? r.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {r.admin_comment ? (
                    <View style={styles.commentBox}>
                      <Text style={styles.commentLabel}>Comentario del operador</Text>
                      <Text style={styles.commentText}>{r.admin_comment}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.md },
    empty: { alignItems: "center", gap: spacing.md, marginTop: spacing.xl * 2, paddingHorizontal: spacing.xl },
    emptyText: { color: colors.mutedForeground, textAlign: "center", fontSize: 14 },
    card: {
      backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1,
      borderColor: colors.border, padding: spacing.md,
    },
    row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    iconBox: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    title: { fontSize: 15, fontWeight: "600", color: colors.foreground },
    date: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
    amount: { fontSize: 15, fontWeight: "700", color: colors.foreground },
    badge: { marginTop: 4, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
    badgeText: { fontSize: 11, fontWeight: "700" },
    commentBox: {
      marginTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm,
    },
    commentLabel: { fontSize: 11, color: colors.mutedForeground, marginBottom: 2 },
    commentText: { fontSize: 13, color: colors.foreground },
  });
