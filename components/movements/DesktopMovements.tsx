import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { spacing, borderRadius, typography } from "../../theme";
import { useTheme } from "../../context/ThemeContext";
import { formatBalance } from "../../utils/formatters";
import { DesktopPage } from "../layout/DesktopPage";
import { DataTable, Cell, StatusChip, type Column } from "../layout/DataTable";
import { SearchBar } from "./SearchBar";
import { FilterChips, FilterType } from "./FilterChips";
import { SolicitudItem } from "../../services/solicitudes.service";

// FeedItem: mismo modelo que arma la pantalla Movimientos (mov = transacción
// completada; sol = solicitud OTC/fondeo en curso).
export type FeedItem =
  | { kind: "mov"; key: string; created_at: string; mov: any }
  | { kind: "sol"; key: string; created_at: string; sol: SolicitudItem };

type Section = { title: string; data: FeedItem[] };

const SOL_STATUS: Record<string, { label: string; tone: "ok" | "bad" | "warn" }> = {
  pending: { label: "Pendiente", tone: "warn" },
  rejected: { label: "Rechazada", tone: "bad" },
  approved: { label: "Aprobada", tone: "ok" },
  completed: { label: "Completada", tone: "ok" },
};

// Campos normalizados de una fila, sea movimiento o solicitud.
function normalize(item: FeedItem) {
  if (item.kind === "sol") {
    const s = item.sol;
    const st = SOL_STATUS[s.status] ?? { label: s.status, tone: "warn" as const };
    return {
      isIncome: s.isIncome,
      title: s.title,
      subtitle: s.subtitle || s.adminComment || "",
      amount: s.amountFiat,
      status: st,
    };
  }
  const t = item.mov;
  return {
    isIncome: t.movement_type === "income",
    title: t.counterpart_name || t.transaction_type_name,
    subtitle: t.concept || t.transaction_type_name || "",
    amount: t.amount,
    status: { label: "Completado", tone: "ok" as const },
  };
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString("es-ES", { month: "short" }).replace(".", "");
  const time = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return { day: `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`, time };
}

export function DesktopMovements({
  sections,
  account,
  showBalance,
  onToggleBalance,
  searchQuery,
  onSearch,
  activeFilter,
  onFilterChange,
  isLoading,
  isDownloading,
  onDownload,
  onRowPress,
}: {
  sections: Section[];
  account: any;
  showBalance: boolean;
  onToggleBalance: () => void;
  searchQuery: string;
  onSearch: (v: string) => void;
  activeFilter: FilterType;
  onFilterChange: (f: string) => void;
  isLoading: boolean;
  isDownloading: boolean;
  onDownload: () => void;
  onRowPress: (item: FeedItem) => void;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const rows = useMemo(() => sections.flatMap((s) => s.data), [sections]);

  const columns: Column<FeedItem>[] = useMemo(
    () => [
      {
        key: "fecha",
        header: "Fecha",
        width: 110,
        render: (item) => {
          const f = formatDate(item.created_at);
          return (
            <View>
              <Cell text={f.day} strong />
              <Text style={styles.timeText}>{f.time}</Text>
            </View>
          );
        },
      },
      {
        key: "detalle",
        header: "Detalle",
        flex: 2.2,
        render: (item) => {
          const n = normalize(item);
          const accent = n.isIncome ? colors.success : colors.accent;
          return (
            <View style={styles.detailCell}>
              <View style={[styles.icon, { backgroundColor: accent + "22" }]}>
                <Ionicons name={n.isIncome ? "arrow-down" : "arrow-up"} size={16} color={accent} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Cell text={n.title} strong />
                {n.subtitle ? <Cell text={n.subtitle} muted /> : null}
              </View>
            </View>
          );
        },
      },
      {
        key: "tipo",
        header: "Tipo",
        width: 120,
        render: (item) => {
          const n = normalize(item);
          return <Cell text={n.isIncome ? "Ingreso" : "Egreso"} muted />;
        },
      },
      {
        key: "estado",
        header: "Estado",
        width: 130,
        render: (item) => {
          const n = normalize(item);
          return <StatusChip label={n.status.label} tone={n.status.tone} />;
        },
      },
      {
        key: "monto",
        header: "Monto",
        width: 150,
        align: "right",
        render: (item) => {
          const n = normalize(item);
          return (
            <Text style={[styles.amount, { color: n.isIncome ? colors.success : colors.foreground }]}>
              {n.isIncome ? "+" : "-"}
              {formatBalance(n.amount)}
            </Text>
          );
        },
      },
      {
        key: "accion",
        header: "",
        width: 44,
        align: "right",
        render: () => <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />,
      },
    ],
    [colors, styles]
  );

  const downloadAction = (
    <TouchableOpacity style={styles.downloadBtn} onPress={onDownload} disabled={isDownloading} activeOpacity={0.8}>
      {isDownloading ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : (
        <Ionicons name="download-outline" size={18} color={colors.accent} />
      )}
      <Text style={styles.downloadText}>{isDownloading ? "Generando…" : "Estado de cuenta"}</Text>
    </TouchableOpacity>
  );

  return (
    <DesktopPage title="Movimientos" subtitle="Historial de tu actividad y solicitudes" actions={downloadAction} maxWidth={1120}>
      {/* Resumen de saldo */}
      <View style={styles.balanceCard}>
        <View>
          <Text style={styles.balanceLabel}>Saldo disponible</Text>
          <Text style={styles.balanceAmount}>{showBalance ? formatBalance(account?.balance || 0) : "••••••"}</Text>
        </View>
        <TouchableOpacity onPress={onToggleBalance} style={styles.eyeButton}>
          <Ionicons name={showBalance ? "eye-off-outline" : "eye-outline"} size={22} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Toolbar: búsqueda + filtros */}
      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <SearchBar value={searchQuery} onChangeText={onSearch} />
        </View>
        <View style={styles.chipsWrap}>
          <FilterChips activeFilter={activeFilter} onFilterChange={onFilterChange} />
        </View>
      </View>

      {/* Tabla */}
      {isLoading && rows.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          keyExtractor={(item) => item.key}
          onRowPress={onRowPress}
          emptyIcon="receipt-outline"
          emptyText={
            searchQuery || activeFilter !== "todos"
              ? "No encontramos resultados con esos filtros"
              : "Aún no tenés movimientos ni solicitudes"
          }
        />
      )}
    </DesktopPage>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    balanceCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.lg,
    },
    balanceLabel: { fontSize: typography.sizes.sm, color: colors.mutedForeground, marginBottom: 4 },
    balanceAmount: { fontSize: 26, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },
    eyeButton: { padding: 8, borderRadius: borderRadius.full, backgroundColor: colors.mutedAlpha[20] },
    toolbar: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginBottom: spacing.lg,
      flexWrap: "wrap",
    },
    searchWrap: { width: 320, maxWidth: "100%" },
    chipsWrap: { flex: 1, minWidth: 240 },
    downloadBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    downloadText: { fontSize: typography.sizes.sm, fontWeight: "600", color: colors.accent },
    detailCell: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1, minWidth: 0 },
    icon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    timeText: { fontSize: 11, color: colors.mutedForeground, marginTop: 1 },
    amount: { fontSize: typography.sizes.sm, fontWeight: "700" },
    loading: { paddingVertical: spacing["3xl"], alignItems: "center" },
  });
