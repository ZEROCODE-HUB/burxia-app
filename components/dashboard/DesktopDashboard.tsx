import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";

import { spacing, borderRadius, typography } from "../../theme";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useAccount } from "../../hooks/useAccount";
import { formatBalance } from "../../utils/formatters";
import { DesktopBackground } from "../layout/DesktopPage";
import { TransactionsList } from "./TransactionsList";

const ACTIONS = [
  { icon: "arrow-down-outline", label: "Depositar", path: "/(tabs)/deposit", isPrimary: true },
  { icon: "arrow-up-outline", label: "Retirar", path: "/(tabs)/withdraw", isPrimary: false },
  { icon: "swap-vertical-outline", label: "Comprar/Vender", path: "/(tabs)/otc", isPrimary: false },
  { icon: "paper-plane-outline", label: "Transferir", path: "/(tabs)/transfer", isPrimary: false },
  { icon: "bar-chart-outline", label: "Estadísticas", path: "/(tabs)/statistics", isPrimary: false },
] as const;

/**
 * Layout de ESCRITORIO del Inicio. Reutiliza tokens, datos y componentes
 * compartidos (QuickActionButton, TransactionsList, SolicitudRow); solo cambia
 * la composición: hero de saldo + grilla de 2 columnas (movimientos | solicitudes).
 */
export function DesktopDashboard() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { balance, accountNumber, alias } = useAccount();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, value: string) => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  };

  const nombre = user ? `${user.first_name} ${user.last_name}`.trim() : "Usuario";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <DesktopBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.dtInner}>
      <Text style={styles.greeting}>Hola, {nombre}</Text>
      <View style={styles.protectedRow}>
        <Ionicons name="finger-print" size={14} color={colors.accent} />
        <Text style={styles.protectedText}>Acceso protegido</Text>
      </View>

      {/* Hero: tarjeta con el gradiente de la marca (mismo lenguaje que el login) */}
      <LinearGradient
        colors={["#2D2154", "#3E3576", "#5A4F9D"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroGlow} />
        <View style={styles.heroLeft}>
          <Text style={styles.heroLabel}>Saldo disponible</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balance}>{showBalance ? formatBalance(balance) : "$ ••••••••"}</Text>
            <TouchableOpacity onPress={() => setShowBalance((v) => !v)} style={styles.eye} hitSlop={8}>
              <Ionicons name={showBalance ? "eye-off-outline" : "eye-outline"} size={22} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
          <View style={styles.acctRow}>
            {accountNumber ? (
              <TouchableOpacity style={styles.acctChip} onPress={() => copy("cvu", accountNumber)} activeOpacity={0.7}>
                <Text style={styles.acctLabel}>N° de cuenta</Text>
                <View style={styles.acctValueRow}>
                  <Text style={styles.acctValue} numberOfLines={1}>{accountNumber}</Text>
                  <Ionicons name={copied === "cvu" ? "checkmark" : "copy-outline"} size={14} color={copied === "cvu" ? "#7CFACB" : "rgba(255,255,255,0.85)"} />
                </View>
              </TouchableOpacity>
            ) : null}
            {alias ? (
              <TouchableOpacity style={styles.acctChip} onPress={() => copy("alias", alias)} activeOpacity={0.7}>
                <Text style={styles.acctLabel}>Alias</Text>
                <View style={styles.acctValueRow}>
                  <Text style={styles.acctValue} numberOfLines={1}>{alias}</Text>
                  <Ionicons name={copied === "alias" ? "checkmark" : "copy-outline"} size={14} color={copied === "alias" ? "#7CFACB" : "rgba(255,255,255,0.85)"} />
                </View>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        <View style={styles.actions}>
          {ACTIONS.map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={() => router.push(a.path as any)} activeOpacity={0.85}>
              <View style={[styles.actionIcon, a.isPrimary && styles.actionIconPrimary]}>
                <Ionicons name={a.icon as any} size={20} color={a.isPrimary ? "#2D2154" : "#FFFFFF"} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Movimientos recientes (las solicitudes viven unificadas en Movimientos) */}
      <View style={styles.colMain}>
        <TransactionsList />
      </View>

      <View style={{ height: 60 }} />
      </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, alignItems: "center" },
    dtInner: { width: "100%", maxWidth: 1200 },
    greeting: { fontSize: 28, fontWeight: "800", color: colors.foreground },
    protectedRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.sm, marginBottom: spacing.lg },
    protectedText: { fontSize: 12, fontWeight: "700", color: colors.accent, textTransform: "uppercase", letterSpacing: 0.5 },

    hero: {
      flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.xl,
      borderRadius: 24, overflow: "hidden",
      padding: spacing.xl, marginBottom: spacing.xl,
      boxShadow: "0 20px 50px rgba(10,37,64,0.45)" as any,
      borderWidth: 1, borderColor: "rgba(255,255,255,0.10)",
    },
    heroGlow: {
      position: "absolute", top: -40, right: 80, width: 12, height: 12, borderRadius: 6,
      pointerEvents: "none",
      boxShadow: "0 0 220px 150px rgba(124,168,232,0.35)" as any,
    },
    heroLeft: { flexShrink: 1, zIndex: 1 },
    heroLabel: { fontSize: typography.sizes.sm, color: "rgba(255,255,255,0.72)", marginBottom: 6 },
    balanceRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    balance: { fontSize: 44, fontWeight: "800", color: "#FFFFFF", letterSpacing: -1 },
    eye: { padding: 6 },
    acctRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: spacing.lg },
    acctChip: {
      backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
      borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12,
    },
    acctLabel: { fontSize: 10, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
    acctValueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    acctValue: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
    actions: { flexDirection: "row", gap: spacing.md, flexWrap: "wrap", justifyContent: "flex-end", zIndex: 1 },
    actionBtn: { alignItems: "center", gap: 6, width: 68 },
    actionIcon: {
      width: 52, height: 52, borderRadius: 16,
      backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.20)",
      alignItems: "center", justifyContent: "center",
    },
    actionIconPrimary: { backgroundColor: "#FFFFFF", borderColor: "#FFFFFF" },
    actionLabel: { fontSize: 12, color: "rgba(255,255,255,0.9)", fontWeight: "600", textAlign: "center" },

    grid: { flexDirection: "row", gap: spacing.xl, alignItems: "flex-start" },
    colMain: { flex: 1.4, minWidth: 0 },
    colSide: {
      flex: 1, minWidth: 0, backgroundColor: colors.card, borderRadius: borderRadius.xl,
      borderWidth: 1, borderColor: colors.border, padding: spacing.lg,
      boxShadow: "0 8px 30px rgba(0,0,0,0.22)" as any,
    },
    panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
    panelTitle: { fontSize: typography.sizes.lg, fontWeight: "700", color: colors.foreground },
    link: { fontSize: typography.sizes.sm, fontWeight: "600", color: colors.accent },
    empty: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xl },
    emptyText: { color: colors.mutedForeground, fontSize: 13 },
  });
