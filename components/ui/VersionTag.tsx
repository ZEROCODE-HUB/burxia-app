import React, { useMemo } from "react";
import { Text, StyleSheet, TextStyle, StyleProp } from "react-native";
import Constants from "expo-constants";
import * as Updates from "expo-updates";
import { useTheme } from "../../context/ThemeContext";

/**
 * Etiqueta de versión discreta para Login y Mi Perfil.
 *
 * Muestra la versión de la app (la de app.config.js → `version`) y, si hay una
 * actualización OTA aplicada, un id corto del update. Como aplicar un OTA
 * recarga la app, este texto se refresca solo apenas entra la versión nueva.
 *
 *   v1.0.9            → corriendo el bundle embebido en el APK
 *   v1.0.9 · a1b2c3   → corriendo un update OTA (id corto)
 */
export function VersionTag({ style }: { style?: StyleProp<TextStyle> }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const label = useMemo(() => {
    const appVersion =
      (Constants.expoConfig?.version as string | undefined) ?? "—";
    let otaSuffix = "";
    try {
      // updateId es null cuando se corre el bundle embebido (sin OTA todavía).
      if (Updates.isEnabled && !Updates.isEmbeddedLaunch && Updates.updateId) {
        otaSuffix = ` · ${Updates.updateId.slice(0, 6)}`;
      }
    } catch {
      // expo-updates puede no estar disponible (web / dev): mostramos solo la
      // versión de la app.
    }
    return `v${appVersion}${otaSuffix}`;
  }, []);

  return (
    <Text style={[styles.text, style]} numberOfLines={1}>
      {label}
    </Text>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    text: {
      fontSize: 10,
      color: colors.mutedForeground,
      opacity: 0.7,
      fontWeight: "500",
      textAlign: "center",
      letterSpacing: 0.3,
    },
  });
