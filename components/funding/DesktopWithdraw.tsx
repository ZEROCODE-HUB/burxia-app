import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius } from "../../theme";
import { useTheme } from "../../context/ThemeContext";
import { Input, Button } from "../ui";
import { AmountInput } from "../transfer/AmountInput";
import { DesktopPage, DesktopGrid, DesktopCol } from "../layout/DesktopPage";
import { formatCurrency } from "../../utils/formatters";

interface Props {
  amount: string;
  setAmount: (v: string) => void;
  balance: number;
  numericAmount: number;
  insufficient: boolean;
  tipoDestino: "cuenta" | "breb";
  setTipoDestino: (v: "cuenta" | "breb") => void;
  destination: string;
  setDestination: (v: string) => void;
  llaveBreb: string;
  setLlaveBreb: (v: string) => void;
  holder: string;
  setHolder: (v: string) => void;
  comment: string;
  setComment: (v: string) => void;
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
}

const STEPS = [
  "Ingresá el monto a retirar (se retiene de tu saldo).",
  "Indicá la cuenta o alias de destino.",
  "Revisamos la solicitud y enviamos el dinero.",
  "Si se rechaza, el monto se devuelve a tu saldo.",
];

/** Vista de ESCRITORIO dedicada de Retirar: 2 columnas (formulario | saldo+guía). */
export function DesktopWithdraw(p: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <DesktopPage title="Retirar" subtitle="Retirá dinero de tu cuenta a un destino externo">
      <DesktopGrid>
        <DesktopCol flex={1.4} minWidth={360}>
          <View style={styles.card}>
            <AmountInput value={p.amount} onChange={p.setAmount} availableBalance={p.balance} />

            {p.insufficient && p.numericAmount > 0 && (
              <View style={styles.warn}><Text style={styles.warnText}>Saldo insuficiente. Disponible: {formatCurrency(p.balance)}</Text></View>
            )}

            <View style={styles.note}>
              <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
              <Text style={styles.noteText}>Al confirmar, el monto se retiene de tu saldo. Si el retiro se rechaza, se devuelve.</Text>
            </View>

            <Text style={styles.selLabel}>Destino del retiro</Text>
            <View style={styles.segment}>
              <TouchableOpacity style={[styles.segBtn, p.tipoDestino === "cuenta" && styles.segBtnActive]} onPress={() => p.setTipoDestino("cuenta")} activeOpacity={0.85}>
                <Text style={[styles.segText, p.tipoDestino === "cuenta" && styles.segTextActive]}>Cuenta Bancaria</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.segBtn, p.tipoDestino === "breb" && styles.segBtnActive]} onPress={() => p.setTipoDestino("breb")} activeOpacity={0.85}>
                <Text style={[styles.segText, p.tipoDestino === "breb" && styles.segTextActive]}>Llave Bre-B</Text>
              </TouchableOpacity>
            </View>
            {p.tipoDestino === "cuenta" ? (
              <>
                <Input label="Número de cuenta o alias de destino" placeholder="Dónde querés recibir el dinero" value={p.destination} onChangeText={p.setDestination} autoCapitalize="none" containerStyle={styles.block} />
                <Input label="Titular (opcional)" placeholder="Nombre del titular de la cuenta destino" value={p.holder} onChangeText={p.setHolder} containerStyle={styles.block} />
              </>
            ) : (
              <Input label="Llave Bre-B" placeholder="Tu llave Bre-B (celular, correo, documento…)" value={p.llaveBreb} onChangeText={p.setLlaveBreb} autoCapitalize="none" containerStyle={styles.block} />
            )}
            <Input label="Comentario (opcional)" placeholder="Ej: retiro a mi cuenta bancaria" value={p.comment} onChangeText={p.setComment} containerStyle={styles.block} />

            <View style={{ height: spacing.md }} />
            <Button onPress={p.onSubmit} disabled={!p.canSubmit} variant={p.canSubmit ? "primary" : "outline"} style={{ width: "100%" }} loading={p.submitting}>
              Confirmar retiro
            </Button>
            {!p.canSubmit && !p.submitting && (
              <Text style={styles.helper}>
                {p.numericAmount <= 0 ? "Ingresá un monto" : p.insufficient ? "Saldo insuficiente" : (p.tipoDestino === "cuenta" ? p.destination.trim().length < 6 : p.llaveBreb.trim().length < 3) ? (p.tipoDestino === "cuenta" ? "Ingresá el número de cuenta o alias" : "Ingresá tu llave Bre-B") : ""}
              </Text>
            )}
          </View>
        </DesktopCol>

        <DesktopCol flex={1} minWidth={300}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Tu saldo</Text>
            <Text style={styles.balanceBig}>{formatCurrency(p.balance)}</Text>
            <Text style={styles.balanceCap}>Disponible para retirar</Text>
            <View style={styles.infoDivider} />
            <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
            {STEPS.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                <Text style={styles.stepText}>{step}</Text>
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
    card: { backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
    block: { marginBottom: spacing.md },
    selLabel: { fontSize: 13, fontWeight: "600", color: colors.foreground, marginBottom: spacing.sm },
    segment: { flexDirection: "row", backgroundColor: colors.mutedAlpha[20], borderRadius: borderRadius.full, padding: 4, gap: 4, marginBottom: spacing.md },
    segBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.full, alignItems: "center" },
    segBtnActive: { backgroundColor: colors.accent },
    segText: { fontSize: 14, fontWeight: "700", color: colors.mutedForeground },
    segTextActive: { color: "#fff" },
    warn: { backgroundColor: colors.destructive + "15", borderWidth: 1, borderColor: colors.destructive + "40", borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, alignItems: "center" },
    warnText: { color: colors.destructive, fontSize: 12, fontWeight: "600" },
    note: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start", backgroundColor: colors.accentAlpha[10], borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg },
    noteText: { flex: 1, color: colors.mutedForeground, fontSize: 12, lineHeight: 18 },
    helper: { marginTop: spacing.md, textAlign: "center", color: colors.mutedForeground, fontSize: 12 },
    infoCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
    infoTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    balanceBig: { fontSize: 26, fontWeight: "800", color: colors.foreground },
    balanceCap: { fontSize: 12, color: colors.mutedForeground },
    infoDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
    stepRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
    stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accentAlpha[10], alignItems: "center", justifyContent: "center", marginTop: 1 },
    stepNumText: { color: colors.accent, fontWeight: "800", fontSize: 12 },
    stepText: { flex: 1, fontSize: 13.5, lineHeight: 19, color: colors.foreground },
  });

