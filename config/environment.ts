/**
 * Environment configuration for Magnate Financial Freedom
 * Controls test vs production behavior.
 *
 * Set EXPO_PUBLIC_APP_ENV=test for testing / Play Store review accounts.
 * Set EXPO_PUBLIC_APP_ENV=production for live production builds.
 *
 * Las variables se resuelven con getEnvVar(): process.env (inline de EAS) y luego
 * Constants.expoConfig.extra (valor embebido en app.config.js). Para QA, app.config.js
 * trae las credenciales de sandbox hardcodeadas en extra, así el build funciona sin
 * configurar EAS. NO usar esos valores en producción.
 */

import { getEnvVar } from '../utils/env';

const APP_ENV = (getEnvVar('EXPO_PUBLIC_APP_ENV') || 'test') as 'test' | 'production';

export const isTestEnv = APP_ENV === 'test';
export const isProductionEnv = APP_ENV === 'production';

/**
 * Mostrar el código OTP en pantalla durante el registro (solo QA). Separado de
 * `isTestEnv` a propósito: así se puede APAGAR la exposición del código sin
 * cambiar el resto del entorno de pruebas (ZapSign tolerante, etc.).
 * Default: OFF. Para reactivarlo en QA: EXPO_PUBLIC_SHOW_SANDBOX_OTP=true.
 */
export const showSandboxOtpOnScreen = getEnvVar('EXPO_PUBLIC_SHOW_SANDBOX_OTP') === 'true';

// La configuración de ZapSign (API key, template, base url, tipo de
// validación) ya no vive acá: se movió a la Edge Function zapsign-proxy,
// del lado servidor. Nada de eso debe estar en el cliente, porque todo lo
// EXPO_PUBLIC_ queda incrustado en el binario. Ver services/zapsign.service.ts.

/**
 * Validate CUIT/CUIL formula
 * In test mode: always returns true (accepts any value)
 * In production mode: performs real mathematical validation
 */
export const shouldValidateCuit = isProductionEnv;
