import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { LogoIcon } from './LogoIcon';
import { BRAND_NAME } from '../constants/brand';
import { spacing, borderRadius } from '../theme';
import { formatCurrency } from '../utils/formatters';
import { capturarYCompartir } from '../lib/captura';
import type { OtcOrder } from '../services/otc.service';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Procesando', completed: 'Aprobada', rejected: 'Rechazada',
};
const fmtCrypto = (n: number) => Number(n).toLocaleString('es-CO', { maximumFractionDigits: 6 });
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

/**
 * Baucher/comprobante de una operación OTC. Logo de la marca arriba + todos los
 * campos del comprobante (referencia, hash, tipo, cliente+NIT, TRM, monto,
 * comisión, neto, concepto, fechas y estado). Se puede compartir/descargar.
 */
export function OperationVoucher({ order, visible, onClose }: { order: OtcOrder | null; visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const shotRef = useRef(null);

  if (!visible || !order) return null;

  const isSell = order.side === 'sell';
  const clientName = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '—';
  const nit = (user as any)?.cuit_cuil || (user as any)?.dni || '—';
  // Neto: en venta = a recibir (fiat - comisión); en compra = total a pagar (fiat + comisión)
  const neto = isSell
    ? order.fiat_amount - (order.commission_amount ?? 0)
    : order.fiat_amount + (order.commission_amount ?? 0);

  const Row = ({ label, value, mono, strong }: { label: string; value?: string | null; mono?: boolean; strong?: boolean }) =>
    value ? (
      <View style={styles.row}>
        <Text style={styles.k}>{label}</Text>
        <Text style={[styles.v, mono && styles.mono, strong && styles.vStrong]} selectable numberOfLines={2}>{value}</Text>
      </View>
    ) : null;

  const share = async () => {
    try { await capturarYCompartir(shotRef, { nombre: `comprobante-${order.reference || order.id}`, titulo: 'Comprobante Bruxia' }); } catch {}
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View ref={shotRef} collapsable={false} style={styles.card}>
              {/* Logo arriba */}
              <View style={styles.brand}>
                <View style={styles.logoBadge}><LogoIcon size={30} /></View>
                <Text style={styles.brandName}>{BRAND_NAME}</Text>
              </View>
              <Text style={styles.title}>Comprobante de operación</Text>
              <View style={[styles.badge, order.status === 'completed' && styles.badgeOk, order.status === 'rejected' && styles.badgeBad]}>
                <Text style={styles.badgeText}>{STATUS_LABEL[order.status] ?? order.status}</Text>
              </View>

              <View style={styles.divider} />
              <Row label="Referencia" value={order.reference} mono strong />
              <Row label="Id Transacción (hash)" value={order.tx_hash || '—'} mono />
              <Row label="Tipo" value={isSell ? 'Venta USDT · Depósito de cripto' : 'Compra USDT'} />
              <Row label="Cliente" value={clientName} />
              <Row label="NIT / Documento" value={nit} />

              <View style={styles.divider} />
              <Row label={`TRM negociada (${order.asset_code})`} value={`${formatCurrency(order.unit_rate)} / ${order.asset_code}`} />
              <Row label="Cantidad" value={`${fmtCrypto(order.amount_crypto)} ${order.asset_code}`} />
              <Row label="Monto" value={formatCurrency(order.fiat_amount)} />
              <Row label="Comisión" value={`${formatCurrency(order.commission_amount ?? 0)} (${order.commission_percent}%)`} />
              <Row label={isSell ? 'Neto a recibir' : 'Total a pagar'} value={formatCurrency(neto)} strong />
              <Row label="Concepto" value={order.user_comment || '—'} />

              <View style={styles.divider} />
              <Row label="Fecha (envío del cliente)" value={fmtDate(order.created_at)} />
              <Row label="Fecha de acreditación" value={fmtDate(order.resolved_at)} />
              {order.admin_comment ? <Row label="Observación" value={order.admin_comment} /> : null}

              <Text style={styles.footer}>{BRAND_NAME} · Comprobante generado automáticamente</Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.btnGhostText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={share} activeOpacity={0.85}>
              <Ionicons name="share-outline" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Compartir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(4,10,20,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    sheet: { width: '100%', maxWidth: 460, maxHeight: '90%', backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    card: { backgroundColor: colors.card, padding: spacing.lg },
    brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'center' },
    logoBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.accentAlpha[10], alignItems: 'center', justifyContent: 'center' },
    brandName: { fontSize: 22, fontWeight: '800', color: colors.foreground, letterSpacing: -0.5 },
    title: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.xs },
    badge: { alignSelf: 'center', marginTop: spacing.sm, backgroundColor: colors.warning + '22', borderColor: colors.warning + '55', borderWidth: 1, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12 },
    badgeOk: { backgroundColor: colors.success + '22', borderColor: colors.success + '55' },
    badgeBad: { backgroundColor: colors.destructive + '22', borderColor: colors.destructive + '55' },
    badgeText: { fontSize: 12, fontWeight: '700', color: colors.foreground },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 5 },
    k: { fontSize: 12.5, color: colors.mutedForeground, flexShrink: 0, maxWidth: '48%' },
    v: { fontSize: 13, color: colors.foreground, fontWeight: '600', flex: 1, textAlign: 'right' },
    vStrong: { fontWeight: '800', fontSize: 14 },
    mono: { fontFamily: 'monospace', letterSpacing: 0.3 },
    footer: { fontSize: 10.5, color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.lg },
    actions: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
    btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 46, borderRadius: borderRadius.lg },
    btnGhost: { borderWidth: 1, borderColor: colors.border },
    btnGhostText: { color: colors.foreground, fontWeight: '700' },
    btnPrimary: { backgroundColor: colors.accent },
    btnPrimaryText: { color: '#fff', fontWeight: '700' },
  });
