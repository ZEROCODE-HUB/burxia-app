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
import { Input, Button, Toast } from "../../components/ui";
import { AmountInput } from "../../components/transfer";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { parseAmount, formatCurrency } from "../../utils/formatters";
import { createWithdrawalRequest } from "../../services/funding.service";

export default function WithdrawScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { account } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [amount, setAmount] = useState("0");
  const [destination, setDestination] = useState("");
  const [holder, setHolder] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      await createWithdrawalRequest({
        amount: numericAmount,
        destination: { identifier: destination.trim(), holder: holder.trim() || null },
        comment: comment.trim() || null,
      });
      showToast("Solicitud de retiro enviada", "success");
      setTimeout(() => router.replace("/requests"), 900);
    } catch (e: any) {
      const msg = e?.message?.includes("INSUFFICIENT_BALANCE")
        ? "Saldo insuficiente"
        : e?.message ?? "No se pudo enviar la solicitud";
      showToast(msg, "error");
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Retirar" showBackButton showAvatar={false} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
            label="CBU, CVU o alias de destino"
            placeholder="Dónde querés recibir el dinero"
            value={destination}
            onChangeText={setDestination}
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
                    ? "Ingresá el destino (CBU, CVU o alias)"
                    : ""}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast((p) => ({ ...p, visible: false }))}
      />
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    block: { marginBottom: spacing.md },
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
