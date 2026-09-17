import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from '../context/ThemeContext';

// Ruta puente para el deep link `bruxia://kyc-done` (redirect de ZapSign tras
// completar la verificación de identidad).
//
// En algunos dispositivos (MIUI/Xiaomi) `openAuthSessionAsync` no intercepta el
// redirect: el deep link llega al router y, sin esta ruta, expo-router mostraba
// "Unmatched Route". Acá cerramos cualquier navegador abierto y volvemos al
// registro. La pantalla de registro sigue montada (la app nunca se cerró), así
// que su estado se conserva y el BiometricCard, al volver la app a primer plano,
// verifica solo contra el servidor (listener de AppState).
export default function KycDone() {
    const { colors } = useTheme();

    useEffect(() => {
        try {
            WebBrowser.dismissBrowser();
        } catch {
            /* no había navegador embebido abierto */
        }
        const t = setTimeout(() => {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(auth)/register');
            }
        }, 50);
        return () => clearTimeout(t);
    }, []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={[styles.text, { color: colors.mutedForeground }]}>
                Volviendo a la app…
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    text: { marginTop: 12, fontSize: 14 },
});
