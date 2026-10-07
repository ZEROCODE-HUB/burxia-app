import React, { useMemo, useState } from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { spacing, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/Button';
import { LogoIcon } from './LogoIcon';
import { acceptTerms } from '../services/legal.service';
import { openExternal } from '../utils/openExternal';
import { TERMS_VERSION, TERMS_PDF_URL } from '../constants/legal';

// Portón obligatorio de Términos y Condiciones. Se monta global en app/_layout.tsx
// (junto a UpdateModal, dentro de AppLock) y tapa toda la app tras el login —en web
// y en móvil— hasta que el usuario acepta o cierra sesión. No se puede cerrar con el
// botón atrás ni tocando afuera.
//
// Se muestra cuando el usuario está autenticado y todavía no aceptó la versión
// vigente de los TyC (sin terms_accepted_at, o con terms_version distinta). Al
// aceptar, la RPC accept_terms persiste fecha + versión y refreshUser() recarga el
// user, con lo que el modal se oculta solo.
export function TermsGate() {
  const { isAuthenticated, user, logout, refreshUser } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const acceptedAt = (user as any)?.terms_accepted_at as string | null | undefined;
  const acceptedVersion = (user as any)?.terms_version as string | null | undefined;
  const needsAccept =
    isAuthenticated && !!user && (!acceptedAt || acceptedVersion !== TERMS_VERSION);

  if (!needsAccept) return null;

  const onAccept = async () => {
    setSubmitting(true);
    setError('');
    try {
      await acceptTerms(TERMS_VERSION);
      await refreshUser(); // al setear terms_accepted_at el modal se oculta solo
    } catch (e: any) {
      setError(e?.message || 'No pudimos registrar tu aceptación. Reintentá en unos segundos.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => { /* obligatorio: back no cierra */ }}>
      <View style={styles.container}>
        <View style={styles.card}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.logo}>
              <LogoIcon size={56} />
            </View>

            <Text style={styles.title}>Términos y Condiciones</Text>

            <Text style={styles.message}>
              Para usar Burxia necesitás leer y aceptar nuestros Términos y Condiciones. Incluyen
              varias cláusulas obligatorias —entre ellas las condiciones del servicio, el tratamiento
              de tus datos personales y las declaraciones de prevención de lavado de activos—. Es
              obligatorio aceptarlas para continuar.
            </Text>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => openExternal(TERMS_PDF_URL)}
              activeOpacity={0.7}
            >
              <Ionicons name="document-text-outline" size={18} color={colors.accent} />
              <Text style={styles.linkText}>Leer Términos y Condiciones (PDF)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAccepted((v) => !v)}
              activeOpacity={0.7}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accepted }}
            >
              <Ionicons
                name={accepted ? 'checkbox' : 'square-outline'}
                size={24}
                color={accepted ? colors.accent : colors.mutedForeground}
              />
              <Text style={styles.checkboxLabel}>
                He leído y acepto los Términos y Condiciones de Burxia.
              </Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button
              onPress={onAccept}
              disabled={!accepted || submitting}
              loading={submitting}
              style={styles.acceptBtn}
            >
              Aceptar y continuar
            </Button>

            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => logout()}
              activeOpacity={0.7}
              disabled={submitting}
            >
              <Text style={styles.rejectText}>No acepto · Cerrar sesión</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    card: {
      width: '100%',
      maxWidth: 440,
      maxHeight: '88%',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: borderRadius.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 20,
      elevation: 10,
    },
    scroll: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    logo: { marginBottom: spacing.base },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.foreground,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },
    message: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: spacing.base,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.base,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.lg,
    },
    linkText: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '700',
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      alignSelf: 'stretch',
      marginBottom: spacing.base,
    },
    checkboxLabel: {
      flex: 1,
      fontSize: 14,
      color: colors.foreground,
      lineHeight: 20,
    },
    error: {
      color: colors.destructive,
      fontSize: 13,
      textAlign: 'center',
      alignSelf: 'stretch',
      marginBottom: spacing.sm,
    },
    acceptBtn: { width: '100%' },
    rejectBtn: { paddingVertical: spacing.base, marginTop: spacing.xs },
    rejectText: {
      color: colors.mutedForeground,
      fontSize: 14,
      fontWeight: '600',
    },
  });
