import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Abre una URL externa (p. ej. el PDF de Términos y Condiciones) de la forma
// correcta según la plataforma: en web, nueva pestaña (gesto del usuario, sin
// opener para no exponer window.opener); en nativo, navegador in-app (Custom Tab),
// igual que el flujo KYC (ver components/register/BiometricCard.tsx).
export async function openExternal(url: string): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    return;
  }
  await WebBrowser.openBrowserAsync(url);
}
