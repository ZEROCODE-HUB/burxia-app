import { formatCurrency } from '../utils/formatters';
import type { VoucherModel } from './Voucher';
import type { OtcOrder } from '../services/otc.service';
import type { FundingRequest } from '../services/funding.service';

// Builders: convierten cada fuente (orden OTC, solicitud de fondeo, transacción)
// al modelo único de comprobante (VoucherModel). Así el MISMO comprobante y los
// MISMOS campos se ven en todas las pantallas.

const fmtCrypto = (n: number) => Number(n ?? 0).toLocaleString('es-CO', { maximumFractionDigits: 6 });
const fmtDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

const clientOf = (user: any) => (user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || '—' : '—');
const nitOf = (user: any) => user?.cuit_cuil || user?.dni || '—';

/** Comprobante de una operación OTC (compra/venta). */
export function buildOtcVoucher(order: OtcOrder, user: any): VoucherModel {
  const isSell = order.side === 'sell';
  const neto = isSell
    ? order.fiat_amount - (order.commission_amount ?? 0)
    : order.fiat_amount + (order.commission_amount ?? 0);
  return {
    subtitle: 'Comprobante de operación',
    status: order.status,
    shareName: `comprobante-${order.reference || order.id}`,
    rows: [
      { label: 'Referencia', value: order.reference, mono: true, strong: true },
      { label: 'Id Transacción (hash)', value: order.tx_hash || '—', mono: true },
      { label: 'Tipo', value: isSell ? 'Venta USDT · Depósito de cripto' : 'Compra USDT' },
      { label: 'Cliente', value: clientOf(user) },
      { label: 'NIT / Documento', value: nitOf(user) },
      { label: `TRM negociada (${order.asset_code})`, value: `${formatCurrency(order.unit_rate)} / ${order.asset_code}` },
      { label: 'Cantidad', value: `${fmtCrypto(order.amount_crypto)} ${order.asset_code}` },
      { label: 'Monto', value: formatCurrency(order.fiat_amount) },
      { label: 'Comisión', value: `${formatCurrency(order.commission_amount ?? 0)} (${order.commission_percent}%)` },
      { label: isSell ? 'Neto a recibir' : 'Total a pagar', value: formatCurrency(neto), strong: true },
      { label: 'Concepto', value: order.user_comment || '—' },
      { label: 'Fecha (envío del cliente)', value: fmtDate(order.created_at) },
      { label: 'Fecha de acreditación', value: fmtDate(order.resolved_at) },
      ...(order.admin_comment ? [{ label: 'Observación', value: order.admin_comment }] : []),
    ],
  };
}

/** Comprobante de un depósito o retiro (fondeo). */
export function buildFundingVoucher(f: FundingRequest, user: any): VoucherModel {
  const isDeposit = f.kind === 'deposit';
  const dest = (f.destination?.identifier as string) || null;
  const holder = (f.destination?.holder as string) || null;
  const llave = (f.destination?.llave_breb as string) || null;
  return {
    subtitle: 'Comprobante de operación',
    status: f.status,
    shareName: `comprobante-${f.id}`,
    rows: [
      { label: 'Tipo', value: isDeposit ? 'Depósito' : 'Retiro' },
      { label: 'Cliente', value: clientOf(user) },
      { label: 'NIT / Documento', value: nitOf(user) },
      { label: 'Monto', value: formatCurrency(f.amount), strong: true },
      ...(dest ? [{ label: 'Cuenta / alias destino', value: dest, mono: true }] : []),
      ...(holder ? [{ label: 'Titular', value: holder }] : []),
      ...(llave ? [{ label: 'Llave Bre-B', value: llave, mono: true }] : []),
      { label: 'Concepto', value: f.user_comment || '—' },
      { label: 'Fecha (solicitud)', value: fmtDate(f.created_at) },
      ...(f.resolved_at ? [{ label: 'Fecha de resolución', value: fmtDate(f.resolved_at) }] : []),
      ...(f.admin_comment ? [{ label: 'Observación', value: f.admin_comment }] : []),
    ],
  };
}

/**
 * Comprobante de una transacción "simple" (transferencia, etc.). Robusto a los
 * DOS shapes: tabla `transactions` (dashboard) y vista `account_movements`
 * (pantalla Movimientos), que nombran los campos distinto.
 */
export function buildTxVoucher(tx: any, accountId: string | undefined, user: any): VoucherModel {
  const isIncome = tx?.movement_type
    ? tx.movement_type === 'income'
    : tx?.to_account_id === accountId;
  const typeName = tx?.transaction_type_name || tx?.transaction_types?.name || (isIncome ? 'Ingreso' : 'Egreso');
  const counterpart = tx?.counterpart_name || tx?.external_holder_name || '—';
  const ref = tx?.reference_number || tx?.transaction_id || tx?.id || '—';
  return {
    subtitle: 'Comprobante de movimiento',
    status: tx?.status || 'completed',
    shareName: `comprobante-${ref}`,
    rows: [
      { label: 'Referencia', value: ref, mono: true, strong: true },
      { label: 'Tipo', value: typeName },
      { label: 'Cliente', value: clientOf(user) },
      { label: 'Monto', value: formatCurrency(tx?.amount ?? 0), strong: true },
      { label: isIncome ? 'De' : 'Para', value: counterpart },
      { label: 'Concepto', value: tx?.concept || '—' },
      { label: 'Fecha', value: fmtDate(tx?.created_at) },
    ],
  };
}
