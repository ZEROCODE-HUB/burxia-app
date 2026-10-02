import { supabase } from '../lib/supabase';

// Servicio del Paso 2 del onboarding: verificación facial (ZapSign).
// La completitud real la marca el webhook de ZapSign (tabla kyc_completions);
// esta RPC la consulta (email_completo_kyc) y, si está confirmada, deja el
// facial_status del usuario en 'approved' (si no, 'submitted'). Cuando el
// formulario (KYB) y la facial están ambos aprobados, el backend enciende
// verification_status='verified' y activa la cuenta. Ver migración
// 00061_verificacion_dos_pasos.sql.

const db = supabase as any;

export type FacialStatus = 'none' | 'submitted' | 'approved' | 'rejected';

/**
 * Reporta al backend que el usuario completó la verificación facial.
 * Devuelve el nuevo facial_status ('approved' si el webhook ya la confirmó,
 * 'submitted' si todavía está pendiente de confirmación).
 */
export async function submitFacialVerification(): Promise<FacialStatus> {
  const { data, error } = await db.rpc('submit_facial_verification');
  if (error) throw error;
  return (data as FacialStatus) ?? 'submitted';
}
