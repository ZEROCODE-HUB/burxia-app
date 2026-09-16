import { getMyRequests, type FundingRequest } from "./funding.service";
import { getMyOtcOrders, type OtcOrder } from "./otc.service";
export type { FundingRequest } from "./funding.service";
export type { OtcOrder } from "./otc.service";

/**
 * Vista unificada de "solicitudes" del usuario: depósitos/retiros (fondeo) +
 * compras/ventas (OTC), normalizados a un mismo item. Se usa en Movimientos
 * (feed único) y en el dashboard (sección "Solicitudes").
 */

export type SolicitudStatus = "pending" | "approved" | "rejected" | "completed";

export interface SolicitudItem {
  id: string;
  source: "funding" | "otc";
  kind: "deposit" | "withdrawal" | "otc_buy" | "otc_sell";
  title: string;
  subtitle: string | null;
  amountFiat: number;
  status: SolicitudStatus;
  transactionId: string | null;
  adminComment: string | null;
  createdAt: string;
  isIncome: boolean; // entra dinero al saldo (para ícono/color)
  rawOtc?: OtcOrder; // orden OTC cruda: para el comprobante rico
  rawFunding?: FundingRequest; // solicitud de fondeo cruda: para el comprobante rico
}

const fmtCrypto = (n: number) => n.toLocaleString("es-CO", { maximumFractionDigits: 6 });

function fromFunding(r: FundingRequest): SolicitudItem {
  const isDeposit = r.kind === "deposit";
  const dest = (r.destination?.identifier as string) || null;
  return {
    id: `f_${r.id}`,
    source: "funding",
    kind: r.kind,
    title: isDeposit ? "Depósito" : "Retiro",
    subtitle: !isDeposit && dest ? `a ${dest}` : null,
    amountFiat: Number(r.amount),
    status: r.status,
    transactionId: r.transaction_id,
    adminComment: r.admin_comment,
    createdAt: r.created_at,
    isIncome: isDeposit,
    rawFunding: r,
  };
}

function fromOtc(o: OtcOrder): SolicitudItem {
  const isBuy = o.side === "buy";
  return {
    id: `o_${o.id}`,
    source: "otc",
    kind: isBuy ? "otc_buy" : "otc_sell",
    title: `${isBuy ? "Compra" : "Venta"} ${o.asset_code}`,
    subtitle: `${fmtCrypto(o.amount_crypto)} ${o.asset_code}`,
    amountFiat: Number(o.fiat_amount),
    status: o.status,
    transactionId: o.transaction_id,
    adminComment: o.admin_comment,
    createdAt: o.created_at,
    isIncome: !isBuy, // la venta acredita fiat
    rawOtc: o,
  };
}

/** Todas las solicitudes del usuario (fondeo + OTC), normalizadas, desc. */
export async function getMySolicitudes(): Promise<SolicitudItem[]> {
  const [funding, otc] = await Promise.all([getMyRequests(), getMyOtcOrders()]);
  const items = [...funding.map(fromFunding), ...otc.map(fromOtc)];
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/** Solo las EN CURSO o rechazadas (las aprobadas/completadas ya son un movimiento). */
export function enCurso(items: SolicitudItem[]): SolicitudItem[] {
  return items.filter((s) => s.status === "pending" || s.status === "rejected");
}
