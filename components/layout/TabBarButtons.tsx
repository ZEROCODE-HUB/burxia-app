import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface CustomTabBarButtonProps {
    children?: React.ReactNode;
    onPress?: () => void;
    focused?: boolean;
}

export const QrTabBarButton = ({ children, onPress }: CustomTabBarButtonProps) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <TouchableOpacity
            style={styles.qrButtonContainer}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.qrButton}>
                <Ionicons name="qr-code" size={28} color={colors.accentForeground} />
            </View>
            <Text style={styles.qrLabel}>QR</Text>
        </TouchableOpacity>
    );
};

/** Botón central de la tab bar → Comprar/Vender USDT (OTC). */
export const OtcTabBarButton = ({ onPress }: CustomTabBarButtonProps) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    return (
        <TouchableOpacity
            style={styles.qrButtonContainer}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={styles.qrButton}>
                <Ionicons name="swap-vertical" size={28} color={colors.accentForeground} />
            </View>
            <Text style={styles.qrLabel}>USDT</Text>
        </TouchableOpacity>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    qrButtonContainer: {
        top: -24,
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
    },
    qrButton: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.full,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: colors.card,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    qrLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.accent,
        marginTop: 4,
    }
});
