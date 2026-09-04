// Almacenamiento seguro — implementación web.
//
// expo-secure-store no funciona en el navegador. En web se usa localStorage,
// que es lo mejor disponible; envuelto en try/catch porque puede fallar (modo
// privado, storage bloqueado). No es "seguro" como el Keychain nativo, pero en
// web no hay equivalente; se usa solo para el id de dispositivo, no secretos.
export async function getItem(key: string): Promise<string | null> {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    globalThis.localStorage?.setItem(key, value);
  } catch {
    /* storage no disponible: se ignora */
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    /* storage no disponible: se ignora */
  }
}
