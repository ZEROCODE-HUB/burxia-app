import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius, typography } from "../../theme";
import { useTheme } from "../../context/ThemeContext";

/**
 * Tabla de datos para ESCRITORIO (web). Reemplaza la "lista de móvil estirada":
 * cabecera de columnas, filas con hover y alineación por columna. Se alimenta de
 * `columns` (cómo se pinta cada celda) + `rows` (los datos). Cada columna puede
 * tener ancho fijo (`width`) o flexible (`flex`); por defecto flex 1.
 *
 * Uso SOLO en la rama isDesktop de una pantalla; el móvil sigue con su lista.
 */

export type Column<T> = {
  key: string;
  header: string;
  /** Ancho fijo en px. Si se omite, la columna es flexible (flex). */
  width?: number;
  /** Peso flexible cuando no hay width. Default 1. */
  flex?: number;
  align?: "left" | "right" | "center";
  render: (row: T) => React.ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  keyExtractor,
  onRowPress,
  emptyText = "Sin datos",
  emptyIcon = "documents-outline",
}: {
  columns: Column<T>[];
  rows: T[];
  keyExtractor: (row: T, index: number) => string;
  onRowPress?: (row: T) => void;
  emptyText?: string;
  emptyIcon?: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const cellFlexStyle = (c: Column<T>) =>
    c.width != null ? { width: c.width, flexGrow: 0, flexShrink: 0 } : { flex: c.flex ?? 1 };

  const alignStyle = (c: Column<T>) => ({
    alignItems:
      c.align === "right" ? ("flex-end" as const) : c.align === "center" ? ("center" as const) : ("flex-start" as const),
  });

  return (
    <View style={styles.table}>
      {/* Cabecera */}
      <View style={styles.headerRow}>
        {columns.map((c) => (
          <View key={c.key} style={[styles.cell, cellFlexStyle(c), alignStyle(c)]}>
            <Text style={styles.headerText} numberOfLines={1}>
              {c.header}
            </Text>
          </View>
        ))}
      </View>

      {/* Filas */}
      {rows.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name={emptyIcon} size={40} color={colors.mutedAlpha[40]} />
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      ) : (
        rows.map((row, i) => (
          <DataRow
            key={keyExtractor(row, i)}
            last={i === rows.length - 1}
            onPress={onRowPress ? () => onRowPress(row) : undefined}
            styles={styles}
          >
            {columns.map((c) => (
              <View key={c.key} style={[styles.cell, cellFlexStyle(c), alignStyle(c)]}>
                {c.render(row)}
              </View>
            ))}
          </DataRow>
        ))
      )}
    </View>
  );
}

function DataRow({
  children,
  last,
  onPress,
  styles,
}: {
  children: React.ReactNode;
  last: boolean;
  onPress?: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={[
        styles.bodyRow,
        last && styles.bodyRowLast,
        hovered && onPress && styles.bodyRowHover,
        onPress && ({ cursor: "pointer" } as any),
      ]}
    >
      {children}
    </Pressable>
  );
}

/** Celda de texto estándar para usar dentro de `render`. */
export function Cell({
  text,
  muted,
  strong,
  numberOfLines = 1,
}: {
  text: string;
  muted?: boolean;
  strong?: boolean;
  numberOfLines?: number;
}) {
  const { colors } = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={{
        fontSize: typography.sizes.sm,
        color: muted ? colors.mutedForeground : colors.foreground,
        fontWeight: strong ? "700" : "500",
      }}
    >
      {text}
    </Text>
  );
}

/** Chip de estado (Pendiente / Aprobada / Rechazada…). */
export function StatusChip({ label, tone }: { label: string; tone: "ok" | "bad" | "warn" | "neutral" }) {
  const { colors } = useTheme();
  const color =
    tone === "ok" ? colors.success : tone === "bad" ? colors.destructive : tone === "warn" ? colors.warning : colors.mutedForeground;
  return (
    <View style={{ paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full, backgroundColor: color + "22" }}>
      <Text style={{ fontSize: 11, fontWeight: "700", color }}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    table: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.mutedAlpha[20],
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerText: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    bodyRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    bodyRowLast: { borderBottomWidth: 0 },
    bodyRowHover: { backgroundColor: colors.mutedAlpha[10] },
    cell: { paddingRight: spacing.md, justifyContent: "center" },
    empty: { alignItems: "center", justifyContent: "center", paddingVertical: spacing["3xl"], gap: spacing.sm },
    emptyText: { color: colors.mutedForeground, fontSize: typography.sizes.sm },
  });
