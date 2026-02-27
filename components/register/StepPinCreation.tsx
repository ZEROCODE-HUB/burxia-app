import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../../theme';
import { PIN_LENGTH } from '../../constants/app';

interface StepPinCreationProps {
    onComplete: (pin: string) => void;
    onBack: () => void;
    loading?: boolean;
}

const BUTTON_SIZE = 72;

const shuffleArray = (array: number[]): number[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const StepPinCreation: React.FC<StepPinCreationProps> = ({ onComplete, onBack, loading = false }) => {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isConfirmPhase, setIsConfirmPhase] = useState(false);
    const [error, setError] = useState('');
    const [keypadNumbers, setKeypadNumbers] = useState<number[]>([]);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        setKeypadNumbers(shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
    }, [isConfirmPhase]);

    const currentPin = isConfirmPhase ? confirmPin : pin;
    const setCurrentPin = isConfirmPhase ? setConfirmPin : setPin;

    const handleDigitPress = (digit: number) => {
        if (loading) return;

        setError('');
        if (currentPin.length < PIN_LENGTH) {
            const newPin = currentPin + digit.toString();
            setCurrentPin(newPin);

            if (newPin.length === PIN_LENGTH) {
                if (!isConfirmPhase) {
                    setTimeout(() => {
                        setIsConfirmPhase(true);
                    }, 300);
                } else {
                    if (newPin === pin) {
                        setTimeout(() => {
                            onComplete(pin);
                        }, 300);
                    } else {
                        setTimeout(() => {
                            setError('Los PINs no coinciden. Intenta nuevamente.');
                            setConfirmPin('');
                            setIsConfirmPhase(false);
                            setPin('');
                        }, 300);
                    }
                }
            }
        }
    };

    const handleDelete = () => {
        if (loading) return;

        setError('');
        if (currentPin.length > 0) {
            setCurrentPin(currentPin.slice(0, -1));
        }
    };

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            {/* Icon */}
            <View style={styles.iconContainer}>
                <Ionicons name="shield-checkmark" size={40} color={colors.accent} />
            </View>

            {/* Text */}
            <Text style={styles.title}>
                {loading ? 'Registrando...' : isConfirmPhase ? 'Confirma tu PIN' : 'Crea tu PIN de acceso'}
            </Text>
            <Text style={styles.subtitle}>
                {loading
                    ? 'Por favor espera mientras creamos tu cuenta'
                    : isConfirmPhase
                        ? `Ingresa nuevamente tu PIN de ${PIN_LENGTH} digitos`
                        : `Ingresa un PIN de ${PIN_LENGTH} digitos que usaras para acceder`
                }
            </Text>

            {/* Loading indicator */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <>
                    {/* Dots */}
                    <View style={styles.dotsContainer}>
                        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    i < currentPin.length ? styles.activeDot : null
                                ]}
                            />
                        ))}
                    </View>

                    {/* Error */}
                    <View style={styles.errorContainer}>
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                    </View>

                    {/* Custom Keypad */}
                    <View style={styles.keypad}>
                        {/* Row 1 */}
                        <View style={styles.keypadRow}>
                            {keypadNumbers.slice(0, 3).map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={styles.keypadButton}
                                    onPress={() => handleDigitPress(num)}
                                    disabled={loading}
                                >
                                    <Text style={styles.keypadText}>{num}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Row 2 */}
                        <View style={styles.keypadRow}>
                            {keypadNumbers.slice(3, 6).map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={styles.keypadButton}
                                    onPress={() => handleDigitPress(num)}
                                    disabled={loading}
                                >
                                    <Text style={styles.keypadText}>{num}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Row 3 */}
                        <View style={styles.keypadRow}>
                            {keypadNumbers.slice(6, 9).map((num) => (
                                <TouchableOpacity
                                    key={num}
                                    style={styles.keypadButton}
                                    onPress={() => handleDigitPress(num)}
                                    disabled={loading}
                                >
                                    <Text style={styles.keypadText}>{num}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Row 4: Empty, 0, Backspace */}
                        <View style={styles.keypadRow}>
                            <View style={styles.keypadPlaceholder} />
                            <TouchableOpacity
                                style={styles.keypadButton}
                                onPress={() => handleDigitPress(keypadNumbers[9])}
                                disabled={loading}
                            >
                                <Text style={styles.keypadText}>{keypadNumbers[9]}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.keypadButton}
                                onPress={handleDelete}
                                disabled={loading}
                            >
                                <Ionicons name="backspace-outline" size={24} color={colors.foreground} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.securityInfo}>
                        <Ionicons name="lock-closed-outline" size={14} color={colors.mutedForeground} />
                        <Text style={styles.securityText}>El teclado aleatorio protege contra rastro de patrones</Text>
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.accentAlpha[10],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.foreground,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: colors.mutedForeground,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: spacing.sm,
    },
    dot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: colors.border,
    },
    activeDot: {
        backgroundColor: colors.accent,
        transform: [{ scale: 1.2 }],
    },
    errorContainer: {
        height: 20,
        marginBottom: spacing.lg,
    },
    errorText: {
        color: colors.destructive,
        fontSize: 12,
        textAlign: 'center',
    },
    keypad: {
        gap: spacing.md,
        width: '100%',
        maxWidth: 320,
    },
    keypadRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
    },
    keypadButton: {
        width: BUTTON_SIZE,
        aspectRatio: 1,
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    keypadPlaceholder: {
        width: BUTTON_SIZE,
        aspectRatio: 1,
    },
    keypadText: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.foreground,
    },
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: spacing.xl,
    },
    securityText: {
        fontSize: 11,
        color: colors.mutedForeground,
    }
});
