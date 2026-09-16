import Constants from "expo-constants";

/**
 * Lectura de variables de entorno.
 *
 * Antes esta función tenía como último recurso la URL y la anon key de
 * Supabase escritas a mano — y las de Magnate, además. Eso hacía dos
 * cosas malas: dejaba una credencial en un archivo versionado, y sobre
 * todo hacía que una configuración faltante pasara desapercibida: la app
 * arrancaba igual, contra la base equivocada.
 *
 * Ahora falla fuerte y temprano. Es preferible no arrancar a arrancar
 * apuntando a otro lado.
 */
// El `extra` de app.config.js expone las credenciales con nombres camelCase
// (supabaseUrl, ...), no con el nombre completo EXPO_PUBLIC_*. Este mapa traduce
// la clave EXPO_PUBLIC_* pedida a la clave real dentro de `extra`, para que en
// un build nativo (donde Metro puede no incrustar process.env) igual se resuelva
// desde el manifest embebido.
const EXTRA_KEY_ALIASES: Record<string, string> = {
  EXPO_PUBLIC_SUPABASE_URL: "supabaseUrl",
  EXPO_PUBLIC_SUPABASE_ANON_KEY: "supabaseAnonKey",
  EXPO_PUBLIC_ONESIGNAL_APP_ID: "oneSignalAppId",
};

export const getEnvVar = (key: string): string => {
  // En desarrollo web y en el bundler, las EXPO_PUBLIC_* llegan por acá.
  if (process.env[key]) {
    return process.env[key] as string;
  }

  // En un build nativo llegan por el `extra` de app.config.js. Se prueba tanto
  // la clave tal cual como su alias camelCase (supabaseUrl, etc.).
  const extra = Constants.expoConfig?.extra as Record<string, unknown> | undefined;
  if (extra) {
    const direct = extra[key];
    if (direct) return direct as string;
    const alias = EXTRA_KEY_ALIASES[key];
    if (alias && extra[alias]) return extra[alias] as string;
  }

  return "";
};

/** Igual que getEnvVar, pero para lo que la app no puede no tener. */
export const requireEnvVar = (key: string): string => {
  const valor = getEnvVar(key);
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${key}. Copiá .env.example a .env y completala.`,
    );
  }
  return valor;
};
