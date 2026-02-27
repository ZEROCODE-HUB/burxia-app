import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { supabase } from '../../lib/supabase';
import { isTestEnv } from '../../config/environment';
import { sendPreSignupEmailVerification } from '../../services/email.service';

interface StepEmailVerificationProps {
  email: string;
  onVerified: () => void;
}

export const StepEmailVerification: React.FC<StepEmailVerificationProps> = ({ email, onVerified }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [testCode, setTestCode] = useState<string | null>(null);

  useEffect(() => {
    requestCode();
  }, []);

  const requestCode = async () => {
    try {
      setLoading(true);
      setInfo(null);
      // Generar código de 6 dígitos (cliente) y encolar notificación al worker para enviar email
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setTestCode(generated);
      const firstName = email.split('@')[0] || 'Usuario';
      const res = await sendPreSignupEmailVerification(email.trim(), firstName, generated);
      if (res.success) {
        setInfo('Te enviamos un código de 6 dígitos a tu correo.');
      } else {
        setInfo('No se pudo enviar el código por correo. Puedes reintentar.');
      }

      // En sandbox mostrar también el código en pantalla para QA
      if (isTestEnv) setInfo(prev => (prev ? `${prev}\n(Sandbox: ${generated})` : `Sandbox: ${generated}`));
    } catch (e) {
      setInfo('Error al solicitar código.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    try {
      setLoading(true);
      // Intentar verificación con Supabase (si el usuario existe)
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: 'email'
      } as any);
      if (error) {
        // En sandbox aceptar el código local como respaldo
        if (isTestEnv && testCode && code.trim() === testCode) {
          onVerified();
        } else {
          setInfo('Código incorrecto o expirado.');
        }
      } else {
        // Evitar mantener sesión abierta por esta verificación
        await supabase.auth.signOut();
        onVerified();
      }
    } catch (e) {
      setInfo('Error al verificar el código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: spacing.xl + insets.bottom }]}>
      <View style={styles.iconCircle}>
        <Ionicons name="mail" size={44} color={colors.accent} />
      </View>
      <Text style={styles.title}>Verificar correo</Text>
      <Text style={styles.subtitle}>
        Ingresá el código que te enviamos a {email}.
      </Text>

      <View style={{ width: '100%', paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
        <Input
          label="Código de verificación"
          keyboardType="numeric"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          placeholder="000000"
        />
        {info ? <Text style={styles.info}>{info}</Text> : null}

        <Button onPress={verifyCode} loading={loading} style={styles.button}>
          Verificar
        </Button>
        <Button onPress={requestCode} disabled={loading} variant="outline" style={styles.button}>
          Reenviar código
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.md,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accentAlpha[10],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  info: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  button: {
    height: 56,
    borderRadius: borderRadius.xl,
    marginTop: spacing.sm,
  },
});
