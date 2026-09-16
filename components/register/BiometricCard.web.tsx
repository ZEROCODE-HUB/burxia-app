import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { ZapSignBiometric } from '../../services/zapsign.service';
import { supabase } from '../../lib/supabase';
import { KYC_PUBLIC_LINK } from '../../config/environment';

// KYC_PUBLIC_LINK (vía WEB, sin API): en web lo abrimos en una pestaña nueva. El
// valor sale de config/environment.ts según el entorno (sandbox en QA, prod en
// release).

type ScanStatus = 'idle' | 'creating' | 'waiting_signature' | 'success' | 'error';

interface BiometricCardProps {
    userName: string;
    userEmail: string;
    onSignatureSuccess?: (docToken: string, contractUrl: string | null, biometric?: ZapSignBiometric) => void;
}

export const BiometricCard: React.FC<BiometricCardProps> = ({ userName, userEmail, onSignatureSuccess }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [status, setStatus] = useState<ScanStatus>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const abrirVerificacion = () => {
        if (!userName || !userEmail) {
            setErrorMsg('Completa tu nombre y email primero');
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }
        const win = window.open(KYC_PUBLIC_LINK, '_blank', 'noopener,noreferrer');
        if (!win) {
            setErrorMsg('El navegador bloqueó la ventana. Permití las ventanas emergentes y reintentá.');
            setTimeout(() => setErrorMsg(''), 4000);
            return;
        }
        setErrorMsg('');
        setStatus('waiting_signature');
    };

    // Verificación REAL contra el servidor (webhook de ZapSign), no auto-declaración.
    const verificarEnServidor = async (intentosRestantes = 3) => {
        setStatus('creating');
        try {
            const { data, error } = await (supabase.rpc as any)('email_completo_kyc', {
                p_email: (userEmail || '').trim(),
            });
            if (!error && data === true) {
                setStatus('success');
                onSignatureSuccess?.(`kyc-${Date.now()}`, null);
                return;
            }
            if (intentosRestantes > 1) {
                setTimeout(() => verificarEnServidor(intentosRestantes - 1), 2500);
                return;
            }
            setStatus('waiting_signature');
            setErrorMsg('Todavía no confirmamos tu verificación. Si ya la completaste, esperá unos segundos y tocá "Verificar".');
            setTimeout(() => setErrorMsg(''), 7000);
        } catch (e) {
            setStatus('waiting_signature');
            setErrorMsg('No pudimos verificar. Reintentá en unos segundos.');
            setTimeout(() => setErrorMsg(''), 5000);
        }
    };

    const renderButton = () => {
        if (status === 'creating') {
            return (
                <View style={[styles.button, styles.buttonScanning]}>
                    <ActivityIndicator size="small" color={colors.accent} style={{ marginRight: 8 }} />
                    <Text style={styles.buttonTextScanning}>Procesando...</Text>
                </View>
            );
        }
        if (status === 'waiting_signature') {
            return (
                <View style={{ width: '100%', gap: 8 }}>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonScanning]}
                        onPress={() => verificarEnServidor()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} style={{ marginRight: 8 }} />
                        <Text style={styles.buttonTextScanning}>Verificar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonIdle]}
                        onPress={abrirVerificacion}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="finger-print-outline" size={18} color={colors.accent} style={{ marginRight: 8 }} />
                        <Text style={styles.buttonTextIdle}>Continuar verificación</Text>
                    </TouchableOpacity>
                    {errorMsg ? <Text style={{ color: colors.destructive, fontSize: 12, textAlign: 'center' }}>{errorMsg}</Text> : null}
                </View>
            );
        }
        if (status === 'success') {
            return (
                <View style={[styles.button, styles.buttonSuccess]}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.success} style={{ marginRight: 8 }} />
                    <Text style={styles.buttonTextSuccess}>Verificado</Text>
                </View>
            );
        }
        return (
            <View style={{ width: '100%', alignItems: 'center' }}>
                <TouchableOpacity
                    style={[styles.button, status === 'error' ? { borderColor: colors.destructive } : styles.buttonIdle]}
                    onPress={abrirVerificacion}
                    activeOpacity={0.7}
                >
                    <Ionicons name="scan-outline" size={18} color={status === 'error' ? colors.destructive : colors.accent} style={{ marginRight: 8 }} />
                    <Text style={status === 'error' ? { color: colors.destructive, fontWeight: '600' } : styles.buttonTextIdle}>
                        Validar identidad
                    </Text>
                </TouchableOpacity>
                {status === 'error' && errorMsg ? (
                    <Text style={{ color: colors.destructive, fontSize: 12, marginTop: 4 }}>{errorMsg}</Text>
                ) : null}
            </View>
        );
    };

    return (
        <View style={[styles.container, status === 'success' ? styles.containerSuccess : null]}>
            <View style={[styles.accentBar, status === 'success' ? styles.accentBarSuccess : styles.accentBarIdle]} />
            <View style={[styles.iconContainer, status === 'success' ? styles.iconContainerSuccess : styles.iconContainerIdle]}>
                <Ionicons name="person-add-outline" size={32} color={status === 'success' ? colors.success : colors.accent} />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.title}>
                    {status === 'success' ? 'Identidad Verificada' : 'Identidad Biométrica'}
                </Text>
                <Text style={styles.description}>
                    {status === 'success'
                        ? 'Tu identidad ha sido validada correctamente.'
                        : 'Para cumplir con regulaciones fintech, necesitamos validar que eres tú.'}
                </Text>
            </View>
            {renderButton()}
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        alignItems: 'center',
        gap: spacing.sm,
        position: 'relative',
        overflow: 'hidden',
    },
    containerSuccess: { borderColor: colors.successAlpha[20] },
    accentBar: { position: 'absolute', top: 0, left: 0, width: 4, height: '100%' },
    accentBarIdle: { backgroundColor: colors.accent },
    accentBarSuccess: { backgroundColor: colors.success },
    iconContainer: { padding: spacing.md, borderRadius: 50, marginBottom: 4 },
    iconContainerIdle: { backgroundColor: colors.accentAlpha[10] },
    iconContainerSuccess: { backgroundColor: colors.successAlpha[10] },
    textContainer: { alignItems: 'center', gap: 4 },
    title: { fontSize: 16, fontWeight: '700', color: colors.foreground },
    description: { fontSize: 12, color: colors.mutedForeground, textAlign: 'center', maxWidth: 240, lineHeight: 18 },
    button: {
        width: '100%',
        height: 44,
        borderRadius: borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.sm,
        borderWidth: 1,
    },
    buttonIdle: { backgroundColor: colors.card, borderColor: colors.accent },
    buttonScanning: { backgroundColor: colors.accentAlpha[5], borderColor: colors.accent },
    buttonSuccess: { backgroundColor: colors.successAlpha[5], borderColor: colors.success },
    buttonTextIdle: { color: colors.accent, fontWeight: '600', fontSize: 14 },
    buttonTextScanning: { color: colors.accent, fontWeight: '600', fontSize: 14 },
    buttonTextSuccess: { color: colors.success, fontWeight: '600', fontSize: 14 },
});
