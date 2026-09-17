import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';

interface StepEmailVerificationProps {
  email: string;
  onVerified: () => void;
}

export const StepEmailVerification: React.FC<StepEmailVerificationProps> = ({ email, onVerified }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    requestCode();
  }, []);

  // Pide al servidor que genere y envíe el código (RPC request_presignup_otp).
  // El código se genera y guarda HASHEADO en el server; el cliente nunca lo ve.
  const requestCode = async () => {
    try {
      setLoading(true);
      setInfo(null);
      const firstName = email.split('@')[0] || 'Usuario';
      const { error } = await (supabase.rpc as any)('request_presignup_otp', {
        p_email: email.trim(),
        p_first_name: firstName,
      });
      if (error) {
        if ((error.message || '').includes('rate_limit')) {
          setInfo('Demasiados intentos. Esperá unos minutos y reintentá.');
        } else {
          setInfo('No se pudo enviar el código por correo. Puedes reintentar.');
        }
      } else {
        setInfo('Te enviamos un código de 6 dígitos a tu correo.');
      }
    } catch (e) {
      setInfo('Error al solicitar código.');
    } finally {
      setLoading(false);
    }
  };

  // Verifica el código contra el servidor (RPC verify_presignup_otp).
  const verifyCode = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase.rpc as any)('verify_presignup_otp', {
        p_email: email.trim(),
        p_code: code.trim(),
      });
      if (error) {
        setInfo('Error al verificar el código.');
      } else if (data === true) {
        onVerified();
      } else {
        setInfo('Código incorrecto o expirado.');
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

const createStyles = (colors: any) => StyleSheet.create({
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
