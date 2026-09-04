// Almacenamiento seguro — implementación nativa (iOS/Android).
//
// Envuelve expo-secure-store para que el resto del código no dependa de él
// directamente. En web, Metro usa `secureStorage.web.ts` (localStorage),
// porque expo-secure-store no tiene implementación de navegador.
import * as SecureStore from "expo-secure-store";

export async function getItem(key: string): Promise<string | null> {
  return SecureStore.getItemAsync(key);
}

export async function setItem(key: string, value: string): Promise<void> {
  await SecureStore.setItemAsync(key, value);
}

export async function removeItem(key: string): Promise<void> {
  await SecureStore.deleteItemAsync(key);
}
