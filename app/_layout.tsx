import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LogoIcon } from '../components/LogoIcon';
import { oneSignalService } from '../services/oneSignalService';
import { supabase } from '../lib/supabase';
import { InactivityWrapper } from '../components/InactivityWrapper';
import { AppLock } from '../components/AppLock';
import { UpdateModal } from '../components/UpdateModal';
import { TermsGate } from '../components/TermsGate';
import { WebFrame } from '../components/WebFrame';

function RootLayoutNav() {
    const { session, loading, user, pendingDeviceVerification } = useAuth();
    const { colors } = useTheme();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';

        if (session && user) {
            if (pendingDeviceVerification) {
                // If user needs to verify device, push them to the verify screen unless they are already there
                if (segments.join('/') !== '(auth)/verify-device') {
                    router.replace('/(auth)/verify-device');
                }
            } else if (inAuthGroup) {
                // Ya autenticado (sin verificación de dispositivo pendiente): entra a
                // la app. La verificación se completa en 2 pasos desde el Inicio
                // (formulario + facial); ya NO hay portón duro a /verificacion. El
                // soft-gate (useVerificacionGate) bloquea OPERAR hasta estar verificado.
                router.replace('/(tabs)');
            }
        } else if (!session && inTabsGroup) {
            // Si NO hay sesión y estamos en tabs, ir a login
            router.replace('/(auth)/login');
        }
    }, [session, loading, segments, user, pendingDeviceVerification]);

    // WEB: el <body>/<html> no tenían color de fondo, así que al hacer overscroll
    // (rebote) en pantallas largas —como el formulario— asomaba un espacio en
    // BLANCO por detrás. Pintamos body y html con el fondo del tema y cortamos el
    // rebote con overscroll-behavior. Theme-aware: se re-aplica si cambia el color.
    useEffect(() => {
        if (Platform.OS !== 'web' || typeof document === 'undefined') return;
        const bg = colors.background;
        for (const el of [document.documentElement, document.body]) {
            if (!el) continue;
            el.style.backgroundColor = bg;
            (el.style as any).overscrollBehavior = 'none';
        }
    }, [colors.background]);

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
                <LogoIcon size={80} />
                <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="verificacion" />
            <Stack.Screen name="verificacion-facial" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="payment/confirm" options={{ animation: 'none' }} />
            <Stack.Screen name="payment/success" options={{ animation: 'none', gestureEnabled: false }} />
        </Stack>
    );
}

export default function RootLayout() {
    useEffect(() => {
        // 1. Inicializar OneSignal
        oneSignalService.initialize();

        // 2. Escuchar cambios de autenticación.
        // NO usar await acá: este callback corre con el lock de auth de
        // supabase-js tomado; un await adentro (OneSignal en web se cuelga)
        // deadlockea la sesión y deja la app "cargando" hasta recargar. Se
        // difiere fuera del lock con setTimeout(0).
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setTimeout(() => {
                    if (event === 'SIGNED_IN' && session?.user) {
                        oneSignalService.loginUser(session.user.id);
                    } else if (event === 'SIGNED_OUT') {
                        oneSignalService.logoutUser();
                    }
                }, 0);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                {/* El update-on-launch lo maneja el runtime nativo de expo-updates
                    durante el splash (checkAutomatically: ON_LOAD + LAUNCH_WAIT_MS),
                    sin reloadAsync de JS. Ver app.config.js / AndroidManifest. */}
                <AuthProvider>
                    <InactivityWrapper>
                        <WebFrame>
                            <StatusBar style="light" />
                            <AppLock>
                                <RootLayoutNav />
                                <UpdateModal />
                                <TermsGate />
                            </AppLock>
                        </WebFrame>
                    </InactivityWrapper>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loader: {
        marginTop: 20,
    },
});
