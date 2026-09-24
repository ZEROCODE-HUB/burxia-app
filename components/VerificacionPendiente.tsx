import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';

/**
 * Aviso para las pantallas FUNCIONALES cuando la cuenta está en verificación
 * (envió el KYB pero todavía no lo aprobaron). El usuario puede navegar/explorar
 * la app, pero al entrar a una acción funcional ve esto en lugar de la operación.
 */
export function VerificacionPendiente({ titulo, mensaje }: { titulo?: string; mensaje?: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="hourglass-outline" size={38} color={colors.warning} />
        </View>
        <Text style={styles.title}>{titulo ?? 'Tu cuenta está en verificación'}</Text>
        <Text style={styles.text}>
          {mensaje ??
            'Recibimos tu formulario de vinculación y lo estamos revisando. Vas a poder usar y explorar todas las funciones en cuanto aprobemos tus documentos; te avisamos por correo y notificación.'}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
    card: {
      alignItems: 'center', gap: spacing.sm, maxWidth: 460, width: '100%',
      backgroundColor: colors.card, borderRadius: borderRadius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.xl,
    },
    iconWrap: {
      width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.warningAlpha[20], marginBottom: spacing.sm,
    },
    title: { fontSize: 20, fontWeight: '800', color: colors.foreground, textAlign: 'center' },
    text: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', lineHeight: 20 },
  });
