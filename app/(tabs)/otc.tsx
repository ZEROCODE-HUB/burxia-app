import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput,
  Platform, KeyboardAvoidingView, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";

import { spacing, borderRadius } from "../../theme";
import { ScreenHeader } from "../../components/layout";
import { Input, Button, Toast, ProcessingModal } from "../../components/ui";
import { FundingSuccessModal, FundingSummaryRow } from "../../components/funding/FundingSuccessModal";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { useAccountRefreshOnFocus } from '../../hooks/useAccountRefreshOnFocus';
import { DesktopBackground } from "../../components/layout/DesktopPage";
import { DataTable, Cell, StatusChip, type Column } from "../../components/layout/DataTable";
import { OperationVoucher } from "../../components/OperationVoucher";
import { formatCurrency } from "../../utils/formatters";
import {
  getOtcAssets, getMyOtcOrders, createOtcBuy, createOtcSell, uploadOtcProof,
  quoteBuy, quoteSell, cryptoFromFiat, OtcConfig, OtcOrder, OtcSide,
} from "../../services/otc.service";

// Etiqueta de la moneda fiat (formatCurrency usa es-CO/"$"). Si el despliegue
// es de otro país, cambiá solo esta constante.
const FIAT_LABEL = "Pesos";

const fmtCrypto = (n: number) => n.toLocaleString("es-CO", { maximumFractionDigits: 6 });

const fmtOtcDate = (iso: string) => {
  const d = new Date(iso);
  const month = d.toLocaleString("es-ES", { month: "short" }).replace(".", "");
  return `${d.getDate()} ${month.charAt(0).toUpperCase() + month.slice(1)}`;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente", completed: "Completada", rejected: "Rechazada",
};

const ERR_MAP: Record<string, string> = {
  INSUFFICIENT_BALANCE: "Saldo insuficiente para esta operación.",
  OUT_OF_RANGE: "La cantidad está fuera del rango permitido.",
  WALLET_REQUIRED: "Ingresá la dirección de tu wallet.",
  PROOF_REQUIRED: "Subí el comprobante del envío.",
  NO_COMPANY_WALLET: "La mesa no tiene wallet configurada. Contactá a soporte.",
  OTC_UNAVAILABLE: "El activo no está disponible por el momento.",
  INVALID_AMOUNT: "Ingresá una cantidad válida.",
};
function humanizeError(e: any): string {
  const raw = e?.message ?? "";
  for (const code in ERR_MAP) if (raw.includes(code)) return ERR_MAP[code];
  const m = raw.match(/^[A-Z_]+:\s*(.+)$/);
  return m ? m[1] : (raw || "No se pudo enviar la operación.");
}

export default function OtcScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { account } = useAuth();
  const isDesktop = useIsDesktop();
  useAccountRefreshOnFocus();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [assets, setAssets] = useState<OtcConfig[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [loadingCfg, setLoadingCfg] = useState(true);
  const [orders, setOrders] = useState<OtcOrder[]>([]);
  const [voucherOrder, setVoucherOrder] = useState<OtcOrder | null>(null);
  const cfg = useMemo(() => assets.find((a) => a.asset_code === selectedAsset) ?? null, [assets, selectedAsset]);

  const [side, setSide] = useState<OtcSide>("buy");
  const [enviasStr, setEnviasStr] = useState("");
  const [wallet, setWallet] = useState("");
  const [proofUri, setProofUri] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ amount: number; rows: FundingSummaryRow[]; title: string; amountLabel: string } | null>(null);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" }>(
    { visible: false, message: "", type: "success" }
  );

  const showToast = (message: string, type: "success" | "error") => setToast({ visible: true, message, type });
  const loadOrders = useCallback(() => { getMyOtcOrders().then(setOrders).catch(() => {}); }, []);

  useEffect(() => {
    getOtcAssets()
      .then((list) => { setAssets(list); if (list.length) setSelectedAsset(list[0].asset_code); })
      .catch((e) => showToast(e.message ?? "No se pudo cargar la mesa OTC", "error"))
      .finally(() => setLoadingCfg(false));
  }, []);
  useFocusEffect(useCallback(() => { loadOrders(); }, [loadOrders]));

  const balance = account?.balance || 0;
  const enviasNum = parseFloat(enviasStr.replace(",", ".")) || 0;
  const amountCrypto = !cfg ? 0 : side === "buy" ? cryptoFromFiat(cfg, enviasNum, "buy") : enviasNum;

  const q = useMemo(() => {
    if (!cfg || amountCrypto <= 0) return null;
    return side === "buy" ? quoteBuy(cfg, amountCrypto) : quoteSell(cfg, amountCrypto);
  }, [cfg, amountCrypto, side]);

  const buyTotal = q && side === "buy" ? (q as any).total as number : 0;
  const sellNet = q && side === "sell" ? (q as any).net as number : 0;
  const insufficient = side === "buy" && buyTotal > balance;

  // Rango permitido (configurable desde el admin). Se valida ANTES de enviar
  // para no comerse un OUT_OF_RANGE del servidor.
  const minAmt = cfg?.min_amount ?? 0;
  const maxAmt = cfg?.max_amount ?? null;
  const outOfRange =
    !!cfg && amountCrypto > 0 &&
    (amountCrypto < minAmt || (maxAmt != null && amountCrypto > maxAmt));
  const rangeMsg = cfg
    ? `Rango permitido: ${fmtCrypto(minAmt)}${maxAmt != null ? ` – ${fmtCrypto(maxAmt)}` : "+"} ${cfg.asset_code}`
    : "";

  const activePrice = cfg ? (side === "buy" ? cfg.unit_rate * (1 + cfg.commission_percent / 100) : cfg.unit_rate * (1 - cfg.commission_percent / 100)) : 0;

  const canSubmit =
    !!cfg && amountCrypto > 0 && !submitting && !insufficient && !outOfRange &&
    (side === "buy" ? wallet.trim().length > 0 : !!proofUri && !!cfg.company_wallet);

  const copy = async (v?: string | null) => { if (!v) return; await Clipboard.setStringAsync(v); showToast("Copiado", "success"); };
  const pickProof = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });
    if (!result.canceled && result.assets?.length) setProofUri(result.assets[0].uri);
  };
  const resetForm = () => { setEnviasStr(""); setWallet(""); setProofUri(null); setComment(""); };
  const pickSide = (s: OtcSide) => { if (s !== side) { setSide(s); setEnviasStr(""); setProofUri(null); } };
  const swap = () => pickSide(side === "buy" ? "sell" : "buy");

  // Timeout de seguridad: si la operación no resuelve (red/lock), corta a los 35s
  // con error, así el modal de carga nunca queda colgado para siempre.
  const withTimeout = <T,>(p: Promise<T>, ms = 35000): Promise<T> =>
    Promise.race([
      p,
      new Promise<T>((_, rej) => setTimeout(() => rej(new Error('La operación tardó demasiado. Revisá tu conexión e intentá de nuevo.')), ms)),
    ]);

  const handleSubmit = async () => {
    if (!canSubmit || !cfg || !q) return;
    try {
      setSubmitting(true);
      const commonRows: FundingSummaryRow[] = [
        { label: cfg.asset_code, value: `${fmtCrypto(amountCrypto)} ${cfg.asset_code}` },
        { label: "Cotización", value: `${formatCurrency(cfg.unit_rate)} / ${cfg.asset_code}` },
        { label: "Comisión", value: `${formatCurrency(q.commission)} (${cfg.commission_percent}%)` },
      ];
      if (side === "buy") {
        await withTimeout(createOtcBuy({ amountCrypto, wallet: wallet.trim(), assetCode: cfg.asset_code, comment: comment.trim() || null }));
        setSuccess({ amount: buyTotal, amountLabel: "Total debitado", title: "¡Compra solicitada con éxito!",
          rows: [...commonRows, { label: "Tu wallet", value: wallet.trim() }] });
      } else {
        const proofUrl = await withTimeout(uploadOtcProof(proofUri!));
        await withTimeout(createOtcSell({ amountCrypto, proofUrl, assetCode: cfg.asset_code, comment: comment.trim() || null }));
        setSuccess({ amount: sellNet, amountLabel: "A recibir", title: "¡Venta solicitada con éxito!",
          rows: [...commonRows, { label: "Enviaste a", value: cfg.company_wallet || "" }] });
      }
      resetForm();
      loadOrders();
    } catch (e: any) {
      showToast(humanizeError(e), "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Pill de moneda (compacta, no crece: flexShrink 0).
  const pill = (kind: "fiat" | "crypto", code: string) => (
    <View style={styles.pill}>
      <View style={[styles.coin, kind === "fiat" && styles.coinFiat]}>
        <Text style={styles.coinText}>{kind === "fiat" ? "$" : code.slice(0, 1)}</Text>
      </View>
      <Text style={styles.pillText} numberOfLines={1}>{kind === "fiat" ? FIAT_LABEL : code}</Text>
    </View>
  );

  // Panel Entregás / Recibís (dentro de una sola tarjeta). El input/valor lleva
  // minWidth:0 para poder encogerse y NO empujar la pill fuera del borde.
  const panel = (args: { label: string; kind: "fiat" | "crypto"; code: string; editable?: boolean; valueText: string }) => (
    <View style={styles.panel}>
      <Text style={styles.panelLabel}>{args.label}</Text>
      <View style={styles.panelRow}>
        {args.editable ? (
          <TextInput
            style={styles.amountInput}
            value={enviasStr}
            onChangeText={setEnviasStr}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
          />
        ) : (
          <Text style={styles.amountValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{args.valueText}</Text>
        )}
        {pill(args.kind, args.code)}
      </View>
    </View>
  );

  // Columnas de la tabla "Mis operaciones" (solo escritorio).
  const otcColumns: Column<OtcOrder>[] = useMemo(() => [
    { key: "fecha", header: "Fecha", width: 110, render: (o) => <Cell text={fmtOtcDate(o.created_at)} muted /> },
    {
      key: "op", header: "Operación", flex: 1.6, render: (o) => {
        const isBuy = o.side === "buy";
        const accent = isBuy ? colors.accent : colors.success;
        return (
          <View style={styles.otcOpCell}>
            <View style={[styles.otcIcon, { backgroundColor: accent + "22" }]}>
              <Ionicons name={isBuy ? "arrow-down" : "arrow-up"} size={15} color={accent} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Cell text={`${isBuy ? "Compra" : "Venta"} · ${fmtCrypto(o.amount_crypto)} ${o.asset_code}`} strong />
              {o.reference ? <Cell text={`Ref: ${o.reference}`} muted /> : null}
            </View>
          </View>
        );
      },
    },
    {
      key: "estado", header: "Estado", width: 130, render: (o) => {
        const tone = o.status === "completed" ? "ok" : o.status === "rejected" ? "bad" : "warn";
        return <StatusChip label={STATUS_LABEL[o.status] ?? o.status} tone={tone} />;
      },
    },
    { key: "monto", header: "Monto", width: 150, align: "right", render: (o) => <Text style={styles.otcAmount}>{formatCurrency(o.fiat_amount)}</Text> },
    { key: "accion", header: "", width: 44, align: "right", render: () => <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} /> },
  ], [colors, styles]);

  return (
    <View style={[styles.container, isDesktop ? { backgroundColor: "transparent" } : { paddingTop: insets.top }]}>
      {isDesktop && <DesktopBackground />}
      {!isDesktop && <ScreenHeader title="Comprar / Vender" showBackButton showAvatar={false} />}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop, { paddingBottom: insets.bottom + 90 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isDesktop && (
            <View style={styles.dtHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dtTitle}>Comprar / Vender USDT</Text>
                <Text style={styles.dtSub}>Operá USDT contra el saldo de tu cuenta</Text>
              </View>
              <View style={styles.balancePill}>
                <Text style={styles.balancePillLabel}>Saldo disponible</Text>
                <Text style={styles.balancePillValue}>{formatCurrency(balance)}</Text>
              </View>
            </View>
          )}
          {loadingCfg ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: spacing.xl }} />
          ) : !cfg ? (
            <Text style={styles.empty}>La mesa OTC no está disponible por el momento.</Text>
          ) : (
            <>
            <View style={isDesktop ? styles.desktopRow : undefined}>
              <View style={isDesktop ? styles.formCol : undefined}>
              {assets.length > 1 && (
                <View style={styles.assetRow}>
                  {assets.map((a) => (
                    <TouchableOpacity
                      key={a.asset_code}
                      onPress={() => { setSelectedAsset(a.asset_code); setEnviasStr(""); setProofUri(null); }}
                      style={[styles.assetChip, selectedAsset === a.asset_code && styles.assetChipActive]}
                    >
                      <Text style={[styles.assetChipText, selectedAsset === a.asset_code && styles.assetChipTextActive]}>
                        {a.asset_code}{a.network ? ` · ${a.network}` : ""}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Toggle Comprar / Vender */}
              <View style={styles.segment}>
                <TouchableOpacity style={[styles.segBtn, side === "buy" && styles.segBtnActive]} onPress={() => pickSide("buy")} activeOpacity={0.85}>
                  <Text style={[styles.segText, side === "buy" && styles.segTextActive]}>Comprar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.segBtn, side === "sell" && styles.segBtnActive]} onPress={() => pickSide("sell")} activeOpacity={0.85}>
                  <Text style={[styles.segText, side === "sell" && styles.segTextActive]}>Vender</Text>
                </TouchableOpacity>
              </View>

              {/* Cotización */}
              <View style={styles.rateLine}>
                <Text style={styles.rateLineText}>1 {cfg.asset_code} = <Text style={styles.rateLineStrong}>{formatCurrency(activePrice)}</Text></Text>
                <Text style={styles.rateLineSub}>comisión {cfg.commission_percent}%{cfg.network ? ` · ${cfg.network}` : ""}</Text>
              </View>

              {/* Tarjeta con los dos paneles + swap centrado */}
              <View style={styles.card}>
                {side === "buy"
                  ? panel({ label: "Entregás", kind: "fiat", code: FIAT_LABEL, editable: true, valueText: "" })
                  : panel({ label: "Entregás", kind: "crypto", code: cfg.asset_code, editable: true, valueText: "" })}

                <View style={styles.divider} />

                {side === "buy"
                  ? panel({ label: "Recibís", kind: "crypto", code: cfg.asset_code, valueText: amountCrypto > 0 ? fmtCrypto(amountCrypto) : "0" })
                  : panel({ label: "Recibís", kind: "fiat", code: FIAT_LABEL, valueText: formatCurrency(sellNet) })}

                <View style={styles.swapAbs} pointerEvents="box-none">
                  <TouchableOpacity style={styles.swapBtn} onPress={swap} activeOpacity={0.8}>
                    <Ionicons name="swap-vertical" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>

              {q && (
                <View style={styles.miniQuote}>
                  <Text style={styles.miniQuoteText}>Comisión: {formatCurrency(q.commission)}</Text>
                </View>
              )}
              {insufficient && (
                <Text style={styles.insufficient}>Saldo insuficiente. Disponible: {formatCurrency(balance)}</Text>
              )}

              {side === "buy" ? (
                <Input
                  label={`Tu dirección de wallet (${cfg.network || "red"})`}
                  placeholder={`Dónde recibís los ${cfg.asset_code}`}
                  value={wallet}
                  onChangeText={setWallet}
                  autoCapitalize="none"
                  containerStyle={styles.block}
                />
              ) : (
                <View style={styles.sellBox}>
                  <Text style={styles.sellTitle}>Enviá los {cfg.asset_code} a esta dirección de la empresa:</Text>
                  {cfg.company_wallet ? (
                    <View style={styles.walletRow}>
                      <Text style={styles.walletValue} selectable numberOfLines={1}>{cfg.company_wallet}</Text>
                      <TouchableOpacity onPress={() => copy(cfg.company_wallet)} hitSlop={8}>
                        <Ionicons name="copy-outline" size={18} color={colors.accent} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.insufficient}>La mesa no tiene wallet configurada. Contactá a soporte.</Text>
                  )}
                  <Text style={styles.sellHint}>Red: {cfg.network || "—"}. Luego subí el comprobante del envío.</Text>

                  <TouchableOpacity style={styles.uploadBox} onPress={pickProof} activeOpacity={0.8}>
                    {proofUri ? (
                      <Image source={{ uri: proofUri }} style={styles.proofPreview} resizeMode="cover" />
                    ) : (
                      <View style={styles.uploadEmpty}>
                        <Ionicons name="cloud-upload-outline" size={26} color={colors.accent} />
                        <Text style={styles.uploadText}>Subir comprobante / hash</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {proofUri && (
                    <TouchableOpacity onPress={pickProof}><Text style={styles.changeProof}>Cambiar comprobante</Text></TouchableOpacity>
                  )}
                </View>
              )}

              <Input
                label="Comentario (opcional)"
                placeholder="Ej: red TRC20"
                value={comment}
                onChangeText={setComment}
                containerStyle={styles.block}
              />

              <View style={{ height: spacing.sm }} />
              {amountCrypto > 0 && (outOfRange || insufficient) && (
                <Text style={styles.rangeWarn}>
                  {insufficient ? "Saldo insuficiente para esta operación." : rangeMsg}
                </Text>
              )}
              <Button onPress={handleSubmit} disabled={!canSubmit} variant={canSubmit ? "primary" : "outline"} style={{ width: "100%" }} loading={submitting}>
                {side === "buy" ? "Confirmar compra" : "Confirmar venta"}
              </Button>
              </View>{/* /formCol */}

              {isDesktop && (
                <View style={styles.sideCol}>
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Resumen</Text>
                    <View style={styles.sumRow}><Text style={styles.sumK}>Cotización</Text><Text style={styles.sumV}>{formatCurrency(cfg.unit_rate)} / {cfg.asset_code}</Text></View>
                    {amountCrypto > 0 && q ? (
                      <>
                        <View style={styles.sumRow}><Text style={styles.sumK}>{cfg.asset_code}</Text><Text style={styles.sumV}>{fmtCrypto(amountCrypto)}</Text></View>
                        <View style={styles.sumRow}><Text style={styles.sumK}>Comisión</Text><Text style={styles.sumV}>{formatCurrency(q.commission)}</Text></View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.sumRow}><Text style={styles.sumKStrong}>{side === "buy" ? "Total a pagar" : "A recibir"}</Text><Text style={styles.sumVStrong}>{formatCurrency(side === "buy" ? buyTotal : sellNet)}</Text></View>
                      </>
                    ) : (
                      <Text style={styles.summaryHint}>Ingresá un monto para ver el detalle.</Text>
                    )}
                  </View>
                </View>
              )}
              </View>{/* /desktopRow o columna móvil */}

              {/* Mis operaciones: tabla a todo el ancho en escritorio; tarjetas en móvil */}
              {orders.length > 0 && (isDesktop ? (
                <View style={styles.ordersSection}>
                  <Text style={styles.histTitle}>Mis operaciones</Text>
                  <DataTable
                    columns={otcColumns}
                    rows={orders}
                    keyExtractor={(o) => o.id}
                    onRowPress={(o) => setVoucherOrder(o)}
                    emptyIcon="swap-vertical-outline"
                    emptyText="Sin operaciones"
                  />
                </View>
              ) : (
                <View>
                  <Text style={styles.histTitle}>Mis operaciones</Text>
                  {orders.map((o) => {
                    const sc = o.status === "completed" ? colors.success : o.status === "rejected" ? colors.destructive : colors.warning;
                    return (
                      <TouchableOpacity key={o.id} style={styles.histCard} activeOpacity={0.8} onPress={() => setVoucherOrder(o)}>
                        <View style={styles.histRow}>
                          <Text style={styles.histSide}>{o.side === "buy" ? "Compra" : "Venta"} · {fmtCrypto(o.amount_crypto)} {o.asset_code}</Text>
                          <View style={[styles.badge, { backgroundColor: sc + "22" }]}>
                            <Text style={[styles.badgeText, { color: sc }]}>{STATUS_LABEL[o.status] ?? o.status}</Text>
                          </View>
                        </View>
                        <Text style={styles.histFiat}>{formatCurrency(o.fiat_amount)}</Text>
                        {o.reference ? <Text style={styles.histRef}>Ref: {o.reference} · Ver comprobante ›</Text> : null}
                        {o.admin_comment ? <Text style={styles.histComment}>Operador: {o.admin_comment}</Text> : null}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast((p) => ({ ...p, visible: false }))} />

      <ProcessingModal
        visible={submitting}
        message={side === "buy" ? "Procesando tu compra…" : "Procesando tu venta…"}
      />

      <OperationVoucher order={voucherOrder} visible={!!voucherOrder} onClose={() => setVoucherOrder(null)} />

      <FundingSuccessModal
        visible={!!success}
        kind="deposit"
        title={success?.title}
        subtitle="Tu operación quedó registrada. Te avisaremos cuando el operador la resuelva."
        amount={success?.amount ?? 0}
        amountLabel={success?.amountLabel}
        rows={success?.rows ?? []}
        ctaLabel="Entendido"
        onClose={() => { setSuccess(null); loadOrders(); }}
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
    dtHeaderRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.lg, marginBottom: spacing.xl, flexWrap: "wrap" },
    dtTitle: { fontSize: 28, fontWeight: "800", color: colors.foreground, letterSpacing: -0.5 },
    dtSub: { fontSize: 14, color: colors.mutedForeground, marginTop: 4 },
    balancePill: {
      backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
      borderRadius: borderRadius.lg, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, alignItems: "flex-end",
    },
    balancePillLabel: { fontSize: 11, color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: "700" },
    balancePillValue: { fontSize: 18, fontWeight: "800", color: colors.foreground, marginTop: 2 },
    empty: { color: colors.mutedForeground, fontSize: 14, textAlign: "center", marginTop: spacing.xl },

    ordersSection: { marginTop: spacing.xl },
    otcOpCell: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1, minWidth: 0 },
    otcIcon: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
    otcAmount: { fontSize: 13, fontWeight: "700", color: colors.foreground },

    // Escritorio: 2 columnas (form | resumen+historial)
    desktopRow: { flexDirection: "row", gap: spacing.xl, alignItems: "flex-start" },
    formCol: { flex: 1.2, minWidth: 0, maxWidth: 520 },
    sideCol: { flex: 1, minWidth: 0 },
    summaryCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg },
    summaryTitle: { fontSize: 17, fontWeight: "700", color: colors.foreground, marginBottom: spacing.md },
    sumRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 5 },
    sumK: { fontSize: 13, color: colors.mutedForeground },
    sumV: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    sumKStrong: { fontSize: 14, fontWeight: "700", color: colors.foreground },
    sumVStrong: { fontSize: 16, fontWeight: "800", color: colors.foreground },
    summaryDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
    summaryHint: { fontSize: 12, color: colors.mutedForeground, marginTop: spacing.xs },

    assetRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
    assetChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border },
    assetChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    assetChipText: { fontSize: 13, fontWeight: "700", color: colors.mutedForeground },
    assetChipTextActive: { color: "#fff" },

    segment: { flexDirection: "row", backgroundColor: colors.mutedAlpha[20], borderRadius: borderRadius.full, padding: 4, gap: 4, marginBottom: spacing.md },
    segBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.full, alignItems: "center" },
    segBtnActive: { backgroundColor: colors.accent },
    segText: { fontSize: 14, fontWeight: "700", color: colors.mutedForeground },
    segTextActive: { color: "#fff" },

    rateLine: { alignItems: "center", marginBottom: spacing.md },
    rateLineText: { fontSize: 15, color: colors.mutedForeground },
    rateLineStrong: { color: colors.foreground, fontWeight: "800" },
    rateLineSub: { fontSize: 11, color: colors.mutedForeground, marginTop: 2 },

    card: { position: "relative", borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.xl, backgroundColor: colors.card, overflow: "hidden" },
    panel: { padding: spacing.lg },
    panelLabel: { fontSize: 12, color: colors.mutedForeground, marginBottom: spacing.xs },
    panelRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    amountInput: { flex: 1, minWidth: 0, fontSize: 26, fontWeight: "800", color: colors.foreground, padding: 0 },
    amountValue: { flex: 1, minWidth: 0, fontSize: 26, fontWeight: "800", color: colors.foreground },
    divider: { height: 1, backgroundColor: colors.border },

    pill: { flexShrink: 0, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.full, paddingLeft: 4, paddingRight: spacing.sm, paddingVertical: 4 },
    coin: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
    coinFiat: { backgroundColor: colors.success },
    coinText: { fontSize: 12, fontWeight: "800", color: "#fff" },
    pillText: { fontSize: 14, fontWeight: "700", color: colors.foreground, maxWidth: 90 },

    swapAbs: { position: "absolute", top: "50%", left: 0, right: 0, alignItems: "center", marginTop: -20 },
    swapBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: colors.card },

    miniQuote: { marginTop: spacing.sm },
    miniQuoteText: { fontSize: 12, color: colors.mutedForeground },
    insufficient: { color: colors.destructive, fontSize: 12, fontWeight: "600", marginTop: spacing.sm, marginBottom: spacing.sm },

    block: { marginBottom: spacing.sm, marginTop: spacing.md },
    sellBox: { marginTop: spacing.md, marginBottom: spacing.sm },
    sellTitle: { fontSize: 13, fontWeight: "600", color: colors.foreground, marginBottom: spacing.sm },
    walletRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.background, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
    walletValue: { flex: 1, minWidth: 0, fontSize: 13, color: colors.foreground, fontWeight: "600" },
    sellHint: { fontSize: 12, color: colors.mutedForeground, marginTop: spacing.xs, marginBottom: spacing.md },
    uploadBox: { borderWidth: 1, borderStyle: "dashed", borderColor: colors.border, borderRadius: borderRadius.xl, overflow: "hidden", backgroundColor: colors.card },
    uploadEmpty: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xl, gap: spacing.sm },
    uploadText: { color: colors.accent, fontWeight: "600" },
    proofPreview: { width: "100%", height: 180 },
    changeProof: { color: colors.accent, textAlign: "center", marginTop: spacing.sm, fontSize: 13 },
    rangeWarn: { color: colors.warning, fontSize: 12.5, fontWeight: "600", textAlign: "center", marginBottom: spacing.sm },

    histTitle: { fontSize: 13, fontWeight: "700", color: colors.mutedForeground, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: spacing.sm },
    histCard: { backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm },
    histRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    histSide: { fontSize: 14, fontWeight: "600", color: colors.foreground },
    histFiat: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
    histComment: { fontSize: 12, color: colors.foreground, marginTop: spacing.xs },
    histRef: { fontSize: 11.5, color: colors.accent, marginTop: 4, fontWeight: "600" },
    badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
    badgeText: { fontSize: 11, fontWeight: "700" },
  });
