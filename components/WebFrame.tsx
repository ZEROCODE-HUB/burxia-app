import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { colors } from "../theme";

/**
 * Marco responsivo (Nivel A).
 *
 * La app es mobile-first. En un teléfono ocupa toda la pantalla. En web
 * sobre una pantalla grande, sin esto, el contenido se estira horizontalmente
 * y se ve mal. Este marco limita el ancho a tamaño teléfono y lo centra,
 * pintando los costados con un fondo neutro.
 *
 * En iOS/Android es passthrough (no cambia nada): el `Platform.OS !== "web"`
 * devuelve los hijos tal cual.
 */
const MAX_ANCHO = 480;

export function WebFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  return (
    <View style={styles.exterior}>
      <View style={styles.interior}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  exterior: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    // Fondo de los costados en pantallas anchas.
    backgroundColor: "#0b1220",
  },
  interior: {
    flex: 1,
    width: "100%",
    maxWidth: MAX_ANCHO,
    backgroundColor: colors.background,
    // Sutil separación visual del fondo lateral (boxShadow es válido en RN-web).
    boxShadow: "0 0 24px rgba(0,0,0,0.4)",
  },
});
