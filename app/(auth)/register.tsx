import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ScreenHeader } from '../../components/layout';
import { ProgressIndicator } from '../../components/register/ProgressIndicator';
import { StepFormData } from '../../components/register/StepFormData';
import { StepEmailVerification } from '../../components/register/StepEmailVerification';
import { StepPinCreation } from '../../components/register/StepPinCreation';
import { StepConfirmation } from '../../components/register/StepConfirmation';
import { colors } from '../../theme';
import { registerUser } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { isTestEnv } from '../../config/environment';
import {
    validateEmail,
    validateDNI,
    validateCUITCUIL,
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
}

export default function RegisterScreen() {
    const insets = useSafeAreaInsets();
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<FormData>({
    nombres: '', apellidos: '', email: '', telefono: '+54', dni: '', cuit: '',
    // zapsign_doc_token y zapsign_contract_url se setean al firmar
});
    const [pin, setPin] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isCuitValid = isTestEnv ? true : validateCUITCUIL(formData.cuit);

    const isFormValid =
        validateName(formData.nombres) &&
        validateName(formData.apellidos) &&
        validateEmail(formData.email) &&
        validatePhone(formData.telefono) &&
        validateDNI(formData.dni) &&
        isCuitValid;

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

                <View style={styles.content}>
                    {step === 1 && (
                        <StepFormData
                            formData={formData}
                            onChange={handleChange}
                            onContinue={handleContinueToEmail}
                            isValid={isFormValid}
                        />
                    )}

                    {step === 2 && (
                        <StepEmailVerification
                            email={formData.email}
                            onVerified={handleEmailVerified}
                        />
                    )}

                    {step === 3 && (
                        <StepPinCreation
                            onComplete={handlePinComplete}
                            onBack={() => setStep(1)}
                            loading={loading}
                        />
                    )}

                    {step === 4 && (
                        <StepConfirmation data={formData} pin={pin} />
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
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
