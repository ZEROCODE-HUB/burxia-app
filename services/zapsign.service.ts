import { supabase } from "../lib/supabase";
import { isProductionEnv } from "../config/environment";

/**
 * Cliente de ZapSign (KYC).
 *
 * Antes este servicio llamaba a la API de ZapSign directamente, con la API
 * key incrustada en el binario (EXPO_PUBLIC_ZAPSIGN_API_KEY). Cualquiera que
 * abriera el APK la extraía. Ahora todas las llamadas pasan por la Edge
 * Function `zapsign-proxy`, que guarda la key en el servidor; la app nunca
 * la ve.
 *
 * Se usa SIEMPRE el proxy real (Edge Function `zapsign-proxy`). El entorno
 * (sandbox de prueba vs producción) lo decide el servidor por `ZAPSIGN_BASE_URL`
 * — hoy apunta al SANDBOX, así que el flujo es real pero de PRUEBA. El mock
 * quedó desactivado (antes tapaba el link real con `mock-zapsign.local`).
 */

const ZAPSIGN_MOCK = false;

export interface ZapSignDocument {
  token: string;
  status: string;
  signed_file?: string | null;
  signers?: Array<{
    token?: string;
    sign_url?: string;
  }>;
}

export interface CreateDocumentResult {
  success: boolean;
  signUrl?: string;
  docToken?: string;
  error?: string;
}

export interface GetSignedUrlResult {
  success: boolean;
  signedFileUrl?: string | null;
  status?: string;
  error?: string;
}

export interface GetSignerUrlResult {
  success: boolean;
  signUrl?: string;
  error?: string;
}

/**
 * Invoca la Edge Function zapsign-proxy. El Bearer de ZapSign vive en el
 * servidor; acá solo viaja el JWT del usuario, que Supabase adjunta solo.
 */
async function invokeProxy<T>(
  action: string,
  params: Record<string, unknown>,
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const { data, error } = await supabase.functions.invoke("zapsign-proxy", {
    body: { action, ...params },
  });

  if (error) {
    // FunctionsHttpError trae el cuerpo en context; se intenta leer el
    // mensaje que devolvió la función o ZapSign.
    let detalle = error.message;
    try {
      const cuerpo = await (error as any).context?.json?.();
      detalle = cuerpo?.error || cuerpo?.detail || detalle;
    } catch {
      /* se deja el mensaje genérico */
    }
    return { ok: false, error: detalle };
  }
  return { ok: true, data: data as T };
}

export async function createZapSignDocument(
  userName: string,
  userEmail: string,
): Promise<CreateDocumentResult> {
  const name = (userName || "").trim();
  const email = (userEmail || "").trim().toLowerCase();

  if (ZAPSIGN_MOCK) {
    return {
      success: true,
      signUrl: "https://mock-zapsign.local/mock-sign",
      docToken: "mock-doc-token-" + Date.now(),
    };
  }

  const r = await invokeProxy<ZapSignDocument>("create-doc", { name, email });
  if (!r.ok) return { success: false, error: r.error };

  const signer = r.data.signers?.[0];
  const signUrl = signer?.sign_url || `https://app.zapsign.com.br/verificar/${signer?.token}`;
  return { success: true, signUrl, docToken: r.data.token };
}

export async function getSignerUrl(docToken: string): Promise<GetSignerUrlResult> {
  if (ZAPSIGN_MOCK || docToken.startsWith("mock-")) {
    return { success: true, signUrl: "https://mock-zapsign.local/mock-sign" };
  }

  const r = await invokeProxy<ZapSignDocument>("get-doc", { docToken });
  if (!r.ok) return { success: false, error: r.error };

  const signer = r.data.signers?.[0];
  const signUrl =
    signer?.sign_url || (signer?.token ? `https://app.zapsign.com.br/verificar/${signer.token}` : undefined);
  if (!signUrl) return { success: false, error: "No se pudo obtener sign_url del documento" };
  return { success: true, signUrl };
}

export async function getSignedDocumentUrl(docToken: string): Promise<GetSignedUrlResult> {
  if (ZAPSIGN_MOCK || docToken.startsWith("mock-doc-token-")) {
    return {
      success: true,
      signedFileUrl: "https://mock-zapsign.local/mock-signed-document.pdf",
      status: "signed",
    };
  }

  const r = await invokeProxy<ZapSignDocument>("get-doc", { docToken });
  if (!r.ok) return { success: false, error: r.error };
  return { success: true, signedFileUrl: r.data.signed_file || null, status: r.data.status };
}

export async function getSignedDocumentUrlWithRetry(
  docToken: string,
  maxRetries = 3,
  delayMs = 2000,
): Promise<string | null> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await getSignedDocumentUrl(docToken);
    if (result.success && result.signedFileUrl) return result.signedFileUrl;
    if (i < maxRetries - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Verificación biométrica del firmante                                */
/* ------------------------------------------------------------------ */

export interface ZapSignValidationItem {
  type: string;
  status: string;
  reason?: string;
  created_at?: string;
  document_ocr?: {
    name?: string;
    last_name?: string;
    document_type?: string;
    document_number?: string;
    date_of_birth?: string;
    document_country?: string;
  } | null;
}

export interface GetSignerValidationResult {
  success: boolean;
  validations?: ZapSignValidationItem[];
  selfieValidationType?: string | null;
  error?: string;
}

export interface ZapSignBiometric {
  selfieValidationType?: string | null;
  valid: boolean;
  validations?: ZapSignValidationItem[];
  extractedName?: string;
  documentNumber?: string;
  reason?: string;
}

export interface ZapSignIdentityResult {
  signed: boolean;
  verified: boolean;
  strict: boolean;
  signedFileUrl?: string | null;
  biometric?: ZapSignBiometric;
  error?: string;
}

function mockValidationResult(): GetSignerValidationResult {
  return {
    success: true,
    selfieValidationType: "mock",
    validations: [
      { type: "Identity verification", status: "success" },
      { type: "Name validation", status: "success" },
    ],
  };
}

async function getDocumentDetail(docToken: string): Promise<{
  success: boolean;
  status?: string;
  signedFile?: string | null;
  signerToken?: string | null;
  error?: string;
}> {
  if (ZAPSIGN_MOCK || docToken.startsWith("mock-")) {
    return { success: true, status: "assinado", signedFile: "mock", signerToken: "mock-signer-" + docToken };
  }

  const r = await invokeProxy<ZapSignDocument>("get-doc", { docToken });
  if (!r.ok) return { success: false, error: r.error };
  return {
    success: true,
    status: r.data.status,
    signedFile: r.data.signed_file,
    signerToken: r.data.signers?.[0]?.token || null,
  };
}

export async function getSignerValidation(signerToken: string): Promise<GetSignerValidationResult> {
  if (ZAPSIGN_MOCK || signerToken.startsWith("mock-")) {
    return mockValidationResult();
  }

  const r = await invokeProxy<{
    validations?: ZapSignValidationItem[];
    selfie_validation_type?: string | null;
  }>("get-signer-validation", { signerToken });
  if (!r.ok) return { success: false, error: r.error };
  return {
    success: true,
    validations: r.data.validations || [],
    selfieValidationType: r.data.selfie_validation_type || null,
  };
}

/**
 * Verifica la identidad del usuario tras la firma del contrato. En modo no
 * estricto (sandbox/test) alcanza con el contrato firmado; en estricto
 * (producción con matching biométrico) exige que todas las validaciones
 * hayan pasado.
 */
export async function verifyZapSignIdentity(
  docToken: string,
  strict: boolean = isProductionEnv,
): Promise<ZapSignIdentityResult> {
  const detail = await getDocumentDetail(docToken);
  if (!detail.success) {
    return { signed: false, verified: false, strict, error: detail.error };
  }

  const signed = detail.status === "assinado" || !!detail.signedFile;
  if (!signed) {
    return { signed: false, verified: false, strict, error: "Documento aún no firmado" };
  }

  const validation = await getSignerValidation(detail.signerToken || "");
  const validations = validation.success ? validation.validations || [] : [];
  const ocr = validations.find((v) => v.document_ocr)?.document_ocr;
  const biometric: ZapSignBiometric = {
    selfieValidationType: validation.success ? validation.selfieValidationType : null,
    valid: false,
    validations,
    extractedName: ocr ? `${ocr.name || ""} ${ocr.last_name || ""}`.trim() : undefined,
    documentNumber: ocr?.document_number,
  };

  if (!validation.success) {
    if (strict) {
      biometric.reason = "no_validation_data";
      return { signed: true, verified: false, strict, signedFileUrl: detail.signedFile, biometric };
    }
    biometric.reason = "validation_unavailable";
    return { signed: true, verified: true, strict, signedFileUrl: detail.signedFile, biometric };
  }

  const allPassed = validations.length > 0 && validations.every((v) => v.status === null || v.status === "success");
  biometric.valid = allPassed;

  if (strict && !allPassed) {
    biometric.reason = "biometric_failed";
    return { signed: true, verified: false, strict, signedFileUrl: detail.signedFile, biometric };
  }

  return { signed: true, verified: true, strict, signedFileUrl: detail.signedFile, biometric };
}
