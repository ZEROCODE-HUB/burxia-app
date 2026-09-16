import React, { useCallback, useMemo, useState } from "react";
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
import { useRouter, useFocusEffect } from "expo-router";
import { spacing, borderRadius } from "../../theme";
import { ScreenHeader } from "../../components/layout";
import { Input, Button, Toast, ProcessingModal } from "../../components/ui";
import { useTheme } from "../../context/ThemeContext";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { useAccountRefreshOnFocus } from '../../hooks/useAccountRefreshOnFocus';
import { parseAmount, formatCurrency } from "../../utils/formatters";
import {
  getPaymentMethods,
  uploadProof,
  createDepositRequest,
  PaymentMethod,
} from "../../services/funding.service";
import { FundingSuccessModal, FundingSummaryRow } from "../../components/funding/FundingSuccessModal";
import { DesktopBackground } from "../../components/layout/DesktopPage";
import { DesktopDeposit } from "../../components/funding/DesktopDeposit";

export default function DepositScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isDesktop = useIsDesktop();
  useAccountRefreshOnFocus();
  const router = useRouter();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [amount, setAmount] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ amount: number; rows: FundingSummaryRow[] } | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>(
    { visible: false, message: "", type: "success" }
  );

  // Carga los métodos de pago. Con timeout de seguridad para que nunca quede
  // girando si la request se cuelga, y reintentable.
  const loadMethods = useCallback(async () => {
    setLoadingMethods(true);
    try {
      const m = await Promise.race<PaymentMethod[]>([
        getPaymentMethods(),
        new Promise<PaymentMethod[]>((_, rej) => setTimeout(() => rej(new Error("timeout")), 15000)),
      ]);
      setMethods(m);
      setSelectedId((prev) => prev ?? (m.length === 1 ? m[0].id : null));
    } catch (e: any) {
      // No pisamos métodos ya cargados; solo avisamos si no hay ninguno.
      setMethods((prev) => (prev.length ? prev : []));
    } finally {
      setLoadingMethods(false);
    }
  }, []);

  // Recarga CADA VEZ que se entra a la pantalla (reintenta si una carga previa falló).
  useFocusEffect(useCallback(() => { loadMethods(); }, [loadMethods]));

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

      const rows: FundingSummaryRow[] = [];
      if (selected?.label) rows.push({ label: "Método", value: selected.label });
      if (selected?.bank_name) rows.push({ label: "Banco", value: selected.bank_name });
      if (selected?.account_number) rows.push({ label: "Número de cuenta", value: selected.account_number });
      if (selected?.alias) rows.push({ label: "Alias", value: selected.alias });
      if (selected?.llave_breb) rows.push({ label: "Llave Bre-B", value: selected.llave_breb });
      if (comment.trim()) rows.push({ label: "Comentario", value: comment.trim() });
      rows.push({ label: "Comprobante", value: "Adjuntado" });

      setSuccess({ amount: numericAmount, rows });
    } catch (e: any) {
      showToast(e.message ?? "No se pudo enviar la solicitud", "error");
    } finally {
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

  if (isDesktop) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <DesktopDeposit
          amount={amount}
          setAmount={setAmount}
          numericAmount={numericAmount}
          methods={methods}
          loadingMethods={loadingMethods}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          comment={comment}
          setComment={setComment}
          proofUri={proofUri}
          pickProof={pickProof}
          canSubmit={canSubmit}
          submitting={submitting}
          onSubmit={handleSubmit}
          onCopy={copy}
        />
        <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast((p) => ({ ...p, visible: false }))} />
        <ProcessingModal visible={submitting} message="Procesando tu depósito…" />
        <FundingSuccessModal
          visible={!!success}
          kind="deposit"
          amount={success?.amount ?? 0}
          rows={success?.rows ?? []}
          onClose={() => { setSuccess(null); router.replace("/movements"); }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {!isDesktop && <ScreenHeader title="Depositar" showBackButton showAvatar={false} />}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop, { paddingBottom: insets.bottom + 90 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isDesktop && (
            <View style={styles.dtHeader}>
              <Text style={styles.dtTitle}>Depositar</Text>
              <Text style={styles.dtSub}>Cargá saldo a tu cuenta con transferencia o QR</Text>
            </View>
          )}
          <View style={isDesktop ? styles.desktopRow : undefined}>
          <View style={isDesktop ? styles.formCol : undefined}>
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
            <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
              <Text style={styles.empty}>No se pudieron cargar los métodos. Tocá para reintentar.</Text>
              <TouchableOpacity onPress={loadMethods} style={styles.retryBtn} activeOpacity={0.8}>
                <Ionicons name="refresh" size={16} color={colors.accent} />
                <Text style={styles.retryText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
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
                      <DataRow label="Número de cuenta" value={m.account_number} />
                      <DataRow label="Alias" value={m.alias} />
                      <DataRow label="Llave Bre-B" value={m.llave_breb} />
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
          </View>{/* /formCol */}

          {isDesktop && (
            <View style={styles.sideCol}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
                {[
                  "Ingresá el monto que vas a depositar.",
                  "Transferí ese monto a los datos de la cuenta seleccionada.",
                  "Subí el comprobante de la transferencia.",
                  "Nuestro equipo lo revisa y acredita tu saldo.",
                ].map((step, i) => (
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

      <ProcessingModal visible={submitting} message="Procesando tu depósito…" />

      <FundingSuccessModal
        visible={!!success}
        kind="deposit"
        amount={success?.amount ?? 0}
        rows={success?.rows ?? []}
        onClose={() => {
          setSuccess(null);
          router.replace("/movements");
        }}
      />
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
    // Escritorio: 2 columnas (form | panel guía)
    desktopRow: { flexDirection: "row", gap: spacing.xl, alignItems: "flex-start" },
    formCol: { flex: 1.3, minWidth: 0, maxWidth: 560 },
    sideCol: { flex: 1, minWidth: 0, maxWidth: 380 },
    infoCard: {
      backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border,
      padding: spacing.lg, gap: spacing.md,
    },
    infoTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground, marginBottom: spacing.xs },
    stepRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
    stepNum: {
      width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accentAlpha[10],
      alignItems: "center", justifyContent: "center", marginTop: 1,
    },
    stepNumText: { color: colors.accent, fontWeight: "800", fontSize: 12 },
    stepText: { flex: 1, fontSize: 13.5, lineHeight: 19, color: colors.foreground },
    infoNote: {
      flexDirection: "row", gap: spacing.sm, alignItems: "flex-start",
      marginTop: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
    },
    infoNoteText: { flex: 1, fontSize: 12, lineHeight: 17, color: colors.mutedForeground },
    block: { marginBottom: spacing.sm },
    amountPreview: { color: colors.accent, fontWeight: "700", fontSize: 18, marginBottom: spacing.lg },
    sectionTitle: {
      fontSize: 13, fontWeight: "700", color: colors.mutedForeground,
      textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm,
    },
    empty: { color: colors.mutedForeground, fontSize: 13 },
    retryBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.accent },
    retryText: { color: colors.accent, fontWeight: "700", fontSize: 13 },
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
