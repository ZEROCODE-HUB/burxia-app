/**
 * Environment configuration for Magnate Financial Freedom
 * Controls test vs production behavior.
 *
 * Set EXPO_PUBLIC_APP_ENV=test for testing / Play Store review accounts.
 * Set EXPO_PUBLIC_APP_ENV=production for live production builds.
 *
 * IMPORTANTE: las variables EXPO_PUBLIC_* se referencian LITERALMENTE
 * (process.env.EXPO_PUBLIC_...) para que Expo los inyecte en el bundle
 * nativo. Usar getEnvVar('EXPO_PUBLIC_X') (acceso dinámico) NO se inyecta
 * y queda vacío en builds nativos (EAS/Codemagic), cayendo en mock.
 */

const APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV || 'test') as 'test' | 'production';

export const isTestEnv = APP_ENV === 'test';
export const isProductionEnv = APP_ENV === 'production';

export const ZAPSIGN_CONFIG = {
    baseUrl: isTestEnv
        ? 'https://sandbox.api.zapsign.com.br'
        : 'https://api.zapsign.com.br',
    apiKey: isTestEnv
        ? (process.env.EXPO_PUBLIC_ZAPSIGN_API_KEY || '')
        : (process.env.EXPO_PUBLIC_ZAPSIGN_API_KEY_PROD || ''),
    templateId: isTestEnv
        ? (process.env.EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID || '')
        : (process.env.EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID_PROD || ''),
    // Tipo de validación biométrica (solo producción). Si está vacío, no se exige matching real.
    // Ej: 'liveness-document-match' | 'identity-verification-global' (requiere créditos en ZapSign).
    selfieValidationType: isProductionEnv
        ? (process.env.EXPO_PUBLIC_ZAPSIGN_SELFIE_VALIDATION_TYPE || '')
        : '',
};

/**
 * Validate CUIT/CUIL formula
 * In test mode: always returns true (accepts any value)
 * In production mode: performs real mathematical validation
 */
export const shouldValidateCuit = isProductionEnv;
