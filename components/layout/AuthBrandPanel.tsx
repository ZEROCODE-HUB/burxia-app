import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { LogoIcon } from '../LogoIcon';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { BRAND_NAME, BRAND_TAGLINE } from '../../constants/brand';

/**
 * Panel de marca del layout de ESCRITORIO para las pantallas de auth. Ocupa el
 * lado izquierdo con una composición pensada (no un rectángulo vacío): fondo con
 * gradiente + destellos suaves, una tarjeta de producto de muestra, titular, y
 * las propuestas de valor. Todo el bloque va centrado verticalmente.
 *
 * Solo se monta en web ancho; el formulario real vive a la derecha.
 */

const VALUE_PROPS: { icon: keyof typeof Ionicons.glyphMap; title: string }[] = [
  { icon: 'shield-checkmark', title: 'Seguro de punta a punta' },
  { icon: 'flash', title: 'Operaciones al instante' },
  { icon: 'globe-outline', title: 'Multi-país, una sola cuenta' },
];

export function AuthBrandPanel() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <LinearGradient
      colors={['#2D2154', '#3E3576', '#5A4F9D']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.panel}
    >
      {/* Destellos de profundidad (blobs suaves) */}
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      {/* Columna centrada: toda la composición alineada en un mismo eje */}
      <View style={styles.inner}>
        {/* Marca arriba */}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}><LogoIcon size={30} /></View>
          <Text style={styles.brandName}>{BRAND_NAME}</Text>
        </View>

        {/* Bloque central */}
        <View style={styles.center}>
          <Text style={styles.heroTitle}>Tu dinero,{'\n'}sin fronteras.</Text>
          <Text style={styles.heroSubtitle}>
            Enviá, recibí y operá con la confianza de un banco y la agilidad de una app.
          </Text>

          {/* Tarjeta de producto de muestra */}
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardLabel}>Saldo disponible</Text>
              <View style={styles.cardChip}><LogoIcon size={18} /></View>
            </View>
            <Text style={styles.cardAmount}>$ 597.150,00</Text>
            <View style={styles.cardBottom}>
              <Text style={styles.cardNumber}>•••• •••• •••• 8250</Text>
              <Text style={styles.cardName}>{BRAND_NAME}</Text>
            </View>
          </View>

          {/* Propuestas de valor */}
          <View style={styles.props}>
            {VALUE_PROPS.map((p) => (
              <View key={p.title} style={styles.propRow}>
                <View style={styles.propIcon}><Ionicons name={p.icon} size={16} color="#FFFFFF" /></View>
                <Text style={styles.propTitle}>{p.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.footer}>© {new Date().getFullYear()} {BRAND_NAME} · {BRAND_TAGLINE}</Text>
      </View>
    </LinearGradient>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    panel: {
      flex: 1,
      paddingVertical: 48,
      paddingHorizontal: 48,
      overflow: 'hidden',
    },
    // Columna que centra toda la composición dentro del panel (evita que quede
    // todo pegado a la izquierda con la mitad derecha vacía).
    inner: {
      flex: 1,
      width: '100%',
      maxWidth: 460,
      alignSelf: 'center',
      justifyContent: 'space-between',
      zIndex: 1,
    },
    blob: { position: 'absolute', borderRadius: 999 },
    blobTop: {
      width: 420, height: 420, top: -120, right: -120,
      backgroundColor: 'rgba(91,163,232,0.16)',
      boxShadow: '0 0 180px 60px rgba(91,163,232,0.16)' as any,
    },
    blobBottom: {
      width: 360, height: 360, bottom: -100, left: -90,
      backgroundColor: 'rgba(10,37,64,0.35)',
      boxShadow: '0 0 160px 60px rgba(10,37,64,0.35)' as any,
    },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, zIndex: 1 },
    logoBadge: {
      width: 46, height: 46, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center', justifyContent: 'center',
    },
    brandName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
    center: { gap: spacing.lg, maxWidth: 460, zIndex: 1 },
    heroTitle: { fontSize: 46, lineHeight: 52, fontWeight: '800', color: '#FFFFFF', letterSpacing: -1.2 },
    heroSubtitle: { fontSize: 16, lineHeight: 24, color: 'rgba(255,255,255,0.74)', fontWeight: '500' },
    card: {
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.20)',
      borderRadius: 20,
      padding: 22,
      gap: 14,
      marginVertical: spacing.sm,
      boxShadow: '0 24px 60px rgba(0,0,0,0.35)' as any,
    },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardLabel: { fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: '600' },
    cardChip: {
      width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center', justifyContent: 'center',
    },
    cardAmount: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
    cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
    cardNumber: { fontSize: 14, color: 'rgba(255,255,255,0.78)', letterSpacing: 2, fontWeight: '600' },
    cardName: { fontSize: 14, color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.5 },
    props: { gap: spacing.sm, marginTop: spacing.xs },
    propRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    propIcon: {
      width: 30, height: 30, borderRadius: 9, backgroundColor: 'rgba(255,255,255,0.14)',
      alignItems: 'center', justifyContent: 'center',
    },
    propTitle: { fontSize: 14.5, fontWeight: '600', color: 'rgba(255,255,255,0.92)' },
    footer: { fontSize: 12, color: 'rgba(255,255,255,0.5)', zIndex: 1 },
  });
