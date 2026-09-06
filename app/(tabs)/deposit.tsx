import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { spacing, borderRadius } from "../../theme";
import { ScreenHeader } from "../../components/layout";
import { Input, Button, Toast } from "../../components/ui";
import { useTheme } from "../../context/ThemeContext";
import { parseAmount, formatCurrency } from "../../utils/formatters";
import {
  getPaymentMethods,
  uploadProof,
  createDepositRequest,
  PaymentMethod,
} from "../../services/funding.service";

export default function DepositScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [amount, setAmount] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>(
    { visible: false, message: "", type: "success" }
  );

  useEffect(() => {
    getPaymentMethods()
      .then((m) => {
        setMethods(m);
        if (m.length === 1) setSelectedId(m[0].id);
      })
      .catch((e) => showToast(e.message ?? "No se pudieron cargar los métodos", "error"))
      .finally(() => setLoadingMethods(false));
  }, []);

  const showToast = (message: string, type: "success" | "error") =>
    setToast({ visible: true, message, type });

  const numericAmount = parseAmount(amount);
  const selected = methods.find((m) => m.id === selectedId) || null;
  const canSubmit = numericAmount > 0 && !!selectedId && !!proofUri && !submitting;

  const pickProof = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setProofUri(result.assets[0].uri);
    }
  };

  const copy = async (value?: string | null) => {
    if (!value) return;
    await Clipboard.setStringAsync(value);
    showToast("Copiado", "success");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      const proofUrl = await uploadProof(proofUri!);
      await createDepositRequest({
        amount: numericAmount,
        paymentMethodId: selectedId,
        proofUrl,
        comment: comment.trim() || null,
      });
      showToast("Solicitud de depósito enviada", "success");
      setTimeout(() => router.replace("/requests"), 900);
    } catch (e: any) {
      showToast(e.message ?? "No se pudo enviar la solicitud", "error");
      setSubmitting(false);
    }
  };

  const DataRow = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <View style={styles.dataRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.dataLabel}>{label}</Text>
          <Text style={styles.dataValue} selectable>{value}</Text>
        </View>
        <TouchableOpacity onPress={() => copy(value)} style={styles.copyBtn} hitSlop={8}>
          <Ionicons name="copy-outline" size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>
    ) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Depositar" showBackButton showAvatar={false} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 90 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input
            label="Monto a depositar"
            placeholder="0,00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            containerStyle={styles.block}
          />
          {numericAmount > 0 && (
            <Text style={styles.amountPreview}>{formatCurrency(numericAmount)}</Text>
          )}

          <Text style={styles.sectionTitle}>¿Cómo vas a depositar?</Text>

          {loadingMethods ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: spacing.lg }} />
          ) : methods.length === 0 ? (
            <Text style={styles.empty}>No hay métodos de pago disponibles. Contactá a soporte.</Text>
          ) : (
            methods.map((m) => {
              const active = m.id === selectedId;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.methodCard, active && styles.methodCardActive]}
                  onPress={() => setSelectedId(m.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.methodHeader}>
                    <Ionicons
                      name={active ? "radio-button-on" : "radio-button-off"}
                      size={20}
                      color={active ? colors.accent : colors.mutedForeground}
                    />
                    <Text style={styles.methodLabel}>{m.label}</Text>
                  </View>

                  {active && (
                    <View style={styles.methodBody}>
                      {m.image_path ? (
                        <Image source={{ uri: m.image_path }} style={styles.qr} resizeMode="contain" />
                      ) : null}
                      <DataRow label="Banco" value={m.bank_name} />
                      <DataRow label="Titular" value={m.holder_name} />
                      <DataRow label="CBU / CVU" value={m.account_number} />
                      <DataRow label="Alias" value={m.alias} />
                      {m.instructions ? (
                        <Text style={styles.instructions}>{m.instructions}</Text>
                      ) : null}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}

          <Input
            label="Comentario (opcional)"
            placeholder="Ej: transferí desde mi cuenta"
            value={comment}
            onChangeText={setComment}
            containerStyle={styles.block}
          />

          <Text style={styles.sectionTitle}>Comprobante</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={pickProof} activeOpacity={0.8}>
            {proofUri ? (
              <Image source={{ uri: proofUri }} style={styles.proofPreview} resizeMode="cover" />
            ) : (
              <View style={styles.uploadEmpty}>
                <Ionicons name="cloud-upload-outline" size={28} color={colors.accent} />
                <Text style={styles.uploadText}>Subir comprobante</Text>
              </View>
            )}
          </TouchableOpacity>
          {proofUri && (
            <TouchableOpacity onPress={pickProof}>
              <Text style={styles.changeProof}>Cambiar comprobante</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: spacing.xl }} />

          <Button onPress={handleSubmit} disabled={!canSubmit} variant={canSubmit ? "primary" : "outline"} style={{ width: "100%" }} loading={submitting}>
            Confirmar depósito
          </Button>
          {!canSubmit && !submitting && (
            <Text style={styles.helper}>
              {numericAmount <= 0
                ? "Ingresá un monto"
                : !selectedId
                  ? "Elegí un método de pago"
                  : !proofUri
                    ? "Subí el comprobante"
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
    block: { marginBottom: spacing.sm },
    amountPreview: { color: colors.accent, fontWeight: "700", fontSize: 18, marginBottom: spacing.lg },
    sectionTitle: {
      fontSize: 13, fontWeight: "700", color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm,
    },
    empty: { color: colors.mutedForeground, fontSize: 13, marginBottom: spacing.md },
    methodCard: {
      borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.xl,
      padding: spacing.md, marginBottom: spacing.md, backgroundColor: colors.card,
    },
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
    uploadBox: {
      borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, borderRadius: borderRadius.xl,
      overflow: "hidden", backgroundColor: colors.card,
    },
    uploadEmpty: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xl, gap: spacing.sm },
    uploadText: { color: colors.accent, fontWeight: "600" },
    proofPreview: { width: "100%", height: 200 },
    changeProof: { color: colors.accent, textAlign: "center", marginTop: spacing.sm, fontSize: 13 },
    helper: { marginTop: spacing.md, textAlign: "center", color: colors.mutedForeground, fontSize: 12 },
  });
