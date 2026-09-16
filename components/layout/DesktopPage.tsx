import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { spacing } from "../../theme";
import { useTheme } from "../../context/ThemeContext";

/**
 * Scaffold de página de ESCRITORIO (Nivel B). Da a todas las pantallas el mismo
 * esqueleto: encabezado (título + subtítulo + acciones a la derecha) y un cuerpo
 * con ancho máximo consistente que scrollea de forma natural (un solo scroller).
 *
 * Se usa SOLO en la rama `isDesktop` de cada pantalla; el móvil no lo toca.
 */
export function DesktopPage({
  title,
  subtitle,
  actions,
  maxWidth = 1120,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  maxWidth?: number;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.root}>
      <DesktopBackground />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, { maxWidth }]}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            {actions ? <View style={styles.actions}>{actions}</View> : null}
          </View>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Fondo de escritorio compartido: gradiente navy + destello suave. Va como capa
 * absoluta detrás del contenido de una pantalla (dentro de la escena opaca del
 * navegador). Usalo en pantallas que NO usan DesktopPage (Inicio, Depositar…).
 */
export function DesktopBackground() {
  const { isDark } = useTheme();
  // Fondo violeta en oscuro / claro suave en modo claro (respeta el tema).
  const grad: [string, string, ...string[]] = isDark
    ? ["#241C46", "#17122E", "#120E24"]
    : ["#FBFAFE", "#F5F3FB", "#EEEAF8"];
  return (
    <>
      <LinearGradient
        colors={grad}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}
      />
      <View style={bgStyles.glow} />
    </>
  );
}

const bgStyles = StyleSheet.create({
  glow: {
    position: "absolute",
    top: -60,
    right: 140,
    width: 12,
    height: 12,
    borderRadius: 6,
    pointerEvents: "none",
    boxShadow: "0 0 300px 190px rgba(139,123,214,0.13)",
  } as any,
});

/** Fila de 2+ columnas para escritorio (auto-wrap en pantallas medianas). */
export function DesktopGrid({ children, gap = spacing.lg }: { children: React.ReactNode; gap?: number }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap, alignItems: "flex-start" }}>{children}</View>;
}

/** Columna con peso configurable dentro de un DesktopGrid. */
export function DesktopCol({ children, flex = 1, minWidth = 280 }: { children: React.ReactNode; flex?: number; minWidth?: number }) {
  return <View style={{ flex, minWidth, gap: spacing.lg }}>{children}</View>;
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background },
    glow: {
      position: "absolute",
      top: -60,
      right: 140,
      width: 12,
      height: 12,
      borderRadius: 6,
      boxShadow: "0 0 300px 190px rgba(139,123,214,0.13)",
    } as any,
    scroll: { flex: 1, backgroundColor: "transparent" },
    scrollContent: { alignItems: "center", paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, paddingBottom: spacing.xl * 2 },
    inner: { width: "100%" },
    header: {
      flexDirection: "row",
      alignItems: "flex-end",
      gap: spacing.lg,
      marginBottom: spacing.xl,
    },
    title: { fontSize: 28, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
    actions: { flexDirection: "row", gap: spacing.sm, alignItems: "center" },
  });
