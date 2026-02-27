/**
 * Environment configuration for Magnate Financial Freedom
 * Controls test vs production behavior.
 *
 * Set EXPO_PUBLIC_APP_ENV=test for testing / Play Store review accounts.
 * Set EXPO_PUBLIC_APP_ENV=production for live production builds.
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
        ? getEnvVar('EXPO_PUBLIC_ZAPSIGN_API_KEY') || ''
        : getEnvVar('EXPO_PUBLIC_ZAPSIGN_API_KEY_PROD') || '',
    templateId: isTestEnv
        ? getEnvVar('EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID') || ''
        : getEnvVar('EXPO_PUBLIC_ZAPSIGN_TEMPLATE_ID_PROD') || '',
};

/**
 * Validate CUIT/CUIL formula
 * In test mode: always returns true (accepts any value)
 * In production mode: performs real mathematical validation
 */
export const shouldValidateCuit = isProductionEnv;
