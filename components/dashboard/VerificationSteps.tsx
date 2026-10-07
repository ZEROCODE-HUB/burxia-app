import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

// Dos recuadros secuenciales en el Inicio para completar la verificación:
//   Paso 1 — Formulario (KYB)      → /verificacion
//   Paso 2 — Verificación facial   → /verificacion-facial  (se habilita tras aprobar el paso 1)
// Se ocultan por completo cuando el usuario ya está 'verified'. Ver
// 00061_verificacion_dos_pasos.sql y useVerificacionGate (soft-gate al operar).

type Estado = 'done' | 'pending' | 'review' | 'rejected' | 'locked';

interface StepCardProps {
  numero: number;
  titulo: string;
  estado: Estado;
  textoEstado: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

function estadoColor(estado: Estado, colors: any) {
  switch (estado) {
    case 'done': return colors.success;
    case 'review': return colors.warning;
    case 'rejected': return colors.destructive;
    case 'locked': return colors.mutedForeground;
    default: return colors.accent;
  }
}

const StepCard: React.FC<StepCardProps> = ({ numero, titulo, estado, textoEstado, icon, onPress }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const tint = estadoColor(estado, colors);
  // Accionable = quien decide es el padre (pasa onPress o no). 'done'/'locked'
  // nunca navegan.
  const accionable = !!onPress && estado !== 'done' && estado !== 'locked';

  const body = (
    <View style={[styles.card, estado === 'locked' && styles.cardLocked]}>
      <View style={[styles.iconWrap, { backgroundColor: tint + '1A' }]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.stepLabel}>PASO {numero}</Text>
        <Text style={styles.cardTitle}>{titulo}</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badgeDot, { backgroundColor: tint }]} />
          <Text style={[styles.badgeText, { color: tint }]}>{textoEstado}</Text>
        </View>
      </View>
      {estado === 'done' ? (
        <Ionicons name="checkmark-circle" size={22} color={colors.success} />
      ) : estado === 'locked' ? (
        <Ionicons name="lock-closed" size={18} color={colors.mutedForeground} />
      ) : accionable ? (
        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
      ) : null}
    </View>
  );

  if (accionable) {
    return <TouchableOpacity activeOpacity={0.7} onPress={onPress}>{body}</TouchableOpacity>;
  }
  return body;
};

export const VerificationSteps: React.FC<{ flush?: boolean }> = ({ flush }) => {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, kybStatus, refreshKyb } = useAuth();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const verificado = (user as any)?.verification_status === 'verified';

  // Al montar el Inicio, re-consultar el estado del formulario (KYB). Sin esto, si
  // el operador aprueba el formulario estando el usuario en la app, el Paso 2 no se
  // desbloqueaba: aprobar el KYB ya NO cambia verification_status (que es lo único
  // que dispara el refresh automático del contexto), así que lo forzamos acá.
  useEffect(() => {
    if (user && !verificado) { void refreshKyb(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user || verificado) return null;

  const facial = ((user as any)?.facial_status as string) || 'none';
  const kybAprobado = kybStatus === 'approved';

  // Paso 1 — formulario
  let paso1: { estado: Estado; texto: string } = { estado: 'pending', texto: 'Completá el formulario' };
  if (kybStatus === 'submitted') paso1 = { estado: 'review', texto: 'En revisión' };
  else if (kybStatus === 'approved') paso1 = { estado: 'done', texto: 'Aprobado' };
  else if (kybStatus === 'rejected') paso1 = { estado: 'rejected', texto: 'Rechazado · reenviar' };

  // Paso 2 — verificación facial
  let paso2: { estado: Estado; texto: string } = { estado: 'locked', texto: 'Se habilita al aprobar el paso 1' };
  if (kybAprobado) {
    if (facial === 'approved') paso2 = { estado: 'done', texto: 'Completado' };
    else if (facial === 'submitted') paso2 = { estado: 'review', texto: 'Procesando' };
    else if (facial === 'rejected') paso2 = { estado: 'rejected', texto: 'Rechazada · reintentar' };
    else paso2 = { estado: 'pending', texto: 'Hacé la verificación facial' };
  }

  return (
    <View style={[styles.container, flush && styles.containerFlush]}>
      <Text style={styles.heading}>Activá tu cuenta</Text>
      <Text style={styles.sub}>Completá estos 2 pasos para poder operar.</Text>
      <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
        <StepCard
          numero={1}
          titulo="Formulario de vinculación"
          icon="document-text-outline"
          estado={paso1.estado}
          textoEstado={paso1.texto}
          onPress={paso1.estado === 'pending' || paso1.estado === 'rejected' ? () => router.push('/verificacion') : undefined}
        />
        <StepCard
          numero={2}
          titulo="Verificación facial"
          icon="scan-outline"
          estado={paso2.estado}
          textoEstado={paso2.texto}
          onPress={kybAprobado && facial !== 'approved' ? () => router.push('/verificacion-facial') : undefined}
        />
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  containerFlush: {
    marginHorizontal: 0,
    // En escritorio el siguiente bloque (hero del saldo) no trae marginTop, así
    // que separamos el Paso 2 de esa card desde acá.
    marginBottom: spacing.lg,
  },
  heading: { fontSize: 16, fontWeight: '700', color: colors.foreground },
  sub: { fontSize: 13, color: colors.mutedForeground, marginTop: 2 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  cardLocked: { opacity: 0.6 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  stepLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: colors.mutedForeground },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.foreground, marginTop: 1 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
});
