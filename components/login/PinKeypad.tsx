import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, spacing, typography, shadows } from '../../theme';

interface PinKeypadProps {
    onDigitPress: (digit: string) => void;
    onBackspace: () => void;
}

export const PinKeypad: React.FC<PinKeypadProps> = ({
    onDigitPress,
    onBackspace,
}) => {
    const layout = useMemo(() => {
        // Shuffle digits 0-9
        const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        for (let i = digits.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [digits[i], digits[j]] = [digits[j], digits[i]];
        }

        // Organize into 3x3 + 1 grid
        return [
            [digits[0], digits[1], digits[2]],
            [digits[3], digits[4], digits[5]],
            [digits[6], digits[7], digits[8]],
            ['', digits[9], 'backspace'],
        ];
    }, []);

    const handleKeyPress = (key: string) => {
        if (key === 'backspace') {
            onBackspace();
        } else if (key !== '') {
            onDigitPress(key);
        }
    };

    return (
        <View style={styles.container}>
            {layout.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                    {row.map((key, keyIndex) => {
                        if (key === '') {
                            return <View key={keyIndex} style={styles.emptyKey} />;
                        }

                        if (key === 'backspace') {
                            return (
                                <TouchableOpacity
                                    key={keyIndex}
                                    onPress={() => handleKeyPress(key)}
                                    style={styles.backspaceKey}
                                    activeOpacity={0.6}
                                >
                                    <Ionicons
                                        name="backspace-outline"
                                        size={24}
                                        color={colors.mutedForeground}
                                    />
                                </TouchableOpacity>
                            );
                        }

                        return (
                            <TouchableOpacity
                                key={keyIndex}
                                onPress={() => handleKeyPress(key)}
                                style={styles.key}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.keyText}>{key}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        maxWidth: 280,
        gap: spacing.base,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.base,
        justifyContent: 'center',
    },
    key: {
        flex: 1,
        height: 56,
        backgroundColor: colors.card,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 44,
        minHeight: 44,
        ...shadows.sm,
    },
    backspaceKey: {
        flex: 1,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 44,
        minHeight: 44,
    },
    emptyKey: {
        flex: 1,
        height: 56,
        minWidth: 44,
    },
    keyText: {
        fontSize: typography.sizes.xl,
        fontWeight: '500',
        color: colors.foreground,
    },
});
