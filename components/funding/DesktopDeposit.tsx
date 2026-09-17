import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius } from "../../theme";
import { useTheme } from "../../context/ThemeContext";
import { Input, Button } from "../ui";
import { DesktopPage, DesktopGrid, DesktopCol } from "../layout/DesktopPage";
import { formatCurrency } from "../../utils/formatters";
import { PaymentMethod } from "../../services/funding.service";

interface Props {
  amount: string;
  setAmount: (v: string) => void;
  numericAmount: number;
  methods: PaymentMethod[];
  loadingMethods: boolean;
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  comment: string;
  setComment: (v: string) => void;
  proofUri: string | null;
  pickProof: () => void;
  canSubmit: boolean;
  submitting: boolean;
  onSubmit: () => void;
  onCopy: (v?: string | null) => void;
}

const STEPS = [
  "Ingresá el monto que vas a depositar.",
  "Transferí ese monto a los datos de la cuenta seleccionada.",
  "Subí el comprobante de la transferencia.",
  "Nuestro equipo lo revisa y acredita tu saldo.",
];

/** Vista de ESCRITORIO dedicada de Depositar: 2 columnas (formulario | guía). */
export function DesktopDeposit(p: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const DataRow = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <View style={styles.dataRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dataLabel}>{label}</Text>
          <Text style={styles.dataValue} selectable>{value}</Text>
        </View>
        <TouchableOpacity onPress={() => p.onCopy(value)} style={styles.copyBtn} hitSlop={8}>
          <Ionicons name="copy-outline" size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>
    ) : null;

  return (
    <DesktopPage title="Depositar" subtitle="Cargá saldo a tu cuenta con transferencia o QR">
      <DesktopGrid>
        {/* Formulario */}
        <DesktopCol flex={1.4} minWidth={360}>
          <View style={styles.card}>
            <Input
              label="Monto a depositar"
              placeholder="0,00"
              value={p.amount}
              onChangeText={p.setAmount}
              keyboardType="numeric"
              containerStyle={styles.block}
            />
            {p.numericAmount > 0 && <Text style={styles.amountPreview}>{formatCurrency(p.numericAmount)}</Text>}

            <Text style={styles.sectionTitle}>¿Cómo vas a depositar?</Text>
            {p.loadingMethods ? (
              <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing.lg }} />
            ) : p.methods.length === 0 ? (
              <Text style={styles.empty}>No hay métodos de pago disponibles. Contactá a soporte.</Text>
            ) : (
              p.methods.map((m) => {
                const active = m.id === p.selectedId;
                return (
                  <TouchableOpacity key={m.id} style={[styles.methodCard, active && styles.methodCardActive]} onPress={() => p.setSelectedId(m.id)} activeOpacity={0.8}>
                    <View style={styles.methodHeader}>
                      <Ionicons name={active ? "radio-button-on" : "radio-button-off"} size={20} color={active ? colors.accent : colors.mutedForeground} />
                      <Text style={styles.methodLabel}>{m.label}</Text>
                    </View>
                    {active && (
                      <View style={styles.methodBody}>
                        {m.image_path ? <Image source={{ uri: m.image_path }} style={styles.qr} resizeMode="contain" /> : null}
                        <DataRow label="Banco" value={m.bank_name} />
                        <DataRow label="Titular" value={m.holder_name} />
                        <DataRow label="Número de cuenta" value={m.account_number} />
                        <DataRow label="Alias" value={m.alias} />
                        <DataRow label="Llave Bre-B" value={m.llave_breb} />
                        {m.instructions ? <Text style={styles.instructions}>{m.instructions}</Text> : null}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}

            <Input label="Comentario (opcional)" placeholder="Ej: transferí desde mi cuenta" value={p.comment} onChangeText={p.setComment} containerStyle={styles.block} />

            <Text style={styles.sectionTitle}>Comprobante</Text>
            <TouchableOpacity style={styles.uploadBox} onPress={p.pickProof} activeOpacity={0.8}>
              {p.proofUri ? (
                <Image source={{ uri: p.proofUri }} style={styles.proofPreview} resizeMode="cover" />
              ) : (
                <View style={styles.uploadEmpty}>
                  <Ionicons name="cloud-upload-outline" size={28} color={colors.accent} />
                  <Text style={styles.uploadText}>Subir comprobante</Text>
                </View>
              )}
            </TouchableOpacity>
            {p.proofUri && (
              <TouchableOpacity onPress={p.pickProof}><Text style={styles.changeProof}>Cambiar comprobante</Text></TouchableOpacity>
            )}

            <View style={{ height: spacing.md }} />
            <Button onPress={p.onSubmit} disabled={!p.canSubmit} variant={p.canSubmit ? "primary" : "outline"} style={{ width: "100%" }} loading={p.submitting}>
              Confirmar depósito
            </Button>
            {!p.canSubmit && !p.submitting && (
              <Text style={styles.helper}>
                {p.numericAmount <= 0 ? "Ingresá un monto" : !p.selectedId ? "Elegí un método de pago" : !p.proofUri ? "Subí el comprobante" : ""}
              </Text>
            )}
          </View>
        </DesktopCol>

        {/* Guía */}
        <DesktopCol flex={1} minWidth={300}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
            {STEPS.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
            <View style={styles.infoNote}>
              <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
              <Text style={styles.infoNoteText}>La acreditación puede demorar según la validación del comprobante.</Text>
            </View>
          </View>
        </DesktopCol>
      </DesktopGrid>
    </DesktopPage>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: { backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
    block: { marginBottom: spacing.sm },
    amountPreview: { color: colors.accent, fontWeight: "700", fontSize: 18, marginBottom: spacing.lg },
    sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },
    empty: { color: colors.mutedForeground, fontSize: 13, marginBottom: spacing.md },
    methodCard: { borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.xl, padding: spacing.md, marginBottom: spacing.md, backgroundColor: colors.background },
    methodCardActive: { borderColor: colors.accent },
    methodHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    methodLabel: { fontSize: 15, fontWeight: "600", color: colors.foreground },
    methodBody: { marginTop: spacing.md, gap: spacing.sm },
    qr: { width: 180, height: 180, alignSelf: "center", marginBottom: spacing.sm, borderRadius: borderRadius.md },
    dataRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    dataLabel: { fontSize: 11, color: colors.mutedForeground },
    dataValue: { fontSize: 14, color: colors.foreground, fontWeight: "600" },
    copyBtn: { padding: 6 },
    instructions: { fontSize: 12, color: colors.mutedForeground, marginTop: spacing.xs, lineHeight: 18 },
    uploadBox: { borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, borderRadius: borderRadius.xl, overflow: "hidden", backgroundColor: colors.background },
    uploadEmpty: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xl, gap: spacing.sm },
    uploadText: { color: colors.accent, fontWeight: "600" },
    proofPreview: { width: "100%", height: 200 },
    changeProof: { color: colors.accent, textAlign: "center", marginTop: spacing.sm, fontSize: 13 },
    helper: { marginTop: spacing.md, textAlign: "center", color: colors.mutedForeground, fontSize: 12 },
    infoCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, gap: spacing.md },
    infoTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: spacing.xs },
    stepRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
    stepNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accentAlpha[10], alignItems: "center", justifyContent: "center", marginTop: 1 },
    stepNumText: { color: colors.accent, fontWeight: "800", fontSize: 12 },
    stepText: { flex: 1, fontSize: 13.5, lineHeight: 19, color: colors.foreground },
    infoNote: { flexDirection: "row", gap: spacing.sm, alignItems: "flex-start", marginTop: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
    infoNoteText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.mutedForeground },
  });
