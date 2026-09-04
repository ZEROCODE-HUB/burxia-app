import { toPng } from "html-to-image";

/**
 * Captura una vista como imagen y la comparte/guarda — versión web.
 *
 * En el navegador no existen react-native-view-shot ni expo-sharing. Se
 * captura el nodo DOM del ref con html-to-image y luego:
 *   1) si el navegador soporta compartir archivos (Web Share API), se comparte;
 *   2) si no, se descarga el PNG.
 *
 * En RN-web, el ref de una <View> apunta al elemento DOM subyacente, que es
 * justo lo que html-to-image necesita.
 */
export async function capturarYCompartir(
  ref: React.RefObject<any>,
  opciones: { nombre: string; titulo?: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const nodo = ref?.current as HTMLElement | null;
    if (!nodo) return { ok: false, error: "No se encontró la vista a capturar." };

    const dataUrl = await toPng(nodo, { cacheBust: true, pixelRatio: 2 });
    const archivo = `${opciones.nombre}.png`;

    // 1) Compartir con archivo, si el navegador lo permite (móvil web sobre todo).
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], archivo, { type: "image/png" });
      const navAny = navigator as any;
      if (navAny.canShare?.({ files: [file] })) {
        await navAny.share({ files: [file], title: opciones.titulo ?? "Comprobante" });
        return { ok: true };
      }
    } catch {
      // Si el usuario cancela o falla el share, se cae a la descarga.
    }

    // 2) Descargar el PNG.
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = archivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "No se pudo generar la imagen." };
  }
}
