import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Switch,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScreenHeader } from '../../components/layout';
import { FormInput } from '../../components/register/FormInput';
import { Button, AlertDialog } from '../../components/ui';
import { spacing, borderRadius, typography } from '../../theme';
import { useTheme } from '../../context/ThemeContext';

export default function ApiConfigScreen() {
    const { colors } = useTheme();
    const [apiEnabled, setApiEnabled] = useState(false);
    const [usernameSuffix, setUsernameSuffix] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [whitelistedIps, setWhitelistedIps] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const [ipInput, setIpInput] = useState('');

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

    const styles = useMemo(() => createStyles(colors), [colors]);

    const userId = "8291";

    const passwordRequirements = useMemo(() => ([
        { id: 1, label: "Mínimo 8 caracteres", met: password.length >= 8 },
        { id: 2, label: "Al menos 1 Mayúscula", met: /[A-Z]/.test(password) },
        { id: 3, label: "Al menos 1 Número", met: /[0-9]/.test(password) },
        { id: 4, label: "Al menos 1 Carácter especial (!@#$%)", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ]), [password]);

    const isPasswordValid = passwordRequirements.every((req: { met: boolean }) => req.met);
    const passwordsMatch = password === confirmPassword && password !== '';
    const showRequirements = isPasswordFocused || password.length > 0;

    const handleCopyUsername = async () => {
        const fullUsername = `mag_${userId}_${usernameSuffix}`;
        showAlert("Copiado", "Usuario API copiado al portapapeles.");
    };

    const handleAddIp = () => {
        if (!ipInput) return;
        const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        if (!ipv4Regex.test(ipInput.trim())) {
            showAlert("Error", "Formato de IP inválido.", "destructive");
            return;
        }
        if (whitelistedIps.includes(ipInput.trim())) {
            showAlert("Error", "La IP ya está en la lista.", "destructive");
            return;
        }
        setWhitelistedIps([...whitelistedIps, ipInput.trim()]);
        setIpInput('');
    };

    const handleRemoveIp = (ip: string) => {
        setWhitelistedIps(whitelistedIps.filter(i => i !== ip));
    };

    const handleSave = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        showAlert("Éxito", "Configuración de API guardada correctamente.");
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScreenHeader
                title="Configuración API"
                showBackButton={true}
                onBack={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.push('/menu');
                    }
                }}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Warning Card */}
                    <View style={styles.warningCard}>
                        <View style={styles.warningHeader}>
                            <Ionicons name="shield-checkmark-outline" size={24} color={colors.warning} />
                            <Text style={styles.warningTitle}>Zona de Seguridad</Text>
                        </View>
                        <Text style={styles.warningText}>
                            Habilitar la API permite que aplicaciones externas interactúen con tu cuenta. Nunca compartas tus credenciales.
                        </Text>
                    </View>

                    {/* API Toggle */}
                    <View style={styles.settingRow}>
                        <View style={styles.settingInfo}>
                            <Text style={styles.settingLabel}>Habilitar API</Text>
                            <Text style={styles.settingDescription}>Permite el acceso programático a tu cuenta.</Text>
                        </View>
                        <Switch
                            value={apiEnabled}
                            onValueChange={setApiEnabled}
                            trackColor={{ false: colors.border, true: colors.accentAlpha[40] }}
                            thumbColor={apiEnabled ? colors.accent : colors.mutedForeground}
                        />
                    </View>

                    {apiEnabled && (
                        <View style={styles.form}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="key-outline" size={20} color={colors.accent} />
                                <Text style={styles.sectionTitle}>Credenciales de Acceso</Text>
                            </View>

                            <View style={styles.usernamePreview}>
                                <Text style={styles.usernameLabel}>Usuario API (Client ID)</Text>
                                <View style={styles.usernameBadge}>
                                    <View style={styles.usernamePrefixContainer}>
                                        <Text style={styles.usernameText} numberOfLines={1}>mag_{userId}_</Text>
                                    </View>
                                    <FormInput
                                        placeholder="ej_trading"
                                        value={usernameSuffix}
                                        onChangeText={setUsernameSuffix}
                                        containerStyle={styles.inlineInputContainer}
                                        inputContainerStyle={styles.inlineInputWrapper}
                                        showLabel={false}
                                        autoCapitalize="none"
                                    />
                                    <TouchableOpacity style={styles.copyIconButton} onPress={handleCopyUsername}>
                                        <Ionicons name="copy-outline" size={20} color={colors.mutedForeground} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <FormInput
                                label="Contraseña API"
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                icon="lock-closed-outline"
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() => setIsPasswordFocused(false)}
                            />

                            {/* Password Validator UI */}
                            {showRequirements && (
                                <View style={styles.validatorContainer}>
                                    <Text style={styles.validatorTitle}>Requisitos de seguridad:</Text>
                                    {passwordRequirements.map((req: { id: number; label: string; met: boolean }) => (
                                        <View key={req.id} style={styles.requirementRow}>
                                            <Ionicons
                                                name={req.met ? "checkmark-circle" : "ellipse-outline"}
                                                size={16}
                                                color={req.met ? colors.success : colors.mutedForeground}
                                            />
                                            <Text style={[
                                                styles.requirementText,
                                                req.met && styles.requirementMet
                                            ]}>
                                                {req.label}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            <FormInput
                                label="Confirmar Contraseña"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                icon="lock-closed-outline"
                                error={confirmPassword && !passwordsMatch ? "Las contraseñas no coinciden" : undefined}
                            />

                            {password.length > 0 && (
                                <Button
                                    onPress={handleSave}
                                    style={styles.changePasswordButton}
                                    disabled={!isPasswordValid || !passwordsMatch}
                                    loading={loading}
                                >
                                    Cambiar Contraseña
                                </Button>
                            )}

                            {/* Ip Whitelist Section */}
                            <View style={styles.ipSection}>
                                <View style={styles.sectionHeader}>
                                    <Ionicons name="globe-outline" size={20} color={colors.accent} />
                                    <Text style={styles.sectionTitle}>Lista de IPs permitidas (Whitelist)</Text>
                                </View>

                                <View style={styles.ipInputRow}>
                                    <FormInput
                                        placeholder="192.168.1.1"
                                        value={ipInput}
                                        onChangeText={setIpInput}
                                        containerStyle={{ flex: 1 }}
                                        showLabel={false}
                                        keyboardType="numeric"
                                    />
                                    <TouchableOpacity style={styles.addIpButton} onPress={handleAddIp}>
                                        <Ionicons name="add" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.ipTagsContainer}>
                                    {whitelistedIps.map((ip) => (
                                        <View key={ip} style={styles.ipTag}>
                                            <Text style={styles.ipTagText}>{ip}</Text>
                                            <TouchableOpacity onPress={() => handleRemoveIp(ip)}>
                                                <Ionicons name="close-circle" size={16} color={colors.accent} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>

                                {whitelistedIps.length === 0 && (
                                    <View style={styles.emptyIpContainer}>
                                        <Ionicons name="globe-outline" size={48} color={colors.mutedForeground} opacity={0.3} />
                                        <Text style={styles.emptyIpTitle}>Sin IPs configuradas</Text>
                                        <Text style={styles.emptyIpText}>Se permitirá el acceso desde cualquier IP</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {apiEnabled && (
                        <View style={styles.infoHelpCard}>
                            <Text style={styles.infoHelpText}>
                                <Text style={{ fontWeight: '700', color: colors.foreground }}>Importante:</Text> Tu clave API es como la llave de tu cuenta. Nunca la compartas en chats, correos o sitios web. Si sospechas que fue comprometida, cámbiala inmediatamente.
                            </Text>
                        </View>
                    )}

                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            <AlertDialog
                visible={alertConfig.visible}
                title={alertConfig.title}
                description={alertConfig.description}
                variant={alertConfig.variant}
                onConfirm={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
        </SafeAreaView>
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
    warningCard: {
        backgroundColor: colors.background,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.warningAlpha[40],
        padding: spacing.md,
        gap: spacing.xs,
    },
    warningHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    warningTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.warning,
    },
    warningText: {
        fontSize: 12,
        color: colors.mutedForeground,
        lineHeight: 18,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.card,
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    settingInfo: {
        flex: 1,
        marginRight: spacing.md,
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
    form: {
        gap: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.foreground,
    },
    usernamePreview: {
        gap: spacing.xs,
    },
    usernameLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.mutedForeground,
        marginLeft: 4,
    },
    usernameBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.muted,
        borderRadius: borderRadius.lg,
        height: 56,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    usernamePrefixContainer: {
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: colors.border,
        height: '100%',
        backgroundColor: colors.mutedAlpha[20],
    },
    usernameText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.foreground,
        opacity: 0.8,
    },
    copyIconButton: {
        paddingHorizontal: spacing.md,
        height: '100%',
        justifyContent: 'center',
    },
    inlineInputContainer: {
        flex: 1,
    },
    inlineInputWrapper: {
        backgroundColor: 'transparent',
        borderWidth: 0,
        height: 54,
        paddingHorizontal: spacing.md,
    },
    validatorContainer: {
        backgroundColor: colors.mutedAlpha[30],
        padding: spacing.md,
        borderRadius: borderRadius.xl,
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.border,
    },
    validatorTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.foreground,
        marginBottom: 4,
    },
    requirementRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    requirementText: {
        fontSize: 12,
        color: colors.mutedForeground,
    },
    requirementMet: {
        color: colors.success,
        fontWeight: '500',
    },
    changePasswordButton: {
        marginTop: spacing.sm,
        height: 50,
        backgroundColor: colors.accent,
    },
    ipSection: {
        marginTop: spacing.xl,
        gap: spacing.md,
    },
    ipInputRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        alignItems: 'flex-start',
    },
    addIpButton: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ipTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    ipTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accentAlpha[10],
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
        borderWidth: 1,
        borderColor: colors.accentAlpha[20],
    },
    ipTagText: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.accent,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    emptyIpContainer: {
        padding: spacing.xl,
        backgroundColor: colors.mutedAlpha[20],
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.border,
        alignItems: 'center',
        gap: spacing.xs,
    },
    emptyIpTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.foreground,
        marginTop: spacing.sm,
    },
    emptyIpText: {
        fontSize: 12,
        color: colors.warning,
        textAlign: 'center',
        fontWeight: '500',
    },
    infoHelpCard: {
        marginTop: spacing.sm,
        padding: spacing.md,
        backgroundColor: colors.mutedAlpha[30],
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
    },
    infoHelpText: {
        fontSize: 11,
        color: colors.mutedForeground,
        lineHeight: 18,
    },
});
