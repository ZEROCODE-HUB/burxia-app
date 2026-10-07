import { supabase } from '../lib/supabase';

const db = supabase as any;

// Registra la aceptación de los Términos y Condiciones del usuario actual.
// Va por RPC SECURITY DEFINER (accept_terms, migración 00067) porque el cliente
// no puede escribir estas columnas directamente: el rol authenticated solo tiene
// GRANT UPDATE sobre (first_name, last_name, phone, photo_url) desde 00018.
export async function acceptTerms(version: string): Promise<void> {
  const { error } = await db.rpc('accept_terms', { p_version: version });
  if (error) throw error;
}
