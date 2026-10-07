import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { spacing, borderRadius } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button, AlertDialog } from '../components/ui';
import { BiometricCard } from '../components/register/BiometricCard';
import { submitFacialVerification } from '../services/kyc.service';

// Paso 2 del onboarding: verificación facial (ZapSign). Solo accesible cuando el
// formulario (KYB) ya fue aprobado. Reutiliza el BiometricCard del registro; al
// completar, reporta al backend (submit_facial_verification) y, si se confirma,
// vuelve al Inicio ya verificado. Ver 00061_verificacion_dos_pasos.sql.
//
// Layout: una sola columna centrada y acotada (maxWidth) para que en web/escritorio
// no se estire a todo el ancho; en móvil ocupa el 100%.
export default function VerificacionFacialScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, kybStatus, refreshUser, refreshKyb, refreshAccount } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [procesando, setProcesando] = useState(false);
  const [alert, setAlert] = useState<{ visible: boolean; title: string; description: string }>({
    visible: false, title: '', description: '',
  });
  const showAlert = (title: string, description: string) => setAlert({ visible: true, title, description });

  const facialStatus = (user as any)?.facial_status as string | undefined;
  const kybAprobado = kybStatus === 'approved';
  const nombre = user ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() : '';

  const volverAlInicio = () => router.replace('/(tabs)');

  const onFacialCompletada = async () => {
    setProcesando(true);
    try {
      const estado = await submitFacialVerification();
      await Promise.all([refreshUser(), refreshKyb(), refreshAccount()]);
      if (estado === 'approved') {
        showAlert('¡Verificación completa!', 'Tu identidad fue validada. Ya podés operar en Burxia.');
      } else {
        showAlert(
          'Casi listo',
          'Recibimos tu verificación facial. Estamos confirmándola; en unos instantes tu cuenta quedará activa.',
        );
      }
    } catch (e: any) {
      showAlert('Error', e?.message || 'No pudimos registrar la verificación. Reintentá en unos segundos.');
    } finally {
      setProcesando(false);
    }
  };

  const BackLink = () => (
    <TouchableOpacity
      onPress={volverAlInicio}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={styles.backRow}
    >
      <Ionicons name="arrow-back" size={22} color={colors.foreground} />
      <Text style={styles.backText}>Inicio</Text>
    </TouchableOpacity>
  );

  // Facial ya aprobada ---------------------------------------------------------
  if (facialStatus === 'approved') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <BackLink />
            <View style={styles.statusCard}>
              <View style={[styles.statusIcon, { backgroundColor: colors.successAlpha[20] }]}>
                <Ionicons name="checkmark-circle-outline" size={44} color={colors.success} />
              </View>
              <Text style={styles.statusTitle}>Verificación facial completada</Text>
              <Text style={styles.statusText}>Tu identidad ya fue validada. No necesitás hacer nada más.</Text>
              <Button onPress={volverAlInicio} style={styles.statusBtn}>Volver al inicio</Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Paso 1 (formulario) aún no aprobado ---------------------------------------
  if (!kybAprobado) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.inner}>
            <BackLink />
            <View style={styles.statusCard}>
              <View style={[styles.statusIcon, { backgroundColor: colors.warningAlpha[20] }]}>
                <Ionicons name="lock-closed-outline" size={40} color={colors.warning} />
              </View>
              <Text style={styles.statusTitle}>Primero el formulario</Text>
              <Text style={styles.statusText}>
                La verificación facial se habilita cuando aprobemos tu formulario de vinculación. Te avisaremos por notificación.
              </Text>
              <Button onPress={volverAlInicio} style={styles.statusBtn}>Volver al inicio</Button>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Facial disponible ----------------------------------------------------------
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <BackLink />
          <Text style={styles.title}>Validá tu identidad</Text>
          <Text style={styles.subtitle}>
            Último paso para activar tu cuenta. Vas a hacer una verificación de identidad (documento + selfie); es rápido y seguro.
          </Text>

          <View style={{ marginTop: spacing.lg }}>
            <BiometricCard
              userName={nombre}
              userEmail={user?.email ?? ''}
              onSignatureSuccess={() => { onFacialCompletada(); }}
            />
          </View>

          {procesando && (
            <Text style={styles.procesando}>Confirmando tu verificación…</Text>
          )}
        </View>
      </ScrollView>

      <AlertDialog
        visible={alert.visible}
        title={alert.title}
        description={alert.description}
        confirmLabel="Entendido"
        showCancel={false}
        onConfirm={() => {
          const wasOk = alert.title.startsWith('¡Verificación');
          setAlert((p) => ({ ...p, visible: false }));
          if (wasOk) volverAlInicio();
        }}
        onClose={() => setAlert((p) => ({ ...p, visible: false }))}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 640 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  backText: { color: colors.foreground, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.foreground, marginTop: spacing.xs },
  subtitle: { fontSize: 14, color: colors.mutedForeground, lineHeight: 20, marginTop: spacing.xs },
  procesando: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.md },
  statusCard: {
    marginTop: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  statusIcon: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  statusTitle: { fontSize: 20, fontWeight: '700', color: colors.foreground, textAlign: 'center' },
  statusText: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', lineHeight: 20, maxWidth: 460 },
  statusBtn: { width: '100%', maxWidth: 360, marginTop: spacing.lg },
});
