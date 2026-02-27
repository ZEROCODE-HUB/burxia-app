import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenHeader } from '../../components/layout';
import { Button, AlertDialog } from '../../components/ui';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

interface Device {
    id: string;
    name: string;
    type: 'smartphone' | 'laptop' | 'desktop';
    location: string;
    lastActive: string;
    isCurrent: boolean;
}

const initialDevices: Device[] = [
    {
        id: '1',
        name: 'iPhone 13',
        type: 'smartphone',
        location: 'Buenos Aires, Argentina',
        lastActive: 'Activo ahora',
        isCurrent: true,
    },
    {
        id: '2',
        name: 'Chrome en Windows',
        type: 'laptop',
        location: 'Buenos Aires, Argentina',
        lastActive: 'Hace 2 horas',
        isCurrent: false,
    },
    {
        id: '3',
        name: 'Samsung S21',
        type: 'smartphone',
        location: 'Córdoba, Argentina',
        lastActive: 'Hace 3 días',
        isCurrent: false,
    },
];

const DeviceIcon: React.FC<{ type: Device['type'], active: boolean, colors: any, styles: any }> = ({ type, active, colors, styles }) => {
    let iconName: any = 'phone-portrait-outline';
    if (type === 'laptop') iconName = 'laptop-outline';
    if (type === 'desktop') iconName = 'desktop-outline';

    return (
        <View style={[
            styles.deviceIconContainer,
            active ? { backgroundColor: colors.successAlpha[10] } : { backgroundColor: colors.mutedAlpha[20] }
        ]}>
            <Ionicons
                name={iconName}
                size={24}
                color={active ? colors.success : colors.mutedForeground}
            />
        </View>
    );
};

export default function LinkedDevicesScreen() {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [devices, setDevices] = useState<Device[]>(initialDevices);
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        description: string;
        variant?: 'default' | 'destructive';
        onConfirm?: () => void;
    }>({
        visible: false,
        title: '',
        description: '',
    });

    const showAlert = (title: string, description: string, variant: 'default' | 'destructive' = 'default', onConfirm?: () => void) => {
        setAlertConfig({ visible: true, title, description, variant, onConfirm });
    };

    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleRemoveDevice = (id: string) => {
        showAlert(
            "Desvincular Dispositivo",
            "¿Estás seguro de que deseas cerrar la sesión en este dispositivo?",
            "destructive",
            () => {
                setDevices(prev => prev.filter(d => d.id !== id));
            }
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScreenHeader
                title="Dispositivos"
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
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 90 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Security Info */}
                <View style={styles.infoCard}>
                    <Ionicons name="shield-outline" size={24} color={colors.accent} />
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTitle}>Seguridad de tu cuenta</Text>
                        <Text style={styles.infoDescription}>
                            Si no reconoces algún dispositivo, cierra su sesión inmediatamente.
                        </Text>
                    </View>
                </View>

                {/* Devices List */}
                <View style={styles.listContainer}>
                    <Text style={styles.listTitle}>
                        {devices.length} DISPOSITIVO{devices.length !== 1 ? 'S' : ''} VINCULADO{devices.length !== 1 ? 'S' : ''}
                    </Text>

                    {devices.map((device) => (
                        <View
                            key={device.id}
                            style={[
                                styles.deviceCard,
                                device.isCurrent ? styles.currentDeviceCard : undefined
                            ]}
                        >
                            <DeviceIcon type={device.type} active={device.isCurrent} colors={colors} styles={styles} />

                            <View style={styles.deviceInfo}>
                                <View style={styles.deviceNameRow}>
                                    <Text style={styles.deviceName}>{device.name}</Text>
                                    {device.isCurrent && (
                                        <View style={styles.currentBadge}>
                                            <Text style={styles.currentBadgeText}>ESTE DISPOSITIVO</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.deviceMeta}>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
                                        <Text style={styles.metaText}>{device.location}</Text>
                                    </View>
                                    <View style={styles.metaItem}>
                                        <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
                                        <Text style={styles.metaText}>{device.lastActive}</Text>
                                    </View>
                                </View>
                            </View>

                            {!device.isCurrent && (
                                <TouchableOpacity
                                    style={styles.removeButton}
                                    onPress={() => handleRemoveDevice(device.id)}
                                >
                                    <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </View>

                {devices.some(d => !d.isCurrent) && (
                    <View style={styles.listFooter}>
                        <Button
                            variant="ghost"
                            onPress={() => {
                                showAlert(
                                    "Cerrar Sesiones",
                                    "¿Deseas cerrar todas las demás sesiones activas?",
                                    "destructive",
                                    () => {
                                        setDevices(devices.filter(d => d.isCurrent));
                                        showAlert("Éxito", "Se cerraron todas las demás sesiones.");
                                    }
                                );
                            }}
                            style={styles.closeAllButton}
                            textStyle={styles.closeAllText}
                        >
                            <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
                            <Text style={styles.closeAllText}>Cerrar todas las demás sesiones</Text>
                        </Button>
                    </View>
                )}

                {/* Bottom padding for ScrollView */}
                <View style={{ height: spacing.xl }} />
            </ScrollView>

            <AlertDialog
                visible={alertConfig.visible}
                title={alertConfig.title}
                description={alertConfig.description}
                variant={alertConfig.variant}
                confirmLabel={alertConfig.onConfirm ? "Confirmar" : "Entendido"}
                cancelLabel="Cancelar"
                onConfirm={() => {
                    alertConfig.onConfirm?.();
                    setAlertConfig(prev => ({ ...prev, visible: false }));
                }}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
        </View >
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: spacing.lg,
        gap: spacing.xl,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accentAlpha[5],
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.accentAlpha[10],
        gap: spacing.md,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.foreground,
    },
    infoDescription: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: 2,
    },
    listContainer: {
        gap: spacing.md,
    },
    listTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.mutedForeground,
        letterSpacing: 1,
        marginLeft: 4,
    },
    deviceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        gap: spacing.md,
    },
    currentDeviceCard: {
        borderColor: colors.successAlpha[40],
        borderWidth: 2,
    },
    deviceIconContainer: {
        width: 48,
        height: 48,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deviceInfo: {
        flex: 1,
        gap: 4,
    },
    deviceNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: spacing.xs,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.foreground,
    },
    currentBadge: {
        backgroundColor: colors.successAlpha[10],
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    currentBadgeText: {
        fontSize: 8,
        fontWeight: '700',
        color: colors.success,
    },
    deviceMeta: {
        gap: 2,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    removeButton: {
        padding: spacing.sm,
    },
    listFooter: {
        marginTop: spacing.md,
    },
    closeAllButton: {
        borderColor: colors.destructive,
        borderWidth: 1,
        height: 56,
        flexDirection: 'row',
        gap: spacing.sm,
    },
    closeAllText: {
        color: colors.destructive,
        fontWeight: '700',
        marginLeft: spacing.xs,
    }
});
