import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Input, AlertDialog, Toast, ToastType, VersionTag } from "../ui";
import { LoginProcessingModal } from "../login";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { PIN_LENGTH } from "../../constants/app";
import { EMAIL_PLACEHOLDER } from "../../constants/brand";
import { validateEmail } from "../../utils/validators";
import { getLastUser, clearLastUser, SavedUser } from "../../services/storage.service";
import { spacing } from "../../theme";

/**
 * Login DEDICADO de ESCRITORIO. NO reusa el teclado en pantalla del móvil: en
 * web hay teclado físico, así que el PIN se ESCRIBE en una fila de casillas.
 * Comparte la lógica (useAuth, storage, validación) con el móvil; solo cambia la
 * composición. Vive dentro del panel derecho que arma WebFrame (marca a la izq).
 */
export function DesktopLogin() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savedUser, setSavedUser] = useState<SavedUser | null>(null);
  const [alert, setAlert] = useState({ visible: false, title: "", message: "", type: "default" as "default" | "destructive" });
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" as ToastType });

  const pinRef = useRef<TextInput>(null);

  useEffect(() => {
    getLastUser().then((u) => {
      if (u) {
        setSavedUser(u);
        setEmail(u.email);
      }
    });
  }, []);

  const showToast = (message: string, type: ToastType = "info") => setToast({ visible: true, message, type });
  const showAlert = (title: string, message: string, type: "default" | "destructive" = "default") =>
    setAlert({ visible: true, title, message, type });

  const handleSwitchAccount = async () => {
    await clearLastUser();
    setSavedUser(null);
    setEmail("");
    setPin("");
  };

  const canSubmit = (savedUser ? true : validateEmail(email)) && pin.length === PIN_LENGTH && !isLoading;

  const handleSubmit = async () => {
    if (!savedUser && !email.trim()) return showToast("Por favor ingresá tu correo electrónico", "error");
    if (!savedUser && !validateEmail(email)) return showToast("Email inválido", "error");
    if (pin.length !== PIN_LENGTH) return showToast(`Ingresá tu PIN de ${PIN_LENGTH} dígitos`, "error");

    setIsLoading(true);
    try {
      const result = await login(savedUser ? savedUser.email : email, pin);
      if (result.success) {
        router.replace("/(tabs)");
      } else {
        const known = ["Credenciales incorrectas", "PIN incorrecto", "Usuario no encontrado"];
        if (known.includes(result.error || "")) showToast(result.error || "Credenciales incorrectas", "error");
        else showAlert("Error de inicio de sesión", result.error || "Ocurrió un error inesperado", "destructive");
        setPin("");
        pinRef.current?.focus();
      }
    } catch (err: any) {
      showAlert("Error", err?.message || "Error al iniciar sesión", "destructive");
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {isLoading && <LoginProcessingModal />}

      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast((p) => ({ ...p, visible: false }))} />
      <AlertDialog
        visible={alert.visible}
        title={alert.title}
        description={alert.message}
        variant={alert.type}
        onClose={() => setAlert((p) => ({ ...p, visible: false }))}
        onConfirm={() => setAlert((p) => ({ ...p, visible: false }))}
        showCancel={false}
        confirmLabel="Entendido"
      />

      <View style={styles.form}>
        <View style={styles.head}>
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>
            {savedUser ? `Hola de nuevo, ${savedUser.firstName}` : "Ingresá tus datos para continuar"}
          </Text>
        </View>

        {savedUser ? (
          <View style={styles.savedRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(savedUser.firstName?.[0] ?? "U").toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.savedName}>{savedUser.firstName}</Text>
              <Text style={styles.savedMail} numberOfLines={1}>{savedUser.email}</Text>
            </View>
            <Pressable onPress={handleSwitchAccount} hitSlop={8}>
              <Text style={styles.link}>Cambiar</Text>
            </Pressable>
          </View>
        ) : (
          <Input
            label="Usuario"
            value={email}
            onChangeText={setEmail}
            placeholder={EMAIL_PLACEHOLDER}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            icon={<Ionicons name="person-outline" size={20} color={colors.mutedForeground} />}
          />
        )}

        {/* PIN: se ESCRIBE con el teclado (no teclado en pantalla) */}
        <View style={styles.pinBlock}>
          <Text style={styles.pinLabel}>PIN de {PIN_LENGTH} dígitos</Text>
          <Pressable style={styles.pinRow} onPress={() => pinRef.current?.focus()}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => {
              const filled = pin.length > i;
              const active = pin.length === i;
              return (
                <View key={i} style={[styles.pinBox, active && styles.pinBoxActive, filled && styles.pinBoxFilled]}>
                  <Text style={styles.pinDot}>{filled ? "●" : ""}</Text>
                </View>
              );
            })}
            <TextInput
              ref={pinRef}
              style={styles.hiddenInput}
              value={pin}
              onChangeText={(t) => setPin(t.replace(/[^0-9]/g, "").slice(0, PIN_LENGTH))}
              keyboardType="number-pad"
              maxLength={PIN_LENGTH}
              secureTextEntry
              autoFocus
              onSubmitEditing={handleSubmit}
              // @ts-ignore — web: enviar con Enter
              onKeyPress={(e: any) => { if (e?.nativeEvent?.key === "Enter") handleSubmit(); }}
            />
          </Pressable>
        </View>

        <Button onPress={handleSubmit} disabled={!canSubmit} loading={isLoading} variant={canSubmit ? "primary" : "outline"} style={{ width: "100%" }}>
          {isLoading ? "Ingresando..." : "Ingresar"}
        </Button>

        <View style={styles.links}>
          {!savedUser && (
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.linkMuted}>¿Nuevo usuario? <Text style={styles.link}>Registrate aquí</Text></Text>
            </Pressable>
          )}
          <Pressable onPress={() => router.push("/(auth)/forgot-password")}>
            <Text style={styles.linkMuted}>¿Olvidaste tu clave?</Text>
          </Pressable>
        </View>

        <VersionTag style={styles.version} />
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    root: { flex: 1, justifyContent: "center", paddingHorizontal: 44, paddingVertical: 40 },
    form: { gap: spacing.lg },
    head: { gap: 4, marginBottom: spacing.sm },
    title: { fontSize: 30, fontWeight: "800", color: colors.foreground, letterSpacing: -0.6 },
    subtitle: { fontSize: 15, color: colors.mutedForeground },
    savedRow: {
      flexDirection: "row", alignItems: "center", gap: spacing.md,
      backgroundColor: colors.background, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: spacing.md,
    },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
    avatarText: { color: "#fff", fontWeight: "800", fontSize: 18 },
    savedName: { fontSize: 15, fontWeight: "700", color: colors.foreground },
    savedMail: { fontSize: 12, color: colors.mutedForeground },
    pinBlock: { gap: spacing.sm },
    pinLabel: { fontSize: 13, fontWeight: "600", color: colors.foreground },
    pinRow: { flexDirection: "row", gap: 10, position: "relative" },
    pinBox: {
      flex: 1, aspectRatio: 1, maxWidth: 56, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border,
      backgroundColor: colors.background, alignItems: "center", justifyContent: "center",
    },
    pinBoxActive: { borderColor: colors.accent },
    pinBoxFilled: { borderColor: colors.accent, backgroundColor: colors.accentAlpha[10] },
    pinDot: { fontSize: 22, color: colors.foreground, lineHeight: 26 },
    hiddenInput: { ...StyleSheet.absoluteFillObject, opacity: 0, color: "transparent" as any },
    links: { gap: spacing.sm, alignItems: "center", marginTop: spacing.xs },
    linkMuted: { fontSize: 13, color: colors.mutedForeground },
    link: { color: colors.accent, fontWeight: "600" },
    version: { textAlign: "center", fontSize: 10, color: colors.mutedForeground, marginTop: spacing.md },
  });
