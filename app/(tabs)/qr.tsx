import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useIsFocused } from '@react-navigation/native';
import { AlertDialog } from '../../components/ui';
import { QRScannerOverlay } from '../../components/qr/QRScannerOverlay';
import { QRProcessingState } from '../../components/qr/QRProcessingState';
import { useQRHandler } from '../../hooks/useQRHandler';
import { useIsDesktop } from '../../hooks/useIsDesktop';
import { DesktopPage, DesktopGrid, DesktopCol } from '../../components/layout/DesktopPage';

export default function QrScreen() {
    const { colors } = useTheme();
    const isDesktop = useIsDesktop();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [flash, setFlash] = useState(false);
    const router = useRouter();
    const isFocused = useIsFocused();
    const insets = useSafeAreaInsets();
    const [processing, setProcessing] = useState(false);

    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        description: string;
        variant?: 'default' | 'destructive';
    }>({
        visible: false,
        title: '',
        description: '',
    });

    const showAlert = (title: string, description: string, variant: 'default' | 'destructive' = 'default') => {
        setAlertConfig({ visible: true, title, description, variant });
    };

    const { handleScannedData, pickImage } = useQRHandler({
        setScanned,
        setProcessing,
        showAlert
    });

    const styles = useMemo(() => createStyles(colors, insets), [colors, insets]);

    // Reset scanned state when returning to the screen
    useEffect(() => {
        if (isFocused) {
            setScanned(false);
        }
    }, [isFocused]);

    const esWeb = Platform.OS === 'web';

    // Escritorio: la cámara no está disponible en el navegador → página con
    // dropzone para cargar la imagen del QR.
    if (isDesktop) {
        return (
            <View style={styles.container}>
                <DesktopPage title="Escanear QR" subtitle="Pagá o transferí leyendo un código QR" maxWidth={960}>
                    <DesktopGrid>
                        <DesktopCol flex={1.3} minWidth={340}>
                            <View style={styles.dtCard}>
                                <View style={styles.dtIconWrap}>
                                    <Ionicons name="qr-code-outline" size={56} color={colors.accent} />
                                </View>
                                <Text style={styles.dtTitle}>Cargá una imagen del código QR</Text>
                                <Text style={styles.dtText}>
                                    El escaneo con cámara no está disponible en el navegador. Seleccioná una
                                    imagen del código QR desde tu equipo y la procesamos igual.
                                </Text>
                                <TouchableOpacity style={styles.dtButton} onPress={pickImage} activeOpacity={0.85}>
                                    <Ionicons name="image-outline" size={22} color={colors.accentForeground} />
                                    <Text style={styles.dtButtonText}>Cargar imagen</Text>
                                </TouchableOpacity>
                            </View>
                        </DesktopCol>
                        <DesktopCol flex={1} minWidth={280}>
                            <View style={styles.dtInfoCard}>
                                <Text style={styles.dtInfoTitle}>¿Cómo funciona?</Text>
                                {[
                                    'Pedí o mostrá el código QR de la operación.',
                                    'Guardá o capturá la imagen del QR en tu equipo.',
                                    'Cargala acá y confirmá el pago o la transferencia.',
                                ].map((s, i) => (
                                    <View key={i} style={styles.dtStepRow}>
                                        <View style={styles.dtStepNum}><Text style={styles.dtStepNumText}>{i + 1}</Text></View>
                                        <Text style={styles.dtStepText}>{s}</Text>
                                    </View>
                                ))}
                            </View>
                        </DesktopCol>
                    </DesktopGrid>
                </DesktopPage>

                <AlertDialog
                    visible={alertConfig.visible}
                    title={alertConfig.title}
                    description={alertConfig.description}
                    variant={alertConfig.variant}
                    onConfirm={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                    onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                />
                {processing && <QRProcessingState />}
            </View>
        );
    }

    if (!esWeb && !permission) return <View style={styles.container} />;

    if (!esWeb && !permission?.granted) {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <Text style={styles.permissionText}>Necesitamos acceso a la cámara</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Dar Permiso</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {!esWeb && isFocused && (
                <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    enableTorch={flash}
                    onBarcodeScanned={scanned ? undefined : (event) => {
                        setScanned(true);
                        handleScannedData(event.data);
                    }}
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                />
            )}

            {esWeb && (
                <View style={styles.webPlaceholder}>
                    <Ionicons name="qr-code-outline" size={72} color={colors.mutedForeground} />
                    <Text style={styles.webPlaceholderTitle}>Escaneo con cámara no disponible en el navegador</Text>
                    <Text style={styles.webPlaceholderText}>
                        Cargá una imagen del código QR con el botón de abajo.
                    </Text>
                </View>
            )}

            {!esWeb && <QRScannerOverlay />}

            {/* Custom Bottom Controls over Overlay */}
            {/* The Overlay component handles the visual frame, but we need interactive buttons on top */}
            <View style={styles.bottomContainer}>
                <Text style={styles.instructions}>{esWeb ? 'Cargá una imagen del código QR' : 'Escanea un código QR para pagar'}</Text>
                <TouchableOpacity onPress={pickImage} style={styles.bottomImageButton}>
                    <Ionicons name="image-outline" size={24} color={colors.foreground} />
                    <Text style={styles.bottomImageText}>Cargar imagen</Text>
                </TouchableOpacity>
            </View>

            {/* Header Controls */}
            <View style={styles.controlsContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.foreground} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setFlash(!flash)}
                    style={[styles.iconButton, flash && styles.iconActive]}
                >
                    <Ionicons name={flash ? "flash" : "flash-off"} size={24} color={flash ? colors.warning : colors.foreground} />
                </TouchableOpacity>
            </View>

            <AlertDialog
                visible={alertConfig.visible}
                title={alertConfig.title}
                description={alertConfig.description}
                variant={alertConfig.variant}
                onConfirm={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />

            {processing && <QRProcessingState />}
        </View >
    );
}

const createStyles = (colors: any, insets: any) => StyleSheet.create({
    dtCard: {
        backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border,
        borderStyle: 'dashed', padding: 40, alignItems: 'center', gap: 12,
    },
    dtIconWrap: {
        width: 96, height: 96, borderRadius: 24, backgroundColor: colors.accentAlpha[10],
        alignItems: 'center', justifyContent: 'center', marginBottom: 4,
    },
    dtTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground, textAlign: 'center' },
    dtText: { fontSize: 14, lineHeight: 20, color: colors.mutedForeground, textAlign: 'center', maxWidth: 420 },
    dtButton: {
        flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
        backgroundColor: colors.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12,
    },
    dtButtonText: { color: colors.accentForeground, fontWeight: '700', fontSize: 15 },
    dtInfoCard: {
        backgroundColor: colors.card, borderRadius: 20, borderWidth: 1, borderColor: colors.border,
        padding: 24, gap: 14,
    },
    dtInfoTitle: { fontSize: 16, fontWeight: '700', color: colors.foreground, marginBottom: 2 },
    dtStepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    dtStepNum: {
        width: 26, height: 26, borderRadius: 13, backgroundColor: colors.accentAlpha[10],
        alignItems: 'center', justifyContent: 'center',
    },
    dtStepNumText: { fontSize: 13, fontWeight: '700', color: colors.accent },
    dtStepText: { flex: 1, fontSize: 13, color: colors.mutedForeground, lineHeight: 19 },
    webPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
        gap: 12,
    },
    webPlaceholderTitle: {
        color: colors.foreground,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginTop: 8,
    },
    webPlaceholderText: {
        color: colors.mutedForeground,
        fontSize: 14,
        textAlign: 'center',
    },
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    controlsContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: insets.top + spacing.md,
        paddingHorizontal: spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 20, // Higher than overlay
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: insets.bottom + 100,
        alignItems: 'center',
        zIndex: 20,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.background + '80',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconActive: {
        backgroundColor: colors.primary,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    permissionText: {
        color: colors.foreground,
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
    },
    permissionButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: colors.primaryForeground,
        fontWeight: 'bold',
    },
    instructions: {
        color: colors.foreground,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 20,
    },
    bottomImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '20',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 24,
        gap: 8,
    },
    bottomImageText: {
        color: colors.foreground,
        fontSize: 14,
        fontWeight: '600',
    },
});
