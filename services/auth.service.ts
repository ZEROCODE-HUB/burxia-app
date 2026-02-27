import { supabase } from "../lib/supabase";
import bcrypt from "bcryptjs";
import * as Crypto from "expo-crypto";

// Polyfill for random bytes in React Native for bcryptjs
bcrypt.setRandomFallback((len) => {
  const randomBytes = Crypto.getRandomBytes(len);
  return Array.from(randomBytes);
});

import { encrypt, decrypt, generateSecurePassword } from "../utils/crypto";
import { sendOtpEmail } from "./email.service";
import {
  generateCBU,
  generateCVU,
  generateAlias,
  getEndOfMonth,
} from "../utils/generators";
import { incrementPinAttempts, resetPinAttempts } from "./storage.service";
import {
  User,
  Account,
  UserAuthCredential,
  VerificationStatus,
} from "../types/database.types";

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
}

// Global state for manual OTP (Resend flow)
let tempOtp: { code: string; email: string; expires: number } | null = null;

export interface AuthResult {
  success: boolean;
  error?: string;
  userId?: string;
}
// Tipo para el resultado del RPC get_user_login_data
export interface LoginUserData {
  id: string;
  email: string;
  pin_hash: string;
  verification_status: VerificationStatus;
  auto_password_encrypted: string | null;
}
/**
 * Login con email + PIN
 */
// Cuenta de prueba de Play Store — siempre bypassa verificación de dispositivo
const TEST_ACCOUNT_EMAIL = 'oscarmijaelpg@gmail.com';

/**
 * Indica si el dispositivo actual es conocido para el usuario.
 * La cuenta de prueba de Play Store siempre retorna true (bypass).
 */
export async function isDeviceKnown(userId: string, email: string): Promise<boolean> {
  // Bypass para cuenta de prueba de Play Store
  if (email.toLowerCase().trim() === TEST_ACCOUNT_EMAIL) {
    return true;
  }

  // TODO: implementar verificación real cuando se agregue la pantalla de OTP de dispositivo
  // Por ahora retorna true para todos los usuarios
  return true;
}

export async function loginWithPin(
  email: string,
  pin: string,
): Promise<AuthResult> {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Usar RPC para buscar datos saltando RLS
    const { data: userData, error: userError } = await supabase.rpc(
      "get_user_login_data",
      { email_input: normalizedEmail } as any,
    );

    if (userError) {
      return { success: false, error: "Error de conexión" };
    }

    // RPC retorna un array, tomamos el primero y lo tipamos
    const user = userData?.[0] as LoginUserData | undefined;
    if (!user) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // 2. Verificar PIN con bcrypt
    if (!user.pin_hash) {
      return { success: false, error: "Datos de seguridad corruptos" };
    }

    const pinValid = await bcrypt.compare(pin, user.pin_hash);
    if (!pinValid) {
      const attempts = await incrementPinAttempts(normalizedEmail);
      if (attempts >= 3) {
        await suspendUserAccount(user.id);
        return {
          success: false,
          error: "Has excedido el número de intentos. Cuenta suspendida.",
        };
      }
      return {
        success: false,
        error: `PIN incorrecto. Intentos restantes: ${3 - attempts}`,
      };
    }

    // PIN correcto, resetear intentos
    await resetPinAttempts(normalizedEmail);

    // 3. Verificar status
    if (user.verification_status === "suspended") {
      return { success: false, error: "Esta cuenta se encuentra suspendida." };
    }

    if (user.verification_status !== "verified") {
      return { success: false, error: "Cuenta pendiente de verificación" };
    }

    // 4. Verificar dispositivo (la cuenta de prueba siempre lo bypassa)
    const deviceKnown = await isDeviceKnown(user.id, normalizedEmail);
    if (!deviceKnown) {
      // Cuando se implemente la pantalla de OTP de dispositivo,
      // aquí se retornaría un código especial para mostrarla.
      // Por ahora este branch nunca se ejecuta.
      return { success: false, error: 'Dispositivo no reconocido. Se requiere verificación.' };
    }

    // 5. Desencriptar la contraseña
    if (!user.auto_password_encrypted) {
      return { success: false, error: "Error interno: Credenciales inválidas" };
    }

    const autoPassword = await decrypt(user.auto_password_encrypted);

    // 6. Hacer login con Supabase Auth
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: autoPassword,
    });

    if (signInError) {
      return { success: false, error: "Error al iniciar sesión" };
    }

    return { success: true, userId: user.id };
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

    // 1. Hash del PIN first

    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(data.pin, salt);

    // 2. Prepare metadata and Create user via signUp

    const cleanDni = data.dni.replace(/\D/g, "");
    const cleanCuit = data.cuit.replace(/\D/g, "");
    const cleanPhone = data.telefono.trim();

    // Generamos password seguro para el auth.users
    const autoPassword = await generateSecurePassword(32);

    const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: autoPassword,
    options: {
        data: {
            nombres: data.nombres.trim(),
            apellidos: data.apellidos.trim(),
            telefono: cleanPhone,
            dni: cleanDni,
            cuit: cleanCuit,
            pin_hash: pinHash,
            zapsign_doc_token: data.zapsign_doc_token || null,
            // ✅ Estos keys matchean con lo que el trigger busca:
            zapsign_verification_id: data.zapsign_doc_token || null,
            zapsign_contract_url: data.zapsign_contract_url || null,
        },
    },
});

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: "Error al crear usuario" };
    }

    const userId = authData.user.id;

    // 3. (REMOVED) Manual insert into public.users is handled by DB Trigger

    // 4. Guardar password encriptado par login automático
    if (authData.session) {
      const encryptedPassword = await encrypt(autoPassword);

      const { error: credError } = await supabase
        .from("user_auth_credentials")
        .insert({
          user_id: userId,
          auto_password_encrypted: encryptedPassword,
        } as any);

      if (credError) {
      }
    }

    // 5. Esperar a que el trigger cree la cuenta y obtener info

    // Reintentos para dar tiempo al trigger
    let accountInfo = null;
    for (let i = 0; i < 5; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const { data } = await supabase.rpc("get_account_info", {
        p_user_id: userId,
      } as any);
      if (data && (data as any).length > 0) {
        accountInfo = data[0];
        break;
      }
    }

    return {
      success: true,
      userId,
    };
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
    if (!user) return false;

    const { data, error } = await (supabase.from('users') as any)
      .select('pin_hash')
      .eq('id', user.id)
      .single();

    if (error || !data?.pin_hash) {
      console.error('[AUTH] Error fetching pin_hash:', error);
      return false;
    }

    return await bcrypt.compare(pin, data.pin_hash);
  } catch (error) {
    console.error('[AUTH] Error verifying PIN:', error);
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

    // 1. Hash new PIN
    const salt = await bcrypt.genSalt(10);
    const newPinHash = await bcrypt.hash(newPin, salt);

    // 2. Update in DB
    const { error: updateError } = await (supabase.from("users") as any)
      .update({ pin_hash: newPinHash })
      .eq("id", user.id);

    if (updateError) {
      console.error("[AUTH] Error updating pin_hash in DB:", updateError);
      return { success: false, error: "Error al actualizar el PIN" };
    }

    // 3. Update Auth Metadata
    await supabase.auth.updateUser({
      data: { pin_hash: newPinHash },
    });

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
