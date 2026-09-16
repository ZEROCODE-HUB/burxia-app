import React, { useEffect, useRef, useState, useMemo, ReactNode, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, AppState, AppStateStatus, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PinIndicator, PinKeypad } from './login';
import { LogoIcon } from './LogoIcon';
import { PIN_LENGTH } from '../constants/app';
import { verifyPin } from '../services/auth.service';

// Bloqueo de seguridad: al volver la app a primer plano tras estar en segundo
// plano MÁS de este tiempo, se exige el PIN para continuar. El período de gracia
// evita pedir PIN por micro-cambios de app (ej: elegir una imagen de comprobante).
const LOCK_AFTER_MS = 30 * 1000;
const MAX_ATTEMPTS = 5;

// En web no aplica (no hay teclado de PIN nativo y el modelo de sesión difiere):
// el candado es solo para la app nativa.
const ENABLED = Platform.OS !== 'web';

export function AppLock({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const attempts = useRef(0);

  const bgSince = useRef<number | null>(null);
  const appState = useRef(AppState.currentState);
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  useEffect(() => {
    if (!ENABLED) return;
    const onChange = (next: AppStateStatus) => {
      const prev = appState.current;
      if (prev === 'active' && next.match(/inactive|background/)) {
        bgSince.current = Date.now();
      } else if (prev.match(/inactive|background/) && next === 'active') {
        if (isAuthRef.current && bgSince.current && Date.now() - bgSince.current >= LOCK_AFTER_MS) {
          attempts.current = 0;
          setPin('');
          setError('');
          setLocked(true);
        }
        bgSince.current = null;
      }
      appState.current = next;
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  // Si el usuario se desloguea, no tiene sentido el candado.
  useEffect(() => {
    if (!isAuthenticated) setLocked(false);
  }, [isAuthenticated]);

  const doVerify = useCallback(async (code: string) => {
    setVerifying(true);
    const ok = await verifyPin(code);
    setVerifying(false);
    if (ok) {
      attempts.current = 0;
      setPin('');
      setError('');
      setLocked(false);
      return;
    }
    attempts.current += 1;
    setPin('');
    if (attempts.current >= MAX_ATTEMPTS) {
      // Demasiados intentos: cerramos sesión (el login real tiene su propio
      // bloqueo por intentos del lado servidor).
      setLocked(false);
      await logout();
      return;
    }
    setError(`PIN incorrecto. Te ${MAX_ATTEMPTS - attempts.current === 1 ? 'queda' : 'quedan'} ${MAX_ATTEMPTS - attempts.current} intento${MAX_ATTEMPTS - attempts.current === 1 ? '' : 's'}.`);
  }, [logout]);

  // Verifica automáticamente al completar los dígitos.
  useEffect(() => {
    if (locked && pin.length === PIN_LENGTH && !verifying) {
      doVerify(pin);
    }
  }, [pin, locked, verifying, doVerify]);

  const onDigit = (d: string) => {
    if (verifying) return;
    setError('');
    setPin((p) => (p.length < PIN_LENGTH ? p + d : p));
  };
  const onBackspace = () => setPin((p) => p.slice(0, -1));

  return (
    <View style={{ flex: 1 }}>
      {children}

      <Modal visible={ENABLED && locked && isAuthenticated} animationType="fade" transparent={false} onRequestClose={() => { /* no cerrar con back: es un candado */ }}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <LogoIcon size={56} />
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={16} color={colors.accent} />
              <Text style={styles.lockText}>Sesión bloqueada</Text>
            </View>
            <Text style={styles.title}>Ingresá tu PIN para continuar</Text>
          </View>

          <View style={styles.indicators}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <PinIndicator key={i} filled={i < pin.length} />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : <View style={{ height: 18 }} />}

          <PinKeypad onDigitPress={onDigit} onBackspace={onBackspace} />

          <TouchableOpacity style={styles.logout} onPress={() => logout()} activeOpacity={0.7}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  header: { alignItems: 'center', gap: 10 },
  lockBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lockText: { fontSize: 13, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 16, fontWeight: '600', color: colors.foreground },
  indicators: { flexDirection: 'row', gap: 12 },
  error: { color: colors.destructive, fontSize: 13, textAlign: 'center', minHeight: 18 },
  logout: { paddingVertical: 10 },
  logoutText: { color: colors.mutedForeground, fontSize: 14, fontWeight: '600' },
});
