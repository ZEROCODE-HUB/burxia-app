import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius } from "../../theme";
import { useTheme } from "../../context/ThemeContext";
import { Button, VersionTag } from "../ui";
import { DesktopPage, DesktopGrid, DesktopCol } from "../layout/DesktopPage";
import { InfoCard } from "./InfoCard";
import { OperationalLimitsCard } from "./OperationalLimitsCard";
import { AliasManagement } from "./AliasManagement";
import { MenuSection } from "./MenuSection";

interface CurrentUser {
  name: string;
  subtitle: string;
  isVerified: boolean;
  cuit: string;
  dni: string;
  email: string;
  phone: string;
}

interface Props {
  currentUser: CurrentUser;
  avatarUrl: string | null;
  isUploading: boolean;
  onAvatarUpload: () => void;
  monthlyLimit: number;
  amountOperated: number;
  securityItems: any[];
  onLogout: () => void;
}

/**
 * Vista de ESCRITORIO de Mi Perfil. Reutiliza los mismos componentes-tarjeta que
 * el móvil (InfoCard, OperationalLimitsCard, AliasManagement, MenuSection) pero
 * los compone en una grilla de 2 columnas propia de escritorio, con una tarjeta
 * de identidad compacta en vez del hero full-width del teléfono.
 */
export function DesktopProfile({
  currentUser,
  avatarUrl,
  isUploading,
  onAvatarUpload,
  monthlyLimit,
  amountOperated,
  securityItems,
  onLogout,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const initials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DesktopPage title="Mi Perfil" subtitle="Gestioná tu cuenta, límites y seguridad">
      <DesktopGrid>
        {/* Columna izquierda: identidad + seguridad + salir */}
        <DesktopCol flex={1} minWidth={300}>
          <View style={styles.idCard}>
            <View style={styles.avatarWrap}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
              ) : (
                <View style={styles.avatarInitials}><Text style={styles.avatarInitialsText}>{initials || "U"}</Text></View>
              )}
              <TouchableOpacity style={styles.cameraBtn} onPress={onAvatarUpload} disabled={isUploading} activeOpacity={0.8}>
                {isUploading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="camera" size={16} color="#fff" />}
              </TouchableOpacity>
            </View>
            <Text style={styles.name}>{currentUser.name}</Text>
            <View style={styles.badgeRow}>
              <Ionicons
                name={currentUser.isVerified ? "shield-checkmark" : "shield-outline"}
                size={14}
                color={currentUser.isVerified ? colors.success : colors.mutedForeground}
              />
              <Text style={[styles.badgeText, { color: currentUser.isVerified ? colors.success : colors.mutedForeground }]}>
                {currentUser.isVerified ? "Verificado" : "Sin verificar"}
              </Text>
            </View>
            <View style={styles.idDivider} />
            <View style={styles.quickRow}><Ionicons name="mail-outline" size={16} color={colors.mutedForeground} /><Text style={styles.quickText} numberOfLines={1}>{currentUser.email}</Text></View>
            <View style={styles.quickRow}><Ionicons name="call-outline" size={16} color={colors.mutedForeground} /><Text style={styles.quickText}>{currentUser.phone}</Text></View>
          </View>

          <MenuSection title="Seguridad" items={securityItems} />

          <Button variant="destructive" onPress={onLogout} style={styles.logoutBtn}>
            Cerrar Sesión
          </Button>
          <VersionTag style={styles.version} />
        </DesktopCol>

        {/* Columna derecha: límites + alias + datos */}
        <DesktopCol flex={1.5} minWidth={340}>
          <OperationalLimitsCard monthlyLimit={monthlyLimit} amountOperated={amountOperated} />
          <AliasManagement userCuit={currentUser.dni.replace(/\D/g, "")} />
          <InfoCard title="Identidad" fields={[{ label: "Número de documento", value: currentUser.dni }]} />
          <InfoCard title="Contacto" fields={[{ label: "Email", value: currentUser.email }, { label: "Móvil", value: currentUser.phone }]} />
        </DesktopCol>
      </DesktopGrid>
    </DesktopPage>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    idCard: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      alignItems: "center",
      gap: spacing.xs,
    },
    avatarWrap: { marginBottom: spacing.sm },
    avatarImg: { width: 88, height: 88, borderRadius: 44 },
    avatarInitials: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
    avatarInitialsText: { color: "#fff", fontSize: 30, fontWeight: "800" },
    cameraBtn: {
      position: "absolute", right: -2, bottom: -2, width: 30, height: 30, borderRadius: 15,
      backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
      borderWidth: 2, borderColor: colors.card,
    },
    name: { fontSize: 18, fontWeight: "800", color: colors.foreground, textAlign: "center" },
    badgeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    badgeText: { fontSize: 12, fontWeight: "600" },
    idDivider: { height: 1, backgroundColor: colors.border, alignSelf: "stretch", marginVertical: spacing.md },
    quickRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, alignSelf: "stretch" },
    quickText: { flex: 1, fontSize: 13, color: colors.foreground },
    logoutBtn: { borderColor: colors.destructive, borderWidth: 1, width: "100%" },
    version: { textAlign: "center", fontSize: 10, color: colors.mutedForeground, fontFamily: "monospace" },
  });
