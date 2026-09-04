import { supabase } from "../lib/supabase";
import bcrypt from "bcryptjs";
import * as Crypto from "expo-crypto";

// Polyfill for random bytes in React Native for bcryptjs
bcrypt.setRandomFallback((len) => {
  const randomBytes = Crypto.getRandomBytes(len);
  return Array.from(randomBytes);
});

import { sendOtpEmail } from "./email.service";
import {
  generateCBU,
  generateCVU,
  generateAlias,
  getEndOfMonth,
} from "../utils/generators";
import { User } from "../types/database.types";
import * as secureStorage from "../lib/secureStorage";
import * as Device from "expo-device";
import { Platform } from "react-native";

export interface LoginCredentials {
  email: string;
  pin: string;
}

export interface RegisterData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  dni: string;
  cuit: string;
  pin: string;
  zapsign_doc_token?: string;
  zapsign_contract_url?: string;
  zapsign_data?: any;
}

// Global state for manual OTP (Resend flow)
let tempOtp: { code: string; email: string; expires: number } | null = null;

export interface AuthResult {
  success: boolean;
  error?: string;
  userId?: string;
  requireDeviceVerification?: boolean;
}
// Cuenta de prueba de Play Store — siempre bypassa verificación de dispositivo
const TEST_ACCOUNT_EMAIL = 'oscarmijaelpg@gmail.com';
/**
 * Login con email + PIN
 */
/**
 * Obtiene o crea un ID único de dispositivo almacenado localmente.
 */
export async function getLocalDeviceId(): Promise<string> {
  const DEVICE_ID_KEY = "TECNOMIND_DEVICE_ID";
  try {
    let deviceId = await secureStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      await secureStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error("Error getting/setting device ID:", error);
    return "UNKNOWN_DEVICE";
  }
}

/**
 * Indica si el dispositivo actual es conocido para el usuario.
 * La cuenta de prueba de Play Store siempre retorna true (bypass).
 */
export async function isDeviceKnown(userId: string, email: string): Promise<boolean> {
  if (email.toLowerCase().trim() === TEST_ACCOUNT_EMAIL) {
    return true;
  }

  const deviceId = await getLocalDeviceId();

  try {
    const { data, error } = await supabase
      .from("user_devices")
      .select("id")
      .eq("user_id", userId)
      .eq("device_id", deviceId)
      .eq("status", "active")
      .limit(1);

    if (error || !data || data.length === 0) {
      if (error) console.error("isDeviceKnown error:", error);
      return false; // Not found or error
    }
    
    // Update last_active_at implicitly when checked
    await (supabase.from("user_devices") as any).update({ last_active_at: new Date().toISOString() }).eq("id", (data as any)[0].id);

    return true;
  } catch (err) {
    console.error("Error verifying known device:", err);
    return false;
  }
}

/**
 * Registra el dispositivo actual como confiable tras éxito de OTP.
 */
export async function registerCurrentDevice(): Promise<AuthResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Usuario no autenticado." };

    const deviceId = await getLocalDeviceId();
    
    // Check if it exists but revoked
    const { data: existing } = await supabase
      .from("user_devices")
      .select("id")
      .eq("user_id", user.id)
      .eq("device_id", deviceId)
      .limit(1);

    if (existing && existing.length > 0) {
      const { error } = await (supabase.from("user_devices") as any).update({ 
        status: "active", 
        revoked_at: null,
        last_active_at: new Date().toISOString() 
      }).eq("id", (existing as any)[0].id);
      
      if (error) throw error;
      return { success: true };
    }

    // Insert new
    const { error: insertError } = await supabase.from("user_devices").insert({
      user_id: user.id,
      device_id: deviceId,
      device_name: Device.deviceName || 'Dispositivo desconocido',
      device_model: Device.modelName || 'Modelo desconocido',
      platform: Platform.OS as 'ios' | 'android' | 'web',
      os_version: Device.osVersion || null,
      app_version: null, // we can inject APP_VERSION easily if needed but not strictly necessary for backend
      status: "active",
      is_primary: false,
      biometric_enabled: false,
      last_active_at: new Date().toISOString(),
    } as any);

    if (insertError) throw insertError;
    return { success: true };
  } catch (error: any) {
    console.error("Error registering device:", error);
    return { success: false, error: "No se pudo registrar el dispositivo." };
  }
}

export async function loginWithPin(
  email: string,
  pin: string,
): Promise<AuthResult> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Modelo Bruxia (migración 00021): el PIN ES la contraseña de
    // Supabase Auth. No hay pin_hash ni auto-password cifrada que descifrar
    // en el cliente. El bloqueo por intentos lo lleva la base
    // (check_login_blocked / record_login_attempt), no AsyncStorage: un
    // contador local lo borra cualquiera reinstalando la app.

    const { data: bloqueoData } = await supabase.rpc("check_login_blocked", {
      p_email: normalizedEmail,
    } as any);
    const bloqueo = (bloqueoData as any)?.[0];
    if (bloqueo?.blocked) {
      const minutos = Math.ceil((bloqueo.retry_after_seconds ?? 0) / 60);
      return {
        success: false,
        error: `Demasiados intentos. Probá de nuevo en ${minutos} minuto${minutos === 1 ? "" : "s"}.`,
      };
    }

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: pin,
      });

    // Se registra el intento (la RPC no filtra si el usuario existe).
    await supabase.rpc("record_login_attempt", {
      p_email: normalizedEmail,
      p_success: !signInError,
      p_failure_reason: signInError?.message ?? null,
    } as any);

    if (signInError || !signInData.user) {
      // Mensaje deliberadamente ambiguo: "ese email no existe" permitiría
      // enumerar clientes.
      const restantes = (bloqueo?.attempts_left ?? 5) - 1;
      const aviso =
        restantes > 0 && restantes <= 2 ? ` Te quedan ${restantes} intentos.` : "";
      return { success: false, error: `Email o PIN incorrectos.${aviso}` };
    }

    const userId = signInData.user.id;

    // El estado de verificación no bloquea el ingreso: un usuario recién
    // registrado usa la app con funciones limitadas mientras el backoffice
    // resuelve su KYC. Solo se corta si la cuenta fue dada de baja.
    const { data: perfil } = await supabase
      .from("users")
      .select("verification_status")
      .eq("id", userId)
      .maybeSingle();
    const estado = (perfil as any)?.verification_status;
    if (estado === "suspended" || estado === "rejected") {
      await supabase.auth.signOut();
      return { success: false, error: "Esta cuenta se encuentra suspendida." };
    }

    // Verificación de dispositivo (la cuenta de prueba la bypassa).
    const deviceKnown = await isDeviceKnown(userId, normalizedEmail);
    if (!deviceKnown) {
      await sendVerificationOtp();
      return { success: true, userId, requireDeviceVerification: true };
    }

    return { success: true, userId, requireDeviceVerification: false };
  } catch (error: any) {
    return { success: false, error: error.message || "Error desconocido" };
  }
}

/**
 * Suspender cuenta de usuario
 */
export async function suspendUserAccount(userId: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.rpc("suspend_user_account", {
      p_user_id: userId,
    } as any);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("[AUTH] Error suspending account:", error);
    return { success: false, error: "No se pudo suspender la cuenta" };
  }
}

/**
 * Registro de usuario
 */
export async function registerUser(data: RegisterData): Promise<AuthResult> {
  try {
    const normalizedEmail = data.email.toLowerCase().trim();
    const cleanDni = data.dni.replace(/\D/g, "");
    const cleanCuit = data.cuit.replace(/\D/g, "");
    const cleanPhone = data.telefono.trim();

    // Chequeo previo con can_register(): responde si el email, el documento
    // o el CUIT ya existen SIN decir cuál, para no permitir enumerarlos.
    const { data: disponible, error: errorChequeo } = await supabase.rpc(
      "can_register",
      {
        p_email: normalizedEmail,
        p_document_number: cleanDni,
        p_tax_id: cleanCuit,
      } as any,
    );
    if (errorChequeo) {
      return { success: false, error: "No se pudo validar los datos. Intentá de nuevo." };
    }
    if (!disponible) {
      return {
        success: false,
        error: "Ya existe una cuenta con esos datos. Si es tuya, iniciá sesión.",
      };
    }

    // Modelo Bruxia: el PIN es la contraseña de Supabase Auth. No se
    // genera una auto-password, no se guarda pin_hash ni se escribe en
    // user_auth_credentials. El trigger on_auth_user_created lee esta
    // metadata y crea el perfil, la cuenta, los límites y el QR.
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: data.pin,
      options: {
        data: {
          nombres: data.nombres.trim(),
          apellidos: data.apellidos.trim(),
          telefono: cleanPhone,
          dni: cleanDni,
          cuit: cleanCuit,
          tipo_documento: "DNI",
          pais: "AR",
          // Si el KYC de ZapSign ya corrió, se pasa para que el trigger lo
          // registre en kyc_verifications.
          zapsign_verification_id: data.zapsign_doc_token || null,
          zapsign_contract_url: data.zapsign_contract_url || null,
          zapsign_data: data.zapsign_data || null,
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { success: false, error: "Ya existe una cuenta con ese email." };
      }
      if (authError.message.includes("Password")) {
        return { success: false, error: "El PIN no cumple los requisitos mínimos." };
      }
      const anyErr = authError as any;
      const code = anyErr?.code ? ` [${anyErr.code}]` : "";
      console.error("[AUTH] signUp error:", anyErr);
      return { success: false, error: `${authError.message}${code}` };
    }

    if (!authData.user) {
      return { success: false, error: "Error al crear usuario" };
    }

    // El trigger corre dentro de la transacción del signup, así que al
    // volver acá el perfil y la cuenta ya existen. No hace falta poll.
    return { success: true, userId: authData.user.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Error desconocido" };
  }
}

/**
 * Crear cuenta por defecto para un usuario
 */
async function createDefaultAccount(userId: string): Promise<AuthResult> {
  try {
    // 1. Obtener account_type_id donde code = 'savings_ars'
    let accountTypeId: string | null = null;

    const { data: accountType, error: typeError } = await supabase
      .from("account_types")
      .select("id")
      .eq("code", "savings_ars")
      .single();

    if (!typeError && accountType) {
      accountTypeId = (accountType as any).id;
    } else {
      // Si no existe, intentar con cualquier tipo activo
      const { data: anyType, error: anyError } = await supabase
        .from("account_types")
        .select("id")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (anyError || !anyType) {
        return { success: false, error: "No hay tipos de cuenta disponibles" };
      }
      accountTypeId = (anyType as any).id;
    }

    if (!accountTypeId) {
      return { success: false, error: "No se pudo determinar tipo de cuenta" };
    }

    // 2. Generar CBU, CVU y alias
    const cbu = generateCBU();
    const cvu = generateCVU();
    const alias = generateAlias(cvu);

    // 3. Insertar cuenta
    const accountInsert = {
      user_id: userId,
      account_type_id: accountTypeId,
      cbu,
      cvu,
      alias,
      balance: 0,
      status: "active" as const,
      is_primary: true,
    };

    const { data: account, error: accountError } = await supabase
      .from("accounts")
      .insert(accountInsert as any)
      .select("id")
      .single();

    if (accountError || !account) {
      return { success: false, error: "Error al crear cuenta" };
    }

    const accountId = (account as any).id;

    // 4. Insertar límites de cuenta
    const now = new Date();
    const endOfMonth = getEndOfMonth();

    const limitsInsert = {
      account_id: accountId,
      monthly_limit: 800000.0,
      monthly_spent: 0,
      current_period_start: now.toISOString(),
      current_period_end: endOfMonth.toISOString(),
      daily_limit: null,
      daily_spent: 0,
      per_transaction_limit: null,
    };

    const { error: limitsError } = await supabase
      .from("account_limits")
      .insert(limitsInsert as any);

    if (limitsError) {
      // No es crítico
    } else {
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Verify PIN for sensitive actions using bcrypt.
 * Fetches the stored pin_hash from the DB and compares with bcrypt.
 */
export async function verifyPin(pin: string): Promise<boolean> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return false;

    // El PIN es la contraseña de Supabase Auth, así que verificarlo es
    // re-autenticar. El usuario ya está logueado con esta misma cuenta, de
    // modo que si el PIN es correcto la sesión simplemente se refresca; si
    // es incorrecto, falla sin afectar la sesión vigente.
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: pin,
    });

    return !error;
  } catch (error) {
    console.error("[AUTH] Error verifying PIN:", error);
    return false;
  }
}

/**
 * Send OTP using Resend instead of Supabase
 */
export async function sendVerificationOtp(): Promise<AuthResult> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !user.email)
      return { success: false, error: "Usuario no autenticado" };

    // 1. Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Guardar temporalmente para verificación (10 minutos exp)
    tempOtp = {
      code,
      email: user.email,
      expires: Date.now() + 10 * 60 * 1000,
    };

    // 3. Enviar notificación (se encargará el worker de Supabase)
    const res = await sendOtpEmail(user.id, code);

    if (!res.success) throw new Error(res.error);

    return { success: true };
  } catch (error: any) {
    console.error("[AUTH] Error al solicitar OTP:", error);
    return {
      success: false,
      error: error.message || "Error al enviar el código de verificación",
    };
  }
}

/**
 * Verify the manual OTP code
 */
export async function verifyVerificationOtp(
  token: string,
): Promise<AuthResult> {
  try {
    if (!tempOtp) {
      return { success: false, error: "No hay un código pendiente" };
    }

    if (Date.now() > tempOtp.expires) {
      tempOtp = null;
      return { success: false, error: "El código ha expirado" };
    }

    if (tempOtp.code !== token) {
      return { success: false, error: "Código incorrecto" };
    }

    // Código válido, limpiar
    tempOtp = null;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Error al verificar el código" };
  }
}

/**
 * Update user PIN after security verification (PIN + OTP)
 */
export async function updatePin(newPin: string): Promise<AuthResult> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Usuario no autenticado" };

    // El PIN es la contraseña de Supabase Auth: cambiarlo es cambiar la
    // contraseña. No se toca users.pin_hash (sin uso en el modelo actual).
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPin,
    });

    if (updateError) {
      if (updateError.message.includes("Password")) {
        return { success: false, error: "El PIN no cumple los requisitos mínimos." };
      }
      console.error("[AUTH] Error updating PIN:", updateError);
      return { success: false, error: "Error al actualizar el PIN" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[AUTH] updatePin unexpected error:", error);
    return { success: false, error: error.message || "Error desconocido" };
  }
}

/**
 * Get user devices
 */
export async function getUserDevices() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated user");

  const { data, error } = await supabase
    .from("user_devices")
    .select("*")
    .eq("user_id", user.id)
    .order("last_active_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Logout
 */
export async function logout(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  if (error) {
  }
  return { success: !error, error: error?.message };
}

/**
 * Revocar un dispositivo
 */
export async function revokeDevice(deviceId: string): Promise<AuthResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Usuario no autenticado." };

    const { error } = await (supabase.from("user_devices") as any).update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoke_reason: "User revoked manually"
    }).eq("id", deviceId).eq("user_id", user.id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error revoking device:", err);
    return { success: false, error: "No se pudo desvincular el dispositivo." };
  }
}

/**
 * Obtener sesión actual
 */
export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  return { session, error: error?.message };
}

/**
 * Obtener usuario actual de la base de datos
 */
export async function getCurrentUser(userId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  return { user: data as unknown as User | null, error: error?.message };
}

/**
 * Actualiza la configuración de Acceso Web
 */
export async function updateWebAccess(userId: string, enabled: boolean, password?: string): Promise<{ success: boolean; error?: string }> {
    try {
        const updates: any = {
            web_access_enabled: enabled,
            updated_at: new Date().toISOString(),
        };

        if (enabled && password) {
             const salt = await bcrypt.genSalt(10);
             const hash = await bcrypt.hash(password, salt);
             updates.web_password_hash = hash;
             updates.web_access_enabled_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error('Error updating web access:', error);
        return { success: false, error: error.message };
    }
}
