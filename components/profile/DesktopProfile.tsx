import React, { useMemo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, borderRadius } from "../../theme";
import { useTheme } from "../../context/ThemeContext";
import { Button, VersionTag } from "../ui";
import { DesktopPage, DesktopGrid, DesktopCol } from "../layout/DesktopPage";
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
 * Vista de ESCRITORIO de Mi Perfil. Compone una CABECERA de identidad horizontal
 * (avatar + nombre + estado) y, debajo, una grilla de 2 columnas: a la izquierda
 * el perfil operacional y los datos personales (en grilla de campos, no filas
 * finas estiradas); a la derecha alias, seguridad y salir. Sin duplicar datos.
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
      {/* Cabecera de identidad (horizontal) */}
      <View style={styles.headerCard}>
        <View style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarInitials}><Text style={styles.avatarInitialsText}>{initials || "U"}</Text></View>
          )}
          <TouchableOpacity style={styles.cameraBtn} onPress={onAvatarUpload} disabled={isUploading} activeOpacity={0.8}>
            {isUploading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="camera" size={15} color="#fff" />}
          </TouchableOpacity>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{currentUser.name}</Text>
          <View style={styles.metaRow}>
            <View style={[styles.badge, { backgroundColor: (currentUser.isVerified ? colors.success : colors.mutedForeground) + "22" }]}>
              <Ionicons
                name={currentUser.isVerified ? "shield-checkmark" : "shield-outline"}
                size={13}
                color={currentUser.isVerified ? colors.success : colors.mutedForeground}
              />
              <Text style={[styles.badgeText, { color: currentUser.isVerified ? colors.success : colors.mutedForeground }]}>
                {currentUser.isVerified ? "Verificado" : "Sin verificar"}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="mail-outline" size={14} color={colors.mutedForeground} />
              <Text style={styles.metaText} numberOfLines={1}>{currentUser.email}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="call-outline" size={14} color={colors.mutedForeground} />
              <Text style={styles.metaText}>{currentUser.phone}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.changePhotoBtn} onPress={onAvatarUpload} disabled={isUploading} activeOpacity={0.8}>
          <Ionicons name="image-outline" size={16} color={colors.accent} />
          <Text style={styles.changePhotoText}>Cambiar foto</Text>
        </TouchableOpacity>
      </View>

      <DesktopGrid>
        {/* Columna principal: operativa + datos personales */}
        <DesktopCol flex={1.5} minWidth={360}>
          <OperationalLimitsCard monthlyLimit={monthlyLimit} amountOperated={amountOperated} />

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Datos personales</Text>
            <View style={styles.fieldsGrid}>
              <Field label="Nombre" value={currentUser.name} />
              <Field label="Número de documento" value={currentUser.dni} />
              <Field label="Email" value={currentUser.email} />
              <Field label="Móvil" value={currentUser.phone} />
            </View>
          </View>
        </DesktopCol>

        {/* Columna lateral: alias + seguridad + salir */}
        <DesktopCol flex={1} minWidth={300}>
          <AliasManagement userCuit={currentUser.dni.replace(/\D/g, "")} />
          <MenuSection title="Seguridad" items={securityItems} />
          <Button variant="destructive" onPress={onLogout} style={styles.logoutBtn}>
            Cerrar Sesión
          </Button>
          <VersionTag style={styles.version} />
        </DesktopCol>
      </DesktopGrid>
    </DesktopPage>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexGrow: 1, flexBasis: "45%", minWidth: 200, gap: 4 }}>
      <Text style={{ fontSize: 11, color: colors.mutedForeground, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.4 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 15, color: colors.foreground, fontWeight: "600" }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    headerCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.lg,
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      flexWrap: "wrap",
    },
    avatarWrap: {},
    avatarImg: { width: 76, height: 76, borderRadius: 38 },
    avatarInitials: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
    avatarInitialsText: { color: "#fff", fontSize: 26, fontWeight: "800" },
    cameraBtn: {
      position: "absolute", right: -2, bottom: -2, width: 28, height: 28, borderRadius: 14,
      backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
      borderWidth: 2, borderColor: colors.card,
    },
    headerInfo: { flex: 1, minWidth: 220, gap: 8 },
    name: { fontSize: 22, fontWeight: "800", color: colors.foreground, letterSpacing: -0.3 },
    metaRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, flexWrap: "wrap" },
    badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
    badgeText: { fontSize: 12, fontWeight: "700" },
    metaItem: { flexDirection: "row", alignItems: "center", gap: 5, maxWidth: 260 },
    metaText: { fontSize: 13, color: colors.mutedForeground },
    changePhotoBtn: {
      flexDirection: "row", alignItems: "center", gap: 6,
      paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
      borderRadius: borderRadius.lg, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background,
    },
    changePhotoText: { fontSize: 13, fontWeight: "600", color: colors.accent },
    card: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      gap: spacing.lg,
    },
    cardTitle: { fontSize: 16, fontWeight: "700", color: colors.foreground },
    fieldsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
    logoutBtn: { borderColor: colors.destructive, borderWidth: 1, width: "100%" },
    version: { textAlign: "center", fontSize: 10, color: colors.mutedForeground, fontFamily: "monospace" },
  });
