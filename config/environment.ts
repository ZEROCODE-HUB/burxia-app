/**
 * Environment configuration for Magnate Financial Freedom
 * Controls test vs production behavior.
 *
 * Set EXPO_PUBLIC_APP_ENV=test for testing / Play Store review accounts.
 * Set EXPO_PUBLIC_APP_ENV=production for live production builds.
 *
 * Las variables EXPO_PUBLIC_* se resuelven así:
 *   1) process.env.EXPO_PUBLIC_X  -> inline que hace Expo en el bundle cuando la var
 *      existe en el entorno de EAS (producción).
 *   2) Constants.expoConfig.extra.EXPO_PUBLIC_X -> valor embebido en app.config.js
 *      (útil para QA/builds donde EAS no tiene la var).
 */

import { Constants } from 'expo-constants';

const readEnv = (name: string): string => {
    const fromProcess = (process.env as Record<string, string | undefined>)[name];
    if (fromProcess !== undefined && fromProcess !== null && fromProcess !== '') return fromProcess;
    const extra = (Constants.expoConfig as any)?.extra;
    if (extra && extra[name] !== undefined && extra[name] !== null && extra[name] !== '') return extra[name];
    return '';
};

const APP_ENV = readEnv('EXPO_PUBLIC_APP_ENV') || 'test';

export const isTestEnv = APP_ENV === 'test';
export const isProductionEnv = APP_ENV === 'production';

export const ZAPSIGN_CONFIG = {
    baseUrl: isTestEnv
        ? 'https://sandbox.api.zapsign.com.br'
        : 'https://api.zapsign.com.br',
    apiKey: isTestEnv
        ? readEnv('EXPO_PUBLIC_ZAPSIGN_API_KEY')
        : readEnv('EXPO_PUBLIC_ZAPSIGN_API_KEY_PROD'),
    templateId: isTestEnv
        ? readEnv('EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID')
        : readEnv('EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID_PROD'),
    // Tipo de validación biométrica (solo producción). Si está vacío, no se exige matching real.
    // Ej: 'liveness-document-match' | 'identity-verification-global' (requiere créditos en ZapSign).
    selfieValidationType: isProductionEnv
        ? readEnv('EXPO_PUBLIC_ZAPSIGN_SELFIE_VALIDATION_TYPE')
        : '',
};

/**
 * Validate CUIT/CUIL formula
 * In test mode: always returns true (accepts any value)
 * In production mode: performs real mathematical validation
 */
export const shouldValidateCuit = isProductionEnv;
