import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Toast, ToastType, AlertDialog } from '../../components/ui';
import { colors, spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { verifyVerificationOtp, registerCurrentDevice, sendVerificationOtp } from '../../services/auth.service';
import { LogoIcon } from '../../components/LogoIcon';

export default function VerifyDeviceScreen() {
    const router = useRouter();
    const { setPendingDeviceVerification } = useAuth();
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as ToastType });

    // Send OTP initially if needed (the implementation plan assumes it's sent during login, but good measure to send it here if user specifically requests a resend)

    const handleVerify = async () => {
        if (otp.length < 6) {
            setToast({ visible: true, message: 'Ingrese un código de 6 dígitos válido', type: 'error' });
            return;
        }

        setIsLoading(true);
        try {
            const verifyResult = await verifyVerificationOtp(otp);
            if (!verifyResult.success) {
                setToast({ visible: true, message: verifyResult.error || 'Código incorrecto', type: 'error' });
                setIsLoading(false);
                return;
            }

            // Register the device securely
            const registerResult = await registerCurrentDevice();
            if (!registerResult.success) {
                setToast({ visible: true, message: registerResult.error || 'Error registrando dispositivo', type: 'error' });
                setIsLoading(false);
                return;
            }

            // Success! Advance
            setPendingDeviceVerification(false);
            router.replace('/(tabs)');
        } catch (error) {
            setToast({ visible: true, message: 'Ha ocurrido un error inesperado', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            const res = await sendVerificationOtp();
            if (res.success) {
                setToast({ visible: true, message: 'Código reenviado exitosamente', type: 'success' });
            } else {
                setToast({ visible: true, message: res.error || 'Error al reenviar el correo', type: 'error' });
            }
        } catch (error) {
            setToast({ visible: true, message: 'Error al reenviar', type: 'error' });
        } finally {
            setResending(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={() => setToast(prev => ({ ...prev, visible: false }))}
            />

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    <View style={styles.header}>
                        <LogoIcon size={64} />
                        <Text style={styles.title}>Nuevo Dispositivo</Text>
                        <Text style={styles.subtitle}>
                            No reconocemos este dispositivo. Por tu seguridad, hemos enviado un código de verificación de 6 dígitos a tu correo electrónico registrado.
                        </Text>
                    </View>

                    <View style={styles.inputContainer}>
                        <Input
                            label="Código de Verificación (OTP)"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                            placeholder="Ej. 123456"
                            icon={<Ionicons name="keypad-outline" size={20} color={colors.mutedForeground} />}
                        />
                    </View>

                    <View style={styles.actions}>
                        <Button 
                            onPress={handleVerify} 
                            loading={isLoading} 
                            disabled={otp.length < 6 || isLoading}
                            style={styles.button}
                        >
                            Verificar Dispositivo
                        </Button>
                        <Button 
                            onPress={handleResend} 
                            variant="ghost" 
                            disabled={resending}
                            loading={resending}
                        >
                            Reenviar Código
                        </Button>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.foreground,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 14,
        color: colors.mutedForeground,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: spacing.md,
    },
    inputContainer: {
        marginBottom: spacing.xl,
    },
    actions: {
        gap: spacing.md,
    },
    button: {
        width: '100%',
    }
});
