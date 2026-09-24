import { supabase } from '../lib/supabase';

// Los tipos generados (database.types.ts) aún no incluyen las tablas/RPC KYB
// (migración 00057). Se accede vía un cliente sin tipar, igual que otras RPCs
// nuevas del proyecto. Regenerar los tipos luego devuelve el tipado.
const db = supabase as any;

// Servicio del formulario KYB (persona jurídica). Las respuestas van a
// public.kyb_submissions (jsonb answers) vía RPC submit_kyb; los documentos PDF
// al bucket PRIVADO 'kyb-docs' bajo <user_id>/<doc_type>.pdf + fila en
// public.kyb_documents. Ver migración 00057_kyb.sql.

export type KybStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface KybSubmission {
  user_id: string;
  status: KybStatus;
  answers: Record<string, any>;
  admin_notes: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
}

export interface KybDocRow {
  doc_type: string;
  storage_path: string;
  file_name: string | null;
  uploaded_at: string;
}

const KYB_BUCKET = 'kyb-docs';

/** Solicitud KYB del usuario actual (o null si nunca la abrió). */
export async function getMyKyb(): Promise<KybSubmission | null> {
  const { data, error } = await db
    .from('kyb_submissions')
    .select('user_id,status,answers,admin_notes,submitted_at,reviewed_at')
    .maybeSingle();
  if (error) throw error;
  return (data as KybSubmission) ?? null;
}

/** Documentos ya subidos por el usuario actual. */
export async function getMyKybDocs(): Promise<KybDocRow[]> {
  const { data, error } = await db
    .from('kyb_documents')
    .select('doc_type,storage_path,file_name,uploaded_at');
  if (error) throw error;
  return (data ?? []) as KybDocRow[];
}

/**
 * Sube (o reemplaza) el PDF de un tipo de documento al bucket privado y registra
 * la fila en kyb_documents. Funciona en web e iOS/Android (fetch del uri).
 */
export async function uploadKybDoc(docType: string, uri: string, fileName?: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario no autenticado.');

  const response = await fetch(uri);
  const blob = await response.blob();
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const path = `${user.id}/${docType}.pdf`;
  const { error: upErr } = await db.storage
    .from(KYB_BUCKET)
    .upload(path, arrayBuffer, { contentType: 'application/pdf', upsert: true });
  if (upErr) throw upErr;

  const { error: dbErr } = await db
    .from('kyb_documents')
    .upsert(
      { user_id: user.id, doc_type: docType, storage_path: path, file_name: fileName ?? null, uploaded_at: new Date().toISOString() },
      { onConflict: 'user_id,doc_type' },
    );
  if (dbErr) throw dbErr;
}

/** Envía el formulario (respuestas). Marca la solicitud como 'submitted'. */
export async function submitKyb(answers: Record<string, any>): Promise<void> {
  const { error } = await db.rpc('submit_kyb', { p_answers: answers } as any);
  if (error) throw error;
}
