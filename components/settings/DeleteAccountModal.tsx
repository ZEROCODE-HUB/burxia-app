import React, { useMemo, useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const CONFIRM_WORD = 'ELIMINAR';

export const DeleteAccountModal: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { logout } = useAuth();
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canConfirm = text.trim().toUpperCase() === CONFIRM_WORD && !loading;

    const handleClose = () => {
        if (loading) return;
        setText('');
        setError('');
        onClose();
    };

    const handleDelete = async () => {
        if (!canConfirm) return;
        setLoading(true);
        setError('');
        try {
            const { error: rpcError } = await (supabase.rpc as any)('eliminar_mi_cuenta');
            if (rpcError) {
                setError('No se pudo eliminar la cuenta. Intentá de nuevo.');
                setLoading(false);
                return;
            }
            // Cuenta anonimizada y login bloqueado: cerramos sesión (vuelve al login).
            await logout();
        } catch (e) {
            setError('Ocurrió un error. Intentá de nuevo.');
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <Ionicons name="warning-outline" size={32} color={colors.destructive} />
                    </View>

                    <Text style={styles.title}>Eliminar cuenta</Text>
                    <Text style={styles.body}>
                        Esta acción es <Text style={styles.bold}>permanente</Text>. Se eliminarán tus
                        datos personales y <Text style={styles.bold}>no podrás volver a iniciar
                        sesión</Text> con esta cuenta.
                    </Text>
                    <Text style={styles.body}>
                        Para confirmar, escribí <Text style={styles.bold}>{CONFIRM_WORD}</Text> abajo.
                    </Text>

                    <TextInput
                        value={text}
                        onChangeText={(t) => { setText(t); setError(''); }}
                        placeholder={CONFIRM_WORD}
                        placeholderTextColor={colors.mutedForeground}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        editable={!loading}
                        style={styles.input}
                    />

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.btn, styles.btnDanger, !canConfirm && styles.btnDisabled]}
                        onPress={handleDelete}
                        disabled={!canConfirm}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.btnDangerText}>Eliminar definitivamente</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.btnGhost} onPress={handleClose} disabled={loading} activeOpacity={0.7}>
                        <Text style={styles.btnGhostText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
        ...(Platform.OS === 'web' ? ({ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 } as any) : {}),
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: colors.card,
        borderRadius: borderRadius['2xl'],
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.xl,
        alignItems: 'center',
        gap: spacing.sm,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.destructive + '1A',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.foreground,
        textAlign: 'center',
    },
    body: {
        fontSize: 14,
        color: colors.mutedForeground,
        textAlign: 'center',
        lineHeight: 20,
    },
    bold: {
        fontWeight: '700',
        color: colors.foreground,
    },
    input: {
        width: '100%',
        marginTop: spacing.sm,
        height: 48,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        color: colors.foreground,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 2,
        textAlign: 'center',
        backgroundColor: colors.background,
    },
    error: {
        color: colors.destructive,
        fontSize: 12,
        textAlign: 'center',
        marginTop: 4,
    },
    btn: {
        width: '100%',
        height: 50,
        borderRadius: borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    btnDanger: {
        backgroundColor: colors.destructive,
    },
    btnDisabled: {
        opacity: 0.4,
    },
    btnDangerText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
    btnGhost: {
        width: '100%',
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnGhostText: {
        color: colors.mutedForeground,
        fontWeight: '600',
        fontSize: 14,
    },
});
