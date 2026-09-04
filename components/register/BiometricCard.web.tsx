import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { createZapSignDocument, getSignerUrl, verifyZapSignIdentity, ZapSignBiometric } from '../../services/zapsign.service';
import { supabase } from '@/lib/supabase';

/**
 * Versión WEB de BiometricCard.
 *
 * En el navegador NO existen `react-native-webview` (rompe el bundle) ni el
 * flujo de cámara nativo de `expo-camera`. El KYC de ZapSign se abre en una
 * PESTAÑA NUEVA (`window.open`) — ZapSign maneja allí el permiso de cámara, la
 * foto del documento y la biometría — y al volver el usuario confirma con
 * "Ya firmé (Verificar)", que hace polling con `verifyZapSignIdentity`. La
 * lógica de verificación y de subida del PDF a Storage es idéntica a la nativa.
 */

type ScanStatus = 'idle' | 'creating' | 'waiting_signature' | 'success' | 'error';

interface BiometricCardProps {
    userName: string;
    userEmail: string;
    onSignatureSuccess?: (docToken: string, contractUrl: string | null, biometric?: ZapSignBiometric) => void;
}

export const BiometricCard: React.FC<BiometricCardProps> = ({ userName, userEmail, onSignatureSuccess }) => {
    const [status, setStatus] = useState<ScanStatus>('idle');
    const [docToken, setDocToken] = useState<string | null>(null);
    const [signUrl, setSignUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    const abrirVerificacion = (url: string) => {
        // En web abrimos ZapSign en otra pestaña; ahí pide cámara y hace el KYC.
        const win = window.open(url, '_blank', 'noopener,noreferrer');
        if (!win) {
            setErrorMsg('El navegador bloqueó la ventana. Permití las ventanas emergentes y reintentá.');
            setTimeout(() => setErrorMsg(''), 4000);
        }
    };

    const handleScan = async () => {
        if (!userName || !userEmail) {
            setErrorMsg('Completa tu nombre y email primero');
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
            return;
        }

        if (status !== 'idle' && status !== 'error') return;

        try {
            setStatus('creating');

            const res = await createZapSignDocument(userName, userEmail);
            console.log('[BiometricCard.web] createZapSignDocument response:', res);

            if (!res.success || !res.docToken) {
                setStatus('error');
                setErrorMsg(res.error || 'Error al crear contrato');
                setTimeout(() => setStatus('idle'), 3000);
                return;
            }

            setDocToken(res.docToken);

            let finalSignUrl = res.signUrl || '';
            if (!finalSignUrl) {
                const signerRes = await getSignerUrl(res.docToken);
                if (signerRes.success && signerRes.signUrl) {
                    finalSignUrl = signerRes.signUrl;
                } else {
                    console.error('[BiometricCard.web] No se pudo obtener signUrl:', signerRes.error);
                }
            }
            setSignUrl(finalSignUrl);

            if (finalSignUrl) {
                setStatus('waiting_signature');
                abrirVerificacion(finalSignUrl);
            } else {
                setStatus('error');
                setErrorMsg('No se pudo abrir el flujo de firma. Intente nuevamente.');
                setTimeout(() => setStatus('idle'), 3000);
            }
        } catch (error) {
            console.error('[BiometricCard.web] handleScan error:', error);
            setStatus('error');
            setErrorMsg('Error de red');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const handleVerifySignature = async () => {
        if (!docToken) return;

        setStatus('creating');
        const identity = await verifyZapSignIdentity(docToken);

        if (!identity.signed) {
            setStatus('waiting_signature');
            setErrorMsg('Aún no has finalizado la firma.');
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        if (!identity.verified) {
            setStatus('waiting_signature');
            setErrorMsg(
                identity.strict
                    ? 'La verificación biométrica no se completó correctamente. Intenta de nuevo.'
                    : 'No pudimos confirmar la verificación de identidad.',
            );
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }

        // Contrato firmado y (en su caso) biometría validada: subir PDF a Storage
        let permanentUrl: string | null = null;

        if (identity.signedFileUrl) {
            try {
                const pdfResponse = await fetch(identity.signedFileUrl);
                if (pdfResponse.ok) {
                    const blob = await pdfResponse.blob();
                    const arrayBuffer = await new Response(blob).arrayBuffer();
                    const fileName = `contracts/presignup/${docToken}.pdf`;

                    const { error: uploadError } = await supabase.storage
                        .from('documents')
                        .upload(fileName, arrayBuffer, {
                            contentType: 'application/pdf',
                            upsert: true,
                        });

                    if (!uploadError) {
                        const { data: urlData } = supabase.storage
                            .from('documents')
                            .getPublicUrl(fileName);
                        permanentUrl = urlData.publicUrl;
                    } else {
                        console.error('[BiometricCard.web] Error subiendo PDF:', uploadError);
                    }
                }
            } catch (err) {
                console.error('[BiometricCard.web] Error descargando/subiendo PDF:', err);
            }
        }

        setStatus('success');
        if (onSignatureSuccess) {
            onSignatureSuccess(docToken, permanentUrl, identity.biometric);
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
                        onPress={handleVerifySignature}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="refresh-outline" size={18} color={colors.accent} style={{ marginRight: 8 }} />
                        <Text style={styles.buttonTextScanning}>Ya firmé (Verificar)</Text>
                    </TouchableOpacity>
                    {signUrl ? (
                        <TouchableOpacity
                            style={[styles.button, styles.buttonIdle]}
                            onPress={() => abrirVerificacion(signUrl)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="open-outline" size={18} color={colors.accent} style={{ marginRight: 8 }} />
                            <Text style={styles.buttonTextIdle}>Reabrir verificación</Text>
                        </TouchableOpacity>
                    ) : null}
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
                    onPress={handleScan}
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
        <View style={[
            styles.container,
            status === 'success' ? styles.containerSuccess : null
        ]}>
            <View style={[
                styles.accentBar,
                status === 'success' ? styles.accentBarSuccess : styles.accentBarIdle
            ]} />

            <View style={[
                styles.iconContainer,
                status === 'success' ? styles.iconContainerSuccess : styles.iconContainerIdle
            ]}>
                <Ionicons
                    name="person-add-outline"
                    size={32}
                    color={status === 'success' ? colors.success : colors.accent}
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.title}>
                    {status === 'success' ? 'Identidad Verificada' : 'Identidad Biométrica'}
                </Text>
                <Text style={styles.description}>
                    {status === 'success'
                        ? 'Tu identidad ha sido validada correctamente.'
                        : status === 'waiting_signature'
                            ? 'Completá la verificación en la pestaña que se abrió y volvé acá para confirmar.'
                            : 'Para cumplir con regulaciones fintech, necesitamos validar que eres tú.'
                    }
                </Text>
            </View>

            {renderButton()}
        </View>
    );
};

const styles = StyleSheet.create({
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
    containerSuccess: {
        borderColor: colors.successAlpha[20],
    },
    accentBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 4,
        height: '100%',
    },
    accentBarIdle: {
        backgroundColor: colors.accent,
    },
    accentBarSuccess: {
        backgroundColor: colors.success,
    },
    iconContainer: {
        padding: spacing.md,
        borderRadius: 50,
        marginBottom: 4,
    },
    iconContainerIdle: {
        backgroundColor: colors.accentAlpha[10],
    },
    iconContainerSuccess: {
        backgroundColor: colors.successAlpha[10],
    },
    textContainer: {
        alignItems: 'center',
        gap: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.foreground,
    },
    description: {
        fontSize: 12,
        color: colors.mutedForeground,
        textAlign: 'center',
        maxWidth: 240,
        lineHeight: 18,
    },
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
    buttonIdle: {
        backgroundColor: colors.card,
        borderColor: colors.accent,
    },
    buttonScanning: {
        backgroundColor: colors.accentAlpha[5],
        borderColor: colors.accent,
    },
    buttonSuccess: {
        backgroundColor: colors.successAlpha[5],
        borderColor: colors.success,
    },
    buttonTextIdle: {
        color: colors.accent,
        fontWeight: '600',
        fontSize: 14,
    },
    buttonTextScanning: {
        color: colors.accent,
        fontWeight: '600',
        fontSize: 14,
    },
    buttonTextSuccess: {
        color: colors.success,
        fontWeight: '600',
        fontSize: 14,
    },
});
