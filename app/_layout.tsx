import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { LogoIcon } from '../components/LogoIcon';
import { oneSignalService } from '../services/oneSignalService';
import { supabase } from '../lib/supabase';
import { InactivityWrapper } from '../components/InactivityWrapper';
import { UpdateModal } from '../components/UpdateModal';
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
                // Si hay sesión Y usuario verificado, y estamos en grupo auth (login/register), ir a tabs
                router.replace('/(tabs)');
            }
        } else if (!session && inTabsGroup) {
            // Si NO hay sesión y estamos en tabs, ir a login
            router.replace('/(auth)/login');
        }
    }, [session, loading, segments, user, pendingDeviceVerification]);

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

        // 2. Escuchar cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    await oneSignalService.loginUser(session.user.id);
                } else if (event === 'SIGNED_OUT') {
                    await oneSignalService.logoutUser();
                }
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
                            <RootLayoutNav />
                            <UpdateModal />
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
