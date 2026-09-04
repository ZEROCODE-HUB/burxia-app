/**
 * Fuente ÚNICA de la marca de la app.
 *
 * Para renombrar la app, cambiá SOLO los valores de este archivo y toda la UI se
 * actualiza sola. Los identificadores nativos (slug, scheme, package/bundle)
 * viven en `app.config.js` porque los consume el build de Expo/EAS, no el runtime
 * — si cambia la marca, actualizá también esos tres allí.
 */

/** Nombre visible de la app (títulos, logo, textos, comprobantes, PDF). */
export const BRAND_NAME = 'Bruxia';

/** Bajada/eslogan que acompaña al nombre en el comprobante y material. */
export const BRAND_TAGLINE = 'Financial Freedom';

/** Email de soporte por defecto (se puede sobreescribir desde settings). */
export const SUPPORT_EMAIL = 'soporte@bruxia.com';

/** Placeholder de ejemplo para los campos de email. */
export const EMAIL_PLACEHOLDER = `ejemplo@bruxia.com`;

/**
 * Prefijo del alias de CVU (formato `<prefijo>.XXXXXXXX`). Es visible para el
 * usuario y parte del identificador de la cuenta.
 */
export const ALIAS_PREFIX = 'bruxia';
