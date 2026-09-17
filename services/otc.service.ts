import { supabase } from "../lib/supabase";
export { uploadProof as uploadOtcProof } from "./funding.service";

/**
 * Mesa OTC (compra/venta de USDT contra saldo fiat), manual con aprobación
 * del backoffice. El saldo se mueve SOLO en los RPC server-side (migración
 * 00039); acá se invoca y se lee lo propio (RLS). Tablas nuevas aún no están
 * en los tipos generados → cast.
 */

export interface OtcConfig {
  asset_code: string;
  label: string;
  unit_rate: number;
  commission_percent: number;
  company_wallet: string | null;
  network: string | null;
  min_amount: number;
  max_amount: number | null;
  is_active: boolean;
}

export type OtcSide = "buy" | "sell";
export type OtcStatus = "pending" | "completed" | "rejected";

export interface OtcOrder {
  id: string;
  side: OtcSide;
  asset_code: string;
  amount_crypto: number;
  unit_rate: number;
  commission_percent: number;
  commission_amount: number;
  fiat_amount: number;
  counterparty_wallet: string | null;
  status: OtcStatus;
  proof_path: string | null;
  user_comment: string | null;
  admin_comment: string | null;
  transaction_id: string | null;
  created_at: string;
  resolved_at: string | null;
  reference: string | null;
  tx_hash: string | null;
}

/** Config vigente (USDT). Devuelve null si la mesa no está disponible. */
export async function getOtcConfig(): Promise<OtcConfig | null> {
  const { data, error } = await (supabase as any)
    .from("otc_config")
    .select("*")
    .eq("asset_code", "USDT")
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return (data as OtcConfig) ?? null;
}

/** Catálogo de criptos activas (configurables desde el admin). */
export async function getOtcAssets(): Promise<OtcConfig[]> {
  const { data, error } = await (supabase as any)
    .from("otc_config")
    .select("*")
    .eq("is_active", true)
    .order("asset_code", { ascending: true });
  if (error) throw error;
  return (data ?? []) as OtcConfig[];
}

/**
 * Cálculo de la cotización (fuente de verdad final = servidor). Se usa para
 * el preview y para derivar la cantidad de cripto cuando el usuario escribe
 * el monto en fiat.
 */
export function quoteBuy(cfg: OtcConfig, amountCrypto: number) {
  const base = amountCrypto * cfg.unit_rate;
  const commission = base * (cfg.commission_percent / 100);
  return { base, commission, total: base + commission };
}
export function quoteSell(cfg: OtcConfig, amountCrypto: number) {
  const base = amountCrypto * cfg.unit_rate;
  const commission = base * (cfg.commission_percent / 100);
  return { base, commission, net: base - commission };
}
/** Dado un monto en FIAT, deriva la cantidad de cripto (según lado). */
export function cryptoFromFiat(cfg: OtcConfig, fiat: number, side: OtcSide): number {
  const factor = side === "buy"
    ? cfg.unit_rate * (1 + cfg.commission_percent / 100)
    : cfg.unit_rate * (1 - cfg.commission_percent / 100);
  if (factor <= 0) return 0;
  return fiat / factor;
}

export async function createOtcBuy(params: {
  amountCrypto: number;
  wallet: string;
  assetCode?: string;
  comment?: string | null;
}): Promise<string> {
  const { data, error } = await (supabase.rpc as any)("create_otc_buy", {
    p_amount_crypto: params.amountCrypto,
    p_wallet: params.wallet,
    p_asset_code: params.assetCode ?? "USDT",
    p_comment: params.comment ?? null,
  });
  if (error) throw error;
  return data as string;
}

export async function createOtcSell(params: {
  amountCrypto: number;
  proofUrl: string;
  assetCode?: string;
  comment?: string | null;
}): Promise<string> {
  const { data, error } = await (supabase.rpc as any)("create_otc_sell", {
    p_amount_crypto: params.amountCrypto,
    p_proof_path: params.proofUrl,
    p_asset_code: params.assetCode ?? "USDT",
    p_comment: params.comment ?? null,
  });
  if (error) throw error;
  return data as string;
}

/** Órdenes OTC del usuario, más nuevas primero. */
export async function getMyOtcOrders(): Promise<OtcOrder[]> {
  const { data, error } = await (supabase as any)
    .from("otc_orders")
    .select("id, reference, side, asset_code, amount_crypto, unit_rate, commission_percent, commission_amount, fiat_amount, counterparty_wallet, status, proof_path, user_comment, admin_comment, transaction_id, tx_hash, created_at, resolved_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as OtcOrder[];
}
