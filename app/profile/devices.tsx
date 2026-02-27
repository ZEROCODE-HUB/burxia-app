import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScreenHeader } from '../../components/layout';
import { Button, AlertDialog } from '../../components/ui';
import { useTheme } from '../../context/ThemeContext';
import * as authService from '../../services/auth.service';
import { spacing, borderRadius, colors as themeColors } from '../../theme';
import { UserDevice } from '../../types/database.types';

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: spacing.lg,
        gap: spacing.md,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.card,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    infoContainer: {
        flex: 1,
    },
    deviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.foreground,
    },
    deviceDetail: {
        fontSize: 12,
        color: colors.mutedForeground,
        marginTop: 2,
    },
    currentBadge: {
        fontSize: 10,
        color: colors.success,
        fontWeight: 'bold',
        marginTop: 2,
    },
    emptyState: {
        padding: spacing.xl,
        alignItems: 'center',
    }
});

export default function DevicesScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [devices, setDevices] = useState<UserDevice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        loadDevices();
    }, []);

    const loadDevices = async () => {
        try {
            const data = await authService.getUserDevices();
            setDevices(data as UserDevice[]);
        } catch (error) {
            console.error(error);
            showAlert("Error", "No se pudieron cargar los dispositivos", "destructive");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRevoke = (deviceId: string, isCurrent: boolean) => {
        if (isCurrent) {
            showAlert("No permitido", "No puedes eliminar el dispositivo actual que estás usando.");
            return;
        }

        showAlert(
            "Desvincular Dispositivo",
            "¿Estás seguro? El usuario tendrá que iniciar sesión nuevamente en ese dispositivo.",
            "destructive",
            () => {
                showAlert("Info", "Función de desvincular simulada");
            }
        );
    };

    const renderItem = ({ item }: { item: UserDevice }) => {
        // Simple heuristic for current device (could be improved with DeviceInfo)
        const isCurrent = false;

        return (
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <Ionicons
                        name={item.platform === 'ios' ? 'logo-apple' : item.platform === 'android' ? 'logo-android' : 'laptop-outline'}
                        size={24}
                        color={colors.foreground}
                    />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.deviceName}>{item.device_name || `Dispositivo ${item.platform}`}</Text>
                    <Text style={styles.deviceDetail}>
                        {item.device_model} • Última vez: {new Date(item.last_active_at).toLocaleDateString()}
                    </Text>
                    {isCurrent && <Text style={styles.currentBadge}>Este dispositivo</Text>}
                </View>
                {!isCurrent && (
                    <Button
                        variant="ghost"
                        onPress={() => handleRevoke(item.id, isCurrent)}
                        style={{ paddingHorizontal: 8, height: 32 }}
                    >
                        <Ionicons name="trash-outline" size={20} color={colors.destructive} />
                    </Button>
                )}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScreenHeader title="Dispositivos Vinculados" showBackButton={true} />

            <FlatList
                data={devices}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !isLoading ? (
                        <View style={styles.emptyState}>
                            <Text style={{ color: colors.mutedForeground }}>No se encontraron dispositivos</Text>
                        </View>
                    ) : null
                }
            />

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
        </SafeAreaView>
    );
}

