import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LogoIcon } from './LogoIcon';
import { BRAND_NAME } from '../constants/brand';
import { spacing, borderRadius } from '../theme';
import { capturarYCompartir } from '../lib/captura';

// Comprobante ÚNICO de toda la app. Mismo estilo y mismos campos sin importar
// desde dónde se abra (Inicio, Movimientos, pantalla OTC). Es "tonto": recibe un
// modelo ya armado (VoucherModel) por los builders de voucher.builders.ts.

export interface VoucherRow {
  label: string;
  value?: string | null;
  mono?: boolean;
  strong?: boolean;
}

export interface VoucherModel {
  subtitle: string;   // ej: "Comprobante de operación"
  status: string;     // pending | completed | approved | rejected | processing | ...
  rows: VoucherRow[];
  shareName: string;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  approved: 'Aprobada',
  completed: 'Completada',
  rejected: 'Rechazada',
  failed: 'Fallida',
  cancelled: 'Cancelada',
  reversed: 'Reversada',
};

const OK = new Set(['approved', 'completed']);
const BAD = new Set(['rejected', 'failed', 'cancelled', 'reversed']);

export function Voucher({ model, visible, onClose }: { model: VoucherModel | null; visible: boolean; onClose: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const shotRef = useRef(null);

  if (!visible || !model) return null;

  const statusLabel = STATUS_LABEL[model.status] ?? model.status ?? 'Pendiente';
  const badgeStyle = OK.has(model.status) ? styles.badgeOk : BAD.has(model.status) ? styles.badgeBad : styles.badge;

  const share = async () => {
    try { await capturarYCompartir(shotRef, { nombre: model.shareName, titulo: `Comprobante ${BRAND_NAME}` }); } catch { /* noop */ }
  };

  const Row = ({ row }: { row: VoucherRow }) =>
    row.value ? (
      <View style={styles.row}>
        <Text style={styles.k}>{row.label}</Text>
        <Text style={[styles.v, row.mono && styles.mono, row.strong && styles.vStrong]} selectable numberOfLines={2}>{row.value}</Text>
      </View>
    ) : null;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View ref={shotRef} collapsable={false} style={styles.card}>
              <View style={styles.brand}>
                <View style={styles.logoBadge}><LogoIcon size={30} /></View>
                <Text style={styles.brandName}>{BRAND_NAME}</Text>
              </View>
              <Text style={styles.title}>{model.subtitle}</Text>
              <View style={[styles.badge, badgeStyle]}>
                <Text style={styles.badgeText}>{statusLabel}</Text>
              </View>

              <View style={styles.divider} />
              {model.rows.map((row, i) => <Row key={`${row.label}-${i}`} row={row} />)}

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
