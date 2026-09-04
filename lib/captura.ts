import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";

/**
 * Captura una vista como imagen y la comparte/guarda.
 *
 * Implementación nativa (iOS/Android): react-native-view-shot + expo-sharing.
 * En web, Metro usa `captura.web.ts` (html-to-image + descarga/Web Share),
 * porque ninguno de estos dos módulos funciona en el navegador.
 *
 * `ref` debe apuntar a una <View> (con collapsable={false} en Android).
 */
export async function capturarYCompartir(
  ref: React.RefObject<any>,
  opciones: { nombre: string; titulo?: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const uri = await captureRef(ref, { format: "png", quality: 1 });
    if (!(await Sharing.isAvailableAsync())) {
      return { ok: false, error: "Compartir no está disponible en este dispositivo." };
    }
    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      dialogTitle: opciones.titulo ?? "Compartir",
    });
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "No se pudo preparar la imagen." };
  }
}
