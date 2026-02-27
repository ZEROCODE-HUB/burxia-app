import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Modal } from './Modal';
import { Button } from './Button';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface AlertDialogProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
    icon?: keyof typeof Ionicons.glyphMap;
    loading?: boolean;
    showCancel?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
    visible,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    showCancel = true,
    variant = 'default',
    icon,
    loading = false,
}) => {
    const { colors } = useTheme();

    return (
        <Modal visible={visible} onClose={onClose}>
            <View style={styles.container}>
                {icon && (
                    <View style={[
                        styles.iconContainer,
                        { backgroundColor: variant === 'destructive' ? colors.destructiveAlpha[10] : colors.accentAlpha[10] }
                    ]}>
                        <Ionicons
                            name={icon}
                            size={32}
                            color={variant === 'destructive' ? colors.destructive : colors.accent}
                        />
                    </View>
                )}

                <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
                <Text style={[styles.description, { color: colors.mutedForeground }]}>{description}</Text>

                <View style={styles.actions}>
                    {showCancel && (
                        <Button
                            variant="ghost"
                            onPress={() => !loading && onClose()}
                            disabled={loading}
                            style={styles.button}
                        >
                            {cancelLabel}
                        </Button>
                    )}
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'primary'}
                        loading={loading}
                        onPress={onConfirm}
                        style={styles.button}
                    >
                        {confirmLabel}
                    </Button>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.xl,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.md,
        width: '100%',
    },
    button: {
        flex: 1,
    },
});
