import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { LogoIcon } from '../LogoIcon';
import { spacing, borderRadius } from '../../theme';

/**
 * Overlay de carga BLOQUEANTE. Mientras `visible` es true, cubre toda la pantalla
 * (incluida la tab bar, por usar `Modal`) e intercepta los toques, así el usuario
 * no puede navegar ni tocar nada mientras se procesa una operación
 * (compra/venta OTC, depósito, retiro…).
 */
export function ProcessingModal({
  visible,
  message = 'Procesando…',
  hint = 'No cierres ni cambies de pantalla.',
}: {
  visible: boolean;
  message?: string;
  hint?: string;
}) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (!visible) return null;

  return (
    <Modal transparent visible animationType="fade" statusBarTranslucent onRequestClose={() => { /* no cerrable */ }}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.logo}><LogoIcon size={40} /></View>
          <ActivityIndicator size="large" color={colors.accent} style={{ marginVertical: spacing.md }} />
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(4, 10, 20, 0.6)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    card: {
      width: '100%',
      maxWidth: 300,
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      boxShadow: '0 20px 60px rgba(0,0,0,0.45)' as any,
    },
    logo: {
      width: 64, height: 64, borderRadius: 18,
      backgroundColor: colors.accentAlpha[10],
      alignItems: 'center', justifyContent: 'center',
    },
    message: { fontSize: 16, fontWeight: '700', color: colors.foreground, textAlign: 'center' },
    hint: { fontSize: 12.5, color: colors.mutedForeground, textAlign: 'center', marginTop: 4 },
  });
