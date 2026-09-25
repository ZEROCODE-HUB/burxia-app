import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';

/**
 * Modal del aviso "cuenta en verificación". Se usa en las pantallas FUNCIONALES
 * (Transferir, Cambio asistido, Depositar, Retirar, QR): el usuario que ya envió
 * el KYB puede ENTRAR y explorar la pantalla, pero al intentar EJECUTAR la
 * operación se le muestra este modal en lugar de procesarla.
 */
export function VerificacionPendienteModal({
  visible,
  onClose,
  titulo,
  mensaje,
}: {
  visible: boolean;
  onClose: () => void;
  titulo?: string;
  mensaje?: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="hourglass-outline" size={38} color={colors.warning} />
          </View>
          <Text style={styles.title}>{titulo ?? 'Tu cuenta está en verificación'}</Text>
          <Text style={styles.text}>
            {mensaje ??
              'Recibimos tu formulario de vinculación y lo estamos revisando. Vas a poder operar en cuanto aprobemos tus documentos; te avisamos por correo y notificación.'}
          </Text>
          <TouchableOpacity style={styles.btn} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.btnText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
      // En web el Modal se ancla al viewport completo.
      ...(Platform.OS === 'web'
        ? ({ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 } as any)
        : {}),
    },
    card: {
      alignItems: 'center',
      gap: spacing.sm,
      maxWidth: 460,
      width: '100%',
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.xl,
    },
    iconWrap: {
      width: 76,
      height: 76,
      borderRadius: 38,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.warningAlpha[20],
      marginBottom: spacing.sm,
    },
    title: { fontSize: 20, fontWeight: '800', color: colors.foreground, textAlign: 'center' },
    text: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
    btn: {
      marginTop: spacing.md,
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: spacing.xl,
      borderRadius: borderRadius.lg,
      width: '100%',
      alignItems: 'center',
    },
    btnText: { color: colors.accentForeground, fontWeight: '700', fontSize: 15 },
  });
