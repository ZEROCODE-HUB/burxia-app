import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { spacing, borderRadius } from "../../theme";
import { ScreenHeader } from "../../components/layout";
import { Input, Button, Toast, ProcessingModal } from "../../components/ui";
import { AmountInput } from "../../components/transfer";
import { useTheme } from "../../context/ThemeContext";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { useAccountRefreshOnFocus } from '../../hooks/useAccountRefreshOnFocus';
import { useAuth } from "../../context/AuthContext";
import { useVerificacionGate } from "../../hooks/useVerificacionGate";
import { parseAmount, formatCurrency } from "../../utils/formatters";
import { createWithdrawalRequest } from "../../services/funding.service";
import { FundingSuccessModal, FundingSummaryRow } from "../../components/funding/FundingSuccessModal";
import { DesktopWithdraw } from "../../components/funding/DesktopWithdraw";

export default function WithdrawScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktop();
  useAccountRefreshOnFocus();
  const router = useRouter();
  const { account, user } = useAuth();
  const { requireVerificado, modal: verifModal } = useVerificacionGate();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [amount, setAmount] = useState("0");
  const [destination, setDestination] = useState("");
  const [holder, setHolder] = useState("");
  const [llaveBreb, setLlaveBreb] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ amount: number; rows: FundingSummaryRow[] } | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>(
    { visible: false, message: "", type: "success" }
  );

  const balance = account?.balance || 0;
  const numericAmount = parseAmount(amount);
  const insufficient = numericAmount > balance;
  const canSubmit =
    numericAmount > 0 && !insufficient && destination.trim().length >= 6 && !submitting;

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ visible: true, message, type });

  const handleSubmit = async () => {
    if (!requireVerificado()) return;
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await createWithdrawalRequest({
        amount: numericAmount,
        destination: {
          identifier: destination.trim(),
          holder: holder.trim() || null,
          llave_breb: llaveBreb.trim() || null,
        },
        comment: comment.trim() || null,
      });

      const rows: FundingSummaryRow[] = [
        { label: "Número de cuenta / alias", value: destination.trim() },
      ];
      if (holder.trim()) rows.push({ label: "Titular", value: holder.trim() });
      if (llaveBreb.trim()) rows.push({ label: "Llave Bre-B", value: llaveBreb.trim() });
      if (comment.trim()) rows.push({ label: "Comentario", value: comment.trim() });

      setSuccess({ amount: numericAmount, rows });
    } catch (e: any) {
      const msg = e?.message?.includes("INSUFFICIENT_BALANCE")
        ? "Saldo insuficiente"
        : e?.message ?? "No se pudo enviar la solicitud";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (isDesktop) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DesktopWithdraw
          amount={amount}
          setAmount={setAmount}
          balance={balance}
          numericAmount={numericAmount}
          insufficient={insufficient}
          destination={destination}
          setDestination={setDestination}
          llaveBreb={llaveBreb}
          setLlaveBreb={setLlaveBreb}
          holder={holder}
          setHolder={setHolder}
          comment={comment}
          setComment={setComment}
          canSubmit={canSubmit}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
        <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast((p) => ({ ...p, visible: false }))} />
        <ProcessingModal visible={submitting} message="Procesando tu retiro…" />
        <FundingSuccessModal
          visible={!!success}
          kind="withdrawal"
          amount={success?.amount ?? 0}
          rows={success?.rows ?? []}
          onClose={() => { setSuccess(null); router.replace("/movements"); }}
        />
        {verifModal}
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {!isDesktop && <ScreenHeader title="Retirar" showBackButton showAvatar={false} />}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop, { paddingBottom: insets.bottom + 90 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isDesktop && (
            <View style={styles.dtHeader}>
              <Text style={styles.dtTitle}>Retirar</Text>
              <Text style={styles.dtSub}>Retirá dinero de tu cuenta a un destino externo</Text>
            </View>
          )}
          <View style={isDesktop ? styles.desktopRow : undefined}>
          <View style={isDesktop ? styles.formCol : undefined}>
          <AmountInput value={amount} onChange={setAmount} availableBalance={balance} />

          {insufficient && numericAmount > 0 && (
            <View style={styles.warning}>
              <Text style={styles.warningText}>Saldo insuficiente. Disponible: {formatCurrency(balance)}</Text>
            </View>
          )}

          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={18} color={colors.accent} />
            <Text style={styles.noteText}>
              Al confirmar, el monto se retiene de tu saldo. Si el retiro se rechaza, se devuelve.
            </Text>
          </View>

          <Input
            label="Número de cuenta o alias de destino"
            placeholder="Dónde querés recibir el dinero"
            value={destination}
            onChangeText={setDestination}
            autoCapitalize="none"
            containerStyle={styles.block}
          />
          <Input
            label="Llave Bre-B (opcional)"
            placeholder="Tu llave Bre-B"
            value={llaveBreb}
            onChangeText={setLlaveBreb}
            autoCapitalize="none"
            containerStyle={styles.block}
          />
          <Input
            label="Titular (opcional)"
            placeholder="Nombre del titular de la cuenta destino"
            value={holder}
            onChangeText={setHolder}
            containerStyle={styles.block}
          />
          <Input
            label="Comentario (opcional)"
            placeholder="Ej: retiro a mi cuenta bancaria"
            value={comment}
            onChangeText={setComment}
            containerStyle={styles.block}
          />

          <View style={{ height: spacing.xl }} />

          <Button onPress={handleSubmit} disabled={!canSubmit} variant={canSubmit ? "primary" : "outline"} style={{ width: "100%" }} loading={submitting}>
            Confirmar retiro
          </Button>
          {!canSubmit && !submitting && (
            <Text style={styles.helper}>
              {numericAmount <= 0
                ? "Ingresá un monto"
                : insufficient
                  ? "Saldo insuficiente"
                  : destination.trim().length < 6
                    ? "Ingresá el destino (número de cuenta o alias)"
                    : ""}
            </Text>
          )}
          </View>{/* /formCol */}

          {isDesktop && (
            <View style={styles.sideCol}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Tu saldo</Text>
                <Text style={styles.balanceBig}>{formatCurrency(balance)}</Text>
                <Text style={styles.balanceCap}>Disponible para retirar</Text>
                <View style={styles.infoDivider} />
                <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
                {[
                  "Ingresá el monto a retirar (se retiene de tu saldo).",
                  "Indicá la cuenta o alias de destino.",
                  "Revisamos la solicitud y enviamos el dinero.",
                  "Si se rechaza, el monto se devuelve a tu saldo.",
                ].map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNum}><Text style={styles.stepNumText}>{i + 1}</Text></View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          </View>{/* /desktopRow */}
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((p) => ({ ...p, visible: false }))}
      />

      <ProcessingModal visible={submitting} message="Procesando tu retiro…" />

      <FundingSuccessModal
        visible={!!success}
        kind="withdrawal"
        amount={success?.amount ?? 0}
        rows={success?.rows ?? []}
        onClose={() => {
          setSuccess(null);
          router.replace("/movements");
        }}
      />

      {verifModal}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    contentDesktop: { width: "100%", maxWidth: 1120, alignSelf: "center", paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
    dtHeader: { marginBottom: spacing.xl },
    dtTitle: { fontSize: 28, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },
    dtSub: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
    block: { marginBottom: spacing.md },
    // Escritorio: 2 columnas (form | panel saldo/guía)
    desktopRow: { flexDirection: "row", gap: spacing.xl, alignItems: "flex-start" },
    formCol: { flex: 1.3, minWidth: 0, maxWidth: 560 },
    sideCol: { flex: 1, minWidth: 0, maxWidth: 380 },
    infoCard: {
      backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border,
      padding: spacing.lg, gap: spacing.md,
    },
    infoTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    balanceBig: { fontSize: 26, fontWeight: "800", color: colors.foreground },
    balanceCap: { fontSize: 12, color: colors.mutedForeground },
    infoDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
    stepRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
    stepNum: {
      width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accentAlpha[10],
      alignItems: "center", justifyContent: "center", marginTop: 1,
    },
    stepNumText: { color: colors.accent, fontWeight: "800", fontSize: 12 },
    stepText: { flex: 1, fontSize: 13.5, lineHeight: 19, color: colors.foreground },
    warning: {
      backgroundColor: colors.destructive + "15", borderWidth: 1, borderColor: colors.destructive + "40",
      borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, alignItems: "center",
    },
    warningText: { color: colors.destructive, fontSize: 12, fontWeight: "600" },
    note: {
      flexDirection: "row", gap: spacing.sm, alignItems: "flex-start",
      backgroundColor: colors.accentAlpha[10], borderRadius: borderRadius.lg,
      padding: spacing.md, marginBottom: spacing.lg,
    },
    noteText: { flex: 1, color: colors.mutedForeground, fontSize: 12, lineHeight: 18 },
    helper: { marginTop: spacing.md, textAlign: "center", color: colors.mutedForeground, fontSize: 12 },
  });

