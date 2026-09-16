import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius } from "../../theme";
import { useTheme } from "../../context/ThemeContext";
import { Input, Button } from "../ui";
import { AmountInput, RecipientInput } from "./index";
import { DesktopPage, DesktopGrid, DesktopCol } from "../layout/DesktopPage";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  recipient: string;
  setRecipient: (v: string) => void;
  onValidationChange: (isValid: boolean, data?: any) => void;
  amount: string;
  setAmount: (v: string) => void;
  concept: string;
  setConcept: (v: string) => void;
  balance: number;
  accountNumber?: string | null;
  alias?: string | null;
  monthlyAvailable: number;
  dailyAvailable: number;
  perTransactionMax: number;
  limitError: string | null;
  numericAmount: number;
  isLimitExhausted: boolean;
  canTransfer: boolean;
  isLoading: boolean;
  onTransfer: () => void;
}

const TIPS = [
  { icon: "shield-checkmark-outline" as const, text: "Verificá el nombre del destinatario antes de confirmar." },
  { icon: "flash-outline" as const, text: "Las transferencias entre cuentas Bruxia son inmediatas." },
  { icon: "lock-closed-outline" as const, text: "Nunca compartas tu PIN. Bruxia nunca te lo va a pedir." },
];

export function DesktopTransfer(p: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const fmt = (n: number) => (Number.isFinite(n) ? formatCurrency(n) : "—");

  return (
    <DesktopPage title="Transferir" subtitle="Enviá dinero a otra cuenta de forma inmediata">
      <DesktopGrid>
        {/* Formulario */}
        <DesktopCol flex={1.4} minWidth={360}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datos de la transferencia</Text>

            <RecipientInput value={p.recipient} onChangeText={p.setRecipient} onValidationChange={p.onValidationChange} />
            <AmountInput value={p.amount} onChange={p.setAmount} availableBalance={p.balance} />

            {p.limitError && p.numericAmount > 0 && (
              <View style={styles.warn}><Text style={styles.warnText}>{p.limitError}</Text></View>
            )}
            {p.isLimitExhausted && (
              <View style={styles.err}><Text style={styles.errText}>Alcanzaste tu límite de transacciones.</Text></View>
            )}

            <Input label="Concepto (opcional)" placeholder="Varios" value={p.concept} onChangeText={p.setConcept} containerStyle={{ marginBottom: spacing.md }} />

            <Button
              onPress={p.onTransfer}
              disabled={!p.canTransfer || p.isLoading}
              variant={p.canTransfer ? "primary" : "outline"}
              style={{ width: "100%" }}
            >
              {p.isLoading ? "Procesando..." : p.isLimitExhausted ? "Límite alcanzado" : "Transferir"}
            </Button>
          </View>
        </DesktopCol>

        {/* Contexto: tu cuenta + consejos (llena la altura) */}
        <DesktopCol flex={1} minWidth={300}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tu cuenta</Text>
            <Text style={styles.balanceBig}>{formatCurrency(p.balance)}</Text>
            <Text style={styles.balanceCap}>Saldo disponible</Text>

            {(p.accountNumber || p.alias) && <View style={styles.divider} />}
            {p.accountNumber ? (
              <View style={styles.kv}><Text style={styles.k}>N° de cuenta</Text><Text style={styles.v} selectable>{p.accountNumber}</Text></View>
            ) : null}
            {p.alias ? (
              <View style={styles.kv}><Text style={styles.k}>Alias</Text><Text style={styles.v} selectable>{p.alias}</Text></View>
            ) : null}

            <View style={styles.divider} />
            <Text style={styles.miniTitle}>Límites disponibles</Text>
            <View style={styles.kv}><Text style={styles.k}>Mensual</Text><Text style={styles.v}>{fmt(p.monthlyAvailable)}</Text></View>
            <View style={styles.kv}><Text style={styles.k}>Diario</Text><Text style={styles.v}>{fmt(p.dailyAvailable)}</Text></View>
            <View style={styles.kv}><Text style={styles.k}>Por operación</Text><Text style={styles.v}>{fmt(p.perTransactionMax)}</Text></View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Antes de enviar</Text>
            {TIPS.map((t) => (
              <View key={t.text} style={styles.tipRow}>
                <View style={styles.tipIcon}><Ionicons name={t.icon} size={16} color={colors.accent} /></View>
                <Text style={styles.tipText}>{t.text}</Text>
              </View>
            ))}
          </View>
        </DesktopCol>
      </DesktopGrid>
    </DesktopPage>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border,
      padding: spacing.xl, gap: spacing.md,
    },
    cardTitle: { fontSize: 17, fontWeight: "700", color: colors.foreground, marginBottom: spacing.xs },
    warn: { backgroundColor: colors.warning + "15", borderWidth: 1, borderColor: colors.warning + "40", borderRadius: 12, padding: spacing.md, alignItems: "center" },
    warnText: { color: colors.warning, fontSize: 12, fontWeight: "600", textAlign: "center" },
    err: { backgroundColor: colors.destructive + "15", borderWidth: 1, borderColor: colors.destructive + "40", borderRadius: 12, padding: spacing.md, alignItems: "center" },
    errText: { color: colors.destructive, fontSize: 12, fontWeight: "600", textAlign: "center" },
    balanceBig: { fontSize: 30, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },
    balanceCap: { fontSize: 12, color: colors.mutedForeground, marginTop: -4 },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
    miniTitle: { fontSize: 12, fontWeight: "700", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5 },
    kv: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
    k: { fontSize: 13, color: colors.mutedForeground },
    v: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    tipRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
    tipIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.accentAlpha[10], alignItems: "center", justifyContent: "center" },
    tipText: { flex: 1, fontSize: 13, lineHeight: 19, color: colors.foreground },
  });
