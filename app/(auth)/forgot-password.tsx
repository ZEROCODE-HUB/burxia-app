import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../../components/layout';
import { FormInput } from '../../components/register/FormInput';
import { Button } from '../../components/ui/Button';
import { colors, spacing, borderRadius, typography } from '../../theme';
import { EMAIL_PLACEHOLDER } from '../../constants/brand';

export default function ForgotPasswordScreen() {
    const [email, setEmail] = useState('');
    const [step, setStep] = useState<'email' | 'sent'>('email');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!email.trim()) {
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return;
        }

        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setIsLoading(false);
        setStep('sent');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenHeader
                title="Recuperar Clave"
                showBackButton={true}
                showAvatar={false}
                showMenu={false}
                centerTitle={step === 'sent'}
                onBack={() => step === 'sent' ? setStep('email') : router.back()}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {step === 'email' ? (
                        <View style={styles.formContainer}>
                            {/* Icon */}
                            <View style={styles.iconContainer}>
                                <Ionicons name="key-outline" size={40} color={colors.accent} />
                            </View>

                            {/* Text */}
                            <Text style={styles.title}>Recuperar Contraseña</Text>
                            <Text style={styles.subtitle}>
                                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu PIN.
                            </Text>

                            {/* Email Input */}
                            <FormInput
                                label="Correo Electrónico"
                                placeholder={EMAIL_PLACEHOLDER}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                icon="mail-outline"
                            />

                            {/* Submit Button */}
                            <Button
                                onPress={handleSubmit}
                                disabled={isLoading || !email.trim()}
                                loading={isLoading}
                                style={styles.submitButton}
                            >
                                Enviar Enlace
                            </Button>

                            {/* Back to Login */}
                            <TouchableOpacity
                                onPress={() => router.back()}
                                style={styles.backToLogin}
                            >
                                <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.successContainer}>
                            {/* Success Icon */}
                            <View style={styles.successIconContainer}>
                                <View style={styles.successPulse}>
                                    <View style={styles.successCircle}>
                                        <Ionicons name="mail-open-outline" size={44} color={colors.success} />
                                    </View>
                                </View>
                            </View>

                            {/* Title */}
                            <Text style={styles.title}>¡Correo Enviado!</Text>
                            <Text style={styles.subtitle}>Hemos enviado un enlace de recuperación a:</Text>

                            <View style={styles.emailBadge}>
                                <Text style={styles.emailBadgeText}>{email}</Text>
                            </View>

                            <Text style={styles.infoText}>
                                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu PIN. Si no lo encuentras, revisa la carpeta de spam.
                            </Text>

                            {/* Actions */}
                            <View style={styles.actions}>
                                <Button
                                    onPress={() => router.replace('/(auth)/login')}
                                    style={styles.loginButton}
                                >
                                    Ir al Login
                                </Button>
                                <TouchableOpacity
                                    onPress={() => setStep('email')}
                                    style={styles.anotherEmail}
                                >
                                    <Text style={styles.anotherEmailText}>Usar otro correo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>

                {/* Version */}
                <Text style={styles.versionText}>v2.4.0 Secure Build</Text>
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
    },
    formContainer: {
        flex: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.accentAlpha[10],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.foreground,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 14,
        color: colors.mutedForeground,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.xl,
    },
    submitButton: {
        width: '100%',
        height: 56,
        marginTop: spacing.lg,
    },
    backToLogin: {
        marginTop: spacing.xl,
    },
    backToLoginText: {
        fontSize: 14,
        color: colors.mutedForeground,
        fontWeight: '500',
    },
    successContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -spacing['3xl'], // Offset up for better centering in view
    },
    successIconContainer: {
        marginBottom: spacing.xl,
    },
    successPulse: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.successAlpha[5],
        justifyContent: 'center',
        alignItems: 'center',
    },
    successCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.successAlpha[10],
        justifyContent: 'center',
        alignItems: 'center',
    },
    emailBadge: {
        backgroundColor: colors.accentAlpha[10],
        paddingHorizontal: spacing.base,
        paddingVertical: 8,
        borderRadius: borderRadius.md,
        marginBottom: spacing.xl,
    },
    emailBadgeText: {
        color: colors.accent,
        fontWeight: '600',
        fontSize: 14,
    },
    infoText: {
        fontSize: 12,
        color: colors.mutedForeground,
        textAlign: 'center',
        lineHeight: 18,
        marginHorizontal: spacing.xl,
        marginBottom: spacing['2xl'],
    },
    actions: {
        width: '100%',
        gap: spacing.md,
    },
    loginButton: {
        width: '100%',
        height: 56,
    },
    anotherEmail: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    anotherEmailText: {
        fontSize: 14,
        color: colors.mutedForeground,
        fontWeight: '500',
    },
    versionText: {
        fontSize: 10,
        color: colors.mutedForeground,
        textAlign: 'center',
        marginBottom: spacing.lg,
        fontWeight: '500',
    },
});
