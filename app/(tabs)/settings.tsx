import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenHeader } from '../../components/layout';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { oneSignalService } from '../../services/oneSignalService';
import { getSettings, saveSettings } from '../../services/storage.service';

interface SettingRowProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    description?: string;
    children: React.ReactNode;
    showDivider?: boolean;
    colors: any;
    styles: any;
}

const SettingRow: React.FC<SettingRowProps> = ({ icon, label, description, children, showDivider, colors, styles }) => (
    <View style={showDivider && styles.dividerContainer}>
        <View style={styles.settingRow}>
            <View style={styles.settingMain}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={22} color={colors.accent} />
                </View>
                <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>{label}</Text>
                    {description && <Text style={styles.settingDescription}>{description}</Text>}
                </View>
            </View>
            <View style={styles.settingAction}>
                {children}
            </View>
        </View>
    </View>
);

export default function SettingsScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [pushEnabled, setPushEnabled] = useState(false);
    const [emailEnabled, setEmailEnabled] = useState(false);

    useEffect(() => {
        checkSettings();
    }, []);

    const checkSettings = async () => {
        try {
            // OneSignal
            const { optedIn } = await oneSignalService.getPushSubscriptionState();
            setPushEnabled(optedIn);

            // Email (Local Storage)
            const settings = await getSettings();
            if (settings) {
                setEmailEnabled(settings.emailAlerts);
            }
        } catch (error) {
            console.error('Error checking settings:', error);
        }
    };

    const togglePush = async (value: boolean) => {
        // Optimistic update
        setPushEnabled(value);

        try {
            await oneSignalService.togglePushNotifications(value);

            // Verifica el estado real después de intentar cambiarlo (por si el usuario rechaza permisos)
            setTimeout(async () => {
                const { optedIn } = await oneSignalService.getPushSubscriptionState();
                setPushEnabled(optedIn);
            }, 1000);
        } catch (error) {
            console.error('Error toggling push:', error);
            // Revertir en caso de error
            setPushEnabled(!value);
        }
    };

    const toggleEmail = async (value: boolean) => {
        setEmailEnabled(value);
        await saveSettings({ emailAlerts: value });
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScreenHeader
                title="Configuración"
                showBackButton={true}
                onBack={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.push('/menu');
                    }
                }}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Notificaciones */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Notificaciones</Text>
                    </View>
                    <View style={styles.sectionCard}>
                        <SettingRow
                            icon="notifications-outline"
                            label="Notificaciones Push"
                            description="Recibe alertas en tiempo real"
                            colors={colors}
                            styles={styles}
                        >
                            <Switch
                                value={pushEnabled}
                                onValueChange={togglePush}
                                trackColor={{ false: colors.border, true: colors.accentAlpha[40] }}
                                thumbColor={pushEnabled ? colors.accent : colors.mutedForeground}
                            />
                        </SettingRow>

                        <View style={styles.divider} />

                        <SettingRow
                            icon="mail-outline"
                            label="Alertas por Email"
                            description="Recibe un resumen de tus movimientos"
                            colors={colors}
                            styles={styles}
                        >
                            <Switch
                                value={emailEnabled}
                                onValueChange={toggleEmail}
                                trackColor={{ false: colors.border, true: colors.accentAlpha[40] }}
                                thumbColor={emailEnabled ? colors.accent : colors.mutedForeground}
                            />
                        </SettingRow>
                    </View>
                </View>

                {/* Version Info */}
                <View style={styles.footerInfo}>
                    <Text style={styles.versionText}>
                        TecnoMind v2.4.0 (Build 892)
                    </Text>
                    <Text style={styles.securityText}>
                        Enterprise Grade Security
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        gap: spacing.xl,
    },
    section: {
        gap: spacing.sm,
    },
    sectionHeader: {
        paddingLeft: spacing.xs,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.mutedForeground,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionCard: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        minHeight: 70,
        gap: spacing.md,
    },
    settingMain: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.accentAlpha[10],
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingText: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.foreground,
    },
    settingDescription: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: 2,
    },
    settingAction: {
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: spacing.lg + 40 + spacing.md,
    },
    dividerContainer: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    footerInfo: {
        marginTop: spacing.xl,
        alignItems: 'center',
        gap: 4,
        paddingBottom: spacing.xl,
    },
    versionText: {
        fontSize: 12,
        color: colors.mutedForeground,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    securityText: {
        fontSize: 10,
        color: colors.mutedForeground,
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
