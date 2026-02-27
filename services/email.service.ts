import { supabase } from "../lib/supabase";

export interface NotificationResponse {
  success: boolean;
  error?: string;
}

/**
 * Encola una notificación en Supabase para ser procesada por el worker de correo/push.
 * Utiliza el sistema de colas PGMQ y la Edge Function notification-worker.
 */
export async function sendOtpEmail(
  userId: string,
  otpCode: string,
): Promise<NotificationResponse> {
  try {
    // Llamada al RPC enqueue_notification definido en la base de datos
    // p_notification_type: 'transfer_otp' (el worker está configurado para manejar este código)
    // p_data: objeto con los datos para el template (se usará {{otp}} en el template_message/email_template_html)
    // Tipo 'transfer_otp' — usado para OTPs de transferencias
    const { error } = await supabase.rpc("enqueue_notification", {
      p_user_id: userId,
      p_notification_type: "transfer_otp",
      p_data: { 
        otp: otpCode,
        otp_code: otpCode 
      },
      p_related_transaction_id: null,
    } as any);

    if (error) {
      console.error("[NOTIFICATION] Error al encolar notificación:", error);
      return {
        success: false,
        error: "No se pudo solicitar el código de verificación",
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[NOTIFICATION] Error inesperado:", error);
    return {
      success: false,
      error: error.message || "Error al procesar la solicitud",
    };
  }
}

/**
 * Encola un OTP para cambio de PIN.
 * Usa el tipo 'pin_change_otp' con su propio template (sin placeholders de transferencias).
 */
export async function sendPinChangeOtpEmail(
  userId: string,
  otpCode: string,
): Promise<NotificationResponse> {
  try {
    const { error } = await supabase.rpc("enqueue_notification", {
      p_user_id: userId,
      p_notification_type: "pin_change_otp",
      p_data: { 
        otp: otpCode,
        otp_code: otpCode 
      },
      p_related_transaction_id: null,
    } as any);

    if (error) {
      console.error("[NOTIFICATION] Error al encolar OTP de cambio de PIN:", error);

      // FALLBACK: Si falla la cola (ej: 401 Unauthorized), intentar envío directo
      console.log("[NOTIFICATION] Intentando envío directo (fallback)...");
      
      // Necesitamos el email del usuario para el envío directo
      const { data: userData } = await supabase.from('users').select('email, first_name').eq('id', userId).single();
      
      if (userData?.email) {
        const { error: directError } = await supabase.functions.invoke('notification-worker', {
          body: {
            notification_type: "pin_change_otp",
            data: { 
              email: userData.email,
              first_name: userData.first_name || 'Usuario',
              otp: otpCode,
              otp_code: otpCode
            }
          }
        });

        if (!directError) {
          console.log("[NOTIFICATION] Envío directo exitoso");
          return { success: true };
        }
        console.error("[NOTIFICATION] Falló también el envío directo:", directError);
      }

      return {
        success: false,
        error: "No se pudo enviar el código de verificación",
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error("[NOTIFICATION] Error inesperado:", error);
    return {
      success: false,
      error: error.message || "Error al procesar la solicitud",
    };
  }
}

/**
 * Enviar OTP de verificación de email antes del registro.
 * Inserta un mensaje en la cola con notification_type='email_verification' y los datos del destinatario.
 * No requiere user_id: el worker usará data.email si no hay usuario.
 */
export async function sendPreSignupEmailVerification(
  email: string,
  firstName: string,
  otpCode: string,
): Promise<NotificationResponse> {
  try {
    const { error } = await supabase.rpc("enqueue_notification", {
      p_user_id: null,
      p_notification_type: "email_verification",
      p_data: { 
        email, 
        first_name: firstName, 
        otp: otpCode,
        otp_code: otpCode 
      },
      p_related_transaction_id: null,
    } as any);

    if (error) {
      console.error("[NOTIFICATION] Error al encolar email_verification:", error);
      return {
        success: false,
        error: "No se pudo encolar la verificación por correo",
      };
    }
    return { success: true };
  } catch (error: any) {
    console.error("[NOTIFICATION] Error inesperado en pre-signup:", error);
    return {
      success: false,
      error: error.message || "Error al procesar la solicitud",
    };
  }
}
