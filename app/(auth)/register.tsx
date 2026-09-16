import React, { useState, useMemo } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenHeader } from '../../components/layout';
import { ProgressIndicator } from '../../components/register/ProgressIndicator';
import { StepFormData } from '../../components/register/StepFormData';
import { StepEmailVerification } from '../../components/register/StepEmailVerification';
import { StepPinCreation } from '../../components/register/StepPinCreation';
import { StepConfirmation } from '../../components/register/StepConfirmation';
import { useTheme } from '../../context/ThemeContext';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import {
    validateEmail,
    validatePhone,
    validateName
} from '../../utils/validators';

interface FormData {
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    dni: string;
    cuit: string;
    zapsign_doc_token?: string;
    zapsign_contract_url?: string;
    zapsign_data?: any;
}

export default function RegisterScreen() {
    const insets = useSafeAreaInsets();
    const isDesktop = useIsDesktop();
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
    nombres: '', apellidos: '', email: '', telefono: '+57', dni: '', cuit: '',
    // zapsign_doc_token y zapsign_contract_url se setean al firmar
});
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Ya no se pide CUIT/CUIL; el documento de identidad hace de identificador
    // fiscal (se usa como tax_id en el backend).
    const isFormValid =
        validateName(formData.nombres) &&
        validateName(formData.apellidos) &&
        validateEmail(formData.email) &&
        validatePhone(formData.telefono) &&
        formData.dni.replace(/\D/g, '').length >= 5;

    const handleContinueToEmail = () => {
        if (isFormValid) {
            setStep(2);
        }
    };

    const handleEmailVerified = () => {
        setStep(3);
    };

    const handlePinComplete = (createdPin: string) => {
        setPin(createdPin);
        setStep(4);
    };

    const handleBack = () => {
        if (step === 1) {
            router.back();
        } else {
            setStep(step - 1);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Crear Cuenta';
            case 2: return 'Verificar Correo';
            case 3: return 'PIN de Seguridad';
            case 4: return 'Confirmación';
            default: return 'Registro';
        }
    };

    const stepContent = (
        <>
            {step === 1 && (
                <StepFormData
                    formData={formData}
                    onChange={handleChange}
                    onContinue={handleContinueToEmail}
                    isValid={isFormValid}
                />
            )}
            {step === 2 && (
                <StepEmailVerification email={formData.email} onVerified={handleEmailVerified} />
            )}
            {step === 3 && (
                <StepPinCreation onComplete={handlePinComplete} onBack={() => setStep(1)} loading={loading} />
            )}
            {step === 4 && <StepConfirmation data={formData} pin={pin} />}
        </>
    );

    // Escritorio: shell propio (sin el header de móvil) dentro del panel de auth.
    if (isDesktop) {
        return (
            <View style={styles.dtRoot}>
                <View style={styles.dtHeader}>
                    {step < 4 && (
                        <TouchableOpacity style={styles.dtBack} onPress={handleBack} hitSlop={8} activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={18} color={colors.mutedForeground} />
                            <Text style={styles.dtBackText}>{step === 1 ? 'Volver a iniciar sesión' : 'Atrás'}</Text>
                        </TouchableOpacity>
                    )}
                    <Text style={styles.dtTitle}>{getStepTitle()}</Text>
                    <Text style={styles.dtSubtitle}>Paso {Math.min(step, 4)} de 4</Text>
                    {step < 4 && <ProgressIndicator currentStep={step} totalSteps={4} />}
                    {error && step === 2 && (
                        <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>
                    )}
                </View>
                <View style={styles.content}>{stepContent}</View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader
                title={getStepTitle()}
                showBackButton={step < 4}
                onBack={handleBack}
                showAvatar={false}
                showMenu={false}
                centerTitle={step === 4}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {step < 4 && <ProgressIndicator currentStep={step} totalSteps={4} />}

                {/* Mostrar error si existe */}
                {error && step === 2 && (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <View style={styles.content}>{stepContent}</View>
            </KeyboardAvoidingView>
        </View>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
    // --- Escritorio ---
    dtRoot: { flex: 1, backgroundColor: 'transparent' },
    dtHeader: { paddingTop: 36, paddingHorizontal: 24, gap: 10 },
    dtBack: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    dtBackText: { color: colors.mutedForeground, fontSize: 14, fontWeight: '600' },
    dtTitle: { fontSize: 28, fontWeight: '800', color: colors.foreground, letterSpacing: -0.5 },
    dtSubtitle: { fontSize: 14, color: colors.mutedForeground },
    errorBanner: {
        backgroundColor: colors.destructive + '20',
        padding: 12,
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.destructive,
    },
    errorText: {
        color: colors.destructive,
        fontSize: 14,
        textAlign: 'center',
    },
});
