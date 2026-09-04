import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { colors } from "../theme";
import { useAuth } from "../context/AuthContext";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { DesktopSidebar } from "./layout/DesktopSidebar";

/**
 * Marco responsivo de la web.
 *
 * - **Nativo (iOS/Android):** passthrough, no cambia nada.
 * - **Web angosta (Nivel A):** limita el ancho a tamaño teléfono y lo centra,
 *   pintando los costados.
 * - **Web ancha + dentro de la app autenticada (Nivel B):** layout de escritorio
 *   con `DesktopSidebar` a la izquierda y el contenido centrado en una columna.
 *   En login/registro/verificación (sin sesión) se mantiene el marco teléfono.
 *
 * Todo se resuelve acá y en `app/(tabs)/_layout.tsx` (que oculta la tab-bar en
 * escritorio): las pantallas no se tocan una por una.
 */
const MAX_ANCHO = 480;
const DESKTOP_CONTENT_MAX = 760;

export function WebFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }
  return <WebFrameInner>{children}</WebFrameInner>;
}

function WebFrameInner({ children }: { children: React.ReactNode }) {
  const isDesktop = useIsDesktop();
  const { session, user, pendingDeviceVerification } = useAuth();
  const enApp = !!session && !!user && !pendingDeviceVerification;

  if (isDesktop && enApp) {
    return (
      <View style={styles.desktopRoot}>
        <DesktopSidebar />
        <View style={styles.desktopContent}>
          <View style={styles.desktopColumn}>{children}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.exterior}>
      <View style={styles.interior}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Nivel A: marco tipo teléfono ---
  exterior: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#0b1220",
  },
  interior: {
    flex: 1,
    width: "100%",
    maxWidth: MAX_ANCHO,
    backgroundColor: colors.background,
    boxShadow: "0 0 24px rgba(0,0,0,0.4)",
  },
  // --- Nivel B: escritorio con sidebar ---
  desktopRoot: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.background,
  },
  desktopContent: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0b1220",
  },
  desktopColumn: {
    flex: 1,
    width: "100%",
    maxWidth: DESKTOP_CONTENT_MAX,
    backgroundColor: colors.background,
    boxShadow: "0 0 24px rgba(0,0,0,0.35)",
  },
});
