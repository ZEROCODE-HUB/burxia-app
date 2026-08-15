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

export const ZAPSIGN_CONFIG = {
    baseUrl: isTestEnv
        ? 'https://sandbox.api.zapsign.com.br'
        : 'https://api.zapsign.com.br',
    apiKey: isTestEnv
        ? getEnvVar('EXPO_PUBLIC_ZAPSIGN_API_KEY')
        : getEnvVar('EXPO_PUBLIC_ZAPSIGN_API_KEY_PROD'),
    templateId: isTestEnv
        ? getEnvVar('EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID')
        : getEnvVar('EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID_PROD'),
    // Tipo de validación biométrica (solo producción). Si está vacío, no se exige matching real.
    // Ej: 'liveness-document-match' | 'identity-verification-global' (requiere créditos en ZapSign).
    selfieValidationType: isProductionEnv
        ? getEnvVar('EXPO_PUBLIC_ZAPSIGN_SELFIE_VALIDATION_TYPE')
        : '',
};

/**
 * Validate CUIT/CUIL formula
 * In test mode: always returns true (accepts any value)
 * In production mode: performs real mathematical validation
 */
export const shouldValidateCuit = isProductionEnv;
