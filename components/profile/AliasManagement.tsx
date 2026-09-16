import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button, AlertDialog } from '../../components/ui';
import { spacing, typography, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { checkAliasAvailable, updateAlias } from '../../services/account.service';
import { ALIAS_PREFIX } from '../../constants/brand';

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        backgroundColor: colors.card,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.lg,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        color: colors.foreground,
        marginBottom: spacing.sm,
    },
    inputRow: {
        flexDirection: 'row',
        gap: spacing.xs,
        alignItems: 'center',
    },
    inputContainer: {
        flex: 1,
    },
    verifyButton: {
        width: 100,
        height: 48,
        paddingHorizontal: 0,
        marginTop: 0,
    },
    buttonText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.accentForeground,
    },
    statusSection: {
        marginTop: spacing.sm,
        gap: spacing.sm,
    },
    successBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.successAlpha[10],
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
    },
    successText: {
        color: colors.success,
        fontSize: 12,
        fontWeight: '500',
    },
    confirmButton: {
        width: '100%',
    },
    errorBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.destructiveAlpha[10],
        padding: spacing.sm,
        borderRadius: borderRadius.lg,
        marginTop: spacing.sm,
    },
    errorText: {
        color: colors.destructive,
        fontSize: 12,
        fontWeight: '500',
    },
    hint: {
        fontSize: 10,
        color: colors.mutedForeground,
        marginTop: spacing.xs,
    },
});

interface AliasManagementProps {
    userCuit?: string;
}

export const AliasManagement: React.FC<AliasManagementProps> = ({ userCuit = "20123456789" }) => {
    const { colors } = useTheme();
    const { account, refreshAccount } = useAuth();
    const [alias, setAlias] = useState(account?.alias || `${ALIAS_PREFIX}.${userCuit}`);
    const [originalAlias, setOriginalAlias] = useState(account?.alias || `${ALIAS_PREFIX}.${userCuit}`);

    // Sync with external account changes
    useEffect(() => {
        if (account?.alias) {
            setAlias(account.alias);
            setOriginalAlias(account.alias);
        }
    }, [account?.alias]);
    const [verificationStatus, setVerificationStatus] = useState<"idle" | "available" | "unavailable">("idle");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    const styles = useMemo(() => createStyles(colors), [colors]);
    const hasChanged = alias !== originalAlias;

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

    const handleVerify = async () => {
        if (!alias) return;
        setIsVerifying(true);
        setVerificationStatus("idle");

        try {
            const available = await checkAliasAvailable(alias);
            setVerificationStatus(available ? "available" : "unavailable");
        } catch (error) {
            console.error(error);
            showAlert("Error", "No se pudo verificar el alias", "destructive");
            setVerificationStatus("idle");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleConfirm = async () => {
        if (!account) return;
        setIsConfirming(true);
        try {
            await updateAlias(account.id, alias);
            await refreshAccount();
            setOriginalAlias(alias); // Update original to current new alias
            showAlert("Éxito", "Alias actualizado correctamente");
            setVerificationStatus("idle");
        } catch (error: any) {
            showAlert("Error", error.message || "No se pudo actualizar el alias", "destructive");
        } finally {
            setIsConfirming(false);
        }
    };

    const handleAliasChange = (text: string) => {
        setAlias(text.toLowerCase().replace(/[^a-z0-9.]/g, ""));
        setVerificationStatus("idle");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Administración de Alias</Text>

            <View style={styles.inputRow}>
                <Input
                    value={alias}
                    onChangeText={handleAliasChange}
                    placeholder={`${ALIAS_PREFIX}.tunombre`}
                    containerStyle={styles.inputContainer}
                    autoCapitalize="none"
                />
                <Button
                    onPress={handleVerify}
                    disabled={isVerifying || !alias || !hasChanged || verificationStatus === "available"}
                    variant={verificationStatus === "available" ? "outline" : "primary"}
                    style={styles.verifyButton}
                >
                    {isVerifying ? (
                        <ActivityIndicator color={colors.accentForeground} size="small" />
                    ) : verificationStatus === "available" ? (
                        <Ionicons name="checkmark" size={16} color={colors.accent} />
                    ) : (
                        <Text style={styles.buttonText}>Verificar</Text>
                    )}
                </Button>
            </View>

            {verificationStatus === "available" && (
                <View style={styles.statusSection}>
                    <View style={styles.successBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                        <Text style={styles.successText}>Alias Disponible</Text>
                    </View>
                    <Button
                        onPress={handleConfirm}
                        loading={isConfirming}
                        style={styles.confirmButton}
                    >
                        Confirmar Cambio
                    </Button>
                </View>
            )}

            {verificationStatus === "unavailable" && (
                <View style={styles.errorBadge}>
                    <Ionicons name="close-circle" size={16} color={colors.destructive} />
                    <Text style={styles.errorText}>Alias no disponible</Text>
                </View>
            )}

            {!hasChanged && verificationStatus === "idle" && (
                <Text style={styles.hint}>Modifica el alias para verificar disponibilidad.</Text>
            )}

            <AlertDialog
                visible={alertConfig.visible}
                title={alertConfig.title}
                description={alertConfig.description}
                variant={alertConfig.variant}
                confirmLabel="Entendido"
                onConfirm={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                onClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
};
