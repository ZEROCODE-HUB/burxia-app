import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button } from '../ui/Button';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { BRAND_NAME } from '../../constants/brand';
import { registerUser } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

interface StepConfirmationProps {
    data: {
        nombres: string;
        apellidos: string;
        email: string;
        telefono: string;
        dni: string;
        cuit: string;
        zapsign_doc_token?: string;
        zapsign_data?: any;
    };
    pin: string;
}

export const StepConfirmation: React.FC<StepConfirmationProps> = ({ data, pin }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const insets = useSafeAreaInsets();
    const { login } = useAuth();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const performRegistration = async () => {
            try {
                const result = await registerUser({
                    ...data,
                    pin
                });

                if (result.success) {
                    setStatus('success');
                    // El correo ya se validó con el PIN enviado por email (paso 2), así
                    // que no volvemos a pedir verificación: iniciamos sesión y entramos
                    // directo a la app.
                    try {
                        const loginResult = await login(data.email, pin);
                        if (loginResult?.success) {
                            router.replace('/(tabs)');
                        } else {
                            // Si el auto-login falla, mandamos al login para que ingrese manualmente.
                            router.replace('/(auth)/login');
                        }
                    } catch {
                        router.replace('/(auth)/login');
                    }
                } else {
                    setStatus('error');
                    setErrorMsg(result.error || 'Error al procesar el registro');
                }
            } catch (err: any) {
                setStatus('error');
                setErrorMsg(err.message || 'Error inesperado');
            }
        };

        performRegistration();
    }, []);

    if (status === 'processing') {
        return (
            <View style={[styles.container, { paddingBottom: spacing.xl + insets.bottom }]}>
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={colors.accent} />
                    <Text style={styles.processingTitle}>Procesando tu registro</Text>
                    <Text style={styles.processingSubtitle}>Estamos configurando tu cuenta de {BRAND_NAME}...</Text>
                </View>
            </View>
        );
    }

    if (status === 'error') {
        return (
            <View style={[styles.container, { paddingBottom: spacing.xl + insets.bottom }]}>
                <View style={[styles.iconCircle, { backgroundColor: colors.destructiveAlpha[10] }]}>
                    <Ionicons name="alert-circle" size={50} color={colors.destructive} />
                </View>
                <Text style={styles.title}>Hubo un problema</Text>
                <Text style={styles.subtitle}>{errorMsg}</Text>
                <Button
                    variant="outline"
                    onPress={() => router.replace('/(auth)/register')}
                    style={styles.button}
                >
                    Volver a intentar
                </Button>
            </View>
        );
    }

    // status === 'success': la cuenta se creó y estamos entrando a la app. Se
    // muestra un instante mientras se resuelve el auto-login y el router.replace.
    return (
        <View style={[styles.container, { paddingBottom: spacing.xl + insets.bottom }]}>
            <View style={styles.iconStack}>
                <View style={styles.pulseBg}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="checkmark-circle" size={52} color={colors.success} />
                    </View>
                </View>
            </View>

            <Text style={styles.title}>¡Cuenta creada!</Text>
            <Text style={styles.subtitle}>Estamos ingresando a tu billetera {BRAND_NAME}...</Text>

            <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: spacing.lg }} />
        </View>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    loadingBox: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    processingTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.foreground,
        marginTop: spacing.md,
    },
    processingSubtitle: {
        fontSize: 14,
        color: colors.mutedForeground,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
    },
    iconStack: {
        position: 'relative',
        marginBottom: spacing.xl,
    },
    pulseBg: {
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: colors.accentAlpha[5],
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.accentAlpha[10],
        justifyContent: 'center',
        alignItems: 'center',
    },
    successBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.background,
        borderRadius: 15,
        padding: 2,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.foreground,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: colors.mutedForeground,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    emailContainer: {
        backgroundColor: colors.accentAlpha[10],
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xl,
    },
    emailText: {
        color: colors.accent,
        fontWeight: '600',
        fontSize: 14,
    },
    nextStepBox: {
        backgroundColor: colors.card,
        padding: spacing.lg,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        width: '100%',
        marginBottom: spacing.xl,
    },
    nextStepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    infoBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        color: colors.accentForeground,
        fontWeight: 'bold',
        fontSize: 12,
    },
    nextStepTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.foreground,
    },
    nextStepDesc: {
        fontSize: 13,
        color: colors.mutedForeground,
        lineHeight: 20,
    },
    button: {
        width: '100%',
        height: 56,
    },
    footer: {
        flexDirection: 'row',
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    resendLink: {
        fontSize: 12,
        color: colors.accent,
        fontWeight: '600',
    }
});
