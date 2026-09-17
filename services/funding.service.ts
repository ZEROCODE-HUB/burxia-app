import { supabase } from "../lib/supabase";

/**
 * Depósitos y retiros (solicitudes con aprobación del backoffice).
 * Todo el movimiento de saldo vive en RPCs server-side (migración 00036);
 * acá solo se los invoca y se leen las solicitudes propias (RLS).
 */

export interface PaymentMethod {
  id: string;
  label: string;
  image_path: string | null;
  bank_name: string | null;
  holder_name: string | null;
  account_number: string | null;
  alias: string | null;
  llave_breb: string | null;
  instructions: string | null;
  is_active: boolean;
  sort_order: number;
}

export type FundingKind = "deposit" | "withdrawal";
export type FundingStatus = "pending" | "approved" | "rejected";

export interface FundingRequest {
  id: string;
  kind: FundingKind;
  amount: number;
  status: FundingStatus;
  payment_method_id: string | null;
  destination: Record<string, any> | null;
  proof_path: string | null;
  user_comment: string | null;
  admin_comment: string | null;
  transaction_id: string | null;
  created_at: string;
  resolved_at: string | null;
}

/** Métodos de pago activos configurados por el admin (para depositar). */
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  // Tablas nuevas (migración 00036) aún no están en los tipos generados → cast.
  const { data, error } = await (supabase as any)
    .from("payment_methods")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PaymentMethod[];
}

/**
 * Sube un comprobante (imagen) al bucket 'images' y devuelve su URL pública.
 * Mismo patrón que el avatar del perfil (funciona en web e iOS/Android).
 */
export async function uploadProof(uri: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuario no autenticado.");

  const response = await fetch(uri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const fileName = `comprobantes/${user.id}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from("images")
    .upload(fileName, arrayBuffer, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(fileName);
  return publicUrl;
}

/** Crea una solicitud de depósito (queda pendiente de aprobación). */
export async function createDepositRequest(params: {
  amount: number;
  paymentMethodId?: string | null;
  proofUrl?: string | null;
  comment?: string | null;
}): Promise<string> {
  const { data, error } = await (supabase.rpc as any)("create_deposit_request", {
    p_amount: params.amount,
    p_payment_method_id: params.paymentMethodId ?? null,
    p_proof_path: params.proofUrl ?? null,
    p_comment: params.comment ?? null,
  });
  if (error) throw error;
  return data as string;
}

/**
 * Crea una solicitud de retiro. El saldo se retiene de inmediato (server-side);
 * si el admin rechaza, se devuelve.
 */
export async function createWithdrawalRequest(params: {
  amount: number;
  destination: Record<string, any>;
  comment?: string | null;
}): Promise<string> {
  const { data, error } = await (supabase.rpc as any)("create_withdrawal_request", {
    p_amount: params.amount,
    p_destination: params.destination,
    p_comment: params.comment ?? null,
  });
  if (error) throw error;
  return data as string;
}

/** Solicitudes del usuario (depósitos y retiros), más nuevas primero. */
export async function getMyRequests(): Promise<FundingRequest[]> {
  const { data, error } = await (supabase as any)
    .from("funding_requests")
    .select("id, kind, amount, status, payment_method_id, destination, proof_path, user_comment, admin_comment, transaction_id, created_at, resolved_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FundingRequest[];
}
