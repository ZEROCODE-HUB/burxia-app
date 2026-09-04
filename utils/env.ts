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
export const getEnvVar = (key: string): string => {
  // En desarrollo web y en el bundler, las EXPO_PUBLIC_* llegan por acá.
  if (process.env[key]) {
    return process.env[key] as string;
  }

  // En un build nativo llegan por el `extra` de app.config.js.
  const extra = Constants.expoConfig?.extra?.[key];
  if (extra) {
    return extra as string;
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
