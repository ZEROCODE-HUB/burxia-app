import React, { useMemo } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { DesktopSidebar } from "./layout/DesktopSidebar";
import { AuthBrandPanel } from "./layout/AuthBrandPanel";

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

export function WebFrame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== "web") {
    return <>{children}</>;
  }
  return <WebFrameInner>{children}</WebFrameInner>;
}

function WebFrameInner({ children }: { children: React.ReactNode }) {
  const isDesktop = useIsDesktop();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { session, user, pendingDeviceVerification, kybStatus } = useAuth();
  // "En la app" (con sidebar) si está verificado, o si ya envió el KYB y está en
  // revisión (puede explorar; las pantallas funcionales avisan). Sin formulario
  // enviado ve el portón de verificación sin el sidebar.
  const verificado = (user as any)?.verification_status === 'verified';
  const enApp = !!session && !!user && !pendingDeviceVerification && (verificado || kybStatus === 'submitted');

  if (isDesktop && enApp) {
    return (
      <View style={styles.desktopRoot}>
        <DesktopSidebar />
        <View style={styles.desktopContent}>{children}</View>
      </View>
    );
  }

  if (isDesktop && !enApp) {
    return (
      <View style={styles.authSplit}>
        <View style={styles.authBrand}>
          <AuthBrandPanel />
        </View>
        <View style={styles.authFormPanel}>
          <View style={styles.authFormInner}>{children}</View>
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

const createStyles = (colors: any) => StyleSheet.create({
  // --- Nivel A: marco tipo teléfono ---
  exterior: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: colors.muted,
  },
  interior: {
    flex: 1,
    width: "100%",
    maxWidth: MAX_ANCHO,
    backgroundColor: colors.background,
    boxShadow: "0 0 24px rgba(0,0,0,0.25)",
  },
  // --- Nivel B: escritorio con sidebar ---
  desktopRoot: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.background,
  },
  desktopContent: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  // Auth (pre-login) en escritorio: pantalla partida marca | formulario
  authSplit: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.background,
  },
  authBrand: {
    flex: 1,
  },
  authFormPanel: {
    width: 600,
    flexShrink: 0,
    backgroundColor: colors.card,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  authFormInner: {
    flex: 1,
    width: "100%",
  },
});
