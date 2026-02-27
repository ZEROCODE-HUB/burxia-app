/**
 * Biometric Service
 * Handles biometric authentication (fingerprint, face ID)
 */
import { injectable } from 'inversify';
import 'reflect-metadata';
import * as LocalAuthentication from 'expo-local-authentication';

@injectable()
export class BiometricService {
    /**
     * Check if device supports biometric authentication
     */
    async isAvailable(): Promise<boolean> {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        return hasHardware && isEnrolled;
    }

    /**
     * Get supported biometric types
     */
    async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
        return await LocalAuthentication.supportedAuthenticationTypesAsync();
    }

    /**
     * Authenticate user with biometrics
     */
    async authenticate(promptMessage?: string): Promise<boolean> {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: promptMessage || 'Autenticación requerida',
                fallbackLabel: 'Usar PIN',
                cancelLabel: 'Cancelar',
                disableDeviceFallback: false,
            });

            return result.success;
        } catch (error) {
            console.error('Biometric authentication error:', error);
            return false;
        }
    }

    /**
     * Get biometric type name for display
     */
    async getBiometricTypeName(): Promise<string> {
        const types = await this.getSupportedTypes();

        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            return 'Face ID';
        }

        if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            return 'Huella Digital';
        }

        if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
            return 'Iris';
        }

        return 'Biométrico';
    }
}
